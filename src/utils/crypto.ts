// Mock encryption utils for demo purposes
// In a real app, these would use the Web Crypto API

/**
 * Generates a random encryption key
 */
export const generateEncryptionKey = (): string => {
  // This is a simplified mock version
  // In production, this would use crypto.subtle.generateKey
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Encrypts a file with the provided key
 */
export const encryptFile = async (file: File, key: string): Promise<Blob> => {
  // Mock encryption - in a real app, would use AES-256
  // This would use crypto.subtle.encrypt
  console.log(`Encrypting file ${file.name} with key ${key.substring(0, 8)}...`);
  
  // Return the file itself for the demo
  // In a real implementation, this would return an encrypted blob
  return new Promise(resolve => {
    setTimeout(() => resolve(file), 1000);
  });
};

/**
 * Decrypts a file with the provided key
 */
export const decryptFile = async (encryptedBlob: Blob, key: string): Promise<Blob> => {
  // Mock decryption - in a real app, would use AES-256
  // This would use crypto.subtle.decrypt
  console.log(`Decrypting file with key ${key.substring(0, 8)}...`);
  
  // Return the file itself for the demo
  // In a real implementation, this would return a decrypted blob
  return new Promise(resolve => {
    setTimeout(() => resolve(encryptedBlob), 1000);
  });
};

/**
 * Creates a hash of a file for integrity verification
 */
export const hashFile = async (file: File): Promise<string> => {
  // In production, this would use crypto.subtle.digest
  // to create a SHA-256 hash of the file
  
  // This is a mock implementation
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        // Use a simple hash function for demo
        // In production, use SHA-256
        const mockHash = `${file.name}-${file.size}-${file.lastModified}`.split('').reduce(
          (hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0
        ).toString(16);
        resolve(mockHash);
      }
    };
    reader.readAsArrayBuffer(file.slice(0, 1024 * 1024)); // Just read first MB for mock
  });
};

/**
 * Generates a keypair for asymmetric encryption (mock)
 */
export const generateKeyPair = async (): Promise<{ publicKey: string; privateKey: string }> => {
  // In production, this would use crypto.subtle.generateKey with RSA-OAEP
  
  // Mock implementation for demo
  return {
    publicKey: `pk_${Math.random().toString(36).substring(2, 15)}`,
    privateKey: `sk_${Math.random().toString(36).substring(2, 15)}`
  };
};