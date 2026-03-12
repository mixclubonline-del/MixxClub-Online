import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trophy, Flame, Clock, Users, ThumbsUp, Plus, ArrowRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow, isPast, isFuture } from 'date-fns';
import {
  useChallengesList,
  useChallengeSubmissions,
  useSubmitChallenge,
  useVoteSubmission,
  type Challenge,
} from '@/hooks/useChallenges';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const ChallengesHub: React.FC = () => {
  const [tab, setTab] = useState('active');
  const { data: challenges = [], isLoading } = useChallengesList();

  const active = challenges.filter((c) => c.status === 'active');
  const upcoming = challenges.filter((c) => c.status === 'upcoming' || (c.start_date && isFuture(new Date(c.start_date))));
  const past = challenges.filter((c) => c.status === 'completed' || (c.end_date && isPast(new Date(c.end_date))));

  if (isLoading) {
    return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}</div>;
  }

  return (
    <MobileChallengesView tab={tab} setTab={setTab} active={active} upcoming={upcoming} past={past} />
  );
};

function MobileChallengesView({ tab, setTab, active, upcoming, past }: {
  tab: string; setTab: (v: string) => void;
  active: Challenge[]; upcoming: Challenge[]; past: Challenge[];
}) {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={setTab}>
        {isMobile ? (
          <Select value={tab} onValueChange={setTab}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active ({active.length})</SelectItem>
              <SelectItem value="upcoming">Upcoming ({upcoming.length})</SelectItem>
              <SelectItem value="past">Past ({past.length})</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <TabsList>
            <TabsTrigger value="active" className="flex items-center gap-1.5">
              <Flame className="h-4 w-4" /> Active ({active.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> Upcoming ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="flex items-center gap-1.5">
              <Trophy className="h-4 w-4" /> Past ({past.length})
            </TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="active" className="mt-4 space-y-4">
          {active.length === 0 ? (
            <EmptyState message="No active challenges right now. Check back soon!" />
          ) : (
            active.map((c) => <ChallengeCard key={c.id} challenge={c} />)
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="mt-4 space-y-4">
          {upcoming.length === 0 ? (
            <EmptyState message="No upcoming challenges scheduled." />
          ) : (
            upcoming.map((c) => <ChallengeCard key={c.id} challenge={c} />)
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4 space-y-4">
          {past.length === 0 ? (
            <EmptyState message="No completed challenges yet." />
          ) : (
            past.map((c) => <ChallengeCard key={c.id} challenge={c} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const [expanded, setExpanded] = useState(false);
  const prizes = Array.isArray(challenge.prizes) ? challenge.prizes : [];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card variant="glass" hover="lift" className="overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="text-xs capitalize">{challenge.challenge_type}</Badge>
                <Badge className={cn(
                  'text-xs',
                  challenge.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  challenge.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-muted text-muted-foreground'
                )}>
                  {challenge.status}
                </Badge>
              </div>
              <h3 className="text-lg font-bold">{challenge.title}</h3>
              {challenge.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{challenge.description}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                {challenge.submission_count}
              </div>
              {challenge.end_date && (
                <p className="text-xs text-muted-foreground mt-1">
                  {isPast(new Date(challenge.end_date))
                    ? 'Ended'
                    : `Ends ${formatDistanceToNow(new Date(challenge.end_date), { addSuffix: true })}`}
                </p>
              )}
            </div>
          </div>

          {prizes.length > 0 && (
            <div className="flex gap-2 mb-3 flex-wrap">
              {prizes.map((prize: any, i: number) => (
                <Badge key={i} variant="outline" className="text-xs">
                  <Star className="h-3 w-3 mr-1" /> {typeof prize === 'string' ? prize : prize.label || `Prize ${i + 1}`}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setExpanded(!expanded)}>
              {expanded ? 'Hide' : 'View Entries'}
              <ArrowRight className={cn('h-3.5 w-3.5 ml-1 transition-transform', expanded && 'rotate-90')} />
            </Button>
            {challenge.status === 'active' && <SubmitEntryDialog challengeId={challenge.id} />}
          </div>

          {expanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
              <SubmissionsList challengeId={challenge.id} />
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SubmissionsList({ challengeId }: { challengeId: string }) {
  const { data: submissions = [], isLoading } = useChallengeSubmissions(challengeId);
  const vote = useVoteSubmission();

  if (isLoading) return <Skeleton className="h-20 w-full" />;

  if (submissions.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">No entries yet. Be the first!</p>;
  }

  return (
    <div className="space-y-2">
      {submissions.map((sub, i) => (
        <div key={sub.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
          <span className="text-sm font-bold text-muted-foreground w-6">#{i + 1}</span>
          <Avatar className="h-7 w-7">
            <AvatarImage src={sub.profile?.avatar_url || undefined} />
            <AvatarFallback>{(sub.profile?.full_name || '?')[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{sub.title}</p>
            <p className="text-xs text-muted-foreground">{sub.profile?.full_name || 'Anonymous'}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => vote.mutate({ submissionId: sub.id, challengeId })}
            disabled={vote.isPending}
            className="flex items-center gap-1"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            <span className="text-xs">{sub.vote_count}</span>
          </Button>
        </div>
      ))}
    </div>
  );
}

function SubmitEntryDialog({ challengeId }: { challengeId: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const submit = useSubmitChallenge();

  const handleSubmit = () => {
    if (!title.trim()) return;
    submit.mutate({ challengeId, title: title.trim(), description: description.trim() || undefined }, {
      onSuccess: () => { setOpen(false); setTitle(''); setDescription(''); },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-3.5 w-3.5 mr-1" /> Submit Entry
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Your Entry</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <Input
            placeholder="Entry title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Describe your entry (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
          <Button onClick={handleSubmit} disabled={!title.trim() || submit.isPending} className="w-full">
            {submit.isPending ? 'Submitting...' : 'Submit Entry'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card variant="glass">
      <CardContent className="p-8 text-center">
        <Trophy className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}
