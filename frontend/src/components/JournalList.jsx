import React, { useState } from 'react';
import JournalCard from './JournalCard.jsx';
import { Search, ChevronLeft, ChevronRight, Inbox, Pin, Edit2, Trash2, Check, X } from 'lucide-react';
import Card from './Card.jsx';
import Button from './Button.jsx';
import EmptyState from './EmptyState.jsx';
import LoadingSkeleton from './LoadingSkeleton.jsx';
import { Reading } from './Illustrations.jsx';
import { MOOD_TAGS_WITH_EMOJIS } from './JournalForm.jsx';

const CATEGORIES = [
  'All Categories',
  'Personal',
  'Work',
  'Study',
  'Health',
  'Relationships',
  'Gratitude',
  'Other',
];

const MOOD_TAGS = [
  'All Moods',
  'Calm',
  'Happy',
  'Energetic',
  'Productive',
  'Tired',
  'Stressed',
  'Anxious',
  'Sad',
  'Angry',
  'Peaceful',
  'Grateful',
  'Excited',
];

const CATEGORY_COLORS = {
  Personal: 'bg-[#F5ECE5]/60 text-[#5A4A42] border-[#E7D8CC]/80',
  Work: 'bg-[#F7D8C5]/40 text-[#D98C6B] border-[#F7D8C5]/70',
  Study: 'bg-[#F5ECE5]/60 text-[#5A4A42] border-[#E7D8CC]/80',
  Health: 'bg-[#B8C9A3]/15 text-[#5A4A42] border-[#B8C9A3]/30',
  Relationships: 'bg-[#F7D8C5]/40 text-[#D98C6B] border-[#F7D8C5]/70',
  Gratitude: 'bg-[#B8C9A3]/15 text-[#5A4A42] border-[#B8C9A3]/30',
  Other: 'bg-[#F5ECE5]/60 text-[#8B766C] border-[#E7D8CC]/80',
};

