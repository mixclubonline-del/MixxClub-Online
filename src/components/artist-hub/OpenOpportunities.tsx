import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, DollarSign, Calendar, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function OpenOpportunities() {
  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['open-opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_postings')
        .select(`
          id,
          title,
          budget,
          deadline,
          created_at,
          job_applications(id)
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      return data?.map(job => ({
        ...job,
        applicantCount: job.job_applications?.length || 0
      }));
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-card/30 backdrop-blur-sm border-white/5">
            <CardHeader>
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (!opportunities || opportunities.length === 0) {
    return (
      <Card className="bg-card/30 backdrop-blur-sm border-white/5">
        <CardContent className="p-8 text-center">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No opportunities available right now</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {opportunities.map((job) => (
        <Card key={job.id} className="bg-card/30 backdrop-blur-sm border-white/5 hover:border-primary/30 transition-all">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg mb-2">{job.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {job.budget && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>${job.budget}</span>
                    </div>
                  )}
                  {job.deadline && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDistanceToNow(new Date(job.deadline), { addSuffix: true })}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{job.applicantCount} applicants</span>
                  </div>
                </div>
              </div>
              <Button size="sm" className="gap-2">
                Apply Now
              </Button>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
