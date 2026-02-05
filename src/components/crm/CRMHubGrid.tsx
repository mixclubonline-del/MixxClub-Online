import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Users, 
  Briefcase, 
  Headphones, 
  DollarSign, 
  TrendingUp, 
  Target, 
  MessageSquare,
  Handshake,
  User,
  Music,
  ShoppingBag,
  Sparkles,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CRMHubModule } from './CRMHubModule';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

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

const HUB_DEFINITIONS = [
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
];

export const CRMHubGrid: React.FC<CRMHubGridProps> = ({
  userType,
  onHubSelect,
  quickActions,
}) => {
  const isMobile = useIsMobile();

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
        {HUB_DEFINITIONS.map((hub, index) => (
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
