import { useState } from 'react';
import { Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface ProjectReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  engineerId: string;
  engineerName?: string;
  onReviewSubmitted?: () => void;
}

export const ProjectReviewDialog = ({
  open,
  onOpenChange,
  projectId,
  engineerId,
  engineerName,
  onReviewSubmitted
}: ProjectReviewDialogProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(5);
  const [qualityRating, setQualityRating] = useState(5);
  const [timelinessRating, setTimelinessRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast.error('You must be logged in to submit a review');
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('project_reviews')
        .insert({
          project_id: projectId,
          artist_id: user.id,
          engineer_id: engineerId,
          rating,
          communication_rating: communicationRating,
          quality_rating: qualityRating,
          timeliness_rating: timelinessRating,
          review_text: reviewText,
          would_recommend: wouldRecommend
        });

      if (error) throw error;

      toast.success('Review submitted successfully!');
      onOpenChange(false);
      onReviewSubmitted?.();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const RatingStars = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`h-8 w-8 ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Rate Your Experience with {engineerName || 'the Engineer'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overall Rating */}
          <RatingStars
            value={rating}
            onChange={setRating}
            label="Overall Rating"
          />

          {/* Detailed Ratings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RatingStars
              value={communicationRating}
              onChange={setCommunicationRating}
              label="Communication"
            />
            <RatingStars
              value={qualityRating}
              onChange={setQualityRating}
              label="Quality"
            />
            <RatingStars
              value={timelinessRating}
              onChange={setTimelinessRating}
              label="Timeliness"
            />
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <Label>Share Your Experience (Optional)</Label>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell us about your experience working with this engineer..."
              className="min-h-[120px]"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">
              {reviewText.length}/1000 characters
            </p>
          </div>

          {/* Recommendation */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="recommend"
              checked={wouldRecommend}
              onChange={(e) => setWouldRecommend(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="recommend" className="cursor-pointer">
              I would recommend this engineer to others
            </Label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
