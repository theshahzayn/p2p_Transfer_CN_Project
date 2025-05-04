// File: src/contexts/UserContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { register } from '../utils/signaling';

interface UserContextType {
  username: string | null;
  setUsername: (name: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [username, setUsernameState] = useState<string | null>(() => {
    return localStorage.getItem('username');
  });

  useEffect(() => {
    if (username) {
      register(username); // ✅ Register with signaling server
    }
  }, [username]);

  const setUsername = (name: string) => {
    const sanitizedName = name.trim();
    if (sanitizedName) {
      const uniqueName = ensureUniqueName(sanitizedName);
      setUsernameState(uniqueName);
      localStorage.setItem('username', uniqueName);
    }
  };

  const ensureUniqueName = (name: string): string => {
    const existingNames = JSON.parse(localStorage.getItem('existingUsernames') || '[]');
    let uniqueName = name;
    let counter = 1;

    while (existingNames.includes(uniqueName)) {
      uniqueName = `${name}_${counter}`;
      counter++;
    }

    existingNames.push(uniqueName);
    localStorage.setItem('existingUsernames', JSON.stringify(existingNames));
    return uniqueName;
  };

  return (
    <UserContext.Provider value={{ username, setUsername }}>
      {children}
    </UserContext.Provider>
  );
};
