// File: src/components/FileUploader.tsx
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FileInfo } from '../types';

interface FileUploaderProps {
  onFileSelected: (fileInfo: FileInfo) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelected }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileInfo: FileInfo = {
        id: uuidv4(),
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        fileObject: file // ✅ Include real file
      };
      onFileSelected(fileInfo);
    }
  };

  return (
    <input
      type="file"
      onChange={handleFileChange}
      className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4
        file:rounded-full file:border-0
        file:text-sm file:font-semibold
        file:bg-indigo-600 file:text-white
        hover:file:bg-indigo-500"
    />
  );
};

export default FileUploader;
