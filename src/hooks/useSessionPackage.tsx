import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SessionPackageOptions {
  dawFormat: 'pro_tools' | 'logic' | 'ableton' | 'reaper' | 'studio_one';
  sampleRate: 44100 | 48000 | 96000;
  bitDepth: 16 | 24 | 32;
}

export interface SessionPackage {
  id: string;
  packageUrl: string;
  downloadUrl?: string;
  fileSize: number;
  stemCount: number;
  expiresAt: string;
  status: string;
  dawFormat: string;
}

export const useSessionPackage = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const { toast } = useToast();

  const generatePackage = useCallback(async (
    projectId: string,
    options: SessionPackageOptions
  ): Promise<SessionPackage | null> => {
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      const { data, error } = await supabase.functions.invoke('prepare-session-package', {
        body: {
          projectId,
          ...options
        }
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (error) {
        throw new Error(error.message || 'Failed to generate session package');
      }

      if (!data) {
        throw new Error('No response from package generator');
      }

      toast({
        title: "Session Package Ready",
        description: `Your ${options.dawFormat.replace('_', ' ')} session is ready to download`,
      });

      return data as SessionPackage;

    } catch (error) {
      console.error('Generate Package Error:', error);
      
      toast({
        title: "Package Generation Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });

      return null;

    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 1000);
    }
  }, [toast]);

  const getPackageStatus = useCallback(async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('session_packages')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Get Package Status Error:', error);
      return null;
    }
  }, []);

  const downloadPackage = useCallback(async (packageId: string) => {
    try {
      const { data, error } = await supabase
        .from('session_packages')
        .select('package_url')
        .eq('id', packageId)
        .single();

      if (error) throw error;

      if (data?.package_url) {
        // Mark as downloaded
        await supabase
          .from('session_packages')
          .update({ 
            package_status: 'downloaded',
            downloaded_at: new Date().toISOString()
          })
          .eq('id', packageId);

        // Trigger download
        const link = document.createElement('a');
        link.href = data.package_url;
        link.download = `session-package-${packageId}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Download Started",
          description: "Your session package is downloading",
        });

        return data.package_url;
      }

      return null;

    } catch (error) {
      console.error('Download Package Error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download session package",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  return {
    isGenerating,
    generationProgress,
    generatePackage,
    getPackageStatus,
    downloadPackage
  };
};