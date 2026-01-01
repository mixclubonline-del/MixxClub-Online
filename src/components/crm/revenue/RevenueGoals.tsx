import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, Plus, Trophy, TrendingUp } from 'lucide-react';
import { GoalCard } from './GoalCard';
import { SetGoalDialog } from './SetGoalDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { RevenueAnalytics } from '@/hooks/useRevenueStreams';

interface RevenueGoal {
  id: string;
  target_amount: number;
  current_amount: number;
  period: string;
  stream_type: string | null;
  start_date: string;
  end_date: string | null;
  is_achieved: boolean;
}

interface RevenueGoalsProps {
  analytics: RevenueAnalytics | null;
  loading: boolean;
}

export const RevenueGoals = ({ analytics, loading }: RevenueGoalsProps) => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<RevenueGoal[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchGoals = async () => {
    if (!user?.id) return;
    
    setGoalsLoading(true);
    try {
      const { data, error } = await supabase
        .from('revenue_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (err) {
      console.error('Error fetching goals:', err);
    } finally {
      setGoalsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user?.id]);

  // Update current amounts based on analytics
  useEffect(() => {
    if (analytics && goals.length > 0) {
      const updatedGoals = goals.map(goal => {
        let currentAmount = 0;
        
        if (goal.stream_type) {
          const stream = analytics.streams.find(s => s.id === goal.stream_type);
          currentAmount = stream?.amount || 0;
        } else {
          currentAmount = goal.period === 'monthly' 
            ? analytics.thisMonth 
            : analytics.totalRevenue;
        }
        
        return { ...goal, current_amount: currentAmount };
      });
      
      setGoals(updatedGoals);
    }
  }, [analytics]);

  const handleGoalCreated = () => {
    setDialogOpen(false);
    fetchGoals();
  };

  const activeGoals = goals.filter(g => !g.is_achieved);
  const achievedGoals = goals.filter(g => g.is_achieved);

  if (loading || goalsLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Revenue Goals</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track your financial milestones
              </p>
            </div>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Set Goal
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Active Goals */}
        {activeGoals.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-foreground">Active Goals</h4>
              <Badge variant="outline">{activeGoals.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeGoals.map((goal) => (
                <GoalCard 
                  key={goal.id} 
                  goal={goal} 
                  onUpdate={fetchGoals}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-border rounded-lg">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-semibold text-foreground mb-2">No Active Goals</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Set your first revenue goal to start tracking your progress
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Goal
            </Button>
          </div>
        )}

        {/* Achieved Goals */}
        {achievedGoals.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <h4 className="font-semibold text-foreground">Achieved Goals</h4>
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                {achievedGoals.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievedGoals.slice(0, 4).map((goal) => (
                <GoalCard 
                  key={goal.id} 
                  goal={goal} 
                  onUpdate={fetchGoals}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <SetGoalDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        onSuccess={handleGoalCreated}
        streams={analytics?.streams || []}
      />
    </Card>
  );
};
