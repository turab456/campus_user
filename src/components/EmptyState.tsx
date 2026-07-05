import React from 'react';
import { Search, FolderOpen, Heart, MessageSquare } from 'lucide-react';

interface EmptyStateProps {
  type: 'search' | 'wishlist' | 'listings' | 'messages';
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  actionText,
  onAction
}) => {
  const getIcon = () => {
    switch (type) {
      case 'search':
        return <Search className="w-12 h-12 text-slate-300" />;
      case 'wishlist':
        return <Heart className="w-12 h-12 text-slate-300" />;
      case 'messages':
        return <MessageSquare className="w-12 h-12 text-slate-300" />;
      case 'listings':
      default:
        return <FolderOpen className="w-12 h-12 text-slate-300" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 max-w-md mx-auto my-6">
      <div className="bg-[#F5F3EF] p-4 rounded-xl border border-borderCustom flex items-center justify-center mb-4">
        {getIcon()}
      </div>
      <h3 className="text-base font-bold text-textDark leading-tight mb-2">{title}</h3>
      <p className="text-xs text-muted leading-relaxed mb-6">{description}</p>
      
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-subtle focus:outline-none"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
