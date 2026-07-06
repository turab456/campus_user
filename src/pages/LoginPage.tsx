import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { backendApi } from '../services/backendApi';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast('All fields are required', 'warning');
      return;
    }
    
    if (!email.includes('@')) {
      showToast('Please enter a valid email address.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      showToast('Successfully signed in!', 'success');
      navigate('/home');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Invalid credentials.', 'danger');
      if (err.message && err.message.toLowerCase().includes('verify')) {
        setShowResend(true);
        setResendEmail(email);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendLink = async () => {
    if (!resendEmail) return;
    setIsResending(true);
    try {
      await backendApi.resendVerification(resendEmail);
      showToast('A new verification link has been sent to your email!', 'success');
      setShowResend(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to resend verification link.', 'danger');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h3 className="text-lg font-bold text-textDark">Sign in to your account</h3>
        <p className="text-xs text-muted mt-1">Access listings and communicate with fellow student sellers.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-textDark uppercase tracking-wider">Email Address</label>
          <div className="relative flex items-center">
            <Mail className="w-4 h-4 text-muted absolute left-3 pointer-events-none" />
            <input
              type="email"
              placeholder="e.g. name@rvce.edu.in"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                // Hide resend alert if they start changing the email
                if (showResend) setShowResend(false);
              }}
              className="w-full bg-[#F5F3EF] border border-borderCustom rounded-[10px] py-2.5 pl-9 pr-4 text-xs text-textDark focus:bg-white focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-textDark uppercase tracking-wider">Password</label>
            <Link to="/forgot-password" className="text-[10px] font-bold text-primary hover:underline">Forgot password?</Link>
          </div>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-muted absolute left-3 pointer-events-none" />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#F5F3EF] border border-borderCustom rounded-[10px] py-2.5 pl-9 pr-4 text-xs text-textDark focus:bg-white focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-subtle transition-colors flex items-center justify-center gap-1.5 mt-2 focus:outline-none disabled:opacity-50"
        >
          <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {showResend && (
        <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl p-3 text-xs flex flex-col gap-2 -mt-2">
          <p className="text-[#991B1B] font-medium">Still haven't received the verification email?</p>
          <button
            type="button"
            onClick={handleResendLink}
            disabled={isResending}
            className="text-left text-xs font-bold text-primary hover:underline disabled:opacity-50"
          >
            {isResending ? 'Resending verification email...' : '✉️ Click here to resend verification link'}
          </button>
        </div>
      )}

      <hr className="border-borderCustom" />

      <p className="text-center text-xs text-muted">
        Don't have an account yet?{' '}
        <Link to="/register" className="font-bold text-primary hover:underline">Register Account</Link>
      </p>
    </div>
  );
};
