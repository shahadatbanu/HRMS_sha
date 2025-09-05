import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { backend_url } from '../../environment';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'hr' | 'employee';
  profileImage?: string;
  designation?: string;
  phoneNumber?: string;
  address?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  hasPermission: (action: string, module?: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${backend_url}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Token might be invalid, clear it
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();

    // Create a custom event listener for token changes
    const handleTokenChange = () => {
      console.log('Token change detected, refreshing user profile');
      fetchUserProfile();
    };

    // Listen for storage events (when token is updated from another tab/window)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        handleTokenChange();
      }
    };

    // Override localStorage.setItem to detect token changes in the same tab
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;

    localStorage.setItem = function(key, value) {
      originalSetItem.call(this, key, value);
      if (key === 'token') {
        handleTokenChange();
      }
    };

    localStorage.removeItem = function(key) {
      originalRemoveItem.call(this, key);
      if (key === 'token') {
        handleTokenChange();
      }
    };

    // Listen for custom login/logout events
    const handleLoginEvent = () => {
      console.log('Login event detected, refreshing user profile');
      fetchUserProfile();
    };

    const handleLogoutEvent = () => {
      console.log('Logout event detected, clearing user');
      setUser(null);
    };

    // Add event listeners for custom events
    window.addEventListener('userLogin', handleLoginEvent);
    window.addEventListener('userLogout', handleLogoutEvent);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      // Restore original localStorage methods
      localStorage.setItem = originalSetItem;
      localStorage.removeItem = originalRemoveItem;
      
      // Remove event listeners
      window.removeEventListener('userLogin', handleLoginEvent);
      window.removeEventListener('userLogout', handleLogoutEvent);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const hasPermission = (action: string, module?: string): boolean => {
    if (!user) {
      return false;
    }

    // Admin has all permissions
    if (user.role === 'admin') {
      return true;
    }

    // HR has permissions for candidates module
    if (user.role === 'hr' && module === 'candidates') {
      return ['create', 'read', 'update', 'delete'].includes(action);
    }

    // Employee has limited permissions for candidates module
    // They can read, add notes, update status, and perform other actions on assigned candidates
    // But they cannot create new candidates or delete existing ones
    if (user.role === 'employee' && module === 'candidates') {
      // Employees can read and create content (notes, attachments, etc.) but not new candidates
      return ['read', 'create'].includes(action);
    }

    return false;
  };

  const value: UserContextType = {
    user,
    setUser,
    isLoading,
    hasPermission,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 