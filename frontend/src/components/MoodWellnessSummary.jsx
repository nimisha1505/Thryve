import React, { useEffect, useRef, useState } from 'react';
import { Smile, Flame, BookOpen, Activity } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Animated SVG ring — smooth fill animation on mount
// ─────────────────────────────────────────────────────────────────────────────
const Ring = ({ pct, color, size = 80, stroke = 7 }) => {
  const [animPct, setAnimPct] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimPct(pct), 80);
    return () => clearTimeout(t);
  }, [pct]);

  const r    = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const off  = circ * (1 - Math.min(Math.max(animPct, 0), 1));

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
    >
      {/* Track */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="#F0EBE5"
        strokeWidth={stroke}
      />
      {/* Progress */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={off}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(0.16,1,0.3,1)' }}
      />
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Individual stat card — premium design
// ─────────────────────────────────────────────────────────────────────────────
const SummaryCard = ({ label, value, unit, pct, icon: Icon, color, description, emoji }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group relative flex flex-col items-center gap-5 p-8 rounded-[28px] overflow-hidden cursor-default transition-all duration-300"
      style={{
        background: 'linear-gradient(145deg, #FEFCFA 0%, #FFF9F5 100%)',
        border: `1.5px solid #E7D8CC`,
        boxShadow: hovered
          ? `0 20px 50px rgba(90,74,66,0.09), 0 0 0 1px ${color}20`
          : '0 4px 20px rgba(90,74,66,0.04)',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Hover glow orb */}
      <div
        className="absolute inset-0 rounded-[28px] pointer-events-none transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse 90% 60% at 50% 0%, ${color}10 0%, transparent 70%)`,
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Icon */}
      <div
        className="relative z-10 w-11 h-11 rounded-[15px] flex items-center justify-center transition-transform duration-300"
        style={{
          background: `${color}12`,
          border: `1px solid ${color}28`,
          transform: hovered ? 'scale(1.12)' : 'scale(1)',
        }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>

      {/* Ring + value overlay */}
      <div className="relative z-10 flex items-center justify-center">
        <Ring pct={pct} color={color} size={96} stroke={7.5} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-extrabold leading-none tabular-nums"
            style={{
              fontSize: value !== null && value !== undefined && String(value).length > 4 ? '0.95rem' : '1.15rem',
              color: '#5A4A42',
            }}
          >
            {value ?? '—'}
          </span>
          {unit && (
            <span
              className="font-bold uppercase tracking-wider leading-none mt-1"
              style={{ fontSize: '8px', color: '#A89890' }}
            >
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Label block */}
      <div className="relative z-10 text-center">
        <span className="block text-[11px] font-extrabold text-[#5A4A42] uppercase tracking-wider leading-tight">
          {label}
        </span>
        {description && (
          <span className="block text-[11px] text-[#A89890] font-medium mt-1.5 leading-snug">
            {description}
          </span>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MoodWellnessSummary
// ─────────────────────────────────────────────────────────────────────────────
const MoodWellnessSummary = ({ stats, totalCount }) => {
  const avg7   = stats?.average7d   ?? null;
  const streak = stats?.streak      ?? 0;
  const total  = totalCount         ?? 0;
  const weekly = stats
    ? Math.min(100, Math.round(((stats.streak || 0) / 7) * 100))
    : 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#A89890] mb-2.5">
          Wellness Summary
        </p>
        <h2 className="text-[2.5rem] font-extrabold text-[#5A4A42] leading-tight tracking-tight">
          Your emotional health snapshot
        </h2>
        <p className="text-[0.9rem] text-[#A89890] font-medium mt-2.5 leading-relaxed">
          A gentle overview of how you've been showing up for yourself.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          label="Average Mood"
          value={avg7 !== null ? parseFloat(avg7).toFixed(1) : null}
          unit="/ 10"
          pct={avg7 !== null ? avg7 / 10 : 0}
          icon={Smile}
          color="#D98C6B"
          description="7-day baseline"
        />
        <SummaryCard
          label="Current Streak"
          value={streak}
          unit="days"
          pct={streak / Math.max(streak, 30)}
          icon={Flame}
          color="#E29382"
          description="Consecutive days"
        />
        <SummaryCard
          label="Journal Entries"
          value={total}
          unit="total"
          pct={total / Math.max(total, 100)}
          icon={BookOpen}
          color="#B8C9A3"
          description="All time logs"
        />
        <SummaryCard
          label="Weekly Rhythm"
          value={weekly}
          unit="%"
          pct={weekly / 100}
          icon={Activity}
          color="#D98C6B"
          description="This week"
        />
      </div>
    </div>
  );
};

export default MoodWellnessSummary;
