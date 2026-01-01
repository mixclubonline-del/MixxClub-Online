import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Target, 
  DollarSign, 
  Calendar,
  CheckCircle2,
  Circle,
  GripVertical,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Milestone {
  id: string;
  title: string;
  description?: string;
  status: string;
  payment_amount?: number;
  due_date?: string;
  completed_at?: string;
  deliverables?: { id: string; title: string; completed: boolean }[];
}

interface MilestoneTrackerProps {
  projectId: string;
}

export const MilestoneTracker = ({ projectId }: MilestoneTrackerProps) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    payment_amount: '',
    due_date: '',
  });

  useEffect(() => {
    fetchMilestones();
  }, [projectId]);

  const fetchMilestones = async () => {
    try {
      const { data, error } = await supabase
        .from('project_milestones')
        .select('*')
        .eq('project_id', projectId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      
      // Transform data to match our interface
      const transformed = (data || []).map(m => ({
        ...m,
        deliverables: Array.isArray(m.deliverables) 
          ? m.deliverables.map((d: any) => ({
              id: d.id || crypto.randomUUID(),
              title: d.title || '',
              completed: d.completed || false,
            }))
          : [],
      }));
      
      setMilestones(transformed);
    } catch (error) {
      console.error('Error fetching milestones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMilestone = async () => {
    if (!newMilestone.title) {
      toast.error('Please enter a milestone title');
      return;
    }

    try {
      const { error } = await supabase
        .from('project_milestones')
        .insert({
          project_id: projectId,
          title: newMilestone.title,
          payment_amount: newMilestone.payment_amount ? parseFloat(newMilestone.payment_amount) : null,
          due_date: newMilestone.due_date || null,
          status: 'pending',
          deliverables: [],
        });

      if (error) throw error;

      toast.success('Milestone added');
      setNewMilestone({ title: '', payment_amount: '', due_date: '' });
      setShowAddForm(false);
      fetchMilestones();
    } catch (error) {
      console.error('Error adding milestone:', error);
      toast.error('Failed to add milestone');
    }
  };

  const handleToggleMilestone = async (milestone: Milestone) => {
    const newStatus = milestone.status === 'completed' ? 'pending' : 'completed';
    
    try {
      const { error } = await supabase
        .from('project_milestones')
        .update({
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
        })
        .eq('id', milestone.id);

      if (error) throw error;
      fetchMilestones();
    } catch (error) {
      console.error('Error updating milestone:', error);
      toast.error('Failed to update milestone');
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    try {
      const { error } = await supabase
        .from('project_milestones')
        .delete()
        .eq('id', milestoneId);

      if (error) throw error;
      toast.success('Milestone deleted');
      fetchMilestones();
    } catch (error) {
      console.error('Error deleting milestone:', error);
      toast.error('Failed to delete milestone');
    }
  };

  const completedCount = milestones.filter(m => m.status === 'completed').length;
  const totalPayments = milestones.reduce((sum, m) => sum + (m.payment_amount || 0), 0);
  const paidPayments = milestones
    .filter(m => m.status === 'completed')
    .reduce((sum, m) => sum + (m.payment_amount || 0), 0);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold">{completedCount}/{milestones.length}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-success">${paidPayments.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Earned</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold">${totalPayments.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total Value</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      {milestones.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Milestone Progress</span>
            <span>{Math.round((completedCount / milestones.length) * 100)}%</span>
          </div>
          <Progress value={(completedCount / milestones.length) * 100} />
        </div>
      )}

      {/* Milestones List */}
      <div className="space-y-3">
        <AnimatePresence>
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`${milestone.status === 'completed' ? 'bg-success/5 border-success/20' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="pt-0.5">
                      <Checkbox
                        checked={milestone.status === 'completed'}
                        onCheckedChange={() => handleToggleMilestone(milestone)}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium ${milestone.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                          {milestone.title}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {milestone.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {milestone.payment_amount && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {milestone.payment_amount.toLocaleString()}
                          </div>
                        )}
                        {milestone.due_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(milestone.due_date), 'MMM d')}
                          </div>
                        )}
                        {milestone.completed_at && (
                          <div className="flex items-center gap-1 text-success">
                            <CheckCircle2 className="w-3 h-3" />
                            Completed {format(new Date(milestone.completed_at), 'MMM d')}
                          </div>
                        )}
                      </div>

                      {/* Deliverables */}
                      {milestone.deliverables && milestone.deliverables.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {milestone.deliverables.map((deliverable) => (
                            <div 
                              key={deliverable.id}
                              className="flex items-center gap-2 text-sm"
                            >
                              {deliverable.completed ? (
                                <CheckCircle2 className="w-3 h-3 text-success" />
                              ) : (
                                <Circle className="w-3 h-3 text-muted-foreground" />
                              )}
                              <span className={deliverable.completed ? 'line-through text-muted-foreground' : ''}>
                                {deliverable.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteMilestone(milestone.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {milestones.length === 0 && !showAddForm && (
          <Card className="p-8 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No milestones yet</p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Milestone
            </Button>
          </Card>
        )}

        {/* Add Form */}
        {showAddForm && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <Input
                placeholder="Milestone title"
                value={newMilestone.title}
                onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Payment amount ($)"
                  value={newMilestone.payment_amount}
                  onChange={(e) => setNewMilestone({ ...newMilestone, payment_amount: e.target.value })}
                />
                <Input
                  type="date"
                  value={newMilestone.due_date}
                  onChange={(e) => setNewMilestone({ ...newMilestone, due_date: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddMilestone} className="flex-1">
                  Add Milestone
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!showAddForm && milestones.length > 0 && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Milestone
          </Button>
        )}
      </div>
    </div>
  );
};
