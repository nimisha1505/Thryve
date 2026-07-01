import React, { useState, useEffect } from 'react';
import { Search, Loader2, Sparkles, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { getFeed } from '../services/communityService.js';
import CommunityPostCard from './CommunityPostCard.jsx';

const CommunityFeed = ({ refreshTrigger, onNewPostClick }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchVal, setSearchVal] = useState(''); // debounced search click
  const [moodTag, setMoodTag] = useState('All');
  const [sort, setSort] = useState('latest'); // 'latest' or 'trending'
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 5;

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        sort,
      };
      if (moodTag !== 'All') {
        params.moodTag = moodTag;
      }
      if (searchVal.trim()) {
        params.search = searchVal.trim();
      }

      const res = await getFeed(params);
      if (res?.success) {
        setPosts(res.data.posts || []);
        // Check if there's potentially a next page
        setHasMore((res.data.posts || []).length === limit);
      }
    } catch (err) {
      console.error('Failed to fetch community feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [page, sort, moodTag, searchVal, refreshTrigger]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchVal(search);
  };

  const handleClearSearch = () => {
    setSearch('');
    setSearchVal('');
    setPage(1);
  };

  const handleCategoryChange = (tag) => {
    setMoodTag(tag);
    setPage(1);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setPage(1);
  };

  const moodTagsList = ['All', 'Motivation', 'Anxiety', 'Stress', 'Success Stories'];

  return (
    <div className="flex flex-col gap-6">
      {/* Search & Sort Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs font-semibold pl-10 pr-12 py-3 rounded-xl border border-[#222030] bg-[#13121C]/40 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          
          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="text-[10px] font-bold text-slate-500 hover:text-slate-300 absolute right-4 top-3.5 uppercase font-mono tracking-wider transition-colors"
            >
              Clear
            </button>
          )}
        </form>

        {/* Sort Actions */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => handleSortChange('latest')}
            className={`px-4.5 py-2 rounded-xl border text-xs font-black transition-all hover:scale-102 active:scale-98 ${
              sort === 'latest'
                ? 'bg-[#D98C6B] border-transparent text-white shadow-sm'
                : 'bg-white border-[#E7D8CC] text-[#8B766C] hover:bg-[#FFF9F5] hover:border-[#D98C6B]/30'
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => handleSortChange('trending')}
            className={`px-4.5 py-2 rounded-xl border text-xs font-black transition-all hover:scale-102 active:scale-98 ${
              sort === 'trending'
                ? 'bg-[#D98C6B] border-transparent text-white shadow-sm'
                : 'bg-white border-[#E7D8CC] text-[#8B766C] hover:bg-[#FFF9F5] hover:border-[#D98C6B]/30'
            }`}
          >
            Trending
          </button>
        </div>
      </div>

      {/* Categories Row */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1.5 scrollbar-thin">
        <Filter className="w-4 h-4 text-[#8B766C] flex-shrink-0" />
        <div className="flex items-center gap-2">
          {moodTagsList.map((tag) => (
            <button
              key={tag}
              onClick={() => handleCategoryChange(tag)}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-black transition-all whitespace-nowrap hover:scale-102 active:scale-98 ${
                moodTag === tag
                  ? 'bg-[#D98C6B] text-white border-transparent shadow-sm'
                  : 'bg-white border-[#E7D8CC] text-[#8B766C] hover:bg-[#FFF9F5] hover:border-[#D98C6B]/30'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Feed List */}
      <div className="flex flex-col gap-5">
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-[#13121C]/30 rounded-2xl border border-[#222030] animate-pulse"></div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl border border-[#222030] flex flex-col items-center justify-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
              <Sparkles className="w-6 h-6 text-brand-primary" />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="font-display font-extrabold text-slate-200 text-sm">No discussions found</h4>
              <p className="text-xs text-slate-500 font-medium">Be the first to share an anonymous thought with the community.</p>
            </div>
            <button
              onClick={onNewPostClick}
              className="brand-gradient px-5 py-2.5 rounded-xl text-xs font-bold text-[#0A090F] shadow-sm hover:scale-102 active:scale-98 transition-all mt-2"
            >
              Share Anonymous Thought
            </button>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <CommunityPostCard key={post._id} post={post} />
            ))}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-[#222030] pt-5 mt-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-[#222030] bg-[#13121C]/40 rounded-xl text-xs font-bold text-slate-400 hover:bg-[#13121C]/80 hover:text-slate-200 transition-colors flex items-center gap-1 disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              <span className="text-xs font-bold text-slate-500 font-mono">
                Page {page}
              </span>

              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!hasMore}
                className="px-4 py-2 border border-[#222030] bg-[#13121C]/40 rounded-xl text-xs font-bold text-slate-400 hover:bg-[#13121C]/80 hover:text-slate-200 transition-colors flex items-center gap-1 disabled:opacity-40 disabled:pointer-events-none"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CommunityFeed;