const JournalList = ({
  journals = [],
  page,
  limit,
  totalCount,
  loading,
  search,
  category,
  moodTag,
  onSearchChange,
  onCategoryChange,
  onMoodChange,
  onPageChange,
  onEdit,
  onDelete,
  onPinToggle,
}) => {
  const [confirmDeletePinned, setConfirmDeletePinned] = useState(false);
  const totalPages = Math.ceil(totalCount / limit) || 1;
  const isFiltered = search !== '' || category !== '' || moodTag !== '';

  const pinnedEntry = journals.find((j) => j.isPinned);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getMoodEmoji = (tag) => {
    const match = MOOD_TAGS_WITH_EMOJIS.find((t) => t.name === tag);
    return match ? match.emoji : '😊';
  };

  const pinnedCatColor = pinnedEntry ? (CATEGORY_COLORS[pinnedEntry.category] || CATEGORY_COLORS.Personal) : '';

  return (
    <div className="flex flex-col gap-6">
      {/* Top filters row with 200ms transition and hover lift */}
      <div className="flex flex-col sm:flex-row gap-3.5 items-center w-full">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#8B766C] opacity-70" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white border border-[#E7D8CC] text-[#5A4A42] rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#D98C6B] focus:ring-4 focus:ring-[#D98C6B]/10 transition-all duration-200 font-semibold placeholder-[#8B766C]/50 shadow-[0_2px_12px_rgba(90,74,66,0.01)]"
            placeholder="Search your journals..."
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2.5 w-full sm:w-auto">
          {/* Category Filter */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={category === '' ? 'All Categories' : category}
              onChange={(e) => {
                const val = e.target.value;
                onCategoryChange(val === 'All Categories' ? '' : val);
              }}
              className="w-full bg-white border border-[#E7D8CC] text-[#725E54] rounded-2xl pl-3.5 pr-8 py-2.5 text-xs focus:outline-none focus:border-[#D98C6B] focus:ring-4 focus:ring-[#D98C6B]/10 transition-all duration-200 font-bold cursor-pointer shadow-[0_2px_12px_rgba(90,74,66,0.01)] appearance-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-white text-[#5A4A42]">
                  {cat}
                </option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8B766C]">
              <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>

          {/* Mood Filter */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={moodTag === '' ? 'All Moods' : moodTag}
              onChange={(e) => {
                const val = e.target.value;
                onMoodChange(val === 'All Moods' ? '' : val);
              }}
              className="w-full bg-white border border-[#E7D8CC] text-[#725E54] rounded-2xl pl-3.5 pr-8 py-2.5 text-xs focus:outline-none focus:border-[#D98C6B] focus:ring-4 focus:ring-[#D98C6B]/10 transition-all duration-200 font-bold cursor-pointer shadow-[0_2px_12px_rgba(90,74,66,0.01)] appearance-none"
            >
              {MOOD_TAGS.map((tag) => (
                <option key={tag} value={tag} className="bg-white text-[#5A4A42]">
                  {tag}
                </option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8B766C]">
              <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Pinned Entry Card */}
      {pinnedEntry && !isFiltered && (
        <div className="bg-[#F7D8C5]/10 border border-[#D98C6B]/40 rounded-[24px] p-5 shadow-[0_4px_20px_rgba(217,140,107,0.02)] relative animate-fadeIn transition-all duration-200 hover:shadow-[0_8px_28px_rgba(217,140,107,0.04)]">
          <div className="flex justify-between items-center mb-3.5">
            <div className="flex items-center gap-1.5 text-xs text-[#D98C6B] font-bold select-none">
              <Pin className="w-3.5 h-3.5 fill-[#D98C6B] stroke-[2.5]" />
              <span>Pinned Entry</span>
            </div>
            <span className="text-xs text-[#8B766C] font-semibold font-mono">
              {formatDate(pinnedEntry.createdAt)}
            </span>
          </div>

          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 flex flex-col gap-2 min-w-0">
              <h4 className="font-display font-bold text-base text-[#5A4A42] leading-tight">
                {pinnedEntry.title}
              </h4>
              <p className="text-xs text-[#8B766C]/90 leading-relaxed font-semibold">
                {pinnedEntry.content}
              </p>
              
              <div className="flex gap-2 items-center mt-1 select-none">
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${pinnedCatColor}`}>
                  {pinnedEntry.category}
                </span>
                <span className="text-[10px] font-bold bg-[#FFF9F5] border border-[#E7D8CC] px-3 py-1 rounded-full text-[#5A4A42] flex items-center gap-1">
                  <span className="text-xs">{getMoodEmoji(pinnedEntry.moodTag)}</span>
                  <span>{pinnedEntry.moodTag}</span>
                </span>
              </div>
            </div>

            {/* Action buttons on the side */}
            <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
              <button
                onClick={() => onEdit(pinnedEntry)}
                className="w-10 h-10 rounded-2xl bg-white border border-[#E7D8CC] flex items-center justify-center text-[#8B766C] hover:text-[#D98C6B] hover:border-[#D98C6B]/40 hover:-translate-y-0.5 active:scale-95 shadow-sm transition-all duration-200"
                title="Edit Entry"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              
              {confirmDeletePinned ? (
                <div className="flex items-center gap-1 bg-red-500/10 border border-red-500/20 rounded-2xl p-1 animate-fadeIn">
                  <button
                    onClick={() => {
                      onDelete(pinnedEntry._id);
                      setConfirmDeletePinned(false);
                    }}
                    className="p-1.5 text-red-500 hover:bg-red-500/25 rounded-xl transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDeletePinned(false)}
                    className="p-1.5 text-[#8B766C] hover:bg-white rounded-xl transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDeletePinned(true)}
                  className="w-10 h-10 rounded-2xl bg-[#E79A9A]/10 border border-[#E79A9A]/20 flex items-center justify-center text-[#D88A8A] hover:bg-[#E79A9A]/20 hover:text-red-500 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
                  title="Delete Entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* History Area */}
      {loading && journals.length === 0 ? (
        <LoadingSkeleton variant="list" count={3} />
      ) : journals.length === 0 ? (
        isFiltered ? (
          <EmptyState
            title="No Reflections Found"
            description="Try adjusting your search criteria or filter tags to discover matching entries."
            icon={Inbox}
          />
        ) : (
          /* Welcoming illustrated Empty State with internal padding & typography */
          <div className="flex flex-col items-center text-center p-10 py-16 rounded-[28px] bg-white border border-[#E7D8CC] shadow-[0_2px_16px_rgba(90,74,66,0.01)] animate-fadeIn">
            <div className="mb-7 flex justify-center text-[#D98C6B]">
              <Reading className="w-36 h-36" />
            </div>
            <h3 className="text-xl font-extrabold text-[#5A4A42] mb-2.5 tracking-tight">Your journal is waiting</h3>
            <p className="text-[13px] text-[#8B766C] font-semibold max-w-sm mb-7 leading-relaxed">
              Write your first reflection to begin noticing patterns in your days.
            </p>
            <Button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                document.getElementById('journal-title-input')?.focus();
              }}
              variant="primary"
              className="px-7 py-3 rounded-full shadow-md shadow-[#D98C6B]/15 hover:shadow-lg transition-all duration-200 font-bold text-sm cursor-pointer"
            >
              Start Writing
            </Button>
          </div>
        )
      ) : (
        <div className="flex flex-col gap-4">
          {/* Header block with Recent Entries and View all */}
          <div className="flex justify-between items-center mt-1 px-1">
            <h3 className="text-xs font-bold text-[#8B766C] tracking-wider uppercase select-none">Recent Entries</h3>
            <button
              onClick={() => {
                onSearchChange('');
                onCategoryChange('');
                onMoodChange('');
              }}
              className="text-xs font-bold text-[#D98C6B] hover:text-[#D98C6B]/80 transition-colors"
            >
              View all
            </button>
          </div>

          {/* Journals list */}
          <div className="flex flex-col gap-3">
            {journals.map((entry) => (
              <JournalCard
                key={entry._id}
                entry={entry}
                onEdit={onEdit}
                onDelete={onDelete}
                onPinToggle={onPinToggle}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-2 px-1">
              <span className="text-xs font-semibold text-slate-500">
                Page {page} of {totalPages} ({totalCount} entries)
              </span>

              <div className="flex items-center gap-1">
                <Button
                  onClick={() => onPageChange(page - 1)}
                  disabled={page === 1 || loading}
                  variant="secondary"
                  className="!p-2.5 rounded-xl"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                </Button>
                <Button
                  onClick={() => onPageChange(page + 1)}
                  disabled={page === totalPages || loading}
                  variant="secondary"
                  className="!p-2.5 rounded-xl"
                >
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JournalList;
export { CATEGORY_COLORS };
