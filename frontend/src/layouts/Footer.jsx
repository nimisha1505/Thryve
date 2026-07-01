import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full py-8 text-center text-xs text-slate-500 border-t border-slate-200/60 bg-white/20">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 font-medium">
        <span>© {new Date().getFullYear()} THRYVE. All rights reserved.</span>
        <div className="flex gap-6">
          <a href="#" className="hover:text-slate-800 transition-colors duration-200">Privacy Policy</a>
          <a href="#" className="hover:text-slate-800 transition-colors duration-200">Terms of Service</a>
          <a href="#" className="hover:text-brand-600 transition-colors duration-200 text-brand-500 font-semibold">Crisis Hotline</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
