import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { RevenueStream } from '@/hooks/useRevenueStreams';

interface SetGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  streams: RevenueStream[];
}

export const SetGoalDialog = ({ open, onOpenChange, onSuccess, streams }: SetGoalDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [targetAmount, setTargetAmount] = useState('');
  const [period, setPeriod] = useState('monthly');
  const [streamType, setStreamType] = useState<string>('all');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !targetAmount) return;

    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid target amount',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('revenue_goals').insert({
        user_id: user.id,
        target_amount: target,
        period,
        stream_type: streamType === 'all' ? null : streamType,
        current_amount: 0,
      });

      if (error) throw error;

      toast({
        title: 'Goal Created',
        description: `Your ${period} goal of $${target.toLocaleString()} has been set.`,
      });
      
      setTargetAmount('');
      setPeriod('monthly');
      setStreamType('all');
      onSuccess();
    } catch (err) {
      console.error('Error creating goal:', err);
      toast({
        title: 'Error',
        description: 'Failed to create goal',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const suggestedGoals = [500, 1000, 2500, 5000, 10000];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Revenue Goal</DialogTitle>
          <DialogDescription>
            Create a new revenue target to track your progress
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Target Amount */}
          <div className="space-y-2">
            <Label htmlFor="target">Target Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="target"
                type="number"
                placeholder="0.00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="pl-8"
                min="1"
                step="0.01"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {suggestedGoals.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTargetAmount(amount.toString())}
                  className="text-xs"
                >
                  ${amount.toLocaleString()}
                </Button>
              ))}
            </div>
          </div>

          {/* Period */}
          <div className="space-y-2">
            <Label htmlFor="period">Time Period</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stream Type */}
          <div className="space-y-2">
            <Label htmlFor="stream">Revenue Stream</Label>
            <Select value={streamType} onValueChange={setStreamType}>
              <SelectTrigger>
                <SelectValue placeholder="Select stream" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Revenue Streams</SelectItem>
                {streams.map((stream) => (
                  <SelectItem key={stream.id} value={stream.id}>
                    {stream.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !targetAmount}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Goal'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
