/**
 * DepthAwareSessionCard
 * 
 * Progressive revelation based on user's depth layer:
 * - Posted Up: Activity glow only (something's happening)
 * - In the Room: See participants + basic info
 * - On the Mic: Can join sessions
 * - On Stage: Featured placement + full access
 */

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, Play, Eye, Headphones, Zap, Lock,
  Clock, Crown, Sparkles
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useDepthLayer } from '@/hooks/useDepthLayer';
import type { DepthLayer } from '@/types/depth';
import { cn } from '@/lib/utils';

export interface SessionData {
  id: string;
  title: string;
  description?: string | null;
  status: 'active' | 'waiting' | 'scheduled' | 'completed' | 'ended';
  session_type?: string | null;
  audio_quality?: string | null;
  created_at: string;
  host_profile?: {
    full_name: string;
    avatar_url?: string | null;
  };
  participant_count?: number;
  max_participants?: number | null;
  participants?: Array<{
    id: string;
    name: string;
    avatar_url?: string | null;
  }>;
}

interface DepthAwareSessionCardProps {
  session: SessionData;
  onView: () => void;
  onJoin?: () => void;
  featured?: boolean;
  className?: string;
}

// Layer-specific configuration
const LAYER_CONFIG: Record<DepthLayer, {
  showParticipants: boolean;
  showDetails: boolean;
  canJoin: boolean;
  showHost: boolean;
}> = {
  'posted-up': {
    showParticipants: false,
    showDetails: false,
    canJoin: false,
    showHost: false,
  },
  'in-the-room': {
    showParticipants: true,
    showDetails: true,
    canJoin: false,
    showHost: true,
  },
  'on-the-mic': {
    showParticipants: true,
    showDetails: true,
    canJoin: true,
    showHost: true,
  },
  'on-stage': {
    showParticipants: true,
    showDetails: true,
    canJoin: true,
    showHost: true,
  },
};

