// File: src/contexts/TransferContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  FileInfo, 
  TransferStatus as TransferStatusType, 
  Peer,
  BlockchainTransaction
} from '../types';
import { generateEncryptionKey, encryptFile } from '../utils/crypto';
import { recordFileTransfer } from '../utils/blockchain';
import { createConnection, sendFile, setFileReceiver } from '../utils/webrtc';
import { sendSignal, onSignal } from '../utils/signaling';

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

  useEffect(() => {
    setFileReceiver((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'received_file';
      a.click();

      setTransferStatus(prev => prev ? {
        ...prev,
        status: 'complete',
        progress: 100,
        endTime: Date.now()
      } : null);
    });
  }, []);

  useEffect(() => {
    if (transferStatus && transferStatus.status !== 'complete' && transferStatus.status !== 'failed') {
      setTransferStatus(null);
    }
  }, [selectedFile, selectedPeer]);

  const startTransfer = async () => {
    if (!selectedFile || !selectedPeer || !selectedFile.fileObject) {
      console.error('File or peer not selected');
      return;
    }

    const transferId = uuidv4();

    setTransferStatus({
      id: transferId,
      fileId: selectedFile.id,
      progress: 5,
      status: 'connecting',
      startTime: Date.now(),
      receiverId: selectedPeer.id
    });

    try {
      await createConnection(
        true,
        (signal) => sendSignal(selectedPeer.id, signal),
        (handle) => onSignal((from, signal) => {
          if (from === selectedPeer.id) handle(signal);
        })
      );

      setTransferStatus(prev => prev ? {
        ...prev,
        status: 'encrypting',
        progress: 15
      } : null);

      const encryptionKey = generateEncryptionKey();
      const encryptedBlob = await encryptFile(selectedFile.fileObject, encryptionKey);

      setTransferStatus(prev => prev ? {
        ...prev,
        status: 'transferring',
        progress: 40
      } : null);

      await sendFile(encryptedBlob);

      const tx = await recordFileTransfer(
        selectedFile.hash || 'placeholder_hash',
        'me',
        selectedPeer.id,
        selectedFile.name,
        selectedFile.size
      );

      setTransaction(tx);

      setTransferStatus(prev => prev ? {
        ...prev,
        status: 'verifying',
        progress: 85
      } : null);

      setTransferStatus(prev => prev ? {
        ...prev,
        status: 'complete',
        progress: 100,
        endTime: Date.now(),
        transactionHash: tx.hash
      } : null);

    } catch (err: any) {
      console.error('Transfer failed:', err);
      setTransferStatus(prev => prev ? {
        ...prev,
        status: 'failed',
        progress: 0,
        endTime: Date.now(),
        error: err.message || 'Unknown error occurred'
      } : null);
    }
  };

  const resetTransfer = () => {
    setTransferStatus(null);
    setTransaction(null);
  };

  const value: TransferContextType = {
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
