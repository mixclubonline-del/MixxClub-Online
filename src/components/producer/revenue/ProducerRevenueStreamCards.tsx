import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Disc3, Crown, Music, Handshake, Tv, Package,
  TrendingUp, TrendingDown 
} from 'lucide-react';
import type { ProducerRevenueStream } from '@/hooks/useProducerRevenueStreams';

interface ProducerRevenueStreamCardsProps {
  streams: ProducerRevenueStream[];
  loading: boolean;
  totalRevenue: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'disc-3': Disc3,
  'crown': Crown,
  'music': Music,
  'handshake': Handshake,
  'tv': Tv,
  'package': Package,
};

export const ProducerRevenueStreamCards = ({ streams, loading, totalRevenue }: ProducerRevenueStreamCardsProps) => {
  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Revenue Streams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-muted/50 border-border">
                <CardContent className="p-4">
                  <Skeleton className="h-10 w-10 rounded-lg mb-3" />
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-20 mb-2" />
                  <Skeleton className="h-2 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeStreams = streams.filter(s => s.displayAmount > 0).length;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Producer Revenue Streams</CardTitle>
          <Badge variant="outline" className="text-primary">
            {activeStreams} active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {streams.map((stream) => {
            const Icon = iconMap[stream.icon] || Disc3;
            const percentage = totalRevenue > 0 ? (stream.displayAmount / totalRevenue) * 100 : 0;
            
            return (
              <Card 
                key={stream.id} 
                className="bg-muted/30 border-border hover:border-primary/50 transition-all hover:shadow-lg group"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${stream.color}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: stream.color }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {stream.transactionCount} sales
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${stream.trend >= 0 ? 'text-green-400 border-green-500/30' : 'text-red-400 border-red-500/30'}`}
                      >
                        {stream.trend >= 0 ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {stream.trend >= 0 ? '+' : ''}{stream.trend.toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                  
                  <h4 className="font-semibold text-foreground text-sm mb-1">
                    {stream.name}
                  </h4>
                  
                  <p className="text-xl font-bold text-foreground mb-2">
                    ${stream.displayAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  
                  <div className="space-y-1">
                    <Progress 
                      value={percentage} 
                      className="h-1.5"
                    />
                    <p className="text-xs text-muted-foreground">
                      {percentage.toFixed(1)}% of total
                    </p>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    {stream.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
