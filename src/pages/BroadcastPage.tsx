import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Radio,
  Video,
  VideoOff,
  Mic,
  MicOff,
  MonitorUp,
  Users,
  Settings,
  X,
  Gift,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useStream, useLiveStreamManager } from '@/hooks/useLiveStream';
import { LiveChat } from '@/components/live/LiveChat';
import { GiftAnimation } from '@/components/live/GiftAnimation';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export const BroadcastPage: React.FC = () => {
  const { streamId } = useParams<{ streamId: string }>();
  const navigate = useNavigate();
  const { data: stream, isLoading } = useStream(streamId);
  const { endStream } = useLiveStreamManager();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: cameraEnabled,
          audio: micEnabled,
        });
        setMediaStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Camera error:', err);
        toast.error('Could not access camera');
      }
    };

    if (stream?.is_live) {
      initCamera();
    }

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream?.is_live]);

  // Toggle camera
  useEffect(() => {
    if (mediaStream) {
      mediaStream.getVideoTracks().forEach((track) => {
        track.enabled = cameraEnabled;
      });
    }
  }, [cameraEnabled, mediaStream]);

  // Toggle mic
  useEffect(() => {
    if (mediaStream) {
      mediaStream.getAudioTracks().forEach((track) => {
        track.enabled = micEnabled;
      });
    }
  }, [micEnabled, mediaStream]);

  const handleEndStream = async () => {
    if (!streamId) return;

    try {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
      await endStream.mutateAsync(streamId);
      navigate('/live');
    } catch (error) {
      console.error('Failed to end stream:', error);
      toast.error('Failed to end stream');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Skeleton className="h-full" />
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Stream Not Found</h1>
          <Button onClick={() => navigate('/live')}>Go to Live</Button>
        </div>
      </div>
    );
  }

  const streamDuration = stream.started_at
    ? formatDistanceToNow(new Date(stream.started_at), { includeSeconds: true })
    : '0:00';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Gift Animations */}
      {streamId && <GiftAnimation streamId={streamId} />}

      {/* Top Bar */}
      <div className="border-b bg-background/95 backdrop-blur px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="destructive" className="animate-pulse">
            <Radio className="h-3 w-3 mr-1" />
            LIVE
          </Badge>
          <span className="font-medium">{stream.title}</span>
          <span className="text-muted-foreground">{streamDuration}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span>{stream.viewer_count}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Gift className="h-4 w-4" />
            <span>${stream.total_gifts_value.toFixed(2)}</span>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowEndDialog(true)}
          >
            End Stream
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Preview */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="relative flex-1 bg-black rounded-lg overflow-hidden">
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
                <VideoOff className="h-16 w-16 text-muted-foreground" />
              </div>
            )}

            {/* Control Bar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full">
              <Button
                size="icon"
                variant={cameraEnabled ? 'default' : 'destructive'}
                onClick={() => setCameraEnabled(!cameraEnabled)}
              >
                {cameraEnabled ? (
                  <Video className="h-5 w-5" />
                ) : (
                  <VideoOff className="h-5 w-5" />
                )}
              </Button>
              <Button
                size="icon"
                variant={micEnabled ? 'default' : 'destructive'}
                onClick={() => setMicEnabled(!micEnabled)}
              >
                {micEnabled ? (
                  <Mic className="h-5 w-5" />
                ) : (
                  <MicOff className="h-5 w-5" />
                )}
              </Button>
              <Button size="icon" variant="outline">
                <MonitorUp className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="outline">
                <Users className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="outline">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Stream Stats */}
          <div className="mt-4 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span>{stream.viewer_count} viewers</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{stream.peak_viewers} peak</span>
            </div>
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-muted-foreground" />
              <span>${stream.total_gifts_value.toFixed(2)} earned</span>
            </div>
          </div>
        </div>

        {/* Chat Panel */}
        <div className="w-80 border-l">
          {streamId && <LiveChat streamId={streamId} className="h-full border-0 rounded-none" />}
        </div>
      </div>

      {/* End Stream Dialog */}
      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Stream?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end this stream? This will disconnect all viewers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEndStream}
              className="bg-destructive hover:bg-destructive/90"
            >
              End Stream
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BroadcastPage;
