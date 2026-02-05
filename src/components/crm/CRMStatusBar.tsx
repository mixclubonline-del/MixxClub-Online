import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, Award, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface CRMStatusBarProps {
   userType: 'artist' | 'engineer' | 'producer' | 'fan';
  profile: any;
  stats: Array<{
    icon: ReactNode;
    label: string;
    value: number | string;
    color: string;
  }>;
  onBackToGrid?: () => void;
}

export const CRMStatusBar: React.FC<CRMStatusBarProps> = ({
  userType,
  profile,
  stats,
  onBackToGrid,
}) => {
  const isMobile = useIsMobile();
  
  const getLevelProgress = () => {
    if (!profile) return 0;
    const currentLevelPoints = (profile.level - 1) * 1000;
    const progressInLevel = (profile.points || 0) - currentLevelPoints;
    return Math.min((progressInLevel / 1000) * 100, 100);
  };

  return (
    <motion.div
      className={cn(
        "backdrop-blur-xl bg-background/40 border border-border/50 rounded-2xl",
        "shadow-lg shadow-primary/5",
        isMobile ? "p-4" : "p-5"
      )}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left section: Back button + User info */}
        <div className="flex items-center gap-4">
          {onBackToGrid && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBackToGrid}
              className="shrink-0 hover:bg-primary/10"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary/50 shadow-lg shadow-primary/20">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-primary/20 text-primary font-bold">
                {profile?.full_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-foreground">
                  {profile?.full_name || 'Welcome'}
                </h2>
                <Badge variant="outline" className="text-xs bg-primary/10 border-primary/30">
                  {userType === 'artist' ? 'Artist' : 'Engineer'}
                </Badge>
              </div>
              
              {/* Level progress */}
              <div className="flex items-center gap-2 mt-1">
                <Award className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs text-muted-foreground">
                  Level {profile?.level || 1}
                </span>
                <Progress value={getLevelProgress()} className="w-20 h-1.5" />
                <span className="text-xs text-muted-foreground">
                  {profile?.points || 0} XP
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right section: Stats */}
        {!isMobile && (
          <div className="flex items-center gap-3">
            {stats.slice(0, 4).map((stat, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background/50 border border-border/30"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={cn("p-1.5 rounded-lg", stat.color)}>
                  {stat.icon}
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Mobile: Compact stats */}
        {isMobile && (
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">
              {userType === 'artist' ? 'Artist Studio' : 'Pro Studio'}
            </span>
          </div>
        )}
      </div>
      
      {/* Mobile stats row */}
      {isMobile && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/50 border border-border/30 shrink-0"
            >
              <div className={cn("p-1 rounded", stat.color)}>
                {stat.icon}
              </div>
              <div className="text-sm font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
