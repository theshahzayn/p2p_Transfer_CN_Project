import React from 'react';
import { Shield, GitBranch } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-indigo-900 to-blue-900 shadow-lg py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-teal-400" />
          <h1 className="text-2xl font-bold text-white">BlockTransfer</h1>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-indigo-800 bg-opacity-50 rounded-full px-3 py-1">
            <GitBranch className="h-4 w-4 text-teal-400 mr-2" />
            <span className="text-xs text-teal-400 font-medium">Blockchain Verified</span>
          </div>
          <div className="flex items-center bg-indigo-800 bg-opacity-50 rounded-full px-3 py-1">
            <div className="h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
            <span className="text-xs text-gray-200 font-medium">Network Active</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;