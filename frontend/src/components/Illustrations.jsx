import React from 'react';

// Common linear gradient definitions for consistent, premium styling
export const GradientDefs = () => (
  <defs>
    <linearGradient id="ill-sunrise" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FEFCFA" />
      <stop offset="50%" stopColor="#F7D8C5" />
      <stop offset="100%" stopColor="#D98C6B" />
    </linearGradient>
    <linearGradient id="ill-leaves" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#E6EFE0" />
      <stop offset="100%" stopColor="#B8C9A3" />
    </linearGradient>
    <linearGradient id="ill-peach" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FEFCFA" />
      <stop offset="100%" stopColor="#F7D8C5" />
    </linearGradient>
    <linearGradient id="ill-lavender" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#EAE7F5" />
      <stop offset="100%" stopColor="#CFC8E8" />
    </linearGradient>
    <linearGradient id="ill-terracotta" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F7D8C5" />
      <stop offset="100%" stopColor="#D98C6B" />
    </linearGradient>
    <linearGradient id="ill-shadow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#5A4A42" stopOpacity="0.05" />
      <stop offset="100%" stopColor="#5A4A42" stopOpacity="0" />
    </linearGradient>
  </defs>
);

export const Sunrise = ({ className = "w-16 h-16", ...props }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDefs />
    <circle cx="60" cy="65" r="40" fill="url(#ill-peach)" opacity="0.4" />
    <circle cx="60" cy="55" r="24" fill="url(#ill-terracotta)" />
    <path d="M60 15 V23 M60 87 V95 M20 55 H28 M92 55 H100 M31.7 26.7 L37.4 32.4 M82.6 77.6 L88.3 83.3 M31.7 83.3 L37.4 77.6 M82.6 32.4 L88.3 26.7" stroke="#D98C6B" strokeWidth="3.5" strokeLinecap="round" opacity="0.8" />
    <path d="M15 95 C45 80, 75 80, 105 95" stroke="#5A4A42" strokeWidth="4" strokeLinecap="round" />
    <path d="M10 102 C40 90, 80 90, 110 102" stroke="#5A4A42" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
  </svg>
);

export const MorningSunrise = Sunrise;

export const Reading = ({ className = "w-16 h-16", ...props }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDefs />
    <circle cx="60" cy="60" r="45" fill="url(#ill-peach)" opacity="0.25" />
    {/* Open book illustration */}
    <path d="M20 75 Q40 68, 60 78 Q80 68, 100 75 V40 Q80 33, 60 43 Q40 33, 20 40 Z" fill="#FEFCFA" stroke="#5A4A42" strokeWidth="3.5" strokeLinejoin="round" />
    <path d="M60 43 V78" stroke="#5A4A42" strokeWidth="3.5" />
    {/* Steaming mug */}
    <g transform="translate(48, 82)">
      <path d="M5 8 H19 V16 C19 19, 17 21, 14 21 H10 C7 21, 5 19, 5 16 Z" fill="url(#ill-terracotta)" stroke="#5A4A42" strokeWidth="2.5" />
      <path d="M19 11 A3 3 0 0 1 22 14 A3 3 0 0 1 19 17" stroke="#5A4A42" strokeWidth="2.5" />
      <path d="M10 4 Q12 1, 11 -2 M14 4 Q16 1, 15 -2" stroke="#D98C6B" strokeWidth="2" strokeLinecap="round" />
    </g>
    {/* Leaves growing behind */}
    <path d="M90 35 C95 20, 105 18, 98 32 C91 46, 85 45, 90 35 Z" fill="url(#ill-leaves)" stroke="#5A4A42" strokeWidth="2" />
  </svg>
);

