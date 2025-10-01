import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface Review {
  id: string;
  rating: number;
  communication_rating: number;
  quality_rating: number;
  timeliness_rating: number;
  review_text: string | null;
  would_recommend: boolean;
  created_at: string;
  artist_id: string;
  profiles?: {
    full_name: string | null;
  };
}

interface EngineerReviewsProps {
  engineerId: string;
}

export const EngineerReviews = ({ engineerId }: EngineerReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    avgCommunication: 0,
    avgQuality: 0,
    avgTimeliness: 0,
    recommendationRate: 0
  });

  useEffect(() => {
    fetchReviews();
  }, [engineerId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('project_reviews')
        .select(`
          *,
          profiles:artist_id (
            full_name
          )
        `)
        .eq('engineer_id', engineerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReviews(data || []);
      
      // Calculate stats
      if (data && data.length > 0) {
        const totalReviews = data.length;
        const avgRating = data.reduce((sum, r) => sum + Number(r.rating), 0) / totalReviews;
        const avgComm = data.reduce((sum, r) => sum + Number(r.communication_rating || 0), 0) / totalReviews;
        const avgQual = data.reduce((sum, r) => sum + Number(r.quality_rating || 0), 0) / totalReviews;
        const avgTime = data.reduce((sum, r) => sum + Number(r.timeliness_rating || 0), 0) / totalReviews;
        const recommendations = data.filter(r => r.would_recommend).length;
        
        setStats({
          averageRating: avgRating,
          totalReviews,
          avgCommunication: avgComm,
          avgQuality: avgQual,
          avgTimeliness: avgTime,
          recommendationRate: (recommendations / totalReviews) * 100
        });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-2 text-sm font-medium">{rating.toFixed(1)}</span>
    </div>
  );

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading reviews...</div>;
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No reviews yet
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {stats.averageRating.toFixed(1)}
              </div>
              <StarRating rating={stats.averageRating} />
              <p className="text-sm text-muted-foreground mt-1">
                {stats.totalReviews} reviews
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold mb-2">Communication</div>
              <StarRating rating={stats.avgCommunication} />
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold mb-2">Quality</div>
              <StarRating rating={stats.avgQuality} />
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold mb-2">Timeliness</div>
              <StarRating rating={stats.avgTimeliness} />
            </div>
          </div>
          
          {stats.recommendationRate > 0 && (
            <div className="mt-4 p-4 bg-primary/5 rounded-lg text-center">
              <p className="text-lg font-semibold">
                {stats.recommendationRate.toFixed(0)}% of clients would recommend this engineer
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarFallback>
                    {review.profiles?.full_name?.[0] || 'A'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold">
                        {review.profiles?.full_name || 'Anonymous'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>

                  <div className="flex gap-4 mb-3">
                    {review.communication_rating && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Communication:</span> {review.communication_rating}/5
                      </div>
                    )}
                    {review.quality_rating && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Quality:</span> {review.quality_rating}/5
                      </div>
                    )}
                    {review.timeliness_rating && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Timeliness:</span> {review.timeliness_rating}/5
                      </div>
                    )}
                  </div>

                  {review.review_text && (
                    <p className="text-sm text-foreground mb-3">{review.review_text}</p>
                  )}

                  {review.would_recommend && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      ✓ Recommends
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
