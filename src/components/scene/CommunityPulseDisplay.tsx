/**
 * Community Pulse Display
 * 
 * Visualizes real community progress toward unlockables.
 * Shows the next milestone and collective progress.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, Sparkles, Building, Swords, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCommunityPulse } from '@/hooks/useSceneSystem';

// ============================================
// ICON MAPPING
// ============================================

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  sun: Sparkles,
  users: Users,
  swords: Swords,
  activity: Sparkles,
  building: Building,
  trophy: Trophy,
  sparkles: Sparkles,
  landmark: Building,
  crown: Crown,
};

// ============================================
// UNLOCKABLE CARD
// ============================================

interface UnlockableCardProps {
  name: string;
  description: string | null;
  progress: number;
  isUnlocked: boolean;
  iconName: string;
  isNext: boolean;
  remaining: number;
  thresholdType: string;
}

function UnlockableCard({ 
  name, 
  description, 
  progress, 
  isUnlocked, 
  iconName, 
  isNext,
  remaining,
  thresholdType 
}: UnlockableCardProps) {
  const IconComponent = iconMap[iconName] || Sparkles;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative p-4 rounded-xl border transition-all
        ${isUnlocked 
          ? 'bg-primary/10 border-primary/30' 
          : isNext 
            ? 'bg-muted/50 border-primary/20' 
            : 'bg-muted/20 border-border/30'
        }
      `}
    >
      {/* Unlocked glow */}
      {isUnlocked && (
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent rounded-xl pointer-events-none" />
      )}
      
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`
          w-10 h-10 rounded-lg flex items-center justify-center shrink-0
          ${isUnlocked ? 'bg-primary/20' : 'bg-muted'}
        `}>
          <IconComponent className={`w-5 h-5 ${isUnlocked ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-semibold text-sm ${isUnlocked ? 'text-primary' : ''}`}>
              {name}
            </h4>
            {isUnlocked && (
              <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Unlocked
              </span>
            )}
            {isNext && !isUnlocked && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                Next
              </span>
            )}
          </div>
          
          {description && (
            <p className="text-xs text-muted-foreground mb-2">{description}</p>
          )}
          
          {/* Progress bar */}
          {!isUnlocked && (
            <div className="space-y-1">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {remaining} {thresholdType} to go
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

interface CommunityUnlockableRow {
  id: string;
  name: string;
  description: string | null;
  threshold_type: string;
  threshold_value: number;
  is_unlocked: boolean;
  unlocked_at: string | null;
  unlock_order: number;
  icon_name: string;
  unlockable_type: string;
}

export function CommunityPulseDisplay() {
  const { totalUsers, totalSessions, totalProjects } = useCommunityPulse();
  const [unlockables, setUnlockables] = useState<CommunityUnlockableRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch unlockables
  useEffect(() => {
    const fetchUnlockables = async () => {
      const { data } = await supabase
        .from('community_unlockables')
        .select('*')
        .order('unlock_order', { ascending: true })
        .limit(6);
      
      if (data) {
        setUnlockables(data);
      }
      setIsLoading(false);
    };
    
    fetchUnlockables();
    
    // Subscribe to changes
    const channel = supabase
      .channel('community-unlockables')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'community_unlockables' },
        () => fetchUnlockables()
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  // Calculate progress for each unlockable
  const getProgress = (unlockable: CommunityUnlockableRow) => {
    let current = 0;
    switch (unlockable.threshold_type) {
      case 'users':
        current = totalUsers;
        break;
      case 'sessions':
        current = totalSessions;
        break;
      case 'projects':
        current = totalProjects;
        break;
    }
    return {
      current,
      progress: Math.min(100, (current / unlockable.threshold_value) * 100),
      remaining: Math.max(0, unlockable.threshold_value - current),
    };
  };
  
  // Find the next unlockable
  const nextUnlockable = unlockables.find(u => !u.is_unlocked);
  
  if (isLoading) {
    return (
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-muted/50 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-2">Community Pulse</h2>
          <p className="text-muted-foreground">
            {nextUnlockable 
              ? `${getProgress(nextUnlockable).remaining} ${nextUnlockable.threshold_type} until "${nextUnlockable.name}"`
              : 'Building the future together'
            }
          </p>
        </div>
        
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="text-center p-4 rounded-xl bg-muted/30 border border-border/50">
            <div className="text-2xl font-bold">{totalUsers}</div>
            <div className="text-xs text-muted-foreground">Members</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-muted/30 border border-border/50">
            <div className="text-2xl font-bold">{totalSessions}</div>
            <div className="text-xs text-muted-foreground">Sessions</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-muted/30 border border-border/50">
            <div className="text-2xl font-bold">{totalProjects}</div>
            <div className="text-xs text-muted-foreground">Projects</div>
          </div>
        </div>
        
        {/* Unlockables grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {unlockables.map(unlockable => {
            const { progress, remaining } = getProgress(unlockable);
            return (
              <UnlockableCard
                key={unlockable.id}
                name={unlockable.name}
                description={unlockable.description}
                progress={progress}
                isUnlocked={unlockable.is_unlocked}
                iconName={unlockable.icon_name}
                isNext={nextUnlockable?.id === unlockable.id}
                remaining={remaining}
                thresholdType={unlockable.threshold_type}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