export const Meditation = ({ className = "w-16 h-16", ...props }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDefs />
    <circle cx="60" cy="60" r="48" stroke="#CFC8E8" strokeWidth="2" strokeDasharray="6 6" opacity="0.5" />
    <circle cx="60" cy="60" r="38" stroke="#B8C9A3" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
    <ellipse cx="60" cy="90" rx="26" ry="10" fill="url(#ill-lavender)" stroke="#5A4A42" strokeWidth="3" />
    <ellipse cx="60" cy="74" rx="20" ry="8" fill="url(#ill-leaves)" stroke="#5A4A42" strokeWidth="3" />
    <ellipse cx="60" cy="60" rx="14" ry="6" fill="url(#ill-peach)" stroke="#5A4A42" strokeWidth="3" />
    <path d="M60 30 Q54 42 60 48 Q66 42 60 30" fill="url(#ill-terracotta)" stroke="#5A4A42" strokeWidth="2" />
    <path d="M52 38 Q60 44 68 38" stroke="#5A4A42" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const Leaves = ({ className = "w-16 h-16", ...props }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDefs />
    <path d="M30 90 C50 90, 70 95, 90 90" stroke="url(#ill-shadow)" strokeWidth="8" strokeLinecap="round" />
    <path d="M35 85 Q65 65, 85 25" stroke="#5A4A42" strokeWidth="4" strokeLinecap="round" />
    <path d="M48 65 C40 50, 48 38, 58 48 C68 58, 62 70, 48 65 Z" fill="url(#ill-leaves)" stroke="#5A4A42" strokeWidth="2.5" />
    <path d="M72 45 C75 30, 88 24, 82 38 C76 52, 63 50, 72 45 Z" fill="url(#ill-leaves)" stroke="#5A4A42" strokeWidth="2.5" />
    <path d="M52 48 C42 35, 50 20, 60 30 C70 40, 62 55, 52 48 Z" fill="url(#ill-leaves)" stroke="#5A4A42" strokeWidth="2.5" />
    <path d="M38 78 C25 72, 28 58, 42 62 C56 66, 50 82, 38 78 Z" fill="url(#ill-leaves)" stroke="#5A4A42" strokeWidth="2.5" opacity="0.9" />
  </svg>
);

export const Flowers = ({ className = "w-16 h-16", ...props }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDefs />
    <ellipse cx="60" cy="100" rx="30" ry="6" fill="url(#ill-shadow)" />
    <path d="M60 100 Q55 70, 60 45" stroke="#5A4A42" strokeWidth="4" strokeLinecap="round" />
    <path d="M57 75 C40 70, 38 82, 57 85 Z" fill="url(#ill-leaves)" stroke="#5A4A42" strokeWidth="2.5" />
    <path d="M59 60 C75 58, 77 70, 59 72 Z" fill="url(#ill-leaves)" stroke="#5A4A42" strokeWidth="2.5" />
    <circle cx="60" cy="45" r="14" fill="url(#ill-terracotta)" stroke="#5A4A42" strokeWidth="3" />
    <circle cx="45" cy="45" r="11" fill="url(#ill-peach)" stroke="#5A4A42" strokeWidth="2.5" />
    <circle cx="75" cy="45" r="11" fill="url(#ill-peach)" stroke="#5A4A42" strokeWidth="2.5" />
    <circle cx="60" cy="30" r="11" fill="url(#ill-peach)" stroke="#5A4A42" strokeWidth="2.5" />
    <circle cx="60" cy="60" r="11" fill="url(#ill-peach)" stroke="#5A4A42" strokeWidth="2.5" />
    <circle cx="60" cy="45" r="6" fill="#FEFCFA" stroke="#5A4A42" strokeWidth="2.5" />
  </svg>
);

export const Journal = ({ className = "w-16 h-16", ...props }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDefs />
    <rect x="24" y="90" width="72" height="10" rx="5" fill="url(#ill-shadow)" />
    <rect x="25" y="25" width="70" height="60" rx="8" fill="url(#ill-terracotta)" stroke="#5A4A42" strokeWidth="3.5" />
    <rect x="33" y="25" width="62" height="60" rx="4" fill="#FEFCFA" stroke="#5A4A42" strokeWidth="3.5" />
    <path d="M42 40 H78 M42 50 H78 M42 60 H68 M42 70 H60" stroke="#8B766C" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" />
    <path d="M28 32 H34 M28 44 H34 M28 56 H34 M28 68 H34" stroke="#5A4A42" strokeWidth="3" strokeLinecap="round" />
    <g transform="translate(68, 48) rotate(-35)">
      <rect x="0" y="0" width="10" height="35" rx="2" fill="url(#ill-leaves)" stroke="#5A4A42" strokeWidth="2.5" />
      <polygon points="0,0 5,-8 10,0" fill="#F7D8C5" stroke="#5A4A42" strokeWidth="2.5" />
      <polygon points="3,-4 5,-8 7,-4" fill="#5A4A42" />
    </g>
  </svg>
);

export const Journaling = Journal;

export const Breathing = ({ className = "w-16 h-16", ...props }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDefs />
    {/* Expanding breath ring effect */}
    <circle cx="60" cy="60" r="44" stroke="#B8C9A3" strokeWidth="3" strokeDasharray="5 5" opacity="0.6" />
    <circle cx="60" cy="60" r="30" fill="url(#ill-leaves)" opacity="0.2" />
    <circle cx="60" cy="60" r="20" fill="url(#ill-leaves)" stroke="#5A4A42" strokeWidth="3" />
    {/* Wind swirl line art */}
    <path d="M45 55 C48 50, 56 50, 60 55 C64 60, 72 60, 75 55" stroke="#FEFCFA" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M48 65 C51 61, 57 61, 60 65 C63 69, 69 69, 72 65" stroke="#FEFCFA" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
  </svg>
);

export const Forest = ({ className = "w-16 h-16", ...props }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDefs />
    <circle cx="60" cy="60" r="44" fill="url(#ill-peach)" opacity="0.3" />
    {/* Pine trees overlapping */}
    <g transform="translate(10, 15)">
      {/* Tree 1 */}
      <polygon points="35,70 15,70 25,45" fill="url(#ill-leaves)" stroke="#5A4A42" strokeWidth="2.5" strokeLinejoin="round" />
      <polygon points="30,50 20,50 25,30" fill="url(#ill-leaves)" stroke="#5A4A42" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="23" y="70" width="4" height="10" fill="#5A4A42" />
    </g>
    <g transform="translate(35, 20)">
      {/* Tree 2 */}
      <polygon points="45,65 20,65 32.5,35" fill="url(#ill-leaves)" stroke="#5A4A42" strokeWidth="2.5" strokeLinejoin="round" />
      <polygon points="40,40 25,40 32.5,20" fill="url(#ill-leaves)" stroke="#5A4A42" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="30" y="65" width="5" height="10" fill="#5A4A42" />
    </g>
    <g transform="translate(60, 25)">
      {/* Tree 3 */}
      <polygon points="35,60 15,60 25,35" fill="url(#ill-leaves)" stroke="#5A4A42" strokeWidth="2.5" strokeLinejoin="round" />
      <polygon points="30,40 20,40 25,22" fill="url(#ill-leaves)" stroke="#5A4A42" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="23" y="60" width="4" height="8" fill="#5A4A42" />
    </g>
    {/* Forest Ground */}
    <path d="M15 90 C45 82, 75 82, 105 90" stroke="#5A4A42" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);

export const Mountains = ({ className = "w-16 h-16", ...props }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDefs />
    <circle cx="78" cy="48" r="16" fill="url(#ill-peach)" />
    <path d="M10 100 L55 35 L90 100 Z" fill="url(#ill-lavender)" stroke="#5A4A42" strokeWidth="3" strokeLinejoin="round" />
    <path d="M40 100 L80 45 L115 100 Z" fill="url(#ill-terracotta)" stroke="#5A4A42" strokeWidth="3" strokeLinejoin="round" />
    <path d="M22 100 L27 90 L32 100 Z" fill="url(#ill-leaves)" stroke="#5A4A42" strokeWidth="2" />
    <path d="M30 100 L34 92 L38 100 Z" fill="url(#ill-leaves)" stroke="#5A4A42" strokeWidth="2" />
    <path d="M30 25 Q35 22 40 25 Q45 22 50 25" stroke="#5A4A42" strokeWidth="2" strokeLinecap="round" />
    <path d="M85 30 Q88 28 92 30 Q96 28 100 30" stroke="#5A4A42" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const Moon = ({ className = "w-16 h-16", ...props }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDefs />
    {/* Moon background glow */}
    <circle cx="65" cy="55" r="30" fill="url(#ill-peach)" opacity="0.3" />
    {/* Crescent Moon */}
    <path d="M72 32 C50 32, 38 48, 38 68 C38 88, 56 100, 76 96 C62 92, 54 78, 54 62 C54 46, 62 36, 72 32 Z" fill="url(#ill-sunrise)" stroke="#5A4A42" strokeWidth="3.5" strokeLinejoin="round" />
    {/* Tiny stars */}
    <path d="M28 32 L30 35 L33 32 L30 29 Z" fill="#D98C6B" />
    <path d="M88 80 L90 82 L92 80 L90 78 Z" fill="#CFC8E8" />
    <circle cx="48" cy="22" r="1.5" fill="#D98C6B" />
    <circle cx="92" cy="40" r="2.5" fill="#FEFCFA" />
  </svg>
);

export const Community = ({ className = "w-16 h-16", ...props }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDefs />
    <circle cx="60" cy="60" r="42" fill="url(#ill-peach)" opacity="0.3" />
    <g transform="translate(15, 0)">
      <circle cx="30" cy="50" r="10" fill="url(#ill-lavender)" stroke="#5A4A42" strokeWidth="3" />
      <path d="M12 90 C12 70, 48 70, 48 90" fill="url(#ill-lavender)" stroke="#5A4A42" strokeWidth="3" strokeLinecap="round" />
    </g>
    <g transform="translate(45, 0)">
      <circle cx="30" cy="50" r="10" fill="url(#ill-leaves)" stroke="#5A4A42" strokeWidth="3" />
      <path d="M12 90 C12 70, 48 70, 48 90" fill="url(#ill-leaves)" stroke="#5A4A42" strokeWidth="3" strokeLinecap="round" />
    </g>
    <g transform="translate(30, -8)">
      <circle cx="30" cy="48" r="12" fill="url(#ill-terracotta)" stroke="#5A4A42" strokeWidth="3.5" />
      <path d="M10 88 C10 65, 50 65, 50 88" fill="url(#ill-terracotta)" stroke="#5A4A42" strokeWidth="3.5" strokeLinecap="round" />
    </g>
    <path d="M60 20 C60 20, 58 14, 60 12 C62 14, 60 20, 60 20 Z" fill="#D98C6B" />
    <circle cx="42" cy="22" r="3" fill="#D98C6B" />
    <circle cx="78" cy="22" r="3" fill="#CFC8E8" />
  </svg>
);

export const Books = ({ className = "w-16 h-16", ...props }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDefs />
    <ellipse cx="60" cy="98" rx="42" ry="6" fill="url(#ill-shadow)" />
    <rect x="25" y="72" width="70" height="18" rx="4" fill="url(#ill-terracotta)" stroke="#5A4A42" strokeWidth="3" />
    <rect x="80" y="75" width="12" height="12" fill="#FEFCFA" stroke="#5A4A42" strokeWidth="2.5" />
    <rect x="30" y="52" width="62" height="18" rx="4" fill="url(#ill-lavender)" stroke="#5A4A42" strokeWidth="3" />
    <rect x="75" y="55" width="14" height="12" fill="#FEFCFA" stroke="#5A4A42" strokeWidth="2.5" />
    <rect x="22" y="32" width="66" height="18" rx="4" fill="url(#ill-leaves)" stroke="#5A4A42" strokeWidth="3" />
    <rect x="72" y="35" width="13" height="12" fill="#FEFCFA" stroke="#5A4A42" strokeWidth="2.5" />
    <path d="M45 32 Q42 20, 30 18" stroke="#5A4A42" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M30 18 C25 24, 38 28, 30 18 Z" fill="url(#ill-leaves)" stroke="#5A4A42" strokeWidth="1.5" />
  </svg>
);

export const Plant = ({ className = "w-16 h-16", ...props }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDefs />
    <ellipse cx="60" cy="100" rx="20" ry="4" fill="url(#ill-shadow)" />
    {/* Terracotta pot */}
    <path d="M45 75 L48 98 C48 100, 72 100, 72 98 L75 75 Z" fill="url(#ill-terracotta)" stroke="#5A4A42" strokeWidth="3" strokeLinejoin="round" />
    <rect x="42" y="68" width="36" height="8" rx="2" fill="url(#ill-terracotta)" stroke="#5A4A42" strokeWidth="3" />
    {/* Sprouting seedling leaves */}
    <path d="M60 68 V35" stroke="#5A4A42" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M60 48 Q40 40 45 30 Q58 32 60 48 Z" fill="url(#ill-leaves)" stroke="#5A4A42" strokeWidth="2.5" />
    <path d="M60 40 Q80 32 75 22 Q62 25 60 40 Z" fill="url(#ill-leaves)" stroke="#5A4A42" strokeWidth="2.5" />
  </svg>
);

export const Tea = ({ className = "w-16 h-16", ...props }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDefs />
    <ellipse cx="60" cy="98" rx="28" ry="4" fill="url(#ill-shadow)" />
    {/* Ceramic tea cup */}
    <path d="M35 55 C35 80, 85 80, 85 55 Z" fill="url(#ill-lavender)" stroke="#5A4A42" strokeWidth="3.5" />
    {/* Handle */}
    <path d="M85 58 Q96 60 94 68 Q92 76 83 72" fill="none" stroke="#5A4A42" strokeWidth="3.5" strokeLinecap="round" />
    {/* Steam lines */}
    <path d="M50 42 Q46 32 50 25 Q54 18 50 12" fill="none" stroke="#D98C6B" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M62 45 Q58 35 62 28 Q66 21 62 15" fill="none" stroke="#D98C6B" strokeWidth="2.5" strokeLinecap="round" />
    {/* Tea bag leaf label hanging */}
    <path d="M38 52 Q26 50 24 64" fill="none" stroke="#5A4A42" strokeWidth="2" />
    <rect x="18" y="64" width="10" height="12" rx="2" fill="url(#ill-peach)" stroke="#5A4A42" strokeWidth="1.5" />
  </svg>
);

export const Clouds = ({ className = "w-16 h-16", ...props }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDefs />
    {/* Multiple overlapping soft clouds */}
    <g transform="translate(10, 20)" opacity="0.85">
      <path d="M35 50 A15 15 0 0 1 50 35 A20 20 0 0 1 85 40 A15 15 0 0 1 95 50 H35 Z" fill="#FEFCFA" stroke="#5A4A42" strokeWidth="3" strokeLinejoin="round" />
    </g>
    <g transform="translate(30, 45)">
      <path d="M25 45 A12 12 0 0 1 37 33 A16 16 0 0 1 65 37 A12 12 0 0 1 73 45 H25 Z" fill="url(#ill-peach)" stroke="#5A4A42" strokeWidth="3" strokeLinejoin="round" />
    </g>
  </svg>
);

export const Rain = ({ className = "w-16 h-16", ...props }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <GradientDefs />
    {/* Cloud with raindrops */}
    <g transform="translate(20, 20)">
      <path d="M25 45 A12 12 0 0 1 37 33 A16 16 0 0 1 65 37 A12 12 0 0 1 73 45 H25 Z" fill="url(#ill-lavender)" stroke="#5A4A42" strokeWidth="3.5" strokeLinejoin="round" />
    </g>
    {/* Rain lines */}
    <path d="M45 75 L40 85 M60 75 L55 85 M75 75 L70 85 M50 92 L45 102 M65 92 L60 102" stroke="#CFC8E8" strokeWidth="3" strokeLinecap="round" />
  </svg>
);
