import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { LogOut, User, Heart } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full px-6 py-4 flex items-center justify-between bg-white border-b border-[#E7D8CC] shadow-[0_2px_12px_rgba(45,33,21,0.02)]">
      <Link to="/" className="flex items-center gap-2 hover:scale-102 transition-transform">
        <Heart className="w-6 h-6 text-[#F59E73] fill-[#F59E73] animate-pulse" />
        <span className="font-display font-black text-xl tracking-tight text-gradient">
          THRYVE
        </span>
      </Link>

      <div className="flex items-center gap-6">
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#7A6A5A] font-semibold hidden md:inline">
              Hi, {user.name}
            </span>
            <Link to="/dashboard">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-[#FFDCC8] object-cover hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-8 h-8 rounded-full border border-[#E7D8CC] bg-[#FFF7F2] flex items-center justify-center text-[#7A6A5A] hover:scale-105 transition-transform">
                  <User className="w-4 h-4" />
                </div>
              )}
            </Link>
            <button
              onClick={logout}
              className="text-[#7A6A5A] hover:text-[#F59E73] transition-colors duration-200"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-[#7A6A5A] hover:text-[#2D2115] transition-colors duration-200">
              Sign In
            </Link>
            <Link
              to="/register"
              className="brand-gradient text-sm font-bold px-5 py-2.5 rounded-full text-[#FFF7F2] shadow-sm hover:opacity-95 transition-all duration-200 hover:-translate-y-0.5 active:scale-98"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
