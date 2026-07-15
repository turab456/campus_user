import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Heart, MessageSquare, Plus, User as UserIcon, LogOut, Settings, BookOpen, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { NotificationBell } from './NotificationBell';
import logoUrl from '../assets/logo.svg';

export const Navbar: React.FC = () => {
  const { user, logout, unreadChatCount } = useAuth();
  const { savedBookIds } = useWishlist();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActive = (path: string) => location.pathname === path;


  return (
    <nav className="bg-[#FAF8F5] border-b border-borderCustom sticky top-0 z-40 px-4 md:px-8 h-16 md:h-[72px] flex items-center">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center flex-shrink-0">
          <img 
            src={logoUrl}
            alt="RevoShelf" 
            className="w-auto object-contain h-[28px] min-[361px]:h-[32px] md:h-[36px] lg:h-[40px]" 
          />
        </Link>

        {/* Desktop Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-md relative mx-4">
          <Search className="w-4 h-4 text-muted absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search books, authors, or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F5F3EF] border border-borderCustom rounded-[10px] py-2 pl-9 pr-4 text-sm text-textDark placeholder-muted focus:border-primary transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </form>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-5">
          <Link
            to="/home"
            className={`text-sm font-medium transition-colors ${isActive('/home') ? 'text-primary' : 'text-muted hover:text-textDark'
              }`}
          >
            Browse
          </Link>

          {user && (
            <>
              <Link
                to="/wishlist"
                className={`text-sm font-medium transition-colors flex items-center gap-1.5 relative ${isActive('/wishlist') ? 'text-primary' : 'text-muted hover:text-textDark'
                  }`}
              >
                <Heart className="w-4 h-4" />
                <span>Saved</span>
                {savedBookIds.length > 0 && (
                  <span className="bg-danger text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center absolute -top-2.5 -right-2">
                    {savedBookIds.length}
                  </span>
                )}
              </Link>

              <Link
                to="/messages"
                className={`text-sm font-medium transition-colors flex items-center gap-1.5 relative ${isActive('/messages') ? 'text-primary' : 'text-muted hover:text-textDark'
                  }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chats</span>
                {unreadChatCount > 0 && (
                  <span className="bg-danger text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center absolute -top-2.5 -right-2">
                    {unreadChatCount}
                  </span>
                )}
              </Link>

              <NotificationBell />
            </>
          )}

          <Link
            to="/create-listing"
            className="bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-subtle"
          >
            <Plus className="w-4 h-4" />
            <span>Sell Book</span>
          </Link>

          {/* Profile Dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/25 rounded-full p-0.5"
              >
                <img
                  key={user.avatar}
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-borderCustom object-cover"
                />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2.5 w-56 bg-white border border-borderCustom rounded-xl shadow-premium z-20 overflow-hidden py-1">
                    <div className="px-4 py-3 border-b border-borderCustom">
                      <p className="text-sm font-semibold text-textDark truncate">{user.name}</p>
                      <p className="text-xs text-muted truncate mt-0.5">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-textDark hover:bg-background transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-muted" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      to="/my-listings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-textDark hover:bg-background transition-colors"
                    >
                      <BookOpen className="w-4 h-4 text-muted" />
                      <span>My Listings</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-textDark hover:bg-background transition-colors"
                    >
                      <Settings className="w-4 h-4 text-muted" />
                      <span>Account Settings</span>
                    </Link>
                    <hr className="border-borderCustom my-1" />
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm text-danger hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="border border-borderCustom hover:bg-background text-textDark text-sm font-medium px-4 py-2 rounded-full transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Header / Minimal Navigation */}
        <div className="flex md:hidden items-center gap-3">
          {user ? (
            <Link to="/profile" className="flex items-center">
              <img
                key={user.avatar}
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-full border border-borderCustom object-cover"
              />
            </Link>
          ) : (
            <Link to="/login" className="text-xs font-semibold text-primary">
              Sign In
            </Link>
          )}
          {user && (
            <>
              <NotificationBell />
              <Link to="/messages" className="text-muted hover:text-textDark p-1.5 rounded-full relative" title="Chats">
                <MessageSquare className="w-5 h-5" />
                {unreadChatCount > 0 && (
                  <span className="bg-danger text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center absolute top-0 right-0 border border-white">
                    {unreadChatCount}
                  </span>
                )}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
