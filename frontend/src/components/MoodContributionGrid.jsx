import React, { useMemo, useState } from 'react';
import { Plant } from './Illustrations.jsx';
import { Leaf, Flame, Crown, Calendar, Target, CheckCircle2, Lock } from 'lucide-react';

// Geometry & Configuration
const WEEKS_COUNT = 38;   // number of columns to fill the card
const CELL_SIZE   = 20;   // 20px cell size
const GAP         = 3;    // 3px gap
const RADIUS      = 5;    // 5px rounded corners

function scoreToColor(score) {
  if (!score) return null;
  if (score <= 2)  return { bg: '#E79A9A', border: '#D88A8A' };
  if (score <= 4)  return { bg: '#F4B183', border: '#E3A072' };
  if (score <= 6)  return { bg: '#F6D58E', border: '#E4C37C' };
  return              { bg: '#A8D5BA', border: '#97C4A9' };
}

const EMPTY_BG     = '#EEE5DD';
const EMPTY_BORDER = '#DDD2C8';
const FUTURE_BG    = '#F5ECE5';
const FUTURE_BORDER= '#E7D8CC';

// Format date to local key YYYY-MM-DD to avoid UTC timezone offset bugs
function getLocalDateKey(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Build grid logic representing the last 38 weeks ending today
function buildGrid(allLogs) {
  const todayDate = new Date();
  const todayKey  = getLocalDateKey(todayDate);

  const dayMap = {};
  for (const log of allLogs) {
    if (!log.loggedAt) continue;
    const k = getLocalDateKey(new Date(log.loggedAt));
    if (!dayMap[k] || log.moodScore > dayMap[k].score) {
      dayMap[k] = { score: log.moodScore, notes: log.notes || '' };
    }
  }

  const start = new Date(todayDate);
  const dow   = start.getDay();
  const totalDays = WEEKS_COUNT * 7;
  // Go back to Monday of current week, then back WEEKS_COUNT - 1 weeks (totalDays - 7 days)
  start.setDate(start.getDate() - (dow === 0 ? 6 : dow - 1) - (totalDays - 7));
  start.setHours(0, 0, 0, 0);

  const cells = [];
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = getLocalDateKey(d);
    cells.push({
      date:     d,
      key,
      entry:    dayMap[key] || null,
      isFuture: key > todayKey,
      isToday:  key === todayKey,
    });
  }
  return cells;
}

// Compute stats
function computeStats(allLogs) {
  if (!allLogs?.length) {
    return { currentStreak: 0, longestStreak: 0, totalCheckins: 0, consistency: 0 };
  }

  const loggedDays = new Set(
    allLogs.map(l => new Date(l.loggedAt).toISOString().slice(0, 10))
  );
  const sorted = Array.from(loggedDays).sort();
  const total  = sorted.length;

  // Longest streak
  let longest = 1, run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = (new Date(sorted[i]) - new Date(sorted[i - 1])) / 86400000;
    run = diff === 1 ? run + 1 : 1;
    if (run > longest) longest = run;
  }

  // Current streak (backwards from today)
  let current = 0;
  const check = new Date();
  while (current <= total) {
    if (loggedDays.has(check.toISOString().slice(0, 10))) {
      current++;
      check.setDate(check.getDate() - 1);
    } else break;
  }

  // 30-day consistency
  let hits = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (loggedDays.has(d.toISOString().slice(0, 10))) hits++;
  }

  return {
    currentStreak: current,
    longestStreak: longest || current,
    totalCheckins: total,
    consistency:   Math.round((hits / 30) * 100),
  };
}

