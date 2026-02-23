/**
 * ProactivePrimeBot - Role-specific AI guide with proactive nudges and daily briefings
 * Uses Jax (Artist), Rell (Engineer), Tempo (Producer), or Nova (Fan) based on role
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  X,
  Bell,
  TrendingUp,
  Trophy,
  MessageCircle,
  ArrowRight,
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { getCharacter, getRandomQuote, ENTRY_POINT_CHARACTERS, type CharacterId } from '@/config/characters';

interface ProactiveInsight {
  id: string;
  type: 'briefing' | 'nudge' | 'celebration' | 'opportunity';
  title: string;
  message: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  priority: 'high' | 'medium' | 'low';
}

interface ProactivePrimeBotProps {
  userType: 'artist' | 'engineer' | 'producer' | 'fan';
  onNavigate?: (path: string) => void;
}

export const ProactivePrimeBot = ({ userType, onNavigate }: ProactivePrimeBotProps) => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<ProactiveInsight[]>([]);
  const [currentInsight, setCurrentInsight] = useState<ProactiveInsight | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasShownBriefing, setHasShownBriefing] = useState(false);

  // Get role-specific AI guide
  const guide = useMemo(() => {
    const characterId = ENTRY_POINT_CHARACTERS[userType as keyof typeof ENTRY_POINT_CHARACTERS] || 'jax';
    return getCharacter(characterId);
  }, [userType]);

  // Get a personalized quote from the guide
  const guideQuote = useMemo(() => {
    const characterId = ENTRY_POINT_CHARACTERS[userType as keyof typeof ENTRY_POINT_CHARACTERS] || 'jax';
    return getRandomQuote(characterId);
  }, [userType]);

  // Check last login and activity
  useEffect(() => {
    if (user && !hasShownBriefing) {
      generateProactiveInsights();
    }
  }, [user, hasShownBriefing]);

  const generateProactiveInsights = async () => {
    if (!user) return;

    const newInsights: ProactiveInsight[] = [];

    try {
      // Check for new opportunities
      const { data: jobs } = await supabase
        .from('job_postings')
        .select('id, title')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(3);

      // Check for unread messages
      const { data: messages } = await supabase
        .from('direct_messages')
        .select('id')
        .eq('recipient_id', user.id)
        .is('read_at', null);

      // Check active projects needing attention
      let projectQuery;
      if (userType === 'artist') {
        projectQuery = supabase.from('projects').select('id, title, status').eq('client_id', user.id).eq('status', 'in_progress');
      } else if (userType === 'engineer') {
        projectQuery = supabase.from('projects').select('id, title, status').eq('engineer_id', user.id).eq('status', 'in_progress');
      } else if (userType === 'producer') {
        projectQuery = supabase.from('producer_beats').select('id, title, status').eq('producer_id', user.id).eq('status', 'active');
      } else {
        // Fan - no active projects, just skip
        projectQuery = null;
      }

      const { data: activeProjects } = projectQuery ? await projectQuery : { data: [] };

      // Check streak data
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .eq('streak_type', 'daily_login')
        .maybeSingle();

      // Check recent achievements
      const { data: recentAchievements } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false })
        .limit(1);

      // Generate Morning Briefing
      const hour = new Date().getHours();
      const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

      newInsights.push({
        id: 'daily-briefing',
        type: 'briefing',
        title: `${greeting}, Creator! 🎵`,
        message: `You have ${messages?.length || 0} unread messages, ${activeProjects?.length || 0} active projects, and ${jobs?.length || 0} new opportunities match your style.`,
        action: {
          label: 'View Dashboard',
          href: '?tab=overview'
        },
        priority: 'high'
      });

      // Opportunity Nudge
      if (jobs && jobs.length > 0) {
        newInsights.push({
          id: 'new-opportunities',
          type: 'opportunity',
          title: 'Hot Opportunities! 🔥',
          message: `${jobs.length} new ${userType === 'engineer' ? 'gigs' :
              userType === 'producer' ? 'beat requests' :
                userType === 'fan' ? 'discoveries' :
                  'collaboration requests'
            } just dropped. "${jobs[0].title}" looks perfect for you.`,
          action: {
            label: 'Check Them Out',
            href: '?tab=opportunities'
          },
          priority: 'high'
        });
      }

      // Streak Celebration
      if (streakData && streakData.current_count > 1) {
        newInsights.push({
          id: 'streak-celebration',
          type: 'celebration',
          title: `${streakData.current_count} Day Streak! 🔥`,
          message: `You're on fire! Keep the momentum going. Your longest streak is ${streakData.longest_count} days.`,
          priority: 'medium'
        });
      }

      // Achievement Celebration
      if (recentAchievements && recentAchievements.length > 0) {
        const achievement = recentAchievements[0];
        const earnedDate = new Date(achievement.earned_at);
        const hoursSinceEarned = (Date.now() - earnedDate.getTime()) / (1000 * 60 * 60);

        if (hoursSinceEarned < 24) {
          newInsights.push({
            id: 'achievement-celebration',
            type: 'celebration',
            title: 'Achievement Unlocked! 🏆',
            message: `Congrats on earning "${achievement.title}"! You're building your legacy.`,
            priority: 'high'
          });
        }
      }

      // Inactivity Nudge - Check last activity
      const { data: lastActivity } = await supabase
        .from('activity_feed')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (lastActivity && lastActivity.length > 0) {
        const lastActiveDate = new Date(lastActivity[0].created_at);
        const daysSinceActive = (Date.now() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceActive > 3) {
          newInsights.push({
            id: 'inactivity-nudge',
            type: 'nudge',
            title: 'We Miss You! 💜',
            message: `It's been ${Math.floor(daysSinceActive)} days since your last session. The culture needs your sound.`,
            action: {
              label: 'Get Back In',
              href: '?tab=opportunities'
            },
            priority: 'medium'
          });
        }
      }

      // Unread Messages Nudge
      if (messages && messages.length > 0) {
        newInsights.push({
          id: 'unread-messages',
          type: 'nudge',
          title: 'Messages Waiting! 💬',
          message: `You have ${messages.length} unread ${messages.length === 1 ? 'message' : 'messages'}. Don't leave collaborators hanging!`,
          action: {
            label: 'View Messages',
            href: '?tab=messages'
          },
          priority: 'high'
        });
      }

      // --- CORE LOOP INSIGHTS (Phase 4: Prime Brain Intelligence) ---

      // New Matches Waiting for Contact
      const { data: pendingMatches } = await supabase
        .from('user_matches')
        .select('id, matched_user_id')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .limit(5);

      if (pendingMatches && pendingMatches.length > 0) {
        newInsights.push({
          id: 'pending-matches',
          type: 'opportunity',
          title: `${pendingMatches.length} New Match${pendingMatches.length > 1 ? 'es' : ''}! 🎯`,
          message: `${pendingMatches.length} ${userType === 'artist' ? 'engineers match your style' :
              userType === 'engineer' ? 'artists need your skills' :
                'creators are waiting to connect'
            }. Don't let these connections slip away.`,
          action: {
            label: 'View Matches',
            href: '?tab=matches'
          },
          priority: 'high'
        });
      }

      // Session Invitations Waiting
      const { data: sessionInvites } = await supabase
        .from('session_participants')
        .select('session_id')
        .eq('user_id', user.id)
        .eq('status', 'invited');

      if (sessionInvites && sessionInvites.length > 0) {
        newInsights.push({
          id: 'session-invitations',
          type: 'opportunity',
          title: `${sessionInvites.length} Session Invite${sessionInvites.length > 1 ? 's' : ''}! 🎙️`,
          message: `You've been invited to ${sessionInvites.length} collaboration ${sessionInvites.length === 1 ? 'session' : 'sessions'}. Someone chose you — show them why.`,
          action: {
            label: 'View Sessions',
            href: '?tab=sessions'
          },
          priority: 'high'
        });
      }

      // Deliverables Awaiting Review (for artists/producers)
      if (userType === 'artist' || userType === 'producer') {
        const { data: pendingDeliverables } = await supabase
          .from('engineer_deliverables')
          .select('id, file_name, delivery_type')
          .eq('status', 'submitted')
          .limit(5);

        if (pendingDeliverables && pendingDeliverables.length > 0) {
          newInsights.push({
            id: 'pending-deliverables',
            type: 'nudge',
            title: `${pendingDeliverables.length} Mix${pendingDeliverables.length > 1 ? 'es' : ''} Ready for Review! 🎧`,
            message: `Your engineer submitted ${pendingDeliverables.length === 1 ? `"${pendingDeliverables[0].file_name}"` : `${pendingDeliverables.length} files`}. Review and approve to keep the project moving.`,
            action: {
              label: 'Review Now',
              href: '?tab=sessions'
            },
            priority: 'high'
          });
        }
      }

      // Community Unlock Progress Nudge
      const { data: nextUnlock } = await supabase
        .from('unlockables')
        .select('name, current_value, target_value')
        .eq('is_unlocked', false)
        .eq('unlock_type', 'community')
        .order('tier', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (nextUnlock) {
        const remaining = nextUnlock.target_value - nextUnlock.current_value;
        const progress = Math.round((nextUnlock.current_value / nextUnlock.target_value) * 100);
        if (progress >= 70) {
          newInsights.push({
            id: 'unlock-progress',
            type: 'nudge',
            title: `${progress}% to ${nextUnlock.name}! 🔓`,
            message: `The community is ${remaining} ${remaining === 1 ? 'action' : 'actions'} away from unlocking ${nextUnlock.name}. Every session counts.`,
            action: {
              label: 'View Progress',
              href: '/unlockables'
            },
            priority: progress >= 90 ? 'high' : 'medium'
          });
        }
      }

      setInsights(newInsights);

      // Show first high-priority insight after a short delay
      if (newInsights.length > 0) {
        const highPriority = newInsights.find(i => i.priority === 'high') || newInsights[0];
        setTimeout(() => {
          setCurrentInsight(highPriority);
          setIsVisible(true);
          setHasShownBriefing(true);
        }, 2000);
      }

    } catch (error) {
      console.error('Error generating proactive insights:', error);
    }
  };

  const dismissInsight = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      // Show next insight if available
      const remainingInsights = insights.filter(i => i.id !== currentInsight?.id);
      if (remainingInsights.length > 0 && !isDismissed) {
        const nextInsight = remainingInsights.find(i => i.priority === 'high') || remainingInsights[0];
        setCurrentInsight(nextInsight);
        setInsights(remainingInsights);
        setTimeout(() => setIsVisible(true), 500);
      } else {
        setCurrentInsight(null);
      }
    }, 300);
  }, [insights, currentInsight, isDismissed]);

  const dismissAll = useCallback(() => {
    setIsDismissed(true);
    setIsVisible(false);
    setCurrentInsight(null);
  }, []);

  const handleAction = useCallback(() => {
    if (currentInsight?.action) {
      if (currentInsight.action.onClick) {
        currentInsight.action.onClick();
      } else if (currentInsight.action.href && onNavigate) {
        onNavigate(currentInsight.action.href);
      }
    }
    dismissInsight();
  }, [currentInsight, onNavigate, dismissInsight]);

  const getInsightIcon = (type: ProactiveInsight['type']) => {
    switch (type) {
      case 'briefing': return <Bell className="w-5 h-5" />;
      case 'nudge': return <MessageCircle className="w-5 h-5" />;
      case 'celebration': return <Trophy className="w-5 h-5" />;
      case 'opportunity': return <TrendingUp className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const getInsightGradient = (type: ProactiveInsight['type']) => {
    switch (type) {
      case 'briefing': return 'from-blue-500/20 to-purple-500/20 border-blue-500/30';
      case 'nudge': return 'from-orange-500/20 to-yellow-500/20 border-orange-500/30';
      case 'celebration': return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
      case 'opportunity': return 'from-primary/20 to-accent/20 border-primary/30';
      default: return 'from-primary/20 to-accent/20 border-primary/30';
    }
  };

  if (!currentInsight || isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-24 right-6 z-50 max-w-sm"
        >
          <Card
            className="backdrop-blur-xl border shadow-2xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${guide.accentColor}20, ${guide.accentColor}10)`,
              borderColor: `${guide.accentColor}40`
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-full overflow-hidden"
                    style={{ boxShadow: `0 0 12px ${guide.accentColor}` }}
                  >
                    <img
                      src={guide.avatarPath}
                      alt={guide.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold">{guide.name}</p>
                  <p className="text-xs text-muted-foreground">{guide.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                  className="h-8 w-8 p-0"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={dismissAll}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-background/50">
                  {getInsightIcon(currentInsight.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm">{currentInsight.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{currentInsight.message}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {currentInsight.action && (
                  <Button
                    onClick={handleAction}
                    size="sm"
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {currentInsight.action.label}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={dismissInsight}
                  className="flex-1"
                >
                  Later
                </Button>
              </div>

              {/* Insights Counter */}
              {insights.length > 1 && (
                <div className="flex justify-center gap-1 pt-2">
                  {insights.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-colors ${insights.indexOf(currentInsight) === idx ? 'bg-primary' : 'bg-muted'
                        }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
