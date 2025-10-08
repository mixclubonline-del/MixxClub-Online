import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { 
      status: 400,
      headers: corsHeaders 
    });
  }

  try {
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    // Map to store peer connections
    const peers = new Map<string, WebSocket>();
    let userId: string = '';

    socket.onopen = () => {
      console.log("WebSocket connection opened");
      socket.send(JSON.stringify({
        type: 'connected',
        message: 'Audio stream WebSocket connected'
      }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'register':
            // Register this user's connection
            userId = data.userId;
            peers.set(userId, socket);
            console.log(`User ${userId} registered`);
            break;

          case 'audio-data':
            // Forward audio data to all other connected peers
            const audioBuffer = data.buffer;
            peers.forEach((peerSocket, peerId) => {
              if (peerId !== userId && peerSocket.readyState === WebSocket.OPEN) {
                peerSocket.send(JSON.stringify({
                  type: 'audio-data',
                  userId: userId,
                  buffer: audioBuffer,
                  timestamp: data.timestamp
                }));
              }
            });
            break;

          case 'start-streaming':
            // Notify other peers that this user started streaming
            peers.forEach((peerSocket, peerId) => {
              if (peerId !== userId && peerSocket.readyState === WebSocket.OPEN) {
                peerSocket.send(JSON.stringify({
                  type: 'peer-streaming',
                  userId: userId,
                  started: true
                }));
              }
            });
            break;

          case 'stop-streaming':
            // Notify other peers that this user stopped streaming
            peers.forEach((peerSocket, peerId) => {
              if (peerId !== userId && peerSocket.readyState === WebSocket.OPEN) {
                peerSocket.send(JSON.stringify({
                  type: 'peer-streaming',
                  userId: userId,
                  started: false
                }));
              }
            });
            break;

          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error processing message:', error);
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Failed to process message'
        }));
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log(`WebSocket connection closed for user ${userId}`);
      if (userId) {
        peers.delete(userId);
        
        // Notify other peers that this user disconnected
        peers.forEach((peerSocket) => {
          if (peerSocket.readyState === WebSocket.OPEN) {
            peerSocket.send(JSON.stringify({
              type: 'peer-disconnected',
              userId: userId
            }));
          }
        });
      }
    };

    return response;
  } catch (error) {
    console.error('WebSocket upgrade error:', error);
    return new Response('Failed to upgrade WebSocket connection', { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
