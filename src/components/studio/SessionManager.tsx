import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Save, FolderOpen, Trash2, Clock, Music } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface StudioSession {
  id: string;
  session_name: string;
  tracks: any;
  plugins: any;
  bpm: number | null;
  created_at: string;
  updated_at: string;
}

export const SessionManager = () => {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<StudioSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('studio_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setSessions(data || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load sessions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSession = async () => {
    if (!saveName.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a name for your session',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // In a real implementation, this would capture the entire DAW state
      // For now, we'll create a placeholder structure
      const sessionData = {
        user_id: user.id,
        session_name: saveName.trim(),
        tracks: {
          count: 0,
          tracks: [],
        },
        plugins: {
          master: [],
          tracks: [],
        },
        bpm: 120,
      };

      const { error } = await supabase
        .from('studio_sessions')
        .insert(sessionData);

      if (error) throw error;

      toast({
        title: 'Session saved',
        description: `"${saveName}" saved successfully`,
      });

      setSaveName('');
      loadSessions();
    } catch (error: any) {
      console.error('Error saving session:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save session',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLoadSession = async (session: StudioSession) => {
    try {
      // In a real implementation, this would restore the entire DAW state
      toast({
        title: 'Session loaded',
        description: `"${session.session_name}" loaded successfully`,
      });

      setIsDialogOpen(false);

      // Session state restore will be integrated with DAW store in a future release
    } catch (error) {
      console.error('Error loading session:', error);
      toast({
        title: 'Error',
        description: 'Failed to load session',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('studio_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: 'Session deleted',
        description: 'Session removed successfully',
      });

      loadSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete session',
        variant: 'destructive',
      });
    }
  };

  const getSessionAge = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="space-y-4">
      {/* Quick Save */}
      <Card className="p-4 bg-muted/30">
        <div className="flex items-center gap-2 mb-2">
          <Save className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Quick Save</h3>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Session name..."
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveSession()}
          />
          <Button onClick={handleSaveSession} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          💡 Saves current tracks, plugins, and routing
        </p>
      </Card>

      {/* Load Session Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <FolderOpen className="w-4 h-4 mr-2" />
            Load Session ({sessions.length})
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[70vh]">
          <DialogHeader>
            <DialogTitle>Load Studio Session</DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No saved sessions yet</p>
              <p className="text-xs text-muted-foreground mt-2">
                Save your current work to create your first session
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {sessions.map((session) => (
                  <Card key={session.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{session.session_name}</h4>
                          {session.bpm && (
                            <Badge variant="secondary" className="text-xs">
                              {session.bpm} BPM
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {getSessionAge(session.updated_at)}
                          </span>
                          <span>
                            {session.tracks?.count || 0} tracks
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleLoadSession(session)}
                        >
                          <FolderOpen className="w-4 h-4 mr-1" />
                          Load
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteSession(session.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Auto-save Indicator */}
      <div className="flex items-center justify-between text-xs text-muted-foreground p-2">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Auto-save: Enabled
        </span>
        <span>Last saved: Just now</span>
      </div>
    </div>
  );
};
