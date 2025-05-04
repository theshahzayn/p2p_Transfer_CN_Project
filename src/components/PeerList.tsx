import React from 'react';
import { Peer } from '../types';

interface PeerListProps {
  peers: Peer[];
  onPeerSelected: (peer: Peer) => void;
  selectedPeerId?: string;
}

const PeerList: React.FC<PeerListProps> = ({ peers, onPeerSelected, selectedPeerId }) => {
  if (peers.length === 0) {
    return <p className="text-gray-400 text-sm">No peers available</p>;
  }

  return (
    <ul className="space-y-2">
      {peers.map((peer) => (
        <li key={peer.id}>
          <button
            onClick={() => onPeerSelected(peer)}
            className={`w-full text-left bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded ${
              selectedPeerId === peer.id ? 'border border-teal-500' : ''
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
