import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Sparkles, ArrowRight, Users, Music, Handshake,
    Play, CheckCircle, Loader2, ChevronRight, Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useProducerBeats } from '@/hooks/useProducerBeats';
import type { ProducerBeat } from '@/hooks/useProducerBeats';

interface AICollabPipelineProps {
    userType: 'artist' | 'engineer' | 'producer';
}

interface MatchCandidate {
    id: string;
    matchedUserId: string;
    name: string;
    avatarUrl?: string;
    matchScore: number;
    matchReason?: string;
    genres?: string[];
}

const STEPS = [
    { key: 'match', label: 'Find Match', icon: Sparkles },
    { key: 'deal', label: 'Propose Deal', icon: Handshake },
    { key: 'launch', label: 'Launch Session', icon: Play },
];

export const AICollabPipeline = ({ userType }: AICollabPipelineProps) => {
    const { user } = useAuth();
    const { publishedBeats } = useProducerBeats();
    const [step, setStep] = useState(0);
    const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    // Step 1: Selected match
    const [selectedMatch, setSelectedMatch] = useState<MatchCandidate | null>(null);

    // Step 2: Deal terms
    const [producerSplit, setProducerSplit] = useState(50);
    const [selectedBeat, setSelectedBeat] = useState<ProducerBeat | null>(null);
    const [dealNotes, setDealNotes] = useState('');
    const [sessionTitle, setSessionTitle] = useState('');

    // Step 3: Result
    const [createdSessionId, setCreatedSessionId] = useState<string | null>(null);

    // Load top matches
    useEffect(() => {
        const loadMatches = async () => {
            if (!user?.id) return;
            setLoading(true);
            try {
                const { data: matchData } = await supabase
                    .from('user_matches')
                    .select('id, matched_user_id, match_score, match_reason')
                    .eq('user_id', user.id)
                    .order('match_score', { ascending: false })
                    .limit(6);

                if (matchData && matchData.length > 0) {
                    const ids = matchData.map(m => m.matched_user_id);
                    const { data: profiles } = await supabase
                        .from('profiles')
                        .select('id, full_name, avatar_url')
                        .in('id', ids);

                    const profileMap = new Map(
                        (profiles || []).map(p => [p.id, p])
                    );

                    setCandidates(matchData.map(m => {
                        const p = profileMap.get(m.matched_user_id);
                        return {
                            id: m.id,
                            matchedUserId: m.matched_user_id,
                            name: p?.full_name || 'Unknown',
                            avatarUrl: p?.avatar_url || undefined,
                            matchScore: m.match_score || 0,
                            matchReason: m.match_reason || undefined,
                        };
                    }));
                }
            } catch (err) {
                console.error('Error loading matches:', err);
            } finally {
                setLoading(false);
            }
        };
        loadMatches();
    }, [user?.id]);

    const handleSelectMatch = (candidate: MatchCandidate) => {
        setSelectedMatch(candidate);
        setSessionTitle(`Collab with ${candidate.name}`);
        setStep(1);
    };

    const handleProposeDeal = () => {
        if (!sessionTitle.trim()) {
            toast.error('Please enter a session title');
            return;
        }
        setStep(2);
    };

    const handleLaunch = async () => {
        if (!user?.id || !selectedMatch) return;
        setCreating(true);

        try {
            // 1. Create partnership
            const partnershipInsert: Record<string, unknown> = {
                artist_id: userType === 'artist' ? user.id : selectedMatch.matchedUserId,
                status: 'proposed',
                partnership_type: 'producer_artist',
                notes: dealNotes || undefined,
            };

            if (userType === 'producer') {
                partnershipInsert.producer_id = user.id;
                partnershipInsert.producer_percentage = producerSplit;
                partnershipInsert.artist_percentage = 100 - producerSplit;
            } else {
                partnershipInsert.engineer_id = userType === 'engineer' ? user.id : selectedMatch.matchedUserId;
                partnershipInsert.artist_split = userType === 'artist' ? producerSplit : 100 - producerSplit;
                partnershipInsert.engineer_split = userType === 'engineer' ? producerSplit : 100 - producerSplit;
            }

            const { error: partnershipError } = await supabase
                .from('partnerships')
                .insert(partnershipInsert as any);

            if (partnershipError) throw partnershipError;

            // 2. Create collaboration session
            const sessionState: Record<string, unknown> = {
                pipeline: true,
                partner_id: selectedMatch.matchedUserId,
                partner_name: selectedMatch.name,
                split: { producer: producerSplit, partner: 100 - producerSplit },
            };

            if (selectedBeat) {
                sessionState.beat_id = selectedBeat.id;
                sessionState.beat_title = selectedBeat.title;
                sessionState.beat_bpm = selectedBeat.bpm;
                sessionState.beat_key = selectedBeat.key_signature;
            }

            const { data: sessionData, error: sessionError } = await (supabase as any)
                .from('collaboration_sessions')
                .insert({
                    host_user_id: user.id,
                    title: sessionTitle,
                    description: dealNotes || `Collaboration session with ${selectedMatch.name}`,
                    session_type: 'recording',
                    audio_quality: 'high',
                    max_participants: 5,
                    visibility: 'private',
                    status: 'waiting',
                    session_state: sessionState,
                })
                .select('id')
                .single();

            if (sessionError) throw sessionError;

            setCreatedSessionId(sessionData.id);
            toast.success('🎉 Collab launched!', {
                description: `Partnership proposed + session created with ${selectedMatch.name}`,
            });
        } catch (err) {
            console.error('Error launching collab:', err);
            toast.error('Failed to launch collaboration');
        } finally {
            setCreating(false);
        }
    };

    const handleReset = () => {
        setStep(0);
        setSelectedMatch(null);
        setSelectedBeat(null);
        setProducerSplit(50);
        setDealNotes('');
        setSessionTitle('');
        setCreatedSessionId(null);
    };

    const roleLabel = userType === 'producer' ? 'Producer' : userType === 'artist' ? 'Artist' : 'Engineer';
    const partnerLabel = userType === 'producer' ? 'Artist' : userType === 'artist' ? 'Engineer' : 'Artist';

    return (
        <Card className="border-border/30 bg-gradient-to-br from-card/80 to-primary/5 overflow-hidden">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                        <Zap className="w-5 h-5 text-primary" />
                        AI Collab Pipeline
                    </CardTitle>
                    {step > 0 && !createdSessionId && (
                        <Button variant="ghost" size="sm" onClick={handleReset}>
                            Start Over
                        </Button>
                    )}
                </div>

                {/* Stepper */}
                <div className="flex items-center gap-1 mt-3">
                    {STEPS.map((s, i) => (
                        <div key={s.key} className="flex items-center gap-1 flex-1">
                            <div
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${i < step ? 'bg-primary/20 text-primary'
                                        : i === step ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                            >
                                {i < step ? (
                                    <CheckCircle className="w-3 h-3" />
                                ) : (
                                    <s.icon className="w-3 h-3" />
                                )}
                                {s.label}
                            </div>
                            {i < STEPS.length - 1 && (
                                <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                            )}
                        </div>
                    ))}
                </div>
            </CardHeader>

            <CardContent>
                <AnimatePresence mode="wait">
                    {/* Step 1: Find Match */}
                    {step === 0 && (
                        <motion.div
                            key="match"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-3"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                </div>
                            ) : candidates.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No matches yet. Check back soon!</p>
                                </div>
                            ) : (
                                <div className="grid gap-2">
                                    {candidates.map((c) => (
                                        <button
                                            key={c.id}
                                            onClick={() => handleSelectMatch(c)}
                                            className="flex items-center gap-3 p-3 rounded-lg border border-border/30 hover:border-primary/40 transition-all text-left group"
                                        >
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={c.avatarUrl} />
                                                <AvatarFallback>{c.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm">{c.name}</p>
                                                {c.matchReason && (
                                                    <p className="text-xs text-muted-foreground truncate">{c.matchReason}</p>
                                                )}
                                            </div>
                                            <Badge variant="outline" className="shrink-0 text-xs">
                                                {c.matchScore}%
                                            </Badge>
                                            <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Step 2: Propose Deal */}
                    {step === 1 && selectedMatch && (
                        <motion.div
                            key="deal"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            {/* Partner preview */}
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/30">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={selectedMatch.avatarUrl} />
                                    <AvatarFallback>{selectedMatch.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-sm">{selectedMatch.name}</p>
                                    <p className="text-xs text-muted-foreground">Match score: {selectedMatch.matchScore}%</p>
                                </div>
                            </div>

                            {/* Split slider */}
                            <div className="space-y-2">
                                <Label className="text-sm">Revenue Split</Label>
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                    <span>{roleLabel}: {producerSplit}%</span>
                                    <span>{partnerLabel}: {100 - producerSplit}%</span>
                                </div>
                                <Slider
                                    value={[producerSplit]}
                                    onValueChange={([v]) => setProducerSplit(v)}
                                    min={10}
                                    max={90}
                                    step={5}
                                />
                            </div>

                            {/* Beat attachment (producer only) */}
                            {userType === 'producer' && publishedBeats && publishedBeats.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-sm flex items-center gap-1.5">
                                        <Music className="w-3.5 h-3.5" />
                                        Attach Beat (optional)
                                    </Label>
                                    <ScrollArea className="w-full">
                                        <div className="flex gap-2 pb-1">
                                            {publishedBeats.slice(0, 5).map((beat) => (
                                                <button
                                                    key={beat.id}
                                                    onClick={() => setSelectedBeat(selectedBeat?.id === beat.id ? null : beat)}
                                                    className={`shrink-0 flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs transition-all ${selectedBeat?.id === beat.id
                                                            ? 'border-primary bg-primary/10'
                                                            : 'border-border hover:border-primary/40'
                                                        }`}
                                                >
                                                    <Music className="w-3 h-3" />
                                                    <span className="max-w-[80px] truncate">{beat.title}</span>
                                                    {selectedBeat?.id === beat.id && <CheckCircle className="w-3 h-3 text-primary" />}
                                                </button>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            )}

                            {/* Session title */}
                            <div className="space-y-2">
                                <Label className="text-sm">Session Title</Label>
                                <Input
                                    value={sessionTitle}
                                    onChange={(e) => setSessionTitle(e.target.value)}
                                    placeholder="Name this collaboration..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm">Notes (optional)</Label>
                                <Textarea
                                    value={dealNotes}
                                    onChange={(e) => setDealNotes(e.target.value)}
                                    placeholder="Any details about this collab..."
                                    rows={2}
                                />
                            </div>

                            <Button
                                onClick={handleProposeDeal}
                                disabled={!sessionTitle.trim()}
                                className="w-full"
                            >
                                <ArrowRight className="w-4 h-4 mr-2" />
                                Review & Launch
                            </Button>
                        </motion.div>
                    )}

                    {/* Step 3: Launch */}
                    {step === 2 && selectedMatch && (
                        <motion.div
                            key="launch"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            {createdSessionId ? (
                                <div className="text-center py-6 space-y-3">
                                    <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                                        <CheckCircle className="w-7 h-7 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">Collaboration Launched! 🎉</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Partnership proposed to {selectedMatch.name} • Session ready
                                        </p>
                                    </div>
                                    <div className="flex gap-2 justify-center">
                                        <Button variant="outline" size="sm" onClick={handleReset}>
                                            Start Another
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Summary */}
                                    <div className="p-4 rounded-lg bg-muted/50 border border-border/30 space-y-3">
                                        <p className="font-medium text-sm">Collaboration Summary</p>
                                        <div className="grid gap-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Partner</span>
                                                <span className="font-medium">{selectedMatch.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Split</span>
                                                <span className="font-medium">{producerSplit}% / {100 - producerSplit}%</span>
                                            </div>
                                            {selectedBeat && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Beat</span>
                                                    <span className="font-medium">{selectedBeat.title}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Session</span>
                                                <span className="font-medium">{sessionTitle}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                                            Back
                                        </Button>
                                        <Button
                                            onClick={handleLaunch}
                                            disabled={creating}
                                            className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-white"
                                        >
                                            {creating ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Launching...
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="w-4 h-4 mr-2" />
                                                    Launch Collab
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
};
