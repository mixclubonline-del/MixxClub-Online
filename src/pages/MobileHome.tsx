import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { MobileEnhancedNav } from '@/components/mobile/MobileEnhancedNav';
import { PullToRefresh } from '@/components/mobile/PullToRefresh';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, DollarSign, TrendingUp, Plus, Zap, Music } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { MobileJobPostWizard } from '@/components/mobile/MobileJobPostWizard';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';

export default function MobileHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showJobWizard, setShowJobWizard] = useState(false);
  const { triggerHaptic } = useMobileOptimization({ enableHaptics: true });
  const [stats, setStats] = useState({
    activeJobs: 0,
    applications: 0,
    earnings: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    loadStats();
  }, [user, navigate]);

  const loadStats = async () => {
    if (!user) return;

    // Load relevant stats based on user type
    const { data: jobs } = await supabase
      .from('job_postings')
      .select('*', { count: 'exact', head: true })
      .eq('artist_id', user.id)
      .eq('status', 'open');

    const { data: applications } = await supabase
      .from('job_applications')
      .select('*', { count: 'exact', head: true })
      .eq('engineer_id', user.id);

    setStats({
      activeJobs: jobs?.length || 0,
      applications: applications?.length || 0,
      earnings: 0
    });
  };

  const handleRefresh = async () => {
    triggerHaptic('medium');
    await loadStats();
  };

  const handleAction = (action: () => void) => {
    triggerHaptic('light');
    action();
  };

  return (
    <div className="min-h-screen bg-background pb-20 overflow-y-auto touch-manipulation">
      <MobileEnhancedNav />

      <PullToRefresh onRefresh={handleRefresh}>
        <div className="container mx-auto px-4 py-6 space-y-6 pb-safe">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => handleAction(() => setShowJobWizard(true))}
              className="h-24 flex flex-col gap-2"
            >
              <Plus className="h-6 w-6" />
              <span>Post Job</span>
            </Button>
            <Button
              onClick={() => handleAction(() => navigate('/jobs'))}
              variant="outline"
              className="h-24 flex flex-col gap-2"
            >
              <Briefcase className="h-6 w-6" />
              <span>Browse Jobs</span>
            </Button>
          </div>

          {/* AI Quick Actions */}
          <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              AI-Powered Tools
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction(() => navigate('/mobile-mixxbot'))}
                className="h-16"
              >
                <div className="flex flex-col items-center gap-1">
                  <Music className="h-4 w-4" />
                  <span className="text-xs">AI Mix</span>
                </div>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction(() => navigate('/mastering-studio'))}
                className="h-16"
              >
                <div className="flex flex-col items-center gap-1">
                  <Zap className="h-4 w-4" />
                  <span className="text-xs">AI Master</span>
                </div>
              </Button>
            </div>
          </Card>

          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center">
            <Briefcase className="h-5 w-5 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.activeJobs}</p>
            <p className="text-xs text-muted-foreground">Active Jobs</p>
          </Card>
          <Card className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.applications}</p>
            <p className="text-xs text-muted-foreground">Applications</p>
          </Card>
          <Card className="p-4 text-center">
            <DollarSign className="h-5 w-5 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">${stats.earnings}</p>
            <p className="text-xs text-muted-foreground">Earnings</p>
          </Card>
          </div>

          {/* Recent Activity */}
          <Card className="p-4">
            <h2 className="font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>No recent activity</p>
            </div>
          </Card>
        </div>
      </PullToRefresh>

      <MobileJobPostWizard
        isOpen={showJobWizard}
        onClose={() => setShowJobWizard(false)}
        onSuccess={loadStats}
      />
    </div>
  );
}
