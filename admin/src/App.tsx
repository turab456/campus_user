import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { AdminNavbar } from './components/AdminNavbar';
import { AdminSidebar } from './components/AdminSidebar';
import { useAdminProtection } from './hooks/useAdminProtection';

// Pages
import { AdminLoginPage } from './pages/AdminLoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { ListingManagementPage } from './pages/ListingManagementPage';
import { FraudDetectionPage } from './pages/FraudDetectionPage';
import { SpamDetectionPage } from './pages/SpamDetectionPage';
import { ReconsiderationPage } from './pages/ReconsiderationPage';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isProtected, loading } = useAdminProtection();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isProtected ? <>{children}</> : <Navigate to="/login" replace />;
};

// Admin Layout
const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { admin } = useAdminAuth();

  if (!admin) {
    return (
      <Routes>
        <Route path="/login" element={<AdminLoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/admin" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute>
            <UserManagementPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/listings" element={
          <ProtectedRoute>
            <ListingManagementPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/fraud" element={
          <ProtectedRoute>
            <FraudDetectionPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/spam" element={
          <ProtectedRoute>
            <SpamDetectionPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/reconsideration" element={
          <ProtectedRoute>
            <ReconsiderationPage />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
};

function App() {
  return (
    <Router>
      <AdminAuthProvider>
        <AppContent />
      </AdminAuthProvider>
    </Router>
  );
}

export default App;
