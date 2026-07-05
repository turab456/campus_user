import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, MapPin, GraduationCap, Calendar, MessageSquare, ShieldAlert, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { backendApi as api } from '../services/backendApi';
import type { Book } from '../types';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { BookCard } from '../components/BookCard';
import { ListingDetailSkeleton } from '../components/SkeletonLoader';

const METADATA_LABELS: Record<string, string> = {
  author: 'Author / Created By',
  department: 'Department',
  semester: 'Semester / Class',
  brand: 'Brand / Manufacturer',
  model: 'Model Number',
  examApproved: 'Exam Approved',
  color: 'Color',
  age: 'Usage Age',
  accessories: 'Accessories Included',
  specs: 'Specifications',
  equipmentType: 'Equipment Type',
  size: 'Size',
  componentType: 'Component Type',
  itemType: 'Item Type',
  dimensions: 'Dimensions',
  stationeryType: 'Stationery Type'
};

export const ListingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [similarBooks, setSimilarBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isContacting, setIsContacting] = useState(false);
  const { user } = useAuth();
  const { isSaved, toggleSave } = useWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadBookDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const details = await api.getBookById(id);
        if (details) {
          setBook(details);
          // Load similar books (same category, different id)
          const all = await api.getBooks({ category: details.category });
          setSimilarBooks(all.filter(b => b.id !== details.id).slice(0, 4));
        } else {
          setBook(null);
        }
      } catch (err) {
        console.error('Error loading listing details', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBookDetails();
    setActiveImageIndex(0);
  }, [id]);

  if (isLoading) {
    return <ListingDetailSkeleton />;
  }

  if (!book) {
    return (
      <div className="text-center py-16 px-4">
        <h2 className="text-lg font-bold text-textDark">Listing Not Found</h2>
        <p className="text-xs text-muted mt-2">The listing you are looking for might have been sold, deleted, or expired.</p>
        <button
          onClick={() => navigate('/search')}
          className="mt-6 bg-primary text-white text-xs font-semibold py-2.5 px-5 rounded-full"
        >
          Back to Catalog
        </button>
      </div>
    );
  }

  const saved = isSaved(book.id);

  const handleSaveToggle = async () => {
    if (!user) {
      showToast('Please sign in to save this listing.', 'warning');
      return;
    }
    try {
      await toggleSave(book.id);
      showToast(
        saved ? 'Removed from saved items' : 'Saved to wishlist',
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to update wishlist.', 'danger');
    }
  };

  const handleContactSeller = async () => {
    if (!user) {
      showToast('Please sign in to contact the seller.', 'warning');
      navigate('/login');
      return;
    }
    
    if (user.id === book.sellerId) {
      showToast('This is your own listing.', 'info');
      return;
    }

    setIsContacting(true);
    try {
      const chat = await api.createOrGetChat(book.id, user.id);
      showToast('Chat thread opened with seller', 'success');
      navigate('/messages', { state: { activeChatId: chat.id } });
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to start conversation. Please try again.', 'danger');
    } finally {
      setIsContacting(false);
    }
  };

  const getConditionColor = (cond: typeof book.condition) => {
    switch (cond) {
      case 'New': return 'bg-[#E8F5E9] text-[#16A34A] border-[#C8E6C9]';
      case 'Like New': return 'bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]';
      case 'Very Good': return 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]';
      case 'Good': return 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]';
      case 'Acceptable': return 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]';
      default: return 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]';
    }
  };

  return (
    <div className="flex flex-col gap-12">
      {/* Mobile Back Button (Floating style on top of gallery) */}
      <div className="md:hidden flex items-center mb-1">
        <button
          onClick={() => navigate(-1)}
          className="text-xs font-semibold text-textDark flex items-center gap-1 hover:text-primary transition-colors focus:outline-none"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left Column: Image Gallery */}
        <div className="flex-1 w-full flex flex-col gap-4">
          <div className="bg-slate-50 border border-borderCustom rounded-2xl overflow-hidden aspect-[4/3] relative flex items-center justify-center">
            <img
              src={book.images[activeImageIndex]}
              alt={book.title}
              className="w-full h-full object-cover"
            />
            
            {/* Gallery Navigation Arrows (if multiple images exist) */}
            {book.images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIndex(prev => (prev === 0 ? book.images.length - 1 : prev - 1))}
                  className="absolute left-3 w-8 h-8 rounded-full bg-white/90 border border-borderCustom flex items-center justify-center text-textDark hover:scale-105 active:scale-95 transition-all shadow-subtle focus:outline-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveImageIndex(prev => (prev === book.images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-3 w-8 h-8 rounded-full bg-white/90 border border-borderCustom flex items-center justify-center text-textDark hover:scale-105 active:scale-95 transition-all shadow-subtle focus:outline-none"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails Row */}
          {book.images.length > 1 && (
            <div className="flex gap-2">
              {book.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-16 rounded-lg overflow-hidden border-2 bg-slate-50 focus:outline-none ${
                    activeImageIndex === idx ? 'border-primary' : 'border-borderCustom hover:border-slate-300'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Book details, seller info and CTAs */}
        <div className="w-full md:w-[400px] bg-white border border-borderCustom rounded-2xl p-5 md:p-6 shadow-subtle flex flex-col gap-5 sticky top-24">
          
          {/* Top header: category and condition */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
              {book.category}
            </span>
            {book.status === 'sold' ? (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md border bg-red-50 text-red-600 border-red-200 uppercase tracking-wider">
                Sold Out
              </span>
            ) : (
              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-md border ${getConditionColor(book.condition)}`}>
                Condition: {book.condition}
              </span>
            )}
          </div>

          {/* Title & Author */}
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-textDark tracking-tight leading-tight">
              {book.title}
            </h1>
            <p className="text-xs text-muted mt-1 font-medium">by {book.author}</p>
          </div>

          {/* Price details */}
          <div className="flex items-baseline gap-2.5 bg-[#F5F3EF] p-4 rounded-xl border border-borderCustom">
            <span className="text-2xl font-bold text-textDark">₹{book.price}</span>
            {book.originalPrice > book.price && (
              <span className="text-sm text-muted line-through">₹{book.originalPrice}</span>
            )}
            {book.originalPrice > book.price && (
              <span className="text-xs font-bold text-success bg-[#E8F5E9] border border-[#C8E6C9] px-1.5 py-0.5 rounded-md">
                Save {Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)}%
              </span>
            )}
          </div>

          <hr className="border-borderCustom" />

          {/* Seller Profile Summary */}
          <div>
            <h3 className="font-bold text-xs text-textDark uppercase tracking-wider mb-3">Listed by</h3>
            <Link to={`/seller/${book.sellerId}`} className="flex items-center gap-3 group">
              <img
                src={book.sellerAvatar}
                alt={book.sellerName}
                className="w-10 h-10 rounded-full border border-borderCustom object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-textDark group-hover:text-primary transition-colors truncate">
                  {book.sellerName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted">
                  <span className="font-semibold text-warning">&#9733; {book.sellerRating.toFixed(1)}</span>
                  <span>&middot;</span>
                  <span className="truncate">{book.college.split(',')[0]}</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Seller Risk Warning Banner */}
          {((book.sellerSpamScore ?? 0) >= 50 || (book.sellerScamScore ?? 0) >= 50) && (
            <div className="bg-red-50 border border-red-300 rounded-xl p-3.5 flex items-start gap-2.5 animate-pulse-subtle">
              <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-bold text-red-700 leading-tight">
                  ⚠️ Seller Trust Warning
                </p>
                <p className="text-[10px] text-red-600 leading-snug mt-1">
                  This seller has received multiple community reports. Any transaction between you and this seller is at your own risk and is <strong>not the responsibility of Campus Marketplace</strong>. We recommend exercising extra caution before proceeding.
                </p>
              </div>
            </div>
          )}

          <hr className="border-borderCustom" />

          {/* Description & Location */}
          <div className="flex flex-col gap-3">
            <div>
              <h3 className="font-bold text-xs text-textDark uppercase tracking-wider mb-1.5">Description</h3>
              <p className="text-xs text-muted leading-relaxed whitespace-pre-line">{book.description}</p>
            </div>
            
            <div className="flex flex-col gap-2.5 text-xs text-muted">
              {/* Course Info shown only for books & notes */}
              {(book.category === 'books' || book.category === 'notes') && book.department && (
                <div className="flex items-start gap-2">
                  <GraduationCap className="w-4.5 h-4.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>Recommended Course: Semester {book.semester} &middot; {book.department}</span>
                </div>
              )}

              {/* Dynamic Metadata Specifications Card */}
              {book.metadata && Object.keys(book.metadata).length > 0 && (
                <div className="bg-[#FAF8F5] p-3 rounded-xl border border-borderCustom flex flex-col gap-2 w-full my-1">
                  <h4 className="font-extrabold text-[10px] text-textDark uppercase tracking-wider">Specifications</h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {Object.entries(book.metadata).map(([k, v]) => {
                      if (['author', 'department', 'semester'].includes(k) && (book.category === 'books' || book.category === 'notes')) {
                        return null; // Shown elsewhere or already processed
                      }
                      const label = METADATA_LABELS[k] || k.charAt(0).toUpperCase() + k.slice(1);
                      const valStr = Array.isArray(v) ? v.join(', ') : String(v);
                      return (
                        <div key={k} className="flex flex-col min-w-0">
                          <span className="font-bold text-textDark text-[10px] tracking-wide uppercase">{label}</span>
                          <span className="text-muted leading-tight mt-0.5 break-words">{valStr}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2 mt-0.5">
                <MapPin className="w-4.5 h-4.5 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-textDark block">Pickup Spot</span>
                  <span className="text-[11px] block mt-0.5 leading-tight">{book.pickupLocation}</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex gap-2.5 mt-2">
            {user && user.id === book.sellerId ? (
              <button
                onClick={() => navigate('/my-listings')}
                className="bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-xs font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-1.5 flex-1 transition-colors shadow-subtle focus:outline-none"
              >
                <span>Manage My Listing</span>
              </button>
            ) : book.status === 'sold' ? (
              <div className="bg-slate-100 text-slate-400 text-xs font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-1.5 flex-1 border border-slate-200">
                <span>This Book Has Been Sold</span>
              </div>
            ) : (
              <>
                <button
                  onClick={handleContactSeller}
                  disabled={isContacting}
                  className="bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-xs font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-1.5 flex-1 transition-colors shadow-subtle focus:outline-none disabled:opacity-50"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{isContacting ? 'Opening Chat...' : 'Contact Seller'}</span>
                </button>
                
                <button
                  onClick={handleSaveToggle}
                  className={`w-11 h-11 rounded-lg border flex items-center justify-center shadow-subtle transition-colors focus:outline-none ${
                    saved
                      ? 'text-danger bg-red-50 border-red-200 hover:bg-red-100'
                      : 'text-muted border-borderCustom hover:text-textDark hover:bg-[#F5F3EF]'
                  }`}
                  title={saved ? 'Remove from saved' : 'Save to wishlist'}
                >
                  <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                </button>
              </>
            )}
          </div>

          {/* Safety Reminder */}
          <div className="bg-[#F5F3EF] p-3 rounded-xl border border-borderCustom text-[10px] text-muted flex items-start gap-2.5 mt-2">
            <ShieldAlert className="w-4.5 h-4.5 text-warning flex-shrink-0 mt-0.5" />
            <span className="leading-tight">Safety tip: Always meet in public, well-lit spaces to inspect books and complete transactions safely.</span>
          </div>
        </div>
      </div>

      {/* Similar Listings Section */}
      {similarBooks.length > 0 && (
        <section className="border-t border-borderCustom pt-10">
          <h2 className="text-base md:text-lg font-bold text-textDark mb-6">Similar Listings You Might Need</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {similarBooks.map(item => (
              <BookCard key={item.id} book={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
