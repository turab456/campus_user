import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, PlusCircle, Heart, User, BookOpen } from 'lucide-react';
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

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#FAF8F5] border-t border-borderCustom shadow-[0_-4px_12px_rgba(15,23,42,0.03)] z-40 safe-padding-bottom">
      <div className="flex items-center justify-around h-14">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-14 h-full text-center transition-colors ${
              isActive ? 'text-primary' : 'text-muted'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Home</span>
        </NavLink>

        <NavLink
          to="/search"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-14 h-full text-center transition-colors ${
              isActive ? 'text-primary' : 'text-muted'
            }`
          }
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Search</span>
        </NavLink>

        <NavLink
          to="/create-listing"
          onClick={(e) => handleProtectedAction(e, '/create-listing')}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-14 h-full text-center transition-colors ${
              isActive ? 'text-primary' : 'text-muted'
            }`
          }
        >
          <PlusCircle className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Sell</span>
        </NavLink>

        <NavLink
          to="/wishlist"
          onClick={(e) => handleProtectedAction(e, '/wishlist')}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-14 h-full text-center transition-colors relative ${
              isActive ? 'text-primary' : 'text-muted'
            }`
          }
        >
          <Heart className="w-5 h-5" />
          {savedBookIds.length > 0 && (
            <span className="bg-danger text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center absolute top-1 right-1.5 border border-white">
              {savedBookIds.length}
            </span>
          )}
          <span className="text-[10px] font-medium mt-1">Saved</span>
        </NavLink>

        <NavLink
          to="/profile"
          onClick={(e) => handleProtectedAction(e, '/profile')}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-14 h-full text-center transition-colors ${
              isActive ? 'text-primary' : 'text-muted'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Profile</span>
        </NavLink>
      </div>
    </div>
  );
};

