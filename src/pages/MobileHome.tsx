import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, DollarSign, TrendingUp, Plus, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { MobileJobPostWizard } from '@/components/mobile/MobileJobPostWizard';

export default function MobileHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showJobWizard, setShowJobWizard] = useState(false);
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

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">MixClub</h1>
            <p className="text-sm text-muted-foreground">Welcome back!</p>
          </div>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => setShowJobWizard(true)}
            className="h-24 flex flex-col gap-2"
          >
            <Plus className="h-6 w-6" />
            <span>Post Job</span>
          </Button>
          <Button
            onClick={() => navigate('/job-board')}
            variant="outline"
            className="h-24 flex flex-col gap-2"
          >
            <Briefcase className="h-6 w-6" />
            <span>Browse Jobs</span>
          </Button>
        </div>

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

      <MobileJobPostWizard
        isOpen={showJobWizard}
        onClose={() => setShowJobWizard(false)}
        onSuccess={loadStats}
      />

      <MobileBottomNav />
    </div>
  );
}
