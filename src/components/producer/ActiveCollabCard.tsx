import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Music, DollarSign, TrendingUp, ExternalLink } from 'lucide-react';
import type { ProducerPartnership } from '@/types/producer-partnership';

interface ActiveCollabCardProps {
  partnership: ProducerPartnership;
  isProducer: boolean;
  onViewDetails: (id: string) => void;
  onAddRelease?: (id: string) => void;
}

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
};

export const ActiveCollabCard = ({
  partnership,
  isProducer,
  onViewDetails,
  onAddRelease,
}: ActiveCollabCardProps) => {
  const partner = isProducer ? partnership.artist : partnership.producer;
  const partnerRole = isProducer ? 'Artist' : 'Producer';
  const userEarnings = isProducer ? partnership.producer_earnings : partnership.artist_earnings;
  const userPercentage = isProducer ? partnership.producer_percentage : partnership.artist_percentage;

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Beat Cover or Partner Avatar */}
          {partnership.beat?.cover_art_url ? (
            <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
              <img 
                src={partnership.beat.cover_art_url} 
                alt={partnership.beat.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-0 right-0 p-1">
                <Avatar className="h-6 w-6 border-2 border-background">
                  <AvatarImage src={partner?.avatar_url} />
                  <AvatarFallback className="text-xs bg-primary/10">
                    {partner?.full_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          ) : (
            <Avatar className="h-16 w-16">
              <AvatarImage src={partner?.avatar_url} alt={partner?.full_name} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {partner?.full_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
          )}

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-foreground">
                    {partner?.full_name || 'Unknown'}
                  </h4>
                  <Badge variant="secondary" className="text-xs">
                    {partnerRole}
                  </Badge>
                </div>
                {partnership.beat && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                    <Music className="h-3 w-3" />
                    <span className="truncate">{partnership.beat.title}</span>
                  </div>
                )}
              </div>
              <Badge 
                variant="default"
                className="bg-green-500/10 text-green-500 border-green-500/20"
              >
                Active
              </Badge>
            </div>

            {/* Revenue Split Visualization */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Your share: {userPercentage}%</span>
                <span>{partnerRole}: {100 - userPercentage}%</span>
              </div>
              <Progress value={userPercentage} className="h-2" />
            </div>

            {/* Earnings */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="p-2 rounded-md bg-muted/50">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-0.5">
                  <DollarSign className="h-3 w-3" />
                  Your Earnings
                </div>
                <p className="font-semibold text-primary">
                  {formatCurrency(userEarnings * 100)}
                </p>
              </div>
              <div className="p-2 rounded-md bg-muted/50">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-0.5">
                  <TrendingUp className="h-3 w-3" />
                  Total Revenue
                </div>
                <p className="font-semibold">
                  {formatCurrency(partnership.total_revenue * 100)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewDetails(partnership.id)}
                className="gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                View Details
              </Button>
              {onAddRelease && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onAddRelease(partnership.id)}
                  className="gap-1"
                >
                  <Music className="h-3 w-3" />
                  Add Release
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
