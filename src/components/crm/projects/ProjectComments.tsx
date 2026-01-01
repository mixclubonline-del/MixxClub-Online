import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Pin, 
  Reply, 
  MoreVertical,
  MessageSquare,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Comment {
  id: string;
  content: string;
  user_id: string;
  is_pinned: boolean;
  parent_id: string | null;
  created_at: string;
  user?: {
    full_name: string;
    avatar_url: string;
  };
  replies?: Comment[];
}

interface ProjectCommentsProps {
  projectId: string;
}

export const ProjectComments = ({ projectId }: ProjectCommentsProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
    
    // Set up realtime subscription
    const channel = supabase
      .channel(`project-comments-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_comments',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('project_comments')
        .select(`
          *,
          user:profiles(full_name, avatar_url)
        `)
        .eq('project_id', projectId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Organize into threads
      const topLevel = (data || []).filter(c => !c.parent_id);
      const replies = (data || []).filter(c => c.parent_id);
      
      const threaded = topLevel.map(comment => ({
        ...comment,
        replies: replies.filter(r => r.parent_id === comment.id),
      }));

      setComments(threaded);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('project_comments')
        .insert({
          project_id: projectId,
          user_id: user.id,
          content: newComment,
          is_pinned: false,
        });

      if (error) throw error;

      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || !user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('project_comments')
        .insert({
          project_id: projectId,
          user_id: user.id,
          content: replyContent,
          parent_id: parentId,
          is_pinned: false,
        });

      if (error) throw error;

      setReplyContent('');
      setReplyingTo(null);
      toast.success('Reply added');
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePin = async (comment: Comment) => {
    try {
      const { error } = await supabase
        .from('project_comments')
        .update({ is_pinned: !comment.is_pinned })
        .eq('id', comment.id);

      if (error) throw error;
      fetchComments();
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast.error('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('project_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      toast.success('Comment deleted');
      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const CommentCard = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={isReply ? 'ml-8 mt-2' : ''}
    >
      <Card className={`${comment.is_pinned ? 'border-primary/50 bg-primary/5' : ''}`}>
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.user?.avatar_url} />
              <AvatarFallback>
                {comment.user?.full_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">
                  {comment.user?.full_name || 'Unknown User'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
                {comment.is_pinned && (
                  <Badge variant="outline" className="text-xs">
                    <Pin className="w-3 h-3 mr-1" />
                    Pinned
                  </Badge>
                )}
              </div>
              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
              
              {!isReply && (
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  >
                    <Reply className="w-3 h-3 mr-1" />
                    Reply
                  </Button>
                </div>
              )}
            </div>
            
            {comment.user_id === user?.id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!isReply && (
                    <DropdownMenuItem onClick={() => handleTogglePin(comment)}>
                      <Pin className="w-4 h-4 mr-2" />
                      {comment.is_pinned ? 'Unpin' : 'Pin'}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 ml-11"
            >
              <div className="flex gap-2">
                <Textarea
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={2}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={submitting || !replyContent.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2 mt-2">
          {comment.replies.map(reply => (
            <CommentCard key={reply.id} comment={reply} isReply />
          ))}
        </div>
      )}
    </motion.div>
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* New Comment Form */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <Button
                  onClick={handleSubmitComment}
                  disabled={submitting || !newComment.trim()}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Post Comment
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      {comments.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">No comments yet. Start the conversation!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {comments.map(comment => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
