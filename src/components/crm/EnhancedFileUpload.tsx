import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, File, X, Check, AlertCircle, Music } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface EnhancedFileUploadProps {
  projectId?: string;
  jobId?: string;
  onUploadComplete?: (files: string[]) => void;
  maxFileSize?: number; // in MB
}

interface FileWithProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}

const SUPPORTED_AUDIO_FORMATS = [
  'audio/wav',
  'audio/x-wav',
  'audio/flac',
  'audio/x-flac',
  'audio/mpeg',
  'audio/mp3',
  'audio/aiff',
  'audio/x-aiff',
  'audio/aac',
  'audio/ogg',
  'audio/x-m4a',
  'audio/m4a',
  'audio/webm',
  'audio/opus',
  'audio/vorbis'
];

export const EnhancedFileUpload = ({ 
  projectId, 
  jobId, 
  onUploadComplete,
  maxFileSize = 5000 // 5GB default
}: EnhancedFileUploadProps) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles: FileWithProgress[] = [];
    
    newFiles.forEach(file => {
      // Check file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxFileSize) {
        toast.error(`${file.name} exceeds maximum file size of ${maxFileSize}MB`);
        return;
      }

      // Check file type
      const isAudioFile = SUPPORTED_AUDIO_FORMATS.includes(file.type) || 
                          file.name.match(/\.(wav|flac|mp3|aiff|aac|ogg|m4a|opus|webm)$/i);
      
      if (!isAudioFile) {
        toast.error(`${file.name} is not a supported audio format`);
        return;
      }

      validFiles.push({
        file,
        progress: 0,
        status: 'pending'
      });
    });

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (fileWithProgress: FileWithProgress, index: number) => {
    const { file } = fileWithProgress;
    
    try {
      // Update status to uploading
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'uploading' as const } : f
      ));

      // Generate unique file path
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${user?.id}/${timestamp}_${sanitizedName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      // Simulate progress for UX (storage upload doesn't provide progress callback)
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map((f, i) => {
          if (i === index && f.progress < 90) {
            return { ...f, progress: f.progress + 10 };
          }
          return f;
        }));
      }, 200);

      clearInterval(progressInterval);
      
      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('audio-files')
        .getPublicUrl(filePath);

      // Save file metadata to database
      const { error: dbError } = await supabase
        .from('audio_files')
        .insert({
          file_name: file.name,
          file_path: publicUrl,
          file_size: file.size,
          file_type: file.type,
          uploaded_by: user?.id,
          project_id: projectId,
          job_id: jobId,
          processing_status: 'pending'
        });

      if (dbError) throw dbError;

      // Update status to complete
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'complete' as const, progress: 100 } : f
      ));

      return file.name;
    } catch (error: any) {
      console.error('Upload error:', error);
      setFiles(prev => prev.map((f, i) => 
        i === index ? { 
          ...f, 
          status: 'error' as const, 
          error: error.message || 'Upload failed' 
        } : f
      ));
      throw error;
    }
  };

  const uploadAll = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    if (pendingFiles.length === 0) {
      toast.info('No files to upload');
      return;
    }

    try {
      const uploadPromises = files.map((file, index) => {
        if (file.status === 'pending') {
          return uploadFile(file, index);
        }
        return Promise.resolve(null);
      });

      const results = await Promise.allSettled(uploadPromises);
      const successfulUploads = results
        .filter((r): r is PromiseFulfilledResult<string | null> => r.status === 'fulfilled' && r.value !== null)
        .map(r => r.value as string);

      if (successfulUploads.length > 0) {
        toast.success(`Successfully uploaded ${successfulUploads.length} file(s)`);
        onUploadComplete?.(successfulUploads);
      }

      const failedUploads = results.filter(r => r.status === 'rejected').length;
      if (failedUploads > 0) {
        toast.error(`${failedUploads} file(s) failed to upload`);
      }
    } catch (error) {
      console.error('Batch upload error:', error);
      toast.error('Failed to upload files');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const getStatusIcon = (status: FileWithProgress['status']) => {
    switch (status) {
      case 'complete': return <Check className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'uploading': return <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />;
      default: return <File className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="p-6 glass">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            Upload Audio Files
          </h3>
          <p className="text-xs text-muted-foreground">
            Max size: {maxFileSize}MB per file
          </p>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-all
            ${isDragging 
              ? 'border-primary bg-primary/5 scale-105' 
              : 'border-muted-foreground/25 hover:border-primary/50'
            }
          `}
        >
          <input
            type="file"
            multiple
            accept={SUPPORTED_AUDIO_FORMATS.join(',')}
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">
            {isDragging ? 'Drop files here' : 'Drag & drop audio files'}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Supports: WAV, FLAC, MP3, AIFF, AAC, OGG, M4A, OPUS, WebM
          </p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((fileWithProgress, index) => (
              <div key={index} className="bg-muted/30 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getStatusIcon(fileWithProgress.status)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{fileWithProgress.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(fileWithProgress.file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={fileWithProgress.status === 'uploading'}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {fileWithProgress.status === 'uploading' && (
                  <Progress value={fileWithProgress.progress} className="h-2" />
                )}
                
                {fileWithProgress.status === 'error' && (
                  <p className="text-xs text-red-500">{fileWithProgress.error}</p>
                )}
              </div>
            ))}

            <Button
              variant="glow"
              onClick={uploadAll}
              disabled={files.every(f => f.status !== 'pending')}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload All Files
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          All files are securely stored and can be accessed by you and your collaborators
        </p>
      </div>
    </Card>
  );
};
