import React, { useState, useEffect, useRef } from 'react';
import { createMood, updateMood } from '../services/moodService.js';
import { Loader2, CheckCircle2 } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Mood palette — 5 states matching the spec image
// ─────────────────────────────────────────────────────────────────────────────
const MOODS = [
  {
    emoji: '😡', label: 'Very Bad', score: 2,
    accent: '#D97070', glow: 'rgba(217,112,112,0.22)',
    bg: 'rgba(217,112,112,0.07)', border: 'rgba(217,112,112,0.30)',
    tags: ['Angry', 'Stressed'],
  },
  {
    emoji: '😞', label: 'Bad', score: 3,
    accent: '#D4A070', glow: 'rgba(212,160,112,0.22)',
    bg: 'rgba(212,160,112,0.07)', border: 'rgba(212,160,112,0.30)',
    tags: ['Sad', 'Tired'],
  },
  {
    emoji: '😐', label: 'Okay', score: 5,
    accent: '#B8A898', glow: 'rgba(184,168,152,0.22)',
    bg: 'rgba(184,168,152,0.07)', border: 'rgba(184,168,152,0.30)',
    tags: ['Neutral', 'Calm'],
  },
  {
    emoji: '😊', label: 'Good', score: 7,
    accent: '#7AAA5A', glow: 'rgba(122,170,90,0.24)',
    bg: 'rgba(122,170,90,0.07)', border: 'rgba(122,170,90,0.32)',
    tags: ['Happy', 'Peaceful'],
  },
  {
    emoji: '😄', label: 'Great', score: 9,
    accent: '#5A9A40', glow: 'rgba(90,154,64,0.24)',
    bg: 'rgba(90,154,64,0.08)', border: 'rgba(90,154,64,0.32)',
    tags: ['Energetic', 'Excited', 'Grateful'],
  },
];

