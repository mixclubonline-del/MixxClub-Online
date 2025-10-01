import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Clock, User, Music, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Comment {
  id: string;
  user_id: string;
  comment_text: string;
  timestamp_seconds: number | null;
  created_at: string;
  audio_file_id: string | null;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface AudioCommentsProps {
  projectId: string;
  audioFiles: any[];
}

export const AudioComments = ({ projectId, audioFiles }: AudioCommentsProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedTimestamp, setSelectedTimestamp] = useState<number | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchComments();
    setupRealtimeSubscription();
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('collaboration_comments')
        .select(`
          *,
          profiles:user_id(full_name, avatar_url)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data as any || []);
    } catch (error: any) {
      console.error('Error fetching comments:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`comments-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'collaboration_comments',
          filter: `project_id=eq.${projectId}`
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('collaboration_comments')
        .insert({
          project_id: projectId,
          user_id: user.id,
          comment_text: newComment.trim(),
          timestamp_seconds: selectedTimestamp,
          audio_file_id: selectedFileId
        });

      if (error) throw error;

      setNewComment('');
      setSelectedTimestamp(null);
      setSelectedFileId(null);
      toast.success('Comment added');
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (seconds: number | null) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const getAudioFileName = (fileId: string | null) => {
    if (!fileId) return null;
    const file = audioFiles.find(f => f.id === fileId);
    return file?.file_name || 'Unknown File';
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Musical Collaboration Feed
          </h3>
          <Badge variant="secondary">
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </Badge>
        </div>

        {/* Comments List */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {comments.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No comments yet</p>
              <p className="text-sm text-muted-foreground">Start the conversation about this track</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 p-3 rounded-lg hover:bg-accent/5 transition-colors">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={comment.profiles.avatar_url || ''} />
                  <AvatarFallback className="bg-primary/10">
                    {comment.profiles.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{comment.profiles.full_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleString()}
                    </span>
                  </div>
                  
                  {/* Timestamp and File Badge */}
                  {(comment.timestamp_seconds || comment.audio_file_id) && (
                    <div className="flex items-center gap-2 mb-2">
                      {comment.timestamp_seconds && (
                        <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTimestamp(comment.timestamp_seconds)}
                        </Badge>
                      )}
                      {comment.audio_file_id && (
                        <Badge variant="outline" className="text-xs bg-purple-500/5 border-purple-500/20">
                          <Music className="w-3 h-3 mr-1" />
                          {getAudioFileName(comment.audio_file_id)}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <p className="text-sm text-foreground whitespace-pre-wrap">{comment.comment_text}</p>
                </div>
              </div>
            ))
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* New Comment Form */}
        <form onSubmit={handleSubmitComment} className="space-y-3 pt-4 border-t">
          {/* File and Timestamp Selector */}
          {audioFiles.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <select
                value={selectedFileId || ''}
                onChange={(e) => setSelectedFileId(e.target.value || null)}
                className="text-sm border rounded-md px-3 py-1.5 bg-background"
              >
                <option value="">General comment</option>
                {audioFiles.map((file) => (
                  <option key={file.id} value={file.id}>
                    {file.file_name}
                  </option>
                ))}
              </select>
              
              {selectedFileId && (
                <input
                  type="number"
                  placeholder="Timestamp (seconds)"
                  value={selectedTimestamp || ''}
                  onChange={(e) => setSelectedTimestamp(e.target.value ? parseFloat(e.target.value) : null)}
                  className="text-sm border rounded-md px-3 py-1.5 bg-background w-40"
                  min="0"
                  step="0.1"
                />
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts on the mix, suggest changes, or discuss the vibe..."
              className="min-h-[80px] resize-none"
              disabled={loading}
            />
            <Button 
              type="submit" 
              disabled={loading || !newComment.trim()}
              className="self-end"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};