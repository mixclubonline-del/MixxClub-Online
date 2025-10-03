import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Briefcase, Search, DollarSign, Calendar, User, Download } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { exportToCSV } from '@/utils/csvExport';
import { DataTablePagination } from '@/components/ui/data-table-pagination';

interface JobPosting {
  id: string;
  title: string;
  description: string;
  service_type: string;
  genre: string | null;
  budget: number | null;
  deadline: string | null;
  status: string;
  created_at: string;
  artist_id: string;
  assigned_engineer_id: string | null;
}

export default function AdminJobs() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchJobs();
  }, [currentPage, pageSize, statusFilter]);

  const fetchJobs = async () => {
    try {
      // Get total count
      let countQuery = supabase
        .from('job_postings')
        .select('*', { count: 'exact', head: true });
      
      if (statusFilter !== 'all') {
        countQuery = countQuery.eq('status', statusFilter);
      }
      
      const { count } = await countQuery;
      setTotalCount(count || 0);
      
      // Get paginated data
      let query = supabase
        .from('job_postings')
        .select('*')
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setJobs(data || []);
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load job postings');
    } finally {
      setLoading(false);
    }
  };

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('job_postings')
        .update({ status: newStatus })
        .eq('id', jobId);

      if (error) throw error;
      
      toast.success('Job status updated');
      fetchJobs();
    } catch (error: any) {
      console.error('Error updating job:', error);
      toast.error('Failed to update job status');
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.service_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'default';
      case 'in_progress': return 'secondary';
      case 'completed': return 'outline';
      default: return 'secondary';
    }
  };

  const jobCounts = {
    all: jobs.length,
    open: jobs.filter(j => j.status === 'open').length,
    in_progress: jobs.filter(j => j.status === 'in_progress').length,
    completed: jobs.filter(j => j.status === 'completed').length,
  };

  const exportJobsToCSV = () => {
    const exportData = filteredJobs.map(job => ({
      'ID': job.id,
      'Title': job.title,
      'Service Type': job.service_type,
      'Genre': job.genre || '',
      'Budget': job.budget || 0,
      'Status': job.status,
      'Created': format(new Date(job.created_at), 'yyyy-MM-dd'),
      'Deadline': job.deadline ? format(new Date(job.deadline), 'yyyy-MM-dd') : '',
    }));
    exportToCSV(exportData, 'job-postings');
    toast.success('Jobs exported to CSV');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Job Postings Management</h1>
            <p className="text-muted-foreground">
              Monitor and manage all job postings on the platform
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportJobsToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={fetchJobs}>Refresh</Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, description, or service type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">All ({jobCounts.all})</TabsTrigger>
            <TabsTrigger value="open">Open ({jobCounts.open})</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress ({jobCounts.in_progress})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({jobCounts.completed})</TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter} className="mt-6">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredJobs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8 text-muted-foreground">
                  No job postings found
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="space-y-4">
                  {filteredJobs.map((job) => (
                    <Card key={job.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2">
                              <Briefcase className="h-5 w-5" />
                              {job.title}
                            </CardTitle>
                            <CardDescription>
                              Posted on {format(new Date(job.created_at), 'MMM d, yyyy')}
                            </CardDescription>
                          </div>
                          <Badge variant={getStatusColor(job.status)}>
                            {job.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm">{job.description}</p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {job.service_type}
                          </div>
                          {job.genre && (
                            <div className="flex items-center gap-1">
                              Genre: {job.genre}
                            </div>
                          )}
                          {job.budget && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              ${job.budget}
                            </div>
                          )}
                          {job.deadline && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(job.deadline), 'MMM d, yyyy')}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {job.status === 'open' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateJobStatus(job.id, 'in_progress')}
                            >
                              Mark In Progress
                            </Button>
                          )}
                          {job.status === 'in_progress' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateJobStatus(job.id, 'completed')}
                              >
                                Mark Completed
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateJobStatus(job.id, 'open')}
                              >
                                Reopen
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {totalCount > 0 && (
                  <div className="mt-6">
                    <DataTablePagination
                      currentPage={currentPage}
                      totalPages={Math.ceil(totalCount / pageSize)}
                      pageSize={pageSize}
                      totalItems={totalCount}
                      onPageChange={(page) => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      onPageSizeChange={(size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
