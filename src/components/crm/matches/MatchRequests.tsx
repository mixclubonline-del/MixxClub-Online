import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X, MessageSquare, Clock, Music, Loader2 } from 'lucide-react';
import { useMatchesAPI } from '@/hooks/useMatchesAPI';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface MatchRequestsProps {
  userType: 'artist' | 'engineer' | 'producer';
}

export const MatchRequests: React.FC<MatchRequestsProps> = ({ userType }) => {
  const navigate = useNavigate();
  const {
    incomingRequests,
    outgoingRequests,
    acceptRequest,
    declineRequest,
    loading
  } = useMatchesAPI(userType);

  const handleReply = (senderId: string) => {
    navigate(`/${userType}-crm?tab=messages&contact=${senderId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading requests...</p>
      </div>
    );
  }

  const pendingIncoming = incomingRequests.filter(r => r.status === 'pending');
  const pendingOutgoing = outgoingRequests.filter(r => r.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Incoming Requests */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Incoming Requests ({pendingIncoming.length})
        </h3>

        {pendingIncoming.length === 0 ? (
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No pending requests</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingIncoming.map((request) => (
              <Card key={request.id} className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={request.senderAvatar} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {request.senderName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground">{request.senderName}</h4>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(request.createdAt, { addSuffix: true })}
                        </span>
                      </div>

                      {request.message && (
                        <p className="text-sm text-muted-foreground mt-1">{request.message}</p>
                      )}

                      <div className="flex flex-wrap gap-2 mt-2">
                        {request.genres.map((genre) => (
                          <Badge key={genre} variant="outline" className="text-xs">
                            <Music className="h-3 w-3 mr-1" />
                            {genre}
                          </Badge>
                        ))}
                        <Badge variant="secondary" className="text-xs">{request.projectType}</Badge>
                        {request.budgetRange && (
                          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                            {request.budgetRange}
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button size="sm" className="flex-1 md:flex-none" onClick={() => acceptRequest(request.id)}>
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 md:flex-none"
                          onClick={() => handleReply(request.senderId)}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Reply
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => declineRequest(request.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Outgoing Requests */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          Sent Requests ({pendingOutgoing.length})
        </h3>

        {pendingOutgoing.length === 0 ? (
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-8 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No pending requests sent</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pendingOutgoing.map((request) => (
              <Card key={request.id} className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={request.recipientAvatar} />
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          {request.recipientName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-foreground">{request.recipientName}</h4>
                        <p className="text-xs text-muted-foreground">{request.projectType}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge
                        variant={request.status === 'accepted' ? 'default' : 'outline'}
                        className="text-xs"
                      >
                        {request.status === 'pending' ? 'Pending' :
                          request.status === 'accepted' ? 'Accepted' :
                            request.status === 'declined' ? 'Declined' : 'Expired'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(request.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Past Requests (non-pending) */}
      {(incomingRequests.filter(r => r.status !== 'pending').length > 0 ||
        outgoingRequests.filter(r => r.status !== 'pending').length > 0) && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              Past Requests
            </h3>

            <div className="space-y-3">
              {[...incomingRequests, ...outgoingRequests]
                .filter(r => r.status !== 'pending')
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .slice(0, 5)
                .map((request) => {
                  const isIncoming = incomingRequests.some(r => r.id === request.id);
                  const otherPerson = isIncoming ? request.senderName : request.recipientName;

                  return (
                    <Card key={request.id} className="bg-card/30 backdrop-blur-sm border-border/30">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                {otherPerson.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {isIncoming ? 'From' : 'To'} {otherPerson}
                              </p>
                              <p className="text-xs text-muted-foreground">{request.projectType}</p>
                            </div>
                          </div>
                          <Badge
                            variant={request.status === 'accepted' ? 'default' : 'secondary'}
                            className={`text-xs ${request.status === 'accepted' ? 'bg-primary/20 text-primary' :
                                request.status === 'declined' ? 'bg-destructive/20 text-destructive' :
                                  ''
                              }`}
                          >
                            {request.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>
        )}
    </div>
  );
};
