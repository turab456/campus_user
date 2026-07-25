import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { backendApi as api } from '../services/backendApi';
import { SEO } from '../components/SEO';

export const ResetPasswordPage: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      showToast('Invalid or expired password reset link.', 'danger');
      return;
    }

    if (!password) {
      showToast('Please enter your new password.', 'warning');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long.', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'danger');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.resetPassword(token, password);
      setSuccess(true);
      showToast('Password reset successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to reset password.', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <SEO title="Reset Password | RevoShelf" />
      <h1 className="sr-only">Reset Password | RevoShelf</h1>

      <div className="text-center">
        <h3 className="text-lg font-bold text-textDark">Choose New Password</h3>
        <p className="text-xs text-muted mt-1">Please enter and confirm your new account password below.</p>
      </div>

      {success ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center flex flex-col items-center gap-3">
          <CheckCircle2 className="w-10 h-10 text-success" />
          <h4 className="font-bold text-sm text-textDark">Password Reset Done</h4>
          <p className="text-xs text-muted leading-relaxed">
            Your password has been successfully updated. You can now use your new password to sign in to your RevoShelf account.
          </p>
          <Link
            to="/login"
            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 px-6 rounded-lg shadow-subtle transition-colors flex items-center gap-1.5 mt-2 focus:outline-none"
          >
            <span>Proceed to Login</span>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* New Password */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-textDark uppercase tracking-wider">New Password</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-muted absolute left-3 pointer-events-none" />
              <input
                type="password"
                placeholder="Enter at least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F5F3EF] border border-borderCustom rounded-[10px] py-2.5 pl-9 pr-4 text-xs text-textDark focus:bg-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-textDark uppercase tracking-wider">Confirm New Password</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-muted absolute left-3 pointer-events-none" />
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#F5F3EF] border border-borderCustom rounded-[10px] py-2.5 pl-9 pr-4 text-xs text-textDark focus:bg-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !token}
            className="bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-subtle transition-colors flex items-center justify-center gap-1.5 mt-2 focus:outline-none disabled:opacity-50"
          >
            {isSubmitting ? 'Updating Password...' : 'Reset Password'}
          </button>

          <hr className="border-borderCustom mt-1" />

          <Link
            to="/login"
            className="text-xs font-semibold text-muted hover:text-textDark flex items-center justify-center gap-1 transition-colors mt-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </form>
      )}
    </div>
  );
};
