import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, MessageSquare, Music } from 'lucide-react';
import type { ProducerPartnership } from '@/types/producer-partnership';

interface CollabRequestCardProps {
  partnership: ProducerPartnership;
  isProducer: boolean;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onNegotiate?: (id: string) => void;
}

export const CollabRequestCard = ({
  partnership,
  isProducer,
  onAccept,
  onDecline,
  onNegotiate,
}: CollabRequestCardProps) => {
  const partner = isProducer ? partnership.artist : partnership.producer;
  const partnerRole = isProducer ? 'Artist' : 'Producer';
  const proposedSplit = isProducer 
    ? partnership.producer_percentage 
    : partnership.artist_percentage;

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Partner Avatar */}
          <Avatar className="h-12 w-12">
            <AvatarImage src={partner?.avatar_url} alt={partner?.full_name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {partner?.full_name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {/* Partner Info */}
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-foreground truncate">
                {partner?.full_name || 'Unknown'}
              </h4>
              <Badge variant="secondary" className="text-xs">
                {partnerRole}
              </Badge>
            </div>

            {partner?.username && (
              <p className="text-sm text-muted-foreground mb-2">
                @{partner.username}
              </p>
            )}

            {/* Beat Info */}
            {partnership.beat && (
              <div className="flex items-center gap-2 mb-3 p-2 rounded-md bg-muted/50">
                <Music className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium truncate">
                  {partnership.beat.title}
                </span>
              </div>
            )}

            {/* Proposed Split */}
            <div className="flex items-center justify-between mb-3 p-2 rounded-md bg-primary/5 border border-primary/20">
              <span className="text-sm text-muted-foreground">Proposed split:</span>
              <div className="flex gap-2 text-sm">
                <span className="font-medium text-primary">
                  You: {proposedSplit}%
                </span>
                <span className="text-muted-foreground">|</span>
                <span className="font-medium">
                  {partnerRole}: {100 - proposedSplit}%
                </span>
              </div>
            </div>

            {/* Notes */}
            {partnership.notes && (
              <p className="text-sm text-muted-foreground mb-3 italic">
                "{partnership.notes}"
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => onAccept(partnership.id)}
                className="gap-1"
              >
                <Check className="h-4 w-4" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDecline(partnership.id)}
                className="gap-1"
              >
                <X className="h-4 w-4" />
                Decline
              </Button>
              {onNegotiate && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onNegotiate(partnership.id)}
                  className="gap-1"
                >
                  <MessageSquare className="h-4 w-4" />
                  Negotiate
                </Button>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <Badge 
            variant={partnership.status === 'proposed' ? 'default' : 'secondary'}
            className="shrink-0"
          >
            {partnership.status === 'proposed' ? 'New' : 'Negotiating'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
