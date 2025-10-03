import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StudioMessage {
  type: 'join' | 'leave' | 'cursor_move' | 'playback_sync' | 'comment_add' | 'file_update' | 'version_save' | 'chat_message';
  sessionId: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  data?: any;
  timestamp: number;
}

// Store active connections per session
const sessions = new Map<string, Map<string, WebSocket>>();
const sessionStates = new Map<string, {
  playbackPosition: number;
  isPlaying: boolean;
  activeUsers: Set<string>;
}>();

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
  const userAvatar = url.searchParams.get('userAvatar') || '';

  socket.onopen = () => {
    console.log(`User ${userId} (${userName}) joined session ${sessionId}`);
    
    // Initialize session if it doesn't exist
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, new Map());
      sessionStates.set(sessionId, {
        playbackPosition: 0,
        isPlaying: false,
        activeUsers: new Set()
      });
    }
    
    const sessionConnections = sessions.get(sessionId)!;
    const sessionState = sessionStates.get(sessionId)!;
    
    // Store connection
    sessionConnections.set(userId, socket);
    sessionState.activeUsers.add(userId);

    // Notify others about new user
    broadcastToSession(sessionId, {
      type: 'join',
      sessionId,
      userId,
      userName,
      userAvatar,
      data: { 
        message: `${userName} joined the session`,
        activeUsers: Array.from(sessionState.activeUsers)
      },
      timestamp: Date.now()
    }, userId);

    // Send current session state to new user
    socket.send(JSON.stringify({
      type: 'session_state',
      sessionId,
      userId,
      data: {
        playbackPosition: sessionState.playbackPosition,
        isPlaying: sessionState.isPlaying,
        activeUsers: Array.from(sessionState.activeUsers),
        participants: Array.from(sessionConnections.keys())
      },
      timestamp: Date.now()
    }));
  };

  socket.onmessage = (event) => {
    try {
      const message: StudioMessage = JSON.parse(event.data);
      const sessionState = sessionStates.get(sessionId);
      
      if (!sessionState) {
        console.error(`Session ${sessionId} not found`);
        return;
      }

      console.log(`Received ${message.type} from ${userId} in session ${sessionId}`);

      // Add user info and timestamp
      message.userId = userId;
      message.userName = userName;
      message.userAvatar = userAvatar;
      message.timestamp = Date.now();

      switch (message.type) {
        case 'cursor_move':
          // Broadcast cursor position (throttled on client side)
          broadcastToSession(sessionId, message, userId);
          break;

        case 'playback_sync':
          // Update session playback state
          if (message.data?.position !== undefined) {
            sessionState.playbackPosition = message.data.position;
          }
          if (message.data?.isPlaying !== undefined) {
            sessionState.isPlaying = message.data.isPlaying;
          }
          // Broadcast to all participants
          broadcastToSession(sessionId, message);
          break;

        case 'comment_add':
          // Broadcast new comment to all
          broadcastToSession(sessionId, message);
          break;

        case 'file_update':
          // Broadcast file changes
          broadcastToSession(sessionId, message);
          break;

        case 'version_save':
          // Notify all about version save
          broadcastToSession(sessionId, message);
          break;

        case 'chat_message':
          // Broadcast chat message
          broadcastToSession(sessionId, message);
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
    
    const sessionConnections = sessions.get(sessionId);
    const sessionState = sessionStates.get(sessionId);
    
    if (sessionConnections && sessionState) {
      // Remove connection
      sessionConnections.delete(userId);
      sessionState.activeUsers.delete(userId);
      
      // Clean up empty sessions
      if (sessionConnections.size === 0) {
        sessions.delete(sessionId);
        sessionStates.delete(sessionId);
        console.log(`Session ${sessionId} cleaned up (no active users)`);
      } else {
        // Notify remaining users
        broadcastToSession(sessionId, {
          type: 'leave',
          sessionId,
          userId,
          userName,
          data: { 
            message: `${userName} left the session`,
            activeUsers: Array.from(sessionState.activeUsers)
          },
          timestamp: Date.now()
        });
      }
    }
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  return response;
});

function broadcastToSession(sessionId: string, message: StudioMessage, excludeUserId?: string) {
  const sessionConnections = sessions.get(sessionId);
  if (!sessionConnections) return;

  const messageStr = JSON.stringify(message);
  
  sessionConnections.forEach((socket, userId) => {
    if (excludeUserId && userId === excludeUserId) return;
    
    if (socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(messageStr);
      } catch (error) {
        console.error(`Failed to send message to ${userId}:`, error);
        // Remove failed connection
        sessionConnections.delete(userId);
        const sessionState = sessionStates.get(sessionId);
        if (sessionState) {
          sessionState.activeUsers.delete(userId);
        }
      }
    }
  });
}