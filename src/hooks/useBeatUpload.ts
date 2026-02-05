import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface UploadProgress {
  audio: number;
  cover: number;
}

interface UploadResult {
  audioUrl: string | null;
  coverUrl: string | null;
}

export function useBeatUpload() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({ audio: 0, cover: 0 });

  const uploadAudio = useCallback(async (file: File): Promise<string | null> => {
    if (!user?.id) {
      toast({ title: 'Error', description: 'You must be logged in to upload', variant: 'destructive' });
      return null;
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const allowedTypes = ['mp3', 'wav', 'flac', 'aac', 'm4a'];
    
    if (!fileExt || !allowedTypes.includes(fileExt)) {
      toast({ 
        title: 'Invalid file type', 
        description: 'Please upload an MP3, WAV, FLAC, AAC, or M4A file',
        variant: 'destructive' 
      });
      return null;
    }

    const fileName = `${user.id}/beats/${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
    
    try {
      setProgress(prev => ({ ...prev, audio: 10 }));
      
      const { error: uploadError } = await supabase.storage
        .from('audio-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;
      
      setProgress(prev => ({ ...prev, audio: 90 }));

      const { data: urlData } = supabase.storage
        .from('audio-files')
        .getPublicUrl(fileName);

      setProgress(prev => ({ ...prev, audio: 100 }));
      return urlData.publicUrl;
    } catch (error) {
      console.error('[BeatUpload] Audio upload error:', error);
      toast({ 
        title: 'Upload failed', 
        description: error instanceof Error ? error.message : 'Failed to upload audio',
        variant: 'destructive' 
      });
      return null;
    }
  }, [user?.id, toast]);

  const uploadCover = useCallback(async (file: File): Promise<string | null> => {
    if (!user?.id) {
      toast({ title: 'Error', description: 'You must be logged in to upload', variant: 'destructive' });
      return null;
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const allowedTypes = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    
    if (!fileExt || !allowedTypes.includes(fileExt)) {
      toast({ 
        title: 'Invalid image type', 
        description: 'Please upload a JPG, PNG, WebP, or GIF image',
        variant: 'destructive' 
      });
      return null;
    }

    const fileName = `beats/covers/${user.id}/${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
    
    try {
      setProgress(prev => ({ ...prev, cover: 10 }));
      
      const { error: uploadError } = await supabase.storage
        .from('brand-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;
      
      setProgress(prev => ({ ...prev, cover: 90 }));

      const { data: urlData } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(fileName);

      setProgress(prev => ({ ...prev, cover: 100 }));
      return urlData.publicUrl;
    } catch (error) {
      console.error('[BeatUpload] Cover upload error:', error);
      toast({ 
        title: 'Cover upload failed', 
        description: error instanceof Error ? error.message : 'Failed to upload cover image',
        variant: 'destructive' 
      });
      return null;
    }
  }, [user?.id, toast]);

  const uploadFiles = useCallback(async (
    audioFile: File | null,
    coverFile: File | null
  ): Promise<UploadResult> => {
    setIsUploading(true);
    setProgress({ audio: 0, cover: 0 });

    try {
      const [audioUrl, coverUrl] = await Promise.all([
        audioFile ? uploadAudio(audioFile) : Promise.resolve(null),
        coverFile ? uploadCover(coverFile) : Promise.resolve(null),
      ]);

      return { audioUrl, coverUrl };
    } finally {
      setIsUploading(false);
    }
  }, [uploadAudio, uploadCover]);

  const resetProgress = useCallback(() => {
    setProgress({ audio: 0, cover: 0 });
  }, []);

  return {
    uploadAudio,
    uploadCover,
    uploadFiles,
    isUploading,
    progress,
    resetProgress,
  };
}
