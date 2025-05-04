import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  FileInfo, 
  TransferStatus as TransferStatusType, 
  Peer,
  BlockchainTransaction
} from '../types';
import { generateEncryptionKey, encryptFile, hashFile } from '../utils/crypto';
import { recordFileTransfer } from '../utils/blockchain';
import { getLocalPeerId, sendFileToPeer } from '../utils/webrtc';

interface TransferContextType {
  selectedFile: FileInfo | null;
  selectedPeer: Peer | null;
  transferStatus: TransferStatusType | null;
  setSelectedFile: (file: FileInfo | null) => void;
  setSelectedPeer: (peer: Peer | null) => void;
  startTransfer: () => Promise<void>;
  resetTransfer: () => void;
  transaction: BlockchainTransaction | null;
}

const TransferContext = createContext<TransferContextType | undefined>(undefined);

export const useTransfer = () => {
  const context = useContext(TransferContext);
  if (!context) {
    throw new Error('useTransfer must be used within a TransferProvider');
  }
  return context;
};

interface TransferProviderProps {
  children: ReactNode;
}

export const TransferProvider: React.FC<TransferProviderProps> = ({ children }) => {
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [selectedPeer, setSelectedPeer] = useState<Peer | null>(null);
  const [transferStatus, setTransferStatus] = useState<TransferStatusType | null>(null);
  const [transaction, setTransaction] = useState<BlockchainTransaction | null>(null);

  // Reset transfer status when file or peer changes
  useEffect(() => {
    if (transferStatus && transferStatus.status !== 'complete' && transferStatus.status !== 'failed') {
      setTransferStatus(null);
    }
  }, [selectedFile, selectedPeer]);

  const startTransfer = async () => {
    if (!selectedFile || !selectedPeer) {
      console.error('File or peer not selected');
      return;
    }

    const transferId = uuidv4();
    
    // Initialize transfer status
    setTransferStatus({
      id: transferId,
      fileId: selectedFile.id,
      progress: 0,
      status: 'pending',
      startTime: Date.now(),
      receiverId: selectedPeer.id
    });

    try {
      // Update status to connecting
      setTransferStatus(prev => prev ? {
        ...prev,
        status: 'connecting',
        progress: 5
      } : null);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate encryption key
      const encryptionKey = generateEncryptionKey();
      
      // Update status to encrypting
      setTransferStatus(prev => prev ? {
        ...prev,
        status: 'encrypting',
        progress: 15
      } : null);
      
      // Encrypt file (mock)
      const fileBlob = new Blob(['Mock file content'], { type: 'text/plain' });
      await encryptFile(fileBlob as File, encryptionKey);
      
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Update status to transferring
      setTransferStatus(prev => prev ? {
        ...prev,
        status: 'transferring',
        progress: 30
      } : null);
      
      // Send file to peer (mock with progress updates)
      await sendFileToPeer(
        selectedPeer.id,
        fileBlob,
        (progress) => {
          setTransferStatus(prev => prev ? {
            ...prev,
            progress: 30 + (progress * 0.5) // 30% to 80%
          } : null);
        }
      );
      
      // Update status to verifying
      setTransferStatus(prev => prev ? {
        ...prev,
        status: 'verifying',
        progress: 85
      } : null);
      
      // Record transfer on blockchain
      const tx = await recordFileTransfer(
        selectedFile.hash || 'unknown',
        getLocalPeerId(),
        selectedPeer.id,
        selectedFile.name,
        selectedFile.size
      );
      
      setTransaction(tx);
      
      // Complete transfer
      setTransferStatus(prev => prev ? {
        ...prev,
        status: 'complete',
        progress: 100,
        endTime: Date.now(),
        transactionHash: tx.hash
      } : null);
      
    } catch (error: any) {
      console.error('Transfer failed:', error);
      
      // Update status to failed
      setTransferStatus(prev => prev ? {
        ...prev,
        status: 'failed',
        progress: 0,
        endTime: Date.now(),
        error: error.message || 'Unknown error occurred'
      } : null);
    }
  };

  const resetTransfer = () => {
    setTransferStatus(null);
    setTransaction(null);
  };

  const value = {
    selectedFile,
    selectedPeer,
    transferStatus,
    setSelectedFile,
    setSelectedPeer,
    startTransfer,
    resetTransfer,
    transaction
  };

  return (
    <TransferContext.Provider value={value}>
      {children}
    </TransferContext.Provider>
  );
};