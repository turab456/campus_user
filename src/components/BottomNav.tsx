import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, Plus, Heart, User } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

export const BottomNav: React.FC = () => {
  const { savedBookIds } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleProtectedAction = (e: React.MouseEvent, path: string) => {
    if (!user) {
      e.preventDefault();
      navigate('/login', { state: { returnTo: path } });
    }
  };

  const navItemClass = (isActive: boolean) =>
    `flex flex-col items-center justify-center gap-1 w-14 transition-all duration-200 ${
      isActive ? 'text-primary' : 'text-slate-400'
    }`;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(15,23,42,0.08)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-14 relative">

        {/* Home */}
        <NavLink to="/home" className={({ isActive }) => navItemClass(isActive)}>
          {({ isActive }) => (
            <>
              <Home className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.0 : 1.75} />
              <span className="text-[10px] font-semibold leading-none">Home</span>
            </>
          )}
        </NavLink>

        {/* Search */}
        <NavLink to="/search" className={({ isActive }) => navItemClass(isActive)}>
          {({ isActive }) => (
            <>
              <Search className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.0 : 1.75} />
              <span className="text-[10px] font-semibold leading-none">Search</span>
            </>
          )}
        </NavLink>

        {/* Sell FAB — elevated circle above the bar */}
        <div className="flex flex-col items-center justify-end pb-1" style={{ marginTop: '-1.25rem' }}>
          <NavLink
            to="/create-listing"
            onClick={(e) => handleProtectedAction(e, '/create-listing')}
            className={({ isActive }) =>
              `flex items-center justify-center w-12 h-12 rounded-full shadow-[0_4px_14px_rgba(124,58,237,0.35)] transition-all duration-200 active:scale-95 ${
                isActive ? 'bg-primary/90' : 'bg-primary hover:bg-primary/90'
              }`
            }
            aria-label="Sell an item"
          >
            <Plus className="w-6 h-6 text-white" strokeWidth={2.0} />
          </NavLink>
          <span className="text-[10px] font-semibold text-primary mt-1 leading-none">Sell</span>
        </div>

        {/* Saved */}
        <NavLink
          to="/wishlist"
          onClick={(e) => handleProtectedAction(e, '/wishlist')}
          className={({ isActive }) => `${navItemClass(isActive)} relative`}
        >
          {({ isActive }) => (
            <>
              <span className="relative">
                <Heart className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.0 : 1.75} />
                {savedBookIds.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">
                    {savedBookIds.length > 9 ? '9+' : savedBookIds.length}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-semibold leading-none">Saved</span>
            </>
          )}
        </NavLink>

        {/* Profile */}
        <NavLink
          to="/profile"
          onClick={(e) => handleProtectedAction(e, '/profile')}
          className={({ isActive }) => navItemClass(isActive)}
        >
          {({ isActive }) => (
            <>
              <User className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.0 : 1.75} />
              <span className="text-[10px] font-semibold leading-none">Profile</span>
            </>
          )}
        </NavLink>

      </div>
    </div>
  );
};
