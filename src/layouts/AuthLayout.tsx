import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import logoUrl from '../assets/logo.svg';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo */}
        <Link to="/" className="inline-flex items-center justify-center mb-6">
          <img src={logoUrl} alt="RevoShelf" className="h-[40px] w-auto object-contain" />
        </Link>
        <h2 className="text-xl font-extrabold text-textDark">Welcome to your student hub</h2>
        <p className="mt-1.5 text-xs text-muted">
          Exclusively for verified college students. Buy, sell, and save.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 border border-borderCustom shadow-premium rounded-2xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
