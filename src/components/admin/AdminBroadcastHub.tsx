/**
 * AdminBroadcastHub — Compose and send platform-wide notifications.
 * Supports audience targeting by role, preview card, and history log.
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Megaphone, Send, Users, Bell, CheckCircle, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GlassPanel, HubHeader, HubSkeleton, EmptyState, StaggeredList } from '@/components/crm/design';
import { toast } from 'sonner';

const AUDIENCE_OPTIONS = [
  { value: 'all', label: 'All Users' },
  { value: 'artist', label: 'Artists Only' },
  { value: 'engineer', label: 'Engineers Only' },
  { value: 'producer', label: 'Producers Only' },
  { value: 'fan', label: 'Fans Only' },
];

export const AdminBroadcastHub = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [audience, setAudience] = useState('all');
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Recent broadcasts (admin_quick_actions with action_type = 'broadcast')
  const history = useQuery({
    queryKey: ['admin-broadcast-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_quick_actions')
        .select('*')
        .eq('action_type', 'broadcast')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30_000,
  });

  const sendBroadcast = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('admin-broadcast-notification', {
        body: { title, message, actionUrl: actionUrl || null, audience },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-broadcast-history'] });
      toast.success(`Broadcast sent to ${data?.count || 0} users`);
      setTitle('');
      setMessage('');
      setActionUrl('');
      setShowPreview(false);
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to send broadcast'),
  });

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required');
      return;
    }
    setSending(true);
    try {
      await sendBroadcast.mutateAsync();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <HubHeader
        icon={<Megaphone className="w-5 h-5 text-violet-400" />}
        title="Broadcast Center"
        subtitle="Send platform-wide notifications to your community"
        accent="rgba(139, 92, 246, 0.35)"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose Panel */}
        <GlassPanel padding="p-6" glow>
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Send className="w-4 h-4" /> Compose Broadcast
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Title</label>
              <Input
                placeholder="e.g. New Feature: AI Mastering is live!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Message</label>
              <Textarea
                placeholder="What would you like to tell your community?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                maxLength={500}
                className="resize-none"
              />
              <p className="text-[10px] text-muted-foreground mt-1 text-right">{message.length}/500</p>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Action URL (optional)</label>
              <Input
                placeholder="/marketplace or /artist-crm?tab=mastering"
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Audience</label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUDIENCE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => setShowPreview(!showPreview)}
                disabled={!title.trim() && !message.trim()}
              >
                <Eye className="w-4 h-4" /> Preview
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={handleSend}
                disabled={!title.trim() || !message.trim() || sending}
              >
                <Send className="w-4 h-4" /> {sending ? 'Sending...' : 'Send Broadcast'}
              </Button>
            </div>
          </div>
        </GlassPanel>

        {/* Preview + History */}
        <div className="space-y-6">
          {/* Preview Card */}
          {showPreview && title.trim() && (
            <GlassPanel padding="p-4" accent="rgba(139, 92, 246, 0.35)">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{message}</p>
                  {actionUrl && (
                    <p className="text-xs text-primary mt-1 truncate">{actionUrl}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-[10px] capitalize">{audience === 'all' ? 'All Users' : audience + 's'}</Badge>
                    <span className="text-[10px] text-muted-foreground">Just now</span>
                  </div>
                </div>
              </div>
            </GlassPanel>
          )}

          {/* History */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Recent Broadcasts
            </h3>
            {history.isLoading ? (
              <HubSkeleton variant="list" count={3} />
            ) : !history.data?.length ? (
              <EmptyState icon={Megaphone} title="No Broadcasts Yet" description="Send your first announcement to engage your community." />
            ) : (
              <StaggeredList className="space-y-2">
                {history.data.map((h: any) => {
                  const meta = h.metadata as any;
                  return (
                    <GlassPanel key={h.id} padding="p-3">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{meta?.title || h.description || 'Broadcast'}</p>
                          <p className="text-xs text-muted-foreground">
                            {meta?.audience ? `To: ${meta.audience}` : ''} · {meta?.count || 0} recipients
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(h.created_at), 'MMM d, h:mm a')}
                        </span>
                      </div>
                    </GlassPanel>
                  );
                })}
              </StaggeredList>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
