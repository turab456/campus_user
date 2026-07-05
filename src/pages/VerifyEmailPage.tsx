import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { backendApi } from '../services/backendApi';
import { CheckCircle2, XCircle, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const token = searchParams.get('token');
  const id = searchParams.get('id');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    let isMounted = true;

    const performVerification = async () => {
      if (!token || !id) {
        if (isMounted) {
          setStatus('error');
          setErrorMessage('Invalid verification link. Token or User ID is missing.');
        }
        return;
      }

      try {
        const res = await backendApi.verifyEmail(token, id);
        if (isMounted) {
          if (res.success) {
            setStatus('success');
            showToast('Email verified successfully! You can now log in.', 'success');
          } else {
            setStatus('error');
            setErrorMessage(res.message || 'Verification failed. The token may be expired or invalid.');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setStatus('error');
          setErrorMessage(err.message || 'Verification request failed. Please try again.');
        }
      }
    };

    performVerification();

    return () => {
      isMounted = false;
    };
  }, [token, id, showToast]);

  // Countdown timer for automatic redirect
  useEffect(() => {
    if (status !== 'success') return;

    if (countdown <= 0) {
      navigate('/login');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [status, countdown, navigate]);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h3 className="text-lg font-bold text-textDark">Email Verification</h3>
        <p className="text-xs text-muted mt-1">Completing your registration security handshake.</p>
      </div>

      {status === 'loading' && (
        <div className="bg-[#F5F3EF] border border-borderCustom rounded-xl p-8 text-center flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <h4 className="font-bold text-sm text-textDark">Verifying Address</h4>
          <p className="text-xs text-muted leading-relaxed">
            Please wait while we confirm your email verification token with the server...
          </p>
        </div>
      )}

      {status === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center flex flex-col items-center gap-4">
          <CheckCircle2 className="w-12 h-12 text-success animate-bounce" />
          <h4 className="font-bold text-sm text-textDark text-success">Verification Complete!</h4>
          <p className="text-xs text-muted leading-relaxed">
            Thank you! Your email has been verified. You will be automatically redirected to the login page in{' '}
            <strong className="text-textDark font-bold">{countdown}</strong> seconds.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-subtle transition-colors flex items-center justify-center gap-1.5 mt-2 focus:outline-none"
          >
            <span>Proceed to Login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center flex flex-col items-center gap-4">
          <XCircle className="w-12 h-12 text-danger" />
          <h4 className="font-bold text-sm text-danger">Verification Failed</h4>
          <p className="text-xs text-muted leading-relaxed">
            {errorMessage || 'We encountered an error while verifying your email.'}
          </p>
          <Link
            to="/register"
            className="w-full bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-subtle transition-colors flex items-center justify-center gap-1.5 mt-2 focus:outline-none"
          >
            <span>Try Registering Again</span>
          </Link>
          <hr className="w-full border-borderCustom" />
          <Link
            to="/login"
            className="text-xs font-semibold text-muted hover:text-textDark flex items-center justify-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go to Sign In</span>
          </Link>
        </div>
      )}
    </div>
  );
};
