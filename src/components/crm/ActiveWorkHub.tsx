import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, FileText, Clock, CheckCircle, Upload } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

export const ActiveWorkHub = () => {
  const { user } = useAuth();

  const { data: activeProjects, isLoading: projectsLoading } = useQuery({
    queryKey: ['active-projects', user?.id],
    queryFn: async () => {
      const { data: deliverables } = await supabase
        .from('engineer_deliverables')
        .select(`
          *,
          projects:project_id (
            id,
            title,
            description,
            status,
            user_id,
            profiles:user_id (
              full_name,
              avatar_url
            )
          )
        `)
        .eq('engineer_id', user?.id)
        .in('status', ['pending', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(10);

      return deliverables || [];
    },
    enabled: !!user?.id,
  });

  const { data: recentDeliverables, isLoading: deliverablesLoading } = useQuery({
    queryKey: ['recent-deliverables', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('engineer_deliverables')
        .select(`
          *,
          projects:project_id (title)
        `)
        .eq('engineer_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      return data || [];
    },
    enabled: !!user?.id,
  });

  if (projectsLoading || deliverablesLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'in_progress': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'approved': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'revision_requested': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Projects Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Active Work ({activeProjects?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!activeProjects?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active projects at the moment</p>
              <p className="text-sm mt-2">Browse available sessions to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeProjects.map((deliverable: any) => (
                <div
                  key={deliverable.id}
                  className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{deliverable.projects?.title}</h3>
                      <Badge className={getStatusColor(deliverable.status)}>
                        {deliverable.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {deliverable.file_name}
                    </p>
                    {deliverable.notes && (
                      <p className="text-sm text-muted-foreground">{deliverable.notes}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(deliverable.created_at), { addSuffix: true })}
                      </span>
                      {deliverable.version_number && (
                        <span>v{deliverable.version_number}</span>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Update
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Deliverables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Recent Deliverables
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!recentDeliverables?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No deliverables yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDeliverables.map((deliverable: any) => (
                <div
                  key={deliverable.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{deliverable.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {deliverable.projects?.title}
                    </p>
                  </div>
                  <Badge className={getStatusColor(deliverable.status)} variant="outline">
                    {deliverable.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};