import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, Clock, Grid, Book as BookIcon, Calculator, Laptop, FlaskConical, FileText, Bike, Home, Cpu, PenTool } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { BookCard } from '../components/BookCard';
import { useAuth } from '../context/AuthContext';
import { backendApi as api } from '../services/backendApi';
import type { Book } from '../types';
import { CardSkeleton } from '../components/SkeletonLoader';
import { SEO } from '../components/SEO';
import { EmptyState } from '../components/EmptyState';

const getCategoryIcon = (iconName: string) => {
  const cls = 'w-3.5 h-3.5';
  switch (iconName) {
    case 'Book': return <BookIcon className={cls} />;
    case 'Calculator': return <Calculator className={cls} />;
    case 'Laptop': return <Laptop className={cls} />;
    case 'FlaskConical': return <FlaskConical className={cls} />;
    case 'FileText': return <FileText className={cls} />;
    case 'Bike': return <Bike className={cls} />;
    case 'Home': return <Home className={cls} />;
    case 'Cpu': return <Cpu className={cls} />;
    case 'PenTool': return <PenTool className={cls} />;
    default: return <Grid className={cls} />;
  }
};

export const HomePage: React.FC = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthLoading) return;

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
  }, [isAuthLoading, user]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getFilteredBooks = () => {
    let list = books.filter(b => !user || b.sellerId !== user.id);
    if (selectedCategory === 'all') return list;
    return list.filter(b => b.category === selectedCategory);
  };

  const getNearbyBooks = () => {
    if (!user) return books.slice(0, 3);
    const userCollegeWord = user?.college?.split(',')[0]?.toLowerCase() || '';
    return books.filter(b => b.college && b.college.toLowerCase().includes(userCollegeWord) && b.sellerId !== user.id);
  };

  const allFilteredBooks = getFilteredBooks();

  const recentBooks = [...allFilteredBooks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const selectedCategoryObj = CATEGORIES.find(c => c.id === selectedCategory);
  const currentCategoryTitle = selectedCategory === 'all'
    ? 'All College Essentials'
    : (selectedCategoryObj?.name || 'Category Listings');

  return (
    <div className="flex flex-col gap-8 md:gap-10">
      <SEO title="RevoShelf | Buy & Sell College Essentials" descriptionType="home" />
      <h1 className="sr-only">RevoShelf College Marketplace Dashboard</h1>

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

      {/* Category Chips Bar with Search Page Shortcut */}
      <section className="-mx-4 md:mx-0">
        <div className="flex items-center justify-between gap-2 overflow-x-auto px-4 md:px-0 no-scrollbar">
          <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1" aria-label="Product categories">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition-all cursor-pointer ${selectedCategory === 'all'
                ? 'bg-primary text-white shadow-subtle'
                : 'bg-[#F5F3EF] text-[#4B5563] hover:bg-[#E5E7EB]'
                }`}
            >
              All Categories
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${selectedCategory === cat.id
                  ? 'bg-primary text-white shadow-subtle'
                  : 'bg-[#F5F3EF] text-[#4B5563] hover:bg-[#E5E7EB]'
                  }`}
              >
                {getCategoryIcon(cat.icon)}
                {cat.name}
              </button>
            ))}
          </nav>

          <Link
            to={selectedCategory === 'all' ? '/search' : `/search?category=${selectedCategory}`}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-primary hover:underline shrink-0 bg-white border border-borderCustom px-3 py-1.5 rounded-xl shadow-subtle hover:bg-slate-50 transition-colors"
            title="Open advanced search and filter options"
          >
            {/* <Filter className="w-3.5 h-3.5" />
            <span>Search & Filters</span> */}
          </Link>
        </div>
      </section>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <CardSkeleton key={n} />)}
        </div>
      ) : (
        <>
          {/* Nearby Listings Section (if user is logged in & has college matches) */}
          {user && getNearbyBooks().length > 0 && selectedCategory === 'all' && (
            <section className="">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-base md:text-lg font-bold text-textDark leading-tight">Available Near By You</h2>
                  <p className="text-[10px] text-muted truncate mt-0.5 max-w-sm md:max-w-md">{user.college}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {getNearbyBooks().map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </section>
          )}

          {/* Recently Added Section (Highlight section when showing All Categories) */}
          {selectedCategory === 'all' && recentBooks.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-base md:text-lg font-bold text-textDark leading-tight">Recently Added</h2>
                  <p className="text-[10px] text-muted mt-0.5">Browse the latest materials uploaded by fellow students</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {recentBooks.map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </section>
          )}

          {/* All Listings Section (Main Section showing ALL items for the selected category) */}
          <section className="pt-2 border-t border-[#E5E7EB]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
              <div className="flex items-center gap-2">
                <Grid className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-base md:text-lg font-bold text-textDark leading-tight">
                    {currentCategoryTitle}
                  </h2>
                  <p className="text-[10px] text-muted mt-0.5">
                    Showing {allFilteredBooks.length} {allFilteredBooks.length === 1 ? 'item' : 'items'} available for trade
                  </p>
                </div>
              </div>

            </div>

            {allFilteredBooks.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {allFilteredBooks.map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <EmptyState
                type="search"
                title="No Listings Found"
                description={`There are currently no active listings under "${currentCategoryTitle}". Be the first student to post an item in this category!`}
                actionText="Explore All Categories"
                onAction={() => setSelectedCategory('all')}
              />
            )}
          </section>
        </>
      )}
    </div>
  );
};

