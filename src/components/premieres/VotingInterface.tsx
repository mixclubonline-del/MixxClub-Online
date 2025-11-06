import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface VotingInterfaceProps {
  premiere: any;
  existingVotes: any[];
  onClose: () => void;
}

const VOTE_CATEGORIES = [
  { type: 'overall', label: 'Overall', icon: '⭐' },
  { type: 'mix_quality', label: 'Mix Quality', icon: '🎛️' },
  { type: 'production', label: 'Production', icon: '🎵' },
  { type: 'creativity', label: 'Creativity', icon: '🎨' },
  { type: 'vibe', label: 'Vibe', icon: '✨' },
];

export default function VotingInterface({ premiere, existingVotes, onClose }: VotingInterfaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [votes, setVotes] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    existingVotes.forEach(vote => {
      initial[vote.vote_type] = vote.vote_value;
    });
    return initial;
  });
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleStarClick = (category: string, rating: number) => {
    setVotes(prev => ({ ...prev, [category]: rating }));
  };

  const handleSubmit = async () => {
    if (!user || Object.keys(votes).length === 0) return;

    try {
      setSubmitting(true);

      // Insert or update votes
      for (const [voteType, voteValue] of Object.entries(votes)) {
        const { error } = await supabase
          .from('premiere_votes')
          .upsert({
            premiere_id: premiere.id,
            user_id: user.id,
            vote_type: voteType,
            vote_value: voteValue,
            feedback: voteType === 'overall' ? feedback : null,
          }, {
            onConflict: 'premiere_id,user_id,vote_type',
          });

        if (error) throw error;
      }

      toast({
        title: "Vote submitted!",
        description: "Thank you for your feedback. You earned 10 points!",
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Error submitting vote",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Rate "{premiere.title}"</DialogTitle>
          <DialogDescription>
            Help the artist by providing your honest feedback across different categories.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {VOTE_CATEGORIES.map(category => (
            <div key={category.type} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <span className="text-lg">{category.icon}</span>
                  {category.label}
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => handleStarClick(category.type, rating)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          votes[category.type] >= rating
                            ? 'fill-accent text-accent'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Feedback (Optional)</label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your thoughts about the track..."
              className="min-h-[100px]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || Object.keys(votes).length === 0}
            className="bg-gradient-to-r from-accent to-accent-blue"
          >
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Submit Vote
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
