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

const GLOW_MAP: Record<string, { color: string; shadow: string }> = {
  artist: {
    color: 'rgba(168, 85, 247, 0.08)',
    shadow: '0 25px 60px -12px rgba(168, 85, 247, 0.15), 0 0 100px -30px rgba(168, 85, 247, 0.1)',
  },
  engineer: {
    color: 'rgba(249, 115, 22, 0.08)',
    shadow: '0 25px 60px -12px rgba(249, 115, 22, 0.15), 0 0 100px -30px rgba(249, 115, 22, 0.1)',
  },
  producer: {
    color: 'rgba(234, 179, 8, 0.08)',
    shadow: '0 25px 60px -12px rgba(234, 179, 8, 0.15), 0 0 100px -30px rgba(234, 179, 8, 0.1)',
  },
  fan: {
    color: 'rgba(236, 72, 153, 0.08)',
    shadow: '0 25px 60px -12px rgba(236, 72, 153, 0.15), 0 0 100px -30px rgba(236, 72, 153, 0.1)',
  },
  admin: {
    color: 'rgba(56, 189, 248, 0.08)',
    shadow: '0 25px 60px -12px rgba(56, 189, 248, 0.15), 0 0 100px -30px rgba(56, 189, 248, 0.1)',
  },
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
  const glow = GLOW_MAP[userType] || GLOW_MAP.artist;

  return (
    <motion.div
      className={cn(
        "backdrop-blur-2xl rounded-2xl overflow-hidden",
        isMobile ? "min-h-[60vh]" : "min-h-[70vh]"
      )}
      style={{
        background: `linear-gradient(180deg, rgba(var(--background-rgb, 0, 0, 0), 0.55) 0%, rgba(var(--background-rgb, 0, 0, 0), 0.7) 100%)`,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: `${glow.shadow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
      layoutId="active-panel"
    >
      {/* Panel Header — Frosted glass */}
      <div className={cn(
        "sticky top-0 z-20 backdrop-blur-2xl",
        "px-6 py-4 flex items-center justify-between"
      )}
        style={{
          background: 'rgba(var(--background-rgb, 0, 0, 0), 0.6)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div className="flex items-center gap-3">
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
            <p className="text-sm text-muted-foreground">
              {roleLabel} Command Center
            </p>
          </div>
        </div>

        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Panel Content */}
      <div className={cn(
        "p-6",
        isMobile ? "pb-24" : "pb-8"
      )}>
        {children}
      </div>
    </motion.div>
  );
};
