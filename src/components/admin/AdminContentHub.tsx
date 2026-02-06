import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileAudio, Disc3, Music } from 'lucide-react';
import { format } from 'date-fns';

export const AdminContentHub = () => {
  const [audioFiles, setAudioFiles] = useState<any[]>([]);
  const [beats, setBeats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const [{ data: files }, { data: beatsData }] = await Promise.all([
        supabase.from('audio_files').select('*').order('created_at', { ascending: false }).limit(30),
        supabase.from('producer_beats').select('*').order('created_at', { ascending: false }).limit(30),
      ]);

      setAudioFiles(files || []);
      setBeats(beatsData || []);
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-background/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <FileAudio className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{audioFiles.length}</p>
              <p className="text-xs text-muted-foreground">Audio Files</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-background/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Disc3 className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{beats.length}</p>
              <p className="text-xs text-muted-foreground">Producer Beats</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audio Files */}
      <Card className="bg-background/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileAudio className="w-4 h-4" /> Recent Audio Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {audioFiles.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No audio files uploaded</p>
            ) : (
              audioFiles.slice(0, 15).map((file) => (
                <div key={file.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{file.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.file_size)} • {file.mime_type || 'audio'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(file.created_at), 'MMM d')}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Beats */}
      <Card className="bg-background/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Disc3 className="w-4 h-4" /> Recent Producer Beats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {beats.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No beats uploaded</p>
            ) : (
              beats.slice(0, 15).map((beat) => (
                <div key={beat.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{beat.title || 'Untitled Beat'}</p>
                    <div className="flex gap-2 mt-1">
                      {beat.genre && <Badge variant="outline" className="text-xs">{beat.genre}</Badge>}
                      {beat.bpm && <Badge variant="outline" className="text-xs">{beat.bpm} BPM</Badge>}
                    </div>
                  </div>
                  <div className="text-right">
                    {beat.price && <p className="text-sm font-medium text-foreground">${beat.price}</p>}
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(beat.created_at), 'MMM d')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
