import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ThumbsUp, Edit2, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    useProductReviews,
    useProductRating,
    useSubmitReview,
    useHasReviewed,
    type ProductRatingStats
} from '@/hooks/useProductReviews';
import { useAuth } from '@/hooks/useAuth';

interface ProductReviewsProps {
    productId: string;
    productName?: string;
}

/** Star rating input component */
function StarRating({ value, onChange, size = 'md' }: { value: number; onChange?: (v: number) => void; size?: 'sm' | 'md' | 'lg' }) {
    const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`${sizes[size]} ${star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'} ${onChange ? 'cursor-pointer hover:text-yellow-400 transition-colors' : ''}`}
                    onClick={() => onChange?.(star)}
                />
            ))}
        </div>
    );
}

/** Rating breakdown bar chart */
function RatingBreakdown({ stats }: { stats: ProductRatingStats }) {
    const maxCount = Math.max(...Object.values(stats.distribution), 1);

    return (
        <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.distribution[star] || 0;
                const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                return (
                    <div key={star} className="flex items-center gap-2 text-sm">
                        <span className="w-3 text-muted-foreground">{star}</span>
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                        <span className="w-8 text-right text-muted-foreground text-xs">{count}</span>
                    </div>
                );
            })}
        </div>
    );
}

/** Review form */
function ReviewForm({ productId, onClose }: { productId: string; onClose: () => void }) {
    const [rating, setRating] = useState(5);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const submitReview = useSubmitReview();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        (submitReview as any).mutate({ productId, rating, title, body }, {
            onSuccess: () => onClose(),
        });
    };

    return (
        <Card className="p-6 border-primary/20">
            <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-semibold text-lg">Write a Review</h3>

                <div className="space-y-2">
                    <Label>Rating</Label>
                    <StarRating value={rating} onChange={setRating} size="lg" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="review-title">Title</Label>
                    <Input
                        id="review-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Summarize your experience"
                        required
                        maxLength={100}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="review-body">Your Review</Label>
                    <Textarea
                        id="review-body"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="What did you like or dislike?"
                        required
                        rows={4}
                        maxLength={1000}
                    />
                </div>

                <div className="flex gap-3">
                    <Button type="submit" disabled={submitReview.isPending}>
                        {submitReview.isPending ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                        ) : (
                            'Submit Review'
                        )}
                    </Button>
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                </div>
            </form>
        </Card>
    );
}

export function ProductReviews({ productId, productName }: ProductReviewsProps) {
    const { user } = useAuth();
    const [page, setPage] = useState(1);
    const [showForm, setShowForm] = useState(false);
    const { data: reviewsData, isLoading } = useProductReviews(productId, page);
    const { data: stats } = useProductRating(productId);
    const { data: hasReviewed } = useHasReviewed(productId);

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="space-y-6">
            {/* Header with aggregate stats */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6 }}
                className="flex flex-col md:flex-row gap-6 items-start"
            >
                <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-1">
                        Reviews {productName && <span className="text-muted-foreground font-normal">for {productName}</span>}
                    </h2>
                    {stats && stats.total > 0 && (
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-4xl font-bold">{stats.average}</span>
                            <div>
                                <StarRating value={Math.round(stats.average)} />
                                <p className="text-sm text-muted-foreground mt-0.5">{stats.total} review{stats.total !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                    )}
                </div>

                {stats && stats.total > 0 && (
                    <Card className="p-4 min-w-[200px]">
                        <RatingBreakdown stats={stats} />
                    </Card>
                )}
            </motion.div>

            {/* Write review button */}
            {user && !showForm && (
                <Button
                    variant={hasReviewed ? 'outline' : 'default'}
                    onClick={() => setShowForm(true)}
                    className="gap-2"
                >
                    {hasReviewed ? <><Edit2 className="w-4 h-4" /> Edit Your Review</> : 'Write a Review'}
                </Button>
            )}

            {/* Review form */}
            {showForm && <ReviewForm productId={productId} onClose={() => setShowForm(false)} />}

            {/* Reviews list */}
            {isLoading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
            ) : reviewsData?.reviews.length === 0 ? (
                <Card className="p-8 text-center">
                    <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {reviewsData?.reviews.map((review, idx) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-30px' }}
                            transition={{ duration: 0.4, delay: idx * 0.05 }}
                        >
                            <Card className="p-5">
                                <div className="flex items-start gap-3">
                                    <Avatar className="w-9 h-9">
                                        <AvatarImage src={review.user_avatar} />
                                        <AvatarFallback>{(review.user_name || 'A')[0].toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-sm">{review.user_name}</span>
                                            <span className="text-xs text-muted-foreground">•</span>
                                            <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
                                        </div>
                                        <StarRating value={review.rating} size="sm" />
                                        <h4 className="font-semibold mt-2">{review.title}</h4>
                                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{review.body}</p>
                                        {review.helpful_count !== undefined && review.helpful_count > 0 && (
                                            <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                                                <ThumbsUp className="w-3.5 h-3.5" />
                                                <span>{review.helpful_count} found this helpful</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {reviewsData && reviewsData.total > 10 && (
                <div className="flex justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        Previous
                    </Button>
                    <span className="flex items-center text-sm text-muted-foreground px-3">
                        Page {page}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!reviewsData.hasMore}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
