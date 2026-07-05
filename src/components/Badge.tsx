import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ children }) => {
  return (
    <span className="inline-block bg-[#DBEAFE] text-[#2563EB] text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider mb-4 cursor-default">
      {children}
    </span>
  );
};
