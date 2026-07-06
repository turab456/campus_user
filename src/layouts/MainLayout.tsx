import React, { useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { BottomNav } from '../components/BottomNav';
import { usePWA } from '../hooks/usePWA';
import { useFcm } from '../hooks/useFcm';
import { Info, RefreshCw, WifiOff, BookOpen, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { initSocket, disconnectSocket } from '../services/socket';

const LinkedInIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export const MainLayout: React.FC = () => {
  const { swUpdateAvailable, isOffline, reloadApp } = usePWA();
  const location = useLocation();
  const { user } = useAuth();
  const { showToast } = useToast();

  // Register FCM Web Push notifications
  useFcm();

  useEffect(() => {
    if (user) {
      const socket = initSocket(user.id);

      socket.on('notification', (data: { type: string; title: string; body: string; chatId?: string }) => {
        // Show notification toast only if user is not on the messages page
        const isMessagesPage = window.location.pathname.startsWith('/messages');
        if (data.type === 'review') {
          showToast(`⭐️ ${data.title}: ${data.body}`, 'success');
        } else if (!isMessagesPage) {
          showToast(`📩 ${data.title}: "${data.body}"`, 'info');
        }
      });

      return () => {
        disconnectSocket();
      };
    } else {
      disconnectSocket();
    }
  }, [user, showToast]);

  // Show footer only on landing page
  const hideFooter = location.pathname !== '/';

  const isMessagesPage = location.pathname.startsWith('/messages');

  return (
    <div className={`flex flex-col bg-background ${
      isMessagesPage ? 'h-screen h-[100dvh] overflow-hidden pb-14 md:pb-0' : 'min-h-screen pb-24 md:pb-0'
    }`}>
      {/* Top Navigation */}
      <div className={isMessagesPage ? 'hidden md:block' : ''}>
        <Navbar />
      </div>

      {/* Offline Status Alert */}
      {isOffline && (
        <div className="bg-amber-500 text-white text-xs text-center py-1.5 px-4 font-semibold flex items-center justify-center gap-1.5 z-50">
          <WifiOff className="w-4 h-4" />
          <span>You are currently offline. Using cached listings and features.</span>
        </div>
      )}

      {/* PWA Update Ready Alert */}
      {swUpdateAvailable && (
        <div className="fixed bottom-16 left-4 right-4 md:bottom-6 md:right-6 md:left-auto max-w-sm bg-primary text-white p-4 rounded-xl shadow-lg border border-primary/20 z-50 flex flex-col gap-2.5">
          <div className="flex gap-2.5">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">App Update Available</h4>
              <p className="text-xs text-white/90 mt-0.5">A new version of Campus Marketplace is ready with enhancements.</p>
            </div>
          </div>
          <button
            onClick={reloadApp}
            className="bg-white text-primary text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Update Now</span>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 w-full max-w-7xl mx-auto ${
        isMessagesPage ? 'px-0 py-0 md:py-4 flex flex-col min-h-0 h-full' : 'px-4 md:px-8 py-6'
      }`}>
        <Outlet />
      </main>

      {/* Footer (Desktop & standard pages) */}
      {!hideFooter && (
        <footer className="bg-[#FAF8F5] border-t border-borderCustom py-14 md:py-16 px-4 md:px-8 mt-12 w-full">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {/* Column 1 */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="bg-primary p-1.5 rounded-lg text-white">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-textDark tracking-tight">Campus Marketplace</span>
              </div>
              <p className="text-xs text-textSec leading-relaxed">
                Buy and sell used books with students from your college. Safe, affordable, and campus-focused.
              </p>
              <div className="flex flex-col gap-2 mt-2">
                {[
                  'Verified Students',
                  'Secure Messaging',
                  'Campus Pickup'
                ].map((badge) => (
                  <div key={badge} className="flex items-center gap-1.5 text-[10px] font-medium text-textSec">
                    <span className="text-[#16A34A] text-xs">✓</span>
                    <span>{badge}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold text-textDark uppercase tracking-wider">Marketplace</h4>
              <div className="flex flex-col gap-2 text-xs text-textSec">
                <Link to="/home" className="hover:text-primary hover:underline transition-colors">Browse Books</Link>
                <Link to="/create-listing" className="hover:text-primary hover:underline transition-colors">Sell a Book</Link>
                <Link to="/home" className="hover:text-primary hover:underline transition-colors">Categories</Link>
                <Link to="/#how-it-works" className="hover:text-primary hover:underline transition-colors">How It Works</Link>
                <Link to="/home" className="hover:text-primary hover:underline transition-colors">Recently Added</Link>
              </div>
            </div>

            {/* Column 3 */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold text-textDark uppercase tracking-wider">Support</h4>
              <div className="flex flex-col gap-2 text-xs text-textSec">
                <Link to="/about" className="hover:text-primary hover:underline transition-colors">Help Center</Link>
                <Link to="/#faq" className="hover:text-primary hover:underline transition-colors">Frequently Asked Questions</Link>
                <Link to="/about" className="hover:text-primary hover:underline transition-colors">Contact Us</Link>
                <Link to="/about" className="hover:text-primary hover:underline transition-colors">Safety Tips</Link>
                <Link to="/about" className="hover:text-primary hover:underline transition-colors">Report an Issue</Link>
              </div>
            </div>

            {/* Column 4 */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold text-textDark uppercase tracking-wider">Company</h4>
              <div className="flex flex-col gap-2 text-xs text-textSec">
                <Link to="/about" className="hover:text-primary hover:underline transition-colors">About Us</Link>
                <Link to="/privacy" className="hover:text-primary hover:underline transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="hover:text-primary hover:underline transition-colors">Terms & Conditions</Link>
                <Link to="/terms" className="hover:text-primary hover:underline transition-colors">Community Guidelines</Link>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto mt-10 pt-8 border-t border-borderCustom flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="text-[11px] text-muted">
                &copy; {new Date().getFullYear()} Campus Marketplace.
              </p>
              <p className="text-[10px] text-muted mt-0.5">
                Helping students save money every semester.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-muted hover:text-primary transition-colors" aria-label="LinkedIn">
                <LinkedInIcon className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-muted hover:text-primary transition-colors" aria-label="Instagram">
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-muted hover:text-primary transition-colors" aria-label="GitHub">
                <GithubIcon className="w-4 h-4" />
              </a>
              <a href="mailto:support@campusmarketplace.com" className="text-muted hover:text-primary transition-colors" aria-label="Email">
                <Mail className="w-4 h-4" />
              </a>
            </div>

            <span className="text-[11px] text-muted font-medium">Designed for Campus Communities</span>
          </div>
        </footer>
      )}

      {/* Mobile Sticky Tab Navigation */}
      {location.pathname !== '/' && <BottomNav />}
    </div>
  );
};

