import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Target, Trophy, Trash2, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Goal {
  id: string;
  target_amount: number;
  current_amount: number;
  period: string;
  stream_type: string | null;
  start_date: string;
  end_date: string | null;
  is_achieved: boolean;
}

interface GoalCardProps {
  goal: Goal;
  onUpdate: () => void;
}

const streamLabels: Record<string, string> = {
  mixing: 'Mixing Services',
  mastering: 'Mastering',
  projects: 'Project Payments',
  partnerships: 'Partnership Splits',
  referrals: 'Referral Bonuses',
  subscriptions: 'Subscription Revenue',
  marketplace: 'Marketplace Sales',
  courses: 'Course Sales',
  royalties: 'Streaming Royalties',
  licensing: 'Sync Licensing',
};

const periodLabels: Record<string, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

export const GoalCard = ({ goal, onUpdate }: GoalCardProps) => {
  const { toast } = useToast();
  const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
  const remaining = Math.max(goal.target_amount - goal.current_amount, 0);

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('revenue_goals')
        .delete()
        .eq('id', goal.id);

      if (error) throw error;

      toast({
        title: 'Goal Deleted',
        description: 'The goal has been removed.',
      });
      onUpdate();
    } catch (err) {
      console.error('Error deleting goal:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete goal',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className={`border-border ${goal.is_achieved ? 'bg-yellow-500/5 border-yellow-500/30' : 'bg-muted/30'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {goal.is_achieved ? (
              <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-yellow-400" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
              </div>
            )}
            <div>
              <h4 className="font-semibold text-foreground text-sm">
                {goal.stream_type ? streamLabels[goal.stream_type] : 'Total Revenue'}
              </h4>
              <Badge variant="outline" className="text-xs">
                {periodLabels[goal.period] || goal.period}
              </Badge>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">{progress.toFixed(1)}%</span>
          </div>
          
          <Progress 
            value={progress} 
            className={`h-2 ${goal.is_achieved ? '[&>div]:bg-yellow-400' : ''}`}
          />
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-foreground">
              ${goal.current_amount.toFixed(0)}
            </span>
            <span className="text-sm text-muted-foreground">
              / ${goal.target_amount.toFixed(0)}
            </span>
          </div>

          {!goal.is_achieved && remaining > 0 && (
            <p className="text-xs text-muted-foreground">
              ${remaining.toFixed(0)} to go
            </p>
          )}

          {goal.is_achieved && (
            <Badge className="w-full justify-center bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              🎉 Goal Achieved!
            </Badge>
          )}

          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
            <Calendar className="w-3 h-3" />
            Started {format(new Date(goal.start_date), 'MMM d, yyyy')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
