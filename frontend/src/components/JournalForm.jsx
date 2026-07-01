import React, { useState, useEffect } from 'react';
import { createJournal, updateJournal } from '../services/journalService.js';
import { Loader2, AlertCircle, Leaf, Pin, Edit2 } from 'lucide-react';
import Card from './Card.jsx';

const CATEGORIES = [
  'Personal',
  'Work',
  'Study',
  'Health',
  'Relationships',
  'Gratitude',
  'Other',
];

const MOOD_TAGS_WITH_EMOJIS = [
  { name: 'Calm', emoji: '😌' },
  { name: 'Happy', emoji: '😊' },
  { name: 'Energetic', emoji: '⚡' },
  { name: 'Productive', emoji: '✅' },
  { name: 'Tired', emoji: '😴' },
  { name: 'Stressed', emoji: '😰' },
  { name: 'Anxious', emoji: '😰' },
  { name: 'Sad', emoji: '😢' },
  { name: 'Angry', emoji: '😡' },
  { name: 'Peaceful', emoji: '🍃' },
  { name: 'Grateful', emoji: '❤️' },
  { name: 'Excited', emoji: '⭐' },
];

const moodIndexFromScore = (score) => {
  if (score <= 2) return 7; // Sad/Tired mapping
  if (score <= 4) return 5; // Stressed
  if (score <= 6) return 0; // Calm
  if (score <= 8) return 1; // Happy
  return 11; // Excited
};

