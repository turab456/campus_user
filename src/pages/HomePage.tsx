import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Sparkles, Clock, Compass } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { BookCard } from '../components/BookCard';
import { useAuth } from '../context/AuthContext';
import { backendApi as api } from '../services/backendApi';
import type { Book } from '../types';
import { CardSkeleton } from '../components/SkeletonLoader';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        const data = await api.getBooks();
        setBooks(data);
      } catch (err) {
        console.error('Failed to fetch homepage books', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getFilteredBooks = () => {
    if (selectedCategory === 'all') return books;
    return books.filter(b => b.category === selectedCategory);
  };

  const getNearbyBooks = () => {
    if (!user) return books.slice(0, 3);
    const userCollegeWord = user?.college?.split(',')[0]?.toLowerCase() || '';
    return books.filter(b => b.college && b.college.toLowerCase().includes(userCollegeWord) && b.sellerId !== user.id);
  };

  const recentBooks = getFilteredBooks()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const recommendedBooks = getFilteredBooks()
    .filter(b => b.isFeatured || b.isPopular)
    .slice(0, 4);

  return (
    <div className="flex flex-col gap-10">
      {/* Search Header for Mobile/Tablet */}
      <section className="md:hidden bg-white border border-borderCustom rounded-2xl p-4 shadow-subtle -mt-2">
        <h2 className="text-sm font-bold text-textDark mb-3">What are you looking for today?</h2>
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="w-4 h-4 text-muted absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search books, authors, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-borderCustom rounded-xl py-2.5 pl-9 pr-4 text-sm text-textDark placeholder-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </form>
      </section>

      {/* Category Chips Carousel */}
      <section className="-mx-4 md:mx-0">
        <div className="flex items-center gap-2 overflow-x-auto px-4 md:px-0 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold flex-shrink-0 transition-colors ${selectedCategory === 'all'
              ? 'bg-primary text-white'
              : 'bg-[#F5F3EF] text-[#4B5563] hover:bg-[#E5E7EB]'
              }`}
          >
            All Categories
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold flex-shrink-0 transition-colors ${selectedCategory === cat.id
                ? 'bg-primary text-white'
                : 'bg-[#F5F3EF] text-[#4B5563] hover:bg-[#E5E7EB]'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(n => <CardSkeleton key={n} />)}
        </div>
      ) : (
        <>
          {/* Nearby Listings */}
          {user && getNearbyBooks().length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-5">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-base md:text-lg font-bold text-textDark leading-tight">Available Near By You</h2>
                  <p className="text-[10px] text-muted truncate mt-0.5 max-w-sm md:max-w-md">{user.college}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {getNearbyBooks().map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </section>
          )}

          {/* Recommended Section */}
          {/* <section>
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-5 h-5 text-primary" />
              <div>
                <h2 className="text-base md:text-lg font-bold text-textDark leading-tight">Recommended for You</h2>
                <p className="text-[10px] text-muted mt-0.5">Top-rated items and verified deals</p>
              </div>
            </div>
            {recommendedBooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {recommendedBooks.map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted">No recommendations found in this category.</p>
            )}
          </section> */}

          {/* Recently Added Section */}
          <section>
            <div className="flex items-center gap-2 mb-5">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                  <h2 className="text-base md:text-lg font-bold text-textDark leading-tight">Recently Added</h2>
                <p className="text-[10px] text-muted mt-0.5">Browse the latest materials uploaded by fellow students</p>
              </div>
            </div>
            {recentBooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {recentBooks.map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted">No books listed recently in this category.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
};
