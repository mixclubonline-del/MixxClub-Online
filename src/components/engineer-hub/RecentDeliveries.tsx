import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Download, Eye, Trash2, ChevronDown, ChevronUp, FileAudio } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface Deliverable {
  id: string;
  project_id: string;
  engineer_id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  status: string | null;
  version_number: number | null;
  notes: string | null;
  created_at: string;
  project?: {
    title: string;
  };
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending_review: { label: 'Pending Review', variant: 'secondary' },
  approved: { label: 'Approved', variant: 'default' },
  revision_requested: { label: 'Revision Requested', variant: 'destructive' },
  delivered: { label: 'Delivered', variant: 'outline' },
};

export default function RecentDeliveries() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: deliverables = [], isLoading } = useQuery({
    queryKey: ['engineer-deliverables', user?.id, statusFilter],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('engineer_deliverables')
        .select(`
          *,
          project:projects(title)
        `)
        .eq('engineer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Deliverable[];
    },
    enabled: !!user?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('engineer_deliverables')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engineer-deliverables'] });
      toast.success('Deliverable deleted');
    },
    onError: () => toast.error('Failed to delete deliverable'),
  });

  const handleDownload = async (deliverable: Deliverable) => {
    try {
      const { data, error } = await supabase.storage
        .from('deliverables')
        .download(deliverable.file_path);
      
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = deliverable.file_name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Recent Deliveries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Recent Deliveries
        </CardTitle>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="revision_requested">Revision Requested</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {deliverables.length === 0 ? (
          <div className="text-center py-8">
            <FileAudio className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No deliveries found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deliverables.map((deliverable) => {
              const statusConfig = STATUS_CONFIG[deliverable.status || 'delivered'] || STATUS_CONFIG.delivered;
              const isExpanded = expandedId === deliverable.id;

              return (
                <div key={deliverable.id} className="border rounded-lg overflow-hidden">
                  <div
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                    onClick={() => setExpandedId(isExpanded ? null : deliverable.id)}
                  >
                    <div className="flex items-center gap-3">
                      <FileAudio className="h-8 w-8 text-primary/70" />
                      <div>
                        <div className="font-medium">{deliverable.file_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {deliverable.project?.title || 'Unknown Project'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                      {deliverable.version_number && (
                        <Badge variant="outline">v{deliverable.version_number}</Badge>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-3 pb-3 pt-0 border-t bg-muted/30">
                      <div className="grid grid-cols-2 gap-4 py-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Size:</span>{' '}
                          {formatFileSize(deliverable.file_size)}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Type:</span>{' '}
                          {deliverable.file_type || 'Unknown'}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Uploaded:</span>{' '}
                          {format(new Date(deliverable.created_at), 'MMM d, yyyy')}
                        </div>
                      </div>
                      {deliverable.notes && (
                        <p className="text-sm text-muted-foreground mb-3">{deliverable.notes}</p>
                      )}
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleDownload(deliverable)}>
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <a href={`/projects/${deliverable.project_id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View Project
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMutation.mutate(deliverable.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
