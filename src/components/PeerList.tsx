import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, RefreshCw } from 'lucide-react';
import { Peer } from '../types';
import { getAvailablePeers, connectToPeer } from '../utils/webrtc';

interface PeerListProps {
  onPeerSelected: (peer: Peer) => void;
  selectedPeerId?: string;
}

const PeerList: React.FC<PeerListProps> = ({ onPeerSelected, selectedPeerId }) => {
  const [peers, setPeers] = useState<Peer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingPeerId, setConnectingPeerId] = useState<string | null>(null);

  useEffect(() => {
    loadPeers();
  }, []);

  const loadPeers = async () => {
    setIsLoading(true);
    try {
      const availablePeers = await getAvailablePeers();
      setPeers(availablePeers);
    } catch (error) {
      console.error('Failed to load peers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (peer: Peer) => {
    if (peer.connected) {
      onPeerSelected(peer);
      return;
    }

    setIsConnecting(true);
    setConnectingPeerId(peer.id);

    try {
      const success = await connectToPeer(peer.id);
      
      if (success) {
        // Update the peer's connected status in the list
        setPeers(prev => 
          prev.map(p => 
            p.id === peer.id ? { ...p, connected: true } : p
          )
        );
        
        // Call the selection callback with the updated peer
        onPeerSelected({ ...peer, connected: true });
      }
    } catch (error) {
      console.error(`Failed to connect to peer ${peer.id}:`, error);
    } finally {
      setIsConnecting(false);
      setConnectingPeerId(null);
    }
  };

  return (
    <div className="rounded-lg bg-gray-800 overflow-hidden">
      <div className="px-4 py-3 bg-gray-900 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-teal-400" />
          <h3 className="text-gray-200 font-medium">Available Peers</h3>
        </div>
        <button 
          className="text-gray-400 hover:text-teal-400 transition-colors"
          onClick={loadPeers}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-teal-400' : ''}`} />
        </button>
      </div>
      
      <div className="divide-y divide-gray-700">
        {peers.length === 0 ? (
          <div className="py-6 text-center text-gray-400">
            <Users className="h-10 w-10 mx-auto opacity-20 mb-2" />
            <p className="text-sm">No peers available</p>
          </div>
        ) : (
          peers.map(peer => (
            <div 
              key={peer.id}
              className={`px-4 py-3 flex justify-between items-center transition-colors ${
                selectedPeerId === peer.id ? 'bg-gray-700' : 'hover:bg-gray-750'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-1.5 rounded-full ${peer.connected ? 'bg-green-500/20' : 'bg-gray-600/30'}`}>
                  {peer.connected ? (
                    <UserCheck className="h-5 w-5 text-green-400" />
                  ) : (
                    <UserX className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="text-gray-200 font-medium">{peer.name || peer.id}</p>
                  <p className="text-xs text-gray-400">
                    {peer.connected ? 'Connected' : 'Disconnected'}
                  </p>
                </div>
              </div>
              
              <button
                disabled={isConnecting && connectingPeerId === peer.id}
                onClick={() => handleConnect(peer)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  peer.connected
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    : isConnecting && connectingPeerId === peer.id
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30'
                }`}
              >
                {isConnecting && connectingPeerId === peer.id ? (
                  <span className="flex items-center">
                    <RefreshCw className="h-3 w-3 mr-1.5 animate-spin" />
                    Connecting...
                  </span>
                ) : peer.connected ? (
                  'Select'
                ) : (
                  'Connect'
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PeerList;