function moodIndexFromScore(score) {
  if (score <= 2) return 0;
  if (score <= 4) return 1;
  if (score <= 6) return 2;
  if (score <= 8) return 3;
  return 4;
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS injected once for the custom slider track fill
// ─────────────────────────────────────────────────────────────────────────────
const SLIDER_STYLE_ID = 'mood-checkin-slider-style';
function injectSliderCSS() {
  if (document.getElementById(SLIDER_STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = SLIDER_STYLE_ID;
  el.textContent = `
    .checkin-slider {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 8px;
      border-radius: 99px;
      outline: none;
      cursor: pointer;
      transition: background 0.3s ease;
    }
    .checkin-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #fff;
      border: 2.5px solid currentColor;
      box-shadow: 0 2px 12px rgba(0,0,0,0.14);
      cursor: pointer;
      transition: transform 0.18s ease, box-shadow 0.18s ease;
    }
    .checkin-slider::-webkit-slider-thumb:hover {
      transform: scale(1.18);
      box-shadow: 0 4px 18px rgba(0,0,0,0.20);
    }
    .checkin-slider::-moz-range-thumb {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #fff;
      border: 2.5px solid currentColor;
      box-shadow: 0 2px 12px rgba(0,0,0,0.14);
      cursor: pointer;
    }
    .checkin-slider:focus::-webkit-slider-thumb {
      outline: 3px solid rgba(122,170,90,0.30);
      outline-offset: 2px;
    }
  `;
  document.head.appendChild(el);
}

// ─────────────────────────────────────────────────────────────────────────────
// MoodForm
// ─────────────────────────────────────────────────────────────────────────────
const MoodForm = ({ onSubmitSuccess, editEntry, onCancelEdit }) => {
  const [moodIdx,   setMoodIdx]   = useState(() => editEntry ? moodIndexFromScore(editEntry.moodScore) : 3);
  const [score,     setScore]     = useState(() => editEntry ? editEntry.moodScore : 7);
  const [notes,     setNotes]     = useState(() => editEntry ? (editEntry.notes || '') : '');
  const [loading,   setLoading]   = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [error,     setError]     = useState(null);

  const prevEditEntryIdRef = useRef(editEntry ? editEntry._id : null);

  useEffect(() => { injectSliderCSS(); }, []);

  // Sync edit state only when editEntry ID actually changes
  useEffect(() => {
    const currentId = editEntry ? editEntry._id : null;
    if (currentId !== prevEditEntryIdRef.current) {
      if (editEntry) {
        const idx = moodIndexFromScore(editEntry.moodScore);
        setMoodIdx(idx);
        setScore(editEntry.moodScore);
        setNotes(editEntry.notes || '');
      } else {
        // Reset only the notes when canceling or finishing editing
        setNotes('');
      }
      prevEditEntryIdRef.current = currentId;
      setError(null);
      setSaved(false);
    }
  }, [editEntry]);

  const mood = MOODS[moodIdx];
  const pct  = ((score - 1) / 9) * 100;

  const handleEmojiSelect = (idx) => {
    setMoodIdx(idx);
    setScore(MOODS[idx].score);
    setError(null);
  };

  const handleSlider = (e) => {
    const v = parseInt(e.target.value, 10);
    setScore(v);
    setMoodIdx(moodIndexFromScore(v));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const payload = {
        moodScore: score,
        moodTags:  mood.tags,
        notes,
      };
      if (editEntry) {
        await updateMood(editEntry._id, payload);
      } else {
        await createMood(payload);
        setNotes('');
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2800);
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative rounded-[28px] overflow-hidden"
      style={{
        background: '#FFFCF9',
        border: '1px solid #E7D8CC',
        boxShadow: `0 4px 32px rgba(90,74,66,0.05), 0 0 0 0px transparent`,
        transition: 'box-shadow 0.5s ease',
      }}
    >
      {/* Ambient glow shifts with mood */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse 55% 40% at 25% 0%, ${mood.glow} 0%, transparent 70%)`,
        }}
      />

      <form onSubmit={handleSubmit} className="relative z-10">
        {/* ─── 2-col grid ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-[1.05fr_1fr]">

          {/* ═══ LEFT COLUMN — header + emoji cards ═════════════════════ */}
          <div
            className="flex flex-col gap-8 p-9 md:p-10 md:pr-9"
            style={{ borderBottom: '1px solid #E7D8CC' }}
          >
            {/* Section header */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2.5">
                <span
                  className="flex items-center justify-center w-8 h-8 rounded-[10px]"
                  style={{ background: 'rgba(217,140,107,0.12)' }}
                >
                  <span style={{ fontSize: '16px', lineHeight: 1 }}>❤️</span>
                </span>
                <h2
                  className="font-extrabold text-[#5A4A42] leading-tight tracking-tight"
                  style={{ fontSize: '1.35rem' }}
                >
                  {editEntry ? 'Edit Entry' : 'Daily Check-in'}
                </h2>
              </div>
              <p className="text-sm font-medium leading-relaxed" style={{ color: '#A89890', paddingLeft: '2.5rem' }}>
                {editEntry
                  ? 'Adjust this entry — honesty is always welcome.'
                  : 'Take a moment to reflect on how you feel'}
              </p>
            </div>

            {/* ── 5 Emoji mood cards ─────────────────────────────── */}
            <div className="flex gap-2.5">
              {MOODS.map((m, idx) => {
                const active = moodIdx === idx;
                return (
                  <button
                    key={m.label}
                    type="button"
                    onClick={() => handleEmojiSelect(idx)}
                    className="flex-1 flex flex-col items-center gap-2 py-5 px-1 rounded-[18px] transition-all duration-250 select-none focus:outline-none"
                    style={active ? {
                      background: m.bg,
                      border:     `1.5px solid ${m.border}`,
                      transform:  'translateY(-3px)',
                      boxShadow:  `0 10px 28px ${m.glow}`,
                    } : {
                      background: '#FFF9F5',
                      border:     '1.5px solid #E7D8CC',
                      transform:  'translateY(0)',
                      boxShadow:  'none',
                    }}
                  >
                    {/* Emoji */}
                    <span
                      style={{
                        fontSize:  active ? '2.4rem' : '2.0rem',
                        lineHeight: 1,
                        filter:    active ? `drop-shadow(0 4px 8px ${m.glow})` : 'none',
                        transition: 'all 0.22s ease',
                      }}
                    >
                      {m.emoji}
                    </span>
                    {/* Label */}
                    <span
                      className="text-[9px] font-extrabold uppercase tracking-wider leading-none text-center"
                      style={{ color: active ? m.accent : '#C4B8B0' }}
                    >
                      {m.label}
                    </span>
                    {/* Active dot */}
                    {active && (
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: m.accent }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs font-semibold px-1 animate-fadeIn" style={{ color: '#C4584A' }}>
                ⚠ {error}
              </p>
            )}
          </div>

          {/* ═══ RIGHT COLUMN — slider + reflection + save ══════════════ */}
          <div
            className="flex flex-col gap-6 p-9 md:p-10 md:pl-9"
            style={{ borderLeft: '1px solid #E7D8CC' }}
          >
            {/* "Today I'm feeling..." + score badge */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label
                  className="text-sm font-bold"
                  style={{ color: '#8B766C' }}
                >
                  Today I'm feeling…
                </label>
                <div
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-extrabold text-sm transition-all duration-300"
                  style={{
                    background: mood.bg,
                    color:      mood.accent,
                    border:     `1.5px solid ${mood.border}`,
                  }}
                >
                  <span style={{ fontSize: '15px' }}>{mood.emoji}</span>
                  <span>{score}</span>
                </div>
              </div>

              {/* ── Slider ───────────────────────────────────────── */}
              <div className="flex flex-col gap-1.5">
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={score}
                  onChange={handleSlider}
                  className="checkin-slider"
                  style={{
                    background: `linear-gradient(to right, ${mood.accent} ${pct}%, #EDE8E3 ${pct}%)`,
                    color: mood.accent,  /* used by ::-webkit-slider-thumb border */
                  }}
                />
                <div className="flex justify-between">
                  <span className="text-[10px] font-bold" style={{ color: '#C4B8B0' }}>1</span>
                  <span className="text-[10px] font-bold" style={{ color: '#C4B8B0' }}>10</span>
                </div>
              </div>
            </div>

            {/* ── Reflection textarea ──────────────────────────── */}
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-sm font-bold" style={{ color: '#8B766C' }}>
                Reflection <span style={{ color: '#C4B8B0', fontWeight: 500 }}>(optional)</span>
              </label>

              <div className="relative flex-1">
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="What's on your mind?"
                  maxLength={250}
                  rows={5}
                  className="w-full rounded-[16px] px-5 py-4 text-sm font-medium leading-relaxed resize-none outline-none transition-all duration-200 placeholder:text-[#D4C8C0]"
                  style={{
                    background:  '#FFF9F5',
                    border:      '1.5px solid #E7D8CC',
                    color:       '#5A4A42',
                    fontFamily:  'inherit',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = mood.accent;
                    e.target.style.boxShadow   = `0 0 0 3px ${mood.glow}`;
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#E7D8CC';
                    e.target.style.boxShadow   = 'none';
                  }}
                />
                <span
                  className="absolute bottom-3 right-4 text-[10px] font-mono font-semibold pointer-events-none"
                  style={{ color: '#D4C8C0' }}
                >
                  {notes.length}/250
                </span>
              </div>
            </div>

            {/* ── Action buttons ───────────────────────────────── */}
            <div className="flex items-center justify-between gap-3 pt-1">
              {editEntry && (
                <button
                  type="button"
                  onClick={onCancelEdit}
                  disabled={loading}
                  className="text-sm font-bold px-5 py-2.5 rounded-[14px] border transition-all duration-200 disabled:opacity-40"
                  style={{ borderColor: '#E7D8CC', color: '#A89890' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#5A4A42'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#A89890'; }}
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                disabled={loading}
                className="ml-auto flex items-center gap-2 text-sm font-extrabold px-8 py-3.5 rounded-[14px] transition-all duration-300 disabled:opacity-60 active:scale-[0.97]"
                style={{
                  background: saved
                    ? 'linear-gradient(135deg, #B8C9A3 0%, #90B070 100%)'
                    : 'linear-gradient(135deg, #D98C6B 0%, #c97d5a 100%)',
                  color:     '#FEFCFA',
                  boxShadow: saved
                    ? '0 6px 20px rgba(184,201,163,0.42)'
                    : '0 8px 24px rgba(217,140,107,0.38)',
                }}
                onMouseEnter={e => {
                  if (!loading && !saved) {
                    e.currentTarget.style.transform  = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow  = '0 14px 32px rgba(217,140,107,0.48)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = saved
                    ? '0 6px 20px rgba(184,201,163,0.42)'
                    : '0 8px 24px rgba(217,140,107,0.38)';
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving…</span>
                  </>
                ) : saved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editEntry ? 'Save Changes' : 'Save Reflection'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
};

export default MoodForm;
