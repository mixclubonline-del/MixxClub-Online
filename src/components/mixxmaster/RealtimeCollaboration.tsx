import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Radio, Wifi } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface Participant {
  userId: string;
  userName: string;
  role: string;
  isActive: boolean;
  lastSeen: string;
}

interface RealtimeCollaborationProps {
  sessionId: string;
}

export function RealtimeCollaboration({ sessionId }: RealtimeCollaborationProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setupRealtimeChannel();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [sessionId]);

  const setupRealtimeChannel = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newChannel = supabase.channel(`session:${sessionId}`, {
      config: {
        presence: { key: user.id }
      }
    });

    newChannel
      .on('presence', { event: 'sync' }, () => {
        const state = newChannel.presenceState();
        const users = Object.values(state).flat() as any[];
        
        setParticipants(
          users.map((u) => ({
            userId: u.user_id,
            userName: u.user_name || 'Anonymous',
            role: u.role || 'viewer',
            isActive: true,
            lastSeen: new Date().toISOString()
          }))
        );
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        const newUsers = newPresences.map((p: any) => p.user_name || 'Anonymous').join(', ');
        toast.success(`${newUsers} joined the session`);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const leftUsers = leftPresences.map((p: any) => p.user_name || 'Anonymous').join(', ');
        toast.info(`${leftUsers} left the session`);
      });

    newChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        
        await newChannel.track({
          user_id: user.id,
          user_name: user.email?.split('@')[0] || 'Anonymous',
          role: 'collaborator',
          online_at: new Date().toISOString()
        });
      }
    });

    setChannel(newChannel);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="h-5 w-5" />
          Live Collaboration
          {isConnected ? (
            <Badge variant="default" className="bg-success">
              <Wifi className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="secondary">Connecting...</Badge>
          )}
        </CardTitle>
        <CardDescription>
          {participants.length} {participants.length === 1 ? 'person' : 'people'} in this session
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Participants
            </h4>
            {participants.length === 0 ? (
              <p className="text-sm text-muted-foreground">No one else here yet</p>
            ) : (
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div
                    key={participant.userId}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                      <span className="text-sm font-medium">{participant.userName}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {participant.role}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
