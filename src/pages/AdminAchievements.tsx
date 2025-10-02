import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Star, Award, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Achievement {
  id: string;
  user_id: string;
  badge_type: string;
  badge_name: string;
  badge_description: string | null;
  earned_at: string;
}

interface AchievementProgress {
  id: string;
  user_id: string;
  achievement_type: string;
  current_progress: number;
  target_progress: number;
  completed_at: string | null;
}

export default function AdminAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [progress, setProgress] = useState<AchievementProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [achievementsRes, progressRes] = await Promise.all([
        supabase
          .from('achievements')
          .select('*')
          .order('earned_at', { ascending: false })
          .limit(50),
        supabase
          .from('achievement_progress')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(50),
      ]);

      if (achievementsRes.error) throw achievementsRes.error;
      if (progressRes.error) throw progressRes.error;

      setAchievements(achievementsRes.data || []);
      setProgress(progressRes.data || []);
    } catch (error: any) {
      console.error('Error fetching achievements:', error);
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const achievementStats = {
    totalEarned: achievements.length,
    inProgress: progress.filter(p => !p.completed_at).length,
    completed: progress.filter(p => p.completed_at).length,
    byType: achievements.reduce((acc, a) => {
      acc[a.badge_type] = (acc[a.badge_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Achievement System</h1>
            <p className="text-muted-foreground">
              Monitor user achievements and progress
            </p>
          </div>
          <Button onClick={fetchData}>Refresh</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{achievementStats.totalEarned}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{achievementStats.inProgress}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{achievementStats.completed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Badge Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{Object.keys(achievementStats.byType).length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Recent Achievements
              </CardTitle>
              <CardDescription>
                Latest achievements earned by users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : achievements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No achievements earned yet
                </div>
              ) : (
                <div className="space-y-3">
                  {achievements.slice(0, 10).map((achievement) => (
                    <div 
                      key={achievement.id}
                      className="flex items-start gap-3 p-3 rounded-lg border"
                    >
                      <Award className="h-5 w-5 text-primary mt-1" />
                      <div className="flex-1 space-y-1">
                        <div className="font-medium">{achievement.badge_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {achievement.badge_description}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(achievement.earned_at), 'MMM d, yyyy')}
                        </div>
                      </div>
                      <Badge variant="outline">{achievement.badge_type}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Achievement Progress
              </CardTitle>
              <CardDescription>
                Users working towards achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : progress.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No progress tracked yet
                </div>
              ) : (
                <div className="space-y-3">
                  {progress.slice(0, 10).map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-start gap-3 p-3 rounded-lg border"
                    >
                      <Star className="h-5 w-5 text-muted-foreground mt-1" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">
                            {item.achievement_type.replace(/_/g, ' ')}
                          </div>
                          <Badge variant={item.completed_at ? 'default' : 'secondary'}>
                            {item.completed_at ? 'Complete' : 'In Progress'}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{item.current_progress} / {item.target_progress}</span>
                            <span>{Math.round((item.current_progress / item.target_progress) * 100)}%</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div 
                              className="bg-primary rounded-full h-2 transition-all"
                              style={{ width: `${Math.min((item.current_progress / item.target_progress) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
