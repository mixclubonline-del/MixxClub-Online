import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Clock, Users, Play, Eye, Headphones, Zap,
  Calendar, CheckCircle, MoreHorizontal
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SessionCardProps {
  session: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    session_type: string | null;
    audio_quality: string | null;
    created_at: string;
    scheduled_start: string | null;
    host_profile?: {
      full_name: string;
      avatar_url: string | null;
    };
    participant_count?: number;
    max_participants?: number | null;
  };
  onView: () => void;
  isHost: boolean;
}

export function SessionCard({ session, onView, isHost }: SessionCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { 
          icon: Zap, 
          label: 'Live', 
          className: 'bg-green-500/10 text-green-500 border-green-500/20 animate-pulse' 
        };
      case 'waiting':
        return { 
          icon: Clock, 
          label: 'Waiting', 
          className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' 
        };
      case 'scheduled':
        return { 
          icon: Calendar, 
          label: 'Scheduled', 
          className: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20' 
        };
      case 'completed':
        return { 
          icon: CheckCircle, 
          label: 'Completed', 
          className: 'bg-muted text-muted-foreground' 
        };
      case 'ended':
        return { 
          icon: CheckCircle, 
          label: 'Ended', 
          className: 'bg-muted text-muted-foreground' 
        };
      default:
        return { 
          icon: Clock, 
          label: status, 
          className: 'bg-muted text-muted-foreground' 
        };
    }
  };

  const statusConfig = getStatusConfig(session.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="bg-card/80 border-border/30 hover:border-accent-cyan/30 transition-all group">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Host Avatar */}
          <Avatar className="w-12 h-12 border-2 border-border/50">
            <AvatarImage 
              src={session.host_profile?.avatar_url || undefined} 
              alt={session.host_profile?.full_name} 
            />
            <AvatarFallback className="bg-gradient-to-br from-accent-cyan to-accent-blue text-white text-sm">
              {session.host_profile?.full_name?.charAt(0) || 'H'}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold truncate">{session.title}</h4>
              {isHost && (
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                  Host
                </Badge>
              )}
            </div>

            {session.description && (
              <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                {session.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <Badge className={statusConfig.className}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig.label}
              </Badge>

              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {session.participant_count || 0}/{session.max_participants || 5}
              </span>

              <span className="flex items-center gap-1">
                <Headphones className="w-3 h-3" />
                {session.audio_quality || 'Standard'}
              </span>

              {session.scheduled_start ? (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(session.scheduled_start), 'MMM d, h:mm a')}
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {session.status === 'active' || session.status === 'waiting' ? (
              <Button 
                size="sm" 
                onClick={onView}
                className="bg-gradient-to-r from-green-500 to-accent-cyan hover:opacity-90"
              >
                <Play className="w-4 h-4 mr-1" />
                Join
              </Button>
            ) : (
              <Button 
                size="sm" 
                variant="outline"
                onClick={onView}
                className="border-border/50 hover:border-accent-cyan/50"
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border">
                <DropdownMenuItem onClick={onView}>View Details</DropdownMenuItem>
                {isHost && (
                  <>
                    <DropdownMenuItem>Edit Session</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">End Session</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
