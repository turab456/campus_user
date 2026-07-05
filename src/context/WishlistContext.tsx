import React, { createContext, useContext, useState, useEffect } from 'react';
import { backendApi as api } from '../services/backendApi';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  savedBookIds: string[];
  isSaved: (bookId: string) => boolean;
  toggleSave: (bookId: string) => Promise<void>;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedBookIds, setSavedBookIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setSavedBookIds([]);
        setIsLoading(false);
        return;
      }
      try {
        const list = await api.getWishlist();
        setSavedBookIds(list);
      } catch (err) {
        console.error('Failed to load wishlist', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  const toggleSave = async (bookId: string) => {
    if (!user) return;
    try {
      const isAdded = await api.toggleWishlist(bookId);
      setSavedBookIds(prev => 
        isAdded ? [...prev, bookId] : prev.filter(id => id !== bookId)
      );
    } catch (err) {
      console.error('Failed to toggle save', err);
      throw err;
    }
  };

  const isSaved = (bookId: string) => savedBookIds.includes(bookId);

  return (
    <WishlistContext.Provider value={{ savedBookIds, isSaved, toggleSave, isLoading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
