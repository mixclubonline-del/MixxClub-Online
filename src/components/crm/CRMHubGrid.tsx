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
  userType: 'artist' | 'engineer' | 'producer' | 'fan';
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
  ],
  producer: [
    { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'Your beat empire' },
    { id: 'catalog', label: 'Catalog', icon: Disc3, description: 'Your beat library' },
    { id: 'sales', label: 'Sales', icon: ShoppingBag, description: 'Transaction history' },
    { id: 'collabs', label: 'Collabs', icon: Users, description: 'Artist connections' },
    { id: 'revenue', label: 'Revenue', icon: TrendingUp, description: 'Earnings analytics' },
    { id: 'community', label: 'Community', icon: Users, description: 'Producer network' },
    { id: 'profile', label: 'Brand Hub', icon: User, description: 'Your identity' },
  ],
  fan: [
    { id: 'feed', label: 'Feed', icon: Compass, description: 'Discover new music' },
    { id: 'day1s', label: 'Day 1s', icon: Star, description: 'Your early supports' },
    { id: 'missions', label: 'Missions', icon: Target, description: 'Earn MixxCoinz' },
    { id: 'wallet', label: 'Wallet', icon: Coins, description: 'Your rewards' },
    { id: 'curator', label: 'Curator', icon: Sparkles, description: 'Playlist power' },
    { id: 'favorites', label: 'Favorites', icon: Heart, description: 'Saved music' },
  ],
};

export const CRMHubGrid: React.FC<CRMHubGridProps> = ({
  userType,
  onHubSelect,
  quickActions,
}) => {
  const isMobile = useIsMobile();
  
  // Get role-specific hubs
  const hubs = useMemo(() => {
    return ROLE_HUB_DEFINITIONS[userType] || ROLE_HUB_DEFINITIONS.artist;
  }, [userType]);

  return (
    <div className="space-y-8">
      {/* Quick Actions Row */}
      <motion.div
        className={cn(
          "backdrop-blur-xl bg-background/30 border border-border/40 rounded-2xl p-5",
          "shadow-lg"
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Quick Actions</h3>
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
                "gap-2 backdrop-blur-md bg-background/40 hover:bg-primary/20 border-border/50",
                "transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20",
                isMobile ? "flex-1" : ""
              )}
            >
              {action.icon}
              <span className="text-sm">{action.label}</span>
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Hub Modules Grid */}
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
            icon={<hub.icon className="h-6 w-6" />}
            onClick={() => onHubSelect(hub.id)}
            delay={index * 0.05}
            userType={userType}
          />
        ))}
      </div>
    </div>
  );
};
