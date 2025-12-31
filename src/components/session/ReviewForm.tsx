import { useState } from "react";
import { motion } from "framer-motion";
import { Star, ThumbsUp, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReviewFormProps {
  sessionId: string;
  reviewedId: string;
  reviewedName: string;
  reviewType: "artist_to_engineer" | "engineer_to_artist";
  onComplete: () => void;
}

const RatingStars = ({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (val: number) => void;
  label: string;
}) => (
  <div className="space-y-2">
    <Label className="text-sm text-muted-foreground">{label}</Label>
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`h-6 w-6 ${
              star <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  </div>
);

export function ReviewForm({
  sessionId,
  reviewedId,
  reviewedName,
  reviewType,
  onComplete,
}: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [professionalismRating, setProfessionalismRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(5);
  const [qualityRating, setQualityRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [wouldWorkAgain, setWouldWorkAgain] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be logged in to submit a review");
        return;
      }

      const { error } = await supabase.from("reviews" as any).insert({
        session_id: sessionId,
        reviewer_id: user.id,
        reviewed_id: reviewedId,
        rating,
        review_text: reviewText || null,
        review_type: reviewType,
        professionalism_rating: professionalismRating,
        communication_rating: communicationRating,
        quality_rating: qualityRating,
        would_work_again: wouldWorkAgain,
        is_public: isPublic,
      });

      if (error) throw error;

      toast.success("Review submitted successfully!");
      onComplete();
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast.error(error.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6 bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border"
    >
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Rate Your Experience</h3>
        <p className="text-muted-foreground text-sm">
          How was working with <span className="text-primary">{reviewedName}</span>?
        </p>
      </div>

      <RatingStars value={rating} onChange={setRating} label="Overall Rating" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <RatingStars
          value={professionalismRating}
          onChange={setProfessionalismRating}
          label="Professionalism"
        />
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-text">
          <MessageSquare className="h-4 w-4 inline mr-2" />
          Your Review (Optional)
        </Label>
        <Textarea
          id="review-text"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your experience working together..."
          rows={4}
          className="resize-none"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <Label htmlFor="would-work-again" className="cursor-pointer">
            <ThumbsUp className="h-4 w-4 inline mr-2" />
            Would work again
          </Label>
          <Switch
            id="would-work-again"
            checked={wouldWorkAgain}
            onCheckedChange={setWouldWorkAgain}
          />
        </div>

        <div className="flex items-center justify-between sm:justify-start gap-3">
          <Label htmlFor="is-public" className="cursor-pointer">
            Make review public
          </Label>
          <Switch
            id="is-public"
            checked={isPublic}
            onCheckedChange={setIsPublic}
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
        size="lg"
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </motion.form>
  );
}
