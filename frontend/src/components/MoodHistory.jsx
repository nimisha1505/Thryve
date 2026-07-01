import React, { useState } from 'react';
import { Edit2, Trash2, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Score → mood metadata
// ─────────────────────────────────────────────────────────────────────────────
const SCORE_META = {
  1:  { emoji: '😭', label: 'Very Low',      accent: '#C87070', bg: 'rgba(200,112,112,0.08)', border: 'rgba(200,112,112,0.22)' },
  2:  { emoji: '😢', label: 'Down',          accent: '#C87070', bg: 'rgba(200,112,112,0.08)', border: 'rgba(200,112,112,0.22)' },
  3:  { emoji: '😔', label: 'Uncomfortable', accent: '#D4A070', bg: 'rgba(212,160,112,0.08)', border: 'rgba(212,160,112,0.22)' },
  4:  { emoji: '😐', label: 'Neutral',       accent: '#C4AE90', bg: 'rgba(196,174,144,0.08)', border: 'rgba(196,174,144,0.22)' },
  5:  { emoji: '🙂', label: 'Okay',          accent: '#B8AE98', bg: 'rgba(184,174,152,0.08)', border: 'rgba(184,174,152,0.22)' },
  6:  { emoji: '😊', label: 'Content',       accent: '#9AAA80', bg: 'rgba(154,170,128,0.08)', border: 'rgba(154,170,128,0.22)' },
  7:  { emoji: '😌', label: 'Peaceful',      accent: '#7AAA5A', bg: 'rgba(122,170,90,0.08)',  border: 'rgba(122,170,90,0.22)' },
  8:  { emoji: '😁', label: 'Happy',         accent: '#D98C6B', bg: 'rgba(217,140,107,0.08)', border: 'rgba(217,140,107,0.22)' },
  9:  { emoji: '🤩', label: 'Joyful',        accent: '#7AAA5A', bg: 'rgba(122,170,90,0.08)',  border: 'rgba(122,170,90,0.22)' },
  10: { emoji: '😇', label: 'Radiant',       accent: '#5A9A40', bg: 'rgba(90,154,64,0.08)',   border: 'rgba(90,154,64,0.22)' },
};

function getMeta(score) {
  return SCORE_META[score] || SCORE_META[5];
}

// ─────────────────────────────────────────────────────────────────────────────
// Day-of-week short names
// ─────────────────────────────────────────────────────────────────────────────
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday     = d.toDateString() === now.toDateString();
  const yesterday   = new Date(now); yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday)     return { badge: 'Today',     full: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
  if (isYesterday) return { badge: 'Yesterday', full: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };

  return {
    badge: `${DAYS[d.getDay()]}`,
    full:  `${MONTHS[d.getMonth()]} ${d.getDate()}${d.getFullYear() !== now.getFullYear() ? ', ' + d.getFullYear() : ''}`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton card
// ─────────────────────────────────────────────────────────────────────────────
const SkeletonCard = ({ delay = 0 }) => (
  <div
    className="animate-pulse rounded-[24px] p-7 flex gap-5"
    style={{
      background:       '#FEFCF9',
      border:           '1px solid #EDE4DC',
      animationDelay:   `${delay}ms`,
    }}
  >
    <div className="w-14 h-14 rounded-[18px] bg-[#F0EAE4] flex-shrink-0" />
    <div className="flex-1 flex flex-col gap-3 pt-1">
      <div className="flex items-center gap-3">
        <div className="h-5 w-16 bg-[#F0EAE4] rounded-full" />
        <div className="h-3 w-24 bg-[#F5EDE8] rounded-full" />
      </div>
      <div className="h-3 w-full bg-[#F5EDE8] rounded-full" />
      <div className="h-3 w-3/4 bg-[#F5EDE8] rounded-full" />
      <div className="flex gap-2 mt-1">
        <div className="h-5 w-14 bg-[#F0EAE4] rounded-full" />
        <div className="h-5 w-16 bg-[#F0EAE4] rounded-full" />
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Single journal diary card
// ─────────────────────────────────────────────────────────────────────────────
const JournalCard = ({ entry, onEdit, onDelete, index }) => {
  const [hover,   setHover]   = useState(false);
  const [confirm, setConfirm] = useState(false);

  const meta   = getMeta(entry.moodScore);
  const { badge, full } = formatDate(entry.loggedAt);
  const isToday     = badge === 'Today';
  const isYesterday = badge === 'Yesterday';
  const isSpecial   = isToday || isYesterday;

  return (
    <div
      className="animate-fadeIn"
      style={{ animationDelay: `${index * 55}ms`, animationFillMode: 'both' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); }}
    >
      <div
        style={{
          background:    '#FEFCF9',
          border:        `1px solid ${hover ? meta.border : '#EDE4DC'}`,
          borderRadius:  '24px',
          padding:       '32px',
          display:       'flex',
          gap:           '24px',
          transition:    'all 0.28s cubic-bezier(0.16,1,0.3,1)',
          transform:     hover ? 'translateY(-4px)' : 'translateY(0)',
          boxShadow:     hover
            ? `0 20px 48px rgba(90,74,66,0.08), 0 0 0 1px ${meta.accent}22`
            : '0 2px 12px rgba(90,74,66,0.03)',
          cursor: 'default',
          position: 'relative',
        }}
      >
        {/* ── Mood icon column ─────────────────────────────────────────── */}
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', paddingTop: '2px' }}>
          {/* Large emoji avatar */}
          <div
            style={{
              width:        '68px',
              height:       '68px',
              borderRadius: '20px',
              background:   meta.bg,
              border:       `1.5px solid ${meta.border}`,
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'center',
              fontSize:     '2.4rem',
              lineHeight:   1,
              flexShrink:   0,
              transition:   'transform 0.22s ease',
              transform:    hover ? 'scale(1.08)' : 'scale(1)',
              boxShadow:    hover ? `0 8px 20px ${meta.bg}` : 'none',
            }}
          >
            {meta.emoji}
          </div>

          {/* Score */}
          <span
            style={{
              fontSize:   '11px',
              fontWeight: 700,
              color:      meta.accent,
              lineHeight: 1,
            }}
          >
            {entry.moodScore}/10
          </span>
        </div>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0 }}>

          {/* Header row — date badge + label + actions */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Date badge */}
              <span
                style={{
                  display:      'inline-flex',
                  alignItems:   'center',
                  padding:      '4px 10px',
                  borderRadius: '8px',
                  fontSize:     '11px',
                  fontWeight:   800,
                  letterSpacing:'0.02em',
                  background:   isSpecial ? meta.bg  : '#F5EDE8',
                  color:        isSpecial ? meta.accent : '#8B766C',
                  border:       isSpecial ? `1px solid ${meta.border}` : '1px solid #EDE4DC',
                }}
              >
                {badge}
              </span>
              {/* Full date / time */}
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#A89890' }}>
                {full}
              </span>
              {/* Mood label pill */}
              <span
                style={{
                  display:      'inline-flex',
                  padding:      '3px 9px',
                  borderRadius: '6px',
                  fontSize:     '10px',
                  fontWeight:   700,
                  textTransform:'uppercase',
                  letterSpacing:'0.06em',
                  background:   meta.bg,
                  color:        meta.accent,
                  border:       `1px solid ${meta.border}`,
                }}
              >
                {meta.label}
              </span>
            </div>

            {/* ── Action buttons (fade in on hover) ─────────────── */}
            <div
              style={{
                display:    'flex',
                gap:        '4px',
                flexShrink: 0,
                opacity:    hover ? 1 : 0,
                transition: 'opacity 0.20s ease',
              }}
            >
              {confirm ? (
                <div
                  style={{
                    display:      'flex',
                    alignItems:   'center',
                    gap:          '2px',
                    background:   'rgba(200,112,112,0.07)',
                    border:       '1px solid rgba(200,112,112,0.20)',
                    borderRadius: '10px',
                    padding:      '3px',
                  }}
                >
                  <button
                    onClick={() => { onDelete(entry._id); setConfirm(false); }}
                    style={{
                      width: '28px', height: '28px', borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#C87070', cursor: 'pointer', border: 'none', background: 'transparent',
                    }}
                    title="Confirm delete"
                  >
                    <Check size={13} />
                  </button>
                  <button
                    onClick={() => setConfirm(false)}
                    style={{
                      width: '28px', height: '28px', borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#A89890', cursor: 'pointer', border: 'none', background: 'transparent',
                    }}
                    title="Cancel"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => onEdit(entry)}
                    style={{
                      width: '32px', height: '32px', borderRadius: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#A89890', cursor: 'pointer', border: '1px solid #EDE4DC',
                      background: '#FEFCF9', transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#D98C6B'; e.currentTarget.style.borderColor = 'rgba(217,140,107,0.35)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#A89890'; e.currentTarget.style.borderColor = '#EDE4DC'; }}
                    title="Edit"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => setConfirm(true)}
                    style={{
                      width: '32px', height: '32px', borderRadius: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#A89890', cursor: 'pointer', border: '1px solid #EDE4DC',
                      background: '#FEFCF9', transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#C87070'; e.currentTarget.style.borderColor = 'rgba(200,112,112,0.30)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#A89890'; e.currentTarget.style.borderColor = '#EDE4DC'; }}
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tags row */}
          {entry.moodTags?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {entry.moodTags.map(tag => (
                <span
                  key={tag}
                  style={{
                    padding:      '3px 10px',
                    borderRadius: '7px',
                    fontSize:     '10px',
                    fontWeight:   600,
                    background:   '#F5EDE8',
                    color:        '#8B766C',
                    border:       '1px solid #EDE4DC',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Reflection text */}
          {entry.notes && (
            <p
              style={{
                fontSize:   '14px',
                fontWeight: 450,
                color:      '#6A5A52',
                lineHeight: 1.75,
                fontStyle:  'italic',
                borderLeft: `2.5px solid ${meta.accent}40`,
                paddingLeft: '16px',
                margin:     '4px 0 0',
              }}
            >
              {entry.notes.length > 220
                ? entry.notes.slice(0, 220) + '…'
                : entry.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
const MoodHistory = ({
  moodLogs   = [],
  page,
  limit,
  totalCount,
  loading,
  onPageChange,
  onEdit,
  onDelete,
  onReload,
}) => {
  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* ── Section header ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                width:          '32px',
                height:         '32px',
                borderRadius:   '10px',
                background:     'rgba(217,140,107,0.10)',
                fontSize:       '16px',
                lineHeight:     1,
                flexShrink:     0,
              }}
            >
              📖
            </span>
            <h2
              style={{
                fontSize:     '1.65rem',
                fontWeight:   800,
                color:        '#5A4A42',
                letterSpacing:'-0.01em',
                lineHeight:   1.2,
              }}
            >
              Reflection Timeline
            </h2>
          </div>
          <p
            style={{
              fontSize:    '13px',
              fontWeight:  500,
              color:       '#A89890',
              paddingLeft: '42px',
              letterSpacing:'0.03em',
            }}
          >
            Your recent reflections
          </p>
        </div>

        {/* Reload button */}
        {onReload && (
          <button
            onClick={onReload}
            disabled={loading}
            style={{
              padding:      '8px 14px',
              borderRadius: '12px',
              border:       '1px solid #EDE4DC',
              background:   '#FEFCF9',
              color:        '#A89890',
              fontSize:     '11px',
              fontWeight:   700,
              cursor:       loading ? 'not-allowed' : 'pointer',
              opacity:      loading ? 0.5 : 1,
              display:      'flex',
              alignItems:   'center',
              gap:          '5px',
              transition:   'all 0.15s ease',
              marginTop:    '4px',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.color = '#D98C6B'; e.currentTarget.style.borderColor = 'rgba(217,140,107,0.35)'; } }}
            onMouseLeave={e => { e.currentTarget.style.color = '#A89890'; e.currentTarget.style.borderColor = '#EDE4DC'; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
            Refresh
          </button>
        )}
      </div>

      {/* ── Cards list ─────────────────────────────────────────────────── */}
      {loading && moodLogs.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[0, 1, 2].map(i => <SkeletonCard key={i} delay={i * 80} />)}
        </div>
      ) : moodLogs.length === 0 ? (
        /* ── Empty state ──────────────────────────────────────────────── */
        <div
          style={{
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            padding:        '64px 24px',
            borderRadius:   '28px',
            background:     'rgba(245,237,232,0.30)',
            border:         '1px dashed #E0D4CC',
            gap:            '18px',
          }}
        >
          <div style={{ fontSize: '3.5rem', lineHeight: 1, opacity: 0.60 }}>📓</div>
          <div style={{ textAlign: 'center', maxWidth: '280px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#5A4A42', marginBottom: '8px' }}>
              Your story is waiting to unfold.
            </h3>
            <p style={{ fontSize: '13px', color: '#A89890', lineHeight: 1.65, fontWeight: 500 }}>
              Log your first check-in and each entry will appear here as a beautiful journal.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {moodLogs.map((entry, i) => (
            <JournalCard
              key={entry._id}
              entry={entry}
              onEdit={onEdit}
              onDelete={onDelete}
              index={i}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ──────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            paddingTop:     '12px',
            borderTop:      '1px solid #EDE4DC',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#A89890' }}>
            Page {page} of {totalPages}
            <span style={{ opacity: 0.55, marginLeft: '4px' }}>· {totalCount} entries</span>
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { onClick: () => onPageChange(page - 1), disabled: page === 1 || loading, icon: <ChevronLeft size={15} />, title: 'Previous' },
              { onClick: () => onPageChange(page + 1), disabled: page === totalPages || loading, icon: <ChevronRight size={15} />, title: 'Next' },
            ].map(({ onClick, disabled, icon, title }) => (
              <button
                key={title}
                onClick={onClick}
                disabled={disabled}
                title={title}
                style={{
                  width:        '34px',
                  height:       '34px',
                  borderRadius: '10px',
                  border:       '1px solid #EDE4DC',
                  background:   '#FEFCF9',
                  color:        disabled ? '#D4C8C0' : '#8B766C',
                  display:      'flex',
                  alignItems:   'center',
                  justifyContent:'center',
                  cursor:       disabled ? 'not-allowed' : 'pointer',
                  transition:   'all 0.15s ease',
                }}
                onMouseEnter={e => { if (!disabled) { e.currentTarget.style.color = '#D98C6B'; e.currentTarget.style.borderColor = 'rgba(217,140,107,0.35)'; } }}
                onMouseLeave={e => { e.currentTarget.style.color = disabled ? '#D4C8C0' : '#8B766C'; e.currentTarget.style.borderColor = '#EDE4DC'; }}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodHistory;
