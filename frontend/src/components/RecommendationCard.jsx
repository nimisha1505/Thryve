import React from 'react';
import { Sparkles, CheckSquare, MessageSquare, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from './Card.jsx';
import Button from './Button.jsx';
import EmptyState from './EmptyState.jsx';

const RecommendationCard = ({ recommendations = {}, loading }) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-[28px] border border-[#E7D8CC] animate-pulse h-80 flex flex-col gap-4">
        <div className="w-1/4 h-5 bg-[#F5ECE5] rounded"></div>
        <div className="flex-grow flex flex-col gap-2">
          <div className="h-4 bg-[#F5ECE5] rounded w-full"></div>
          <div className="h-4 bg-[#F5ECE5] rounded w-5/6"></div>
          <div className="h-4 bg-[#F5ECE5] rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const {
    recommendations: suggestionsList = [],
    habits = [],
    prompts = [],
    companionSuggestions = []
  } = recommendations;

  const hasData = suggestionsList.length > 0 || habits.length > 0 || prompts.length > 0 || companionSuggestions.length > 0;

  if (!hasData) {
    return (
      <EmptyState
        title="Waiting for AI Reflections"
        description="To generate personalized wellness suggestions, log at least 1 mood index or write a journal reflection."
        icon={Sparkles}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* 1. Wellbeing Suggestions & Habits */}
      <Card className="flex flex-col gap-5 relative overflow-hidden" hoverable={true}>
        <div className="absolute top-0 right-0 w-60 h-60 bg-[#FFF9F5] rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col gap-4 z-10">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#D98C6B]" />
            <h3 className="font-display font-extrabold text-base text-[#5A4A42]">Mindfulness Activities</h3>
          </div>
          <ul className="flex flex-col gap-3">
            {suggestionsList.map((rec, idx) => (
              <li key={idx} className="flex gap-2 items-start text-xs font-semibold text-[#8B766C] leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D98C6B] mt-1.5 flex-shrink-0 animate-pulse" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-[#E7D8CC] pt-4 flex flex-col gap-4 z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D98C6B]" />
            <h3 className="font-display font-extrabold text-base text-[#5A4A42]">Habit Recommendations</h3>
          </div>
          <ul className="flex flex-col gap-3">
            {habits.map((hb, idx) => (
              <li key={idx} className="flex gap-2 items-start text-xs font-semibold text-[#8B766C] leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D98C6B] mt-1.5 flex-shrink-0 animate-pulse" />
                <span>{hb}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* 2. Reflection Prompts & Companion suggestions */}
      <Card className="flex flex-col gap-5 relative overflow-hidden" hoverable={true}>
        <div className="absolute top-0 right-0 w-60 h-60 bg-[#FFF9F5] rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col gap-4 z-10">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#D98C6B]" />
            <h3 className="font-display font-extrabold text-base text-[#5A4A42]">Writing Prompts</h3>
          </div>
          <ul className="flex flex-col gap-3">
            {prompts.map((pr, idx) => (
              <li key={idx} className="flex gap-2 items-start text-xs font-semibold text-[#725E54] leading-relaxed bg-[#FFF9F5] border border-[#E7D8CC] p-3.5 rounded-2xl">
                <span>"{pr}"</span>
              </li>
            ))}
          </ul>
        </div>

        {companionSuggestions.length > 0 && (
          <div className="border-t border-[#E7D8CC] pt-4 flex flex-col gap-4 z-10 flex-1 justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#D98C6B]" />
                <h3 className="font-display font-extrabold text-base text-[#5A4A42]">Talk to Companion</h3>
              </div>
              <ul className="flex flex-col gap-2.5">
                {companionSuggestions.map((cs, idx) => (
                  <li key={idx} className="flex gap-2 items-start text-xs font-semibold text-[#8B766C] leading-relaxed font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D98C6B] mt-1.5 flex-shrink-0" />
                    <span>{cs}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link to="/companion" className="block mt-4">
              <Button variant="glass" className="w-full justify-between">
                <span>Open AI Companion Chat</span>
                <MessageSquare className="w-4 h-4 text-[#D98C6B]" />
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};

export default RecommendationCard;