const BADGES = [
  { id: 'first',   icon: '🌱', label: 'First Log',      desc: 'You began',         color: '#7AAA5A', req: s => s.totalCheckins >= 1   },
  { id: 'week',    icon: '🔥', label: '7-Day Streak',   desc: 'One full week',      color: '#E2834A', req: s => s.currentStreak >= 7   },
  { id: 'thirty',  icon: '📅', label: '30 Logs',         desc: 'A month of care',    color: '#D98C6B', req: s => s.totalCheckins >= 30  },
  { id: 'century', icon: '🏆', label: '100 Logs',        desc: 'True dedication',   color: '#C4A030', req: s => s.totalCheckins >= 100 },
  { id: 'consist', icon: '🌿', label: '80% Consistent', desc: 'Steady practice',    color: '#5A9070', req: s => s.consistency >= 80    },
];

const SCORE_LABELS = {
  1: 'Very Low', 2: 'Down', 3: 'Uncomfortable', 4: 'Neutral', 5: 'Content',
  6: 'Good', 7: 'Peaceful', 8: 'Happy', 9: 'Joyful', 10: 'Radiant',
};

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Premium Achievement Chip Component
const AchievementChip = ({ badge, earned }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '12px',
        background: earned 
          ? (hovered ? 'rgba(217, 140, 107, 0.08)' : 'rgba(217, 140, 107, 0.04)') 
          : 'rgba(238, 229, 221, 0.25)',
        border: earned 
          ? `1px solid ${hovered ? 'rgba(217, 140, 107, 0.25)' : 'rgba(217, 140, 107, 0.15)'}` 
          : '1px dashed #DDCFC8',
        transition: 'all 0.2s ease',
        cursor: 'default',
      }}
    >
      <span style={{ fontSize: '14px', filter: earned ? 'none' : 'grayscale(0.6)' }}>
        {badge.icon}
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: earned ? '#5A4A42' : '#8B766C' }}>
          {badge.label}
        </span>
      </div>
      {earned ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-[#7AAA5A] fill-[#7AAA5A] fill-opacity-10" style={{ marginLeft: '2px' }} />
      ) : (
        <Lock className="w-3.5 h-3.5 text-[#B8AEA8]" style={{ marginLeft: '2px' }} />
      )}
    </div>
  );
};

