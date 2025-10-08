import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MixxMasterSession {
  id: string;
  project_id: string;
  manifest_data: any;
  format_version: string;
  created_at: string;
  updated_at: string;
}

interface SessionBrowserProps {
  projectId?: string;
  onSessionSelect?: (sessionId: string) => void;
}

export const SessionBrowser = ({ projectId, onSessionSelect }: SessionBrowserProps) => {
  const [sessions, setSessions] = useState<MixxMasterSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSessions();
  }, [projectId]);

  const loadSessions = async () => {
    try {
      let query = supabase
        .from('mixxmaster_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load MixxMaster sessions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('mixxmaster-export', {
        body: { session_id: sessionId, include_stems: true },
      });

      if (error) throw error;

      toast({
        title: 'Export Ready',
        description: 'Your MixxMaster package is ready for download',
      });

      // Download logic here
      const blob = new Blob([JSON.stringify(data.package, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mixxmaster-${sessionId}.json`;
      a.click();
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading sessions...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold">MixxMaster Sessions</h3>
      
      {sessions.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No MixxMaster sessions found</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <Card key={session.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">
                    {session.manifest_data?.metadata?.artistInfo?.projectName || 'Untitled Session'}
                  </h4>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(session.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      v{session.format_version}
                    </span>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    {Object.entries(session.manifest_data?.audio || {}).map(([category, stems]: [string, any]) => (
                      <span key={category} className="text-xs bg-primary/10 px-2 py-1 rounded">
                        {category}: {stems.length}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  {onSessionSelect && (
                    <Button variant="outline" size="sm" onClick={() => onSessionSelect(session.id)}>
                      <Eye className="w-4 h-4 mr-1" />
                      Open
                    </Button>
                  )}
                  <Button onClick={() => handleExport(session.id)} size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
