import React, { useState } from 'react';
import { Calendar, Tag, Trash2, Edit2, Check, X } from 'lucide-react';

const SCORE_EMOJIS = {
  1: '😭', 2: '😢', 3: '😔', 4: '😐', 5: '🙂',
  6: '😊', 7: '😌', 8: '😁', 9: '🤩', 10: '😇',
};

const SCORE_LABELS = {
  1: 'Very Low', 2: 'Down', 3: 'Uncomfortable', 4: 'Neutral', 5: 'Content',
  6: 'Good', 7: 'Peaceful', 8: 'Happy', 9: 'Joyful', 10: 'Radiant',
};

// Score → soft background, border, text colours
const SCORE_BG = {
  1: 'bg-[#D98C6B]/10 border-[#D98C6B]/20',
  2: 'bg-[#D98C6B]/08 border-[#D98C6B]/15',
  3: 'bg-[#F2A98B]/10 border-[#F2A98B]/20',
  4: 'bg-[#F2A98B]/08 border-[#F2A98B]/15',
  5: 'bg-[#CFC8E8]/10 border-[#CFC8E8]/20',
  6: 'bg-[#CFC8E8]/08 border-[#CFC8E8]/15',
  7: 'bg-[#F7D8C5]/12 border-[#F7D8C5]/25',
  8: 'bg-[#F7D8C5]/10 border-[#F7D8C5]/20',
  9: 'bg-[#B8C9A3]/12 border-[#B8C9A3]/25',
  10: 'bg-[#B8C9A3]/10 border-[#B8C9A3]/20',
};

const SCORE_ACCENT = {
  1: '#D98C6B', 2: '#D98C6B', 3: '#E29382', 4: '#C4A882',
  5: '#9B93C4', 6: '#9B93C4', 7: '#C4A882', 8: '#D4AE78',
  9: '#B8C9A3', 10: '#8FAF78',
};

const MoodCard = ({ entry, onEdit, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const { date, time } = formatDate(entry.loggedAt);
  const scoreClass = SCORE_BG[entry.moodScore] || SCORE_BG[5];
  const emoji = SCORE_EMOJIS[entry.moodScore] || '🙂';
  const label = SCORE_LABELS[entry.moodScore] || 'Content';
  const accentColor = SCORE_ACCENT[entry.moodScore] || '#D98C6B';

  // Truncate notes preview
  const notesPreview = entry.notes && entry.notes.length > 120
    ? entry.notes.slice(0, 120) + '…'
    : entry.notes;

  return (
    <div
      className="group relative flex gap-4 animate-fadeIn"
      style={{ animationDelay: '0ms' }}
    >
      {/* Timeline accent line + dot */}
      <div className="flex flex-col items-center flex-shrink-0 pt-1">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg border-2 shadow-sm flex-shrink-0 transition-transform duration-[250ms] group-hover:scale-110"
          style={{ background: `${accentColor}18`, borderColor: `${accentColor}40` }}
        >
          {emoji}
        </div>
        <div
          className="w-px flex-1 mt-1 min-h-[20px]"
          style={{ background: `linear-gradient(to bottom, ${accentColor}30, transparent)` }}
        />
      </div>

      {/* Card body */}
      <div
        className={`flex-1 mb-4 rounded-[20px] border p-4 transition-all duration-[250ms] hover:-translate-y-0.5 hover:shadow-md ${scoreClass}`}
        style={{ '--hover-shadow': `0 8px 24px ${accentColor}18` }}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold text-[#5A4A42] font-display">
              {label}
              <span className="ml-1.5 text-[11px] font-semibold text-[#8B766C] opacity-80">
                · {entry.moodScore}/10
              </span>
            </span>
            <div className="flex items-center gap-1 text-[11px] text-[#8B766C] font-medium">
              <Calendar className="w-3 h-3" />
              <span>{date}</span>
              <span className="opacity-50">·</span>
              <span>{time}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-[250ms] flex-shrink-0">
            {confirmDelete ? (
              <div className="flex items-center gap-0.5 bg-red-500/10 border border-red-500/20 rounded-lg p-0.5 animate-fadeIn">
                <button
                  onClick={() => { onDelete(entry._id); setConfirmDelete(false); }}
                  className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-md transition-all duration-[250ms] active:scale-90"
                  title="Confirm Delete"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="p-1.5 text-[#8B766C] hover:bg-white/40 rounded-md transition-all duration-[250ms] active:scale-90"
                  title="Cancel"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onEdit(entry)}
                  className="p-1.5 text-[#8B766C] hover:text-[#D98C6B] hover:bg-white/40 rounded-lg transition-all duration-[250ms] active:scale-90"
                  title="Edit"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-1.5 text-[#8B766C] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-[250ms] active:scale-90"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tags row */}
        {entry.moodTags && entry.moodTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2.5 items-center">
            <Tag className="w-3 h-3 text-[#8B766C] opacity-60 flex-shrink-0" />
            {entry.moodTags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-bold bg-white/50 border border-white/60 px-2 py-0.5 rounded-full text-[#5A4A42]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Notes preview */}
        {notesPreview && (
          <p className="text-xs text-[#725E54] font-medium leading-relaxed italic opacity-85 border-t border-white/40 pt-2 mt-1">
            &ldquo;{notesPreview}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
};

export default MoodCard;
