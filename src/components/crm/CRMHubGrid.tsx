import React, { ReactNode, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  Users,
  Briefcase,
  Headphones,
  TrendingUp,
  Target,
  MessageSquare,
  Handshake,
  User,
  Music,
  ShoppingBag,
  Sparkles,
  Search,
  Disc3,
  Compass,
  Star,
  Coins,
  Heart,
  Triangle,
  Lock,
  Bell,
  MessageCircle,
  Trophy,
  Calendar,
  Brain,
  Rocket,
  Inbox,
  Shield,
  Megaphone,
  BarChart3,
  Flame,
  Camera,
  FileText,
  Flag,
  ToggleLeft,
  Navigation,
  LayoutTemplate,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CRMHubModule } from './CRMHubModule';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { isStarterHub } from '@/config/starterFeatures';
import { toast } from 'sonner';

interface HubDefinition {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

interface CRMHubGridProps {
  userType: 'artist' | 'engineer' | 'producer' | 'fan' | 'admin';
  onHubSelect: (hubId: string) => void;
  quickActions: Array<{
    label: string;
    icon: ReactNode;
    onClick: () => void;
    variant?: 'default' | 'outline';
  }>;
}

// Role-specific hub definitions
const ROLE_HUB_DEFINITIONS: Record<string, HubDefinition[]> = {
  artist: [
    { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'Overview & momentum' },
    { id: 'music', label: 'Music', icon: Music, description: 'Your catalog' },
    { id: 'mastering', label: 'AI Mastering', icon: Sparkles, description: 'Master your tracks' },
    { id: 'clients', label: 'Clients', icon: Users, description: 'Contact management' },
    { id: 'matches', label: 'AI Matches', icon: Sparkles, description: 'Smart connections' },
    { id: 'sessions', label: 'Sessions', icon: Headphones, description: 'Portfolio & history' },
    { id: 'opportunities', label: 'Opportunities', icon: Search, description: 'Gig marketplace' },
    { id: 'active-work', label: 'Active Work', icon: Briefcase, description: 'Current projects' },
    { id: 'revenue', label: 'Revenue', icon: TrendingUp, description: 'Analytics & streams' },
    { id: 'community', label: 'Community', icon: Users, description: 'Network & grow' },
    { id: 'growth', label: 'Growth', icon: Target, description: 'Career coaching' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, description: 'Communications' },
    { id: 'earnings', label: 'Earnings', icon: Handshake, description: 'Collaborative pay' },
    { id: 'store', label: 'Store', icon: ShoppingBag, description: 'Merch & products' },
    { id: 'profile', label: 'Brand Hub', icon: User, description: 'Your identity' },
    { id: 'tri-collabs', label: '3-Way Collabs', icon: Triangle, description: 'Tri partnerships' },
    { id: 'notifications', label: 'Alerts', icon: Bell, description: 'Updates & notifications' },
    { id: 'schedule', label: 'Schedule', icon: Calendar, description: 'Calendar & deadlines' },
  ],
  engineer: [
    { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'Business control center' },
    { id: 'sessions', label: 'Sessions', icon: Headphones, description: 'Portfolio & history' },
    { id: 'mastering', label: 'AI Mastering', icon: Sparkles, description: 'Master your tracks' },
    { id: 'clients', label: 'Clients', icon: Users, description: 'Contact management' },
    { id: 'matches', label: 'AI Matches', icon: Sparkles, description: 'Smart connections' },
    { id: 'opportunities', label: 'Opportunities', icon: Search, description: 'Gig marketplace' },
    { id: 'active-work', label: 'Active Work', icon: Briefcase, description: 'Current projects' },
    { id: 'music', label: 'Music', icon: Music, description: 'Your catalog' },
    { id: 'revenue', label: 'Revenue', icon: TrendingUp, description: 'Earnings analytics' },
    { id: 'community', label: 'Community', icon: Users, description: 'Engineer network' },
    { id: 'growth', label: 'Growth', icon: Target, description: 'Career coaching' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, description: 'Communications' },
    { id: 'earnings', label: 'Earnings', icon: Handshake, description: 'Collaborative pay' },
    { id: 'store', label: 'Store', icon: ShoppingBag, description: 'Merch & products' },
    { id: 'profile', label: 'Brand Hub', icon: User, description: 'Your identity' },
    { id: 'tri-collabs', label: '3-Way Collabs', icon: Triangle, description: 'Tri partnerships' },
    { id: 'notifications', label: 'Alerts', icon: Bell, description: 'Updates & notifications' },
    { id: 'schedule', label: 'Schedule', icon: Calendar, description: 'Calendar & deadlines' },
  ],
  producer: [
    { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'Your beat empire' },
    { id: 'catalog', label: 'Catalog', icon: Disc3, description: 'Your beat library' },
    { id: 'mastering', label: 'AI Mastering', icon: Sparkles, description: 'Master your tracks' },
    { id: 'clients', label: 'Clients', icon: Users, description: 'Artist connections' },
    { id: 'matches', label: 'AI Matches', icon: Sparkles, description: 'Smart connections' },
    { id: 'sessions', label: 'Sessions', icon: Headphones, description: 'Studio sessions' },
    { id: 'active-work', label: 'Active Work', icon: Briefcase, description: 'Current projects' },
    { id: 'sales', label: 'Sales', icon: ShoppingBag, description: 'Transaction history' },
    { id: 'collabs', label: 'Collabs', icon: Users, description: 'Collaborations' },
    { id: 'revenue', label: 'Revenue', icon: TrendingUp, description: 'Earnings analytics' },
    { id: 'community', label: 'Community', icon: Users, description: 'Producer network' },
    { id: 'growth', label: 'Growth', icon: Target, description: 'Career coaching' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, description: 'Communications' },
    { id: 'earnings', label: 'Earnings', icon: Handshake, description: 'Collaborative pay' },
    { id: 'profile', label: 'Brand Hub', icon: User, description: 'Your identity' },
    { id: 'tri-collabs', label: '3-Way Collabs', icon: Triangle, description: 'Tri partnerships' },
    { id: 'notifications', label: 'Alerts', icon: Bell, description: 'Updates & notifications' },
    { id: 'schedule', label: 'Schedule', icon: Calendar, description: 'Calendar & deadlines' },
  ],
  fan: [
    { id: 'feed', label: 'Discover', icon: Compass, description: 'AI-curated artist feed' },
    { id: 'day1s', label: 'Day 1s', icon: Star, description: 'Your early supports' },
    { id: 'communities', label: 'Communities', icon: Users, description: 'Circles & events' },
    { id: 'drops', label: 'Drops', icon: Bell, description: 'Releases & alerts' },
    { id: 'connect', label: 'Connect', icon: MessageCircle, description: 'DM & vote' },
    { id: 'missions', label: 'Missions', icon: Target, description: 'Earn MixxCoinz' },
    { id: 'wallet', label: 'Wallet', icon: Coins, description: 'Your rewards' },
    { id: 'trophies', label: 'Trophies', icon: Trophy, description: 'Achievements' },
    { id: 'curator', label: 'Curator', icon: Sparkles, description: 'Playlist power' },
  ],
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'Platform overview' },
    { id: 'users', label: 'Users', icon: Users, description: 'User management' },
    { id: 'support', label: 'Support', icon: Inbox, description: 'Inbox & replies' },
    { id: 'sessions', label: 'Sessions', icon: Headphones, description: 'All sessions' },
    { id: 'revenue', label: 'Revenue', icon: TrendingUp, description: 'Payments & payouts' },
    { id: 'partnerships', label: 'Partnerships', icon: Handshake, description: 'Health & splits' },
    { id: 'content', label: 'Content', icon: Briefcase, description: 'Files & beats' },
    { id: 'moderation', label: 'Moderation', icon: Flag, description: 'Reports & queue' },
    { id: 'features', label: 'Features', icon: ToggleLeft, description: 'Feature flags' },
    { id: 'community', label: 'Community', icon: Users, description: 'Activity & battles' },
    { id: 'broadcast', label: 'Broadcast', icon: Megaphone, description: 'Announcements' },
    { id: 'audit', label: 'Audit Log', icon: Shield, description: 'Security timeline' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Funnels & cohorts' },
    { id: 'assets', label: 'Assets', icon: Star, description: 'Dream Engine assets' },
    { id: 'system', label: 'System', icon: Target, description: 'Seeding & security' },
    { id: 'prime', label: 'Prime Brain', icon: Brain, description: 'AI command center' },
    { id: 'promo', label: 'Promo Studio', icon: Rocket, description: 'Campaign engine' },
    { id: 'launch', label: 'Launch', icon: Flame, description: 'First 100 war room' },
    { id: 'screenshots', label: 'Screenshots', icon: Camera, description: 'Route capture tool' },
    { id: 'page-editor', label: 'Page Editor', icon: FileText, description: 'Edit site content' },
    { id: 'nav-editor', label: 'Navigation', icon: Navigation, description: 'Menu & link editor' },
    { id: 'landing-builder', label: 'Page Builder', icon: LayoutTemplate, description: 'Block-based pages' },
  ],
};

