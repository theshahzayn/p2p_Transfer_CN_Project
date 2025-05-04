import { Peer } from '../types';

// Store RTCPeerConnection instances
const peerConnections = new Map<string, RTCPeerConnection>();
const dataChannels = new Map<string, RTCDataChannel>();

let ws: WebSocket | null = null;
let localPeerId = `user_${Math.random().toString(36).substring(2, 9)}`;
let connectedPeers: Peer[] = [];

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export const initializeConnection = (username: string): string => {
  // Connect to signaling server
  ws = new WebSocket('ws://localhost:3000');

  ws.onopen = () => {
    // Register with the signaling server
    ws?.send(JSON.stringify({
      type: 'register',
      userId: localPeerId,
      username
    }));
  };

  ws.onmessage = handleSignalingMessage;

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket connection closed');
    // Attempt to reconnect after a delay
    setTimeout(() => {
      if (username) {
        initializeConnection(username);
      }
    }, 5000);
  };

  return localPeerId;
};

export const getLocalPeerId = (): string => {
  return localPeerId;
};

export const getAvailablePeers = async (): Promise<Peer[]> => {
  return [...connectedPeers];
};

const createPeerConnection = (peerId: string): RTCPeerConnection => {
  const peerConnection = new RTCPeerConnection(ICE_SERVERS);
  
  peerConnection.onicecandidate = (event) => {
    if (event.candidate && ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'ice-candidate',
        targetId: peerId,
        candidate: event.candidate
      }));
    }
  };

  peerConnection.ondatachannel = (event) => {
    const dataChannel = event.channel;
    setupDataChannel(dataChannel, peerId);
  };

  peerConnections.set(peerId, peerConnection);
  return peerConnection;
};

const setupDataChannel = (dataChannel: RTCDataChannel, peerId: string) => {
  let receivedBuffers: ArrayBuffer[] = [];
  let receivedSize = 0;
  let fileInfo: any = null;

  dataChannel.onopen = () => {
    console.log(`Data channel opened with peer ${peerId}`);
    const peerIndex = connectedPeers.findIndex(p => p.id === peerId);
    if (peerIndex !== -1) {
      connectedPeers[peerIndex].connected = true;
    }
  };

  dataChannel.onclose = () => {
    console.log(`Data channel closed with peer ${peerId}`);
    const peerIndex = connectedPeers.findIndex(p => p.id === peerId);
    if (peerIndex !== -1) {
      connectedPeers[peerIndex].connected = false;
    }
  };

  dataChannel.onmessage = async (event) => {
    const data = event.data;

    if (typeof data === 'string') {
      const message = JSON.parse(data);
      
      if (message.type === 'file-info') {
        fileInfo = message;
        receivedBuffers = [];
        receivedSize = 0;
      } else if (message.type === 'file-complete') {
        const blob = new Blob(receivedBuffers, { type: fileInfo.mimeType });
        
        // Create download URL
        const url = URL.createObjectURL(blob);
        
        // Trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = fileInfo.name;
        a.click();
        
        // Cleanup
        URL.revokeObjectURL(url);
        receivedBuffers = [];
        receivedSize = 0;
        fileInfo = null;
      }
    } else {
      receivedBuffers.push(data);
      receivedSize += data.byteLength;
      
      if (fileInfo) {
        const progress = (receivedSize / fileInfo.size) * 100;
        // Update progress through callback
        if (dataChannel.onprogress) {
          dataChannel.onprogress(progress);
        }
      }
    }
  };

  dataChannels.set(peerId, dataChannel);
};

export const connectToPeer = async (peerId: string): Promise<boolean> => {
  try {
    const peerConnection = createPeerConnection(peerId);
    
    // Create data channel
    const dataChannel = peerConnection.createDataChannel('fileTransfer');
    setupDataChannel(dataChannel, peerId);
    
    // Create and send offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'offer',
        targetId: peerId,
        offer
      }));
    }
    
    return true;
  } catch (error) {
    console.error('Failed to connect to peer:', error);
    return false;
  }
};

const CHUNK_SIZE = 16384; // 16KB chunks

export const sendFileToPeer = async (
  peerId: string,
  file: Blob,
  onProgress: (progress: number) => void
): Promise<boolean> => {
  const dataChannel = dataChannels.get(peerId);
  
  if (!dataChannel || dataChannel.readyState !== 'open') {
    throw new Error('No open data channel available');
  }

  try {
    // Send file info first
    const fileInfo = {
      type: 'file-info',
      name: file.name,
      size: file.size,
      mimeType: file.type
    };
    dataChannel.send(JSON.stringify(fileInfo));
    
    // Read and send file in chunks
    const chunks = Math.ceil(file.size / CHUNK_SIZE);
    for (let i = 0; i < chunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = await file.slice(start, end).arrayBuffer();
      
      // Wait for buffer to drain if needed
      if (dataChannel.bufferedAmount > 1024 * 1024) {
        await new Promise(resolve => {
          const interval = setInterval(() => {
            if (dataChannel.bufferedAmount <= 1024 * 1024) {
              clearInterval(interval);
              resolve(true);
            }
          }, 100);
        });
      }
      
      dataChannel.send(chunk);
      onProgress((i + 1) / chunks * 100);
    }
    
    // Signal completion
    dataChannel.send(JSON.stringify({ type: 'file-complete' }));
    return true;
  } catch (error) {
    console.error('Error sending file:', error);
    return false;
  }
};

const handleSignalingMessage = async (event: MessageEvent) => {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case 'peer-list':
      connectedPeers = message.peers;
      break;
      
    case 'peer-joined':
      if (message.peer.id !== localPeerId) {
        connectedPeers.push(message.peer);
      }
      break;
      
    case 'peer-left':
      connectedPeers = connectedPeers.filter(peer => peer.id !== message.peerId);
      break;
      
    case 'offer': {
      const peerConnection = createPeerConnection(message.sourceId);
      await peerConnection.setRemoteDescription(message.offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'answer',
          targetId: message.sourceId,
          answer
        }));
      }
      break;
    }
    
    case 'answer': {
      const peerConnection = peerConnections.get(message.sourceId);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(message.answer);
      }
      break;
    }
    
    case 'ice-candidate': {
      const peerConnection = peerConnections.get(message.sourceId);
      if (peerConnection) {
        await peerConnection.addIceCandidate(message.candidate);
      }
      break;
    }
  }
};