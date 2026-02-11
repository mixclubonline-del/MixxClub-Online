import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Video, VideoOff, Mic, MicOff, Radio, Users, Lock, Eye,
    Music, ShoppingCart, Shield, Disc3, CheckCircle,
} from 'lucide-react';
import { useLiveStreamManager } from '@/hooks/useLiveStream';
import { useProducerBeats } from '@/hooks/useProducerBeats';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import type { ProducerBeat } from '@/hooks/useProducerBeats';

interface ProducerGoLiveModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const STREAM_TYPES = [
    { value: 'broadcast', label: 'Broadcast', icon: Radio, description: 'Go live to your audience' },
    { value: 'beat-making', label: 'Beat Making', icon: Disc3, description: 'Stream your production process' },
    { value: 'session', label: 'Studio Session', icon: Video, description: 'Stream a collab session' },
    { value: 'collab', label: 'Collaboration', icon: Users, description: 'Create with others live' },
];

const CATEGORIES = [
    'beat-making',
    'production',
    'mixing',
    'mastering',
    'performance',
    'q&a',
    'behind-the-scenes',
    'tutorial',
    'general',
];

const VISIBILITY_OPTIONS = [
    { value: 'public', label: 'Public', icon: Eye, description: 'Anyone can watch' },
    { value: 'followers', label: 'Followers Only', icon: Users, description: 'Only your followers' },
    { value: 'private', label: 'Private', icon: Lock, description: 'Invite only' },
];

