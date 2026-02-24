import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface CRMActivePanelProps {
  hubId: string;
  userType: 'artist' | 'engineer' | 'producer' | 'fan' | 'admin';
  children: ReactNode;
  onClose: () => void;
}

const HUB_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  clients: 'Clients',
  matches: 'AI Matches',
  sessions: 'Sessions',
  opportunities: 'Opportunities',
  'active-work': 'Active Work',
  revenue: 'Revenue Analytics',
  community: 'Community',
  growth: 'Growth Hub',
  messages: 'Messages',
  earnings: 'Collaborative Earnings',
  music: 'Music Library',
  mastering: 'AI Mastering',
  store: 'Store',
  profile: 'Brand Hub',
  business: 'Business',
  'tri-collabs': '3-Way Collaborations',
  notifications: 'Notifications',
  schedule: 'Schedule',
  // Producer hubs
  catalog: 'Beat Catalog',
  sales: 'Sales',
  collabs: 'Collaborations',
  // Fan hubs
  feed: 'Discover',
  day1s: 'Day 1s',
  communities: 'Communities',
  drops: 'Drops & Releases',
  connect: 'Connect',
  missions: 'Missions',
  wallet: 'Wallet',
  trophies: 'Trophies',
  curator: 'Curator',
  favorites: 'Favorites',
  // Admin hubs
  users: 'User Management',
  content: 'Content Management',
  assets: 'Brand Assets',
  system: 'System Controls',
  prime: 'Prime Brain',
};

const ROLE_LABELS: Record<string, string> = {
  artist: 'Artist',
  engineer: 'Engineer',
  producer: 'Producer',
  fan: 'Fan',
  admin: 'Platform',
};

export const CRMActivePanel: React.FC<CRMActivePanelProps> = ({
  hubId,
  userType,
  children,
  onClose,
}) => {
  const isMobile = useIsMobile();
  const title = HUB_TITLES[hubId] || 'Hub';
  const roleLabel = ROLE_LABELS[userType] || 'Creator';

  return (
    <motion.div
      className={cn(
        "mg-panel overflow-hidden",
        isMobile ? "min-h-[60vh]" : "min-h-[70vh]"
      )}
      data-mg-role={userType}
      layoutId="active-panel"
    >
      {/* Panel Header — MixxGlass frosted glass */}
      <div className={cn(
        "mg-header sticky top-0 z-20",
        "px-6 py-4 flex items-center justify-between"
      )}>
        <div className="relative z-10 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-primary/10 backdrop-blur-md"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
            <p className="text-sm" style={{ color: 'var(--mg-accent-dim)' }}>
              {roleLabel} Command Center
            </p>
          </div>
        </div>

        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="relative z-10 hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Panel Content */}
      <div className={cn(
        "p-6 relative z-10",
        isMobile ? "pb-24" : "pb-8"
      )}>
        {children}
      </div>
    </motion.div>
  );
};
