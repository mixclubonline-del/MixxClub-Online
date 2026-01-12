/**
 * ExportedTrackCard - Display card for tracks ready to distribute
 * 
 * Shows track metadata, playback controls, and quick-distribute actions.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Share2, 
  ExternalLink, 
  Music, 
  Clock, 
  FileAudio,
  Trash2,
  CheckCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ExportedTrack, getExportPlaybackUrl, useDeleteExport } from '@/hooks/useExportedTracks';

interface ExportedTrackCardProps {
  track: ExportedTrack;
  onDistribute?: (track: ExportedTrack) => void;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '0 MB';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

export function ExportedTrackCard({ track, onDistribute }: ExportedTrackCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const deleteExport = useDeleteExport();
  
  const handlePlayPause = async () => {
    if (isPlaying && audioElement) {
      audioElement.pause();
      setIsPlaying(false);
      return;
    }
    
    // Get signed URL and play
    const url = await getExportPlaybackUrl(track.file_path);
    if (!url) return;
    
    const audio = new Audio(url);
    audio.onended = () => setIsPlaying(false);
    audio.play();
    setAudioElement(audio);
    setIsPlaying(true);
  };
  
  const handleDelete = () => {
    if (audioElement) {
      audioElement.pause();
      setAudioElement(null);
    }
    deleteExport.mutate(track);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Card className="group hover:border-primary/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Play Button / Album Art Placeholder */}
            <button
              onClick={handlePlayPause}
              className="relative w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors"
            >
              <Music className="w-6 h-6 text-primary absolute opacity-30" />
              {isPlaying ? (
                <Pause className="w-6 h-6 text-primary relative z-10" />
              ) : (
                <Play className="w-6 h-6 text-primary relative z-10 ml-0.5" />
              )}
            </button>
            
            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">{track.title}</h3>
                {track.distributed_at && (
                  <Badge variant="outline" className="shrink-0 text-xs gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Distributed
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                {track.genre && (
                  <span className="flex items-center gap-1">
                    <Music className="w-3 h-3" />
                    {track.genre}
                  </span>
                )}
                {track.bpm && (
                  <span>{track.bpm} BPM</span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(track.duration_seconds)}
                </span>
                <span className="flex items-center gap-1">
                  <FileAudio className="w-3 h-3" />
                  {track.bit_depth}-bit
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <span>{formatFileSize(track.file_size_bytes)}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(track.created_at), { addSuffix: true })}</span>
                {track.velvet_curve_preset && (
                  <>
                    <span>•</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      Velvet: {track.velvet_curve_preset}
                    </Badge>
                  </>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                disabled={deleteExport.isPending}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              
              {!track.distributed_at && onDistribute && (
                <Button
                  size="sm"
                  onClick={() => onDistribute(track)}
                  className="gap-1.5"
                >
                  <Share2 className="w-4 h-4" />
                  Distribute
                </Button>
              )}
              
              {track.distributed_at && track.distribution_partner && (
                <Badge variant="outline" className="text-xs">
                  via {track.distribution_partner}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