export const ProducerGoLiveModal: React.FC<ProducerGoLiveModalProps> = ({
    open,
    onOpenChange,
}) => {
    const navigate = useNavigate();
    const { createStream, startStream } = useLiveStreamManager();
    const { publishedBeats } = useProducerBeats();
    const videoRef = useRef<HTMLVideoElement>(null);

    const [step, setStep] = useState(1);
    const [streamType, setStreamType] = useState('beat-making');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('beat-making');
    const [visibility, setVisibility] = useState('public');
    const [isRecorded, setIsRecorded] = useState(true);
    const [cameraEnabled, setCameraEnabled] = useState(true);
    const [micEnabled, setMicEnabled] = useState(true);
    const [stream, setStream] = useState<MediaStream | null>(null);

    // Producer-specific options
    const [featuredBeat, setFeaturedBeat] = useState<ProducerBeat | null>(null);
    const [beatWatermark, setBeatWatermark] = useState(true);
    const [enablePurchaseCTA, setEnablePurchaseCTA] = useState(true);

    // Camera preview
    useEffect(() => {
        if (open && step === 2) {
            navigator.mediaDevices
                .getUserMedia({ video: cameraEnabled, audio: micEnabled })
                .then((mediaStream) => {
                    setStream(mediaStream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream;
                    }
                })
                .catch((err) => {
                    console.error('Camera access error:', err);
                    toast.error('Could not access camera or microphone');
                });
        }

        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, [open, step, cameraEnabled, micEnabled]);

    const handleGoLive = async () => {
        if (!title.trim()) {
            toast.error('Please enter a title');
            return;
        }

        try {
            const newStream = await createStream.mutateAsync({
                title,
                description,
                stream_type: streamType,
                category,
                visibility,
                is_recorded: isRecorded,
            });

            await startStream.mutateAsync(newStream.id);

            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }

            onOpenChange(false);
            navigate(`/broadcast/${newStream.id}`);
        } catch (error) {
            console.error('Failed to start stream:', error);
            toast.error('Failed to start stream');
        }
    };

    const handleClose = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
        }
        setStep(1);
        setTitle('');
        setDescription('');
        setFeaturedBeat(null);
        onOpenChange(false);
    };

    const handleSelectBeat = (beat: ProducerBeat) => {
        if (featuredBeat?.id === beat.id) {
            setFeaturedBeat(null); // toggle off
        } else {
            setFeaturedBeat(beat);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Radio className="h-5 w-5 text-destructive" />
                        Go Live
                        <Badge variant="outline" className="ml-1 text-xs bg-amber-500/10 text-amber-500 border-amber-500/20">
                            Producer Studio
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                {step === 1 && (
                    <div className="space-y-6">
                        {/* Stream Type Selection */}
                        <div className="space-y-3">
                            <Label>Stream Type</Label>
                            <div className="grid gap-3">
                                {STREAM_TYPES.map((type) => (
                                    <button
                                        key={type.value}
                                        onClick={() => {
                                            setStreamType(type.value);
                                            if (type.value === 'beat-making') setCategory('beat-making');
                                        }}
                                        className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${streamType === type.value
                                                ? 'border-amber-500 bg-amber-500/10'
                                                : 'border-border hover:border-amber-500/50'
                                            }`}
                                    >
                                        <type.icon className="h-6 w-6 text-amber-500" />
                                        <div className="text-left">
                                            <div className="font-medium">{type.label}</div>
                                            <div className="text-sm text-muted-foreground">{type.description}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    placeholder="What's this stream about?"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Tell viewers what to expect..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={2}
                                />
                            </div>
                        </div>

                        {/* Featured Beat Selector */}
                        {publishedBeats && publishedBeats.length > 0 && (
                            <div className="space-y-3">
                                <Label className="flex items-center gap-2">
                                    <Music className="w-4 h-4 text-amber-500" />
                                    Feature a Beat
                                </Label>
                                <ScrollArea className="w-full">
                                    <div className="flex gap-2 pb-2">
                                        {publishedBeats.slice(0, 6).map((beat) => (
                                            <motion.button
                                                key={beat.id}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => handleSelectBeat(beat)}
                                                className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${featuredBeat?.id === beat.id
                                                        ? 'border-amber-500 bg-amber-500/10'
                                                        : 'border-border hover:border-amber-500/40'
                                                    }`}
                                            >
                                                <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center overflow-hidden shrink-0">
                                                    {beat.cover_image_url ? (
                                                        <img src={beat.cover_image_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Music className="w-3 h-3 text-amber-500" />
                                                    )}
                                                </div>
                                                <div className="text-left min-w-0">
                                                    <p className="text-xs font-medium truncate max-w-[100px]">{beat.title}</p>
                                                    {beat.bpm && <p className="text-[10px] text-muted-foreground">{beat.bpm} BPM</p>}
                                                </div>
                                                {featuredBeat?.id === beat.id && (
                                                    <CheckCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                                )}
                                            </motion.button>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}

                        {/* Producer-Specific Toggles */}
                        {featuredBeat && (
                            <div className="space-y-3 p-3 rounded-lg bg-muted/50 border border-border/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-amber-500" />
                                        <div>
                                            <div className="text-sm font-medium">Beat Watermark</div>
                                            <div className="text-xs text-muted-foreground">Protect your beat during live preview</div>
                                        </div>
                                    </div>
                                    <Switch checked={beatWatermark} onCheckedChange={setBeatWatermark} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ShoppingCart className="w-4 h-4 text-amber-500" />
                                        <div>
                                            <div className="text-sm font-medium">Purchase CTA</div>
                                            <div className="text-xs text-muted-foreground">Let viewers buy the featured beat</div>
                                        </div>
                                    </div>
                                    <Switch checked={enablePurchaseCTA} onCheckedChange={setEnablePurchaseCTA} />
                                </div>
                            </div>
                        )}

                        {/* Category & Visibility */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map((cat) => (
                                            <SelectItem key={cat} value={cat} className="capitalize">
                                                {cat.replace('-', ' ')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Visibility</Label>
                                <Select value={visibility} onValueChange={setVisibility}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {VISIBILITY_OPTIONS.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                <div className="flex items-center gap-2">
                                                    <opt.icon className="h-4 w-4" />
                                                    {opt.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Recording Toggle */}
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium">Save Recording</div>
                                <div className="text-sm text-muted-foreground">
                                    Save stream for later viewing
                                </div>
                            </div>
                            <Switch checked={isRecorded} onCheckedChange={setIsRecorded} />
                        </div>

                        <Button
                            onClick={() => setStep(2)}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white"
                            disabled={!title.trim()}
                        >
                            Next: Camera Setup
                        </Button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        {/* Camera Preview */}
                        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                            {cameraEnabled ? (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <VideoOff className="h-12 w-12 text-muted-foreground" />
                                </div>
                            )}

                            {/* Controls Overlay */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                <Button
                                    size="icon"
                                    variant={cameraEnabled ? 'default' : 'destructive'}
                                    onClick={() => setCameraEnabled(!cameraEnabled)}
                                >
                                    {cameraEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                                </Button>
                                <Button
                                    size="icon"
                                    variant={micEnabled ? 'default' : 'destructive'}
                                    onClick={() => setMicEnabled(!micEnabled)}
                                >
                                    {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        {/* Stream Summary */}
                        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                            <div className="font-medium">{title}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-4 flex-wrap">
                                <span className="capitalize">{streamType.replace('-', ' ')}</span>
                                <span>•</span>
                                <span className="capitalize">{category.replace('-', ' ')}</span>
                                <span>•</span>
                                <span className="capitalize">{visibility}</span>
                                {featuredBeat && (
                                    <>
                                        <span>•</span>
                                        <span className="flex items-center gap-1 text-amber-500">
                                            <Music className="w-3 h-3" />
                                            {featuredBeat.title}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                                Back
                            </Button>
                            <Button
                                onClick={handleGoLive}
                                className="flex-1 bg-destructive hover:bg-destructive/90"
                                disabled={createStream.isPending || startStream.isPending}
                            >
                                {createStream.isPending || startStream.isPending ? (
                                    'Starting...'
                                ) : (
                                    <>
                                        <Radio className="h-4 w-4 mr-2" />
                                        Go Live
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
