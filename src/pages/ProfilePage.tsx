import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, GraduationCap, MapPin, Star, BookOpen, ShieldAlert } from 'lucide-react';
import { backendApi as api } from '../services/backendApi';
import type { Book, User, Review } from '../types';
import { BookCard } from '../components/BookCard';
import { CardSkeleton } from '../components/SkeletonLoader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  
  const [user, setUser] = useState<User | null>(null);
  const [listings, setListings] = useState<Book[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHover, setReviewHover] = useState<number | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Appeal & Danger Zone states
  const [tickets, setTickets] = useState<any[]>([]);
  const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);
  const [appealReason, setAppealReason] = useState('');
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);

  const isOwnProfile = currentUser?.id === user?.id;

  const fetchAppeals = async () => {
    try {
      const res = await api.getReconsiderationStatus();
      if (res && res.success) {
        setTickets(res.tickets);
      }
    } catch (err) {
      console.error('Error fetching appeals status', err);
    }
  };

  useEffect(() => {
    if (isOwnProfile && user) {
      fetchAppeals();
    }
  }, [isOwnProfile, user]);

  const handleAppealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealReason.trim()) {
      showToast('Please specify a reason for reconsideration.', 'warning');
      return;
    }
    setIsSubmittingAppeal(true);
    try {
      const res = await api.createReconsiderationTicket(appealReason.trim());
      if (res && res.success) {
        showToast('Appeal ticket submitted successfully!', 'success');
        setAppealReason('');
        setIsAppealModalOpen(false);
        fetchAppeals();
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to submit appeal. Please try again.', 'danger');
    } finally {
      setIsSubmittingAppeal(false);
    }
  };

  // If no ID is passed, load the logged in user profile
  const profileId = id || currentUser?.id;

  useEffect(() => {
    if (!profileId) {
      setIsLoading(false);
      return;
    }
    const loadProfileData = async () => {
      setIsLoading(true);
      try {
        const data = await api.getSellerDetails(profileId);
        if (data) {
          setUser(data.user);
          setReviews(data.reviews);
          // Show active status listings only
          setListings(data.listings.filter(b => b.status === 'active'));
        }
      } catch (err) {
        console.error('Error fetching profile data', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfileData();
  }, [profileId]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId || !user) return;
    if (!reviewComment.trim()) {
      showToast('Please type a comment for your review.', 'warning');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const newReview = await api.addReview(profileId, reviewRating, reviewComment.trim());
      setReviews(prev => [newReview, ...prev]);
      
      setUser(prev => {
        if (!prev) return prev;
        const newCount = prev.reviewsCount + 1;
        const oldSum = (prev.rating || 5.0) * (prev.reviewsCount || 0);
        const newSum = oldSum + reviewRating;
        const newAvg = Number((newSum / newCount).toFixed(1));
        return {
          ...prev,
          reviewsCount: newCount,
          rating: newAvg
        };
      });

      setReviewComment('');
      setReviewRating(5);
      showToast('Thank you! Your review has been submitted successfully.', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to submit review. Please try again.', 'danger');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (!profileId) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 flex flex-col items-center gap-4 bg-white border border-borderCustom rounded-2xl shadow-subtle my-8">
        <ShieldAlert className="w-12 h-12 text-primary" />
        <h2 className="text-lg font-bold text-textDark">Sign in to view your profile</h2>
        <p className="text-xs text-muted">You must be logged in to view your account details and active listings.</p>
        <Link to="/login" className="mt-2 bg-primary text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-primary-hover focus:outline-none">
          Sign In
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse max-w-4xl mx-auto py-4">
        <div className="h-40 bg-slate-200 rounded-2xl" />
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-44 bg-slate-200 rounded-xl" />
          <div className="h-44 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-16 px-4">
        <h2 className="text-lg font-bold text-textDark">Student Profile Not Found</h2>
        <p className="text-xs text-muted mt-1">This user account may have been disabled or deleted.</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      {/* Profile Header Card */}
      <section className="bg-white border border-borderCustom rounded-2xl p-5 md:p-8 shadow-subtle flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-primary/20 object-cover"
        />
        
        <div className="flex-1 flex flex-col gap-3 min-w-0 w-full">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-xl md:text-2xl font-extrabold text-textDark tracking-tight leading-tight truncate">
                {user.name}
              </h1>
              {isOwnProfile && (
                <span className="inline-block self-center bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/15">
                  My Profile
                </span>
              )}
            </div>
            <p className="text-xs text-muted font-medium mt-1 truncate">{user.email}</p>
          </div>

          {/* College details info */}
          <div className="flex flex-col gap-1.5 text-xs text-muted">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="truncate">{user.college}</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <GraduationCap className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="truncate">{user.department} &middot; Semester {user.semester}</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>Joined {formatDate(user.joinedDate)}</span>
            </div>
          </div>

          {/* Star Rating details */}
          <div className="flex items-center justify-center sm:justify-start gap-4 mt-1 bg-slate-50 border border-borderCustom rounded-xl p-3 w-fit self-center sm:self-start">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-warning fill-current" />
              <span className="text-sm font-extrabold text-textDark">{user.rating.toFixed(1)}</span>
            </div>
            <div className="w-px h-4 bg-slate-300" />
            <div className="text-xs text-muted font-medium">
              <span className="text-textDark font-bold">{user.reviewsCount}</span> Reviews
            </div>
          </div>
        </div>

        {isOwnProfile && (
            <div className="flex gap-2">
              <Link
                to="/settings"
                className="border border-borderCustom hover:bg-slate-50 text-textDark text-xs font-bold px-4 py-2.5 rounded-full transition-colors flex-shrink-0 focus:outline-none"
              >
                Edit Profile
              </Link>
              <Link
                to="/my-listings"
                className="border border-borderCustom hover:bg-slate-50 text-primary text-xs font-bold px-4 py-2.5 rounded-full transition-colors flex-shrink-0 focus:outline-none"
              >
                My Listings
              </Link>
            </div>
          )}
      </section>

      {/* Danger Zone Warning Banner */}
      {isOwnProfile && (user.spamScore! > 0 || user.scamScore! > 0 || user.blocked || user.flagged) && (
        <section className="bg-red-50 border border-red-200 rounded-2xl p-5 md:p-6 shadow-subtle flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="text-sm font-bold text-red-800">Warning: Your Account is in the Danger Zone</h2>
              <p className="text-xs text-red-700 mt-1 leading-relaxed">
                Our auto-moderation systems have flagged your account due to guideline violations. 
                Repeated offenses (reaching a score of 75+) will result in automatic account suspension.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white border border-red-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-textDark">Spam Score</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  user.spamScore! >= 50 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>{user.spamScore}/100</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-textDark">Scam / Fraud Score</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  user.scamScore! >= 50 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>{user.scamScore}/100</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-red-100 pt-4">
            <div className="text-[11px] text-red-600">
              {user.blocked ? 'Your account is currently suspended.' : 'Submit a reconsideration request if you believe this was an error.'}
            </div>
            <button
              onClick={() => setIsAppealModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors w-fit focus:outline-none"
            >
              Raise Reconsideration Ticket
            </button>
          </div>

          {/* Appeal Tickets List */}
          {tickets.length > 0 && (
            <div className="border-t border-red-100 pt-4 flex flex-col gap-3">
              <h3 className="text-xs font-bold text-red-800">Your Appeal Requests</h3>
              <div className="flex flex-col gap-2">
                {tickets.map((ticket) => (
                  <div key={ticket._id} className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-textDark flex flex-col gap-1.5 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-500">Appeal Date: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ticket.status === 'approved' ? 'bg-green-100 text-green-800' :
                        ticket.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>{ticket.status.toUpperCase()}</span>
                    </div>
                    <p className="text-muted leading-relaxed italic">" {ticket.reason} "</p>
                    {ticket.adminComment && (
                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 mt-1 text-[11px]">
                        <span className="font-bold text-textDark">Admin Response:</span> {ticket.adminComment}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Tabs list (Listings / Reviews) */}
      <div className="flex border-b border-borderCustom">
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-5 py-3 text-xs font-bold border-b-2 -mb-px transition-colors ${
            activeTab === 'listings'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted hover:text-textDark'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            <span>Active Listings ({listings.length})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-5 py-3 text-xs font-bold border-b-2 -mb-px transition-colors ${
            activeTab === 'reviews'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted hover:text-textDark'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4" />
            <span>Reviews ({reviews.length})</span>
          </div>
        </button>
      </div>

      {/* Listings Tab View */}
      {activeTab === 'listings' && (
        <div>
          {listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {listings.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-borderCustom rounded-2xl bg-white/50">
              <p className="text-xs text-muted">No active listings posted yet.</p>
              {isOwnProfile && (
                <Link to="/create-listing" className="mt-4 inline-block bg-primary text-white text-xs font-semibold py-2 px-4 rounded-full">
                  List Your First Book
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {/* Reviews Tab View */}
      {activeTab === 'reviews' && (
        <div className="flex flex-col gap-6">
          {/* Write a Review Form */}
          {currentUser && !isOwnProfile && (
            <form onSubmit={handleReviewSubmit} className="bg-white border border-borderCustom rounded-2xl p-5 md:p-6 shadow-subtle flex flex-col gap-4">
              <div>
                <h3 className="font-bold text-sm text-textDark">Share your trading experience</h3>
                <p className="text-[11px] text-muted mt-0.5">Help the campus build trust. How was exchanging books with {user.name}?</p>
              </div>

              {/* Star Rating Select */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-textDark">Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      onMouseEnter={() => setReviewHover(star)}
                      onMouseLeave={() => setReviewHover(null)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= (reviewHover || reviewRating)
                            ? 'text-warning fill-current'
                            : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment Text Input */}
              <div className="flex flex-col gap-1.5">
                <textarea
                  rows={3}
                  placeholder={`Write your review... (e.g. "Quick response, book condition was exactly as described!")`}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-[#F5F3EF] border border-borderCustom rounded-[10px] p-3 text-xs text-textDark placeholder-muted focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-xs font-semibold px-4 py-2.5 rounded-lg w-fit transition-colors shadow-subtle disabled:opacity-50"
              >
                {isSubmittingReview ? 'Submitting Review...' : 'Submit Review'}
              </button>
            </form>
          )}

          {/* Reviews List */}
          <div className="flex flex-col gap-4">
            {reviews.length > 0 ? (
              reviews.map(review => (
              <div
                key={review.id}
                className="bg-white border border-borderCustom rounded-xl p-4 md:p-5 flex gap-4 items-start shadow-subtle"
              >
                <img
                  src={review.reviewerAvatar}
                  alt={review.reviewerName}
                  className="w-8 h-8 rounded-full object-cover border border-borderCustom flex-shrink-0"
                />
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-textDark">{review.reviewerName}</span>
                    <span className="text-[10px] text-muted font-medium">
                      {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  
                  {/* Star row */}
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < review.rating ? 'text-warning fill-current' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-xs text-muted leading-relaxed mt-1">{review.comment}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 border border-dashed border-borderCustom rounded-2xl bg-white/50">
              <p className="text-xs text-muted">No review ratings received yet.</p>
            </div>
          )}
        </div>
      </div>
    )}
    {/* Appeal Reconsideration Modal */}
    {isAppealModalOpen && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white border border-borderCustom rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
          <div>
            <h3 className="text-base font-bold text-textDark">Raise a Reconsideration Ticket</h3>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Explain why your violation score should be cleared. Provide any context or proof of honest transactions.
            </p>
          </div>

          <form onSubmit={handleAppealSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-textDark uppercase tracking-wider">Explanation / Reasons</label>
              <textarea
                rows={4}
                placeholder="Explain why this block or warning should be reconsidered..."
                value={appealReason}
                onChange={(e) => setAppealReason(e.target.value)}
                className="w-full bg-[#F5F3EF] border border-borderCustom rounded-xl p-3 text-xs text-textDark placeholder-muted focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-none"
                required
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-borderCustom pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsAppealModalOpen(false);
                  setAppealReason('');
                }}
                className="px-4 py-2 border border-borderCustom rounded-lg text-xs font-bold text-textDark hover:bg-slate-50 focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingAppeal}
                className="px-5 py-2 bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 focus:outline-none"
              >
                {isSubmittingAppeal ? 'Submitting Appeal...' : 'Submit Appeal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
  );
};
