/**
 * MobileProHome — The Business Command Center
 * 
 * For Artists, Engineers, and Producers on the go.
 * Your music business in your pocket: earnings, pending actions,
 * active projects, session feed. All real data, zero filler.
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserEarnings } from '@/hooks/useUserEarnings';
import { useUserProjects } from '@/hooks/useUserProjects';
import {
  useOpenSessions,
  useMyApplications,
  useSessionMarketplaceStats,
} from '@/hooks/useSessionMarketplace';
import { MobileSessionCard } from '@/components/mobile/MobileSessionCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus, Headphones, DollarSign, TrendingUp,
  Users, MessageCircle, Bell, Zap, Send,
  ChevronRight, Loader2, Sparkles, Briefcase,
  Music, Upload,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useEffect, useRef } from 'react';

// ─── Time-of-day greeting ─────────────────────────────────────
function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 5) return `Late night grind, ${name}?`;
  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 17) return `What's good, ${name}`;
  if (hour < 22) return `Evening session, ${name}`;
  return `Late night session, ${name}?`;
}

function getRoleBadge(role: string) {
  const map: Record<string, { label: string; color: string }> = {
    artist: { label: '🎤 Artist', color: 'bg-primary/15 text-primary border-primary/30' },
    engineer: { label: '🎛️ Engineer', color: 'bg-accent/15 text-accent-foreground border-accent/30' },
    producer: { label: '🎹 Producer', color: 'bg-secondary/15 text-secondary-foreground border-secondary/30' },
  };
  return map[role] || map.artist;
}

export default function MobileProHome() {
  const { user, activeRole } = useAuth();
  const navigate = useNavigate();
  const hasConfettied = useRef(false);

  const role = activeRole || 'artist';
  const firstName = (user as any)?.user_metadata?.full_name?.split(' ')[0]
    || user?.email?.split('@')[0]
    || 'Creator';

  // Real data hooks
  const { data: earningsData, isLoading: earningsLoading } = useUserEarnings(user?.id);
  const { data: projects } = useUserProjects(user?.id, role as any);
  const { data: openSessions, isLoading: sessionsLoading } = useOpenSessions();
  const { data: stats } = useSessionMarketplaceStats();
  const { data: myApps } = useMyApplications();

  const pendingApps = (myApps || []).filter((a: any) => a.status === 'applied');
  const acceptedApps = (myApps || []).filter((a: any) => a.status === 'accepted');
  const activeProjects = (projects || []).filter((p: any) => p.status === 'in_progress' || p.status === 'active');
  const totalEarnings = earningsData?.totalEarnings || 0;
  const totalSales = earningsData?.totalSales || 0;
  const combinedRevenue = totalEarnings + totalSales;

  const badge = getRoleBadge(role);

  // Confetti on first accepted application
  useEffect(() => {
    if (acceptedApps.length > 0 && !hasConfettied.current) {
      hasConfettied.current = true;
      confetti({
        particleCount: 60,
        spread: 55,
        origin: { y: 0.7 },
        colors: ['#ec4899', '#a78bfa', '#06b6d4'],
      });
    }
  }, [acceptedApps.length]);

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-24 overflow-y-auto touch-manipulation">
      <div className="px-4 py-5 space-y-5">

        {/* ─── Greeting ─── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-xl font-bold text-foreground">{getGreeting(firstName)}</h1>
          <Badge variant="outline" className={`mt-1.5 text-xs ${badge.color}`}>
            {badge.label}
          </Badge>
        </motion.div>

        {/* ─── Earnings Ticker ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="bg-gradient-to-br from-primary/10 via-card to-accent/5 border-primary/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Revenue</p>
                {earningsLoading ? (
                  <Skeleton className="h-8 w-28 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">
                    ${combinedRevenue.toFixed(2)}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
            {!earningsLoading && (
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-primary" />
                  {(earningsData?.earnings || []).length} payouts
                </span>
                <span>{(earningsData?.sales || []).length} sales</span>
              </div>
            )}
          </Card>
        </motion.div>

        {/* ─── Pending Actions ─── */}
        {(pendingApps.length > 0 || acceptedApps.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-4 border-border/30 bg-card/60">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Pending Actions
              </h3>
              <div className="space-y-2">
                {pendingApps.length > 0 && (
                  <div
                    className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 cursor-pointer active:bg-muted/60 touch-manipulation"
                    onClick={() => navigate(role === 'engineer' ? '/engineer-crm' : '/artist-crm')}
                  >
                    <span className="text-sm">{pendingApps.length} pending application{pendingApps.length > 1 ? 's' : ''}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                {acceptedApps.length > 0 && (
                  <div
                    className="flex items-center justify-between p-2.5 rounded-xl bg-primary/10 cursor-pointer active:bg-primary/20 touch-manipulation"
                    onClick={() => navigate(role === 'engineer' ? '/engineer-crm' : '/artist-crm')}
                  >
                    <span className="text-sm text-primary font-medium">
                      🎉 {acceptedApps.length} accepted!
                    </span>
                    <ChevronRight className="w-4 h-4 text-primary" />
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* ─── Active Projects Strip ─── */}
        {activeProjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                Active Projects
              </h2>
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate(`/${role}-crm`)}>
                All <ChevronRight className="w-3 h-3 ml-0.5" />
              </Button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {activeProjects.slice(0, 6).map((project: any) => (
                <Card
                  key={project.id}
                  className="min-w-[200px] p-3 border-border/30 bg-card/50 flex-shrink-0 cursor-pointer active:bg-card/80 touch-manipulation"
                  onClick={() => navigate(`/session/${project.id}`)}
                >
                  <p className="text-sm font-medium truncate">{project.title || 'Untitled'}</p>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">{project.status}</p>
                  {project.genre && (
                    <Badge variant="secondary" className="mt-2 text-[10px]">{project.genre}</Badge>
                  )}
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── Quick Actions ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-3 gap-3"
        >
          {role === 'engineer' ? (
            <>
              <QuickAction icon={Headphones} label="Browse Jobs" onClick={() => navigate('/sessions')} primary />
              <QuickAction icon={MessageCircle} label="Messages" onClick={() => navigate('/engineer-crm?tab=messages')} />
              <QuickAction icon={DollarSign} label="Earnings" onClick={() => navigate('/engineer-crm?tab=earnings')} />
            </>
          ) : role === 'producer' ? (
            <>
              <QuickAction icon={Upload} label="Upload Beat" onClick={() => navigate('/prime-beat-forge')} primary />
              <QuickAction icon={Music} label="Sessions" onClick={() => navigate('/sessions')} />
              <QuickAction icon={MessageCircle} label="Messages" onClick={() => navigate('/producer-crm?tab=messages')} />
            </>
          ) : (
            <>
              <QuickAction icon={Plus} label="Post Session" onClick={() => navigate('/create-session')} primary />
              <QuickAction icon={Users} label="Find Engineer" onClick={() => navigate('/engineers')} />
              <QuickAction icon={MessageCircle} label="Messages" onClick={() => navigate('/artist-crm?tab=messages')} />
            </>
          )}
        </motion.div>

        {/* ─── Session Feed ─── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold flex items-center gap-2">
              {role === 'engineer' ? (
                <><Sparkles className="w-4 h-4 text-primary" /> Open Sessions</>
              ) : (
                <><Users className="w-4 h-4 text-primary" /> Your Sessions</>
              )}
            </h2>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-8" onClick={() => navigate('/sessions')}>
              See All <ChevronRight className="w-3 h-3 ml-0.5" />
            </Button>
          </div>

          {sessionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : !openSessions || openSessions.length === 0 ? (
            <Card className="p-8 text-center bg-card/50 border-border/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Headphones className="w-8 h-8 text-primary/40" />
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {role === 'engineer'
                    ? "The studio's quiet... sessions will drop soon"
                    : "Post your first session and find an engineer"}
                </p>
                {role === 'artist' && (
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground h-10 px-6"
                    onClick={() => navigate('/create-session')}
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Post Session
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <AnimatePresence>
              <div className="space-y-3">
                {openSessions.slice(0, 5).map((session) => (
                  <MobileSessionCard key={session.id} session={session} />
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>

        {/* ─── My Applications (Engineers) ─── */}
        {role === 'engineer' && myApps && myApps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
              <Send className="w-4 h-4 text-accent-foreground" />
              Your Applications
              <Badge variant="secondary" className="text-[10px]">{myApps.length}</Badge>
            </h2>
            <div className="space-y-2">
              {myApps.slice(0, 3).map((app: any) => {
                const session = app.collaboration_sessions;
                const host = session?.profiles;
                return (
                  <Card
                    key={app.id}
                    className="p-3 bg-card/50 border-border/30 active:bg-card/80 touch-manipulation cursor-pointer"
                    onClick={() => navigate(`/session/${app.session_id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9">
                        <AvatarImage src={host?.avatar_url} />
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          {(host?.full_name || 'A').charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{session?.title || 'Session'}</p>
                        <p className="text-xs text-muted-foreground">{host?.full_name || 'Artist'}</p>
                      </div>
                      <Badge className={
                        app.status === 'accepted'
                          ? 'bg-primary/15 text-primary border-primary/30 text-[10px]'
                          : 'bg-muted text-muted-foreground border-border text-[10px]'
                      }>
                        {app.status === 'accepted' ? 'Accepted!' : 'Pending'}
                      </Badge>
                    </div>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Quick Action Button ──────────────────────────────────────
function QuickAction({
  icon: Icon,
  label,
  onClick,
  primary = false,
}: {
  icon: typeof Plus;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl
        transition-colors touch-manipulation
        ${primary
          ? 'bg-primary/10 border border-primary/20'
          : 'bg-card/50 border border-border/30'
        }
      `}
    >
      <Icon className={`w-5 h-5 ${primary ? 'text-primary' : 'text-muted-foreground'}`} />
      <span className={`text-xs font-medium ${primary ? 'text-primary' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </motion.button>
  );
}
