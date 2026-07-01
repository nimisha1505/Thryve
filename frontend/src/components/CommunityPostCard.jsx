import React, { useState } from 'react';
import { Heart, MessageSquare, AlertCircle, Send, Loader2 } from 'lucide-react';
import { reactPost, unreactPost, createComment, getPost } from '../services/communityService.js';
import CommunityCommentCard from './CommunityCommentCard.jsx';

const CommunityPostCard = ({ post: initialPost }) => {
  const [post, setPost] = useState(initialPost);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Reaction types: support (❤️), hug (🤗), stayStrong (💪)
  const handleReactionClick = async (reactionType) => {
    try {
      let isCurrentlyActive = false;
      if (reactionType === 'support') isCurrentlyActive = post.isSupported;
      if (reactionType === 'hug') isCurrentlyActive = post.isHugged;
      if (reactionType === 'stayStrong') isCurrentlyActive = post.isStayStronged;

      let res;
      if (isCurrentlyActive) {
        res = await unreactPost(post._id, reactionType);
      } else {
        res = await reactPost(post._id, reactionType);
      }

      if (res?.success) {
        setPost(prev => ({
          ...prev,
          supportCount: res.data.supportCount,
          hugCount: res.data.hugCount,
          stayStrongCount: res.data.stayStrongCount,
          isSupported: reactionType === 'support' ? !prev.isSupported : prev.isSupported,
          isHugged: reactionType === 'hug' ? !prev.isHugged : prev.isHugged,
          isStayStronged: reactionType === 'stayStrong' ? !prev.isStayStronged : prev.isStayStronged
        }));
      }
    } catch (err) {
      console.error('Failed to update reaction:', err);
    }
  };

  const handleToggleComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }

    setShowComments(true);
    setCommentsLoading(true);
    setErrorMsg('');
    try {
      const res = await getPost(post._id);
      if (res?.success) {
        setComments(res.data.comments || []);
        setPost(prev => ({
          ...prev,
          commentsCount: res.data.post.commentsCount
        }));
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
      setErrorMsg('Failed to load comments. Please try again.');
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentSubmitting(true);
    setErrorMsg('');
    try {
      const res = await createComment(post._id, newComment);
      if (res?.success) {
        setComments(prev => [...prev, res.data.comment]);
        setPost(prev => ({
          ...prev,
          commentsCount: prev.commentsCount + 1
        }));
        setNewComment('');
      }
    } catch (err) {
      console.error('Comment error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit comment. Moderation check failed.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const formatTimestamp = (isoStr) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Assign background colors to tags
  const tagColors = {
    'Motivation': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Anxiety': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Stress': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    'Success Stories': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  return (
    <div className="glass-panel p-5 md:p-6 rounded-2xl border border-[#222030] flex flex-col gap-4 relative overflow-hidden shadow-glass hover:shadow-glass-hover transition-all duration-300 hover-premium">
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header Info */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full brand-gradient flex items-center justify-center font-bold text-xs text-[#0A090F] uppercase">
            {post.anonymousName.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-200">{post.anonymousName}</span>
            <span className="text-[10px] text-slate-500 font-bold font-mono">{formatTimestamp(post.createdAt)}</span>
          </div>
        </div>

        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md border font-mono tracking-wide ${tagColors[post.moodTag] || 'bg-[#13121C]/50 text-slate-400 border-[#222030]'}`}>
          {post.moodTag}
        </span>
      </div>

      {/* Title & Body */}
      <div className="flex flex-col gap-1.5">
        <h3 className="font-display font-extrabold text-base text-slate-200">
          {post.title}
        </h3>
        <p className="text-sm text-slate-350 leading-relaxed font-medium whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Interactions Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#222030] pt-4">
        {/* Support Reactions */}
        <div className="flex items-center gap-2">
          {/* Support (❤️) */}
          <button
            onClick={() => handleReactionClick('support')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all hover:scale-102 active:scale-98 ${
              post.isSupported
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-sm'
                : 'bg-[#13121C]/50 border-[#222030] text-slate-400 hover:border-rose-500/30 hover:text-rose-450'
            }`}
          >
            <span>❤️</span>
            <span>Support</span>
            {post.supportCount > 0 && <span className="opacity-90">({post.supportCount})</span>}
          </button>

          {/* Hug (🤗) */}
          <button
            onClick={() => handleReactionClick('hug')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all hover:scale-102 active:scale-98 ${
              post.isHugged
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-sm'
                : 'bg-[#13121C]/50 border-[#222030] text-slate-400 hover:border-amber-500/30 hover:text-amber-450'
            }`}
          >
            <span>🤗</span>
            <span>Hug</span>
            {post.hugCount > 0 && <span className="opacity-90">({post.hugCount})</span>}
          </button>

          {/* Stay Strong (💪) */}
          <button
            onClick={() => handleReactionClick('stayStrong')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all hover:scale-102 active:scale-98 ${
              post.isStayStronged
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 shadow-sm'
                : 'bg-[#13121C]/50 border-[#222030] text-slate-400 hover:border-indigo-500/30 hover:text-indigo-450'
            }`}
          >
            <span>💪</span>
            <span>Stay Strong</span>
            {post.stayStrongCount > 0 && <span className="opacity-90">({post.stayStrongCount})</span>}
          </button>
        </div>

        {/* Comment trigger */}
        <button
          onClick={handleToggleComments}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all hover:scale-102 active:scale-98 ${
            showComments
              ? 'bg-brand-primary/20 border-brand-primary/40 text-brand-primary shadow-sm'
              : 'bg-[#13121C]/50 border-[#222030] text-slate-400 hover:border-brand-primary/30 hover:text-brand-primary'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Comments</span>
          <span className="opacity-90">({post.commentsCount})</span>
        </button>
      </div>

      {/* Collapsible Comment Section */}
      {showComments && (
        <div className="border-t border-[#222030] pt-4 flex flex-col gap-4 animate-fadeIn">
          {/* Error Banner */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit comment form */}
          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Write a supportive reply anonymously..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={commentSubmitting}
              className="flex-grow text-xs font-semibold px-4 py-2.5 rounded-xl border border-[#222030] bg-[#13121C]/40 text-slate-200 focus:outline-none focus:border-brand-primary placeholder:text-slate-500 disabled:opacity-50 focus:ring-2 focus:ring-brand-primary/10 transition-all"
            />
            <button
              type="submit"
              disabled={commentSubmitting || !newComment.trim()}
              className="px-4 py-2.5 brand-gradient hover:opacity-90 hover:scale-102 active:scale-98 transition-all rounded-xl text-xs font-bold text-[#0A090F] flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
            >
              {commentSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reply</span>
                </>
              )}
            </button>
          </form>

          {/* Comments List */}
          <div className="flex flex-col gap-3">
            {commentsLoading ? (
              <div className="flex flex-col gap-2.5 py-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-10 bg-[#13121C]/30 rounded-xl border border-[#222030] animate-pulse"></div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <p className="text-[11px] text-slate-500 font-semibold italic text-center py-2">
                No replies yet. Be the first to add words of encouragement!
              </p>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-[250px] overflow-y-auto pr-1">
                {comments.map((comment) => (
                  <CommunityCommentCard key={comment._id} comment={comment} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPostCard;