const JournalForm = ({ onSubmitSuccess, editEntry, onCancelEdit }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Personal');
  const [moodTag, setMoodTag] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (editEntry) {
      setTitle(editEntry.title);
      setCategory(editEntry.category);
      setMoodTag(editEntry.moodTag);
      setContent(editEntry.content);
      setIsPinned(editEntry.isPinned || false);
    } else {
      setTitle('');
      setCategory('Personal');
      setMoodTag('');
      setContent('');
      setIsPinned(false);
    }
    setError(null);
  }, [editEntry]);

  const getWordCount = (text) => {
    if (!text) return 0;
    const trimmed = text.trim();
    if (trimmed === '') return 0;
    return trimmed.split(/\s+/).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please fill in a title.');
      return;
    }
    if (!moodTag) {
      setError('Please select an associated mood tag.');
      return;
    }
    if (!content.trim()) {
      setError('Please write some content.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        title: title.trim(),
        content: content.trim(),
        moodTag,
        category,
        isPinned,
      };

      if (editEntry) {
        await updateJournal(editEntry._id, payload);
      } else {
        await createJournal(payload);
      }

      // Reset
      if (!editEntry) {
        setTitle('');
        setCategory('Personal');
        setMoodTag('');
        setContent('');
        setIsPinned(false);
      }

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save journal log.');
    } finally {
      setLoading(false);
    }
  };

  const wordCount = getWordCount(content);

  return (
    <Card className="relative overflow-hidden flex flex-col gap-4.5 border border-[#E7D8CC] h-full bg-[#FFFDFB] shadow-[0_4px_24px_rgba(90,74,66,0.02)] p-5 rounded-[24px] transition-all duration-200" hoverable={false}>
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFF9F5] rounded-full blur-3xl pointer-events-none"></div>

      {/* Header section with circle edit pencil icon */}
      <div className="flex items-center gap-3.5 z-10">
        <div className="w-10 h-10 rounded-full bg-[#F7D8C5]/45 flex items-center justify-center text-[#D98C6B] flex-shrink-0 border border-[#F7D8C5]/60 shadow-sm">
          <Edit2 className="w-4 h-4 text-[#D98C6B]" />
        </div>
        <div className="flex flex-col gap-0.5">
          <h3 className="font-display font-extrabold text-base text-[#5A4A42] leading-tight tracking-tight">
            {editEntry ? 'Edit your reflection' : "Write today's reflection"}
          </h3>
          <p className="text-[11px] text-[#8B766C] font-semibold leading-relaxed">
            Reflect on your day, log your feelings, and notice patterns.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-[#E79A9A]/15 border border-[#E79A9A]/30 text-[#D88A8A] px-4 py-3 rounded-2xl flex items-center gap-3 text-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-[#E79A9A]" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4.5 z-10 flex-1 justify-between">
        <div className="flex flex-col gap-4.5">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#8B766C] uppercase tracking-wider px-1">
              TITLE
            </label>
            <input
              id="journal-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your thoughts a title..."
              maxLength={100}
              required
              className="w-full bg-[#FEFCFA] border border-[#E7D8CC] rounded-2xl px-4 py-2.5 text-sm text-[#5A4A42] placeholder-[#8B766C]/40 focus:outline-none focus:border-[#D98C6B] focus:ring-4 focus:ring-[#D98C6B]/10 transition-all duration-200 font-semibold"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-[10px] font-bold text-[#8B766C] uppercase tracking-wider px-1">
              CATEGORY
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#FEFCFA] border border-[#E7D8CC] rounded-2xl px-4 py-2.5 text-sm text-[#5A4A42] focus:outline-none focus:border-[#D98C6B] focus:ring-4 focus:ring-[#D98C6B]/10 transition-all duration-200 font-semibold appearance-none cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-white text-[#5A4A42]">
                    {cat}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#8B766C]">
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Associated Mood Tag */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-[#8B766C] uppercase tracking-wider px-1">
              MOOD TAGS
            </label>
            <div className="flex flex-wrap gap-2">
              {MOOD_TAGS_WITH_EMOJIS.map((item) => {
                const isSelected = moodTag === item.name;
                return (
                  <button
                    type="button"
                    key={item.name}
                    onClick={() => setMoodTag(item.name)}
                    className="text-xs font-bold px-3.5 py-2 rounded-full border transition-all duration-200 flex items-center gap-1.5 hover:-translate-y-0.5 shadow-sm active:scale-95"
                    style={{
                      backgroundColor: isSelected ? '#D98C6B' : '#FFF9F5',
                      borderColor: isSelected ? '#D98C6B' : '#E7D8CC',
                      color: isSelected ? '#FFFFFF' : '#5A4A42',
                    }}
                  >
                    <span>{item.emoji}</span>
                    <span>{item.name}</span>
                    {isSelected && <span className="ml-0.5 text-[9px] font-extrabold">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reflections Content Area */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-[10px] font-bold text-[#8B766C] uppercase tracking-wider px-1">
              REFLECTIONS
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your reflection..."
              className="w-full bg-[#FEFCFA] border border-[#E7D8CC] rounded-2xl px-4 py-2.5 text-sm text-[#5A4A42] placeholder-[#8B766C]/40 focus:outline-none focus:border-[#D98C6B] focus:ring-4 focus:ring-[#D98C6B]/10 transition-all duration-200 resize-none min-h-[200px] leading-relaxed font-semibold"
              required
            />
            <div className="flex justify-end mt-1 px-1">
              <span className="text-[11px] font-medium text-[#8B766C] font-mono select-none">
                {wordCount} words
              </span>
            </div>
          </div>

          {/* Pinned Checkbox */}
          <div className="flex items-center gap-2.5 px-1 py-1">
            <input
              type="checkbox"
              id="isPinned"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 rounded text-[#D98C6B] bg-[#FFF9F5] border-[#E7D8CC] focus:ring-[#D98C6B]/10 cursor-pointer accent-[#D98C6B]"
            />
            <label
              htmlFor="isPinned"
              className="text-xs font-bold text-[#8B766C] cursor-pointer flex items-center gap-1.5 select-none"
            >
              <Pin className="w-3.5 h-3.5 text-[#8B766C]" />
              <span>Pin this entry to the top</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 mt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-[#D98C6B] to-[#E2834A] hover:opacity-95 text-white shadow-md shadow-[#D98C6B]/10 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 font-bold flex items-center justify-center gap-2 py-3.5 text-sm cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Leaf className="w-4 h-4 text-white fill-white fill-opacity-20" />
                <span>{editEntry ? 'Save Updates' : 'Publish Entry'}</span>
              </>
            )}
          </button>
          
          {editEntry && (
            <button
              type="button"
              onClick={onCancelEdit}
              disabled={loading}
              className="w-full rounded-full bg-[#F5ECE5] text-[#5A4A42] hover:bg-[#F5ECE5]/80 font-bold py-2.5 text-xs transition-all duration-200 cursor-pointer"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>
    </Card>
  );
};

export default JournalForm;
export { MOOD_TAGS_WITH_EMOJIS };
