import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { CollaborationUser } from "@/pages/HybridDAW";

interface CollaborationMessage {
  type: 'join' | 'leave' | 'cursor_move' | 'track_update' | 'effect_change' | 'chat_message' | 'recording_start' | 'recording_stop' | 'session_info' | 'playback_state' | 'timeline_seek';
  sessionId: string;
  userId: string;
  userName?: string;
  data?: any;
  timestamp: number;
}

interface UseCollaborationProps {
  sessionId: string;
  userId: string;
  userName: string;
  onMessage?: (message: CollaborationMessage) => void;
  onUserJoin?: (user: CollaborationUser) => void;
  onUserLeave?: (userId: string) => void;
  onCursorMove?: (userId: string, position: { x: number; y: number }) => void;
}

export const useCollaboration = ({
  sessionId,
  userId,
  userName,
  onMessage,
  onUserJoin,
  onUserLeave,
  onCursorMove
}: UseCollaborationProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<CollaborationUser[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const { toast } = useToast();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus('connecting');
    
    try {
      // Build WebSocket URL from environment variable
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
      const wsHost = supabaseUrl.replace('https://', 'wss://');
      const wsUrl = `${wsHost}/functions/v1/collaboration-websocket?sessionId=${sessionId}&userId=${userId}&userName=${encodeURIComponent(userName)}`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.debug('Connected to collaboration server');
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;
        
        toast({
          title: "Collaboration Connected",
          description: "You're now connected to the live session!",
        });
      };

      ws.onmessage = (event) => {
        try {
          const message: CollaborationMessage = JSON.parse(event.data);
          
          // Handle different message types
          switch (message.type) {
            case 'join':
              if (message.userId !== userId) {
                const newUser: CollaborationUser = {
                  id: message.userId,
                  name: message.userName || 'Anonymous',
                  status: 'online',
                  cursor: { x: 0, y: 0 }
                };
                setParticipants(prev => [...prev.filter(p => p.id !== message.userId), newUser]);
                onUserJoin?.(newUser);
                
                toast({
                  title: "User Joined",
                  description: `${message.userName} joined the session`,
                });
              }
              break;

            case 'leave':
              if (message.userId !== userId) {
                setParticipants(prev => prev.filter(p => p.id !== message.userId));
                onUserLeave?.(message.userId);
                
                toast({
                  title: "User Left",
                  description: `${message.userName} left the session`,
                });
              }
              break;

            case 'cursor_move':
              if (message.userId !== userId && message.data?.position) {
                setParticipants(prev => 
                  prev.map(p => 
                    p.id === message.userId 
                      ? { ...p, cursor: message.data.position }
                      : p
                  )
                );
                onCursorMove?.(message.userId, message.data.position);
              }
              break;

            case 'session_info':
              // Initial session info
              const sessionParticipants = message.data?.participants || [];
              const users: CollaborationUser[] = sessionParticipants
                .filter((id: string) => id !== userId)
                .map((id: string) => ({
                  id,
                  name: `User ${id.slice(-4)}`,
                  status: 'online' as const,
                  cursor: { x: 0, y: 0 }
                }));
              setParticipants(users);
              break;
          }

          onMessage?.(message);

        } catch (error) {
          console.error('Error parsing collaboration message:', error);
        }
      };

      ws.onclose = (event) => {
        console.debug('Disconnected from collaboration server', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        setParticipants([]);

        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else {
          setConnectionStatus('error');
          toast({
            title: "Connection Lost",
            description: "Unable to reconnect to collaboration server",
            variant: "destructive"
          });
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
        toast({
          title: "Connection Error",
          description: "Failed to connect to collaboration server",
          variant: "destructive"
        });
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('error');
      toast({
        title: "Connection Failed",
        description: "Could not establish collaboration connection",
        variant: "destructive"
      });
    }
  }, [sessionId, userId, userName, onMessage, onUserJoin, onUserLeave, onCursorMove, toast]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnect');
      wsRef.current = null;
    }

    setIsConnected(false);
    setConnectionStatus('disconnected');
    setParticipants([]);
    reconnectAttempts.current = 0;
  }, []);

  const sendMessage = useCallback((message: Omit<CollaborationMessage, 'userId' | 'userName' | 'timestamp'>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const fullMessage: CollaborationMessage = {
        ...message,
        userId,
        userName,
        timestamp: Date.now()
      };
      
      wsRef.current.send(JSON.stringify(fullMessage));
    }
  }, [userId, userName]);

  const sendCursorMove = useCallback((position: { x: number; y: number }) => {
    sendMessage({
      type: 'cursor_move',
      sessionId,
      data: { position }
    });
  }, [sendMessage, sessionId]);

  const sendTrackUpdate = useCallback((trackData: any) => {
    sendMessage({
      type: 'track_update',
      sessionId,
      data: trackData
    });
  }, [sendMessage, sessionId]);

  const sendEffectChange = useCallback((trackId: string, effectData: any) => {
    sendMessage({
      type: 'effect_change',
      sessionId,
      data: { trackId, ...effectData }
    });
  }, [sendMessage, sessionId]);

  const sendChatMessage = useCallback((message: string) => {
    sendMessage({
      type: 'chat_message',
      sessionId,
      data: { message }
    });
  }, [sendMessage, sessionId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    connectionStatus,
    participants,
    connect,
    disconnect,
    sendMessage,
    sendCursorMove,
    sendTrackUpdate,
    sendEffectChange,
    sendChatMessage
  };
};