import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sliders, Disc3, Briefcase, Handshake, Users, Crown, 
  Store, GraduationCap, Music, Tv, TrendingUp, TrendingDown 
} from 'lucide-react';
import { RevenueStream } from '@/hooks/useRevenueStreams';

interface RevenueStreamCardsProps {
  streams: RevenueStream[];
  loading: boolean;
  totalRevenue: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  sliders: Sliders,
  'disc-3': Disc3,
  briefcase: Briefcase,
  handshake: Handshake,
  users: Users,
  crown: Crown,
  store: Store,
  'graduation-cap': GraduationCap,
  music: Music,
  tv: Tv,
};

export const RevenueStreamCards = ({ streams, loading, totalRevenue }: RevenueStreamCardsProps) => {
  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Revenue Streams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
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

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">10 Revenue Streams</CardTitle>
          <Badge variant="outline" className="text-primary">
            {streams.filter(s => s.amount > 0).length} active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {streams.map((stream) => {
            const Icon = iconMap[stream.icon] || Briefcase;
            const percentage = totalRevenue > 0 ? (stream.amount / totalRevenue) * 100 : 0;
            
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
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${stream.trend >= 0 ? 'text-green-400 border-green-500/30' : 'text-red-400 border-red-500/30'}`}
                    >
                      {stream.trend >= 0 ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {stream.trend >= 0 ? '+' : ''}{stream.trend}%
                    </Badge>
                  </div>
                  
                  <h4 className="font-semibold text-foreground text-sm mb-1 truncate">
                    {stream.name}
                  </h4>
                  
                  <p className="text-xl font-bold text-foreground mb-2">
                    ${stream.amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
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
                  
                  <p className="text-xs text-muted-foreground mt-2 truncate">
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
