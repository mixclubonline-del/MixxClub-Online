import React from 'react';
import { Users, MoreVertical, UserMinus, Shield } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RoleSelector } from './RoleSelector';
import { SessionParticipant, SessionRole, SessionPermissions } from '@/hooks/useSessionPermissions';
import { cn } from '@/lib/utils';

interface ParticipantsListProps {
  participants: SessionParticipant[];
  currentUserId: string;
  myPermissions: SessionPermissions;
  hostUserId: string;
  onChangeRole: (userId: string, role: SessionRole) => void;
  onKickUser: (userId: string) => void;
}

export const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants,
  currentUserId,
  myPermissions,
  hostUserId,
  onChangeRole,
  onKickUser,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Mock participants if none provided
  const displayParticipants = participants.length > 0 ? participants : [
    {
      id: '1',
      userId: hostUserId || currentUserId,
      userName: 'Session Host',
      role: 'host' as SessionRole,
      joinedAt: new Date().toISOString(),
      isOnline: true,
      lockedTracks: [],
    },
    {
      id: '2',
      userId: currentUserId,
      userName: 'You',
      role: 'editor' as SessionRole,
      joinedAt: new Date().toISOString(),
      isOnline: true,
      lockedTracks: [],
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          Participants ({displayParticipants.length})
        </span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {displayParticipants.map((participant) => {
            const isMe = participant.userId === currentUserId;
            const isHost = participant.userId === hostUserId;
            const canManage = myPermissions.canChangeRoles && !isHost && !isMe;

            return (
              <div
                key={participant.id}
                className={cn(
                  'flex items-center gap-2 p-2 rounded-lg transition-colors',
                  'hover:bg-accent/50',
                  isMe && 'bg-primary/5'
                )}
              >
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={participant.avatarUrl} />
                    <AvatarFallback className="text-xs">
                      {getInitials(participant.userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background',
                      participant.isOnline ? 'bg-green-500' : 'bg-muted'
                    )}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium truncate">
                      {participant.userName}
                    </span>
                    {isMe && (
                      <span className="text-[10px] text-muted-foreground">(you)</span>
                    )}
                  </div>
                  {participant.lockedTracks.length > 0 && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Shield className="h-2.5 w-2.5" />
                      <span>{participant.lockedTracks.length} tracks locked</span>
                    </div>
                  )}
                </div>

                <RoleSelector
                  currentRole={participant.role}
                  onRoleChange={(role) => onChangeRole(participant.userId, role)}
                  disabled={!canManage}
                  isHost={isHost}
                />

                {canManage && myPermissions.canKick && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onKickUser(participant.userId)}
                        className="text-destructive"
                      >
                        <UserMinus className="h-4 w-4 mr-2" />
                        Remove from session
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
