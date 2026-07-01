import React from 'react';

const Card = ({ children, className = '', hoverable = true, ...props }) => {
  return (
    <div
      className={`glass-panel rounded-[28px] p-6 transition-all duration-300 ease-in-out ${
        hoverable ? 'hover-premium' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
