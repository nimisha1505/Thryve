import React from 'react';

const ResourceThumbnail = ({ name, className = 'w-full h-full' }) => {
  const getSvg = () => {
    switch (name?.toLowerCase()) {
      case 'rain':
        return (
          <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="rainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7DD3FC" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="16" fill="#F0F9FF" />
            {/* Cloud */}
            <path d="M30 60 C30 50, 40 45, 45 48 C48 42, 58 40, 64 45 C70 45, 74 50, 72 58 C72 63, 62 65, 55 65 L35 65 C30 65, 30 60, 30 60 Z" fill="url(#rainGrad)" />
            {/* Raindrops */}
            <line x1="38" y1="72" x2="36" y2="80" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 3" className="animate-pulse" />
            <line x1="48" y1="74" x2="46" y2="82" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 3" />
            <line x1="58" y1="72" x2="56" y2="80" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 3" className="animate-pulse" />
            <line x1="68" y1="74" x2="66" y2="82" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 3" />
          </svg>
        );
      case 'ocean':
        return (
          <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A5F3FC" />
                <stop offset="100%" stopColor="#0891B2" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="16" fill="#ECFEFF" />
            {/* Wave 1 */}
            <path d="M15 55 Q 30 45, 45 55 T 75 55 T 90 55 L 90 85 L 15 85 Z" fill="url(#oceanGrad)" opacity="0.8" />
            {/* Wave 2 */}
            <path d="M10 60 Q 28 50, 46 60 T 82 60 T 95 60 L 95 85 L 10 85 Z" fill="#0E7490" opacity="0.6" />
          </svg>
        );
      case 'forest':
        return (
          <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="forestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#86EFAC" />
                <stop offset="100%" stopColor="#15803D" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="16" fill="#F0FDF4" />
            {/* Trees */}
            <path d="M50 25 L65 55 L58 55 L68 75 L32 75 L42 55 L35 55 Z" fill="url(#forestGrad)" />
            <path d="M30 40 L40 65 L36 65 L43 80 L17 80 L24 65 L20 65 Z" fill="#166534" opacity="0.7" />
            <path d="M72 42 L80 65 L76 65 L83 80 L61 80 L68 65 L64 65 Z" fill="#15803D" opacity="0.5" />
          </svg>
        );
      case 'breathing':
        return (
          <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="breathGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#DDD6FE" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="16" fill="#FAF5FF" />
            {/* Expanding Rings */}
            <circle cx="50" cy="50" r="30" stroke="url(#breathGrad)" strokeWidth="1.5" className="animate-pulse" />
            <circle cx="50" cy="50" r="22" stroke="#A78BFA" strokeWidth="2.5" strokeDasharray="3 3" />
            <circle cx="50" cy="50" r="14" fill="#8B5CF6" opacity="0.2" />
            <circle cx="50" cy="50" r="6" fill="#6D28D9" />
          </svg>
        );
      case 'affirmations':
        return (
          <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="affGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#EAB308" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="16" fill="#FEFCE8" />
            {/* Glowing Heart / Star */}
            <path d="M50 30 C50 30, 38 18, 26 30 C14 42, 38 66, 50 74 C62 66, 86 42, 74 30 C62 18, 50 30, 50 30 Z" fill="#FDE047" opacity="0.3" />
            <path d="M50 35 C50 35, 41 26, 32 35 C23 44, 41 62, 50 68 C59 62, 77 44, 68 35 C59 26, 50 35, 50 35 Z" fill="url(#affGrad)" />
            {/* Sparkles */}
            <path d="M22 25 L24 28 L27 25 L24 22 Z" fill="#CA8A04" />
            <path d="M78 68 L80 71 L83 68 L80 65 Z" fill="#CA8A04" />
          </svg>
        );
      case 'motivation':
        return (
          <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="motivGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FCA5A5" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="16" fill="#FEF2F2" />
            {/* Mountains Peak */}
            <path d="M50 25 L85 80 L15 80 Z" fill="url(#motivGrad)" />
            <path d="M35 50 L50 30 L65 52 L57 52 L50 42 L42 50 Z" fill="#FEE2E2" />
            <circle cx="50" cy="20" r="3" fill="#B91C1C" />
          </svg>
        );
      case 'sleep':
        return (
          <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="sleepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#93C5FD" />
                <stop offset="100%" stopColor="#1E3A8A" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="16" fill="#EFF6FF" />
            {/* Crescent Moon & Stars */}
            <path d="M40 32 C55 32, 64 45, 60 58 C45 62, 34 50, 36 36 C36 34, 38 32, 40 32 Z" fill="url(#sleepGrad)" />
            <path d="M40 32 C48 32, 54 38, 54 46 C44 48, 36 40, 36 36 C36 34, 38 32, 40 32 Z" fill="#DBEAFE" opacity="0.5" />
            <circle cx="70" cy="30" r="1.5" fill="#3B82F6" className="animate-pulse" />
            <circle cx="28" cy="55" r="1.5" fill="#3B82F6" />
            <circle cx="74" cy="52" r="1" fill="#3B82F6" className="animate-pulse" />
          </svg>
        );
      case 'fireplace':
        return (
          <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="fireGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#EA580C" />
                <stop offset="50%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#FACC15" />
              </linearGradient>
              <linearGradient id="logGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#78350F" />
                <stop offset="100%" stopColor="#451A03" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="16" fill="#FFF7ED" />
            {/* Logs */}
            <rect x="23" y="72" width="46" height="8" rx="2" transform="rotate(-15 46 76)" fill="url(#logGrad)" />
            <rect x="31" y="70" width="46" height="8" rx="2" transform="rotate(15 54 74)" fill="url(#logGrad)" />
            {/* Flames */}
            <path d="M50 22 C60 42, 66 54, 60 68 C54 78, 42 78, 38 68 C32 54, 40 42, 50 22 Z" fill="url(#fireGrad)" opacity="0.95" />
            <path d="M50 36 C55 48, 60 56, 56 66 C51 73, 45 73, 41 66 C37 56, 45 48, 50 36 Z" fill="#F59E0B" opacity="0.9" />
            <path d="M50 50 C52 56, 55 61, 52 66 C49 70, 47 70, 45 66 C43 61, 48 56, 50 50 Z" fill="#FCD34D" />
          </svg>
        );
      case 'crickets':
        return (
          <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="nightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E1B4B" />
                <stop offset="100%" stopColor="#311042" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="16" fill="url(#nightGrad)" />
            {/* Moon */}
            <path d="M68 22 C58 22, 48 30, 48 42 C48 52, 56 60, 66 60 C70 60, 74 58, 76 56 C70 56, 64 50, 64 42 C64 32, 70 26, 76 24 C74 22, 71 22, 68 22 Z" fill="#FDE047" opacity="0.9" />
            {/* Stars */}
            <circle cx="25" cy="25" r="1.2" fill="#FFFFFF" className="animate-pulse" />
            <circle cx="35" cy="45" r="0.8" fill="#FFF" />
            <circle cx="18" cy="50" r="1" fill="#FFE" />
            <circle cx="48" cy="22" r="0.8" fill="#FFF" />
            <circle cx="80" cy="35" r="1.2" fill="#FFE" className="animate-pulse" />
            {/* Grass blades */}
            <path d="M15 90 Q 20 72, 28 77 Q 21 82, 20 90 Z" fill="#15803D" />
            <path d="M25 90 Q 31 65, 42 73 Q 32 78, 30 90 Z" fill="#166534" />
            <path d="M60 90 Q 64 68, 75 74 Q 66 78, 65 90 Z" fill="#15803D" />
            <path d="M75 90 Q 81 74, 88 81 Q 81 83, 80 90 Z" fill="#14532D" />
          </svg>
        );
      default: // default wellness mandala fallback
        return (
          <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="16" fill="#F8FAFC" />
            <circle cx="50" cy="50" r="25" stroke="#94A3B8" strokeWidth="2.5" />
            <circle cx="50" cy="50" r="15" stroke="#CBD5E1" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="5" fill="#94A3B8" />
          </svg>
        );
    }
  };

  return <div className="aspect-square w-full rounded-xl overflow-hidden shadow-sm">{getSvg()}</div>;
};

export default ResourceThumbnail;
