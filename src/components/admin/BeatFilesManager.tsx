import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Play, Pause, CheckCircle, AlertCircle, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface BeatFile {
  id: number;
  name: string;
  fileName: string;
  description: string;
  exists: boolean;
  url?: string;
}

export function BeatFilesManager() {
  const [beatFiles, setBeatFiles] = useState<BeatFile[]>([
    { id: 1, name: 'Intensity Level 1', fileName: 'trap-beat-1.mp3', description: 'Minimal, ambient intro', exists: false },
    { id: 2, name: 'Intensity Level 2', fileName: 'trap-beat-2.mp3', description: 'Light percussion, building energy', exists: false },
    { id: 3, name: 'Intensity Level 3', fileName: 'trap-beat-3.mp3', description: 'Full beat, moderate intensity', exists: false },
    { id: 4, name: 'Intensity Level 4', fileName: 'trap-beat-4.mp3', description: 'Heavy bass, high energy', exists: false },
    { id: 5, name: 'Intensity Level 5', fileName: 'trap-beat-5.mp3', description: 'Maximum intensity, powerful', exists: false },
  ]);
  const [uploading, setUploading] = useState<Record<number, boolean>>({});
  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioRefs = useRef<Record<number, HTMLAudioElement>>({});

  useEffect(() => {
    checkExistingFiles();
  }, []);

  const checkExistingFiles = async () => {
    try {
      // List files from Storage bucket
      const { data: files, error } = await supabase.storage
        .from('media-library')
        .list('beats', {
          limit: 100,
          offset: 0,
        });

      if (error) {
        console.error('Storage list error:', error);
        toast.error('Failed to check existing files');
        return;
      }

      const fileMap = new Map(files?.map(f => [f.name, f]) || []);
      
      const updatedFiles = beatFiles.map((beat) => {
        const exists = fileMap.has(beat.fileName);
        const url = exists 
          ? supabase.storage.from('media-library').getPublicUrl(`beats/${beat.fileName}`).data.publicUrl
          : undefined;
        return { ...beat, exists, url };
      });

      setBeatFiles(updatedFiles);
    } catch (error) {
      console.error('Error checking files:', error);
    }
  };

  const handleFileUpload = async (beatId: number, file: File) => {
    if (!file.type.startsWith('audio/')) {
      toast.error('Please upload an audio file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploading({ ...uploading, [beatId]: true });

    try {
      const beatFile = beatFiles.find(b => b.id === beatId);
      if (!beatFile) return;

      const { error: uploadError } = await supabase.storage
        .from('media-library')
        .upload(`beats/${beatFile.fileName}`, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('media-library')
        .getPublicUrl(`beats/${beatFile.fileName}`);

      toast.success(`${beatFile.name} uploaded successfully`);
      
      setBeatFiles(beatFiles.map(b => 
        b.id === beatId ? { ...b, exists: true, url: data.publicUrl } : b
      ));
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading({ ...uploading, [beatId]: false });
    }
  };

  const handleDelete = async (beatId: number) => {
    const beatFile = beatFiles.find(b => b.id === beatId);
    if (!beatFile) return;

    if (!confirm(`Delete ${beatFile.name}?`)) return;

    try {
      const { error } = await supabase.storage
        .from('media-library')
        .remove([`beats/${beatFile.fileName}`]);

      if (error) throw error;

      toast.success('Beat file deleted');
      setBeatFiles(beatFiles.map(b => 
        b.id === beatId ? { ...b, exists: false, url: undefined } : b
      ));
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(`Delete failed: ${error.message}`);
    }
  };

  const togglePlay = (beatId: number) => {
    const beat = beatFiles.find(b => b.id === beatId);
    if (!beat?.url) return;

    if (playingId && playingId !== beatId) {
      audioRefs.current[playingId]?.pause();
      audioRefs.current[playingId]!.currentTime = 0;
    }

    const audio = audioRefs.current[beatId];
    if (!audio) {
      const newAudio = new Audio(beat.url);
      newAudio.loop = true;
      audioRefs.current[beatId] = newAudio;
      newAudio.play();
      setPlayingId(beatId);
      newAudio.onended = () => setPlayingId(null);
    } else {
      if (playingId === beatId) {
        audio.pause();
        audio.currentTime = 0;
        setPlayingId(null);
      } else {
        audio.play();
        setPlayingId(beatId);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>File Requirements:</strong> MP3 format, 10-15 seconds duration, loopable, progressive intensity.
          Files stored in media-library/beats/ and used for welcome slideshow audio.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {beatFiles.map((beat) => (
          <Card key={beat.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {beat.name}
                    {beat.exists && <CheckCircle className="h-5 w-5 text-green-500" />}
                  </CardTitle>
                  <CardDescription>{beat.description}</CardDescription>
                </div>
                <div className="text-sm text-muted-foreground">
                  {beat.fileName}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor={`beat-${beat.id}`} className="sr-only">
                    Upload {beat.name}
                  </Label>
                  <Input
                    id={`beat-${beat.id}`}
                    type="file"
                    accept="audio/mp3,audio/mpeg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(beat.id, file);
                    }}
                    disabled={uploading[beat.id]}
                  />
                </div>
                
                {beat.exists ? (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => togglePlay(beat.id)}
                    >
                      {playingId === beat.id ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(beat.url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(beat.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" disabled>
                    Not Uploaded
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}