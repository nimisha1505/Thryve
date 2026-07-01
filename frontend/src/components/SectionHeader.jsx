import React from 'react';

const SectionHeader = ({ title, description, children, className = '' }) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 ${className}`}>
      <div className="space-y-1">
        <h2 className="text-xl font-extrabold text-[#5A4A42] tracking-tight">{title}</h2>
        {description && <p className="text-sm text-[#8B766C] font-medium">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
};

export default SectionHeader;
