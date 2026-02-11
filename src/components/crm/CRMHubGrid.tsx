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
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CRMHubModule } from './CRMHubModule';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

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
    { id: 'music', label: 'Music', icon: Music, description: 'Your catalog' },
    { id: 'store', label: 'Store', icon: ShoppingBag, description: 'Merch & products' },
    { id: 'profile', label: 'Brand Hub', icon: User, description: 'Your identity' },
    { id: 'tri-collabs', label: '3-Way Collabs', icon: Triangle, description: 'Tri partnerships' },
  ],
  engineer: [
    { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'Business control center' },
    { id: 'clients', label: 'Clients', icon: Users, description: 'Contact management' },
    { id: 'matches', label: 'AI Matches', icon: Sparkles, description: 'Smart connections' },
    { id: 'sessions', label: 'Sessions', icon: Headphones, description: 'Portfolio & history' },
    { id: 'opportunities', label: 'Opportunities', icon: Search, description: 'Gig marketplace' },
    { id: 'active-work', label: 'Active Work', icon: Briefcase, description: 'Current projects' },
    { id: 'revenue', label: 'Revenue', icon: TrendingUp, description: 'Earnings analytics' },
    { id: 'community', label: 'Community', icon: Users, description: 'Engineer network' },
    { id: 'growth', label: 'Growth', icon: Target, description: 'Career coaching' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, description: 'Communications' },
    { id: 'earnings', label: 'Earnings', icon: Handshake, description: 'Collaborative pay' },
    { id: 'profile', label: 'Brand Hub', icon: User, description: 'Your identity' },
    { id: 'tri-collabs', label: '3-Way Collabs', icon: Triangle, description: 'Tri partnerships' },
  ],
  producer: [
    { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'Your beat empire' },
    { id: 'catalog', label: 'Catalog', icon: Disc3, description: 'Your beat library' },
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
  ],
  fan: [
    { id: 'feed', label: 'Feed', icon: Compass, description: 'Discover new music' },
    { id: 'day1s', label: 'Day 1s', icon: Star, description: 'Your early supports' },
    { id: 'missions', label: 'Missions', icon: Target, description: 'Earn MixxCoinz' },
    { id: 'wallet', label: 'Wallet', icon: Coins, description: 'Your rewards' },
    { id: 'curator', label: 'Curator', icon: Sparkles, description: 'Playlist power' },
    { id: 'favorites', label: 'Favorites', icon: Heart, description: 'Saved music' },
  ],
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'Platform overview' },
    { id: 'users', label: 'Users', icon: Users, description: 'User management' },
    { id: 'sessions', label: 'Sessions', icon: Headphones, description: 'All sessions' },
    { id: 'revenue', label: 'Revenue', icon: TrendingUp, description: 'Payments & payouts' },
    { id: 'content', label: 'Content', icon: Briefcase, description: 'Files & beats' },
    { id: 'community', label: 'Community', icon: Users, description: 'Activity & battles' },
    { id: 'assets', label: 'Assets', icon: Star, description: 'Dream Engine assets' },
    { id: 'system', label: 'System', icon: Target, description: 'Seeding & security' },
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

  return (
    <div className="space-y-8">
      {/* Quick Actions Row — Glassmorphic */}
      <motion.div
        className={cn(
          "backdrop-blur-2xl rounded-2xl p-5",
          "shadow-xl"
        )}
        style={{
          background: 'rgba(var(--background-rgb, 0, 0, 0), 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 32px -8px rgba(0,0,0,0.4)',
        }}
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

      {/* Hub Modules Grid — Responsive with whileInView */}
      <div className={cn(
        "grid gap-4",
        isMobile ? "grid-cols-2" : "grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      )}>
        {hubs.map((hub, index) => (
          <CRMHubModule
            key={hub.id}
            hubId={hub.id}
            label={hub.label}
            description={hub.description}
            icon={<hub.icon className="h-5 w-5" />}
            onClick={() => onHubSelect(hub.id)}
            delay={index * 0.04}
            userType={userType}
          />
        ))}
      </div>
    </div>
  );
};