// Main Component
const MoodContributionGrid = ({ allLogs = [] }) => {
  const cells   = useMemo(() => buildGrid(allLogs), [allLogs]);
  const stats   = useMemo(() => computeStats(allLogs), [allLogs]);
  const hasLogs = allLogs.length > 0;

  const weeks = useMemo(() => {
    const result = [];
    for (let w = 0; w < WEEKS_COUNT; w++) result.push(cells.slice(w * 7, w * 7 + 7));
    return result;
  }, [cells]);

  const fmtLong = d =>
    d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  // Calculate month label when month changes relative to the previous week
  const getMonthLabel = (week, wIdx) => {
    const firstDay = week[0]?.date;
    if (!firstDay) return null;
    if (wIdx === 0) {
      return firstDay.toLocaleDateString(undefined, { month: 'short' });
    }
    const prevWeek = weeks[wIdx - 1];
    if (!prevWeek) return null;
    const currentMonth = firstDay.getMonth();
    const prevMonth = prevWeek[0]?.date.getMonth();
    if (currentMonth !== prevMonth) {
      return firstDay.toLocaleDateString(undefined, { month: 'short' });
    }
    return null;
  };

  return (
    <div className="w-full" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Title & Subtitle Stacked */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#5A4A42', margin: 0, letterSpacing: '-0.02em' }}>
          Mood Journey
        </h3>
        <p style={{ fontSize: '12px', color: '#A89890', fontWeight: 500, margin: 0 }}>
          Your {WEEKS_COUNT}-week mood journey
        </p>
      </div>

      {/* Stats pills row directly below the title */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Current Streak */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-[#EDE4DC] shadow-sm">
          <Flame className="w-4 h-4 text-[#E2834A] fill-[#E2834A] fill-opacity-10" />
          <div className="flex flex-col">
            <span style={{ fontSize: '8px', fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#A89890', lineHeight: 1.1 }}>Current Streak</span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#5A4A42', lineHeight: 1.1, marginTop: '2px' }}>{stats.currentStreak} days</span>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-[#EDE4DC] shadow-sm">
          <Crown className="w-4 h-4 text-[#C4A030] fill-[#C4A030] fill-opacity-10" />
          <div className="flex flex-col">
            <span style={{ fontSize: '8px', fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#A89890', lineHeight: 1.1 }}>Longest Streak</span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#5A4A42', lineHeight: 1.1, marginTop: '2px' }}>{stats.longestStreak} days</span>
          </div>
        </div>

        {/* Total Logs */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-[#EDE4DC] shadow-sm">
          <Calendar className="w-4 h-4 text-[#D98C6B] fill-[#D98C6B] fill-opacity-10" />
          <div className="flex flex-col">
            <span style={{ fontSize: '8px', fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#A89890', lineHeight: 1.1 }}>Total Logs</span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#5A4A42', lineHeight: 1.1, marginTop: '2px' }}>{stats.totalCheckins}</span>
          </div>
        </div>

        {/* Consistency */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-[#EDE4DC] shadow-sm">
          <Target className="w-4 h-4 text-[#5A9070] fill-[#5A9070] fill-opacity-10" />
          <div className="flex flex-col">
            <span style={{ fontSize: '8px', fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#A89890', lineHeight: 1.1 }}>Consistency</span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#5A4A42', lineHeight: 1.1, marginTop: '2px' }}>{stats.consistency}%</span>
          </div>
        </div>
      </div>

      {/* ── Empty state or Grid ─────────────────────────────────────────── */}
      {!hasLogs ? (
        <div
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '64px 24px', gap: '20px',
            borderRadius: '24px', background: 'rgba(245,236,229,0.30)',
            border: '1px dashed #E7D8CC',
          }}
        >
          <Plant style={{ width: '80px', height: '80px', opacity: 0.65 }} />
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#5A4A42', margin: 0 }}>
              Your story hasn't started yet.
            </h3>
            <p style={{ fontSize: '14px', color: '#A89890', marginTop: '8px', maxWidth: '280px', lineHeight: 1.6 }}>
              Log your first check-in and watch your emotional garden grow, one day at a time.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', marginTop: '10px' }}>
          
          {/* Left-aligned Scrollable container to maintain alignment with weekday labels and fill card width */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              
              {/* Weekday labels column */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: `${GAP}px`,
                paddingTop: '20px', // aligns with month labels row (18px + 2px)
                width: '32px',
                flexShrink: 0,
              }}>
                {DAY_LABELS.map((lbl, i) => (
                  <div key={i} style={{
                    height: `${CELL_SIZE}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#A89890',
                    textTransform: 'uppercase',
                    paddingRight: '6px',
                    letterSpacing: '0.04em',
                  }}>
                    {lbl}
                  </div>
                ))}
              </div>

              {/* Heatmap Grid (Months + Columns container) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: `${GAP}px` }}>
                
                {/* Month labels row */}
                <div style={{ display: 'flex', gap: `${GAP}px`, height: '18px', marginBottom: '2px' }}>
                  {weeks.map((week, wIdx) => {
                    const monthLabel = getMonthLabel(week, wIdx);
                    return (
                      <div key={wIdx} style={{ width: `${CELL_SIZE}px`, position: 'relative' }}>
                        {monthLabel && (
                          <span style={{
                            position: 'absolute',
                            left: 0,
                            fontSize: '10px',
                            fontWeight: 800,
                            color: '#A89890',
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            whiteSpace: 'nowrap',
                          }}>
                            {monthLabel}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Columns container (stuck closely together for dense streaks) */}
                <div style={{ display: 'flex', gap: `${GAP}px` }}>
                  {weeks.map((week, wIdx) => (
                    <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: `${GAP}px` }}>
                      {week.map((cell, dayIdx) => {
                        if (!cell) {
                          return <div key={dayIdx} style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` }} />;
                        }

                        const color = cell.entry ? scoreToColor(cell.entry.score) : null;
                        return (
                          <div key={dayIdx} className="journey-tooltip" style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` }}>
                            <div
                              className="journey-cell"
                              style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: `${RADIUS}px`,
                                background: color ? color.bg : cell.isFuture ? FUTURE_BG : EMPTY_BG,
                                border: `1px solid ${color ? color.border : cell.isFuture ? FUTURE_BORDER : EMPTY_BORDER}`,
                                opacity: cell.isFuture ? 0.28 : 1,
                                outline: cell.isToday ? '2px solid #D98C6B' : 'none',
                                outlineOffset: '1.5px',
                              }}
                            />

                            {!cell.isFuture && (
                              <div className="journey-tooltiptext">
                                <div
                                  style={{
                                    fontWeight: 700,
                                    color: '#F5EDE8',
                                    fontSize: '11px',
                                    marginBottom: '5px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                  }}
                                >
                                  {fmtLong(cell.date)}
                                  {cell.isToday && (
                                    <span
                                      style={{
                                        fontSize: '9px',
                                        fontWeight: 600,
                                        color: '#F7D8C5',
                                        background: 'rgba(255,255,255,0.13)',
                                        borderRadius: '4px',
                                        padding: '1px 5px',
                                      }}
                                    >
                                      Today
                                    </span>
                                  )}
                                </div>

                                {cell.entry ? (
                                  <>
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        marginBottom: cell.entry.notes ? '5px' : 0,
                                      }}
                                    >
                                      <span
                                        style={{
                                          display: 'inline-block',
                                          width: '8px',
                                          height: '8px',
                                          borderRadius: '2px',
                                          flexShrink: 0,
                                          background: color?.bg || '#D98C6B',
                                        }}
                                      />
                                      <span style={{ color: '#F0D8C8', fontSize: '11px', fontWeight: 600 }}>
                                        {cell.entry.score}/10 · {SCORE_LABELS[cell.entry.score]}
                                      </span>
                                    </div>

                                    {cell.entry.notes && (
                                      <div
                                        style={{
                                          color: '#C8BAB2',
                                          fontSize: '10px',
                                          fontStyle: 'italic',
                                          lineHeight: 1.45,
                                          display: '-webkit-box',
                                          WebkitLineClamp: 2,
                                          WebkitBoxOrient: 'vertical',
                                          overflow: 'hidden',
                                          borderTop: '1px solid rgba(255,255,255,0.08)',
                                          paddingTop: '5px',
                                        }}
                                      >
                                        "{cell.entry.notes.slice(0, 90)}{cell.entry.notes.length > 90 ? '…' : ''}"
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div style={{ color: '#C4B8B0', fontSize: '10px' }}>
                                    No log recorded
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>

          {/* Legend and Achievements below heatmap */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginTop: '10px',
            paddingTop: '12px',
            borderTop: '1px solid #EDE4DC',
          }}>
            {/* Legend row */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: '#A89890',
              fontWeight: 500,
            }}>
              <span>Lower mood</span>
              {['#E79A9A', '#F4B183', '#F6D58E', '#A8D5BA'].map((color, idx) => (
                <div
                  key={idx}
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '3px',
                    background: color,
                    border: '1px solid rgba(90,74,66,0.1)',
                  }}
                />
              ))}
              <span>Higher mood</span>
              <span style={{ margin: '0 8px', color: '#EDE4DC' }}>|</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '3px',
                    background: EMPTY_BG,
                    border: `1px solid ${EMPTY_BORDER}`,
                  }}
                />
                <span>No log</span>
              </div>
              <span style={{ margin: '0 8px', color: '#EDE4DC' }}>|</span>
              <span style={{ fontStyle: 'italic', color: '#8B766C' }}>
                ● Today
              </span>
            </div>

            {/* Achievements row */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              <span style={{
                fontSize: '10px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.10em',
                color: '#A89890',
              }}>
                Achievements
              </span>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
              }}>
                {BADGES.map(badge => {
                  const earned = badge.req(stats);
                  return (
                    <AchievementChip key={badge.id} badge={badge} earned={earned} />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodContributionGrid;
