import React from 'react';
import MoodStatsCard from './MoodStatsCard.jsx';
import MoodTrendCard from './MoodTrendCard.jsx';
import MoodChart from './MoodChart.jsx';
import { Smile, Calendar, Trophy, Sparkles, BarChart2 } from 'lucide-react';

const MoodAnalytics = ({ stats, trends, loading }) => {
  if (loading || !stats || !trends) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-panel p-5 h-24 rounded-[28px] border border-[#E7D8CC] bg-[#F5ECE5]/50"></div>
          ))}
        </div>
        {/* Charts and Trend Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-panel p-6 h-80 rounded-[28px] border border-[#E7D8CC] lg:col-span-1 bg-[#F5ECE5]/50"></div>
          <div className="glass-panel p-6 h-80 rounded-[28px] border border-[#E7D8CC] lg:col-span-2 bg-[#F5ECE5]/50"></div>
        </div>
      </div>
    );
  }

  // Format stats descriptors
  const streakText = stats.streak === 1 ? 'day active' : 'consecutive days';
  const highText = stats.highestThisMonth ? `Peak Score: ${stats.highestThisMonth}` : 'No logs yet';
  const lowText = stats.lowestThisMonth ? `Valley Score: ${stats.lowestThisMonth}` : 'No logs yet';

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MoodStatsCard
          title="7-Day Average"
          value={stats.average7d}
          icon={Smile}
          colorClass="text-[#D98C6B] bg-[#D98C6B]/10 border-[#D98C6B]/20"
          description="Reflects your recent baseline"
        />
        <MoodStatsCard
          title="30-Day Average"
          value={stats.average30d}
          icon={Calendar}
          colorClass="text-[#8B766C] bg-[#F5ECE5] border-[#E7D8CC]"
          description="Longer term baseline average"
        />
        <MoodStatsCard
          title="Logging Streak"
          value={stats.streak > 0 ? `${stats.streak} Days` : '0 Days'}
          icon={Trophy}
          colorClass="text-[#B8A070] bg-[#F7D8C5]/40 border-[#E7D8CC]"
          description={`${streakText} active streak`}
        />
        <MoodStatsCard
          title="Month Range"
          value={stats.highestThisMonth ? `${stats.lowestThisMonth}-${stats.highestThisMonth}` : '—'}
          icon={Sparkles}
          colorClass="text-[#B8C9A3] bg-[#B8C9A3]/15 border-[#B8C9A3]/30"
          description="Lowest to highest scores"
        />
      </div>

      {/* 2. Main Analytics Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Momentum Sidecard */}
        <div className="lg:col-span-1">
          <MoodTrendCard trend={stats.trend} latestLog={stats.latestLog} />
        </div>

        {/* Charts Container */}
        <div className="lg:col-span-2">
          <MoodChart
            dailyData={trends.dailyTrends}
            weeklyData={trends.weeklyTrends}
            distributionData={trends.distribution}
          />
        </div>
      </div>
    </div>
  );
};

export default MoodAnalytics;
