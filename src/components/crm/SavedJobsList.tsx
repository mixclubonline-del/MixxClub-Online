import { useState, useEffect } from 'react';
import { Bookmark, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useFlowNavigation } from '@/core/fabric/useFlow';

export const SavedJobsList = () => {
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { navigateTo } = useFlowNavigation();

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('saved_jobs')
      .select(`
        *,
        job_postings:job_id (
          id,
          title,
          service_type,
          budget,
          deadline,
          status,
          genre
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved jobs:', error);
      toast.error('Failed to load saved jobs');
      return;
    }

    setSavedJobs(data || []);
    setLoading(false);
  };

  const removeSavedJob = async (savedJobId: string) => {
    const { error } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('id', savedJobId);

    if (error) {
      toast.error('Failed to remove job');
      return;
    }

    toast.success('Job removed from saved');
    fetchSavedJobs();
  };

  if (loading) {
    return <div className="text-center py-8">Loading saved jobs...</div>;
  }

  if (savedJobs.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Bookmark className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Saved Jobs</h3>
        <p className="text-muted-foreground mb-4">
          Save jobs you're interested in to review later
        </p>
        <Button onClick={() => navigateTo('/job-board')}>
          Browse Jobs
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {savedJobs.map((saved) => (
        <Card key={saved.id} className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{saved.job_postings.title}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">{saved.job_postings.service_type}</Badge>
                {saved.job_postings.genre && (
                  <Badge variant="outline">{saved.job_postings.genre}</Badge>
                )}
                <span className="text-sm text-muted-foreground">
                  ${saved.job_postings.budget}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigateTo(`/job-board?job=${saved.job_postings.id}`)}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeSavedJob(saved.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {saved.notes && (
            <p className="text-sm text-muted-foreground mt-2">
              Notes: {saved.notes}
            </p>
          )}
        </Card>
      ))}
    </div>
  );
};
