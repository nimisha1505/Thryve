import React from 'react';

const LoadingSkeleton = ({ variant = 'card', count = 1, className = '' }) => {
  const CardSkeleton = () => (
    <div className="w-full bg-white rounded-[28px] p-6 animate-pulse border border-[#E7D8CC] mb-4 last:mb-0">
      <div className="flex gap-4 items-center mb-4">
        <div className="w-10 h-10 bg-[#F5ECE5] rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-[#F5ECE5] rounded w-1/3" />
          <div className="h-3 bg-[#F5ECE5] rounded w-1/4" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-[#F5ECE5] rounded w-full" />
        <div className="h-3 bg-[#F5ECE5] rounded w-5/6" />
      </div>
    </div>
  );

  const StatSkeleton = () => (
    <div className="w-full bg-white rounded-[28px] p-6 animate-pulse border border-[#E7D8CC]">
      <div className="h-3 bg-[#F5ECE5] rounded w-1/2 mb-3" />
      <div className="h-8 bg-[#F5ECE5] rounded w-3/4 mb-2" />
      <div className="h-3 bg-[#F5ECE5] rounded w-1/3" />
    </div>
  );

  const ListSkeleton = () => (
    <div className="w-full space-y-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="flex items-center gap-3 p-3.5 rounded-xl bg-[#FFF9F5] border border-[#E7D8CC] animate-pulse">
          <div className="w-5 h-5 rounded bg-[#F5ECE5]" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-[#F5ECE5] rounded w-2/5" />
            <div className="h-2.5 bg-[#F5ECE5] rounded w-1/5" />
          </div>
        </div>
      ))}
    </div>
  );

  if (variant === 'stat') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
        {Array.from({ length: count }).map((_, idx) => (
          <StatSkeleton key={idx} />
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return <ListSkeleton className={className} />;
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <CardSkeleton key={idx} />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
