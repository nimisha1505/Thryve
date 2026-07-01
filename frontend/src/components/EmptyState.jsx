import React from 'react';
import Button from './Button.jsx';

const EmptyState = ({
  title,
  description,
  icon: Icon,
  actionText,
  onActionClick,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 rounded-[28px] bg-[#FFF9F5] border border-[#E7D8CC] ${className}`}>
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-[#D98C6B]/10 flex items-center justify-center text-[#D98C6B] mb-4 border border-[#D98C6B]/25">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-base font-bold text-[#5A4A42] mb-1">{title}</h3>
      <p className="text-sm text-[#8B766C] max-w-sm mb-5">{description}</p>
      {actionText && onActionClick && (
        <Button onClick={onActionClick} variant="glass" size="sm">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
