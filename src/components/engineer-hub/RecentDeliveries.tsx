import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Star, Clock } from 'lucide-react';
import { formatDistanceToNow, differenceInDays } from 'date-fns';

export default function RecentDeliveries() {
  const { data: deliveries, isLoading } = useQuery({
    queryKey: ['recent-deliveries'],
    queryFn: async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          created_at,
          updated_at,
          deadline,
          engineer:profiles!projects_engineer_id_fkey(full_name, avatar_url),
          review:project_reviews(rating, review_text)
        `)
        .eq('status', 'completed')
        .gte('updated_at', sevenDaysAgo)
        .order('updated_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card/30 backdrop-blur-sm border-white/5">
            <CardContent className="p-4 flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-48" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!deliveries || deliveries.length === 0) {
    return (
      <Card className="bg-card/30 backdrop-blur-sm border-white/5">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No recent deliveries</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {deliveries.map((delivery) => {
        const rating = delivery.review?.[0]?.rating || 0;
        const reviewText = delivery.review?.[0]?.review_text;
        const daysToComplete = delivery.created_at && delivery.updated_at 
          ? differenceInDays(new Date(delivery.updated_at), new Date(delivery.created_at))
          : 0;
        const wasOnTime = delivery.deadline 
          ? new Date(delivery.updated_at) <= new Date(delivery.deadline)
          : true;

        return (
          <Card key={delivery.id} className="bg-card/30 backdrop-blur-sm border-white/5 hover:border-primary/20 transition-all">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-12 h-12 ring-2 ring-primary/30">
                  <AvatarImage src={delivery.engineer?.avatar_url || ''} />
                  <AvatarFallback>{delivery.engineer?.full_name?.charAt(0) || 'E'}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm truncate">{delivery.title}</h4>
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">
                    by {delivery.engineer?.full_name || 'Engineer'} • {formatDistanceToNow(new Date(delivery.updated_at), { addSuffix: true })}
                  </p>

                  <div className="flex items-center gap-3 mb-2">
                    {rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{rating.toFixed(1)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{daysToComplete}d</span>
                      {wasOnTime && <Badge variant="secondary" className="text-xs ml-1">On Time</Badge>}
                    </div>
                  </div>

                  {reviewText && (
                    <p className="text-xs text-muted-foreground italic line-clamp-2">
                      "{reviewText}"
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
