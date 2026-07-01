import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, className = '' }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      {/* Backdrop click zone */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Modal Card */}
      <div
        className={`relative w-full max-w-lg bg-white border border-[#E7D8CC] rounded-[28px] p-6 shadow-2xl z-10 animate-scaleUp max-h-[90vh] overflow-y-auto ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E7D8CC] mb-4">
          <h3 className="text-lg font-bold text-[#5A4A42]">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#8B766C] hover:text-[#5A4A42] p-1 rounded-lg hover:bg-[#FFF9F5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