export function DepthAwareSessionCard({
  session,
  onView,
  onJoin,
  featured = false,
  className,
}: DepthAwareSessionCardProps) {
  const { currentLayer, isOnStage, can } = useDepthLayer();
  const config = LAYER_CONFIG[currentLayer];
  
  const isActive = session.status === 'active';
  const isWaiting = session.status === 'waiting';
  const isLive = isActive || isWaiting;
  
  // On Stage users get featured placement styling
  const isFeatured = featured || (isOnStage && isActive);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={config.canJoin ? { scale: 1.02, y: -4 } : undefined}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card 
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          "bg-card/80 border-border/30",
          isLive && "border-primary/30",
          isFeatured && "border-accent-gold/50 bg-gradient-to-br from-card via-card to-accent-gold/5",
          config.canJoin && "cursor-pointer hover:border-primary/50"
        )}
      >
        {/* Activity Glow - Always visible (Posted Up can see this) */}
        {isLive && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className={cn(
              "absolute inset-0 bg-gradient-to-r rounded-lg",
              isActive 
                ? "from-green-500/20 via-transparent to-green-500/20" 
                : "from-yellow-500/15 via-transparent to-yellow-500/15"
            )} />
          </motion.div>
        )}

        {/* Featured Crown Badge */}
        {isFeatured && (
          <div className="absolute -top-1 -right-1 z-10">
            <Badge className="bg-gradient-to-r from-accent-gold to-yellow-500 text-black gap-1 shadow-lg">
              <Crown className="w-3 h-3" />
              Featured
            </Badge>
          </div>
        )}

        <CardContent className="p-4 relative z-0">
          {/* Posted Up View - Minimal, just glow + vague activity */}
          {currentLayer === 'posted-up' ? (
            <PostedUpView session={session} isLive={isLive} />
          ) : (
            /* In the Room and above - Progressive detail */
            <FullView
              session={session}
              config={config}
              isLive={isLive}
              isFeatured={isFeatured}
              onView={onView}
              onJoin={onJoin}
              currentLayer={currentLayer}
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Posted Up: Just activity indication, no real details
function PostedUpView({ 
  session, 
  isLive 
}: { 
  session: SessionData; 
  isLive: boolean;
}) {
  return (
    <div className="flex items-center gap-4 py-2">
      {/* Mysterious glow orb */}
      <div className="relative">
        <motion.div
          className={cn(
            "w-12 h-12 rounded-full",
            isLive 
              ? "bg-gradient-to-br from-green-500/30 to-primary/30" 
              : "bg-muted/30"
          )}
          animate={isLive ? {
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {isLive && (
          <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
        )}
      </div>
      
      {/* Vague activity hint */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <motion.div 
            className="h-4 bg-muted/40 rounded-full"
            style={{ width: `${Math.min(session.title.length * 8, 150)}px` }}
            animate={{ opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          {isLive && (
            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
              <Zap className="w-2 h-2 mr-1" />
              Live
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground/60 flex items-center gap-1">
          <Lock className="w-3 h-3" />
          Sign in to see more
        </p>
      </div>
    </div>
  );
}

// Full View for In the Room and above
function FullView({
  session,
  config,
  isLive,
  isFeatured,
  onView,
  onJoin,
  currentLayer,
}: {
  session: SessionData;
  config: typeof LAYER_CONFIG[DepthLayer];
  isLive: boolean;
  isFeatured: boolean;
  onView: () => void;
  onJoin?: () => void;
  currentLayer: DepthLayer;
}) {
  return (
    <div className="flex items-start gap-4">
      {/* Host Avatar - In the Room+ */}
      {config.showHost && session.host_profile && (
        <Avatar className={cn(
          "w-12 h-12 border-2",
          isFeatured ? "border-accent-gold/50" : "border-border/50"
        )}>
          <AvatarImage 
            src={session.host_profile.avatar_url || undefined} 
            alt={session.host_profile.full_name} 
          />
          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-sm">
            {session.host_profile.full_name?.charAt(0) || 'H'}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold truncate">{session.title}</h4>
          {isLive && (
            <Badge className={cn(
              "text-xs",
              session.status === 'active' 
                ? "bg-green-500/10 text-green-500 border-green-500/20 animate-pulse"
                : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
            )}>
              <Zap className="w-2 h-2 mr-1" />
              {session.status === 'active' ? 'Live' : 'Waiting'}
            </Badge>
          )}
        </div>

        {/* Description - In the Room+ with details */}
        {config.showDetails && session.description && (
          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
            {session.description}
          </p>
        )}

        {/* Meta info row */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {/* Participants - In the Room+ */}
          {config.showParticipants && (
            <ParticipantAvatars 
              participants={session.participants}
              count={session.participant_count || 0}
              max={session.max_participants || 5}
            />
          )}

          {config.showDetails && (
            <>
              <span className="flex items-center gap-1">
                <Headphones className="w-3 h-3" />
                {session.audio_quality || 'Standard'}
              </span>

              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {config.canJoin && isLive ? (
          <Button 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              if (onJoin) {
                onJoin();
              } else {
                onView();
              }
            }}
            className="bg-gradient-to-r from-green-500 to-primary hover:opacity-90 gap-1"
          >
            <Play className="w-4 h-4" />
            Join
          </Button>
        ) : config.canJoin ? (
          <Button 
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            className="border-border/50 hover:border-primary/50 gap-1"
          >
            <Eye className="w-4 h-4" />
            View
          </Button>
        ) : (
          /* In the Room can see but not join */
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" />
            <span>Level up to join</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Participant avatars stack
function ParticipantAvatars({
  participants,
  count,
  max,
}: {
  participants?: SessionData['participants'];
  count: number;
  max: number;
}) {
  const displayParticipants = participants?.slice(0, 3) || [];
  const remaining = count - displayParticipants.length;

  return (
    <div className="flex items-center gap-1">
      <div className="flex -space-x-2">
        {displayParticipants.map((p, i) => (
          <Avatar key={p.id} className="w-5 h-5 border border-background">
            <AvatarImage src={p.avatar_url || undefined} alt={p.name} />
            <AvatarFallback className="text-[8px] bg-muted">
              {p.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        ))}
        {remaining > 0 && (
          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[8px] border border-background">
            +{remaining}
          </div>
        )}
      </div>
      <span className="flex items-center gap-1">
        <Users className="w-3 h-3" />
        {count}/{max}
      </span>
    </div>
  );
}

// Featured Session Card - On Stage exclusive styling
export function FeaturedSessionCard(props: Omit<DepthAwareSessionCardProps, 'featured'>) {
  const { isOnStage } = useDepthLayer();
  
  if (!isOnStage) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      {/* Spotlight effect */}
      <div className="absolute -inset-2 bg-gradient-to-r from-accent-gold/20 via-primary/20 to-accent-gold/20 rounded-xl blur-xl animate-pulse" />
      
      <div className="relative">
        <div className="absolute -top-3 left-4 z-10">
          <Badge className="bg-accent-gold text-black gap-1 shadow-lg">
            <Sparkles className="w-3 h-3" />
            Your Session
          </Badge>
        </div>
        <DepthAwareSessionCard {...props} featured />
      </div>
    </motion.div>
  );
}
