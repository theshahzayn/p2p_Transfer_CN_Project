import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const server = createServer();
const wss = new WebSocketServer({ server });

const clients = new Map();

wss.on('connection', (ws) => {
  let userId = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('[Server] Received:', data);

      switch (data.type) {
        case 'register':
          userId = data.username; // ✅ use username as unique ID
          clients.set(userId, { ws, username: data.username });
          console.log(`[Server] Registered user: ${userId}`);

          // Send peer list to the new user
          const peers = Array.from(clients.entries())
            .filter(([id]) => id !== userId)
            .map(([id, client]) => ({
              id,
              name: client.username,
              connected: false
            }));

          ws.send(JSON.stringify({ type: 'peers', peers }));

          // Notify all other users
          broadcastToOthers(userId, {
            type: 'peer-joined',
            peer: { id: userId, name: data.username, connected: false }
          });
          break;

        case 'signal':
          const target = clients.get(data.to);
          if (target) {
            console.log(`[Server] Relaying signal from ${data.from} to ${data.to}`);
            target.ws.send(JSON.stringify({
              type: 'signal',
              from: data.from,
              signal: data.signal
            }));
          }
          break;

        default:
          console.warn('[Server] Unknown message type:', data.type);
      }
    } catch (err) {
      console.error('[Server] Failed to parse message:', err);
    }
  });

  ws.on('close', () => {
    if (userId) {
      clients.delete(userId);
      console.log(`[Server] Disconnected: ${userId}`);
      broadcastToOthers(userId, {
        type: 'peer-left',
        peerId: userId
      });
    }
  });
});

function broadcastToOthers(senderId, message) {
  for (const [id, client] of clients.entries()) {
    if (id !== senderId) {
      client.ws.send(JSON.stringify(message));
    }
  }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Signaling server running on port ${PORT}`);
});
