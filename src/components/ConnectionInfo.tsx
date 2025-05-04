import React from 'react';
import { Key, ShieldCheck, User, Clock } from 'lucide-react';

interface ConnectionInfoProps {
  connectionId: string;
  publicKey: string;
  connectedPeer?: string;
  connectionTime?: number;
}

const ConnectionInfo: React.FC<ConnectionInfoProps> = ({
  connectionId,
  publicKey,
  connectedPeer,
  connectionTime
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-gray-300 font-medium mb-3 flex items-center">
        <ShieldCheck className="h-4 w-4 mr-2 text-teal-400" />
        Connection Details
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-start space-x-3">
          <User className="h-4 w-4 text-gray-400 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500">Your Node ID</p>
            <p className="text-sm text-gray-300 font-mono">{connectionId}</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <Key className="h-4 w-4 text-gray-400 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500">Public Key</p>
            <p className="text-sm text-gray-300 font-mono truncate max-w-[200px]">
              {publicKey}
            </p>
          </div>
        </div>
        
        {connectedPeer && (
          <div className="flex items-start space-x-3">
            <User className="h-4 w-4 text-green-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Connected To</p>
              <p className="text-sm text-gray-300">{connectedPeer}</p>
            </div>
          </div>
        )}
        
        {connectionTime && (
          <div className="flex items-start space-x-3">
            <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Connected Since</p>
              <p className="text-sm text-gray-300">
                {new Date(connectionTime).toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 bg-green-900/20 text-green-400 text-xs py-1.5 px-3 rounded-full flex items-center justify-center space-x-1.5">
        <div className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse"></div>
        <span>Secure Connection Active</span>
      </div>
    </div>
  );
};

export default ConnectionInfo;