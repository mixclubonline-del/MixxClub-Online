import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface ReviewStarsProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

export function ReviewStars({ rating, size = "md", showValue = false }: ReviewStarsProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.div
          key={star}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: star * 0.05 }}
        >
          <Star
            className={`${sizeClasses[size]} ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/30"
            }`}
          />
        </motion.div>
      ))}
      {showValue && (
        <span className="ml-1 text-sm font-medium text-muted-foreground">
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
}

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    review_text?: string | null;
    professionalism_rating?: number | null;
    communication_rating?: number | null;
    quality_rating?: number | null;
    would_work_again?: boolean;
    created_at: string;
    reviewer_name?: string;
  };
}

export function ReviewCard({ review }: ReviewCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border space-y-3"
    >
      <div className="flex items-start justify-between">
        <div>
          {review.reviewer_name && (
            <p className="font-medium text-sm mb-1">{review.reviewer_name}</p>
          )}
          <ReviewStars rating={review.rating} />
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDate(review.created_at)}
        </span>
      </div>

      {review.review_text && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {review.review_text}
        </p>
      )}

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        {review.professionalism_rating && (
          <div className="flex items-center gap-1">
            <span>Professionalism:</span>
            <ReviewStars rating={review.professionalism_rating} size="sm" />
          </div>
        )}
        {review.communication_rating && (
          <div className="flex items-center gap-1">
            <span>Communication:</span>
            <ReviewStars rating={review.communication_rating} size="sm" />
          </div>
        )}
        {review.quality_rating && (
          <div className="flex items-center gap-1">
            <span>Quality:</span>
            <ReviewStars rating={review.quality_rating} size="sm" />
          </div>
        )}
      </div>

      {review.would_work_again && (
        <div className="flex items-center gap-1 text-xs text-green-500">
          <span>✓ Would work again</span>
        </div>
      )}
    </motion.div>
  );
}
