import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Wifi, WifiOff, Users, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface PresenceUser {
  user_id: string;
  online_at: string;
  status: string;
}

export const RealtimeCollabTester = () => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<PresenceUser[]>([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ user: string; text: string; time: string }>>([]);
  const [latency, setLatency] = useState<number | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const connectToChannel = async () => {
    try {
      const testChannel = supabase.channel('test_collaboration', {
        config: {
          presence: {
            key: 'test-user-' + Math.random().toString(36).substr(2, 9),
          },
        },
      });

      testChannel
        .on('presence', { event: 'sync' }, () => {
          const state = testChannel.presenceState<PresenceUser>();
          const users = Object.values(state).flat();
          setActiveUsers(users);
        })
        .on('presence', { event: 'join' }, ({ newPresences }) => {
          toast({
            title: "User joined",
            description: `${newPresences.length} user(s) joined the session`,
          });
        })
        .on('presence', { event: 'leave' }, ({ leftPresences }) => {
          toast({
            title: "User left",
            description: `${leftPresences.length} user(s) left the session`,
          });
        })
        .on('broadcast', { event: 'message' }, ({ payload }) => {
          setMessages(prev => [...prev, payload]);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            const startTime = Date.now();
            await testChannel.track({
              user_id: 'test-admin',
              online_at: new Date().toISOString(),
              status: 'testing',
            });
            const endTime = Date.now();
            setLatency(endTime - startTime);
            setIsConnected(true);
            toast({ title: "Connected to real-time channel" });
          }
        });

      channelRef.current = testChannel;
    } catch (error) {
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const disconnectFromChannel = async () => {
    if (channelRef.current) {
      await supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      setIsConnected(false);
      setActiveUsers([]);
      setMessages([]);
      toast({ title: "Disconnected from channel" });
    }
  };

  const sendMessage = () => {
    if (!message.trim() || !channelRef.current) return;

    const startTime = Date.now();
    channelRef.current.send({
      type: 'broadcast',
      event: 'message',
      payload: {
        user: 'test-admin',
        text: message,
        time: new Date().toISOString(),
      },
    }).then(() => {
      const roundTripTime = Date.now() - startTime;
      setLatency(roundTripTime);
      setMessage("");
    });
  };

  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-gray-400" />
            )}
            <CardTitle>Real-time Collaboration Tester</CardTitle>
          </div>
          {!isConnected ? (
            <Button onClick={connectToChannel}>Connect</Button>
          ) : (
            <Button onClick={disconnectFromChannel} variant="destructive">
              Disconnect
            </Button>
          )}
        </div>
        <CardDescription>
          Test WebSocket connections and real-time presence
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-semibold">Active Users</span>
                </div>
                <p className="text-2xl font-bold">{activeUsers.length}</p>
              </div>

              <div className="p-3 bg-blue-500/10 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Loader2 className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-semibold">Latency</span>
                </div>
                <p className="text-2xl font-bold">{latency || '--'}ms</p>
              </div>
            </div>

            {activeUsers.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2 text-sm">Connected Users</h4>
                <div className="space-y-2">
                  {activeUsers.map((user, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded text-xs">
                      <span className="font-mono">{user.user_id}</span>
                      <Badge variant="secondary">{user.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2 text-sm">Test Messages</h4>
              <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                {messages.map((msg, idx) => (
                  <div key={idx} className="p-2 bg-muted rounded text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">{msg.user}</span>
                      <span className="text-muted-foreground">
                        {new Date(msg.time).toLocaleTimeString()}
                      </span>
                    </div>
                    <p>{msg.text}</p>
                  </div>
                ))}
                {messages.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No messages yet
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Type a test message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button onClick={sendMessage} size="sm">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}

        {!isConnected && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Click "Connect" to test real-time collaboration features
          </div>
        )}
      </CardContent>
    </Card>
  );
};
