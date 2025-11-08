import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Crown } from 'lucide-react';

export interface Participant {
  id: string;
  name: string;
  status: 'online' | 'away' | 'offline';
  isHost?: boolean;
  cursor?: { x: number; y: number };
}

interface ActiveParticipantsProps {
  participants: Participant[];
  maxParticipants?: number;
}

export function ActiveParticipants({ participants, maxParticipants = 10 }: ActiveParticipantsProps) {
  const onlineCount = participants.filter((p) => p.status === 'online').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Participants
          </CardTitle>
          <Badge variant="secondary">
            {onlineCount} / {maxParticipants}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {participants.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              No participants yet
            </div>
          ) : (
            participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-sm">
                      {participant.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                      participant.status === 'online'
                        ? 'bg-green-500'
                        : participant.status === 'away'
                        ? 'bg-yellow-500'
                        : 'bg-gray-400'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">
                      {participant.name}
                    </p>
                    {participant.isHost && (
                      <Crown className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">
                    {participant.status}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
