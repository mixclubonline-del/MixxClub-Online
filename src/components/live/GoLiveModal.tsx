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
import { Video, VideoOff, Mic, MicOff, Radio, Users, Lock, Eye } from 'lucide-react';
import { useLiveStreamManager } from '@/hooks/useLiveStream';
import { toast } from 'sonner';

interface GoLiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STREAM_TYPES = [
  { value: 'broadcast', label: 'Broadcast', icon: Radio, description: 'Go live to your audience' },
  { value: 'session', label: 'Studio Session', icon: Video, description: 'Stream your mixing session' },
  { value: 'collab', label: 'Collaboration', icon: Users, description: 'Create with others live' },
];

const CATEGORIES = [
  'mixing',
  'mastering',
  'production',
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

export const GoLiveModal: React.FC<GoLiveModalProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const { createStream, startStream } = useLiveStreamManager();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [step, setStep] = useState(1);
  const [streamType, setStreamType] = useState('broadcast');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [visibility, setVisibility] = useState('public');
  const [isRecorded, setIsRecorded] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Get camera preview
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

      // Stop preview stream
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
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-destructive" />
            Go Live
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
                    onClick={() => setStreamType(type.value)}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                      streamType === type.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <type.icon className="h-6 w-6 text-primary" />
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
                  rows={3}
                />
              </div>
            </div>

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
              className="w-full"
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
              <div className="text-sm text-muted-foreground flex items-center gap-4">
                <span className="capitalize">{streamType}</span>
                <span>•</span>
                <span className="capitalize">{category}</span>
                <span>•</span>
                <span className="capitalize">{visibility}</span>
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
