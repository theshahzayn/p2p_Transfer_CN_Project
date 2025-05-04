import React, { useState, useEffect } from 'react';
import { Activity, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { BlockchainTransaction } from '../types';
import { getTransactions } from '../utils/blockchain';

const TransferHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const txs = await getTransactions();
      setTransactions(txs);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-gray-900 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-teal-400" />
          <h3 className="text-gray-200 font-medium">Transfer History</h3>
        </div>
        <button 
          className="text-gray-400 hover:text-teal-400 transition-colors"
          onClick={loadTransactions}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-teal-400' : ''}`} />
        </button>
      </div>
      
      <div className="divide-y divide-gray-700">
        {isLoading ? (
          <div className="py-10 text-center">
            <RefreshCw className="h-6 w-6 mx-auto text-teal-400 animate-spin mb-2" />
            <p className="text-sm text-gray-400">Loading blockchain data...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            <Activity className="h-10 w-10 mx-auto opacity-20 mb-2" />
            <p className="text-sm">No transfers recorded yet</p>
          </div>
        ) : (
          transactions.map(tx => (
            <div key={tx.hash} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  {tx.verified ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-400" />
                  )}
                  <p className="text-sm font-medium text-gray-200">{tx.fileName}</p>
                </div>
                <span className="text-xs text-gray-400">{formatBytes(tx.fileSize)}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div>
                  <p className="text-gray-500">From</p>
                  <p className="text-gray-300 truncate">{tx.sender}</p>
                </div>
                <div>
                  <p className="text-gray-500">To</p>
                  <p className="text-gray-300 truncate">{tx.receiver}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="text-gray-300">{formatDate(tx.timestamp)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className={tx.verified ? 'text-green-400' : 'text-yellow-400'}>
                    {tx.verified ? 'Verified' : 'Pending'}
                  </p>
                </div>
              </div>
              
              <div className="mt-1 text-xs text-gray-500 flex items-center">
                <span>TX: </span>
                <span className="truncate font-mono ml-1">{tx.hash}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransferHistory;