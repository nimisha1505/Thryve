import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens — warm palette
// ─────────────────────────────────────────────────────────────────────────────
const PALETTE = {
  bg:      '#FEFCF9',
  border:  '#EDE4DC',
  text:    '#5A4A42',
  muted:   '#A89890',
  faint:   '#C4B8B0',
};

// Donut slice colours (Great → Bad) — warm & accessible
const DONUT_COLORS = [
  { key: 'Great',    color: '#7AAA5A', label: 'Great'    },
  { key: 'Good',     color: '#D98C6B', label: 'Good'     },
  { key: 'Okay',     color: '#E8C090', label: 'Okay'     },
  { key: 'Bad',      color: '#D4A070', label: 'Bad'      },
  { key: 'Very Bad', color: '#C87070', label: 'Very Bad' },
];

// Score 1-10 → category label
function scoreToCategory(score) {
  if (score >= 9) return 'Great';
  if (score >= 7) return 'Good';
  if (score >= 5) return 'Okay';
  if (score >= 3) return 'Bad';
  return 'Very Bad';
}

// ─────────────────────────────────────────────────────────────────────────────
// Premium line chart tooltip
// ─────────────────────────────────────────────────────────────────────────────
const LineTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const val = parseFloat(payload[0].value);
  return (
    <div
      style={{
        background:    'rgba(254,252,249,0.98)',
        border:        '1px solid #EDE4DC',
        borderRadius:  '16px',
        padding:       '12px 16px',
        boxShadow:     '0 8px 32px rgba(90,74,66,0.10)',
        backdropFilter:'blur(12px)',
        minWidth:      '110px',
      }}
    >
      <p style={{ fontSize: '10px', fontWeight: 700, color: PALETTE.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
        {label}
      </p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: PALETTE.text, lineHeight: 1 }}>
          {val.toFixed(1)}
        </span>
        <span style={{ fontSize: '11px', fontWeight: 600, color: PALETTE.faint }}>/10</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Custom donut tooltip
// ─────────────────────────────────────────────────────────────────────────────
const DonutTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div
      style={{
        background:    'rgba(254,252,249,0.98)',
        border:        '1px solid #EDE4DC',
        borderRadius:  '14px',
        padding:       '10px 14px',
        boxShadow:     '0 8px 24px rgba(90,74,66,0.10)',
        backdropFilter:'blur(12px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.payload.fill, flexShrink: 0, display: 'inline-block' }} />
        <span style={{ fontSize: '11px', fontWeight: 700, color: PALETTE.text }}>{d.name}</span>
      </div>
      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: PALETTE.text, lineHeight: 1 }}>
        {d.value}%
      </span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Tick style shared
// ─────────────────────────────────────────────────────────────────────────────
const tick = { fill: '#C4B8B0', fontSize: 10, fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif' };

// ─────────────────────────────────────────────────────────────────────────────
// Card shell
// ─────────────────────────────────────────────────────────────────────────────
const InsightCard = ({ children, style = {} }) => (
  <div
    style={{
      background:   PALETTE.bg,
      border:       `1px solid ${PALETTE.border}`,
      borderRadius: '28px',
      padding:      '32px',
      boxShadow:    '0 2px 20px rgba(90,74,66,0.05)',
      display:      'flex',
      flexDirection:'column',
      gap:          '24px',
      ...style,
    }}
  >
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Card label pair
// ─────────────────────────────────────────────────────────────────────────────
const CardLabel = ({ icon, title, sub }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '17px', lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: '15px', fontWeight: 800, color: PALETTE.text, letterSpacing: '-0.01em' }}>
        {title}
      </span>
    </div>
    {sub && (
      <p style={{ fontSize: '11px', fontWeight: 600, color: PALETTE.muted, textTransform: 'uppercase', letterSpacing: '0.08em', paddingLeft: '25px' }}>
        {sub}
      </p>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────────────────────
const Empty = ({ message }) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '24px 0', minHeight: '140px' }}>
    <span style={{ fontSize: '1.8rem', opacity: 0.4 }}>🌱</span>
    <p style={{ fontSize: '11px', color: PALETTE.faint, fontStyle: 'italic', textAlign: 'center', maxWidth: '160px', lineHeight: 1.55 }}>
      {message}
    </p>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Inline plant SVG for AI card
// ─────────────────────────────────────────────────────────────────────────────
const PlantSVG = () => (
  <svg width="60" height="72" viewBox="0 0 60 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="22" y="50" width="16" height="20" rx="4" fill="#C8A878" opacity="0.60" />
    <ellipse cx="30" cy="52" rx="10" ry="6" fill="#B89868" opacity="0.50" />
    <path d="M30 50 C30 50 18 38 20 22 C22 10 30 4 30 4 C30 4 38 10 40 22 C42 38 30 50 30 50 Z" fill="#9AC87A" opacity="0.88" />
    <path d="M30 50 C30 50 16 40 14 28 C12 18 18 10 28 16 C28 16 20 28 22 36 C24 44 30 50 30 50 Z" fill="#B8D89A" opacity="0.72" />
    <path d="M30 50 C30 50 44 40 46 28 C48 18 42 10 32 16 C32 16 40 28 38 36 C36 44 30 50 30 50 Z" fill="#7AB860" opacity="0.72" />
    <path d="M30 4 L30 50" stroke="#6A9848" strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
    <path d="M22 28 C16 24 14 18 18 14" stroke="#6A9848" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.45" />
    <path d="M38 28 C44 24 46 18 42 14" stroke="#6A9848" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.45" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Build donut data from distributionData (array of {score, count})
// ─────────────────────────────────────────────────────────────────────────────
function buildDonutData(distributionData) {
  const totals = {};
  for (const { score, count } of distributionData) {
    const cat = scoreToCategory(score);
    totals[cat] = (totals[cat] || 0) + count;
  }
  const sum = Object.values(totals).reduce((a, b) => a + b, 0);
  if (!sum) return [];
  return DONUT_COLORS
    .map(({ key, color, label }) => ({
      name:  label,
      value: Math.round(((totals[key] || 0) / sum) * 100),
      fill:  color,
    }))
    .filter(d => d.value > 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
const MoodChart = ({
  dailyData       = [],
  weeklyData      = [],
  distributionData = [],
  stats,
}) => {
  const hasDaily  = dailyData.length > 0;
  const donutData = useMemo(() => buildDonutData(distributionData), [distributionData]);
  const hasDonut  = donutData.length > 0;

  // AI insight text
  const trend   = stats?.trend;
  const avg7    = stats?.average7d;
  const streak  = stats?.streak;
  let insightText  = null;
  let insightWord  = null;
  let insightColor = '#7AAA5A';
  if (trend === 'improving') {
    insightText  = `Your mood has been`;
    insightWord  = 'improving';
    insightColor = '#7AAA5A';
  } else if (trend === 'declining') {
    insightText  = `Your mood has been`;
    insightWord  = 'shifting';
    insightColor = '#D4A070';
  } else if (avg7 != null && parseFloat(avg7) >= 7) {
    insightText  = `You're holding at a strong`;
    insightWord  = `${parseFloat(avg7).toFixed(1)}/10`;
    insightColor = '#7AAA5A';
  } else if (streak && streak >= 7) {
    insightText  = `${streak} days in a row. That's`;
    insightWord  = 'consistency';
    insightColor = '#D98C6B';
  } else {
    insightText  = `Every check-in is an act of`;
    insightWord  = 'self-care';
    insightColor = '#D98C6B';
  }
  const insightSuffix = trend === 'improving'
    ? 'over the past 2 weeks. Keep nurturing these positive habits!'
    : trend === 'declining'
    ? 'lately. Be gentle with yourself — this too shall pass. 💛'
    : avg7 != null && parseFloat(avg7) >= 7
    ? 'this week. Your dedication is paying off. ✨'
    : streak && streak >= 7
    ? '. Showing up every day is its own kind of strength. 🔥'
    : '. You\'re building something meaningful. 🌿';

  return (
    <div
      style={{
        display:       'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap:           '20px',
        alignItems:    'stretch',
      }}
    >
      {/* ══ CARD 1: Mood Trend ══════════════════════════════════════════════ */}
      <InsightCard>
        <CardLabel icon="📈" title="Mood Trend" sub="Last 30 days" />

        {hasDaily ? (
          <div style={{ height: '184px', marginLeft: '-8px', marginRight: '-4px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 10, right: 4, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#D98C6B" stopOpacity={0.22} />
                    <stop offset="80%"  stopColor="#D98C6B" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={tick}
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[1, 10]}
                  ticks={[2, 5, 8]}
                  tick={tick}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<LineTooltip />} cursor={{ stroke: '#E7D8CC', strokeWidth: 1, strokeDasharray: '4 3' }} />
                <Area
                  type="monotone"
                  dataKey="avgScore"
                  stroke="#D98C6B"
                  strokeWidth={2.5}
                  fill="url(#trendGrad)"
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: '#D98C6B',
                    stroke: '#FEFCF9',
                    strokeWidth: 3,
                    filter: 'drop-shadow(0 2px 6px rgba(217,140,107,0.50))',
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <Empty message="Log more moods to see your daily trend." />
        )}
      </InsightCard>

      {/* ══ CARD 2: Mood Distribution ═══════════════════════════════════════ */}
      <InsightCard>
        <CardLabel icon="🍩" title="Mood Distribution" sub="How you've felt" />

        {hasDonut ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Donut */}
            <div style={{ height: '150px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={54}
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {donutData.map((d, i) => (
                      <Cell key={i} fill={d.fill} opacity={0.88} />
                    ))}
                  </Pie>
                  <Tooltip content={<DonutTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {donutData.map((d) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: d.fill, flexShrink: 0, display: 'inline-block' }} />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: PALETTE.text }}>{d.name}</span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: PALETTE.muted }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Empty message="Log more moods to see your distribution." />
        )}
      </InsightCard>

      {/* ══ CARD 3: AI Insight ══════════════════════════════════════════════ */}
      <InsightCard
        style={{
          background:  'linear-gradient(145deg, #FEFCF9 0%, #FFF7F2 100%)',
          border:      '1px solid #EDE4DC',
          position:    'relative',
          overflow:    'hidden',
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position:   'absolute',
            top:        0,
            right:      0,
            width:      '120px',
            height:     '120px',
            background: 'radial-gradient(circle, rgba(217,140,107,0.12) 0%, transparent 70%)',
            transform:  'translate(20%, -20%)',
            pointerEvents: 'none',
          }}
        />

        <CardLabel icon="✦" title="AI Insight" sub="Pattern analysis" />

        {/* Plant illustration */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4px', paddingBottom: '4px' }}>
          <PlantSVG />
        </div>

        {/* Insight text */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '12px' }}>
          <p
            style={{
              fontSize:    '13px',
              fontWeight:  500,
              color:       PALETTE.text,
              lineHeight:  1.65,
            }}
          >
            {insightText}{' '}
            <span style={{ fontWeight: 800, color: insightColor }}>
              {insightWord}
            </span>{' '}
            {insightSuffix}
          </p>

          {/* Subtle score badge if available */}
          {avg7 != null && (
            <div
              style={{
                display:      'inline-flex',
                alignItems:   'center',
                gap:          '6px',
                padding:      '6px 12px',
                borderRadius: '10px',
                background:   'rgba(217,140,107,0.08)',
                border:       '1px solid rgba(217,140,107,0.20)',
                alignSelf:    'flex-start',
              }}
            >
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#D98C6B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                7-day avg
              </span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#5A4A42' }}>
                {parseFloat(avg7).toFixed(1)}/10
              </span>
            </div>
          )}
        </div>
      </InsightCard>
    </div>
  );
};

export default MoodChart;
