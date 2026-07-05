import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Search, Grid, MapPin, X, ArrowUpDown } from 'lucide-react';
import { BookCard } from '../components/BookCard';
import { BottomSheet } from '../components/BottomSheet';
import { backendApi as api } from '../services/backendApi';
import type { Book, BookCondition, SearchFilters } from '../types';
import { CATEGORIES, CONDITIONS, SORT_OPTIONS, COLLEGES } from '../constants';
import { CardSkeleton } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Sync state with URL params
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('query') || '',
    category: searchParams.get('category') || 'all',
    condition: (searchParams.get('condition')?.split(',') as BookCondition[])?.filter(Boolean) || [],
    minPrice: Number(searchParams.get('minPrice')) || 0,
    maxPrice: Number(searchParams.get('maxPrice')) || 5000,
    college: searchParams.get('college') || '',
    sort: searchParams.get('sort') || 'recent'
  });

  // Trigger search on filter changes or URL updates
  useEffect(() => {
    const fetchFilteredListings = async () => {
      setIsLoading(true);
      try {
        const queryParams: Record<string, string> = {};
        if (filters.query) queryParams.query = filters.query;
        if (filters.category && filters.category !== 'all') queryParams.category = filters.category;
        if (filters.condition.length > 0) queryParams.condition = filters.condition.join(',');
        if (filters.minPrice > 0) queryParams.minPrice = String(filters.minPrice);
        if (filters.maxPrice < 5000) queryParams.maxPrice = String(filters.maxPrice);
        if (filters.college) queryParams.college = filters.college;
        if (filters.sort !== 'recent') queryParams.sort = filters.sort;
        
        setSearchParams(queryParams);

        const data = await api.getBooks(filters);
        setBooks(data);
      } catch (err) {
        console.error('Error fetching search listings', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredListings();
  }, [filters, setSearchParams]);

  // Handle URL change externally (e.g. from navbar search)
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      query: searchParams.get('query') || '',
      category: searchParams.get('category') || 'all',
      college: searchParams.get('college') || '',
    }));
  }, [searchParams]);

  const handleQueryChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Search is handled reactively by state, but form submission forces state refresh
    setFilters(prev => ({ ...prev }));
  };

  const handleConditionToggle = (cond: BookCondition) => {
    setFilters(prev => {
      const active = prev.condition.includes(cond)
        ? prev.condition.filter(c => c !== cond)
        : [...prev.condition, cond];
      return { ...prev, condition: active };
    });
  };

  const handleClearFilters = () => {
    setFilters({
      query: '',
      category: 'all',
      condition: [],
      minPrice: 0,
      maxPrice: 5000,
      college: '',
      sort: 'recent'
    });
    setIsFilterSheetOpen(false);
  };

  const FilterOptions = () => (
    <div className="flex flex-col gap-6">
      {/* Category Selection */}
      <div>
        <h4 className="font-bold text-xs text-textDark mb-3 uppercase tracking-wider">Category</h4>
        <select
          value={filters.category}
          onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
          className="w-full bg-background border border-borderCustom rounded-lg p-2.5 text-xs text-textDark focus:border-primary focus:outline-none"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* College Selection */}
      <div>
        <h4 className="font-bold text-xs text-textDark mb-3 uppercase tracking-wider">Campus / College</h4>
        <select
          value={filters.college}
          onChange={(e) => setFilters(prev => ({ ...prev, college: e.target.value }))}
          className="w-full bg-background border border-borderCustom rounded-lg p-2.5 text-xs text-textDark focus:border-primary focus:outline-none"
        >
          <option value="">All Campuses</option>
          {COLLEGES.map(col => (
            <option key={col} value={col}>{col.split(',')[0]}</option>
          ))}
        </select>
      </div>

      {/* Price Range Selection */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-bold text-xs text-textDark uppercase tracking-wider">Price Range</h4>
          <span className="text-xs font-semibold text-primary">₹{filters.minPrice} - ₹{filters.maxPrice}</span>
        </div>
        <input
          type="range"
          min="0"
          max="5000"
          step="100"
          value={filters.maxPrice}
          onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-[10px] text-muted font-medium mt-1.5">
          <span>₹0</span>
          <span>₹5000+</span>
        </div>
      </div>

      {/* Condition Selection */}
      <div>
        <h4 className="font-bold text-xs text-textDark mb-3 uppercase tracking-wider">Condition</h4>
        <div className="flex flex-col gap-2.5">
          {CONDITIONS.map(cond => {
            const checked = filters.condition.includes(cond.value);
            return (
              <label key={cond.value} className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleConditionToggle(cond.value)}
                  className="rounded border-slate-300 text-primary focus:ring-primary/20 w-4 h-4 mt-0.5"
                />
                <div>
                  <span className="text-xs font-semibold text-textDark">{cond.label}</span>
                  <p className="text-[10px] text-muted leading-tight mt-0.5">{cond.description}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Clear Button */}
      <button
        onClick={handleClearFilters}
        className="border border-borderCustom text-textDark hover:bg-slate-50 transition-colors py-2 px-4 rounded-lg text-xs font-bold w-full focus:outline-none"
      >
        Reset Filters
      </button>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      {/* Desktop Filter Sidebar */}
      <aside className="hidden md:block w-[260px] bg-white border border-borderCustom rounded-xl p-5 sticky top-24 flex-shrink-0 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-borderCustom mb-5">
          <div className="flex items-center gap-1.5 font-bold text-sm text-textDark">
            <Filter className="w-4 h-4" />
            <span>Filter Search</span>
          </div>
          {(filters.query || filters.category !== 'all' || filters.condition.length > 0 || filters.minPrice > 0 || filters.maxPrice < 5000 || filters.college) && (
            <button
              onClick={handleClearFilters}
              className="text-[10px] font-bold text-primary hover:underline"
            >
              Clear All
            </button>
          )}
        </div>
        <FilterOptions />
      </aside>

      {/* Results Main Screen */}
      <div className="flex-1 w-full flex flex-col gap-4">
        {/* Search Bar & Mobile Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleQueryChange} className="flex-1 relative flex items-center">
            <Search className="w-4 h-4 text-muted absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search title, author, key term..."
              value={filters.query}
              onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
              className="w-full bg-white border border-borderCustom rounded-xl py-2.5 pl-10 pr-4 text-xs text-textDark focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-subtle"
            />
          </form>

          {/* Filter, Sort and Reset buttons for tablet/mobile layout */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsFilterSheetOpen(true)}
              className="md:hidden bg-white border border-borderCustom text-textDark text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-subtle hover:bg-slate-50 transition-colors focus:outline-none"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            {/* Sort Dropdown */}
            <div className="relative flex items-center bg-white border border-borderCustom rounded-xl shadow-subtle px-3 py-2 text-xs font-semibold text-textDark flex-1 sm:flex-initial">
              <ArrowUpDown className="w-3.5 h-3.5 text-muted mr-1.5" />
              <select
                value={filters.sort}
                onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
                className="bg-transparent border-0 p-0 text-xs font-semibold text-textDark focus:outline-none focus:ring-0 cursor-pointer pr-5"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Selected Filter Chips */}
        <div className="flex flex-wrap gap-1.5 items-center">
          {filters.category !== 'all' && (
            <span className="bg-slate-100 border border-borderCustom text-textDark text-[10px] font-semibold pl-2.5 pr-1.5 py-1 rounded-md flex items-center gap-1">
              <span>Category: {CATEGORIES.find(c => c.id === filters.category)?.name}</span>
              <button onClick={() => setFilters(prev => ({ ...prev, category: 'all' }))} className="p-0.5 rounded-full hover:bg-slate-200">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          )}
          {filters.college && (
            <span className="bg-slate-100 border border-borderCustom text-textDark text-[10px] font-semibold pl-2.5 pr-1.5 py-1 rounded-md flex items-center gap-1">
              <span>Campus: {filters.college.split(',')[0]}</span>
              <button onClick={() => setFilters(prev => ({ ...prev, college: '' }))} className="p-0.5 rounded-full hover:bg-slate-200">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          )}
          {filters.condition.map(cond => (
            <span key={cond} className="bg-slate-100 border border-borderCustom text-textDark text-[10px] font-semibold pl-2.5 pr-1.5 py-1 rounded-md flex items-center gap-1">
              <span>Cond: {cond}</span>
              <button onClick={() => handleConditionToggle(cond)} className="p-0.5 rounded-full hover:bg-slate-200">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(n => <CardSkeleton key={n} />)}
          </div>
        ) : books.length > 0 ? (
          <div>
            <div className="flex items-center justify-between text-xs text-muted mb-4">
              <span>Found {books.length} {books.length === 1 ? 'listing' : 'listings'}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {books.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            type="search"
            title="No Results Found"
            description="We couldn't find any listings matching your search parameters. Try adjusting your filter parameters or checking different campuses."
            actionText="Clear All Filters"
            onAction={handleClearFilters}
          />
        )}
      </div>

      {/* Mobile Filters Slide-up Sheet */}
      <BottomSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        title="Filter Search Listings"
      >
        <FilterOptions />
      </BottomSheet>
    </div>
  );
};
