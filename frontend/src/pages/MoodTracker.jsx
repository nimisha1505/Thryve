import React, {
  useState, useEffect, useContext, useCallback, useRef,
} from 'react';
import { AuthContext }          from '../context/AuthContext.jsx';
import MoodForm                 from '../components/MoodForm.jsx';
import MoodHistory              from '../components/MoodHistory.jsx';
import MoodChart                from '../components/MoodChart.jsx';
import MoodContributionGrid     from '../components/MoodContributionGrid.jsx';
import MoodWellnessSummary      from '../components/MoodWellnessSummary.jsx';
import { Tea } from '../components/Illustrations.jsx';
import {
  getMoods, deleteMood, getMoodStats, getMoodTrends,
} from '../services/moodService.js';
import { AlertCircle, Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return 'Still up?';
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  if (h < 21) return 'Good Evening';
  return 'Good Night';
}

function getGreetingEmoji() {
  const h = new Date().getHours();
  if (h < 5)  return '🌙';
  if (h < 12) return '🌿';
  if (h < 17) return '☀️';
  if (h < 21) return '🌅';
  return '🌙';
}

function getHeroGradient() {
  const h = new Date().getHours();
  if (h < 5)  return 'linear-gradient(135deg, #EDE5F0 0%, #F5ECE5 60%, #FFF9F5 100%)';
  if (h < 12) return 'linear-gradient(135deg, #FFF5EE 0%, #FFF9F5 60%, #F0F5EC 100%)';
  if (h < 17) return 'linear-gradient(135deg, #FFF9F5 0%, #FEF8F0 60%, #F5F0E5 100%)';
  if (h < 21) return 'linear-gradient(135deg, #F8F2EE 0%, #FFF9F5 60%, #F0EEF8 100%)';
  return        'linear-gradient(135deg, #EDE5F0 0%, #F5ECE5 100%)';
}

function getMoodWeatherText(stats) {
  if (!stats) return 'How are you feeling today?';
  const avg = stats.average7d;
  if (avg >= 8) return 'You\'re radiating warmth this week ✨';
  if (avg >= 6) return 'Things are looking bright ☀️';
  if (avg >= 4) return 'A balanced, steady week 🌿';
  return 'Be gentle with yourself today 💛';
}

function deriveInsight(stats) {
  if (!stats) return null;
  const avg7  = stats.average7d;
  const avg30 = stats.average30d;
  const streak= stats.streak || 0;

  if (streak >= 14)
    return `You've shown up for yourself ${streak} days in a row. That's not a habit — it's a practice. 🌱`;
  if (streak >= 7)
    return `Seven consecutive days of self-awareness. Small acts of care compound over time. 🔥`;
  if (stats.trend === 'improving' && avg7 > avg30)
    return `This week's average (${parseFloat(avg7).toFixed(1)}) is climbing above your monthly baseline. Something is shifting. ✨`;
  if (stats.trend === 'declining')
    return `Your recent scores are softer than usual. Be gentle with yourself — this too shall pass. 💛`;
  if (avg7 >= 7.5)
    return `You've been radiating at ${parseFloat(avg7).toFixed(1)}/10 this week. Let that energy guide you forward. 😊`;
  if (avg7 >= 5)
    return `Holding steady at ${parseFloat(avg7).toFixed(1)}/10. Consistency is its own kind of strength.`;
  return 'Every check-in is a small act of self-care. You\'re building something meaningful. 🌿';
}

