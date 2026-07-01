import React, { useState, useEffect } from 'react';
import { Sparkles, MessageSquare, Loader2, RefreshCw } from 'lucide-react';
import { getTrendingPosts } from '../services/communityService.js';

const TrendingPosts = ({ refreshTrigger }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrending = async () => {
    try {
      setLoading(true);
      const res = await getTrendingPosts();
      if (res?.success) {
        setPosts(res.data.posts || []);
      }
    } catch (err) {
      console.error('Failed to load trending posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending();
  }, [refreshTrigger]);

  return (
    <div className="glass-panel p-5 rounded-2xl border border-[#222030] flex flex-col gap-4 shadow-glass">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-extrabold text-sm text-slate-200 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Trending Discussions</span>
        </h3>
        <button
          onClick={fetchTrending}
          disabled={loading}
          className="text-slate-500 hover:text-brand-primary transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="flex flex-col gap-3 py-3 items-center justify-center">
            <Loader2 className="w-5 h-5 text-brand-primary animate-spin" />
            <span className="text-[10px] font-bold text-slate-500 font-mono">Analyzing feed...</span>
          </div>
        ) : posts.length === 0 ? (
          <p className="text-[10px] font-bold text-slate-500 font-mono text-center py-4 uppercase">
            No trending discussions
          </p>
        ) : (
          posts.map((post) => {
            const reactionCount = post.supportCount + post.hugCount + post.stayStrongCount;
            return (
              <div
                key={post._id}
                className="p-3 bg-[#13121C]/50 border border-[#222030] rounded-xl flex flex-col gap-1.5 transition-all hover:bg-[#13121C]/80 hover:border-brand-primary/30 hover:shadow-sm"
              >
                <p className="text-xs font-semibold text-slate-200 leading-normal line-clamp-2">
                  "{post.content}"
                </p>
                <div className="flex items-center justify-between text-[9px] text-slate-550 font-bold font-mono uppercase tracking-wider">
                  <span className="text-brand-primary font-bold">{post.anonymousName}</span>
                  <div className="flex items-center gap-2">
                    <span>❤️ {reactionCount}</span>
                    <span className="flex items-center gap-0.5">
                      <MessageSquare className="w-3 h-3 text-slate-550" />
                      {post.commentsCount}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TrendingPosts;
