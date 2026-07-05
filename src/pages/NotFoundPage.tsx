import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center py-16 px-4 max-w-md mx-auto flex flex-col items-center justify-center gap-5">
      <div className="bg-slate-50 border border-borderCustom p-4 rounded-full text-slate-400">
        <HelpCircle className="w-12 h-12" />
      </div>
      <div>
        <h1 className="text-3xl font-extrabold text-textDark tracking-tight">404</h1>
        <h2 className="text-base font-bold text-textDark mt-1.5 leading-tight">Page Not Found</h2>
        <p className="text-xs text-muted mt-2 leading-relaxed">
          The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
        </p>
      </div>

      <button
        onClick={() => navigate('/home')}
        className="bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 px-5 rounded-full flex items-center gap-1.5 shadow-subtle hover:shadow transition-colors focus:outline-none mt-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Homepage</span>
      </button>
    </div>
  );
};
