import React from 'react';
import { Sparkles, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import Card from './Card.jsx';

const TREND_METRICS = {
  improving: {
    label: 'Improving',
    icon: TrendingUp,
    badgeClass: 'bg-[#B8C9A3]/15 text-[#5A4A42] border-[#B8C9A3]/30',
    description: 'Your mood score is trending upward compared to last week. Keep nurturing yourself!',
  },
  declining: {
    label: 'Declining',
    icon: TrendingDown,
    badgeClass: 'bg-[#D98C6B]/15 text-[#D98C6B] border-[#D98C6B]/30',
    description: 'Your mood score is experiencing a downward shift. Consider taking a gentle pause.',
  },
  stable: {
    label: 'Stable',
    icon: ArrowRight,
    badgeClass: 'bg-[#CFC8E8]/15 text-[#5A4A42] border-[#CFC8E8]/30',
    description: 'Your mood scores are consistent and balanced. You are maintaining a steady baseline.',
  },
};

const SCORE_EMOJIS = {
  1: '😭', 2: '😢', 3: '😔', 4: '😐', 5: '🙂',
  6: '😊', 7: '😌', 8: '😁', 9: '🤩', 10: '😇'
};

const MoodTrendCard = ({ trend, latestLog }) => {
  const trendConfig = TREND_METRICS[trend] || TREND_METRICS.stable;
  const TrendIcon = trendConfig.icon;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="flex flex-col gap-5 relative overflow-hidden h-full" hoverable={true}>
      {/* Glow highlight */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-[#FFF9F5] rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col gap-1 z-10">
        <span className="text-[10px] text-[#8B766C] font-bold uppercase tracking-wider">Trend Direction</span>
        <h4 className="font-display font-bold text-lg text-[#5A4A42]">Mood Momentum</h4>
      </div>

      {/* Trend Direction Badge */}
      <div className="flex flex-col gap-3 z-10">
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 ${trendConfig.badgeClass}`}>
            <TrendIcon className="w-3.5 h-3.5" />
            <span>{trendConfig.label}</span>
          </div>
        </div>
        <p className="text-xs text-[#8B766C] font-medium leading-relaxed">
          {trendConfig.description}
        </p>
      </div>

      <div className="border-t border-[#E7D8CC] my-1"></div>

      {/* Latest Mood Section */}
      <div className="flex flex-col gap-2 z-10">
        <span className="text-[10px] text-[#8B766C] font-bold uppercase tracking-wider">Latest Log Details</span>
        {latestLog ? (
          <div className="flex items-center gap-3.5 p-3.5 bg-[#FFF9F5] border border-[#E7D8CC] rounded-xl">
            <span className="text-3xl">{SCORE_EMOJIS[latestLog.moodScore] || '🙂'}</span>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#5A4A42]">Score: {latestLog.moodScore}/10</span>
                <span className="text-[10px] text-[#8B766C] font-bold font-mono">
                  {formatDate(latestLog.loggedAt)}
                </span>
              </div>
              {latestLog.notes ? (
                <p className="text-xs text-[#725E54] font-medium line-clamp-1 max-w-[200px] italic">
                  "{latestLog.notes}"
                </p>
              ) : (
                <span className="text-[10px] text-[#8B766C] font-medium">Logged with no notes.</span>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-[#FFF9F5] border border-[#E7D8CC] rounded-xl flex items-center justify-center text-center">
            <span className="text-xs text-[#8B766C] font-bold">No entries logged yet</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MoodTrendCard;
