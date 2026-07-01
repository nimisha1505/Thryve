import React, { useState, useEffect } from 'react';
import { getResources, getFeaturedResources } from '../services/resourceService.js';
import ResourceCard from '../components/ResourceCard.jsx';
import FeaturedResource from '../components/FeaturedResource.jsx';
import CategoryCard from '../components/CategoryCard.jsx';
import { Search, Compass, AlertCircle, Loader2 } from 'lucide-react';
import SectionHeader from '../components/SectionHeader.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import EmptyState from '../components/EmptyState.jsx';

const CATEGORIES_LIST = [
  { name: 'Nature Sounds', emoji: '🌧' },
  { name: 'Meditation', emoji: '🧘' },
  { name: 'Daily Affirmations', emoji: '🌿' },
  { name: 'Sleep Improvement', emoji: '🌙' },
  { name: 'Motivation', emoji: '✨' },
  { name: 'Breathing Exercises', emoji: '🌬' },
  { name: 'Stress Relief', emoji: '🍃' }
];

const ResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchFeatured = async () => {
    try {
      const res = await getFeaturedResources();
      if (res?.success) {
        setFeatured(res.data.resources || []);
      }
    } catch (err) {
      console.warn('Failed to load featured resources:', err);
    }
  };

  const fetchResourcesList = async (category = '', query = '') => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const params = {};
      if (category) params.category = category;
      if (query) params.search = query;

      const res = await getResources(params);
      if (res?.success) {
        setResources(res.data.resources || []);
      }
    } catch (err) {
      console.error('Failed to load resources:', err);
      setErrorMessage('Failed to retrieve resources. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatured();
    fetchResourcesList(selectedCategory, searchQuery);
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchResourcesList(selectedCategory, searchQuery);
  };

  return (
    <div className="flex flex-col gap-8 animate-fadeIn">
      {/* Title Header */}
      <SectionHeader
        title="Wellness Resources Hub"
        description="Access instant audio loops, breathing exercises, affirmations, and sleep guides offline."
      />

      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Featured Resource Banner (Shows first featured item) */}
      {!loading && featured.length > 0 && (
        <div className="flex flex-col gap-3">
          <FeaturedResource resource={featured[0]} />
        </div>
      )}

      {/* Categories Selector Section */}
      <div className="flex flex-col gap-3.5">
        <h3 className="font-display font-bold text-base text-[#5A4A42] flex items-center gap-2 px-1">
          <Compass className="w-4.5 h-4.5 text-[#D98C6B]" />
          <span>Browse by Category</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <CategoryCard
            category="All Resources"
            emoji="📚"
            isSelected={selectedCategory === ''}
            onClick={() => setSelectedCategory('')}
          />
          {CATEGORIES_LIST.map((cat) => (
            <CategoryCard
              key={cat.name}
              category={cat.name}
              emoji={cat.emoji}
              isSelected={selectedCategory === cat.name}
              onClick={() => setSelectedCategory(cat.name)}
            />
          ))}
        </div>
      </div>

      {/* Search Bar & Grid */}
      <div className="flex flex-col gap-4.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
          <h3 className="font-display font-bold text-base text-[#5A4A42]">
            {selectedCategory || 'All'} Libraries ({resources.length})
          </h3>
          
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-sm w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, details..."
              className="w-full bg-[#FEFCFA] border border-[#E7D8CC] text-[#5A4A42] rounded-xl pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-[#D98C6B] transition-all placeholder-[#8B766C]/50"
            />
            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B766C] hover:text-[#D98C6B] transition-colors cursor-pointer">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-[#FFF9F5] rounded-[28px] animate-pulse border border-[#E7D8CC]"></div>
            ))}
          </div>
        ) : resources.length === 0 ? (
          <EmptyState
            title="No matching wellness resources found"
            description="Try adjusting your search criteria or resetting filters to browse full library."
            actionText="Reset filters"
            onActionClick={() => { setSelectedCategory(''); setSearchQuery(''); }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {resources.map((res) => (
              <ResourceCard key={res._id} resource={res} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcesPage;
