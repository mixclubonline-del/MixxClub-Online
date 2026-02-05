import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CRMActivePanelProps {
  hubId: string;
   userType: 'artist' | 'engineer' | 'producer' | 'fan';
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
  store: 'Store',
  profile: 'Brand Hub',
  business: 'Business',
};

export const CRMActivePanel: React.FC<CRMActivePanelProps> = ({
  hubId,
  userType,
  children,
  onClose,
}) => {
  const isMobile = useIsMobile();
  const title = HUB_TITLES[hubId] || 'Hub';
  
  const glowColor = userType === 'artist' 
    ? 'hsl(280 70% 50% / 0.1)' 
    : 'hsl(30 90% 50% / 0.1)';

  return (
    <motion.div
      className={cn(
        "backdrop-blur-xl bg-background/60 border border-border/50 rounded-2xl",
        "shadow-2xl overflow-hidden",
        isMobile ? "min-h-[60vh]" : "min-h-[70vh]"
      )}
      style={{
        boxShadow: `0 25px 50px -12px ${glowColor}, 0 0 80px -20px ${glowColor}`,
      }}
      layoutId="active-panel"
    >
      {/* Panel Header */}
      <div className={cn(
        "sticky top-0 z-20 backdrop-blur-xl bg-background/80 border-b border-border/50",
        "px-6 py-4 flex items-center justify-between"
      )}>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-primary/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">
              {userType === 'artist' ? 'Artist' : 'Engineer'} Command Center
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
