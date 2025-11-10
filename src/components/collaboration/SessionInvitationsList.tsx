import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, Clock, Mail, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Invitation {
  id: string;
  status: string;
  message: string | null;
  created_at: string;
  artist: {
    id: string;
    full_name: string | null;
    email: string;
  };
  session: {
    id: string;
    session_name: string;
    description: string | null;
  };
}

export const SessionInvitationsList = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchInvitations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("session_invitations")
        .select(`
          id,
          status,
          message,
          created_at,
          artist_id,
          session_id
        `)
        .eq("engineer_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;

      // Get artist and session details
      const artistIds = [...new Set(data?.map(inv => inv.artist_id) || [])];
      const sessionIds = [...new Set(data?.map(inv => inv.session_id) || [])];

      const { data: artists } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", artistIds);

      const { data: sessions } = await supabase
        .from("collaboration_sessions")
        .select("id, session_name, session_state")
        .in("id", sessionIds);

      const artistMap = new Map(artists?.map(a => [a.id, a]) || []);
      const sessionMap = new Map(sessions?.map(s => [s.id, { 
        id: s.id, 
        session_name: s.session_name, 
        description: (s.session_state as any)?.description || null 
      }]) || []);

      const formattedData = data?.map(inv => {
        const artist = artistMap.get(inv.artist_id);
        return {
          ...inv,
          artist: {
            id: inv.artist_id,
            full_name: artist?.full_name || 'Unknown',
            email: artist?.email || ''
          },
          session: sessionMap.get(inv.session_id) || { id: inv.session_id, session_name: 'Unknown', description: null }
        };
      }) || [];

      setInvitations(formattedData);
    } catch (error: any) {
      console.error("Error fetching invitations:", error);
      toast({
        title: "Error",
        description: "Failed to load invitations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();

    // Subscribe to invitation changes
    const subscription = supabase
      .channel("session_invitations_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "session_invitations",
        },
        () => {
          fetchInvitations();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleResponse = async (invitationId: string, status: "accepted" | "declined") => {
    setResponding(invitationId);
    try {
      const { error } = await supabase
        .from("session_invitations")
        .update({
          status,
          responded_at: new Date().toISOString(),
        })
        .eq("id", invitationId);

      if (error) throw error;

      toast({
        title: status === "accepted" ? "Invitation accepted!" : "Invitation declined",
        description: status === "accepted" 
          ? "You can now collaborate on this session"
          : "The artist has been notified",
      });

      fetchInvitations();
    } catch (error: any) {
      console.error("Error responding to invitation:", error);
      toast({
        title: "Error",
        description: "Failed to respond to invitation",
        variant: "destructive",
      });
    } finally {
      setResponding(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invitations.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No session invitations yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {invitations.map((invitation) => (
        <Card key={invitation.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">
                  {invitation.session.session_name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  From: {invitation.artist.full_name || invitation.artist.email}
                </p>
              </div>
              <Badge
                variant={
                  invitation.status === "accepted"
                    ? "default"
                    : invitation.status === "declined"
                    ? "secondary"
                    : "outline"
                }
              >
                {invitation.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                {invitation.status === "accepted" && <Check className="h-3 w-3 mr-1" />}
                {invitation.status === "declined" && <X className="h-3 w-3 mr-1" />}
                {invitation.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {invitation.session.description && (
              <p className="text-sm text-muted-foreground">
                {invitation.session.description}
              </p>
            )}
            {invitation.message && (
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm italic">&ldquo;{invitation.message}&rdquo;</p>
              </div>
            )}
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
              </p>
              {invitation.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResponse(invitation.id, "declined")}
                    disabled={responding === invitation.id}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleResponse(invitation.id, "accepted")}
                    disabled={responding === invitation.id}
                  >
                    {responding === invitation.id ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-1" />
                    )}
                    Accept
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};