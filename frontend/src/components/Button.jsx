import React from 'react';

const Button = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#D98C6B]/20 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95';
  
  const variants = {
    primary: 'bg-[#D98C6B] hover:bg-[#D98C6B]/90 text-white shadow-md shadow-[#D98C6B]/15 border border-[#D98C6B]/10',
    secondary: 'bg-[#F7D8C5] hover:bg-[#F7D8C5]/90 text-[#5A4A42] border border-[#F7D8C5]/10',
    danger: 'bg-red-500 hover:bg-red-400 text-white shadow-sm border border-red-400/15',
    success: 'bg-[#B8C9A3] hover:bg-[#B8C9A3]/90 text-white shadow-sm border border-[#B8C9A3]/15',
    warning: 'bg-[#F7D8C5] hover:bg-[#F7D8C5]/90 text-[#5A4A42] border border-[#F7D8C5]/10',
    glass: 'bg-[#FFF9F5] hover:bg-[#F7D8C5]/30 text-[#D98C6B] border border-[#E7D8CC]',
    brand: 'brand-gradient hover:opacity-95 text-[#5A4A42] shadow-md shadow-[#D98C6B]/10 border-none',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
