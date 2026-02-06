import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileAudio, Disc3, Music, Flag, EyeOff, Trash2, Loader2,
  AlertTriangle, MoreHorizontal, Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type ContentType = 'audio' | 'beat';

interface DeleteTarget {
  id: string;
  name: string;
  type: ContentType;
}

export const AdminContentHub = () => {
  const [audioFiles, setAudioFiles] = useState<any[]>([]);
  const [beats, setBeats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const [{ data: files }, { data: beatsData }] = await Promise.all([
        supabase.from('audio_files').select('*').order('created_at', { ascending: false }).limit(30),
        supabase.from('producer_beats').select('*').order('created_at', { ascending: false }).limit(30),
      ]);

      setAudioFiles(files || []);
      setBeats(beatsData || []);
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFlag = async (id: string, type: ContentType, currentlyFlagged: boolean) => {
    setActionLoading(id);
    try {
      if (type === 'audio') {
        const { error } = await supabase.from('audio_files')
          .update({ waveform_data: currentlyFlagged ? null : { flagged: true, flagged_at: new Date().toISOString() } })
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('producer_beats')
          .update({ status: currentlyFlagged ? 'active' : 'flagged' })
          .eq('id', id);
        if (error) throw error;
      }

      if (type === 'audio') {
        setAudioFiles(prev => prev.map(f =>
          f.id === id ? { ...f, waveform_data: currentlyFlagged ? null : { flagged: true } } : f
        ));
      } else {
        setBeats(prev => prev.map(b =>
          b.id === id ? { ...b, status: currentlyFlagged ? 'active' : 'flagged' } : b
        ));
      }
      toast.success(currentlyFlagged ? 'Flag removed' : 'Content flagged');
    } catch (error) {
      console.error('Flag action failed:', error);
      toast.error('Failed to update flag status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleVisibility = async (id: string, type: ContentType, makeHidden: boolean) => {
    setActionLoading(id);
    try {
      if (type === 'beat') {
        const newStatus = makeHidden ? 'hidden' : 'active';
        const { error } = await supabase
          .from('producer_beats')
          .update({ status: newStatus })
          .eq('id', id);
        if (error) throw error;
        setBeats(prev => prev.map(b =>
          b.id === id ? { ...b, status: newStatus } : b
        ));
      } else {
        const { error } = await supabase
          .from('audio_files')
          .update({ waveform_data: makeHidden ? { hidden: true, hidden_at: new Date().toISOString() } : null })
          .eq('id', id);
        if (error) throw error;
        setAudioFiles(prev => prev.map(f =>
          f.id === id ? { ...f, waveform_data: makeHidden ? { hidden: true } : null } : f
        ));
      }
      toast.success(makeHidden ? 'Content hidden' : 'Content visible');
    } catch (error) {
      console.error('Visibility toggle failed:', error);
      toast.error('Failed to update visibility');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(deleteTarget.id);
    try {
      const table = deleteTarget.type === 'audio' ? 'audio_files' : 'producer_beats';
      const { error } = await supabase.from(table).delete().eq('id', deleteTarget.id);
      if (error) throw error;

      if (deleteTarget.type === 'audio') {
        setAudioFiles(prev => prev.filter(f => f.id !== deleteTarget.id));
      } else {
        setBeats(prev => prev.filter(b => b.id !== deleteTarget.id));
      }
      toast.success(`${deleteTarget.name} deleted`);
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete content');
    } finally {
      setActionLoading(null);
      setDeleteTarget(null);
    }
  };

  const isAudioFlagged = (file: any) => file.waveform_data?.flagged === true;
  const isAudioHidden = (file: any) => file.waveform_data?.hidden === true;
  const isBeatHidden = (beat: any) => beat.status === 'hidden';
  const isBeatFlagged = (beat: any) => beat.status === 'flagged';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const flaggedAudioCount = audioFiles.filter(isAudioFlagged).length;
  const hiddenAudioCount = audioFiles.filter(isAudioHidden).length;
  const hiddenBeatCount = beats.filter(isBeatHidden).length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-background/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <FileAudio className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{audioFiles.length}</p>
              <p className="text-xs text-muted-foreground">Audio Files</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-background/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Disc3 className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{beats.length}</p>
              <p className="text-xs text-muted-foreground">Producer Beats</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-background/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Flag className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{flaggedAudioCount}</p>
              <p className="text-xs text-muted-foreground">Flagged</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-background/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <EyeOff className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{hiddenAudioCount + hiddenBeatCount}</p>
              <p className="text-xs text-muted-foreground">Hidden</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audio Files */}
      <Card className="bg-background/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileAudio className="w-4 h-4" /> Recent Audio Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {audioFiles.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No audio files uploaded</p>
            ) : (
              audioFiles.slice(0, 15).map((file) => {
                const flagged = isAudioFlagged(file);
                const hidden = isAudioHidden(file);
                const busy = actionLoading === file.id;

                return (
                  <div
                    key={file.id}
                    className={`flex items-center justify-between py-2.5 px-3 rounded-lg border transition-colors ${
                      flagged
                        ? 'border-orange-500/30 bg-orange-500/5'
                        : hidden
                          ? 'border-red-500/20 bg-red-500/5 opacity-60'
                          : 'border-transparent hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Music className="w-4 h-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                            {file.file_name}
                          </p>
                          {flagged && (
                            <Badge variant="outline" className="text-[10px] border-orange-500/30 text-orange-400 px-1.5 py-0">
                              <Flag className="w-2.5 h-2.5 mr-0.5" /> Flagged
                            </Badge>
                          )}
                          {hidden && (
                            <Badge variant="outline" className="text-[10px] border-red-500/30 text-red-400 px-1.5 py-0">
                              <EyeOff className="w-2.5 h-2.5 mr-0.5" /> Hidden
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.file_size)} • {format(new Date(file.created_at), 'MMM d')}
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" disabled={busy}>
                          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreHorizontal className="w-4 h-4" />}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border">
                        <DropdownMenuItem onClick={() => handleFlag(file.id, 'audio', flagged)}>
                          <Flag className="w-3.5 h-3.5 mr-2" />
                          {flagged ? 'Remove Flag' : 'Flag Content'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleVisibility(file.id, 'audio', !hidden)}>
                          {hidden ? <Eye className="w-3.5 h-3.5 mr-2" /> : <EyeOff className="w-3.5 h-3.5 mr-2" />}
                          {hidden ? 'Make Visible' : 'Hide Content'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteTarget({ id: file.id, name: file.file_name, type: 'audio' })}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-2" />
                          Delete File
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Beats */}
      <Card className="bg-background/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Disc3 className="w-4 h-4" /> Recent Producer Beats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {beats.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No beats uploaded</p>
            ) : (
              beats.slice(0, 15).map((beat) => {
                const hidden = isBeatHidden(beat);
                const busy = actionLoading === beat.id;

                return (
                  <div
                    key={beat.id}
                    className={`flex items-center justify-between py-2.5 px-3 rounded-lg border transition-colors ${
                      hidden
                        ? 'border-red-500/20 bg-red-500/5 opacity-60'
                        : 'border-transparent hover:bg-muted/30'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                          {beat.title || 'Untitled Beat'}
                        </p>
                        {hidden && (
                          <Badge variant="outline" className="text-[10px] border-red-500/30 text-red-400 px-1.5 py-0">
                            <EyeOff className="w-2.5 h-2.5 mr-0.5" /> Hidden
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {beat.genre && <Badge variant="outline" className="text-xs">{beat.genre}</Badge>}
                        {beat.bpm && <Badge variant="outline" className="text-xs">{beat.bpm} BPM</Badge>}
                        {beat.price != null && (
                          <span className="text-xs font-medium text-foreground">${beat.price}</span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(beat.created_at), 'MMM d')}
                        </span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" disabled={busy}>
                          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreHorizontal className="w-4 h-4" />}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border">
                        <DropdownMenuItem onClick={() => handleVisibility(beat.id, 'beat', !hidden)}>
                          {hidden ? <Eye className="w-3.5 h-3.5 mr-2" /> : <EyeOff className="w-3.5 h-3.5 mr-2" />}
                          {hidden ? 'Restore Beat' : 'Hide Beat'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteTarget({ id: beat.id, name: beat.title || 'Untitled Beat', type: 'beat' })}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-2" />
                          Delete Beat
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete {deleteTarget?.type === 'audio' ? 'Audio File' : 'Beat'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <span className="font-medium text-foreground">"{deleteTarget?.name}"</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/50">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading === deleteTarget?.id ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <Trash2 className="w-4 h-4 mr-1" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
