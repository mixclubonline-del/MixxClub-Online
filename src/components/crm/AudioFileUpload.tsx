import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AudioFileUploadProps {
  projectId: string;
  onFilesUploaded: (files: string[]) => void;
}

export const AudioFileUpload = ({ projectId, onFilesUploaded }: AudioFileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadedFiles: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${projectId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('audio-files')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        // Store file info in database
        const { error: dbError } = await supabase
          .from('audio_files')
          .insert({
            project_id: projectId,
            file_name: file.name,
            file_path: fileName,
            file_size: file.size,
            uploaded_by: (await supabase.auth.getUser()).data.user?.id,
            file_type: file.type
          });

        if (dbError) {
          console.error('Database error:', dbError);
          toast.error(`Failed to save ${file.name} info`);
          continue;
        }

        uploadedFiles.push(file.name);
      }

      if (uploadedFiles.length > 0) {
        toast.success(`Uploaded ${uploadedFiles.length} file(s) successfully`);
        onFilesUploaded(uploadedFiles);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label>Upload Tracks:</Label>
      <div className="flex items-center gap-2">
        <input
          type="file"
          multiple
          accept="audio/*"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="hidden"
          id={`file-upload-${projectId}`}
        />
        <Button
          variant="outline"
          className="w-full gap-2"
          disabled={isUploading}
          onClick={() => document.getElementById(`file-upload-${projectId}`)?.click()}
        >
          <Upload className="w-4 h-4" />
          {isUploading ? 'Uploading...' : 'Choose Files'}
        </Button>
      </div>
    </div>
  );
};