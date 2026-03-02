/**
 * MobileHome — The Morning Feed
 * 
 * This is what you see when you unlock your phone and open MixxClub.
 * Not a dashboard. Not charts. A FEED.
 * 
 * Philosophy: "Group chat, group messages — everybody wrapped around 
 * like being on the phone at the same time."
 * 
 * For engineers: "3 artists need mixes" → tap → jump in
 * For artists: "2 engineers applied to your session" → tap → accept
 * For fans: "Live session happening now" → tap → watch
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Plus, Headphones, DollarSign, TrendingUp,
  Radio, Users, MessageCircle, Bell, Zap, Music, Send,
  ChevronRight, Loader2, Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useOpenSessions,
  useMyApplications,
  useSessionMarketplaceStats,
} from '@/hooks/useSessionMarketplace';
import { MobileSessionCard } from '@/components/mobile/MobileSessionCard';

export default function MobileHome() {
  const { user, activeRole } = useAuth();
  const navigate = useNavigate();

  // Real data — no demo
  const { data: openSessions, isLoading: sessionsLoading } = useOpenSessions();
  const { data: stats } = useSessionMarketplaceStats();
  const { data: myApps } = useMyApplications();

  if (!user) {
    navigate('/auth');
    return null;
  }

  const isEngineer = activeRole === 'engineer';
  const isArtist = activeRole === 'artist';
  const isProducer = activeRole === 'producer';
  const isFan = activeRole === 'fan';

  const pendingApps = (myApps || []).filter((a: any) => a.status === 'applied');
  const acceptedApps = (myApps || []).filter((a: any) => a.status === 'accepted');

  return (
    <div className="min-h-screen bg-background pb-24 overflow-y-auto touch-manipulation">
      {/* ─── Header ─── */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/20">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">
              MixxClub
            </h1>
            <p className="text-xs text-muted-foreground">
              {isEngineer && 'Engineer Mode'}
              {isArtist && 'Artist Mode'}
              {isProducer && 'Producer Mode'}
              {isFan && 'Fan Mode'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10"
              onClick={() => navigate('/notifications')}
            >
              <Bell className="w-5 h-5" />
            </Button>
            <Avatar
              className="w-8 h-8 cursor-pointer"
              onClick={() => navigate(isEngineer ? '/engineer-crm?tab=profile' : '/artist-crm?tab=profile')}
            >
              <AvatarImage src={(user as any)?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                {(user.email || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* ─── Morning Stat ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-green-500/10 via-card to-emerald-500/5 border-green-500/20 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Radio className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex-1">
                {isEngineer ? (
                  <>
                    <p className="text-2xl font-bold text-green-500">
                      {stats?.openSessions || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {stats?.openSessions === 1
                        ? 'artist needs a mix'
                        : 'artists need sessions mixed'}
                    </p>
                  </>
                ) : isArtist ? (
                  <>
                    <p className="text-2xl font-bold text-green-500">
                      {pendingApps.length + acceptedApps.length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      engineers responded to your sessions
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-green-500">
                      {stats?.openSessions || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      live sessions happening now
                    </p>
                  </>
                )}
              </div>
              {stats && stats.matchedToday > 0 && (
                <Badge className="bg-green-500/15 text-green-400 border-green-500/30 text-[10px]">
                  <Zap className="w-3 h-3 mr-0.5" />
                  {stats.matchedToday} matched
                </Badge>
              )}
            </div>
          </Card>
        </motion.div>

        {/* ─── Quick Actions ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-3 gap-3"
        >
          {isEngineer ? (
            <>
              <QuickAction
                icon={Headphones}
                label="Browse"
                onClick={() => navigate('/sessions')}
              />
              <QuickAction
                icon={MessageCircle}
                label="Messages"
                onClick={() => navigate('/engineer-crm?tab=messages')}
              />
              <QuickAction
                icon={DollarSign}
                label="Earnings"
                onClick={() => navigate('/engineer-crm?tab=earnings')}
              />
            </>
          ) : isArtist ? (
            <>
              <QuickAction
                icon={Plus}
                label="Post Session"
                onClick={() => navigate('/create-session')}
                primary
              />
              <QuickAction
                icon={Users}
                label="Find Engineer"
                onClick={() => navigate('/engineers')}
              />
              <QuickAction
                icon={MessageCircle}
                label="Messages"
                onClick={() => navigate('/artist-crm?tab=messages')}
              />
            </>
          ) : (
            <>
              <QuickAction
                icon={Radio}
                label="Live"
                onClick={() => navigate('/sessions')}
                primary
              />
              <QuickAction
                icon={Music}
                label="Discover"
                onClick={() => navigate('/community')}
              />
              <QuickAction
                icon={MessageCircle}
                label="Messages"
                onClick={() => navigate('/fan-hub')}
              />
            </>
          )}
        </motion.div>

        {/* ─── Session Feed ─── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold flex items-center gap-2">
              {isEngineer ? (
                <>
                  <Sparkles className="w-4 h-4 text-green-500" />
                  Open Sessions
                </>
              ) : isArtist ? (
                <>
                  <Users className="w-4 h-4 text-primary" />
                  Your Sessions
                </>
              ) : (
                <>
                  <Radio className="w-4 h-4 text-green-500" />
                  Happening Now
                </>
              )}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground h-8"
              onClick={() => navigate('/sessions')}
            >
              See All
              <ChevronRight className="w-3 h-3 ml-0.5" />
            </Button>
          </div>

          {sessionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : !openSessions || openSessions.length === 0 ? (
            <Card className="p-8 text-center bg-card/50 border-border/30">
              <Headphones className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                {isEngineer
                  ? 'No open sessions right now. Check back soon!'
                  : 'Post your first session and find an engineer.'}
              </p>
              {isArtist && (
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-10 px-6"
                  onClick={() => navigate('/create-session')}
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Post Session
                </Button>
              )}
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
        {isEngineer && myApps && myApps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-500" />
              Your Applications
              <Badge variant="secondary" className="text-[10px]">
                {myApps.length}
              </Badge>
            </h2>
            <div className="space-y-2">
              {myApps.slice(0, 3).map((app: any) => {
                const session = app.collaboration_sessions;
                const host = session?.profiles;
                return (
                  <Card
                    key={app.id}
                    className="p-3 bg-card/50 border-border/30 active:bg-card/80 touch-manipulation"
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
                        <p className="text-sm font-medium truncate">
                          {session?.title || 'Session'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {host?.full_name || 'Artist'}
                        </p>
                      </div>
                      <Badge
                        className={
                          app.status === 'accepted'
                            ? 'bg-green-500/15 text-green-400 border-green-500/30 text-[10px]'
                            : 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30 text-[10px]'
                        }
                      >
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

      {/* Bottom Nav */}
      <MobileBottomNav />
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
          ? 'bg-gradient-to-br from-green-500/15 to-emerald-500/10 border border-green-500/20'
          : 'bg-card/50 border border-border/30'
        }
      `}
    >
      <Icon className={`w-5 h-5 ${primary ? 'text-green-500' : 'text-muted-foreground'}`} />
      <span className={`text-xs font-medium ${primary ? 'text-green-500' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </motion.button>
  );
}
