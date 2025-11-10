import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, UserPlus, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface JoinRequest {
  id: string;
  status: string;
  message: string | null;
  created_at: string;
  engineer: {
    id: string;
    full_name: string | null;
    email: string;
  };
  session: {
    id: string;
    session_name: string;
  };
}

interface SessionJoinRequestsListProps {
  sessionId?: string;
}

export const SessionJoinRequestsList = ({ sessionId }: SessionJoinRequestsListProps) => {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchJoinRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from("session_join_requests")
        .select(`
          id,
          status,
          message,
          created_at,
          engineer_id,
          session_id
        `);

      if (sessionId) {
        query = query.eq("session_id", sessionId);
      } else {
        // Get all requests for sessions hosted by this user
        const { data: userSessions } = await supabase
          .from("collaboration_sessions")
          .select("id")
          .eq("host_user_id", user.id);

        const sessionIds = userSessions?.map(s => s.id) || [];
        query = query.in("session_id", sessionIds);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;

      // Get engineer and session details
      const engineerIds = [...new Set(data?.map(r => r.engineer_id) || [])];
      const sessionIds = [...new Set(data?.map(r => r.session_id) || [])];

      const { data: engineers } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", engineerIds);

      const { data: sessions } = await supabase
        .from("collaboration_sessions")
        .select("id, session_name")
        .in("id", sessionIds);

      const engineerMap = new Map(engineers?.map(e => [e.id, e]) || []);
      const sessionMap = new Map(sessions?.map(s => [s.id, s]) || []);

      const formattedRequests = data?.map(request => {
        const engineer = engineerMap.get(request.engineer_id);
        const session = sessionMap.get(request.session_id);
        return {
          ...request,
          engineer: {
            id: request.engineer_id,
            full_name: engineer?.full_name || null,
            email: engineer?.email || "Unknown"
          },
          session: {
            id: request.session_id,
            session_name: session?.session_name || "Unknown"
          }
        };
      }) || [];

      setRequests(formattedRequests);
    } catch (error: any) {
      console.error("Error fetching join requests:", error);
      toast({
        title: "Error",
        description: "Failed to load join requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJoinRequests();

    // Subscribe to join request changes
    const subscription = supabase
      .channel("join_requests_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "session_join_requests",
        },
        () => {
          fetchJoinRequests();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [sessionId]);

  const handleResponse = async (requestId: string, engineerId: string, sessionId: string, status: "approved" | "rejected") => {
    setResponding(requestId);
    try {
      const { error: updateError } = await supabase
        .from("session_join_requests")
        .update({
          status,
          responded_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (updateError) throw updateError;

      // If approved, add engineer as participant
      if (status === "approved") {
        const { error: participantError } = await supabase
          .from("session_participants")
          .insert({
            session_id: sessionId,
            user_id: engineerId,
            is_active: true
          });

        if (participantError && participantError.code !== '23505') {
          throw participantError;
        }
      }

      toast({
        title: status === "approved" ? "Request approved!" : "Request rejected",
        description: status === "approved"
          ? "The engineer has been added to the session"
          : "The engineer has been notified",
      });

      fetchJoinRequests();
    } catch (error: any) {
      console.error("Error responding to request:", error);
      toast({
        title: "Error",
        description: "Failed to respond to request",
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

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No join requests yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">
                  {request.engineer.full_name || request.engineer.email}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  wants to join: {request.session.session_name}
                </p>
              </div>
              <Badge
                variant={
                  request.status === "approved"
                    ? "default"
                    : request.status === "rejected"
                    ? "secondary"
                    : "outline"
                }
              >
                {request.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {request.message && (
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm italic">&ldquo;{request.message}&rdquo;</p>
              </div>
            )}
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
              </p>
              {request.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResponse(request.id, request.engineer.id, request.session.id, "rejected")}
                    disabled={responding === request.id}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleResponse(request.id, request.engineer.id, request.session.id, "approved")}
                    disabled={responding === request.id}
                  >
                    {responding === request.id ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-1" />
                    )}
                    Approve
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
