import { useRef, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseWebRTCProps {
  sessionId: string;
  userId: string;
  onRemoteStream?: (stream: MediaStream, peerId: string) => void;
  onScreenShareStream?: (stream: MediaStream, peerId: string) => void;
}

interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'screen-share-start' | 'screen-share-stop';
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  to: string;
  from: string;
  sessionId: string;
}

export const useWebRTC = ({ sessionId, userId, onRemoteStream, onScreenShareStream }: UseWebRTCProps) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectedPeers, setConnectedPeers] = useState<string[]>([]);
  
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const signalingChannel = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const pendingCandidates = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

  const configuration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ],
  };

  // Send signaling message via realtime
  const sendSignalingMessage = useCallback(async (message: SignalingMessage) => {
    if (!signalingChannel.current) {
      console.error('Signaling channel not initialized');
      return;
    }
    
    try {
      console.debug(`[WebRTC] Sending ${message.type} to ${message.to}`);
      await signalingChannel.current.send({
        type: 'broadcast',
        event: 'signaling',
        payload: message
      });
    } catch (error) {
      console.error('Failed to send signaling message:', error);
    }
  }, []);

  // Create peer connection for a specific peer
  const createPeerConnection = useCallback((peerId: string) => {
    if (peerConnections.current.has(peerId)) {
      return peerConnections.current.get(peerId)!;
    }

    console.debug(`[WebRTC] Creating peer connection for ${peerId}`);
    const pc = new RTCPeerConnection(configuration);

    // Add local tracks if available
    if (localStream) {
      localStream.getTracks().forEach(track => {
        console.debug(`[WebRTC] Adding local track: ${track.kind}`);
        pc.addTrack(track, localStream);
      });
    }

    // Handle incoming remote stream
    pc.ontrack = (event) => {
      console.debug(`[WebRTC] Received remote track from ${peerId}: ${event.track.kind}`);
      if (event.streams[0]) {
        onRemoteStream?.(event.streams[0], peerId);
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`[WebRTC] Sending ICE candidate to ${peerId}`);
        sendSignalingMessage({
          type: 'ice-candidate',
          candidate: event.candidate.toJSON(),
          to: peerId,
          from: userId,
          sessionId,
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`[WebRTC] ICE connection state with ${peerId}: ${pc.iceConnectionState}`);
      if (pc.iceConnectionState === 'connected') {
        setConnectedPeers(prev => [...new Set([...prev, peerId])]);
      } else if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        setConnectedPeers(prev => prev.filter(id => id !== peerId));
        peerConnections.current.delete(peerId);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] Connection state with ${peerId}: ${pc.connectionState}`);
    };

    peerConnections.current.set(peerId, pc);
    return pc;
  }, [localStream, userId, sessionId, onRemoteStream, sendSignalingMessage, configuration]);

  // Handle received offer
  const handleOffer = useCallback(async (peerId: string, offer: RTCSessionDescriptionInit) => {
    console.log(`[WebRTC] Handling offer from ${peerId}`);
    const pc = createPeerConnection(peerId);
    
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      // Add any pending ICE candidates
      const pending = pendingCandidates.current.get(peerId) || [];
      for (const candidate of pending) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
      pendingCandidates.current.delete(peerId);
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      sendSignalingMessage({
        type: 'answer',
        answer,
        to: peerId,
        from: userId,
        sessionId,
      });
    } catch (error) {
      console.error('[WebRTC] Error handling offer:', error);
    }
  }, [createPeerConnection, userId, sessionId, sendSignalingMessage]);

  // Handle received answer
  const handleAnswer = useCallback(async (peerId: string, answer: RTCSessionDescriptionInit) => {
    console.log(`[WebRTC] Handling answer from ${peerId}`);
    const pc = peerConnections.current.get(peerId);
    if (pc && pc.signalingState === 'have-local-offer') {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        
        // Add any pending ICE candidates
        const pending = pendingCandidates.current.get(peerId) || [];
        for (const candidate of pending) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
        pendingCandidates.current.delete(peerId);
      } catch (error) {
        console.error('[WebRTC] Error handling answer:', error);
      }
    }
  }, []);

  // Handle ICE candidate
  const handleIceCandidate = useCallback(async (peerId: string, candidate: RTCIceCandidateInit) => {
    const pc = peerConnections.current.get(peerId);
    if (pc && pc.remoteDescription) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('[WebRTC] Error adding ICE candidate:', error);
      }
    } else {
      // Queue candidate until remote description is set
      const pending = pendingCandidates.current.get(peerId) || [];
      pending.push(candidate);
      pendingCandidates.current.set(peerId, pending);
    }
  }, []);

  // Initialize signaling channel subscription
  useEffect(() => {
    if (!sessionId || !userId) return;

    console.log(`[WebRTC] Setting up signaling channel for session ${sessionId}`);
    
    const channel = supabase.channel(`webrtc:${sessionId}`)
      .on('broadcast', { event: 'signaling' }, async ({ payload }) => {
        const message = payload as SignalingMessage;
        
        // Only process messages intended for us
        if (message.to !== userId && message.to !== 'all') return;
        // Don't process our own messages
        if (message.from === userId) return;
        
        console.log(`[WebRTC] Received ${message.type} from ${message.from}`);
        
        switch (message.type) {
          case 'offer':
            if (message.offer) {
              await handleOffer(message.from, message.offer);
            }
            break;
          case 'answer':
            if (message.answer) {
              await handleAnswer(message.from, message.answer);
            }
            break;
          case 'ice-candidate':
            if (message.candidate) {
              await handleIceCandidate(message.from, message.candidate);
            }
            break;
          case 'screen-share-start':
            toast.info(`${message.from.slice(-4)} started screen sharing`);
            break;
          case 'screen-share-stop':
            toast.info(`${message.from.slice(-4)} stopped screen sharing`);
            break;
        }
      })
      .subscribe((status) => {
        console.log(`[WebRTC] Signaling channel status: ${status}`);
      });

    signalingChannel.current = channel;

    return () => {
      console.log('[WebRTC] Cleaning up signaling channel');
      supabase.removeChannel(channel);
      signalingChannel.current = null;
    };
  }, [sessionId, userId, handleOffer, handleAnswer, handleIceCandidate]);

  // Initialize local media stream
  const startLocalStream = useCallback(async (options: { audio: boolean; video: boolean }) => {
    try {
      console.log('[WebRTC] Starting local stream with options:', options);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: options.audio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } : false,
        video: options.video ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        } : false,
      });
      
      setLocalStream(stream);
      setIsAudioEnabled(options.audio);
      setIsVideoEnabled(options.video);
      
      // Add tracks to existing peer connections
      peerConnections.current.forEach((pc, peerId) => {
        stream.getTracks().forEach(track => {
          const senders = pc.getSenders();
          const existingSender = senders.find(s => s.track?.kind === track.kind);
          if (existingSender) {
            existingSender.replaceTrack(track);
          } else {
            pc.addTrack(track, stream);
          }
        });
      });
      
      return stream;
    } catch (error) {
      console.error('[WebRTC] Failed to access camera/microphone:', error);
      toast.error('Failed to access camera/microphone. Please check permissions.');
      throw error;
    }
  }, []);

  // Stop local stream
  const stopLocalStream = useCallback(() => {
    console.log('[WebRTC] Stopping local stream');
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
        console.log(`[WebRTC] Audio ${audioTrack.enabled ? 'enabled' : 'disabled'}`);
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
        console.log(`[WebRTC] Video ${videoTrack.enabled ? 'enabled' : 'disabled'}`);
      }
    }
  }, [localStream]);

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      console.log('[WebRTC] Starting screen share');
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true,
        audio: false 
      });
      
      setScreenStream(stream);
      const screenTrack = stream.getVideoTracks()[0];
      
      // Replace video track in all peer connections
      peerConnections.current.forEach((pc, peerId) => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          console.log(`[WebRTC] Replacing video track with screen share for ${peerId}`);
          sender.replaceTrack(screenTrack);
        } else {
          // Add screen track if no video sender exists
          pc.addTrack(screenTrack, stream);
        }
      });

      // Notify peers about screen share
      sendSignalingMessage({
        type: 'screen-share-start',
        to: 'all',
        from: userId,
        sessionId,
      });

      screenTrack.onended = () => {
        console.log('[WebRTC] Screen share ended by user');
        stopScreenShare();
      };

      setIsScreenSharing(true);
      toast.success('Screen sharing started');
      return stream;
    } catch (error) {
      console.error('[WebRTC] Failed to start screen sharing:', error);
      toast.error('Failed to start screen sharing');
      throw error;
    }
  }, [userId, sessionId, sendSignalingMessage]);

  // Stop screen sharing
  const stopScreenShare = useCallback(async () => {
    console.log('[WebRTC] Stopping screen share');
    
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }

    // Restore camera video track if available
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        peerConnections.current.forEach((pc, peerId) => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            console.log(`[WebRTC] Restoring camera track for ${peerId}`);
            sender.replaceTrack(videoTrack);
          }
        });
      }
    }

    // Notify peers about screen share stop
    sendSignalingMessage({
      type: 'screen-share-stop',
      to: 'all',
      from: userId,
      sessionId,
    });

    setIsScreenSharing(false);
    toast.success('Screen sharing stopped');
  }, [localStream, screenStream, userId, sessionId, sendSignalingMessage]);

  // Create and send offer to a specific peer
  const createOffer = useCallback(async (peerId: string) => {
    console.log(`[WebRTC] Creating offer for ${peerId}`);
    const pc = createPeerConnection(peerId);
    
    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pc.setLocalDescription(offer);
      
      sendSignalingMessage({
        type: 'offer',
        offer,
        to: peerId,
        from: userId,
        sessionId,
      });
    } catch (error) {
      console.error('[WebRTC] Error creating offer:', error);
    }
  }, [createPeerConnection, userId, sessionId, sendSignalingMessage]);

  // Connect to all peers in the session
  const connectToPeers = useCallback(async (peerIds: string[]) => {
    console.log(`[WebRTC] Connecting to peers:`, peerIds);
    for (const peerId of peerIds) {
      if (peerId !== userId && !peerConnections.current.has(peerId)) {
        await createOffer(peerId);
      }
    }
  }, [userId, createOffer]);

  // Cleanup
  useEffect(() => {
    return () => {
      console.log('[WebRTC] Cleaning up all connections');
      stopLocalStream();
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
      peerConnections.current.forEach(pc => pc.close());
      peerConnections.current.clear();
      pendingCandidates.current.clear();
    };
  }, []);

  return {
    localStream,
    screenStream,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    connectedPeers,
    startLocalStream,
    stopLocalStream,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    createOffer,
    connectToPeers,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
  };
};
