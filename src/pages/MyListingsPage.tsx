import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Trash2, Tag, Archive } from 'lucide-react';
import { backendApi as api } from '../services/backendApi';
import type { Book } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CardSkeleton } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';

export const MyListingsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeListings, setActiveListings] = useState<Book[]>([]);
  const [soldListings, setSoldListings] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'sold'>('active');

  // Buyer selection modal states
  const [selectedBook, setSelectedBook] = useState<{ id: string; title: string } | null>(null);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('');
  const [showBuyerModal, setShowBuyerModal] = useState(false);
  const [isSubmittingSale, setIsSubmittingSale] = useState(false);

  const fetchUserListings = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const details = await api.getSellerDetails(user.id);
      if (details) {
        // Display active and pending listings in active tab
        setActiveListings(details.listings.filter(b => b.status === 'active' || b.status === 'pending'));
        setSoldListings(details.listings.filter(b => b.status === 'sold'));
      }
    } catch (err) {
      console.error('Error fetching user listings', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserListings();
  }, [user]);

  const handleMarkAsSold = async (id: string, title: string) => {
    try {
      const chats = await api.getChatsForBook(id);
      if (chats.length === 0) {
        // Direct mark as sold since no one has messaged yet
        await api.markAsSold(id);
        showToast(`Marked "${title}" as sold!`, 'success');
        fetchUserListings();
      } else {
        // Prompt for buyer selection modal
        setInquiries(chats.map(c => ({
          userId: c.buyerId,
          userName: c.otherParticipant.name,
          userAvatar: c.otherParticipant.avatar,
          chatId: c.id
        })));
        setSelectedBook({ id, title });
        setSelectedBuyerId(chats[0].buyerId); // Default to first inquirer
        setShowBuyerModal(true);
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to process mark as sold.', 'danger');
    }
  };

  const handleConfirmPendingSale = async () => {
    if (!selectedBook || !selectedBuyerId) return;
    setIsSubmittingSale(true);
    try {
      await api.markAsSold(selectedBook.id, selectedBuyerId);
      showToast(`Sale pending buyer confirmation for "${selectedBook.title}"!`, 'success');
      setShowBuyerModal(false);
      setSelectedBook(null);
      setInquiries([]);
      fetchUserListings();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to register pending sale.', 'danger');
    } finally {
      setIsSubmittingSale(false);
    }
  };

  const handleCancelPendingSale = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to cancel the pending sale for "${title}"?`)) return;
    try {
      await api.cancelPendingSale(id);
      showToast(`Pending sale canceled for "${title}"`, 'success');
      fetchUserListings();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to cancel pending sale.', 'danger');
    }
  };

  const handleDeleteListing = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete the listing "${title}"?`)) return;
    try {
      await api.deleteListing(id);
      showToast(`Deleted listing "${title}"`, 'success');
      fetchUserListings();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete listing. Try again.', 'danger');
    }
  };

  const renderListingItem = (book: Book) => (
    <div
      key={book.id}
      className="bg-white border border-borderCustom rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-subtle hover:border-slate-300 transition-colors"
    >
      <div className="flex gap-3.5 items-center min-w-0 flex-1">
        <img
          src={book.images[0]}
          alt={book.title}
          className="w-16 h-16 rounded-lg border border-borderCustom object-cover flex-shrink-0"
        />
        <div className="min-w-0">
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{book.category}</span>
          <Link to={`/book/${book.id}`} className="block font-bold text-sm text-textDark hover:text-primary transition-colors leading-snug truncate">
            {book.title}
          </Link>
          <p className="text-[11px] text-muted leading-none mt-1">by {book.author}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-bold text-textDark">₹{book.price}</span>
            <span className="text-[10px] bg-slate-100 text-muted border border-borderCustom px-1.5 py-0.5 rounded">
              {book.condition}
            </span>
          </div>
        </div>
      </div>

      {book.status === 'active' ? (
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleMarkAsSold(book.id, book.title)}
            className="flex-1 sm:flex-initial bg-white border border-green-200 text-green-700 hover:bg-green-50 transition-colors text-xs font-bold px-3.5 py-2 rounded-lg flex items-center justify-center gap-1 focus:outline-none"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Mark Sold</span>
          </button>
          
          <button
            onClick={() => handleDeleteListing(book.id, book.title)}
            className="bg-white border border-red-200 text-danger hover:bg-red-50 transition-colors p-2 rounded-lg flex items-center justify-center focus:outline-none"
            title="Delete Listing"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : book.status === 'pending' ? (
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[10px] bg-yellow-50 text-yellow-800 font-bold px-2.5 py-1.5 rounded-lg border border-yellow-200 cursor-default">
            Pending Confirmation
          </span>
          <button
            onClick={() => handleCancelPendingSale(book.id, book.title)}
            className="flex-1 sm:flex-initial bg-white border border-red-200 text-danger hover:bg-red-50 transition-colors text-xs font-bold px-3.5 py-2 rounded-lg flex items-center justify-center gap-1 focus:outline-none"
          >
            <span>Cancel Sale</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-xs text-muted font-semibold bg-slate-50 border border-borderCustom px-3 py-1.5 rounded-lg">
          <Archive className="w-3.5 h-3.5 text-slate-400" />
          <span>Sold</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-textDark tracking-tight">Manage My Listings</h1>
        <p className="text-xs text-muted mt-1">Update listings, close sold books, and check archive history.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-borderCustom">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 -mb-px transition-colors ${
            activeTab === 'active' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-textDark'
          }`}
        >
          Active Listings ({activeListings.length})
        </button>
        <button
          onClick={() => setActiveTab('sold')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 -mb-px transition-colors ${
            activeTab === 'sold' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-textDark'
          }`}
        >
          Sold / History ({soldListings.length})
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map(n => (
            <div key={n} className="flex gap-4 border border-borderCustom rounded-xl p-4 bg-white animate-pulse">
              <div className="w-16 h-16 bg-slate-200 rounded-lg" />
              <div className="flex-1 flex flex-col gap-2 mt-1">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {activeTab === 'active' ? (
            activeListings.length > 0 ? (
              activeListings.map(renderListingItem)
            ) : (
              <EmptyState
                type="listings"
                title="No Active Listings"
                description="You haven't posted any items for sale yet. Turn your old books, calculators, and lab tools into cash."
                actionText="List a Book Now"
                onAction={() => {}}
              />
            )
          ) : (
            soldListings.length > 0 ? (
              soldListings.map(renderListingItem)
            ) : (
              <EmptyState
                type="listings"
                title="No Sales History"
                description="Listings you mark as sold or archive will appear in this history log."
              />
            )
          )}
        </div>
      )}
      {/* Select Buyer Modal */}
      {showBuyerModal && selectedBook && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-borderCustom rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
            <div>
              <h3 className="text-base font-bold text-textDark">Who did you sell this to?</h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Select the student you completed this trade with. We will request them to confirm they received the book.
              </p>
            </div>

            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto py-1">
              {inquiries.map((inquiry) => (
                <label
                  key={inquiry.userId}
                  className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                    selectedBuyerId === inquiry.userId
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-borderCustom hover:bg-slate-50'
                  }`}
                  onClick={() => setSelectedBuyerId(inquiry.userId)}
                >
                  <input
                    type="radio"
                    name="selectedBuyer"
                    value={inquiry.userId}
                    checked={selectedBuyerId === inquiry.userId}
                    onChange={() => setSelectedBuyerId(inquiry.userId)}
                    className="sr-only"
                  />
                  <img
                    src={inquiry.userAvatar}
                    alt={inquiry.userName}
                    className="w-9 h-9 rounded-full object-cover border border-borderCustom"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-textDark truncate">{inquiry.userName}</p>
                    <p className="text-[10px] text-muted truncate mt-0.5">Chatted about "{selectedBook.title}"</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 border-t border-borderCustom pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowBuyerModal(false);
                  setSelectedBook(null);
                  setInquiries([]);
                }}
                className="px-4 py-2 border border-borderCustom rounded-lg text-xs font-bold text-textDark hover:bg-slate-50 focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingSale || !selectedBuyerId}
                onClick={handleConfirmPendingSale}
                className="px-5 py-2 bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 focus:outline-none"
              >
                {isSubmittingSale ? 'Confirming...' : 'Mark as Sold'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