// ─────────────────────────────────────────────────────────────────────────────
// Decorative helpers
// ─────────────────────────────────────────────────────────────────────────────
const Divider = () => (
  <div className="flex items-center gap-6 py-2">
    <div
      className="flex-1 h-px"
      style={{ background: 'linear-gradient(to right, transparent, #E7D8CC, transparent)' }}
    />
    <div className="w-1.5 h-1.5 rounded-full bg-[#D98C6B] opacity-30" />
    <div
      className="flex-1 h-px"
      style={{ background: 'linear-gradient(to right, transparent, #E7D8CC, transparent)' }}
    />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Fade-in section wrapper
// ─────────────────────────────────────────────────────────────────────────────
const Fade = ({ delay = 0, children, className = '' }) => (
  <div
    className={`animate-fadeIn ${className}`}
    style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
  >
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Section title block
// ─────────────────────────────────────────────────────────────────────────────
const SectionTitle = ({ eyebrow, title, sub, right }) => (
  <div className="flex items-start justify-between gap-4 mb-8">
    <div>
      {eyebrow && (
        <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#A89890] mb-2.5">
          {eyebrow}
        </p>
      )}
      <h2 className="text-[2.5rem] font-extrabold text-[#5A4A42] leading-tight tracking-tight">
        {title}
      </h2>
      {sub && (
        <p className="text-[0.9rem] text-[#A89890] font-medium mt-2.5 leading-relaxed max-w-md">
          {sub}
        </p>
      )}
    </div>
    {right && <div className="flex-shrink-0">{right}</div>}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Daily Quote data
// ─────────────────────────────────────────────────────────────────────────────
const QUOTES = [
  { text: "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, frustrated, scared, or anxious.", attr: 'Lori Deschene' },
  { text: 'Feelings are just visitors. Let them come and go.', attr: 'Mooji' },
  { text: 'Almost everything will work again if you unplug it for a few minutes, including you.', attr: 'Anne Lamott' },
  { text: 'The good life is a process, not a state of being. It is a direction, not a destination.', attr: 'Carl Rogers' },
  { text: 'You are allowed to be both a masterpiece and a work in progress simultaneously.', attr: 'Sophia Bush' },
  { text: 'Caring for yourself is not self-indulgence, it is self-preservation.', attr: 'Audre Lorde' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Reflection Footer
// ─────────────────────────────────────────────────────────────────────────────
// Tea cup + saucer illustration
// ─────────────────────────────────────────────────────────────────────────────
const TeaIllustration = () => (
  <svg width="110" height="120" viewBox="0 0 110 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cupGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F7D8C5" />
        <stop offset="100%" stopColor="#E8B898" />
      </linearGradient>
      <linearGradient id="teaLiquid" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#D4A070" stopOpacity="0.80" />
        <stop offset="100%" stopColor="#C08850" stopOpacity="0.90" />
      </linearGradient>
      <linearGradient id="saucerGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F0D4B8" />
        <stop offset="100%" stopColor="#E0C0A0" />
      </linearGradient>
    </defs>

    {/* Saucer */}
    <ellipse cx="55" cy="100" rx="44" ry="10" fill="url(#saucerGrad)" />
    <ellipse cx="55" cy="98"  rx="40" ry="8"  fill="#F8E0C8" opacity="0.70" />
    <ellipse cx="55" cy="97"  rx="34" ry="5"  fill="#FFF0E0" opacity="0.50" />

    {/* Cup body */}
    <path d="M22 55 Q22 95 55 95 Q88 95 88 55 Z" fill="url(#cupGrad)" />
    <path d="M22 55 Q22 95 55 95 Q88 95 88 55" fill="none" stroke="#D4A880" strokeWidth="1.5" />

    {/* Cup rim ellipse */}
    <ellipse cx="55" cy="55" rx="33" ry="9" fill="#F0CCAA" />
    <ellipse cx="55" cy="55" rx="31" ry="7" fill="#F8DCB8" />

    {/* Tea liquid inside */}
    <ellipse cx="55" cy="58" rx="28" ry="6" fill="url(#teaLiquid)" />

    {/* Cup handle */}
    <path d="M88 64 Q104 64 104 76 Q104 88 88 88" stroke="#D4A880" strokeWidth="4.5" fill="none" strokeLinecap="round" />
    <path d="M88 64 Q100 64 100 76 Q100 88 88 88" stroke="#F0CCAA" strokeWidth="2" fill="none" strokeLinecap="round" />

    {/* Steam wisps */}
    <path d="M42 46 Q38 38 42 30 Q46 22 42 14" stroke="#C4AE98" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.55" />
    <path d="M55 43 Q51 35 55 27 Q59 19 55 11" stroke="#C4AE98" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.55" />
    <path d="M68 46 Q64 38 68 30 Q72 22 68 14" stroke="#C4AE98" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.45" />

    {/* Decorative rim stripe */}
    <path d="M23 60 Q55 68 87 60" stroke="#D98C6B" strokeWidth="1.5" fill="none" opacity="0.30" strokeLinecap="round" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Botanical flowers (right side decoration)
// ─────────────────────────────────────────────────────────────────────────────
const BotanicalRight = () => (
  <svg width="120" height="160" viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Tall stem center */}
    <line x1="60" y1="155" x2="60" y2="55" stroke="#8A9A70" strokeWidth="2.5" strokeLinecap="round" />
    {/* Leaf left */}
    <path d="M60 90 C52 82 40 80 36 70 C44 72 58 76 60 90 Z" fill="#A8C088" opacity="0.80" />
    <path d="M60 90 L48 75" stroke="#8A9A70" strokeWidth="1.2" strokeLinecap="round" opacity="0.60" />
    {/* Leaf right */}
    <path d="M60 110 C68 102 80 100 84 90 C76 92 62 96 60 110 Z" fill="#B8C898" opacity="0.75" />
    <path d="M60 110 L72 95" stroke="#8A9A70" strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />

    {/* Main flower — center */}
    <circle cx="60" cy="52" r="7"  fill="#F8D090" />
    <circle cx="60" cy="52" r="4"  fill="#EDBA60" />
    {/* Petals */}
    <ellipse cx="60" cy="41" rx="5" ry="8"  fill="#F4C0A8" opacity="0.88" transform="rotate(0   60 52)" />
    <ellipse cx="60" cy="41" rx="5" ry="8"  fill="#F4C0A8" opacity="0.82" transform="rotate(45  60 52)" />
    <ellipse cx="60" cy="41" rx="5" ry="8"  fill="#F4C0A8" opacity="0.82" transform="rotate(90  60 52)" />
    <ellipse cx="60" cy="41" rx="5" ry="8"  fill="#F4C0A8" opacity="0.82" transform="rotate(135 60 52)" />
    <ellipse cx="60" cy="41" rx="5" ry="8"  fill="#F4C0A8" opacity="0.76" transform="rotate(180 60 52)" />
    <ellipse cx="60" cy="41" rx="5" ry="8"  fill="#F4C0A8" opacity="0.76" transform="rotate(225 60 52)" />
    <ellipse cx="60" cy="41" rx="5" ry="8"  fill="#F4C0A8" opacity="0.76" transform="rotate(270 60 52)" />
    <ellipse cx="60" cy="41" rx="5" ry="8"  fill="#F4C0A8" opacity="0.76" transform="rotate(315 60 52)" />

    {/* Left smaller stem + bud */}
    <line x1="60" y1="130" x2="30" y2="88" stroke="#8A9A70" strokeWidth="2" strokeLinecap="round" />
    <circle cx="28" cy="84" r="5"  fill="#F8E0C0" />
    <circle cx="28" cy="84" r="3"  fill="#F0CA90" />
    <ellipse cx="28" cy="76" rx="3.5" ry="6" fill="#F4C0A8" opacity="0.80" transform="rotate(10 28 84)" />
    <ellipse cx="28" cy="76" rx="3.5" ry="6" fill="#F4C0A8" opacity="0.75" transform="rotate(90 28 84)" />
    <ellipse cx="28" cy="76" rx="3.5" ry="6" fill="#F4C0A8" opacity="0.75" transform="rotate(170 28 84)" />
    <ellipse cx="28" cy="76" rx="3.5" ry="6" fill="#F4C0A8" opacity="0.70" transform="rotate(250 28 84)" />

    {/* Right smaller stem + bud */}
    <line x1="60" y1="115" x2="88" y2="78" stroke="#8A9A70" strokeWidth="2" strokeLinecap="round" />
    <circle cx="90" cy="75" r="4.5" fill="#F8D8B8" />
    <circle cx="90" cy="75" r="2.5" fill="#EEC880" />
    <ellipse cx="90" cy="68" rx="3" ry="5.5" fill="#F0B8A0" opacity="0.80" transform="rotate(-10 90 75)" />
    <ellipse cx="90" cy="68" rx="3" ry="5.5" fill="#F0B8A0" opacity="0.75" transform="rotate(80  90 75)" />
    <ellipse cx="90" cy="68" rx="3" ry="5.5" fill="#F0B8A0" opacity="0.75" transform="rotate(170 90 75)" />
    <ellipse cx="90" cy="68" rx="3" ry="5.5" fill="#F0B8A0" opacity="0.70" transform="rotate(260 90 75)" />

    {/* Small grass tufts at base */}
    <path d="M50 155 Q48 142 52 135" stroke="#98AA78" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M60 155 Q58 140 62 132" stroke="#88A068" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M70 155 Q72 143 68 136" stroke="#98AA78" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Reflection Footer
// ─────────────────────────────────────────────────────────────────────────────
const ReflectionFooter = () => {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const quote = QUOTES[dayOfYear % QUOTES.length];

  return (
    <div
      className="relative rounded-[32px] overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #FFF5EE 0%, #FEF0E4 40%, #F5EDE5 70%, #EEF2E8 100%)',
        border: '1px solid #E7D8CC',
        boxShadow: '0 4px 40px rgba(90,74,66,0.05)',
      }}
    >
      {/* ── Background ambient glows ─────────────────────────────────────── */}
      <div
        className="absolute top-0 left-0 w-80 h-80 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(217,140,107,0.10) 0%, transparent 65%)',
          transform: 'translate(-20%, -20%)',
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-96 h-96 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(184,201,163,0.14) 0%, transparent 65%)',
          transform: 'translate(20%, 20%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(247,216,197,0.10) 0%, transparent 70%)',
        }}
      />

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div
        className="relative z-10 flex items-center justify-between"
        style={{ padding: '72px 68px', gap: '48px' }}
      >

        {/* LEFT — Tea cup illustration */}
        <div
          className="hidden md:flex flex-col items-center gap-3 flex-shrink-0"
          style={{ width: '130px' }}
        >
          <TeaIllustration />
          <p
            style={{
              fontSize:     '9px',
              fontWeight:   700,
              color:        '#C4B8B0',
              textTransform:'uppercase',
              letterSpacing:'0.22em',
              textAlign:    'center',
            }}
          >
            Slow down
          </p>
        </div>

        {/* CENTER — Quote ─────────────────────────────────────────────── */}
        <div
          className="flex flex-col items-center text-center flex-1"
          style={{ gap: '20px', maxWidth: '560px', margin: '0 auto' }}
        >
          {/* Opening big quote mark */}
          <span
            aria-hidden="true"
            style={{
              fontSize:   '6.5rem',
              lineHeight: 0.7,
              color:      '#D98C6B',
              fontFamily: 'Georgia, serif',
              opacity:    0.55,
              alignSelf:  'flex-start',
              marginLeft: '-8px',
            }}
          >
            "
          </span>

          {/* Quote body */}
          <p
            style={{
              fontSize:     '1.3rem',
              fontWeight:   500,
              color:        '#5A4A42',
              lineHeight:   1.80,
              letterSpacing:'-0.005em',
              marginTop:    '-22px',
            }}
          >
            {quote.text}
          </p>

          {/* Closing quote mark */}
          <span
            aria-hidden="true"
            style={{
              fontSize:   '6.5rem',
              lineHeight: 0.7,
              color:      '#D98C6B',
              fontFamily: 'Georgia, serif',
              opacity:    0.55,
              alignSelf:  'flex-end',
              marginRight:'-8px',
              marginTop:  '-16px',
            }}
          >
            "
          </span>

          {/* Attribution */}
          <p
            style={{
              fontSize:     '13px',
              fontWeight:   600,
              color:        '#A89890',
              letterSpacing:'0.05em',
              marginTop:    '-8px',
            }}
          >
            — {quote.attr}
          </p>

          {/* Closing warm line */}
          <div
            style={{
              marginTop:    '8px',
              paddingTop:   '20px',
              borderTop:    '1px solid rgba(217,140,107,0.20)',
              width:        '100%',
              display:      'flex',
              flexDirection:'column',
              alignItems:   'center',
              gap:          '5px',
            }}
          >
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#8B766C', lineHeight: 1.6 }}>
              Every small step counts, even on the hard days.
            </p>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#D98C6B' }}>
              You're showing up for yourself, and that matters. ♥
            </p>
            <p style={{ fontSize: '11px', fontWeight: 500, color: '#B8AEA8', marginTop: '2px', fontStyle: 'italic' }}>
              — Keep going, you've got this.
            </p>
          </div>
        </div>

        {/* RIGHT — Botanical decoration */}
        <div
          className="hidden md:flex flex-col items-center flex-shrink-0"
          style={{ width: '130px' }}
        >
          <BotanicalRight />
        </div>

      </div>
    </div>
  );
};



// ─────────────────────────────────────────────────────────────────────────────
// Hero Landscape Illustration — painted watercolour scene matching spec image
// ─────────────────────────────────────────────────────────────────────────────
const HeroIllustration = () => (
  <svg viewBox="0 0 360 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <defs>
      <linearGradient id="hSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFF8F2" />
        <stop offset="45%" stopColor="#FDEBD8" />
        <stop offset="100%" stopColor="#F7C9A2" />
      </linearGradient>
      <linearGradient id="hMtnFar" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#D4B9AA" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#C4A292" stopOpacity="0.40" />
      </linearGradient>
      <linearGradient id="hMtnNear" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#BBA494" stopOpacity="0.60" />
        <stop offset="100%" stopColor="#A08272" stopOpacity="0.50" />
      </linearGradient>
      <radialGradient id="hSunHalo" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FDEAB0" stopOpacity="0.95" />
        <stop offset="55%" stopColor="#F7C880" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#F7C880" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="hTree" cx="50%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#AACA8C" />
        <stop offset="100%" stopColor="#7CA068" />
      </radialGradient>
      <radialGradient id="hTree2" cx="50%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#C6DCA8" />
        <stop offset="100%" stopColor="#92BA7A" />
      </radialGradient>
      <linearGradient id="hWater" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#E8C9A8" stopOpacity="0.72" />
        <stop offset="100%" stopColor="#D4AA82" stopOpacity="0.38" />
      </linearGradient>
      <linearGradient id="hGrass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#BAD09A" />
        <stop offset="100%" stopColor="#92AA72" />
      </linearGradient>
    </defs>

    {/* Sky */}
    <rect width="360" height="300" fill="url(#hSky)" />

    {/* Sun halo + core */}
    <circle cx="262" cy="68" r="72" fill="url(#hSunHalo)" />
    <circle cx="262" cy="68" r="30" fill="#FDEAB8" opacity="0.92" />
    <circle cx="262" cy="68" r="20" fill="#F9D090" opacity="0.95" />

    {/* Birds */}
    <path d="M58 36 Q63 30 68 36"   stroke="#8B6A58" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.55" />
    <path d="M76 26 Q82 20 88 26"   stroke="#8B6A58" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.52" />
    <path d="M98 40 Q103 34 108 40"  stroke="#8B6A58" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.44" />
    <path d="M116 30 Q121 25 126 30" stroke="#8B6A58" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.38" />
    <path d="M42 50 Q46 45 50 50"   stroke="#8B6A58" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.32" />

    {/* Far mountains */}
    <path d="M0 200 L50 128 L100 175 L158 100 L212 152 L258 115 L308 144 L360 112 L360 248 L0 248 Z" fill="url(#hMtnFar)" />
    {/* Near mountains */}
    <path d="M0 222 L42 165 L88 195 L142 135 L196 178 L245 145 L292 168 L338 148 L360 160 L360 258 L0 258 Z" fill="url(#hMtnNear)" />

    {/* River / water */}
    <ellipse cx="182" cy="262" rx="92" ry="16" fill="url(#hWater)" />
    <path d="M100 260 Q140 253 182 257 Q222 261 265 256" stroke="#E8C090" strokeWidth="1.5" fill="none" opacity="0.65" />
    <path d="M115 267 Q160 261 198 265 Q235 268 268 263" stroke="#E0B880" strokeWidth="1" fill="none" opacity="0.40" />

    {/* Grass ground */}
    <path d="M0 252 Q90 242 182 246 Q275 250 360 244 L360 300 L0 300 Z" fill="url(#hGrass)" opacity="0.82" />

    {/* Left small tree */}
    <rect x="12" y="200" width="7" height="44" rx="3" fill="#7A5A48" opacity="0.58" />
    <ellipse cx="16" cy="190" rx="20" ry="24" fill="url(#hTree2)" opacity="0.80" />
    <ellipse cx="6"  cy="202" rx="13" ry="16" fill="#AAC892" opacity="0.62" />
    <ellipse cx="28" cy="198" rx="14" ry="17" fill="#92B870" opacity="0.58" />

    {/* Main tall tree (right side) */}
    <rect x="270" y="162" width="13" height="108" rx="5" fill="#7A5038" opacity="0.78" />
    <ellipse cx="277" cy="108" rx="50" ry="62" fill="url(#hTree)"  opacity="0.88" />
    <ellipse cx="252" cy="132" rx="36" ry="44" fill="#8AB872" opacity="0.72" />
    <ellipse cx="302" cy="126" rx="34" ry="40" fill="url(#hTree2)" opacity="0.68" />
    <ellipse cx="270" cy="84"  rx="38" ry="48" fill="#98C47A" opacity="0.78" />
    <ellipse cx="262" cy="92"  rx="17" ry="22" fill="#CAE6AA" opacity="0.42" />

    {/* Small right-edge tree */}
    <rect x="336" y="212" width="8" height="58" rx="3" fill="#7A5038" opacity="0.68" />
    <ellipse cx="340" cy="200" rx="22" ry="27" fill="#92B86A" opacity="0.78" />
    <ellipse cx="328" cy="210" rx="15" ry="19" fill="#AACA82" opacity="0.62" />

    {/* Flowers LEFT */}
    <line x1="28" y1="272" x2="28" y2="252" stroke="#6A8852" strokeWidth="2" strokeLinecap="round" />
    <line x1="40" y1="274" x2="40" y2="257" stroke="#6A8852" strokeWidth="2" strokeLinecap="round" />
    <line x1="16" y1="276" x2="16" y2="260" stroke="#6A8852" strokeWidth="2" strokeLinecap="round" />
    <circle cx="28" cy="248" r="8"   fill="#F4C2B2" opacity="0.90" />
    <circle cx="28" cy="248" r="4.5" fill="#F8DDD0" opacity="0.95" />
    <circle cx="40" cy="254" r="7"   fill="#F7D2BA" opacity="0.86" />
    <circle cx="40" cy="254" r="3.5" fill="#FDE8D8" opacity="0.95" />
    <circle cx="16" cy="257" r="6"   fill="#F0BAA8" opacity="0.82" />
    <circle cx="16" cy="257" r="3"   fill="#F8D8C8" opacity="0.95" />
    <circle cx="28" cy="241" r="4" fill="#F4C2B2" opacity="0.68" />
    <circle cx="35" cy="244" r="4" fill="#F4C2B2" opacity="0.62" />
    <circle cx="21" cy="244" r="4" fill="#F4C2B2" opacity="0.62" />

    {/* Flowers RIGHT */}
    <line x1="350" y1="270" x2="350" y2="250" stroke="#6A8852" strokeWidth="2" strokeLinecap="round" />
    <line x1="338" y1="274" x2="338" y2="258" stroke="#6A8852" strokeWidth="2" strokeLinecap="round" />
    <circle cx="350" cy="246" r="8"   fill="#F4C2B2" opacity="0.90" />
    <circle cx="350" cy="246" r="4.5" fill="#F8DDD0" opacity="0.95" />
    <circle cx="338" cy="255" r="7"   fill="#F0BAA8" opacity="0.85" />
    <circle cx="338" cy="255" r="3.5" fill="#F8D8C8" opacity="0.95" />
    <circle cx="350" cy="239" r="4" fill="#F4C2B2" opacity="0.65" />
    <circle cx="357" cy="243" r="4" fill="#F4C2B2" opacity="0.58" />
    <circle cx="343" cy="243" r="4" fill="#F4C2B2" opacity="0.58" />

    {/* Grass tufts */}
    <path d="M55 272 Q58 262 61 272" stroke="#7AAA5A" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M65 270 Q68 259 71 270" stroke="#8AB86A" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M198 278 Q201 268 204 278" stroke="#7AAA5A" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M208 276 Q211 265 214 276" stroke="#8AB86A" strokeWidth="1.8" fill="none" strokeLinecap="round" />

    {/* Atmospheric haze */}
    <ellipse cx="180" cy="198" rx="195" ry="22" fill="#FFF4EC" opacity="0.28" />
  </svg>
);


// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
const MoodTracker = () => {
  const { user } = useContext(AuthContext);

  // ── State (unchanged business logic) ─────────────────────────────────────
  const [moodLogs,     setMoodLogs]     = useState([]);
  const [page,         setPage]         = useState(1);
  const [limit]                         = useState(5);
  const [totalCount,   setTotalCount]   = useState(0);
  const [stats,        setStats]        = useState(null);
  const [trends,       setTrends]       = useState(null);
  const [allLogs,      setAllLogs]      = useState([]);

  const [loadingLogs,      setLoadingLogs]      = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const [editEntry,     setEditEntry]     = useState(null);
  const [errorMessage,  setErrorMessage]  = useState(null);

  const checkInRef = useRef(null);

  // ── Derived ───────────────────────────────────────────────────────────────
  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Friend';
  const greeting  = getGreeting();
  const emoji     = getGreetingEmoji();
  const insight   = deriveInsight(stats);
  const weatherText = getMoodWeatherText(stats);

  const TrendIcon =
    stats?.trend === 'improving' ? TrendingUp :
    stats?.trend === 'declining' ? TrendingDown :
    Minus;

  // ── Fetchers (unchanged API calls) ────────────────────────────────────────
  const fetchLogs = useCallback(async (pageNum = 1) => {
    try {
      setLoadingLogs(true);
      setErrorMessage(null);
      const data = await getMoods(pageNum, limit);
      if (data?.success) {
        setMoodLogs(data.data.moodLogs);
        setTotalCount(data.data.totalCount);
        setPage(data.data.page);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to retrieve mood history.');
    } finally {
      setLoadingLogs(false);
    }
  }, [limit]);

  const fetchAllLogsForGrid = useCallback(async () => {
    try {
      const data = await getMoods(1, 365);
      if (data?.success) setAllLogs(data.data.moodLogs || []);
    } catch { /* grid degrades gracefully */ }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoadingAnalytics(true);
      setErrorMessage(null);
      const [sRes, tRes] = await Promise.all([getMoodStats(), getMoodTrends()]);
      if (sRes?.success && tRes?.success) {
        setStats(sRes.data);
        setTrends(tRes.data);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to retrieve analytics.');
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(1);
    fetchAllLogsForGrid();
    fetchAnalytics();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchLogs(page);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers (unchanged) ──────────────────────────────────────────────────
  const handleFormSubmitSuccess = () => {
    setEditEntry(null);
    fetchLogs(1);
    fetchAllLogsForGrid();
    fetchAnalytics();
  };

  const handleEditInit = (entry) => {
    setEditEntry(entry);
    checkInRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCancelEdit = () => setEditEntry(null);

  const handleDelete = async (id) => {
    try {
      setErrorMessage(null);
      const res = await deleteMood(id);
      if (res?.success) {
        const newTotal   = totalCount - 1;
        const totalPages = Math.ceil(newTotal / limit) || 1;
        fetchLogs(page > totalPages ? totalPages : page);
        fetchAllLogsForGrid();
        fetchAnalytics();
        if (editEntry?._id === id) setEditEntry(null);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to delete mood entry.');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex flex-col gap-0 page-fade-in mx-auto"
      style={{ maxWidth: '1040px' }}
    >

      {/* ═══ SECTION 1 — HERO ═══════════════════════════════════════════════ */}
      <Fade delay={0} className="mb-10">
        <div
          className="relative rounded-[32px] overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #FFFAF6 0%, #FFF5EE 55%, #F5EDE4 100%)',
            border: '1px solid #E7D8CC',
            boxShadow: '0 2px 24px rgba(90,74,66,0.05)',
            minHeight: '320px',
          }}
        >
          {/* Soft ambient top-left glow */}
          <div
            className="absolute top-0 left-0 w-72 h-72 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(247,216,197,0.35) 0%, transparent 65%)',
              transform: 'translate(-15%, -20%)',
            }}
          />

          {/* Floating decorative leaf — top left */}
          <div
            className="absolute pointer-events-none"
            style={{ top: '18px', left: '22px', opacity: 0.18 }}
          >
            <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
              <path d="M14 2 C14 2 26 10 26 22 C26 30 20 35 14 35 C8 35 2 30 2 22 C2 10 14 2 14 2 Z" fill="#B8C9A3" />
              <path d="M14 2 L14 35" stroke="#8FAF78" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>

          {/* Floating decorative leaf — bottom right of text area */}
          <div
            className="absolute pointer-events-none"
            style={{ bottom: '24px', left: '200px', opacity: 0.14, transform: 'rotate(40deg)' }}
          >
            <svg width="20" height="26" viewBox="0 0 20 26" fill="none">
              <path d="M10 1 C10 1 19 7 19 16 C19 22 15 25 10 25 C5 25 1 22 1 16 C1 7 10 1 10 1 Z" fill="#B8C9A3" />
              <path d="M10 1 L10 25" stroke="#8FAF78" strokeWidth="1" strokeLinecap="round" />
            </svg>
          </div>

          {/* Main content row */}
          <div className="relative z-10 flex items-stretch" style={{ minHeight: '320px' }}>

            {/* ── LEFT: text block (58%) ──────────────────────────── */}
            <div
              className="flex flex-col justify-between p-8 md:p-11"
              style={{ flex: '0 0 58%' }}
            >
              {/* Top text */}
              <div className="flex flex-col gap-3">
                {/* Greeting */}
                <h1
                  className="font-extrabold text-[#5A4A42] leading-[1.1] tracking-tight"
                  style={{ fontSize: '3.0rem' }}
                >
                  {greeting}, {firstName} {emoji}
                </h1>

                {/* Subtitle lines — exactly as in spec */}
                <div className="flex flex-col gap-1">
                  <p className="font-medium leading-relaxed" style={{ fontSize: '0.9rem', color: '#8B766C' }}>
                    Every day is a new beginning.
                  </p>
                  <p className="font-medium leading-relaxed" style={{ fontSize: '0.9rem', color: '#8B766C' }}>
                    How are you feeling today?
                  </p>
                </div>
              </div>

              {/* ── Stat cards row ─────────────────────────────────── */}
              <div className="flex gap-3 mt-6 flex-wrap">

                {/* Current Streak */}
                <div
                  className="flex flex-col gap-1 px-5 py-4 rounded-[16px] min-w-[100px]"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E7D8CC',
                    boxShadow: '0 2px 10px rgba(90,74,66,0.06)',
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span style={{ fontSize: '15px' }}>🔥</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#A89890' }}>Current Streak</span>
                  </div>
                  <span className="font-extrabold leading-none" style={{ fontSize: '1.3rem', color: '#5A4A42' }}>
                    {stats?.streak ?? 0} Days
                  </span>
                  <span className="text-[10px] font-semibold mt-0.5" style={{ color: '#A89890' }}>Keep it going!</span>
                </div>

                {/* Average Mood */}
                <div
                  className="flex flex-col gap-1 px-5 py-4 rounded-[16px] min-w-[100px]"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E7D8CC',
                    boxShadow: '0 2px 10px rgba(90,74,66,0.06)',
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span style={{ fontSize: '15px' }}>😊</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#A89890' }}>Average Mood</span>
                  </div>
                  <span className="font-extrabold leading-none" style={{ fontSize: '1.3rem', color: '#5A4A42' }}>
                    {stats?.average7d != null ? `${parseFloat(stats.average7d).toFixed(1)}/10` : '—'}
                  </span>
                  <span className="text-[10px] font-semibold mt-0.5" style={{ color: '#B8C9A3' }}>
                    This Month {stats?.trend === 'improving' ? '▲' : stats?.trend === 'declining' ? '▼' : '–'}
                  </span>
                </div>

                {/* Consistency */}
                <div
                  className="flex flex-col gap-1 px-5 py-4 rounded-[16px] min-w-[100px]"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E7D8CC',
                    boxShadow: '0 2px 10px rgba(90,74,66,0.06)',
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span style={{ fontSize: '15px' }}>✅</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#A89890' }}>Consistency</span>
                  </div>
                  <span className="font-extrabold leading-none" style={{ fontSize: '1.3rem', color: '#5A4A42' }}>
                    {stats?.consistency != null ? `${stats.consistency}%` : '—'}
                  </span>
                  <span className="text-[10px] font-semibold mt-0.5" style={{ color: '#A89890' }}>Great job!</span>
                </div>

                {/* Total Reflections */}
                <div
                  className="flex flex-col gap-1 px-5 py-4 rounded-[16px] min-w-[100px]"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E7D8CC',
                    boxShadow: '0 2px 10px rgba(90,74,66,0.06)',
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span style={{ fontSize: '15px' }}>📅</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#A89890' }}>Total Reflections</span>
                  </div>
                  <span className="font-extrabold leading-none" style={{ fontSize: '1.3rem', color: '#5A4A42' }}>
                    {totalCount ?? 0}
                  </span>
                  <span className="text-[10px] font-semibold mt-0.5" style={{ color: '#A89890' }}>All time</span>
                </div>


              </div>
            </div>

            {/* ── RIGHT: landscape illustration (42%) ─────────────── */}
            <div
              className="hidden sm:block flex-1 relative overflow-hidden"
              style={{ borderRadius: '0 32px 32px 0' }}
            >
              <HeroIllustration />
            </div>

          </div>
        </div>
      </Fade>

      {/* ═══ SECTION 2 — DAILY CHECK-IN ═════════════════════════════════════ */}
      <Fade delay={80} className="mb-14">
        {errorMessage && (
          <div
            className="mb-6 flex items-center gap-3 px-5 py-4 rounded-2xl text-sm animate-fadeIn"
            style={{
              background: 'rgba(226,147,130,0.07)',
              border: '1px solid rgba(226,147,130,0.25)',
              color: '#C4584A',
            }}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}
        <div ref={checkInRef}>
          <MoodForm
            onSubmitSuccess={handleFormSubmitSuccess}
            editEntry={editEntry}
            onCancelEdit={handleCancelEdit}
          />
        </div>
      </Fade>

      <Fade delay={120} className="mb-8">
        <Divider />
      </Fade>

      {/* ═══ SECTION 3 — MOOD JOURNEY GRID ══════════════════════════════════ */}
      <Fade delay={160} className="mb-14">
        <div
          className="rounded-[32px]"
          style={{
            padding: '40px 44px',
            background: 'linear-gradient(145deg, #FFFCF9 0%, #FFF8F4 60%, #F9F3EE 100%)',
            border: '1px solid #E7D8CC',
            boxShadow: '0 8px 48px rgba(90,74,66,0.07), 0 2px 12px rgba(90,74,66,0.04)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top-right ambient glow — makes the section feel rich */}
          <div
            style={{
              position: 'absolute', top: 0, right: 0,
              width: '320px', height: '320px',
              background: 'radial-gradient(circle, rgba(217,140,107,0.07) 0%, transparent 65%)',
              transform: 'translate(20%, -20%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute', bottom: 0, left: 0,
              width: '240px', height: '240px',
              background: 'radial-gradient(circle, rgba(127,168,106,0.06) 0%, transparent 65%)',
              transform: 'translate(-20%, 20%)',
              pointerEvents: 'none',
            }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <MoodContributionGrid allLogs={allLogs} />
          </div>
        </div>
      </Fade>

      <Fade delay={200} className="mb-8">
        <Divider />
      </Fade>

      {/* ═══ SECTION 4 — WELLNESS INSIGHTS ══════════════════════════════════ */}
      <Fade delay={240} className="mb-14">
        {/* Section header */}
        <div
          className="flex items-start justify-between gap-4 mb-7"
        >
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5">
              <span
                className="flex items-center justify-center w-8 h-8 rounded-[10px]"
                style={{ background: 'rgba(217,140,107,0.10)' }}
              >
                <Sparkles className="w-4 h-4" style={{ color: '#D98C6B' }} />
              </span>
              <h2
                className="font-extrabold text-[#5A4A42] tracking-tight"
                style={{ fontSize: '1.65rem' }}
              >
                Wellness Insights
              </h2>
            </div>
            <p
              className="text-sm font-medium leading-relaxed"
              style={{ color: '#A89890', paddingLeft: '2.5rem' }}
            >
              Understand your patterns and trends
            </p>
          </div>
          {/* "This Month" badge */}
          <button
            className="flex items-center gap-1.5 px-4 py-2 rounded-[12px] text-xs font-bold flex-shrink-0 mt-1 transition-all duration-200"
            style={{
              background: '#FEFCF9',
              border:     '1px solid #E7D8CC',
              color:      '#D98C6B',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(217,140,107,0.40)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E7D8CC'; }}
          >
            This Month
            <span style={{ opacity: 0.7 }}>↓</span>
          </button>
        </div>

        {loadingAnalytics ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="h-72 rounded-[24px]"
                style={{ background: '#F5EDE5', border: '1px solid #EDE4DC' }}
              />
            ))}
          </div>
        ) : trends ? (
          <MoodChart
            dailyData={trends.dailyTrends}
            weeklyData={trends.weeklyTrends}
            distributionData={trends.distribution}
            stats={stats}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[
              { icon: '📈', title: 'Mood Trend',        msg: 'Log more moods to see your daily trend.' },
              { icon: '🍩', title: 'Mood Distribution',  msg: 'Log more moods to see your distribution.' },
              { icon: '✦',  title: 'AI Insight',         msg: 'Insights appear after a few check-ins.' },
            ].map(({ icon, title, msg }) => (
              <div
                key={title}
                className="rounded-[24px] p-7 flex flex-col gap-5"
                style={{ background: '#FEFCF9', border: '1px solid #EDE4DC' }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '15px' }}>{icon}</span>
                  <span className="text-sm font-extrabold text-[#5A4A42]">{title}</span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center gap-3 py-6">
                  <span style={{ fontSize: '1.8rem', opacity: 0.35 }}>🌱</span>
                  <p className="text-xs font-medium italic text-center max-w-[160px] leading-relaxed" style={{ color: '#C4B8B0' }}>
                    {msg}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Fade>


      <Fade delay={280} className="mb-8">
        <Divider />
      </Fade>

      {/* ═══ SECTION 5 — REFLECTION TIMELINE ════════════════════════════════ */}
      <Fade delay={320} className="mb-14">
        <MoodHistory
          moodLogs={moodLogs}
          page={page}
          limit={limit}
          totalCount={totalCount}
          loading={loadingLogs}
          onPageChange={p => setPage(p)}
          onEdit={handleEditInit}
          onDelete={handleDelete}
          onReload={() => fetchLogs(page)}
        />
      </Fade>

      <Fade delay={360} className="mb-8">
        <Divider />
      </Fade>

      {/* ═══ SECTION 5b — WELLNESS SUMMARY ══════════════════════════════════ */}
      <Fade delay={400} className="mb-14">
        {loadingAnalytics ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-40 rounded-[28px] bg-[#F5ECE5]/50" style={{ border: '1px solid #E7D8CC' }} />
            ))}
          </div>
        ) : (
          <MoodWellnessSummary stats={stats} totalCount={totalCount} />
        )}
      </Fade>

      <Fade delay={440} className="mb-8">
        <Divider />
      </Fade>

      {/* ═══ SECTION 6 — REFLECTION FOOTER ══════════════════════════════════ */}
      <Fade delay={480} className="mt-4 mb-14">
        <ReflectionFooter />
      </Fade>

    </div>
  );
};

export default MoodTracker;
