import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SEO } from './components/SEO';
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
import { EditListingPage } from './pages/EditListingPage';
import { ProfilePage } from './pages/ProfilePage';
import { MyListingsPage } from './pages/MyListingsPage';
import { WishlistPage } from './pages/WishlistPage';
import { SettingsPage } from './pages/SettingsPage';
import { MessagesPage } from './pages/MessagesPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { HelpCenterPage } from './pages/HelpCenterPage';
import { FaqPage } from './pages/FaqPage';
import { ContactUsPage } from './pages/ContactUsPage';
import { SafetyTipsPage } from './pages/SafetyTipsPage';
import { ReportIssuePage } from './pages/ReportIssuePage';
import { AboutUsPage } from './pages/AboutUsPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsConditionsPage } from './pages/TermsConditionsPage';
import { CommunityGuidelinesPage } from './pages/CommunityGuidelinesPage';

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

const PATH_TITLES: Record<string, string> = {
  '/': 'RevoShelf | Buy & Sell College Essentials',
  '/home': 'RevoShelf | Buy & Sell College Essentials',
  '/search': 'Marketplace | RevoShelf',
  '/create-listing': 'Post a Listing | RevoShelf',
  '/profile': 'My Profile | RevoShelf',
  '/my-listings': 'My Listings | RevoShelf',
  '/wishlist': 'My Wishlist | RevoShelf',
  '/settings': 'Settings | RevoShelf',
  '/messages': 'Messages | RevoShelf',
  '/login': 'Login | RevoShelf',
  '/register': 'Create Account | RevoShelf',
  '/forgot-password': 'Forgot Password | RevoShelf',
  '/reset-password': 'Reset Password | RevoShelf',
  '/verify-email': 'Verify Email | RevoShelf',
  '/how-it-works': 'How It Works | RevoShelf',
  '/help-center': 'Help Center | RevoShelf',
  '/faq': 'FAQ | RevoShelf',
  '/contact-us': 'Contact Us | RevoShelf',
  '/safety-tips': 'Safety Tips | RevoShelf',
  '/report-issue': 'Report an Issue | RevoShelf',
  '/about': 'About Us | RevoShelf',
  '/privacy': 'Privacy Policy | RevoShelf',
  '/terms': 'Terms & Conditions | RevoShelf',
  '/community-guidelines': 'Community Guidelines | RevoShelf',
};

const PageTitleManager = () => {
  const location = useLocation();
  const { pathname } = location;

  let title = 'RevoShelf';
  let descType: 'home' | 'marketplace' | 'login' | 'signup' | 'profile' | 'category' | 'listing' | undefined = undefined;
  let descDetails: string | undefined = undefined;

  if (pathname.startsWith('/edit-listing/')) {
    title = 'Edit Listing | RevoShelf';
  } else if (pathname.startsWith('/book/')) {
    title = 'Listing Details | RevoShelf'; // Fallback before listing loaded
    descType = 'listing';
  } else if (pathname.startsWith('/seller/')) {
    title = 'Seller Profile | RevoShelf'; // Fallback before seller loaded
    descType = 'profile';
  } else {
    title = PATH_TITLES[pathname] || 'RevoShelf';
    if (pathname === '/' || pathname === '/home') {
      descType = 'home';
    } else if (pathname === '/search') {
      descType = 'marketplace';
    } else if (pathname === '/login') {
      descType = 'login';
    } else if (pathname === '/register') {
      descType = 'signup';
    } else if (pathname === '/profile') {
      descType = 'profile';
      descDetails = 'my account';
    }
  }

  return <SEO title={title} descriptionType={descType} descriptionDetails={descDetails} url={pathname} />;
};

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <WishlistProvider>
          <ToastProvider>
            <GlobalApiHandler />
            <BrowserRouter>
              <PageTitleManager />
              <Routes>
                {/* App Shell and General Pages */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/book/:id" element={<ListingDetailsPage />} />
                  <Route path="/create-listing" element={<CreateListingPage />} />
                  <Route path="/edit-listing/:id" element={<EditListingPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/seller/:id" element={<ProfilePage />} />
                  <Route path="/my-listings" element={<MyListingsPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/messages" element={<MessagesPage />} />
                  
                  {/* Static Pages */}
                  <Route path="/how-it-works" element={<HowItWorksPage />} />
                  <Route path="/help-center" element={<HelpCenterPage />} />
                  <Route path="/faq" element={<FaqPage />} />
                  <Route path="/contact-us" element={<ContactUsPage />} />
                  <Route path="/safety-tips" element={<SafetyTipsPage />} />
                  <Route path="/report-issue" element={<ReportIssuePage />} />
                  <Route path="/about" element={<AboutUsPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms" element={<TermsConditionsPage />} />
                  <Route path="/community-guidelines" element={<CommunityGuidelinesPage />} />
                </Route>

                {/* Centered Auth Layout Pages */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/verify-email" element={<VerifyEmailPage />} />
                </Route>

                {/* Fallback 404 Route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </WishlistProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
export { App };
