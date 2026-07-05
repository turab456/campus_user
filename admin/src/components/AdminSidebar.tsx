import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  AlertTriangle,
  MessageSquare,
  ShieldCheck,
  X
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen = true, onClose }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/users', label: 'User Management', icon: Users },
    { path: '/admin/listings', label: 'Listing Management', icon: Package },
    { path: '/admin/fraud', label: 'Fraud Detection', icon: AlertTriangle },
    { path: '/admin/spam', label: 'Spam & Scam', icon: MessageSquare },
    { path: '/admin/reconsideration', label: 'Appeals Review', icon: ShieldCheck },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {!isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="md:hidden p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => onClose?.()}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm
                transition-colors duration-200
                ${isActive(path)
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <Icon size={20} />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
};
