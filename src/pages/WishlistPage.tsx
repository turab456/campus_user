import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { backendApi as api } from '../services/backendApi';
import type { Book } from '../types';
import { BookCard } from '../components/BookCard';
import { CardSkeleton } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { useWishlist } from '../context/WishlistContext';

export const WishlistPage: React.FC = () => {
  const { savedBookIds } = useWishlist();
  const [savedBooks, setSavedBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedBooksData = async () => {
      setIsLoading(true);
      try {
        const allBooks = await api.getBooks();
        // Filter books which are inside the saved wishlist ids
        const filtered = allBooks.filter(b => savedBookIds.includes(b.id) && b.status === 'active');
        setSavedBooks(filtered);
      } catch (err) {
        console.error('Error fetching wishlist books', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSavedBooksData();
  }, [savedBookIds]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-textDark tracking-tight flex items-center gap-2">
          <Heart className="w-5 h-5 text-danger fill-current" />
          <span>My Saved Items</span>
        </h1>
        <p className="text-xs text-muted mt-1">Keep track of textbooks and gear you are interested in buying.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3].map(n => <CardSkeleton key={n} />)}
        </div>
      ) : savedBooks.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {savedBooks.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <EmptyState
          type="wishlist"
          title="Your Wishlist is Empty"
          description="Click the heart icon on any listing card while browsing to save it here for quick reference."
          actionText="Browse Textbook Catalog"
          onAction={() => navigate('/search')}
        />
      )}
    </div>
  );
};
