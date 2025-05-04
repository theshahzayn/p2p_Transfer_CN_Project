import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const server = createServer();
const wss = new WebSocketServer({ server });

// Store connected clients
const clients = new Map();

wss.on('connection', (ws) => {
  let userId = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());

      switch (data.type) {
        case 'register':
          userId = data.userId;
          clients.set(userId, {
            ws,
            username: data.username
          });

          // Send the current peer list to the new user
          const peers = Array.from(clients.entries())
            .filter(([id]) => id !== userId)
            .map(([id, client]) => ({
              id,
              name: client.username,
              connected: false
            }));

          ws.send(JSON.stringify({
            type: 'peer-list',
            peers
          }));

          // Broadcast new user to others
          broadcastToOthers(userId, {
            type: 'peer-joined',
            peer: {
              id: userId,
              name: data.username,
              connected: false
            }
          });
          break;

        case 'offer':
        case 'answer':
        case 'ice-candidate':
          const targetClient = clients.get(data.targetId);
          if (targetClient) {
            targetClient.ws.send(JSON.stringify({
              ...data,
              sourceId: userId
            }));
          }
          break;
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  ws.on('close', () => {
    if (userId) {
      clients.delete(userId);
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
  console.log(`Signaling server running on port ${PORT}`);
});