// Role-specific quick action accent map
const QUICK_ACTION_ACCENTS: Record<string, string> = {
  artist: 'hover:bg-purple-500/20 hover:border-purple-500/40 hover:shadow-purple-500/20',
  engineer: 'hover:bg-orange-500/20 hover:border-orange-500/40 hover:shadow-orange-500/20',
  producer: 'hover:bg-yellow-500/20 hover:border-yellow-500/40 hover:shadow-yellow-500/20',
  fan: 'hover:bg-pink-500/20 hover:border-pink-500/40 hover:shadow-pink-500/20',
  admin: 'hover:bg-cyan-500/20 hover:border-cyan-500/40 hover:shadow-cyan-500/20',
};

export const CRMHubGrid: React.FC<CRMHubGridProps> = ({
  userType,
  onHubSelect,
  quickActions,
}) => {
  const isMobile = useIsMobile();
  const accentClasses = QUICK_ACTION_ACCENTS[userType] || QUICK_ACTION_ACCENTS.artist;

  // Get role-specific hubs
  const hubs = useMemo(() => {
    return ROLE_HUB_DEFINITIONS[userType] || ROLE_HUB_DEFINITIONS.artist;
  }, [userType]);

  const handleHubClick = (hubId: string) => {
    if (isStarterHub(userType, hubId)) {
      onHubSelect(hubId);
    } else {
      toast('🔒 This feature is locked', {
        description: 'Help grow the community or upgrade your plan to unlock it.',
        action: {
          label: 'View Unlockables',
          onClick: () => onHubSelect('dashboard'),
        },
      });
    }
  };

  return (
    <div className="space-y-8" data-mg-role={userType}>
      {/* Quick Actions Row — MixxGlass */}
      <motion.div
        className="mg-panel p-5"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center backdrop-blur-md border border-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground text-sm tracking-wide uppercase">Quick Actions</h3>
        </div>
        <div className={cn(
          "flex gap-3",
          isMobile ? "flex-wrap" : "flex-row"
        )}>
          {quickActions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              variant={action.variant || 'outline'}
              className={cn(
                "gap-2 backdrop-blur-xl bg-white/5 border-white/10",
                "transition-all duration-400 hover:scale-[1.03] hover:shadow-lg",
                accentClasses,
                isMobile ? "flex-1" : ""
              )}
            >
              {action.icon}
              <span className="text-sm">{action.label}</span>
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Hub Modules Grid — MixxGlass */}
      <div className={cn(
        "mg-grid-bg grid gap-4",
        isMobile ? "grid-cols-2" : "grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      )}>
        {hubs.map((hub, index) => {
          const unlocked = isStarterHub(userType, hub.id);
          return (
            <div key={hub.id} className="relative">
              <CRMHubModule
                hubId={hub.id}
                label={hub.label}
                description={unlocked ? hub.description : 'Locked'}
                icon={unlocked ? <hub.icon className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                onClick={() => handleHubClick(hub.id)}
                delay={index * 0.04}
                userType={userType}
              />
              {/* Lock overlay for gated hubs */}
              {!unlocked && (
                <div className="absolute inset-0 rounded-2xl bg-black/40 backdrop-blur-[2px] flex items-center justify-center pointer-events-none z-10">
                  <div className="flex flex-col items-center gap-1">
                    <Lock className="h-5 w-5 text-muted-foreground/70" />
                    <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">Unlock</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
