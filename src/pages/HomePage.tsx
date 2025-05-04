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
import { initializeConnection, getLocalPeerId } from '../utils/webrtc';
import { generateKeyPair } from '../utils/crypto';
import { Send, RefreshCw } from 'lucide-react';

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
  const [connectionTime, setConnectionTime] = useState<number | undefined>(undefined);

  useEffect(() => {
    const initConnection = async () => {
      if (username) {
        // Initialize P2P connection with username
        const peerId = initializeConnection(username);
        setConnectionId(peerId);
        
        // Generate keypair for encryption
        const keyPair = await generateKeyPair();
        setPublicKey(keyPair.publicKey);
      }
    };
    
    if (username) {
      initConnection();
    }
  }, [username]);
  
  useEffect(() => {
    if (selectedPeer) {
      setConnectionTime(Date.now());
    } else {
      setConnectionTime(undefined);
    }
  }, [selectedPeer]);

  const handleFileSelected = (fileInfo: FileInfo) => {
    setSelectedFile(fileInfo);
    resetTransfer();
  };

  const handlePeerSelected = (peer: Peer) => {
    setSelectedPeer(peer);
    resetTransfer();
  };

  const handleTransferClick = () => {
    startTransfer();
  };

  if (!username) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4 text-gray-200">Secure File Transfer</h2>
            
            <div className="space-y-6">
              {!selectedFile && (
                <div className="transition-all duration-300">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Step 1: Select a file to transfer</label>
                  <FileUploader onFileSelected={handleFileSelected} />
                </div>
              )}
              
              {selectedFile && !selectedPeer && (
                <div className="transition-all duration-300">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-300">Step 2: Connect to a peer</label>
                    <button 
                      onClick={() => setSelectedFile(null)} 
                      className="text-xs text-gray-400 hover:text-teal-400 transition-colors"
                    >
                      Change file
                    </button>
                  </div>
                  <PeerList onPeerSelected={handlePeerSelected} />
                </div>
              )}
              
              {selectedFile && selectedPeer && !transferStatus && (
                <div className="transition-all duration-300">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-300">Step 3: Start secure transfer</label>
                    <button 
                      onClick={() => setSelectedPeer(null)} 
                      className="text-xs text-gray-400 hover:text-teal-400 transition-colors"
                    >
                      Change peer
                    </button>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="bg-indigo-900 bg-opacity-50 rounded-full p-3">
                        <Send className="h-6 w-6 text-teal-400" />
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium text-gray-200">Ready to Transfer</h3>
                        <p className="text-sm text-gray-400 mt-1">
                          Your file will be encrypted and securely transferred to {selectedPeer.name || selectedPeer.id}
                        </p>
                        
                        <div className="mt-4 bg-gray-700 rounded-lg p-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">File:</span>
                            <span className="text-gray-300">{selectedFile.name}</span>
                          </div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Size:</span>
                            <span className="text-gray-300">{(selectedFile.size / 1024).toFixed(2)} KB</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Recipient:</span>
                            <span className="text-gray-300">{selectedPeer.name || selectedPeer.id}</span>
                          </div>
                        </div>
                        
                        <button
                          onClick={handleTransferClick}
                          className="mt-4 w-full py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 rounded-md transition-colors flex items-center justify-center"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Start Secure Transfer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {transferStatus && (
                <div className="transition-all duration-300">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-300">Transfer Status</label>
                    {(transferStatus.status === 'complete' || transferStatus.status === 'failed') && (
                      <button 
                        onClick={resetTransfer} 
                        className="text-xs text-gray-400 hover:text-teal-400 transition-colors flex items-center"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Start New Transfer
                      </button>
                    )}
                  </div>
                  
                  {selectedFile && (
                    <TransferStatus 
                      transfer={transferStatus}
                      fileName={selectedFile.name}
                      fileSize={selectedFile.size}
                    />
                  )}
                </div>
              )}
            </div>
            
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4 text-gray-200">Recent Transfers</h2>
              <TransferHistory />
            </div>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-4 text-gray-200">Network Info</h2>
            
            <ConnectionInfo 
              connectionId={connectionId}
              publicKey={publicKey}
              connectedPeer={selectedPeer?.name || selectedPeer?.id}
              connectionTime={connectionTime}
            />
            
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-gray-300 font-medium mb-3">How It Works</h3>
              
              <div className="space-y-3 text-sm text-gray-400">
                <p className="flex items-start">
                  <span className="inline-block h-5 w-5 rounded-full bg-indigo-900 text-indigo-300 flex items-center justify-center text-xs mr-2 flex-shrink-0">1</span>
                  Files are encrypted with AES-256 before leaving your device
                </p>
                <p className="flex items-start">
                  <span className="inline-block h-5 w-5 rounded-full bg-indigo-900 text-indigo-300 flex items-center justify-center text-xs mr-2 flex-shrink-0">2</span>
                  Direct peer-to-peer transfer with no central server
                </p>
                <p className="flex items-start">
                  <span className="inline-block h-5 w-5 rounded-full bg-indigo-900 text-indigo-300 flex items-center justify-center text-xs mr-2 flex-shrink-0">3</span>
                  Each transfer is verified and logged on the blockchain
                </p>
                <p className="flex items-start">
                  <span className="inline-block h-5 w-5 rounded-full bg-indigo-900 text-indigo-300 flex items-center justify-center text-xs mr-2 flex-shrink-0">4</span>
                  File integrity is verified using cryptographic hashes
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;