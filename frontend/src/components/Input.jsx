import React from 'react';

const Input = ({
  label,
  type = 'text',
  placeholder = '',
  className = '',
  id,
  error,
  register = {},
  ...props
}) => {
  const baseInputStyles = 'w-full bg-[#FEFCFA] border border-[#E7D8CC] rounded-2xl px-4 py-3 text-[#5A4A42] placeholder-[#8B766C]/60 focus:outline-none focus:border-[#D98C6B] focus:ring-4 focus:ring-[#D98C6B]/15 transition-all duration-300';
  
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-bold text-[#8B766C] uppercase tracking-wide">
          {label}
        </label>
      )}
      {type === 'textarea' ? (
        <textarea
          id={id}
          placeholder={placeholder}
          className={`${baseInputStyles} resize-none min-h-[100px]`}
          {...register}
          {...props}
        />
      ) : type === 'select' ? (
        <select
          id={id}
          className={`${baseInputStyles} appearance-none cursor-pointer`}
          {...register}
          {...props}
        >
          {props.children}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          className={baseInputStyles}
          {...register}
          {...props}
        />
      )}
      {error && <span className="text-xs font-semibold text-red-400 mt-1">{error}</span>}
    </div>
  );
};

export default Input;
