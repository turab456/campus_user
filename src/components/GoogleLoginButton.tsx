import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    google: any;
  }
}

export const GoogleLoginButton: React.FC = () => {
  const { loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [isGsiLoaded, setIsGsiLoaded] = useState(false);
  const [mockEmail, setMockEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const isMockMode = !clientId || clientId === 'mock';

  useEffect(() => {
    // Check if script is already initialized
    if (window.google?.accounts?.id) {
      setIsGsiLoaded(true);
      return;
    }

    const interval = setInterval(() => {
      if (window.google?.accounts?.id) {
        setIsGsiLoaded(true);
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isGsiLoaded || isMockMode) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        cancel_on_tap_outside: false,
      });

      const container = document.getElementById('google-signin-btn-container');
      const containerWidth = container && container.offsetWidth > 200
        ? Math.min(400, container.offsetWidth)
        : 280;

      window.google.accounts.id.renderButton(
        container,
        {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: containerWidth,
        }
      );
    } catch (err) {
      console.error('Failed to initialize Google Sign-In', err);
    }
  }, [isGsiLoaded, isMockMode, clientId]);

  const handleCredentialResponse = async (response: any) => {
    if (!response.credential) return;
    setIsSubmitting(true);
    try {
      await loginWithGoogle(response.credential);
      showToast('Successfully signed in with Google!', 'success');
      navigate('/home');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Google authentication failed.', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMockLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockEmail.trim() || !mockEmail.includes('@')) {
      showToast('Please enter a valid email address.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      // Send mock Google ID token format: mock-google-token-<email>
      const mockToken = `mock-google-token-${mockEmail.trim().toLowerCase()}`;
      await loginWithGoogle(mockToken);
      showToast(`Signed in as mock user: ${mockEmail.trim()}`, 'success');
      navigate('/home');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Mock Google authentication failed.', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full gap-4 py-2">
      {isMockMode ? (
        <form onSubmit={handleMockLoginSubmit} className="flex flex-col gap-2 w-full max-w-xs">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-muted uppercase tracking-wider text-center">
              [Development Mode] Mock Google Login
            </label>
            <input
              type="email"
              placeholder="e.g. testuser@gmail.com"
              value={mockEmail}
              onChange={(e) => setMockEmail(e.target.value)}
              className="w-full bg-[#F5F3EF] border border-borderCustom rounded-[10px] py-2 px-3 text-xs text-textDark text-center focus:bg-white focus:border-primary focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-white hover:bg-gray-50 active:bg-gray-100 text-textDark border border-borderCustom text-xs font-bold py-2 px-4 rounded-lg shadow-subtle flex items-center justify-center gap-2 transition-colors focus:outline-none disabled:opacity-50"
          >
            {/* Google Logo SVG */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.89 3.02C6.22 7.7 8.89 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.12 2.74-2.38 3.58l3.89 3.02c2.27-2.09 3.52-5.17 3.52-8.75z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.78A7.02 7.02 0 0 1 4.9 12c0-.98.17-1.92.47-2.78L1.39 6.2A11.96 11.96 0 0 0 0 12c0 2.12.55 4.12 1.53 5.89l3.75-3.11z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.89-3.02c-1.1.74-2.51 1.18-4.07 1.18-3.11 0-5.78-2.66-6.72-5.54L1.39 15.73C3.37 19.63 7.35 22 12 23z"
              />
            </svg>
            <span>{isSubmitting ? 'Connecting...' : 'Continue with Google'}</span>
          </button>
        </form>
      ) : (
        <div className="flex flex-col items-center justify-center w-full min-h-[44px]">
          <div id="google-signin-btn-container" className="flex justify-center w-full max-w-xs"></div>
          {isSubmitting && <p className="text-[10px] text-muted mt-2">Signing in with Google...</p>}
        </div>
      )}
    </div>
  );
};
