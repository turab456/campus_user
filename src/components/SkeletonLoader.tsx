import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`bg-slate-200 animate-pulse rounded ${className}`} />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="border border-borderCustom rounded-xl overflow-hidden bg-white p-3 flex flex-col gap-3">
      <Skeleton className="aspect-[4/3] w-full rounded-lg" />
      <div className="flex justify-between items-center mt-1">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
      <Skeleton className="h-5 w-4/5" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-2 items-center mt-1">
        <Skeleton className="h-6 w-12" />
        <Skeleton className="h-4 w-16" />
      </div>
      <hr className="border-borderCustom my-1" />
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
};

export const ListingDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row gap-6">
      {/* Gallery Left */}
      <div className="flex-1 flex flex-col gap-4">
        <Skeleton className="aspect-[4/3] w-full rounded-xl" />
        <div className="flex gap-3">
          <Skeleton className="w-20 h-16 rounded-lg" />
          <Skeleton className="w-20 h-16 rounded-lg" />
          <Skeleton className="w-20 h-16 rounded-lg" />
        </div>
      </div>
      
      {/* Details Right */}
      <div className="w-full md:w-[420px] bg-white border border-borderCustom rounded-xl p-5 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-8 w-11/12" />
        <Skeleton className="h-4 w-1/3" />
        <div className="flex items-baseline gap-2 py-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-5 w-12" />
        </div>
        <hr className="border-borderCustom" />
        <div className="flex items-center gap-3 py-1">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 flex flex-col gap-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3.5 w-40" />
          </div>
        </div>
        <hr className="border-borderCustom" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
        <div className="flex gap-3 mt-4">
          <Skeleton className="h-11 flex-1 rounded-full" />
          <Skeleton className="h-11 w-12 rounded-full" />
        </div>
      </div>
    </div>
  );
};
