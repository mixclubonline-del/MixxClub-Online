import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, Circle, Music, Mic, Headphones, 
  Sparkles, Trophy, Clock 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: any;
  completed: boolean;
  order: number;
}

interface MusicalMilestonesProps {
  projectId: string;
  status: string;
}

export const MusicalMilestones = ({ projectId, status }: MusicalMilestonesProps) => {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: '1',
      title: 'Track Upload',
      description: 'Raw tracks uploaded and ready for mixing',
      icon: Music,
      completed: false,
      order: 1
    },
    {
      id: '2',
      title: 'Initial Mix',
      description: 'First mix pass with balance and levels',
      icon: Headphones,
      completed: false,
      order: 2
    },
    {
      id: '3',
      title: 'Creative Processing',
      description: 'EQ, compression, effects applied',
      icon: Sparkles,
      completed: false,
      order: 3
    },
    {
      id: '4',
      title: 'Artist Review',
      description: 'Artist feedback and revision requests',
      icon: Mic,
      completed: false,
      order: 4
    },
    {
      id: '5',
      title: 'Final Master',
      description: 'Track mastered and delivery ready',
      icon: Trophy,
      completed: false,
      order: 5
    }
  ]);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    updateMilestonesBasedOnStatus();
  }, [status]);

  const updateMilestonesBasedOnStatus = () => {
    setMilestones(prev => prev.map((milestone, idx) => {
      if (status === 'pending') {
        return { ...milestone, completed: false };
      } else if (status === 'in_progress') {
        return { ...milestone, completed: idx <= 1 };
      } else if (status === 'review') {
        return { ...milestone, completed: idx <= 3 };
      } else if (status === 'completed') {
        return { ...milestone, completed: true };
      }
      return milestone;
    }));
  };

  const toggleMilestone = async (milestoneId: string) => {
    setMilestones(prev => prev.map(m => 
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    ));

    toast.success('Milestone updated');
  };

  const completedCount = milestones.filter(m => m.completed).length;
  const totalCount = milestones.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 via-purple-500/10 to-accent/10 border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Track Journey Milestones
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Musical checkpoints from raw tracks to final master
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">
              {completedCount}/{totalCount}
            </div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
        </div>
        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary via-purple-500 to-primary transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </Card>

      {/* Milestones List */}
      <div className="space-y-4">
        {milestones.map((milestone, index) => {
          const Icon = milestone.icon;
          const isCompleted = milestone.completed;
          const isNext = !isCompleted && index > 0 && milestones[index - 1].completed;

          return (
            <Card 
              key={milestone.id} 
              className={`p-6 transition-all ${
                isCompleted 
                  ? 'bg-primary/5 border-primary/30' 
                  : isNext 
                    ? 'border-primary/50 shadow-lg' 
                    : 'opacity-70'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Status Icon */}
                <button
                  onClick={() => toggleMilestone(milestone.id)}
                  className="mt-1 focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
                >
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-primary fill-primary" />
                  ) : (
                    <Circle className={`w-6 h-6 ${isNext ? 'text-primary' : 'text-muted-foreground'}`} />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${isCompleted ? 'bg-primary/20' : 'bg-muted'}`}>
                      <Icon className={`w-5 h-5 ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{milestone.title}</h4>
                      <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    </div>
                    {isNext && (
                      <Badge variant="outline" className="ml-auto border-primary text-primary">
                        <Clock className="w-3 h-3 mr-1" />
                        Up Next
                      </Badge>
                    )}
                  </div>

                  {/* Notes Section */}
                  {isCompleted && (
                    <div className="mt-4 ml-9">
                      <Textarea
                        placeholder="Add notes about this milestone..."
                        value={notes[milestone.id] || ''}
                        onChange={(e) => setNotes(prev => ({ ...prev, [milestone.id]: e.target.value }))}
                        className="min-h-[60px] text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Completion Message */}
      {completedCount === totalCount && (
        <Card className="p-8 text-center bg-gradient-to-br from-primary/10 via-purple-500/10 to-accent/10 border-primary/30">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h3 className="text-2xl font-bold mb-2">Track Complete! 🎉</h3>
          <p className="text-muted-foreground">
            All milestones achieved. This track is ready to share with the world!
          </p>
        </Card>
      )}
    </div>
  );
};