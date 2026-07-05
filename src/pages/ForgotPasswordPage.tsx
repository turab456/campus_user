import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Please enter your email address.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate calling reset password endpoint
      await new Promise(resolve => setTimeout(resolve, 800));
      setEmailSent(true);
      showToast('Reset link dispatched to your email!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to trigger reset email.', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h3 className="text-lg font-bold text-textDark">Reset Password</h3>
        <p className="text-xs text-muted mt-1">Enter your registered email to receive a password reset link.</p>
      </div>

      {emailSent ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center flex flex-col items-center gap-3">
          <CheckCircle2 className="w-10 h-10 text-success" />
          <h4 className="font-bold text-sm text-textDark">Verification Link Sent</h4>
          <p className="text-xs text-muted leading-relaxed">
            We have sent a password recovery link to <strong className="text-textDark font-semibold">{email}</strong>. Please check your inbox and spam folder.
          </p>
          <Link
            to="/login"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 mt-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to login</span>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-textDark uppercase tracking-wider">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-muted absolute left-3 pointer-events-none" />
              <input
                type="email"
                placeholder="e.g. name@rvce.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F5F3EF] border border-borderCustom rounded-[10px] py-2.5 pl-9 pr-4 text-xs text-textDark focus:bg-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-subtle transition-colors flex items-center justify-center gap-1.5 mt-2 focus:outline-none disabled:opacity-50"
          >
            {isSubmitting ? 'Sending Link...' : 'Send Recovery Link'}
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
