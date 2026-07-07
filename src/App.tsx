import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { LandingPage } from './pages/LandingPage';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { ListingDetailsPage } from './pages/ListingDetailsPage';
import { CreateListingPage } from './pages/CreateListingPage';
import { ProfilePage } from './pages/ProfilePage';
import { MyListingsPage } from './pages/MyListingsPage';
import { WishlistPage } from './pages/WishlistPage';
import { SettingsPage } from './pages/SettingsPage';
import { MessagesPage } from './pages/MessagesPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { useEffect, useState } from 'react';
import { backendApi } from './services/backendApi';
import { useToast } from './context/ToastContext';

const GlobalApiHandler = () => {
  const { showToast } = useToast();
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);

  useEffect(() => {
    backendApi.setOnRateLimit(() => {
      setShowRateLimitModal(true);
      showToast('Too many requests. Please wait a moment.', 'warning');
    });
  }, [showToast]);

  return (
    <>
      {showRateLimitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
            <h2 className="text-xl font-bold text-textDark mb-2 flex items-center gap-2">
              <span className="text-amber-500">⚠️</span> Slow Down
            </h2>
            <p className="text-sm text-muted mb-6">
              You are making too many requests. Please wait a moment before trying again.
            </p>
            <button
              onClick={() => setShowRateLimitModal(false)}
              className="w-full bg-primary text-white font-bold py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <ToastProvider>
          <GlobalApiHandler />
          <BrowserRouter>
            <Routes>
              {/* App Shell and General Pages */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/book/:id" element={<ListingDetailsPage />} />
                <Route path="/create-listing" element={<CreateListingPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/seller/:id" element={<ProfilePage />} />
                <Route path="/my-listings" element={<MyListingsPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/messages" element={<MessagesPage />} />
              </Route>

              {/* Centered Auth Layout Pages */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
              </Route>

              {/* Fallback 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;
export { App };
