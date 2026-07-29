import React from 'react';
import { Outlet, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoUrl from '../assets/logo.svg';

export const AuthLayout: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Show a blank loading state while fetching auth token from HttpOnly cookie
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to home if user is already authenticated
  if (user) {
    return <Navigate to="/home" replace />;
  }

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
