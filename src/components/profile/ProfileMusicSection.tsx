import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Music, Play, Pause, Clock, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface ProfileMusicSectionProps {
  userId: string;
  pinnedTrackId?: string | null;
}

export function ProfileMusicSection({ userId, pinnedTrackId }: ProfileMusicSectionProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Fetch user's audio files
  const { data: tracks, isLoading } = useQuery({
    queryKey: ["user-tracks", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audio_files")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(9);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  // Find pinned track
  const pinnedTrack = pinnedTrackId 
    ? tracks?.find(t => t.id === pinnedTrackId) 
    : tracks?.[0];

  const otherTracks = tracks?.filter(t => t.id !== pinnedTrack?.id) || [];

  const togglePlay = (trackId: string) => {
    setPlayingId(playingId === trackId ? null : trackId);
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!tracks || tracks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Music
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">No tracks uploaded yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pinned Track */}
      {pinnedTrack && (
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="gap-1">
                <Music className="h-3 w-3" />
                Featured Track
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button
                size="lg"
                variant="default"
                className="h-16 w-16 rounded-full"
                onClick={() => togglePlay(pinnedTrack.id)}
              >
                {playingId === pinnedTrack.id ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 ml-1" />
                )}
              </Button>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{pinnedTrack.file_name?.replace(/\.[^/.]+$/, '') || 'Untitled'}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(pinnedTrack.duration_seconds)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Waveform placeholder */}
            <div className="mt-4 h-16 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 rounded-lg flex items-center justify-center">
              <div className="flex items-end gap-0.5 h-12">
                {Array.from({ length: 50 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-primary/60 rounded-full transition-all"
                    style={{
                      height: `${Math.random() * 100}%`,
                      opacity: playingId === pinnedTrack.id ? 1 : 0.5,
                    }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Tracks Grid */}
      {otherTracks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Music className="h-5 w-5" />
              All Tracks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {otherTracks.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 rounded-full shrink-0"
                    onClick={() => togglePlay(track.id)}
                  >
                    {playingId === track.id ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4 ml-0.5" />
                    )}
                  </Button>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">
                      {track.file_name?.replace(/\.[^/.]+$/, '') || 'Untitled'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDuration(track.duration_seconds)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
