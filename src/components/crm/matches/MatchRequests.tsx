import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X, MessageSquare, Clock, Music } from 'lucide-react';

interface MatchRequestsProps {
  userType: 'artist' | 'engineer';
}

export const MatchRequests: React.FC<MatchRequestsProps> = ({ userType }) => {
  const incomingRequests = [
    {
      id: '1',
      name: 'Jordan "BeatDrop" Smith',
      avatar: '',
      message: 'Love your mixing style on trap tracks! Would love to collaborate on my upcoming EP.',
      genres: ['Trap', 'Hip-Hop'],
      projectType: 'EP Mixing',
      budget: '$500-800',
      sentAt: '2 hours ago',
    },
    {
      id: '2',
      name: 'Crystal "Melodic" Waters',
      avatar: '',
      message: 'Your R&B mixes are incredible. I have 3 tracks ready for your magic touch.',
      genres: ['R&B', 'Soul'],
      projectType: 'Single Mixing',
      budget: '$300-500',
      sentAt: '5 hours ago',
    },
  ];

  const outgoingRequests = [
    {
      id: '3',
      name: 'Mike "LowHz" Anderson',
      avatar: '',
      status: 'pending',
      sentAt: '1 day ago',
      projectType: 'Album Mixing',
    },
    {
      id: '4',
      name: 'Elena "VocalQueen" Rodriguez',
      avatar: '',
      status: 'viewed',
      sentAt: '2 days ago',
      projectType: 'Single Mastering',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Incoming Requests ({incomingRequests.length})
        </h3>
        
        <div className="space-y-4">
          {incomingRequests.map((request) => (
            <Card key={request.id} className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={request.avatar} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {request.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-foreground">{request.name}</h4>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {request.sentAt}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1">{request.message}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {request.genres.map((genre) => (
                        <Badge key={genre} variant="outline" className="text-xs">
                          <Music className="h-3 w-3 mr-1" />
                          {genre}
                        </Badge>
                      ))}
                      <Badge variant="secondary" className="text-xs">{request.projectType}</Badge>
                      <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-500">
                        {request.budget}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" className="flex-1 md:flex-none">
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                      <Button variant="ghost" size="sm">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          Sent Requests ({outgoingRequests.length})
        </h3>
        
        <div className="space-y-3">
          {outgoingRequests.map((request) => (
            <Card key={request.id} className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={request.avatar} />
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        {request.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-foreground">{request.name}</h4>
                      <p className="text-xs text-muted-foreground">{request.projectType}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={request.status === 'viewed' ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {request.status === 'viewed' ? 'Viewed' : 'Pending'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{request.sentAt}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
