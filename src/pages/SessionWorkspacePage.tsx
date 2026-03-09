import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Headphones,
  Users,
  MessageSquare,
  Play,
  Pause,
  Send,
  Lock,
  Video,
  Mic,
  MicOff,
  Volume2,
  Clock,
  Wifi,
} from 'lucide-react';

// Community member count — swap with real query when live
const COMMUNITY_COUNT = 47;
const UNLOCK_THRESHOLD = 250;
const IS_UNLOCKED = COMMUNITY_COUNT >= UNLOCK_THRESHOLD;

interface SessionComment {
  id: string;
  comment_text: string;
  timestamp_seconds: number | null;
  created_at: string;
  user: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
}

interface Participant {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  role: string | null;
}

export const SessionWorkspacePage = () => {
  const { sessionId } = useParams();
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(217); // 3:37 demo
  const [comments, setComments] = useState<SessionComment[]>([]);
  const [participants] = useState<Participant[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadComments();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [sessionId]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((t) => Math.min(t + 1, duration));
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, duration]);

  const loadComments = async () => {
    try {
      if (!sessionId) return;
      const { data, error } = await supabase
        .from('session_comments')
        .select('id, comment_text, timestamp_seconds, created_at, user_id')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Enrich comments with profile data
      const enriched: SessionComment[] = await Promise.all(
        (data || []).map(async (c) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, username, avatar_url')
            .eq('id', c.user_id)
            .maybeSingle();

          return {
            id: c.id,
            comment_text: c.comment_text,
            timestamp_seconds: c.timestamp_seconds,
            created_at: c.created_at,
            user: profile || null,
          };
        })
      );

      setComments(enriched);
    } catch (err) {
      console.error('Error loading comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Sign in to comment', variant: 'destructive' });
        return;
      }

      const { error } = await supabase
        .from('session_comments')
        .insert({
          session_id: sessionId || 'demo',
          user_id: user.id,
          comment_text: newComment.trim(),
          timestamp_seconds: currentTime,
        });

      if (error) throw error;
      setNewComment('');
      loadComments();
    } catch (err) {
      console.error('Error sending comment:', err);
      toast({ title: 'Failed to send comment', variant: 'destructive' });
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Helmet>
        <title>Session Workspace | Mixx Club</title>
        <meta name="description" content="Real-time collaborative audio workspace for mixing sessions." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <main className="container max-w-7xl mx-auto px-4 py-6">
          <Link
            to="/sessions"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sessions
          </Link>

          {/* Unlock Overlay Wrapper */}
          <div className="relative">
            {!IS_UNLOCKED && (
              <div className="absolute inset-0 z-20 flex items-start justify-center pt-24 rounded-xl" style={{ background: 'hsl(var(--background)/0.92)', backdropFilter: 'blur(8px)' }}>
                <Card className="p-10 text-center max-w-md border-primary/30">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Unlocking Soon</h2>
                  <p className="text-muted-foreground mb-4">
                    Live collaboration workspaces unlock at <strong>{UNLOCK_THRESHOLD} community members</strong>.
                  </p>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(COMMUNITY_COUNT / UNLOCK_THRESHOLD) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {COMMUNITY_COUNT} / {UNLOCK_THRESHOLD} members — {UNLOCK_THRESHOLD - COMMUNITY_COUNT} to go
                  </p>
                  <Badge className="mt-4">Phase 2 Feature</Badge>
                </Card>
              </div>
            )}

            {/* Full Workspace UI */}
            <div className={!IS_UNLOCKED ? 'pointer-events-none select-none' : ''}>
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">

                {/* Main Area — Waveform + Transport */}
                <div className="xl:col-span-3 space-y-4">
                  {/* Session Header */}
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                          <Headphones className="w-5 h-5 text-primary" />
                          Session Workspace
                          {sessionId && <Badge variant="secondary" className="font-mono text-xs">{sessionId.slice(0, 8)}</Badge>}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">Real-time collaborative mixing environment</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                          <Wifi className="w-3 h-3 text-green-500" />
                          Connected
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Video className="w-4 h-4 mr-2" />
                          Video Chat
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* Waveform Visualizer */}
                  <Card className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-sm font-medium">Waveform</span>
                      <span className="text-sm text-muted-foreground font-mono">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    {/* Fake waveform bars */}
                    <div
                      className="relative w-full h-24 flex items-center gap-0.5 cursor-pointer overflow-hidden rounded"
                      style={{ background: 'hsl(var(--muted))' }}
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const ratio = (e.clientX - rect.left) / rect.width;
                        setCurrentTime(Math.floor(ratio * duration));
                      }}
                    >
                      {Array.from({ length: 200 }).map((_, i) => {
                        const h = 20 + Math.sin(i * 0.4) * 15 + Math.random() * 20;
                        const played = i / 200 < currentTime / duration;
                        return (
                          <div
                            key={i}
                            className="flex-1"
                            style={{
                              height: `${h}px`,
                              background: played ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground)/0.3)',
                              borderRadius: '1px',
                              transition: 'background 0.05s',
                            }}
                          />
                        );
                      })}
                      {/* Playhead */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-primary"
                        style={{ left: `${(currentTime / duration) * 100}%` }}
                      />
                    </div>

                    {/* Transport Controls */}
                    <div className="flex items-center gap-3 mt-4">
                      <Button
                        size="icon"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-12 h-12"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </Button>
                      <Button
                        size="sm"
                        variant={isMuted ? 'destructive' : 'outline'}
                        onClick={() => setIsMuted(!isMuted)}
                      >
                        {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Volume2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentTime(0)}
                      >
                        Reset
                      </Button>
                    </div>
                  </Card>

                  {/* Timestamped Comments */}
                  <Card className="p-4">
                    <h3 className="font-semibold flex items-center gap-2 mb-4">
                      <MessageSquare className="w-4 h-4" />
                      Timestamped Comments
                    </h3>

                    <ScrollArea className="h-48 mb-4">
                      {loading ? (
                        <p className="text-sm text-muted-foreground text-center py-4">Loading comments...</p>
                      ) : comments.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No comments yet. Click play and drop a timestamped note!
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {comments.map((comment) => (
                            <div key={comment.id} className="flex items-start gap-3 p-2 rounded hover:bg-muted/50">
                              <Avatar className="w-7 h-7">
                                <AvatarImage src={comment.user?.avatar_url || undefined} />
                                <AvatarFallback className="text-xs">
                                  {comment.user?.full_name?.[0] || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium">
                                    {comment.user?.full_name || comment.user?.username || 'User'}
                                  </span>
                                  {comment.timestamp_seconds != null && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs gap-1 cursor-pointer"
                                      onClick={() => setCurrentTime(comment.timestamp_seconds!)}
                                    >
                                      <Clock className="w-2.5 h-2.5" />
                                      {formatTime(comment.timestamp_seconds)}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm mt-0.5">{comment.comment_text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>

                    <div className="flex gap-2">
                      <Input
                        placeholder={`Comment at ${formatTime(currentTime)}...`}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                      />
                      <Button onClick={handleSendComment}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </div>

                {/* Sidebar — Participants */}
                <div className="space-y-4">
                  <Card className="p-4">
                    <h3 className="font-semibold flex items-center gap-2 mb-4">
                      <Users className="w-4 h-4" />
                      Participants ({participants.length})
                    </h3>

                    {participants.length === 0 ? (
                      <div className="text-center py-6">
                        <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Invite collaborators to join</p>
                        <Button size="sm" className="mt-3 w-full">
                          Invite
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {participants.map((p) => (
                          <div key={p.id} className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={p.avatar_url || undefined} />
                              <AvatarFallback>{p.full_name?.[0] || '?'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {p.full_name || p.username}
                              </p>
                              <p className="text-xs text-muted-foreground">{p.role}</p>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">Session Info</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant="outline" className="gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Live
                        </Badge>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Comments</span>
                        <span>{comments.length}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};
