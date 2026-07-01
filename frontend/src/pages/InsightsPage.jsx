import React, { useState, useEffect } from 'react';
import InsightCard from '../components/InsightCard.jsx';
import MoodForecastCard from '../components/MoodForecastCard.jsx';
import PatternCard from '../components/PatternCard.jsx';
import RecommendationCard from '../components/RecommendationCard.jsx';
import {
  getInsightsSummary,
  getInsightsPatterns,
  getInsightsRecommendations
} from '../services/insightsService.js';
import { getMoodTrends } from '../services/moodService.js';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Sparkles, Brain, TrendingUp, HelpCircle, Activity, Calendar, AlertCircle } from 'lucide-react';
import SectionHeader from '../components/SectionHeader.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#E7D8CC] p-3 rounded-xl shadow-xl flex flex-col gap-0.5 text-[10px]">
        <span className="font-bold text-[#8B766C]">{label}</span>
        <span className="font-extrabold text-[#D98C6B]">
          Value: {payload[0].value}
        </span>
      </div>
    );
  }
  return null;
};

const InsightsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // States for API feeds
  const [summaryData, setSummaryData] = useState(null);
  const [patternsData, setPatternsData] = useState(null);
  const [recommendationsData, setRecommendationsData] = useState(null);
  const [moodTrends, setMoodTrends] = useState({ dailyTrends: [], weeklyTrends: [], distribution: [] });

  // Mood Heatmap logs state
  const [heatmapDays, setHeatmapDays] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const [summaryRes, patternsRes, recRes, trendsRes] = await Promise.all([
        getInsightsSummary(),
        getInsightsPatterns(),
        getInsightsRecommendations(),
        getMoodTrends()
      ]);

      if (summaryRes?.success) setSummaryData(summaryRes.data);
      if (patternsRes?.success) setPatternsData(patternsRes.data);
      if (recRes?.success) setRecommendationsData(recRes.data);
      if (trendsRes?.success) {
        setMoodTrends(trendsRes.data);
        
        const dailyMap = {};
        trendsRes.data.dailyTrends.forEach(d => {
          dailyMap[d.date] = d.avgScore;
        });

        const days = [];
        for (let i = 27; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const score = dailyMap[dateStr] || null;
          days.push({ dateStr, score, dayObj: d });
        }
        setHeatmapDays(days);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to compile AI insights databases.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getHeatmapColor = (score) => {
    if (score === null) return 'bg-[#FFF9F5] border-[#E7D8CC] text-[#8B766C]';
    if (score < 4.5) return 'bg-red-500/10 border-red-500/20 text-red-500';
    if (score < 6.5) return 'bg-[#D98C6B]/10 border-[#D98C6B]/20 text-[#D98C6B]';
    if (score < 8.5) return 'bg-[#CFC8E8]/20 border-[#CFC8E8]/35 text-[#5A4A42]';
    return 'bg-[#B8C9A3]/20 border-[#B8C9A3]/30 text-[#5A4A42]';
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Header */}
      <SectionHeader
        title="Your Wellness Journey"
        description="Review dynamic wellness metrics, mood predictions, and personalized recommendations."
      />

      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Hero row (Score Summary & Forecast) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start">
        <InsightCard
          score={summaryData?.wellbeingScore}
          breakdown={summaryData?.wellbeingBreakdown || {}}
          loading={loading}
        />
        <MoodForecastCard
          forecast={summaryData?.forecast || {}}
          loading={loading}
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E7D8CC] gap-6 mt-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-all duration-150 cursor-pointer ${
            activeTab === 'overview'
              ? 'border-[#D98C6B] text-[#D98C6B]'
              : 'border-transparent text-[#8B766C] hover:text-[#5A4A42]'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Mood Trends</span>
        </button>
        <button
          onClick={() => setActiveTab('patterns')}
          className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-all duration-150 cursor-pointer ${
            activeTab === 'patterns'
              ? 'border-[#D98C6B] text-[#D98C6B]'
              : 'border-transparent text-[#8B766C] hover:text-[#5A4A42]'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>Behavior Patterns</span>
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-all duration-150 cursor-pointer ${
            activeTab === 'recommendations'
              ? 'border-[#D98C6B] text-[#D98C6B]'
              : 'border-transparent text-[#8B766C] hover:text-[#5A4A42]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Suggestions</span>
        </button>
      </div>

      {/* Viewport content */}
      <div className="mt-2 w-full">
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6 w-full">
            {/* Charts block */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
              {/* Daily mood trends line chart */}
              <Card className="flex flex-col gap-4" hoverable={true}>
                <h4 className="font-display font-bold text-sm text-[#5A4A42] px-1">Daily Mood Trend</h4>
                <div className="h-64 w-full flex items-center justify-center">
                  {loading ? (
                    <div className="w-full h-full bg-[#FFF9F5] border border-[#E7D8CC] animate-pulse rounded-[28px]"></div>
                  ) : moodTrends.dailyTrends.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={moodTrends.dailyTrends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5ECE5" />
                        <XAxis dataKey="date" tick={{ fill: '#8B766C', fontSize: 9, fontWeight: 650 }} tickLine={false} axisLine={false} dy={8} />
                        <YAxis domain={[1, 10]} ticks={[1, 3, 5, 7, 9, 10]} tick={{ fill: '#8B766C', fontSize: 10, fontWeight: 650 }} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="avgScore" stroke="#D98C6B" strokeWidth={3} dot={{ r: 3.5, stroke: '#D98C6B', strokeWidth: 1, fill: 'white' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <span className="text-xs text-[#8B766C] font-bold">Insufficient daily trend logs</span>
                  )}
                </div>
              </Card>

              {/* Weekly mood trends area chart */}
              <Card className="flex flex-col gap-4" hoverable={true}>
                <h4 className="font-display font-bold text-sm text-[#5A4A42] px-1">Weekly Mood Average</h4>
                <div className="h-64 w-full flex items-center justify-center">
                  {loading ? (
                    <div className="w-full h-full bg-[#FFF9F5] border border-[#E7D8CC] animate-pulse rounded-[28px]"></div>
                  ) : moodTrends.weeklyTrends.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={moodTrends.weeklyTrends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="insightsWeekly" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#CFC8E8" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#CFC8E8" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5ECE5" />
                        <XAxis dataKey="label" tick={{ fill: '#8B766C', fontSize: 9, fontWeight: 650 }} tickLine={false} axisLine={false} dy={8} />
                        <YAxis domain={[1, 10]} ticks={[1, 3, 5, 7, 9, 10]} tick={{ fill: '#8B766C', fontSize: 10, fontWeight: 650 }} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="avgScore" stroke="#CFC8E8" strokeWidth={2.5} fill="url(#insightsWeekly)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <span className="text-xs text-[#8B766C] font-bold">Insufficient weekly trend logs</span>
                  )}
                </div>
              </Card>
            </div>

            {/* Weekly Mood Heatmap grid */}
            <Card className="flex flex-col gap-5 relative overflow-hidden" hoverable={false}>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#D98C6B]" />
                <h3 className="font-display font-extrabold text-base text-[#5A4A42]">Mood Score Heatmap</h3>
              </div>

              {loading ? (
                <div className="h-16 bg-[#FFF9F5] border border-[#E7D8CC] animate-pulse rounded-[28px] w-full"></div>
              ) : heatmapDays.length > 0 ? (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 w-full">
                    {heatmapDays.map((day, idx) => (
                      <div
                        key={idx}
                        className={`aspect-square p-1 rounded-xl border transition-all duration-200 flex flex-col justify-between items-center min-h-[48px] ${getHeatmapColor(day.score)}`}
                        title={`${day.dateStr}: ${day.score !== null ? `${day.score}/10 average` : 'No logs'}`}
                      >
                        <span className="text-[9px] font-bold opacity-60 font-mono">
                          {day.dayObj.getDate()}
                        </span>
                        <span className="text-xs font-extrabold font-display">
                          {day.score !== null ? day.score.toFixed(0) : '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#8B766C] font-bold px-1 select-none font-mono">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span>Low mood</span>
                      <div className="w-2.5 h-2.5 rounded bg-red-500/10 border border-red-500/20" />
                      <div className="w-2.5 h-2.5 rounded bg-[#D98C6B]/10 border border-[#D98C6B]/20" />
                      <div className="w-2.5 h-2.5 rounded bg-[#CFC8E8]/20 border border-[#CFC8E8]/35" />
                      <div className="w-2.5 h-2.5 rounded bg-[#B8C9A3]/20 border border-[#B8C9A3]/30" />
                      <span>Excellent</span>
                    </div>
                    <span>Showing past 28 days</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#8B766C] font-medium italic">Record mood tracker logs to populate heatmap calendar.</p>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'patterns' && (
          <div className="flex flex-col gap-6 w-full animate-fadeIn">
            {/* Patterns Card lists */}
            <PatternCard patterns={patternsData || {}} loading={loading} />

            {/* Advanced charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full items-start">
              {/* Weekday distribution average */}
              <Card className="flex flex-col gap-4 lg:col-span-2" hoverable={true}>
                <h4 className="font-display font-bold text-sm text-[#5A4A42] px-1">Weekday Mood Performance</h4>
                <div className="h-64 w-full flex items-center justify-center">
                  {loading ? (
                    <div className="w-full h-full bg-[#FFF9F5] border border-[#E7D8CC] animate-pulse rounded-[28px]"></div>
                  ) : patternsData?.weekdaysMapped && patternsData.weekdaysMapped.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={patternsData.weekdaysMapped} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5ECE5" />
                        <XAxis dataKey="dayName" tick={{ fill: '#8B766C', fontSize: 10, fontWeight: 650 }} tickLine={false} axisLine={false} dy={8} />
                        <YAxis domain={[1, 10]} ticks={[1, 3, 5, 7, 9, 10]} tick={{ fill: '#8B766C', fontSize: 10, fontWeight: 650 }} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="avgScore" fill="#F7D8C5" radius={[6, 6, 0, 0]} maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <span className="text-xs text-[#8B766C] font-bold">Insufficient weekday logs</span>
                  )}
                </div>
              </Card>

              {/* Tag density radar chart */}
              <Card className="flex flex-col gap-4" hoverable={true}>
                <h4 className="font-display font-bold text-sm text-[#5A4A42] px-1">Mood Tag Radar Density</h4>
                <div className="h-64 w-full flex items-center justify-center">
                  {loading ? (
                    <div className="w-full h-full bg-[#FFF9F5] border border-[#E7D8CC] animate-pulse rounded-[28px]"></div>
                  ) : patternsData?.commonTags && patternsData.commonTags.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" radius="70%" data={patternsData.commonTags}>
                        <PolarGrid stroke="#F5ECE5" />
                        <PolarAngleAxis dataKey="tag" tick={{ fill: '#8B766C', fontSize: 9, fontWeight: 650 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: '#8B766C', fontSize: 8 }} />
                        <Radar name="Tags Frequency" dataKey="count" stroke="#D98C6B" fill="#D98C6B" fillOpacity={0.15} />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : (
                    <span className="text-xs text-[#8B766C] font-bold">Insufficient tags logged</span>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <RecommendationCard
            recommendations={recommendationsData || {}}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default InsightsPage;
