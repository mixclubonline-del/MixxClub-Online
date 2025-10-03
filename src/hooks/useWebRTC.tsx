import { useRef, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseWebRTCProps {
  sessionId: string;
  userId: string;
  onRemoteStream?: (stream: MediaStream, peerId: string) => void;
}

export const useWebRTC = ({ sessionId, userId, onRemoteStream }: UseWebRTCProps) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const signalingChannel = useRef<any>(null);

  const configuration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  // Initialize local media stream
  const startLocalStream = useCallback(async (options: { audio: boolean; video: boolean }) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(options);
      setLocalStream(stream);
      setIsAudioEnabled(options.audio);
      setIsVideoEnabled(options.video);
      return stream;
    } catch (error) {
      toast.error('Failed to access camera/microphone');
      throw error;
    }
  }, []);

  // Stop local stream
  const stopLocalStream = useCallback(() => {
    localStream?.getTracks().forEach(track => track.stop());
    setLocalStream(null);
    setIsAudioEnabled(false);
    setIsVideoEnabled(false);
  }, [localStream]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, [localStream]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, [localStream]);

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true,
        audio: false 
      });
      
      // Replace video track in peer connections
      const screenTrack = screenStream.getVideoTracks()[0];
      peerConnections.current.forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(screenTrack);
        }
      });

      screenTrack.onended = () => {
        stopScreenShare();
      };

      setIsScreenSharing(true);
      return screenStream;
    } catch (error) {
      toast.error('Failed to start screen sharing');
      throw error;
    }
  }, []);

  // Stop screen sharing
  const stopScreenShare = useCallback(async () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        // Restore camera track
        peerConnections.current.forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        });
      }
    }
    setIsScreenSharing(false);
  }, [localStream]);

  // Create peer connection
  const createPeerConnection = useCallback((peerId: string) => {
    const pc = new RTCPeerConnection(configuration);

    // Add local tracks
    localStream?.getTracks().forEach(track => {
      pc.addTrack(track, localStream);
    });

    // Handle incoming remote stream
    pc.ontrack = (event) => {
      if (event.streams[0]) {
        onRemoteStream?.(event.streams[0], peerId);
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignalingMessage({
          type: 'ice-candidate',
          candidate: event.candidate,
          to: peerId,
          from: userId,
          sessionId,
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`ICE connection state: ${pc.iceConnectionState}`);
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        peerConnections.current.delete(peerId);
      }
    };

    peerConnections.current.set(peerId, pc);
    return pc;
  }, [localStream, userId, sessionId, onRemoteStream]);

  // Send signaling message via realtime
  const sendSignalingMessage = async (message: any) => {
    // Use Supabase Realtime for WebRTC signaling
    try {
      const channel = supabase.channel(`webrtc:${sessionId}`);
      await channel.send({
        type: 'broadcast',
        event: 'signaling',
        payload: message
      });
    } catch (error) {
      console.error('Failed to send signaling message:', error);
    }
  };

  // Create and send offer
  const createOffer = useCallback(async (peerId: string) => {
    const pc = createPeerConnection(peerId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    sendSignalingMessage({
      type: 'offer',
      offer,
      to: peerId,
      from: userId,
      sessionId,
    });
  }, [createPeerConnection, userId, sessionId]);

  // Handle received offer
  const handleOffer = useCallback(async (peerId: string, offer: RTCSessionDescriptionInit) => {
    const pc = createPeerConnection(peerId);
    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    
    sendSignalingMessage({
      type: 'answer',
      answer,
      to: peerId,
      from: userId,
      sessionId,
    });
  }, [createPeerConnection, userId, sessionId]);

  // Handle received answer
  const handleAnswer = useCallback(async (peerId: string, answer: RTCSessionDescriptionInit) => {
    const pc = peerConnections.current.get(peerId);
    if (pc) {
      await pc.setRemoteDescription(answer);
    }
  }, []);

  // Handle ICE candidate
  const handleIceCandidate = useCallback(async (peerId: string, candidate: RTCIceCandidateInit) => {
    const pc = peerConnections.current.get(peerId);
    if (pc) {
      await pc.addIceCandidate(candidate);
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      stopLocalStream();
      peerConnections.current.forEach(pc => pc.close());
      peerConnections.current.clear();
    };
  }, [stopLocalStream]);

  return {
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
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
  };
};
