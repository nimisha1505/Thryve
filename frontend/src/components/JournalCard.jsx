import React, { useState } from 'react';
import { Pin, Trash2, Edit2, Check, X, MoreVertical } from 'lucide-react';
import Card from './Card.jsx';
import { MOOD_TAGS_WITH_EMOJIS } from './JournalForm.jsx';

const CATEGORY_COLORS = {
  Personal: 'bg-[#F5ECE5]/60 text-[#5A4A42] border-[#E7D8CC]/80',
  Work: 'bg-[#F7D8C5]/40 text-[#D98C6B] border-[#F7D8C5]/70',
  Study: 'bg-[#F5ECE5]/60 text-[#5A4A42] border-[#E7D8CC]/80',
  Health: 'bg-[#B8C9A3]/15 text-[#5A4A42] border-[#B8C9A3]/30',
  Relationships: 'bg-[#F7D8C5]/40 text-[#D98C6B] border-[#F7D8C5]/70',
  Gratitude: 'bg-[#B8C9A3]/15 text-[#5A4A42] border-[#B8C9A3]/30',
  Other: 'bg-[#F5ECE5]/60 text-[#8B766C] border-[#E7D8CC]/80',
};

const JournalCard = ({ entry, onEdit, onDelete, onPinToggle }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const dateObj = new Date(entry.createdAt);
  const month = dateObj.toLocaleDateString(undefined, { month: 'short' }).toUpperCase();
  const day = dateObj.getDate();

  const getWordCount = (text) => {
    if (!text) return 0;
    const trimmed = text.trim();
    if (trimmed === '') return 0;
    return trimmed.split(/\s+/).length;
  };

  const getPreview = (text) => {
    if (!text) return '';
    if (text.length <= 80) return text;
    return text.substring(0, 80) + '...';
  };

  const getMoodEmoji = (tag) => {
    const match = MOOD_TAGS_WITH_EMOJIS.find((t) => t.name === tag);
    return match ? match.emoji : '😊';
  };

  const wordCount = getWordCount(entry.content);
  const catColor = CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.Personal;

  return (
    <Card
      className="p-2.5 px-4 relative border border-[#E7D8CC] rounded-[16px] bg-white flex items-center justify-between gap-4 shadow-[0_2px_8px_rgba(90,74,66,0.015)] hover:shadow-[0_6px_16px_rgba(90,74,66,0.04)] hover:-translate-y-[2px] transition-all duration-200"
      hoverable={false}
    >
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        {/* Calendar date block */}
        <div className="w-10 h-10 rounded-lg bg-[#F5ECE5]/50 border border-[#E7D8CC]/70 flex flex-col items-center justify-center flex-shrink-0 select-none">
          <span className="text-[8px] font-extrabold text-[#8B766C] tracking-wide font-mono leading-none">{month}</span>
          <span className="text-xs font-extrabold text-[#5A4A42] leading-none mt-0.5">{day}</span>
        </div>

        {/* Title + Preview */}
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <h4 className="font-display font-bold text-sm text-[#5A4A42] truncate leading-tight">
            {entry.title}
          </h4>
          <p className="text-xs text-[#8B766C]/80 font-medium truncate">
            {getPreview(entry.content)}
          </p>
        </div>
      </div>

      {/* Badges, Pin, and Menu elements on the right */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Mood Pill */}
        <span className="text-[9px] font-bold bg-[#FFF9F5] border border-[#E7D8CC] px-2 py-0.5 rounded-full text-[#5A4A42] flex items-center gap-1 select-none">
          <span className="text-xs leading-none">{getMoodEmoji(entry.moodTag)}</span>
          <span className="leading-none">{entry.moodTag}</span>
        </span>

        {/* Category Pill */}
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${catColor} select-none`}>
          {entry.category}
        </span>

        {/* Pin indicator/button */}
        <button
          onClick={() => onPinToggle(entry._id)}
          className={`p-1 rounded-xl transition-all duration-200 ${entry.isPinned ? 'text-[#D98C6B]' : 'text-[#8B766C]/40 hover:text-[#5A4A42]'
            }`}
          title={entry.isPinned ? 'Unpin Entry' : 'Pin Entry'}
        >
          <Pin className={`w-3.5 h-3.5 ${entry.isPinned ? 'fill-[#D98C6B]' : ''}`} />
        </button>

        {/* Three-dot Action Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 text-[#8B766C] hover:text-[#5A4A42] hover:bg-[#F5ECE5]/40 rounded-xl transition-all duration-200"
            title="Actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              {/* Overlay background to capture clicks and close menu */}
              <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />

              <div className="absolute right-0 mt-1 w-28 bg-white border border-[#E7D8CC] rounded-xl shadow-lg z-30 py-1.5 flex flex-col gap-0.5 animate-fadeIn">
                <button
                  onClick={() => {
                    onEdit(entry);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#5A4A42] hover:bg-[#F5ECE5] font-semibold transition-colors text-left w-full"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#D98C6B]" />
                  <span>Edit</span>
                </button>

                {confirmDelete ? (
                  <div className="px-2 py-1 flex items-center justify-between gap-1 bg-red-500/10 border border-red-500/20 rounded-lg mx-1.5 my-0.5">
                    <button
                      onClick={() => {
                        onDelete(entry._id);
                        setConfirmDelete(false);
                        setShowMenu(false);
                      }}
                      className="text-[10px] font-bold text-red-500 hover:underline"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="text-[10px] font-bold text-[#8B766C] hover:underline"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#D88A8A] hover:bg-red-500/5 font-semibold transition-colors text-left w-full"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default JournalCard;
