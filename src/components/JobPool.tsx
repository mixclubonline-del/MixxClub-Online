import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Clock, DollarSign, Music, User, Calendar, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface JobPosting {
  id: string;
  title: string;
  description: string;
  genre: string;
  budget: number;
  deadline: string;
  service_type: string;
  status: string;
  created_at: string;
  ai_analysis: any;
  stems_prepared: boolean;
}

interface Application {
  message: string;
  proposed_rate: number;
  estimated_delivery: string;
}

export const JobPool = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [application, setApplication] = useState<Application>({
    message: '',
    proposed_rate: 0,
    estimated_delivery: ''
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load job postings');
    } finally {
      setLoading(false);
    }
  };

  const submitApplication = async (jobId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          engineer_id: user.id,
          message: application.message,
          proposed_rate: application.proposed_rate,
          estimated_delivery: application.estimated_delivery
        });

      if (error) throw error;

      toast.success('Application submitted successfully!');
      setSelectedJob(null);
      setApplication({ message: '', proposed_rate: 0, estimated_delivery: '' });
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application');
    }
  };

  const getServiceColor = (service: string) => {
    switch (service) {
      case 'mixing': return 'bg-blue-500';
      case 'mastering': return 'bg-purple-500';
      case 'both': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="h-3 bg-muted rounded w-full"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Available Jobs</h2>
          <p className="text-muted-foreground">Find your next mixing or mastering project</p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          {jobs.length} Open Positions
        </Badge>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="mixing">Mixing</TabsTrigger>
          <TabsTrigger value="mastering">Mastering</TabsTrigger>
          <TabsTrigger value="both">Both</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <JobGrid jobs={jobs} onSelectJob={setSelectedJob} getServiceColor={getServiceColor} />
        </TabsContent>

        <TabsContent value="mixing" className="space-y-4">
          <JobGrid 
            jobs={jobs.filter(job => job.service_type === 'mixing')} 
            onSelectJob={setSelectedJob} 
            getServiceColor={getServiceColor} 
          />
        </TabsContent>

        <TabsContent value="mastering" className="space-y-4">
          <JobGrid 
            jobs={jobs.filter(job => job.service_type === 'mastering')} 
            onSelectJob={setSelectedJob} 
            getServiceColor={getServiceColor} 
          />
        </TabsContent>

        <TabsContent value="both" className="space-y-4">
          <JobGrid 
            jobs={jobs.filter(job => job.service_type === 'both')} 
            onSelectJob={setSelectedJob} 
            getServiceColor={getServiceColor} 
          />
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Apply for Position</DialogTitle>
          </DialogHeader>
          
          {selectedJob && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">{selectedJob.title}</h3>
                <p className="text-muted-foreground mt-1">{selectedJob.description}</p>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge className={getServiceColor(selectedJob.service_type)}>
                    {selectedJob.service_type}
                  </Badge>
                  <Badge variant="outline">
                    <Music className="w-3 h-3 mr-1" />
                    {selectedJob.genre}
                  </Badge>
                  <Badge variant="outline">
                    <DollarSign className="w-3 h-3 mr-1" />
                    ${selectedJob.budget}
                  </Badge>
                  <Badge variant="outline">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(selectedJob.deadline).toLocaleDateString()}
                  </Badge>
                </div>

                {selectedJob.stems_prepared && (
                  <Badge className="mt-2 bg-green-500">
                    <MapPin className="w-3 h-3 mr-1" />
                    Stems Ready for DAW
                  </Badge>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="message">Cover Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell the artist why you're perfect for this project..."
                    value={application.message}
                    onChange={(e) => setApplication(prev => ({ ...prev, message: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rate">Your Rate ($)</Label>
                    <Input
                      id="rate"
                      type="number"
                      placeholder="500"
                      value={application.proposed_rate || ''}
                      onChange={(e) => setApplication(prev => ({ ...prev, proposed_rate: Number(e.target.value) }))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="delivery">Estimated Delivery</Label>
                    <Input
                      id="delivery"
                      type="date"
                      value={application.estimated_delivery}
                      onChange={(e) => setApplication(prev => ({ ...prev, estimated_delivery: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => submitApplication(selectedJob.id)}
                  className="w-full"
                  disabled={!application.message || !application.proposed_rate}
                >
                  Submit Application
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const JobGrid = ({ jobs, onSelectJob, getServiceColor }: {
  jobs: JobPosting[];
  onSelectJob: (job: JobPosting) => void;
  getServiceColor: (service: string) => string;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {jobs.map((job) => (
      <Card key={job.id} className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{job.title}</CardTitle>
            <Badge className={getServiceColor(job.service_type)}>
              {job.service_type}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2">
            {job.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              ${job.budget}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {new Date(job.deadline).toLocaleDateString()}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Badge variant="outline">
              <Music className="w-3 h-3 mr-1" />
              {job.genre}
            </Badge>
            {job.stems_prepared && (
              <Badge variant="secondary" className="text-xs">
                Stems Ready
              </Badge>
            )}
          </div>

          <Button 
            onClick={() => onSelectJob(job)}
            className="w-full"
            variant="outline"
          >
            Apply Now
          </Button>
        </CardContent>
      </Card>
    ))}
  </div>
);