import React from 'react';
import { Shield, Key, Lock } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Shield className="h-5 w-5 text-teal-400" />
            <span className="text-sm font-medium text-gray-300">BlockTransfer</span>
          </div>
          
          <div className="flex space-x-6">
            <div className="flex items-center">
              <Key className="h-4 w-4 text-teal-400 mr-2" />
              <span className="text-xs">End-to-End Encrypted</span>
            </div>
            <div className="flex items-center">
              <Lock className="h-4 w-4 text-teal-400 mr-2" />
              <span className="text-xs">Blockchain Verified</span>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} BlockTransfer • Secure P2P File Transfer
        </div>
      </div>
    </footer>
  );
};

export default Footer;