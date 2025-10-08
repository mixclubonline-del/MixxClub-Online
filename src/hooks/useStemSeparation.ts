import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StemPath {
  name: string;
  path: string;
  displayName: string;
}

export interface StemSeparationJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  tier: 'free_4stem' | 'credit_9stem';
  stems_count: number;
  credits_used: number;
  progress: number;
  error_message?: string;
  stem_paths: StemPath[] | null;
  created_at: string;
  completed_at?: string;
}

export interface UserCredits {
  credits_balance: number;
  total_credits_purchased: number;
  monthly_credits: number;
}

export interface FreeTierStatus {
  available: boolean;
  lastUsed?: string;
}

export const useStemSeparation = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentJob, setCurrentJob] = useState<StemSeparationJob | null>(null);
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [freeTierStatus, setFreeTierStatus] = useState<FreeTierStatus | null>(null);

  // Fetch user credits
  const fetchCredits = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching credits:', error);
        return;
      }

      if (data) {
        setCredits(data);
      } else {
        // Initialize credits for new user
        setCredits({
          credits_balance: 0,
          total_credits_purchased: 0,
          monthly_credits: 0
        });
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  }, []);

  // Check free tier availability
  const checkFreeTier = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('check_free_tier_available', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error checking free tier:', error);
        return;
      }

      const { data: limitData } = await supabase
        .from('stem_separation_limits')
        .select('last_free_separation')
        .eq('user_id', user.id)
        .single();

      setFreeTierStatus({
        available: data,
        lastUsed: limitData?.last_free_separation
      });
    } catch (error) {
      console.error('Error checking free tier:', error);
    }
  }, []);

  // Start stem separation
  const startSeparation = useCallback(async (
    audioFileId: string,
    filePath: string,
    fileName: string,
    tier: 'free_4stem' | 'credit_9stem'
  ) => {
    try {
      setIsProcessing(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to use stem separation');
        return null;
      }

      const { data, error } = await supabase.functions.invoke('separate-stems', {
        body: {
          audioFileId,
          filePath,
          tier,
          fileName
        }
      });

      if (error) {
        if (error.message.includes('Free tier limit')) {
          toast.error('Free tier limit reached. You can do 1 free separation per day.');
        } else if (error.message.includes('Insufficient credits')) {
          toast.error('Insufficient credits. You need 50 credits for 9-stem separation.');
        } else {
          toast.error('Failed to start stem separation');
        }
        throw error;
      }

      toast.success('Stem separation started!');
      
      // Start polling for job status
      pollJobStatus(data.jobId);
      
      return data.jobId;
    } catch (error) {
      console.error('Error starting separation:', error);
      setIsProcessing(false);
      return null;
    }
  }, []);

  // Poll job status
  const pollJobStatus = useCallback(async (jobId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('stem_separation_jobs')
          .select('*')
          .eq('id', jobId)
          .single();

        if (error) {
          console.error('Error polling job status:', error);
          clearInterval(pollInterval);
          setIsProcessing(false);
          return;
        }

        setCurrentJob({
          ...data,
          stem_paths: data.stem_paths ? (data.stem_paths as unknown as StemPath[]) : null
        });

        if (data.status === 'completed') {
          clearInterval(pollInterval);
          setIsProcessing(false);
          toast.success('Stem separation completed!');
          fetchCredits(); // Refresh credits after completion
        } else if (data.status === 'failed') {
          clearInterval(pollInterval);
          setIsProcessing(false);
          toast.error(`Stem separation failed: ${data.error_message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error polling job:', error);
        clearInterval(pollInterval);
        setIsProcessing(false);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [fetchCredits]);

  // Get job history
  const getJobHistory = useCallback(async (limit = 10) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('stem_separation_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching job history:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Error fetching job history:', error);
      return [];
    }
  }, []);

  // Cancel job
  const cancelJob = useCallback(async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('stem_separation_jobs')
        .update({ status: 'cancelled' })
        .eq('id', jobId);

      if (error) {
        toast.error('Failed to cancel job');
        throw error;
      }

      toast.success('Job cancelled');
      setIsProcessing(false);
      setCurrentJob(null);
    } catch (error) {
      console.error('Error cancelling job:', error);
    }
  }, []);

  // Download stem
  const downloadStem = useCallback(async (stemPath: string, stemName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('stem-separations')
        .download(stemPath);

      if (error) {
        toast.error(`Failed to download ${stemName}`);
        throw error;
      }

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = stemPath.split('/').pop() || `${stemName}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`${stemName} downloaded`);
    } catch (error) {
      console.error('Error downloading stem:', error);
    }
  }, []);

  return {
    isProcessing,
    currentJob,
    credits,
    freeTierStatus,
    startSeparation,
    cancelJob,
    downloadStem,
    fetchCredits,
    checkFreeTier,
    getJobHistory
  };
};
