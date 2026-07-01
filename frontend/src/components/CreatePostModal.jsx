import React, { useState } from 'react';
import { X, ShieldAlert, Loader2, Sparkles } from 'lucide-react';
import { createPost } from '../services/communityService.js';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [moodTag, setMoodTag] = useState('Motivation');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await createPost({ title, content, moodTag });
      if (res?.success) {
        onPostCreated(res.data.post);
        setTitle('');
        setContent('');
        setMoodTag('Motivation');
        onClose();
      }
    } catch (err) {
      console.error('Post submit error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to share post. Safety checks failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const moodTagsList = ['Motivation', 'Anxiety', 'Stress', 'Success Stories'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      {/* Modal Container */}
      <div className="bg-white border border-[#E7D8CC] w-full max-w-lg rounded-[28px] flex flex-col shadow-2xl relative overflow-hidden p-6 md:p-8 animate-scaleUp">
        {/* Shine background decorative */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFF9F5] rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E7D8CC] mb-6">
          <h2 className="font-display font-extrabold text-xl text-[#5A4A42] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D98C6B]" />
            <span>Share Anonymously</span>
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#FFF9F5] border border-[#E7D8CC] flex items-center justify-center text-[#8B766C] hover:text-[#5A4A42] hover:bg-[#F5ECE5] transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/30 text-red-500 font-bold mb-4 rounded-xl">
            <ShieldAlert className="w-4.5 h-4.5 flex-shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Safety Disclaimer */}
        <div className="bg-[#D98C6B]/5 border border-[#D98C6B]/15 p-4.5 rounded-2xl flex gap-3 text-xs font-medium text-[#8B766C] mb-6">
          <ShieldAlert className="w-5 h-5 text-[#D98C6B] flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1 leading-relaxed">
            <span className="font-bold text-[#5A4A42] font-display">Community Safety & Protection</span>
            <p>Your post will be published under a generated alias (e.g. *Brave Sparrow*). Please do not include phone numbers, email addresses, hate speech, or crisis details; posts containing these will be automatically rejected.</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#8B766C] uppercase tracking-wider pl-1">
              Title
            </label>
            <input
              type="text"
              placeholder="Give your thought a descriptive header..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              required
              disabled={submitting}
              className="text-sm font-semibold px-4 py-3 rounded-xl border border-[#E7D8CC] bg-[#FEFCFA] text-[#5A4A42] placeholder-[#8B766C]/50 focus:outline-none focus:border-[#D98C6B] focus:ring-2 focus:ring-[#D98C6B]/10 transition-all duration-200"
            />
            <div className="text-right text-[10px] text-[#8B766C]/70 font-mono mt-1">
              {title.length}/100
            </div>
          </div>

          {/* MoodTag select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#8B766C] uppercase tracking-wider pl-1">
              Topic Category
            </label>
            <div className="flex flex-wrap gap-2">
              {moodTagsList.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => setMoodTag(tag)}
                  disabled={submitting}
                  className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all hover:scale-102 active:scale-98 cursor-pointer ${
                    moodTag === tag
                      ? 'bg-[#D98C6B] border-transparent text-white shadow-sm shadow-[#D98C6B]/15'
                      : 'bg-[#FFF9F5] border-[#E7D8CC] text-[#8B766C] hover:border-[#D98C6B]/20 hover:text-[#5A4A42]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#8B766C] uppercase tracking-wider pl-1">
              Content
            </label>
            <textarea
              placeholder="What is on your mind? Share your struggles, achievements, gratitude, or advice..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={500}
              required
              rows={4}
              disabled={submitting}
              className="text-sm font-medium px-4 py-3 rounded-xl border border-[#E7D8CC] bg-[#FEFCFA] text-[#5A4A42] placeholder-[#8B766C]/50 focus:outline-none focus:border-[#D98C6B] focus:ring-2 focus:ring-[#D98C6B]/10 transition-all duration-200 resize-none"
            />
            <div className="text-right text-[10px] text-[#8B766C]/70 font-mono mt-1">
              {content.length}/500
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 border-t border-[#E7D8CC] pt-5 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-3 border border-[#E7D8CC] bg-[#FFF9F5] rounded-xl text-xs font-bold text-[#8B766C] hover:bg-[#F5ECE5] hover:text-[#5A4A42] transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim() || !content.trim()}
              className="px-6 py-3 bg-[#D98C6B] hover:bg-[#D98C6B]/90 rounded-xl text-xs font-bold text-white shadow-md shadow-[#D98C6B]/10 hover:shadow-[#D98C6B]/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-98 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  <span>Sharing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Post Anonymously</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
