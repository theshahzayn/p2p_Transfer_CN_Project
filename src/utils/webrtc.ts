let localConnection: RTCPeerConnection;
let dataChannel: RTCDataChannel;

let onReceiveFile: (blob: Blob, name?: string, type?: string) => void = () => {};

export function setFileReceiver(callback: typeof onReceiveFile) {
  onReceiveFile = callback;
}

export async function createConnection(
  isInitiator: boolean,
  sendSignal: (data: any) => void,
  handleSignal: (cb: (data: any) => void) => void
): Promise<void> {
  const config = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

  localConnection = new RTCPeerConnection(config);

  // ✅ Handle incoming signals immediately
  const iceQueue: any[] = [];
  let remoteSet = false;

  handleSignal(async (data: any) => {
    if (data.offer) {
      await localConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
      remoteSet = true;

      const answer = await localConnection.createAnswer();
      await localConnection.setLocalDescription(answer);
      sendSignal({ answer });

      for (const c of iceQueue) {
        await localConnection.addIceCandidate(new RTCIceCandidate(c));
      }
    } else if (data.answer) {
      await localConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
      remoteSet = true;

      for (const c of iceQueue) {
        await localConnection.addIceCandidate(new RTCIceCandidate(c));
      }
    } else if (data.candidate) {
      if (remoteSet) {
        await localConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
      } else {
        iceQueue.push(data.candidate);
      }
    }
  });

  localConnection.onicecandidate = (e) => {
    if (e.candidate) sendSignal({ candidate: e.candidate });
  };

  let channelReady: Promise<void>;

  if (isInitiator) {
    dataChannel = localConnection.createDataChannel('fileChannel');

    channelReady = new Promise((resolve) => {
      dataChannel.onopen = () => {
        console.log('[WebRTC] DataChannel open (initiator)');
        setupDataChannel();
        resolve();
      };
    });

    const offer = await localConnection.createOffer();
    await localConnection.setLocalDescription(offer);
    sendSignal({ offer });

  } else {
    channelReady = new Promise((resolve) => {
      localConnection.ondatachannel = (event) => {
        dataChannel = event.channel;
        dataChannel.onopen = () => {
          console.log('[WebRTC] DataChannel open (receiver)');
          setupDataChannel();
          resolve();
        };
      };
    });
  }

  await channelReady;
}

function setupDataChannel() {
  let receivedChunks: Uint8Array[] = [];
  let fileName = 'received_file';
  let fileType = 'application/octet-stream';

  dataChannel.onmessage = (event) => {
    if (typeof event.data === 'string') {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.meta) {
          fileName = parsed.meta.name;
          fileType = parsed.meta.type;
          return;
        }
      } catch {
        if (event.data === 'EOF') {
          const blob = new Blob(receivedChunks, { type: fileType });
          onReceiveFile(blob, fileName, fileType);
          receivedChunks = []; // ✅ Reset safely
        }
      }
    } else {
      receivedChunks.push(new Uint8Array(event.data));
    }
  };

  dataChannel.onerror = (e) => {
    console.error('[WebRTC] DataChannel error:', e);
  };
}

export async function sendFile(file: File) {
  if (!dataChannel || dataChannel.readyState !== 'open') {
    throw new Error('DataChannel is not open');
  }

  const metadata = {
    name: file.name,
    type: file.type,
    size: file.size
  };

  dataChannel.send(JSON.stringify({ meta: metadata }));

  const chunkSize = 16 * 1024;
  const arrayBuffer = await file.arrayBuffer();
  let offset = 0;

  while (offset < arrayBuffer.byteLength) {
    const chunk = arrayBuffer.slice(offset, offset + chunkSize);
    dataChannel.send(chunk);
    offset += chunkSize;
    await new Promise((r) => setTimeout(r, 10)); // slight throttle
  }

  dataChannel.send('EOF');
}
