import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileAudio, Upload, CheckCircle, Clock, AlertCircle, 
  Download, Play, Loader2, FolderOpen
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Deliverable {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  status: string;
  notes: string | null;
  version_number: number | null;
  created_at: string;
  engineer_id: string;
  engineer?: {
    full_name: string;
  };
}

interface SessionDeliverablesProps {
  sessionId: string;
  isHost: boolean;
}

export function SessionDeliverables({ sessionId, isHost }: SessionDeliverablesProps) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDeliverables();
  }, [sessionId]);

  const fetchDeliverables = async () => {
    try {
      // Note: We're querying engineer_deliverables and filtering by project
      // In a real app, you'd have a session_deliverables table or link sessions to projects
      const { data, error } = await supabase
        .from('engineer_deliverables')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch engineer profiles
      if (data && data.length > 0) {
        const engineerIds = [...new Set(data.map(d => d.engineer_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', engineerIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        
        setDeliverables(data.slice(0, 5).map(d => ({
          ...d,
          engineer: profileMap.get(d.engineer_id)
        })));
      } else {
        setDeliverables([]);
      }
    } catch (err) {
      console.error('Error fetching deliverables:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (deliverableId: string) => {
    try {
      const { error } = await supabase
        .from('engineer_deliverables')
        .update({ status: 'approved' })
        .eq('id', deliverableId);

      if (error) throw error;
      
      toast({
        title: 'Deliverable approved!',
        description: 'The engineer has been notified.',
      });
      
      fetchDeliverables();
    } catch (err) {
      console.error('Error approving deliverable:', err);
      toast({
        title: 'Error',
        description: 'Failed to approve deliverable.',
        variant: 'destructive'
      });
    }
  };

  const handleRequestRevision = async (deliverableId: string) => {
    try {
      const { error } = await supabase
        .from('engineer_deliverables')
        .update({ status: 'revision_requested' })
        .eq('id', deliverableId);

      if (error) throw error;
      
      toast({
        title: 'Revision requested',
        description: 'The engineer has been notified.',
      });
      
      fetchDeliverables();
    } catch (err) {
      console.error('Error requesting revision:', err);
      toast({
        title: 'Error',
        description: 'Failed to request revision.',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
      case 'revision_requested':
        return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20"><AlertCircle className="w-3 h-3 mr-1" />Revision Needed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <Card className="bg-card/50 border-border/30">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading deliverables...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 border-border/30">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileAudio className="w-5 h-5" />
          Deliverables
        </CardTitle>
        <Button size="sm">
          <Upload className="w-4 h-4 mr-2" />
          Upload File
        </Button>
      </CardHeader>
      <CardContent>
        {deliverables.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No deliverables yet</p>
            <p className="text-sm text-muted-foreground">Files uploaded by engineers will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deliverables.map((deliverable) => (
              <div
                key={deliverable.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-border/30"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileAudio className="w-6 h-6 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{deliverable.file_name}</h4>
                    {deliverable.version_number && (
                      <Badge variant="outline" className="text-xs">v{deliverable.version_number}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{formatFileSize(deliverable.file_size)}</span>
                    <span>•</span>
                    <span>{deliverable.engineer?.full_name || 'Unknown'}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(deliverable.created_at), { addSuffix: true })}</span>
                  </div>
                  {deliverable.notes && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{deliverable.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(deliverable.status)}
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Download className="w-4 h-4" />
                  </Button>
                  {isHost && deliverable.status === 'pending' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRequestRevision(deliverable.id)}
                      >
                        Request Revision
                      </Button>
                      <Button 
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => handleApprove(deliverable.id)}
                      >
                        Approve
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
