import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Smile,
  BookOpen,
  Users,
  ShieldAlert,
  Sparkles,
  Brain,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Settings,
  Music
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('thryve_sidebar_collapsed') === 'true';
  });

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('thryve_sidebar_collapsed', String(nextState));
  };

  const links = [
    { to: '/dashboard', label: 'Your Sanctuary', icon: LayoutDashboard },
    { to: '/mood', label: 'Mood Tracker', icon: Smile },
    { to: '/journal', label: 'Journal', icon: BookOpen },
    { to: '/companion', label: 'AI Companion', icon: Sparkles },
    { to: '/insights', label: 'Your Wellness Journey', icon: Brain },
    { to: '/habits', label: 'Habits', icon: CheckSquare },
    { to: '/resources', label: 'Moments of Calm', icon: Music },
    { to: '/community', label: 'We\'re Here Together', icon: Users },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`bg-[#FFF7F2] border-r border-[#E7D8CC] min-h-[calc(100vh-68px)] p-4 flex flex-col justify-between hidden md:flex transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col gap-6">
        {/* Toggle & Title Area */}
        <div className="flex items-center justify-between px-2 h-8">
          {!isCollapsed && (
            <span className="text-[10px] font-extrabold text-[#7A6A5A] uppercase tracking-widest animate-fadeIn">
              Wellness Sanctuary
            </span>
          )}
          <button
            onClick={toggleCollapse}
            className="w-7 h-7 rounded-lg bg-white border border-[#E7D8CC] hover:bg-[#FFDCC8]/30 flex items-center justify-center text-[#7A6A5A] hover:text-[#2D2115] transition-colors mx-auto"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                title={isCollapsed ? link.label : ''}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-[#FFDCC8] text-[#F59E73] font-bold shadow-sm shadow-[#FFDCC8]/20 border border-[#F59E73]/10'
                      : 'text-[#7A6A5A] hover:text-[#2D2115] hover:bg-[#FFDCC8]/35 border border-transparent font-medium'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-102" />
                {!isCollapsed && (
                  <span className="text-sm truncate animate-fadeIn">
                    {link.label}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Profile & Admin Section */}
      <div className="flex flex-col gap-3 pt-4 border-t border-[#E7D8CC]">
        {/* Admin panel logic */}
        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            title={isCollapsed ? 'Admin Control' : ''}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all duration-250 ${
                isActive
                  ? 'bg-red-500/20 text-red-600 shadow-md'
                  : 'text-red-500 hover:text-white hover:bg-red-600/80 border border-transparent'
              }`
            }
          >
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-sm font-semibold truncate animate-fadeIn">
                Admin Control
              </span>
            )}
          </NavLink>
        )}

        {/* Bottom Profile Details */}
        <div
          className={`flex items-center justify-between p-2 rounded-2xl bg-white border border-[#E7D8CC] ${
            isCollapsed ? 'flex-col gap-3 py-3' : 'gap-2'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-7 h-7 rounded-full border border-[#FFDCC8] object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full border border-[#E7D8CC] bg-[#FFF7F2] flex items-center justify-center text-[#7A6A5A] flex-shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 animate-fadeIn">
                <span className="text-xs font-bold text-[#2D2115] truncate">{user?.name}</span>
                <span className="text-[9px] font-bold text-[#7A6A5A] uppercase tracking-wide font-mono">
                  {user?.role}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className="text-[#7A6A5A] hover:text-red-500 p-1.5 rounded-xl hover:bg-[#FFF7F2] transition-colors"
            title="Sign out of account"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
