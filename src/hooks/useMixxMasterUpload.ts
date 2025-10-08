import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Logger, PerformanceMonitor } from '@/lib/mixxmaster/monitoring';

interface UploadProgress {
  fileName: string;
  progress: number;
  size: number;
}

interface UseUploadReturn {
  uploadStems: (files: File[], projectId: string) => Promise<Array<{
    name: string;
    storagePath: string;
    fileSize: number;
  }>>;
  progress: UploadProgress[];
  isUploading: boolean;
  error: string | null;
}

export function useMixxMasterUpload(): UseUploadReturn {
  const [progress, setProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const uploadStems = async (
    files: File[],
    projectId: string
  ): Promise<Array<{ name: string; storagePath: string; fileSize: number }>> => {
    setIsUploading(true);
    setError(null);
    setProgress([]);

    try {
      return await PerformanceMonitor.track('upload_stems', async () => {
        const uploadPromises = files.map(async (file, index) => {
          const fileName = file.name;
          const filePath = `${projectId}/stems/${Date.now()}-${fileName}`;

          // Initialize progress for this file
          setProgress(prev => [
            ...prev,
            { fileName, progress: 0, size: file.size }
          ]);

          try {
            // Upload with progress tracking
            const { error: uploadError } = await supabase.storage
              .from('audio-files')
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
              });

            if (uploadError) {
              throw new Error(`Failed to upload ${fileName}: ${uploadError.message}`);
            }

            // Update progress to 100%
            setProgress(prev =>
              prev.map(p =>
                p.fileName === fileName ? { ...p, progress: 100 } : p
              )
            );

            Logger.info('Stem uploaded successfully', {
              fileName,
              filePath,
              fileSize: file.size,
            });

            return {
              name: fileName,
              storagePath: filePath,
              fileSize: file.size,
            };
          } catch (err) {
            Logger.error('Stem upload failed', {
              fileName,
              error: err instanceof Error ? err.message : 'Unknown error',
            });
            throw err;
          }
        });

        const uploadedStems = await Promise.all(uploadPromises);

        toast({
          title: 'Upload Complete',
          description: `Successfully uploaded ${uploadedStems.length} stems`,
        });

        return uploadedStems;
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);

      toast({
        title: 'Upload Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadStems,
    progress,
    isUploading,
    error,
  };
}
