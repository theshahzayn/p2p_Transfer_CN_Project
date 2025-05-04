import React, { useEffect, useState } from 'react';
import { Peer } from '../types';
import { onPeerListUpdate } from '../utils/signaling';

interface PeerListProps {
  onPeerSelected: (peer: Peer) => void;
  selectedPeerId?: string;
}

const PeerList: React.FC<PeerListProps> = ({ onPeerSelected, selectedPeerId }) => {
  const [peers, setPeers] = useState<Peer[]>([]);

  useEffect(() => {
    onPeerListUpdate(setPeers);
  }, []);

  if (peers.length === 0) {
    return <p className="text-gray-400 text-sm">No peers available</p>;
  }

  return (
    <ul className="space-y-2">
      {peers.map((peer) => (
        <li key={peer.id}>
          <button
            onClick={() => onPeerSelected(peer)}
            className={`w-full text-left bg-gray-800 hover:bg-gray-700 rounded px-4 py-2 transition ${
              selectedPeerId === peer.id ? 'bg-gray-700' : ''
            }`}
          >
            {peer.name || peer.id}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default PeerList;
