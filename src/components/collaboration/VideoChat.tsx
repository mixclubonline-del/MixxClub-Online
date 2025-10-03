import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWebRTC } from '@/hooks/useWebRTC';
import { Video, VideoOff, Mic, MicOff, Monitor, MonitorOff, Phone } from 'lucide-react';

interface VideoChatProps {
  sessionId: string;
  userId: string;
  participants: string[];
}

export function VideoChat({ sessionId, userId, participants }: VideoChatProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [remoteVideos, setRemoteVideos] = useState<Map<string, MediaStream>>(new Map());

  const {
    localStream,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    startLocalStream,
    stopLocalStream,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
  } = useWebRTC({
    sessionId,
    userId,
    onRemoteStream: (stream, peerId) => {
      setRemoteVideos(prev => new Map(prev).set(peerId, stream));
    },
  });

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const handleStartCall = async () => {
    await startLocalStream({ audio: true, video: true });
  };

  const handleEndCall = () => {
    stopLocalStream();
    setRemoteVideos(new Map());
  };

  return (
    <Card className="touch-manipulation">
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span>Video Conference</span>
          {localStream && (
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button
                size="sm"
                variant={isAudioEnabled ? "default" : "destructive"}
                onClick={toggleAudio}
                className="touch-manipulation"
              >
                {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                <span className="ml-2 hidden sm:inline">{isAudioEnabled ? 'Mute' : 'Unmute'}</span>
              </Button>
              <Button
                size="sm"
                variant={isVideoEnabled ? "default" : "destructive"}
                onClick={toggleVideo}
                className="touch-manipulation"
              >
                {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                <span className="ml-2 hidden sm:inline">{isVideoEnabled ? 'Stop' : 'Start'}</span>
              </Button>
              <Button
                size="sm"
                variant={isScreenSharing ? "default" : "outline"}
                onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                className="touch-manipulation hidden sm:flex"
              >
                {isScreenSharing ? <MonitorOff className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                <span className="ml-2 hidden md:inline">Screen</span>
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleEndCall}
                className="touch-manipulation"
              >
                <Phone className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">End</span>
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!localStream ? (
            <div className="flex items-center justify-center p-8 bg-muted rounded-lg">
              <Button onClick={handleStartCall}>
                <Video className="h-4 w-4 mr-2" />
                Start Video Call
              </Button>
            </div>
          ) : (
            <>
              {/* Local Video */}
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden touch-none">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-xs sm:text-sm">
                  You
                </div>
              </div>

              {/* Remote Videos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {Array.from(remoteVideos.entries()).map(([peerId, stream]) => (
                  <RemoteVideo key={peerId} stream={stream} peerId={peerId} />
                ))}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function RemoteVideo({ stream, peerId }: { stream: MediaStream; peerId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden touch-none">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-xs sm:text-sm">
        Participant {peerId.slice(-4)}
      </div>
    </div>
  );
}
