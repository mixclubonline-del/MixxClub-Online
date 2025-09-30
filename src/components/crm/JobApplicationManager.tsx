import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Clock, User, DollarSign, Calendar, Briefcase } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Application {
  id: string;
  job_id: string;
  engineer_id: string;
  status: string;
  message: string;
  proposed_rate: number;
  estimated_delivery: string;
  created_at: string;
  engineer_profile: {
    full_name: string;
    email: string;
    role: string;
  };
  job_posting: {
    title: string;
    description: string;
    service_type: string;
    budget: number;
    deadline: string;
  };
}

export const JobApplicationManager = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchApplications();
      subscribeToApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      // First get job postings for this artist
      const { data: jobs } = await supabase
        .from('job_postings')
        .select('id')
        .eq('artist_id', user?.id);

      const jobIds = jobs?.map(j => j.id) || [];

      if (jobIds.length === 0) {
        setApplications([]);
        setLoading(false);
        return;
      }

      // Then get applications for those jobs
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          job_postings (
            title,
            description,
            service_type,
            budget,
            deadline,
            artist_id
          )
        `)
        .in('job_id', jobIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get engineer profiles separately
      const engineerIds = data?.map(app => app.engineer_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .in('id', engineerIds);

      // Combine the data
      const applicationsWithProfiles = data?.map(app => ({
        ...app,
        engineer_profile: profiles?.find(p => p.id === app.engineer_id) || {
          full_name: 'Unknown',
          email: '',
          role: 'engineer'
        },
        job_posting: app.job_postings
      })) || [];

      setApplications(applicationsWithProfiles as any);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToApplications = () => {
    const channel = supabase
      .channel('job-applications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_applications'
        },
        () => {
          fetchApplications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const acceptApplication = async (application: Application) => {
    setProcessingId(application.id);
    try {
      // 1. Update application status
      const { error: updateError } = await supabase
        .from('job_applications')
        .update({ status: 'accepted' })
        .eq('id', application.id);

      if (updateError) throw updateError;

      // 2. Create project automatically
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          title: application.job_posting.title,
          description: application.job_posting.description,
          client_id: user?.id,
          engineer_id: application.engineer_id,
          budget: application.proposed_rate,
          deadline: application.estimated_delivery,
          status: 'in_progress',
          metadata: {
            job_id: application.job_id,
            service_type: application.job_posting.service_type,
            original_budget: application.job_posting.budget,
            application_message: application.message
          }
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // 3. Update job posting status
      const { error: jobError } = await supabase
        .from('job_postings')
        .update({ 
          status: 'assigned',
          assigned_engineer_id: application.engineer_id
        })
        .eq('id', application.job_id);

      if (jobError) throw jobError;

      // 4. Copy audio files from job to project
      const { data: jobFiles, error: filesError } = await supabase
        .from('audio_files')
        .select('*')
        .eq('job_id', application.job_id);

      if (filesError) throw filesError;

      if (jobFiles && jobFiles.length > 0) {
        const projectFiles = jobFiles.map(file => ({
          ...file,
          id: undefined,
          project_id: project.id,
          job_id: null,
          created_at: undefined
        }));

        const { error: copyError } = await supabase
          .from('audio_files')
          .insert(projectFiles);

        if (copyError) throw copyError;
      }

      // 5. Create initial project message
      const { error: messageError } = await supabase
        .from('project_messages')
        .insert({
          project_id: project.id,
          sender_id: user?.id,
          content: `Project created! ${application.engineer_profile.full_name} has been assigned to work on "${application.job_posting.title}". Let's create something amazing together!`,
          message_type: 'text'
        });

      if (messageError) throw messageError;

      // 6. Award points for project creation
      await supabase.rpc('award_points', {
        user_id: user?.id,
        points_to_add: 100
      });

      toast.success('Application accepted! Project created successfully.');
      fetchApplications();
    } catch (error) {
      console.error('Error accepting application:', error);
      toast.error('Failed to accept application');
    } finally {
      setProcessingId(null);
    }
  };

  const rejectApplication = async (applicationId: string) => {
    setProcessingId(applicationId);
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: 'rejected' })
        .eq('id', applicationId);

      if (error) throw error;

      toast.success('Application rejected');
      fetchApplications();
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Failed to reject application');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'accepted': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <Card className="p-8 text-center glass">
        <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
        <p className="text-muted-foreground">
          When engineers apply to your job postings, they'll appear here.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Job Applications ({applications.length})</h3>
      </div>

      {applications.map((application) => (
        <Card key={application.id} className="p-6 glass hover:shadow-lg transition-all">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {application.engineer_profile.full_name?.charAt(0) || 'E'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-lg">{application.engineer_profile.full_name}</h4>
                  <p className="text-sm text-muted-foreground">{application.engineer_profile.email}</p>
                  <Badge className={`mt-2 ${getStatusColor(application.status)}`}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </Badge>
                </div>
              </div>
              <Badge variant="outline" className="glass">
                {application.job_posting.service_type}
              </Badge>
            </div>

            {/* Job Details */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <h5 className="font-semibold">{application.job_posting.title}</h5>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {application.job_posting.description}
              </p>
            </div>

            {/* Application Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Proposed Rate:</span>
                <span className="font-semibold">${application.proposed_rate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Est. Delivery:</span>
                <span className="font-semibold">
                  {new Date(application.estimated_delivery).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Applied:</span>
                <span className="font-semibold">
                  {new Date(application.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Engineer's Message */}
            {application.message && (
              <div className="border-l-2 border-primary/20 pl-4 py-2">
                <p className="text-sm text-muted-foreground italic">"{application.message}"</p>
              </div>
            )}

            {/* Actions */}
            {application.status === 'pending' && (
              <div className="flex gap-3 pt-2">
                <Button
                  variant="glow"
                  size="sm"
                  onClick={() => acceptApplication(application)}
                  disabled={processingId === application.id}
                  className="flex-1"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Accept & Create Project
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => rejectApplication(application.id)}
                  disabled={processingId === application.id}
                  className="flex-1"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
