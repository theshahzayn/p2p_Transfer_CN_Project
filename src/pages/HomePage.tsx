import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FileUploader from '../components/FileUploader';
import PeerList from '../components/PeerList';
import TransferStatus from '../components/TransferStatus';
import ConnectionInfo from '../components/ConnectionInfo';
import TransferHistory from '../components/TransferHistory';
import { FileInfo, Peer } from '../types';
import { useTransfer } from '../contexts/TransferContext';
import { useUser } from '../contexts/UserContext';
import { generateKeyPair } from '../utils/crypto';
import { Send, RefreshCw } from 'lucide-react';
import { createConnection, setFileReceiver } from '../utils/webrtc';
import { sendSignal, onSignal, onPeerListUpdate } from '../utils/signaling';

const HomePage: React.FC = () => {
  const {
    selectedFile,
    selectedPeer,
    transferStatus,
    setSelectedFile,
    setSelectedPeer,
    startTransfer,
    resetTransfer
  } = useTransfer();

  const { username } = useUser();
  const [connectionId, setConnectionId] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [connectionTime, setConnectionTime] = useState<number>();
  const [availablePeers, setAvailablePeers] = useState<Peer[]>([]);

  const [receivedFileUrl, setReceivedFileUrl] = useState<string | null>(null);
  const [receivedFileName, setReceivedFileName] = useState<string>('received_file');

  useEffect(() => {
    if (username) {
      setConnectionId(username);
      generateKeyPair().then(keyPair => setPublicKey(keyPair.publicKey));
    }
  }, [username]);

  useEffect(() => {
    onPeerListUpdate((peers) => {
      setAvailablePeers(peers);
    });
  }, []);

  useEffect(() => {
    if (!selectedPeer) {
      setConnectionTime(undefined);
      return;
    }

    setConnectionTime(Date.now());

    setFileReceiver((blob, name, type) => {
      const url = URL.createObjectURL(blob);
      setReceivedFileUrl(url);
      setReceivedFileName(name || 'received_file');
    });

    createConnection(
      false,
      (signal) => sendSignal(selectedPeer.id, signal),
      (handle) => onSignal((from, signal) => {
        if (from === selectedPeer.id) handle(signal);
      })
    );
  }, [selectedPeer]);

  const handleFileSelected = (fileInfo: FileInfo) => {
    setSelectedFile(fileInfo);
    resetTransfer();
    setReceivedFileUrl(null);
  };

  const handlePeerSelected = (peer: Peer) => {
    setSelectedPeer(peer);
    resetTransfer();
    setReceivedFileUrl(null);
  };

  const handleTransferClick = () => {
    startTransfer();
  };

  if (!username) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4 text-gray-200">Secure File Transfer</h2>
            <div className="space-y-6">
              {!selectedFile && (
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Step 1: Select a file to transfer</label>
                  <FileUploader onFileSelected={handleFileSelected} />
                </div>
              )}

              {selectedFile && !selectedPeer && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm text-gray-300">Step 2: Connect to a peer</label>
                    <button onClick={() => setSelectedFile(null)} className="text-xs text-gray-400 hover:text-teal-400">
                      Change file
                    </button>
                  </div>
                  <PeerList
                    peers={availablePeers}
                    onPeerSelected={handlePeerSelected}
                  />
                </div>
              )}

              {selectedFile && selectedPeer && !transferStatus && (
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-200 mb-2">Ready to Transfer</h3>
                  <p className="text-sm text-gray-400">
                    Sending <strong>{selectedFile.name}</strong> to <strong>{selectedPeer.name || selectedPeer.id}</strong>
                  </p>
                  <button
                    onClick={handleTransferClick}
                    className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded flex justify-center items-center"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Start Secure Transfer
                  </button>
                </div>
              )}

              {transferStatus && (
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Transfer Status</label>
                  {selectedFile && (
                    <TransferStatus
                      transfer={transferStatus}
                      fileName={selectedFile.name}
                      fileSize={selectedFile.size}
                    />
                  )}
                  {(transferStatus.status === 'complete' || transferStatus.status === 'failed') && (
                    <button
                      onClick={resetTransfer}
                      className="mt-2 text-xs text-gray-400 hover:text-teal-400 flex items-center"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Start New Transfer
                    </button>
                  )}
                </div>
              )}

              {receivedFileUrl && (
                <div className="mt-4 p-4 bg-green-900 text-green-300 rounded">
                  <p>📥 File received: <strong>{receivedFileName}</strong></p>
                  <a
                    href={receivedFileUrl}
                    download={receivedFileName}
                    className="underline text-white hover:text-teal-400"
                  >
                    Click here to download
                  </a>
                </div>
              )}
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4 text-gray-200">Recent Transfers</h2>
              <TransferHistory />
            </div>
          </div>

          <div className="space-y-6">
            <ConnectionInfo
              connectionId={connectionId}
              publicKey={publicKey}
              connectedPeer={selectedPeer?.name || selectedPeer?.id}
              connectionTime={connectionTime}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
