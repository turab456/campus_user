import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SEO } from './components/SEO';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { lazy, Suspense, useEffect, useState } from 'react';
import { backendApi } from './services/backendApi';
import { useToast } from './context/ToastContext';

// Lazy-loaded page components — each becomes its own JS chunk (improves LCP)
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const SearchPage = lazy(() => import('./pages/SearchPage').then(m => ({ default: m.SearchPage })));
const ListingDetailsPage = lazy(() => import('./pages/ListingDetailsPage').then(m => ({ default: m.ListingDetailsPage })));
const CreateListingPage = lazy(() => import('./pages/CreateListingPage').then(m => ({ default: m.CreateListingPage })));
const EditListingPage = lazy(() => import('./pages/EditListingPage').then(m => ({ default: m.EditListingPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const MyListingsPage = lazy(() => import('./pages/MyListingsPage').then(m => ({ default: m.MyListingsPage })));
const WishlistPage = lazy(() => import('./pages/WishlistPage').then(m => ({ default: m.WishlistPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const MessagesPage = lazy(() => import('./pages/MessagesPage').then(m => ({ default: m.MessagesPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage').then(m => ({ default: m.HowItWorksPage })));
const HelpCenterPage = lazy(() => import('./pages/HelpCenterPage').then(m => ({ default: m.HelpCenterPage })));
const FaqPage = lazy(() => import('./pages/FaqPage').then(m => ({ default: m.FaqPage })));
const ContactUsPage = lazy(() => import('./pages/ContactUsPage').then(m => ({ default: m.ContactUsPage })));
const SafetyTipsPage = lazy(() => import('./pages/SafetyTipsPage').then(m => ({ default: m.SafetyTipsPage })));
const ReportIssuePage = lazy(() => import('./pages/ReportIssuePage').then(m => ({ default: m.ReportIssuePage })));
const AboutUsPage = lazy(() => import('./pages/AboutUsPage').then(m => ({ default: m.AboutUsPage })));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const TermsConditionsPage = lazy(() => import('./pages/TermsConditionsPage').then(m => ({ default: m.TermsConditionsPage })));
const CommunityGuidelinesPage = lazy(() => import('./pages/CommunityGuidelinesPage').then(m => ({ default: m.CommunityGuidelinesPage })));



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
  let descType: 'home' | 'marketplace' | 'login' | 'signup' | 'profile' | 'category' | 'listing' | 'about' | 'contact' | 'faq' | 'privacy' | 'terms' | undefined = undefined;
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
    } else if (pathname === '/about') {
      descType = 'about';
    } else if (pathname === '/contact-us') {
      descType = 'contact';
    } else if (pathname === '/faq') {
      descType = 'faq';
    } else if (pathname === '/privacy') {
      descType = 'privacy';
    } else if (pathname === '/terms') {
      descType = 'terms';
    }
  }

  const publicIndexableRoutes = [
    '/',
    '/search',
    '/about',
    '/privacy',
    '/terms',
    '/community-guidelines',
    '/how-it-works',
    '/help-center',
    '/faq',
    '/contact-us',
    '/safety-tips'
  ];

  const isPublicIndexable = 
    publicIndexableRoutes.includes(pathname) || 
    pathname.startsWith('/book/') || 
    pathname.startsWith('/seller/');

  const meta = !isPublicIndexable 
    ? [{ name: 'robots', content: 'noindex, nofollow' }] 
    : [];

  return <SEO title={title} descriptionType={descType} descriptionDetails={descDetails} url={pathname} meta={meta} />;
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
              <Suspense fallback={null}>
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

                    {/* Static / SEO Pages */}
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
              </Suspense>
            </BrowserRouter>
          </ToastProvider>
        </WishlistProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
export { App };
