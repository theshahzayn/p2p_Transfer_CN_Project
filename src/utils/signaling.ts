import ReconnectingWebSocket from 'reconnecting-websocket';
import { Peer } from '../types';

const socket = new ReconnectingWebSocket('ws://localhost:3000');
let username: string;

export function register(user: string) {
  username = user;
  socket.send(JSON.stringify({ type: 'register', username }));
}

export function sendSignal(to: string, signal: any) {
  socket.send(JSON.stringify({ type: 'signal', from: username, to, signal }));
}

export function onSignal(callback: (from: string, signal: any) => void) {
  socket.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'signal' && data.from && data.signal) {
        callback(data.from, data.signal);
      }
    } catch (err) {
      console.error('[Signaling] Invalid signal:', err);
    }
  });
}

export function onPeerListUpdate(callback: (peers: Peer[]) => void) {
  socket.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'peers') {
        const peers = (data.peers as Peer[]).filter((p) => p.id !== username);
        console.log('[Signaling] Updated peer list:', peers);
        callback(peers);
      }
    } catch (err) {
      console.error('[Signaling] Failed to parse peer list:', err);
    }
  });
}
