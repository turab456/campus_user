import React from 'react';
import { LogOut, Menu } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

interface AdminNavbarProps {
  onMenuClick?: () => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ onMenuClick }) => {
  const { admin, logout } = useAdminAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-3">
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu size={20} />
              </button>
            )}
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="text-gray-900 font-medium">{admin?.name}</p>
              <p className="text-gray-500 text-xs">{admin?.email}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
