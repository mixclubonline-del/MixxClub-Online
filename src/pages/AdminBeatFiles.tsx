import { useState, useEffect, useRef } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Play, Pause, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { toast } from 'sonner';

interface BeatFile {
  id: number;
  name: string;
  fileName: string;
  description: string;
  exists: boolean;
  url?: string;
}

export default function AdminBeatFiles() {
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
    const updatedFiles = await Promise.all(
      beatFiles.map(async (file) => {
        try {
          const response = await fetch(`/audio/${file.fileName}`, { method: 'HEAD' });
          const exists = response.ok;
          const url = exists ? `/audio/${file.fileName}` : undefined;
          return { ...file, exists, url };
        } catch {
          return { ...file, exists: false };
        }
      })
    );
    setBeatFiles(updatedFiles);
  };

  const handleFileUpload = async (beatId: number, file: File) => {
    if (!file.type.startsWith('audio/')) {
      toast.error('Please upload an audio file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading({ ...uploading, [beatId]: true });

    try {
      const beatFile = beatFiles.find(b => b.id === beatId);
      if (!beatFile) return;

      // Upload to media-library bucket with the specific filename
      const { error: uploadError } = await supabase.storage
        .from('media-library')
        .upload(`beats/${beatFile.fileName}`, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('media-library')
        .getPublicUrl(`beats/${beatFile.fileName}`);

      toast.success(`${beatFile.name} uploaded successfully`);
      
      // Update state
      setBeatFiles(beatFiles.map(b => 
        b.id === beatId ? { ...b, exists: true, url: data.publicUrl } : b
      ));
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading({ ...uploading, [beatId]: false });
    }
  };

  const togglePlay = (beatId: number) => {
    const beat = beatFiles.find(b => b.id === beatId);
    if (!beat?.url) return;

    // Stop any currently playing audio
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
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Trap Beat Files Management</h1>
          <p className="text-muted-foreground">
            Upload and manage the 5 trap beat audio files used in slideshow transitions
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>File Requirements:</strong> MP3 format, 10-15 seconds duration, loopable, progressive intensity.
            Files will be stored in the media library and used for the welcome slideshow audio experience.
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
                  
                  {beat.exists && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => togglePlay(beat.id)}
                        disabled={uploading[beat.id]}
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
                    </>
                  )}
                  
                  {!beat.exists && (
                    <Button variant="outline" disabled>
                      <Upload className="h-4 w-4 mr-2" />
                      Not Uploaded
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Alert>
          <AlertDescription>
            <strong>Note:</strong> After uploading new beat files, you may need to clear your browser cache 
            or wait a few minutes for the changes to take effect across the site.
          </AlertDescription>
        </Alert>
      </div>
    </AdminLayout>
  );
}
