import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CollaborationMessage {
  type: 'join' | 'leave' | 'cursor_move' | 'track_update' | 'effect_change' | 'chat_message' | 'recording_start' | 'recording_stop';
  sessionId: string;
  userId: string;
  userName?: string;
  data?: any;
  timestamp: number;
}

// Store active connections
const connections = new Map<string, WebSocket>();
const sessions = new Map<string, Set<string>>();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const upgradeHeader = req.headers.get('upgrade');
  if (upgradeHeader !== 'websocket') {
    return new Response('Expected WebSocket connection', { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  const url = new URL(req.url);
  const sessionId = url.searchParams.get('sessionId') || 'default';
  const userId = url.searchParams.get('userId') || `user_${Date.now()}`;
  const userName = url.searchParams.get('userName') || 'Anonymous';

  const connectionId = `${sessionId}_${userId}`;

  socket.onopen = () => {
    console.log(`User ${userId} joined session ${sessionId}`);
    
    // Store connection
    connections.set(connectionId, socket);
    
    // Add to session
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, new Set());
    }
    sessions.get(sessionId)!.add(userId);

    // Notify other users in session
    broadcastToSession(sessionId, {
      type: 'join',
      sessionId,
      userId,
      userName,
      data: { message: `${userName} joined the session` },
      timestamp: Date.now()
    }, userId);

    // Send session info to new user
    socket.send(JSON.stringify({
      type: 'session_info',
      sessionId,
      participants: Array.from(sessions.get(sessionId) || []),
      timestamp: Date.now()
    }));
  };

  socket.onmessage = (event) => {
    try {
      const message: CollaborationMessage = JSON.parse(event.data);
      
      console.log(`Received message from ${userId}:`, message.type);
      
      // Validate message
      if (!message.type || !message.sessionId) {
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format',
          timestamp: Date.now()
        }));
        return;
      }

      // Add timestamp and user info
      message.userId = userId;
      message.userName = userName;
      message.timestamp = Date.now();

      // Handle different message types
      switch (message.type) {
        case 'cursor_move':
          // Broadcast cursor position to other users
          broadcastToSession(sessionId, message, userId);
          break;

        case 'track_update':
          // Broadcast track changes (add, delete, modify)
          broadcastToSession(sessionId, message, userId);
          break;

        case 'effect_change':
          // Broadcast effect parameter changes
          broadcastToSession(sessionId, message, userId);
          break;

        case 'chat_message':
          // Broadcast chat messages
          broadcastToSession(sessionId, message);
          break;

        case 'recording_start':
        case 'recording_stop':
          // Broadcast recording state changes
          broadcastToSession(sessionId, message, userId);
          break;

        default:
          console.log(`Unknown message type: ${message.type}`);
      }

    } catch (error) {
      console.error('Error processing message:', error);
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Failed to process message',
        timestamp: Date.now()
      }));
    }
  };

  socket.onclose = () => {
    console.log(`User ${userId} left session ${sessionId}`);
    
    // Remove connection
    connections.delete(connectionId);
    
    // Remove from session
    const session = sessions.get(sessionId);
    if (session) {
      session.delete(userId);
      if (session.size === 0) {
        sessions.delete(sessionId);
      }
    }

    // Notify other users
    broadcastToSession(sessionId, {
      type: 'leave',
      sessionId,
      userId,
      userName,
      data: { message: `${userName} left the session` },
      timestamp: Date.now()
    });
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  return response;
});

function broadcastToSession(sessionId: string, message: CollaborationMessage, excludeUserId?: string) {
  const session = sessions.get(sessionId);
  if (!session) return;

  const messageStr = JSON.stringify(message);
  
  session.forEach(userId => {
    if (excludeUserId && userId === excludeUserId) return;
    
    const connectionId = `${sessionId}_${userId}`;
    const socket = connections.get(connectionId);
    
    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(messageStr);
      } catch (error) {
        console.error(`Failed to send message to ${userId}:`, error);
        // Remove failed connection
        connections.delete(connectionId);
        session.delete(userId);
      }
    }
  });
}