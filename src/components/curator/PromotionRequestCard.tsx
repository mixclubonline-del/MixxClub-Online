import { useCuratorPromotions, PromotionRequest } from '@/hooks/useCuratorPromotions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Music, 
  Coins, 
  CheckCircle2, 
  XCircle,
  Clock,
  Play,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PromotionRequestCardProps {
  request: PromotionRequest;
}

export const PromotionRequestCard = ({ request }: PromotionRequestCardProps) => {
  const { acceptPromotion, declinePromotion, completePromotion, isAccepting, isDeclining, isCompleting } = useCuratorPromotions();

  const statusColors = {
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    accepted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    declined: 'bg-red-500/20 text-red-400 border-red-500/30',
    cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  const artistProfile = request.artist_profile as any;

  return (
    <Card variant="glass" className="overflow-hidden">
      <CardContent className="pt-4">
        <div className="flex items-start gap-4">
          {/* Artist Avatar */}
          <Avatar className="w-12 h-12 ring-2 ring-primary/20">
            <AvatarImage src={artistProfile?.avatar_url} />
            <AvatarFallback>
              {artistProfile?.full_name?.[0] || 'A'}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">
                  {artistProfile?.full_name || 'Artist'}
                  {artistProfile?.username && (
                    <span className="text-muted-foreground text-sm ml-1">
                      @{artistProfile.username}
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Music className="w-3.5 h-3.5 text-primary" />
                  <span className="text-sm font-medium truncate">
                    {request.track_title || 'Untitled Track'}
                  </span>
                </div>
              </div>
              <Badge variant="outline" className={statusColors[request.status]}>
                {request.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                {request.status === 'accepted' && <Play className="w-3 h-3 mr-1" />}
                {request.status === 'completed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                {request.status}
              </Badge>
            </div>

            {/* Payment Badge */}
            <div className="flex items-center gap-2 mt-3">
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                <Coins className="w-3 h-3 mr-1" />
                {request.payment_amount} MixxCoinz
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
              </span>
            </div>

            {/* Artist Notes */}
            {request.artist_notes && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                "{request.artist_notes}"
              </p>
            )}

            {/* Track Preview Link */}
            {request.track_url && (
              <a 
                href={request.track_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
              >
                <ExternalLink className="w-3 h-3" />
                Preview Track
              </a>
            )}

            {/* Actions */}
            {request.status === 'pending' && (
              <div className="flex gap-2 mt-4">
                <Button 
                  size="sm" 
                  onClick={() => acceptPromotion(request.id)}
                  disabled={isAccepting}
                  className="flex-1"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Accept
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => declinePromotion({ requestId: request.id, reason: 'Not a fit' })}
                  disabled={isDeclining}
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Decline
                </Button>
              </div>
            )}

            {request.status === 'accepted' && (
              <Button 
                size="sm" 
                onClick={() => completePromotion({ requestId: request.id })}
                disabled={isCompleting}
                className="mt-4"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Mark as Placed
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
