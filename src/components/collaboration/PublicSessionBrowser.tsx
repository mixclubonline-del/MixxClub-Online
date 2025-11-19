import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, Users, Music, Loader2, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PublicSession {
  id: string;
  session_name: string;
  session_type: string;
  audio_quality: string;
  max_participants: number;
  created_at: string;
  session_state: any;
  host: {
    full_name: string | null;
    email: string;
  };
  participant_count: number;
  has_requested: boolean;
}

export const PublicSessionBrowser = () => {
  const [sessions, setSessions] = useState<PublicSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSession, setSelectedSession] = useState<PublicSession | null>(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [requesting, setRequesting] = useState(false);
  const { toast } = useToast();

  const fetchPublicSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get public sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("collaboration_sessions")
        .select(`
          id,
          session_name,
          session_type,
          audio_quality,
          max_participants,
          created_at,
          session_state,
          host_user_id
        `)
        .eq("visibility", "public")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (sessionsError) throw sessionsError;

      // Get host profiles
      const hostIds = [...new Set(sessionsData?.map(s => s.host_user_id) || [])];
      const { data: hosts } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", hostIds);

      const hostMap = new Map(hosts?.map(h => [h.id, h]) || []);

      // Get participant counts
      const { data: participantCounts } = await supabase
        .from("session_participants")
        .select("session_id")
        .in("session_id", sessionsData?.map(s => s.id) || [])
        .eq("is_active", true);

      const countMap = new Map<string, number>();
      participantCounts?.forEach(p => {
        countMap.set(p.session_id, (countMap.get(p.session_id) || 0) + 1);
      });

      // Check if user has already requested to join
      const { data: joinRequests } = await supabase
        .from("session_join_requests")
        .select("session_id")
        .eq("engineer_id", user.id)
        .in("session_id", sessionsData?.map(s => s.id) || []);

      const requestedSet = new Set(joinRequests?.map(r => r.session_id) || []);

      const formattedSessions = sessionsData?.map(session => {
        const host = hostMap.get(session.host_user_id);
        return {
          ...session,
          host: {
            full_name: host?.full_name || null,
            email: host?.email || "Unknown"
          },
          participant_count: countMap.get(session.id) || 0,
          has_requested: requestedSet.has(session.id)
        };
      }) || [];

      setSessions(formattedSessions);
    } catch (error: any) {
      console.error("Error fetching public sessions:", error);
      toast({
        title: "Error",
        description: "Failed to load public sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicSessions();

    // Subscribe to session changes
    const subscription = supabase
      .channel("public_sessions_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "collaboration_sessions",
          filter: "visibility=eq.public",
        },
        () => {
          fetchPublicSessions();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleRequestJoin = async () => {
    if (!selectedSession) return;

    setRequesting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("session_join_requests")
        .insert({
          session_id: selectedSession.id,
          user_id: user.id,
          message: requestMessage.trim() || null,
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already requested",
            description: "You've already requested to join this session",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Request sent!",
          description: "The artist will be notified of your request",
        });
        setSelectedSession(null);
        setRequestMessage("");
        fetchPublicSessions();
      }
    } catch (error: any) {
      console.error("Error requesting to join:", error);
      toast({
        title: "Failed to send request",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  const filteredSessions = sessions.filter(session =>
    session.session_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.host.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (session.session_state?.genre || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sessions by name, artist, or genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filteredSessions.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No public sessions available</p>
              <p className="text-sm mt-2">Check back later for collaboration opportunities</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredSessions.map((session) => (
            <Card key={session.id} className="bloom-hover">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{session.session_name}</CardTitle>
                      <Badge variant="outline">{session.session_type}</Badge>
                    </div>
                    <CardDescription>
                      Hosted by {session.host.full_name || session.host.email}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{session.participant_count}/{session.max_participants}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {session.session_state?.description && (
                  <p className="text-sm text-muted-foreground">
                    {session.session_state.description}
                  </p>
                )}
                <div className="flex items-center gap-3 flex-wrap">
                  {session.session_state?.genre && (
                    <Badge variant="secondary">
                      {session.session_state.genre}
                    </Badge>
                  )}
                  <Badge variant="secondary">
                    {session.audio_quality}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                  </span>
                </div>
                <div className="flex justify-end">
                  {session.has_requested ? (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Send className="h-3 w-3" />
                      Request Pending
                    </Badge>
                  ) : (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => setSelectedSession(session)}
                          disabled={session.participant_count >= session.max_participants}
                        >
                          Request to Join
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Request to Join Session</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Session</Label>
                            <Input value={session.session_name} disabled />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="message">Message to Artist (Optional)</Label>
                            <Textarea
                              id="message"
                              placeholder="Introduce yourself and explain why you'd like to join..."
                              value={requestMessage}
                              onChange={(e) => setRequestMessage(e.target.value)}
                              rows={4}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedSession(null);
                              setRequestMessage("");
                            }}
                            disabled={requesting}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleRequestJoin} disabled={requesting}>
                            {requesting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Send Request
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
