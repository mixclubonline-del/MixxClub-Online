import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SessionPackage {
  id: string;
  project_id: string;
  engineer_id: string;
  artist_id: string | null;
  package_status: 'preparing' | 'processing' | 'ready' | 'expired' | 'failed';
  daw_format: string | null;
  sample_rate: number;
  bit_depth: number;
  package_url: string | null;
  stem_count: number;
  file_size: number;
  expires_at: string | null;
  error_message: string | null;
  created_at: string;
}

interface GeneratePackageOptions {
  projectId: string;
  artistId?: string;
  dawFormat?: string;
  sampleRate?: number;
  bitDepth?: number;
}

interface SessionPackageState {
  isGenerating: boolean;
  generationProgress: number;
  currentPackage: SessionPackage | null;
  generatePackage: (options: GeneratePackageOptions) => Promise<SessionPackage | null>;
  getPackageStatus: (packageId: string) => Promise<SessionPackage | null>;
  downloadPackage: (packageId: string) => Promise<string | null>;
  cancelGeneration: () => void;
}

export const useSessionPackage = (): SessionPackageState => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentPackage, setCurrentPackage] = useState<SessionPackage | null>(null);

  const generatePackage = useCallback(async (options: GeneratePackageOptions): Promise<SessionPackage | null> => {
    if (!user?.id) {
      toast.error('Please log in to generate a session package');
      return null;
    }

    try {
      setIsGenerating(true);
      setGenerationProgress(0);

      // Create the session package record
      const { data: packageData, error: createError } = await supabase
        .from('session_packages')
        .insert({
          project_id: options.projectId,
          engineer_id: user.id,
          artist_id: options.artistId || null,
          package_status: 'preparing',
          daw_format: options.dawFormat || 'wav',
          sample_rate: options.sampleRate || 44100,
          bit_depth: options.bitDepth || 24,
        })
        .select()
        .single();

      if (createError) throw createError;

      setCurrentPackage(packageData as SessionPackage);
      setGenerationProgress(10);

      // Call the edge function to prepare the package
      const { data: result, error: fnError } = await supabase.functions.invoke('prepare-session-package', {
        body: {
          packageId: packageData.id,
          projectId: options.projectId,
          dawFormat: options.dawFormat || 'wav',
          sampleRate: options.sampleRate || 44100,
          bitDepth: options.bitDepth || 24,
        },
      });

      if (fnError) throw fnError;

      setGenerationProgress(50);

      // Poll for completion
      let attempts = 0;
      const maxAttempts = 30;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const status = await getPackageStatus(packageData.id);
        
        if (status) {
          setCurrentPackage(status);
          
          if (status.package_status === 'ready') {
            setGenerationProgress(100);
            toast.success('Session package ready for download!');
            return status;
          } else if (status.package_status === 'failed') {
            throw new Error(status.error_message || 'Package generation failed');
          }
          
          // Update progress
          setGenerationProgress(50 + (attempts / maxAttempts) * 40);
        }
        
        attempts++;
      }

      throw new Error('Package generation timed out');
    } catch (err) {
      console.error('Error generating session package:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to generate session package');
      
      // Update package status to failed if we have a package ID
      if (currentPackage?.id) {
        await supabase
          .from('session_packages')
          .update({ 
            package_status: 'failed',
            error_message: err instanceof Error ? err.message : 'Unknown error',
          })
          .eq('id', currentPackage.id);
      }
      
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [user?.id, currentPackage?.id]);

  const getPackageStatus = useCallback(async (packageId: string): Promise<SessionPackage | null> => {
    try {
      const { data, error } = await supabase
        .from('session_packages')
        .select('*')
        .eq('id', packageId)
        .single();

      if (error) throw error;

      return data as SessionPackage;
    } catch (err) {
      console.error('Error getting package status:', err);
      return null;
    }
  }, []);

  const downloadPackage = useCallback(async (packageId: string): Promise<string | null> => {
    try {
      const packageData = await getPackageStatus(packageId);
      
      if (!packageData) {
        toast.error('Package not found');
        return null;
      }

      if (packageData.package_status !== 'ready') {
        toast.error('Package is not ready for download');
        return null;
      }

      if (!packageData.package_url) {
        toast.error('Package URL not available');
        return null;
      }

      // Check if package has expired
      if (packageData.expires_at && new Date(packageData.expires_at) < new Date()) {
        toast.error('Package has expired. Please generate a new one.');
        return null;
      }

      // If the URL is a storage path, get a signed URL
      if (packageData.package_url.startsWith('session-packages/')) {
        const { data: signedUrl, error: signError } = await supabase.storage
          .from('session-packages')
          .createSignedUrl(packageData.package_url, 3600); // 1 hour expiry

        if (signError) throw signError;

        return signedUrl.signedUrl;
      }

      return packageData.package_url;
    } catch (err) {
      console.error('Error downloading package:', err);
      toast.error('Failed to download package');
      return null;
    }
  }, [getPackageStatus]);

  const cancelGeneration = useCallback(() => {
    setIsGenerating(false);
    setGenerationProgress(0);
    setCurrentPackage(null);
    toast.info('Package generation cancelled');
  }, []);

  return {
    isGenerating,
    generationProgress,
    currentPackage,
    generatePackage,
    getPackageStatus,
    downloadPackage,
    cancelGeneration,
  };
};
