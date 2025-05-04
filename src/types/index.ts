// File Transfer Types
export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  hash?: string;
  encryptionKey?: string;
}

export interface TransferStatus {
  id: string;
  fileId: string;
  progress: number;
  status: 'pending' | 'connecting' | 'encrypting' | 'transferring' | 'verifying' | 'complete' | 'failed';
  startTime: number;
  endTime?: number;
  error?: string;
  receiverId?: string;
  transactionHash?: string;
}

// Connection Types
export interface Peer {
  id: string;
  name?: string;
  connected: boolean;
  lastSeen?: number;
  publicKey?: string;
}

// Blockchain Types
export interface BlockchainTransaction {
  hash: string;
  timestamp: number;
  fileHash: string;
  sender: string;
  receiver: string;
  fileSize: number;
  fileName: string;
  verified: boolean;
}

// Encryption Types
export interface KeyPair {
  publicKey: string;
  privateKey: string;
}