import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Users, Sparkles } from 'lucide-react';
import CommunityFeed from '../components/CommunityFeed.jsx';
import TrendingPosts from '../components/TrendingPosts.jsx';
import CreatePostModal from '../components/CreatePostModal.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';

const CommunityPage = () => {
  const location = useLocation();
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Check if quick-share state is passed from Dashboard
  useEffect(() => {
    if (location.state?.openCreateModal) {
      setModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handlePostCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="flex flex-col gap-8 animate-fadeIn">
      {/* Page Header Welcome Banner */}
      <Card className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden border border-[#E7D8CC] shadow-2xl" hoverable={true}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FFF9F5] rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col gap-2 relative z-10">
          <span className="text-[#D98C6B] font-bold tracking-wide text-xs uppercase">Safe Anonymous Space</span>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl text-gradient">
            Community Support Feed
          </h1>
          <p className="text-[#8B766C] text-sm md:text-base font-medium leading-relaxed">
            Share encouragement, celebrate achievements, or seek advice anonymously. No identity leaks, just mutual support.
          </p>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          className="bg-[#D98C6B] text-white hover:bg-[#D98C6B]/90 shadow-md shadow-[#D98C6B]/15 hover:-translate-y-0.5 relative z-10 flex-shrink-0 self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4 text-white mr-1.5 animate-pulse" />
          <span>Share Anonymous Thought</span>
        </Button>
      </Card>

      {/* Dual Column Layout (Feed + Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Feed Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <CommunityFeed
            refreshTrigger={refreshTrigger}
            onNewPostClick={() => setModalOpen(true)}
          />
        </div>

        {/* Sidebar Widgets Column */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-4">
          <TrendingPosts refreshTrigger={refreshTrigger} />
          
          {/* Rules Card */}
          <Card className="p-5 flex flex-col gap-3.5 border border-[#E7D8CC]" hoverable={false}>
            <h4 className="font-display font-extrabold text-xs text-[#5A4A42] uppercase tracking-widest leading-none">
              Feed Safety Rules
            </h4>
            <ul className="text-xs text-[#8B766C] font-medium flex flex-col gap-2.5 list-disc pl-4.5 leading-relaxed">
              <li>Automatic display name generator protects identity.</li>
              <li>Forbidden: Sharing emails, phone numbers, or social handles.</li>
              <li>Hate speech, personal insults, or harassment will be rejected instantly.</li>
              <li>No medical advice. For severe crises, please seek emergency services.</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Add Anonymous Post Modal */}
      <CreatePostModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default CommunityPage;
