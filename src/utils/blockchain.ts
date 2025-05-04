// Mock blockchain implementation for demo purposes
// In a real app, this would connect to Ethereum or similar blockchain

import { v4 as uuidv4 } from 'uuid';
import { BlockchainTransaction } from '../types';

// Mock blockchain transactions storage
let transactions: BlockchainTransaction[] = [];

/**
 * Records a file transfer to the mock blockchain
 */
export const recordFileTransfer = async (
  fileHash: string,
  sender: string,
  receiver: string,
  fileName: string,
  fileSize: number
): Promise<BlockchainTransaction> => {
  // In a real implementation, this would create a blockchain transaction
  // using Web3.js or ethers.js to interact with a smart contract
  
  // Simulate blockchain delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const transaction: BlockchainTransaction = {
    hash: `0x${uuidv4().replace(/-/g, '')}`,
    timestamp: Date.now(),
    fileHash,
    sender,
    receiver,
    fileName,
    fileSize,
    verified: true
  };
  
  transactions.push(transaction);
  console.log('Transaction recorded to blockchain:', transaction);
  
  return transaction;
};

/**
 * Verifies a file transfer using the blockchain
 */
export const verifyFileTransfer = async (
  transactionHash: string,
  fileHash: string
): Promise<boolean> => {
  // In a real implementation, this would query the blockchain
  // to verify the transaction exists and matches the file hash
  
  // Simulate blockchain delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const transaction = transactions.find(tx => tx.hash === transactionHash);
  
  if (!transaction) {
    console.error('Transaction not found in blockchain');
    return false;
  }
  
  const verified = transaction.fileHash === fileHash;
  console.log(`Transaction verification: ${verified ? 'Success' : 'Failed'}`);
  
  return verified;
};

/**
 * Gets all transactions from the blockchain
 */
export const getTransactions = async (): Promise<BlockchainTransaction[]> => {
  // In a real implementation, this would query the blockchain
  // to get all transactions for the current user
  
  // Simulate blockchain delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return [...transactions];
};

/**
 * Gets a specific transaction by hash
 */
export const getTransaction = async (hash: string): Promise<BlockchainTransaction | null> => {
  // Simulate blockchain delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const transaction = transactions.find(tx => tx.hash === hash);
  return transaction || null;
};