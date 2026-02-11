import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProducerBeats } from '@/hooks/useProducerBeats';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Play, Zap, Music, Users, Headphones,
    ArrowRight, Loader2, CheckCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import type { ProducerBeat } from '@/hooks/useProducerBeats';

interface BeatSessionLauncherProps {
    onSessionCreated?: (sessionId: string) => void;
}

export const BeatSessionLauncher = ({ onSessionCreated }: BeatSessionLauncherProps) => {
    const { user } = useAuth();
    const { publishedBeats, isLoading } = useProducerBeats();
    const [selectedBeat, setSelectedBeat] = useState<ProducerBeat | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [sessionTitle, setSessionTitle] = useState('');
    const [sessionDescription, setSessionDescription] = useState('');
    const [maxParticipants, setMaxParticipants] = useState(5);

    const handleSelectBeat = (beat: ProducerBeat) => {
        setSelectedBeat(beat);
        setSessionTitle(`"${beat.title}" Recording Session`);
        setSessionDescription(
            [
                beat.bpm && `${beat.bpm} BPM`,
                beat.key_signature && `Key: ${beat.key_signature}`,
                beat.genre && `Genre: ${beat.genre}`,
                beat.description,
            ].filter(Boolean).join(' • ')
        );
        setDialogOpen(true);
    };

    const handleCreateSession = async () => {
        if (!user?.id || !selectedBeat) return;

        setCreating(true);
        try {
            const { data, error } = await supabase
                .from('collaboration_sessions')
                .insert({
                    host_user_id: user.id,
                    title: sessionTitle,
                    description: sessionDescription,
                    session_type: 'recording',
                    audio_quality: 'high',
                    max_participants: maxParticipants,
                    visibility: 'public',
                    status: 'waiting',
                    session_state: {
                        beat_id: selectedBeat.id,
                        beat_title: selectedBeat.title,
                        beat_bpm: selectedBeat.bpm,
                        beat_key: selectedBeat.key_signature,
                        beat_genre: selectedBeat.genre,
                        beat_audio_url: selectedBeat.audio_url,
                        beat_cover_url: selectedBeat.cover_image_url,
                    },
                })
                .select('id')
                .single();

            if (error) throw error;

            toast.success('Session created!', {
                description: `"${sessionTitle}" is ready for collaborators`,
            });

            setDialogOpen(false);
            setSelectedBeat(null);
            onSessionCreated?.(data.id);
        } catch (err) {
            console.error('Error creating session:', err);
            toast.error('Failed to create session');
        } finally {
            setCreating(false);
        }
    };

    if (isLoading) return null;
    if (!publishedBeats || publishedBeats.length === 0) return null;

    return (
        <>
            <Card className="border-border/30 bg-card/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-500" />
                        Beat → Session Pipeline
                        <Badge variant="outline" className="ml-2 text-xs bg-amber-500/10 text-amber-500 border-amber-500/20">
                            Quick Launch
                        </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Pick a beat to instantly launch a recording session
                    </p>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="w-full">
                        <div className="flex gap-3 pb-2">
                            {publishedBeats.slice(0, 8).map((beat, index) => (
                                <motion.div
                                    key={beat.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="min-w-[180px] max-w-[180px]"
                                >
                                    <Card
                                        className="overflow-hidden border-border/30 hover:border-amber-500/40 transition-all cursor-pointer group"
                                        onClick={() => handleSelectBeat(beat)}
                                    >
                                        {/* Cover */}
                                        <div className="aspect-square relative bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                                            {beat.cover_image_url ? (
                                                <img
                                                    src={beat.cover_image_url}
                                                    alt={beat.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Music className="w-10 h-10 text-muted-foreground/30" />
                                                </div>
                                            )}
                                            {/* Hover overlay */}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="flex items-center gap-2 text-white font-medium text-sm">
                                                    <Play className="w-4 h-4" />
                                                    Start Session
                                                </div>
                                            </div>
                                        </div>
                                        {/* Info */}
                                        <div className="p-2.5">
                                            <p className="text-sm font-medium truncate">{beat.title}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                {beat.bpm && <span>{beat.bpm} BPM</span>}
                                                {beat.key_signature && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{beat.key_signature}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Session Creation Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Headphones className="w-5 h-5 text-amber-500" />
                            Launch Recording Session
                        </DialogTitle>
                        <DialogDescription>
                            Create a session around "{selectedBeat?.title}" — invite artists to record over your beat.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Beat Preview */}
                        {selectedBeat && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/30">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center overflow-hidden shrink-0">
                                    {selectedBeat.cover_image_url ? (
                                        <img src={selectedBeat.cover_image_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <Music className="w-5 h-5 text-amber-500" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-sm truncate">{selectedBeat.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {[selectedBeat.bpm && `${selectedBeat.bpm} BPM`, selectedBeat.key_signature, selectedBeat.genre].filter(Boolean).join(' • ')}
                                    </p>
                                </div>
                                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Session Title</Label>
                            <Input
                                value={sessionTitle}
                                onChange={(e) => setSessionTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={sessionDescription}
                                onChange={(e) => setSessionDescription(e.target.value)}
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Max Participants</Label>
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="number"
                                    min={2}
                                    max={10}
                                    value={maxParticipants}
                                    onChange={(e) => setMaxParticipants(Number(e.target.value))}
                                    className="w-20"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateSession}
                            disabled={creating || !sessionTitle.trim()}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white"
                        >
                            {creating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <ArrowRight className="w-4 h-4 mr-2" />
                                    Launch Session
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
