export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  hash?: string;
  encryptionKey?: string;
  fileObject?: File; // ✅ actual file
}


export type TransferPhase =
  | 'pending'
  | 'connecting'
  | 'encrypting'
  | 'transferring'
  | 'verifying'
  | 'complete'
  | 'failed';

export interface TransferStatus {
  id: string;
  fileId: string;
  progress: number; // 0–100
  status: TransferPhase;
  startTime: number;
  endTime?: number;
  error?: string;
  receiverId?: string;
  transactionHash?: string;
}

// 📡 Peer Connection Types
export interface Peer {
  id: string;            // usually the username
  name?: string;         // display name
  connected: boolean;    // current session connected
  lastSeen?: number;     // optional timestamp
  publicKey?: string;    // for future encrypted peer metadata
}

// 🔗 Blockchain Types
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

// 🔐 Encryption Keypair
export interface KeyPair {
  publicKey: string;
  privateKey: string;
}
