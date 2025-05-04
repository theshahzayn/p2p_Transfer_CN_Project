import React from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  Shield, 
  Lock, 
  FileText, 
  Database 
} from 'lucide-react';
import { TransferStatus as TransferStatusType } from '../types';

interface TransferStatusProps {
  transfer: TransferStatusType;
  fileName: string;
  fileSize: number;
}

const TransferStatus: React.FC<TransferStatusProps> = ({ 
  transfer, 
  fileName, 
  fileSize 
}) => {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = () => {
    switch (transfer.status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-400" />;
      case 'connecting':
        return <RefreshCw className="h-5 w-5 text-blue-400 animate-spin" />;
      case 'encrypting':
        return <Lock className="h-5 w-5 text-indigo-400" />;
      case 'transferring':
        return <Database className="h-5 w-5 text-teal-400" />;
      case 'verifying':
        return <Shield className="h-5 w-5 text-purple-400" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (transfer.status) {
      case 'complete':
        return 'Transfer Complete';
      case 'failed':
        return `Failed: ${transfer.error || 'Unknown error'}`;
      case 'pending':
        return 'Waiting to start...';
      case 'connecting':
        return 'Establishing secure connection...';
      case 'encrypting':
        return 'Encrypting file...';
      case 'transferring':
        return `Transferring (${transfer.progress.toFixed(0)}%)...`;
      case 'verifying':
        return 'Verifying blockchain record...';
      default:
        return 'Preparing transfer...';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-gray-900 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-teal-400" />
          <h3 className="text-gray-200 font-medium text-sm truncate max-w-[180px]">
            {fileName}
          </h3>
        </div>
        <span className="text-xs text-gray-400">{formatBytes(fileSize)}</span>
      </div>
      
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          {getStatusIcon()}
          <span className="text-sm text-gray-300">{getStatusText()}</span>
        </div>
        
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 rounded-full ${
              transfer.status === 'complete'
                ? 'bg-green-500'
                : transfer.status === 'failed'
                ? 'bg-red-500'
                : 'bg-gradient-to-r from-blue-500 to-teal-500'
            }`}
            style={{ width: `${transfer.progress}%` }}
          ></div>
        </div>
        
        {transfer.transactionHash && (
          <div className="mt-4 p-2 bg-indigo-900/30 rounded border border-indigo-800 flex items-center space-x-2">
            <Shield className="h-4 w-4 text-indigo-400" />
            <div className="overflow-hidden">
              <p className="text-xs text-gray-300">Verified</p>
              <p className="text-xs text-gray-500 truncate">
                TX: {transfer.transactionHash}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferStatus;