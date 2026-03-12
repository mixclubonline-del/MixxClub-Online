/**
 * AdminSupportInbox — Triage, read, and reply to contact_submissions.
 * 120% standard: glass panels, skeletons, empty state, live reply via Resend.
 */

import { useState } from 'react';
import { Search, Inbox, Mail, MailCheck, Clock, CheckCircle, Send, Phone, DollarSign, X } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { GlassPanel, HubHeader, HubSkeleton, EmptyState } from '@/components/crm/design';
import { useAdminSupport, SubmissionStatus } from '@/hooks/useAdminSupport';

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Mail; color: string }> = {
  new: { label: 'New', icon: Mail, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  resolved: { label: 'Resolved', icon: CheckCircle, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
};

export const AdminSupportInbox = () => {
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  const { submissions, unreadCount, updateStatus, sendReply } = useAdminSupport(statusFilter, search);

  const handleReply = async () => {
    if (!selectedSubmission || !replyText.trim()) return;
    setReplying(true);
    try {
      await sendReply.mutateAsync({
        submissionId: selectedSubmission.id,
        recipientEmail: selectedSubmission.email,
        recipientName: selectedSubmission.name,
        replyMessage: replyText.trim(),
      });
      setReplyText('');
      setSelectedSubmission(null);
    } finally {
      setReplying(false);
    }
  };

  const filters: Array<{ key: SubmissionStatus | 'all'; label: string; count?: number }> = [
    { key: 'all', label: 'All' },
    { key: 'new', label: 'New', count: unreadCount.data || 0 },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'resolved', label: 'Resolved' },
  ];

  return (
    <div className="space-y-6">
      <HubHeader
        icon={<Inbox className="w-5 h-5 text-blue-400" />}
        title="Support Inbox"
        subtitle={`${unreadCount.data || 0} unread submissions`}
        accent="rgba(59, 130, 246, 0.35)"
      />

      {/* Filters + Search */}
      <GlassPanel padding="p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {filters.map((f) => (
              <Button
                key={f.key}
                variant={statusFilter === f.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(f.key)}
                className="gap-1.5"
              >
                {f.label}
                {f.count !== undefined && f.count > 0 && (
                  <Badge variant="outline" className="ml-1 text-[10px] px-1.5 py-0 h-4 bg-destructive/20 text-destructive border-destructive/30">
                    {f.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </GlassPanel>

      {/* Submissions List */}
      {submissions.isLoading ? (
        <HubSkeleton variant="list" count={5} />
      ) : !submissions.data?.length ? (
        <EmptyState
          icon={MailCheck}
          title="Inbox Zero"
          description="No submissions match your current filters. Your users are happy!"
        />
      ) : (
        <div className="space-y-2">
          {submissions.data.map((sub: any) => {
            const cfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.new;
            const StatusIcon = cfg.icon;
            return (
              <GlassPanel
                key={sub.id}
                hoverable
                onClick={() => setSelectedSubmission(sub)}
                padding="p-4"
                className="cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {sub.name?.charAt(0) || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-foreground truncate">{sub.name}</span>
                        <Badge variant="outline" className={`text-[10px] ${cfg.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {cfg.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{sub.email}</p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{sub.message}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(sub.created_at), 'MMM d, h:mm a')}
                  </span>
                </div>
              </GlassPanel>
            );
          })}
        </div>
      )}

      {/* Detail Slide-Over */}
      <Sheet open={!!selectedSubmission} onOpenChange={(open) => { if (!open) setSelectedSubmission(null); }}>
        <SheetContent className="sm:max-w-lg overflow-y-auto bg-background/95 backdrop-blur-xl border-border/50">
          {selectedSubmission && (
            <>
              <SheetHeader>
                <SheetTitle className="text-foreground">Message from {selectedSubmission.name}</SheetTitle>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                {/* Contact Info */}
                <GlassPanel padding="p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{selectedSubmission.email}</span>
                    </div>
                    {selectedSubmission.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{selectedSubmission.phone}</span>
                      </div>
                    )}
                    {selectedSubmission.budget && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">Budget: {selectedSubmission.budget}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{format(new Date(selectedSubmission.created_at), 'PPpp')}</span>
                    </div>
                  </div>
                </GlassPanel>

                {/* Message Body */}
                <GlassPanel padding="p-4">
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{selectedSubmission.message}</p>
                </GlassPanel>

                {/* Status Actions */}
                <div className="flex gap-2 flex-wrap">
                  {(['new', 'in_progress', 'resolved'] as SubmissionStatus[]).map((s) => {
                    const cfg = STATUS_CONFIG[s];
                    return (
                      <Button
                        key={s}
                        variant={selectedSubmission.status === s ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          updateStatus.mutate({ id: selectedSubmission.id, status: s });
                          setSelectedSubmission({ ...selectedSubmission, status: s });
                        }}
                      >
                        {cfg.label}
                      </Button>
                    );
                  })}
                </div>

                {/* Reply Composer */}
                <GlassPanel padding="p-4">
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Send className="w-4 h-4" /> Reply via Email
                    </h4>
                    <Textarea
                      placeholder={`Reply to ${selectedSubmission.name}...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={5}
                      className="resize-none"
                    />
                    <Button
                      onClick={handleReply}
                      disabled={!replyText.trim() || replying}
                      className="w-full gap-2"
                    >
                      <Send className="w-4 h-4" />
                      {replying ? 'Sending...' : 'Send Reply'}
                    </Button>
                  </div>
                </GlassPanel>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};
