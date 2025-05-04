import React, { useRef, useState } from 'react';
import { Upload, Check, AlertCircle } from 'lucide-react';
import { FileInfo } from '../types';
import { hashFile } from '../utils/crypto';
import { v4 as uuidv4 } from 'uuid';

interface FileUploaderProps {
  onFileSelected: (fileInfo: FileInfo) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelection = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const file = files[0];
      
      // Validate file
      if (file.size > 100 * 1024 * 1024) { // 100MB max for demo
        throw new Error('File size exceeds 100MB limit');
      }
      
      // Hash the file for integrity
      const fileHash = await hashFile(file);
      
      const fileInfo: FileInfo = {
        id: uuidv4(),
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        hash: fileHash
      };
      
      onFileSelected(fileInfo);
    } catch (err: any) {
      console.error('Error processing file:', err);
      setError(err.message || 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelection(e.dataTransfer.files);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-all duration-300 ${
        isDragging
          ? 'border-teal-400 bg-indigo-900 bg-opacity-50'
          : 'border-gray-600 bg-gray-800 bg-opacity-50 hover:border-gray-500 hover:bg-opacity-70'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFileSelection(e.target.files)}
      />
      
      <div className="flex flex-col items-center justify-center space-y-4">
        {isProcessing ? (
          <div className="animate-pulse">
            <div className="h-12 w-12 rounded-full border-4 border-t-teal-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            <p className="mt-4 text-gray-300">Processing file...</p>
          </div>
        ) : error ? (
          <div className="text-red-400">
            <AlertCircle className="h-12 w-12 mx-auto" />
            <p className="mt-2 text-sm">{error}</p>
            <button
              className="mt-4 px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
              onClick={() => setError(null)}
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="bg-indigo-900 bg-opacity-50 rounded-full p-3">
              <Upload className="h-8 w-8 text-teal-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-300">
                Drag and drop your file here
              </p>
              <p className="text-sm text-gray-400 mt-1">or</p>
            </div>
            <button
              type="button"
              className="px-4 py-2 bg-indigo-700 hover:bg-indigo-600 text-white rounded-md transition-colors"
              onClick={handleButtonClick}
            >
              Select File
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Max file size: 100MB
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUploader;