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
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <ToastProvider>
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
