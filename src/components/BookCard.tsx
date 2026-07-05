import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, GraduationCap } from 'lucide-react';
import type { Book } from '../types';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface BookCardProps {
  book: Book;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const { isSaved, toggleSave } = useWishlist();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const saved = isSaved(book.id);

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showToast('Please sign in to save books to your wishlist.', 'warning');
      return;
    }
    await toggleSave(book.id);
    showToast(
      saved ? `Removed "${book.title}" from saved items` : `Saved "${book.title}" to wishlist`,
      'success'
    );
  };

  const getConditionColor = (cond: typeof book.condition) => {
    switch (cond) {
      case 'New':
        return 'bg-[#E8F5E9] text-[#16A34A] border-[#C8E6C9]';
      case 'Like New':
        return 'bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]';
      case 'Very Good':
        return 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]';
      case 'Good':
        return 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]';
      case 'Acceptable':
        return 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]';
      default:
        return 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]';
    }
  };

  // Format date helper: "2 days ago" or similar
  const formatTimeAgo = (dateStr: string) => {
    const created = new Date(dateStr);
    const diffMs = Date.now() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        return 'Just now';
      }
      return `${diffHours}h ago`;
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return created.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <Link
      to={`/book/${book.id}`}
      className="group block bg-white border border-borderCustom rounded-xl overflow-hidden hover:shadow-subtle hover:-translate-y-0.5 transition-all duration-150 relative"
    >
      {/* Save Button */}
      {(!user || user.id !== book.sellerId) && (
        <button
          onClick={handleSaveToggle}
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full border bg-white/95 backdrop-blur-xs flex items-center justify-center shadow-subtle hover:scale-105 active:scale-95 transition-all focus:outline-none ${
            saved
              ? 'text-danger border-red-100'
              : 'text-muted border-borderCustom hover:text-textDark'
          }`}
          aria-label={saved ? 'Remove from saved' : 'Save listing'}
        >
          <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
        </button>
      )}

      {/* Image container */}
      <div className="relative aspect-[4/3] bg-[#FAF8F5] overflow-hidden border-b border-borderCustom">
        <img
          src={book.images[0]}
          alt={book.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
        />
        {book.status === 'sold' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
            <span className="bg-[#FAF8F5] text-textDark text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded border border-borderCustom shadow-subtle">
              Sold
            </span>
          </div>
        )}
        
        {/* Category Badge */}
        <span className="absolute bottom-2 left-2 text-[9px] font-bold bg-[#FAF8F5]/95 backdrop-blur-xs text-textDark px-2.5 py-0.5 rounded-md border border-borderCustom">
          {book.category.charAt(0).toUpperCase() + book.category.slice(1)}
        </span>

        {/* Risky Seller Badge */}
        {((book.sellerSpamScore ?? 0) >= 50 || (book.sellerScamScore ?? 0) >= 50) && (
          <span className="absolute top-2.5 left-2.5 text-[8px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-md shadow-sm flex items-center gap-0.5 z-10" title="This seller has received community reports">
            ⚠ Risky
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3 bg-white">
        {/* Condition & Date */}
        <div className="flex items-center justify-between gap-2 mb-2">
          {book.status === 'sold' ? (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md border bg-slate-100 text-slate-500 border-slate-200">
              Sold
            </span>
          ) : (
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${getConditionColor(book.condition)}`}>
              {book.condition}
            </span>
          )}
          <span className="text-[10px] text-muted font-medium">{formatTimeAgo(book.createdAt)}</span>
        </div>

        {/* Title & Author */}
        <h3 className="font-bold text-sm text-[#111827] leading-tight line-clamp-1 group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        <p className="text-[11px] text-muted truncate mt-0.5">by {book.author}</p>

        {/* Price Section */}
        <div className="flex items-baseline gap-1.5 mt-2">
          <span className="text-base font-bold text-textDark font-sans">₹{book.price}</span>
          {book.originalPrice > book.price && (
            <span className="text-xs text-muted line-through">₹{book.originalPrice}</span>
          )}
          {book.originalPrice > book.price && (
            <span className="text-[10px] font-bold text-success ml-1 bg-[#E8F5E9] border border-[#C8E6C9] px-1 rounded-sm">
              {Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)}% off
            </span>
          )}
        </div>

        <hr className="border-borderCustom my-2.5" />

        {/* College & Semester Info */}
        <div className="flex flex-col gap-1 text-[11px] text-muted">
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
            <span className="truncate">Sem {book.semester} • {book.department}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
            <span className="truncate" title={book.college}>{book.college.split(',')[0]}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
