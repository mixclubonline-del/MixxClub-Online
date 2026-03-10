import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Trophy, Calendar, DollarSign, Users, ArrowLeft,
  Swords, Clock, CheckCircle, Zap,
} from 'lucide-react';

type TournamentStatus = 'upcoming' | 'active' | 'completed';

export default function BattleTournaments() {
  const { toast } = useToast();

  const { data: tournaments, isLoading } = useQuery({
    queryKey: ['all-tournaments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('battle_tournaments')
        .select('*')
        .order('start_date', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const handleJoin = async (id: string, name: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: 'Sign in to join', variant: 'destructive' });
      return;
    }
    const { error } = await supabase
      .from('battle_tournaments')
      .update({ current_participants: (tournaments?.find(t => t.id === id)?.current_participants ?? 0) + 1 })
      .eq('id', id);
    if (error) {
      toast({ title: 'Failed to join', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Joined!', description: `You're registered for ${name}` });
    }
  };

  const byStatus = (status: TournamentStatus) =>
    tournaments?.filter(t => t.status === status) ?? [];

  const statusBadge: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    upcoming: { label: 'Upcoming', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: <Clock className="w-3 h-3" /> },
    active: { label: 'Live', color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: <Zap className="w-3 h-3" /> },
    completed: { label: 'Completed', color: 'bg-muted text-muted-foreground', icon: <CheckCircle className="w-3 h-3" /> },
  };

  const TournamentCard = ({ t }: { t: typeof tournaments extends (infer U)[] ? U : never }) => {
    const sb = statusBadge[t.status ?? 'upcoming'] ?? statusBadge.upcoming;
    const isFull = (t.max_participants ?? 0) > 0 && (t.current_participants ?? 0) >= (t.max_participants ?? 0);

    return (
      <Card className="hover:border-primary/30 transition-colors">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-bold text-base">{t.tournament_name}</h3>
              {t.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.description}</p>
              )}
            </div>
            <Badge className={`${sb.color} flex items-center gap-1 shrink-0`}>
              {sb.icon}{sb.label}
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>{new Date(t.start_date).toLocaleDateString()}</span>
            </div>
            {t.end_date && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4 shrink-0" />
                <span>Ends {new Date(t.end_date).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4 shrink-0" />
              <span>
                {t.current_participants ?? 0}
                {t.max_participants ? `/${t.max_participants}` : ''}
              </span>
            </div>
            {(t.prize_pool ?? 0) > 0 && (
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <DollarSign className="w-4 h-4 shrink-0" />
                <span>${t.prize_pool} Prize</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            {(t.entry_fee ?? 0) > 0 ? (
              <span className="text-sm text-muted-foreground">
                Entry: <span className="font-medium text-foreground">${t.entry_fee}</span>
              </span>
            ) : (
              <Badge variant="secondary" className="text-xs">Free Entry</Badge>
            )}

            {t.status === 'upcoming' && (
              <Button
                size="sm"
                disabled={isFull}
                onClick={() => handleJoin(t.id, t.tournament_name)}
              >
                <Swords className="w-4 h-4 mr-1" />
                {isFull ? 'Full' : 'Join Tournament'}
              </Button>
            )}
            {t.status === 'active' && (
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                <Zap className="w-3 h-3 mr-1" />In Progress
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmptyState = ({ message }: { message: string }) => (
    <Card className="p-12 text-center">
      <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
      <p className="text-muted-foreground">{message}</p>
    </Card>
  );

  return (
    <>
      <Helmet>
        <title>Battle Tournaments | Mixx Club</title>
        <meta name="description" content="Compete in mixing and beat battle tournaments. Win prizes and climb the leaderboard." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <main className="container max-w-4xl mx-auto px-4 py-6">
          <Link to="/community?tab=arena" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />Back to Arena
          </Link>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Battle Tournaments</h1>
              <p className="text-muted-foreground">Compete, prove your skills, win prizes.</p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
            </div>
          ) : (
            <Tabs defaultValue="upcoming">
              <TabsList>
                <TabsTrigger value="upcoming">Upcoming ({byStatus('upcoming').length})</TabsTrigger>
                <TabsTrigger value="active">
                  <Zap className="w-3.5 h-3.5 mr-1" />Live ({byStatus('active').length})
                </TabsTrigger>
                <TabsTrigger value="completed">Completed ({byStatus('completed').length})</TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="mt-4 space-y-4">
                {byStatus('upcoming').length === 0
                  ? <EmptyState message="No upcoming tournaments yet. Check back soon!" />
                  : byStatus('upcoming').map(t => <TournamentCard key={t.id} t={t} />)}
              </TabsContent>

              <TabsContent value="active" className="mt-4 space-y-4">
                {byStatus('active').length === 0
                  ? <EmptyState message="No live tournaments right now." />
                  : byStatus('active').map(t => <TournamentCard key={t.id} t={t} />)}
              </TabsContent>

              <TabsContent value="completed" className="mt-4 space-y-4">
                {byStatus('completed').length === 0
                  ? <EmptyState message="No completed tournaments yet." />
                  : byStatus('completed').map(t => <TournamentCard key={t.id} t={t} />)}
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
    </>
  );
}
