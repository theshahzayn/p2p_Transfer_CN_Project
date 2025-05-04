// File: src/utils/webrtc.ts
let localConnection: RTCPeerConnection;
let dataChannel: RTCDataChannel;
let remoteConnection: RTCPeerConnection;

let onReceiveFile: (blob: Blob) => void = () => {};

export function setFileReceiver(callback: (blob: Blob) => void) {
  onReceiveFile = callback;
}

export async function createConnection(
  isInitiator: boolean,
  sendSignal: (data: any) => void,
  handleSignal: (data: any) => void
) {
  const config = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

  localConnection = new RTCPeerConnection(config);

  localConnection.onicecandidate = (e) => {
    if (e.candidate) sendSignal({ candidate: e.candidate });
  };

  if (isInitiator) {
    dataChannel = localConnection.createDataChannel('fileChannel');
    setupDataChannel();

    const offer = await localConnection.createOffer();
    await localConnection.setLocalDescription(offer);
    sendSignal({ offer });
  } else {
    localConnection.ondatachannel = (event) => {
      dataChannel = event.channel;
      setupDataChannel();
    };
  }

  handleSignal(async (data: any) => {
    if (data.offer) {
      await localConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await localConnection.createAnswer();
      await localConnection.setLocalDescription(answer);
      sendSignal({ answer });
    } else if (data.answer) {
      await localConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    } else if (data.candidate) {
      await localConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  });
}

function setupDataChannel() {
  const receivedChunks: Uint8Array[] = [];

  dataChannel.onmessage = (event) => {
    if (event.data === 'EOF') {
      const blob = new Blob(receivedChunks);
      onReceiveFile(blob);
      receivedChunks.length = 0;
    } else {
      receivedChunks.push(new Uint8Array(event.data));
    }
  };
}

export async function sendFile(file: File) {
  const chunkSize = 16384;
  const arrayBuffer = await file.arrayBuffer();
  let offset = 0;

  while (offset < arrayBuffer.byteLength) {
    const chunk = arrayBuffer.slice(offset, offset + chunkSize);
    dataChannel.send(chunk);
    offset += chunkSize;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  dataChannel.send('EOF');
}
