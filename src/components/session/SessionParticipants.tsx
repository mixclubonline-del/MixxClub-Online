import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, Crown, Star, CheckCircle, Clock, 
  UserPlus, Loader2, Mail
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Participant {
  id: string;
  user_id: string;
  role: string;
  status: string;
  joined_at: string;
  user?: {
    full_name: string;
    avatar_url: string;
    role: string;
  };
}

interface JoinRequest {
  id: string;
  engineer_id: string;
  status: string;
  created_at: string;
  engineer?: {
    full_name: string;
    avatar_url: string;
  };
}

interface SessionParticipantsProps {
  sessionId: string;
  hostId: string;
}

export function SessionParticipants({ sessionId, hostId }: SessionParticipantsProps) {
  const [hostProfile, setHostProfile] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchParticipants();
  }, [sessionId, hostId]);

  const fetchParticipants = async () => {
    try {
      // Fetch host profile
      const { data: hostData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role')
        .eq('id', hostId)
        .single();

      if (hostData) {
        setHostProfile(hostData);
      }

      // Fetch join requests
      const { data: requestsData } = await supabase
        .from('session_join_requests')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (requestsData && requestsData.length > 0) {
        const engineerIds = [...new Set(requestsData.map(r => r.engineer_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', engineerIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        
        setJoinRequests(requestsData.map(r => ({
          ...r,
          engineer: profileMap.get(r.engineer_id)
        })));
      }
    } catch (err) {
      console.error('Error fetching participants:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string, engineerId: string) => {
    try {
      // Update request status
      const { error } = await supabase
        .from('session_join_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Request approved!',
        description: 'The engineer can now join the session.',
      });

      fetchParticipants();
    } catch (err) {
      console.error('Error approving request:', err);
      toast({
        title: 'Error',
        description: 'Failed to approve request.',
        variant: 'destructive'
      });
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('session_join_requests')
        .update({ status: 'declined' })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Request declined',
      });

      fetchParticipants();
    } catch (err) {
      console.error('Error declining request:', err);
      toast({
        title: 'Error',
        description: 'Failed to decline request.',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-card/50 border-border/30">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading participants...</p>
        </CardContent>
      </Card>
    );
  }

  const pendingRequests = joinRequests.filter(r => r.status === 'pending');
  const approvedRequests = joinRequests.filter(r => r.status === 'approved');

  return (
    <div className="space-y-6">
      {/* Host */}
      <Card className="bg-card/50 border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Session Host
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hostProfile && (
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={hostProfile.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
                  {hostProfile.full_name?.charAt(0) || 'H'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-medium">{hostProfile.full_name || 'Host'}</h4>
                <p className="text-sm text-muted-foreground capitalize">{hostProfile.role || 'Artist'}</p>
              </div>
              <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                <Crown className="w-3 h-3 mr-1" />
                Host
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Participants */}
      <Card className="bg-card/50 border-border/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Members ({approvedRequests.length})
          </CardTitle>
          <Button size="sm" variant="outline">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite
          </Button>
        </CardHeader>
        <CardContent>
          {approvedRequests.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No team members yet</p>
              <p className="text-sm text-muted-foreground">Approved engineers will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {approvedRequests.map((request) => (
                <div key={request.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={request.engineer?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-accent-cyan text-white">
                      {request.engineer?.full_name?.charAt(0) || 'E'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium">{request.engineer?.full_name || 'Engineer'}</h4>
                    <p className="text-sm text-muted-foreground">Engineer</p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card className="bg-card/50 border-border/30 border-yellow-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              Pending Requests ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center gap-4 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={request.engineer?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent-blue text-white">
                      {request.engineer?.full_name?.charAt(0) || 'E'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium">{request.engineer?.full_name || 'Engineer'}</h4>
                    <p className="text-sm text-muted-foreground">Wants to join your session</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeclineRequest(request.id)}
                    >
                      Decline
                    </Button>
                    <Button 
                      size="sm"
                      className="bg-green-500 hover:bg-green-600"
                      onClick={() => handleApproveRequest(request.id, request.engineer_id)}
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
