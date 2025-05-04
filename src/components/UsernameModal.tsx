import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { User } from 'lucide-react';

const UsernameModal: React.FC = () => {
  const { username, setUsername } = useUser();
  const [inputValue, setInputValue] = useState('');

  if (username) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setUsername(inputValue);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-indigo-900 bg-opacity-50 rounded-full p-3">
            <User className="h-8 w-8 text-teal-400" />
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-center text-white mb-4">
          Enter Your Username
        </h2>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter your username"
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400 mb-4"
            autoFocus
          />
          
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="w-full py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default UsernameModal