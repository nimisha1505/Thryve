import React, { useState, useEffect } from 'react';
import {
  getHabitAnalytics,
  getHabitMoodCorrelation,
  getSmartHabitSuggestions,
  createHabit
} from '../services/habitService.js';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import {
  Sparkles,
  Plus,
  Brain,
  Smile,
  Trophy,
  Flame,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Card from './Card.jsx';
import Button from './Button.jsx';
import StatCard from './StatCard.jsx';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#E7D8CC] p-3.5 rounded-xl shadow-xl flex flex-col gap-1 text-xs">
        <span className="font-bold text-[#8B766C]">{label}</span>
        <span className="font-extrabold text-[#D98C6B]">
          Value: {payload[0].value}
        </span>
      </div>
    );
  }
  return null;
};

const HabitAnalytics = ({ habits, onSuggestionsAdopted }) => {
  const [analytics, setAnalytics] = useState(null);
  const [correlation, setCorrelation] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [adoptingId, setAdoptingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [analyticsRes, correlationRes] = await Promise.all([
        getHabitAnalytics(),
        getHabitMoodCorrelation()
      ]);

      if (analyticsRes?.success) {
        setAnalytics(analyticsRes.data);
      }
      if (correlationRes?.success) {
        setCorrelation(correlationRes.data);
      }
    } catch (err) {
      console.error('Failed to retrieve habit analytics:', err);
      setError('Failed to retrieve analytics databases.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestionsData = async () => {
    try {
      setLoadingSuggestions(true);
      const suggestionsRes = await getSmartHabitSuggestions();
      if (suggestionsRes?.success) {
        setSuggestions(suggestionsRes.data.suggestions || []);
      }
    } catch (err) {
      console.warn('Empathetic suggestions failing to load:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
    fetchSuggestionsData();
  }, [habits]);

  const handleAdoptSuggestion = async (suggestion, idx) => {
    try {
      setAdoptingId(idx);
      const res = await createHabit({
        name: suggestion.name,
        description: suggestion.description,
        frequency: suggestion.frequency,
        customDetails: suggestion.frequency === 'custom' ? 'AI Recommendation' : undefined
      });

      if (res?.success) {
        setSuggestions(prev => prev.filter((_, i) => i !== idx));
        if (onSuggestionsAdopted) {
          onSuggestionsAdopted();
        }
      }
    } catch (err) {
      console.error('Failed to adopt habit suggestion:', err);
    } finally {
      setAdoptingId(null);
    }
  };

  const weekdayData = analytics?.weekdayStats
    ? Object.keys(analytics.weekdayStats).map(day => ({
        day: day.substring(0, 3),
        completions: analytics.weekdayStats[day]
      }))
    : [];

  const weekdaySortOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  weekdayData.sort((a, b) => weekdaySortOrder.indexOf(a.day) - weekdaySortOrder.indexOf(b.day));

  const habitProgressData = analytics?.habitsStats
    ? analytics.habitsStats.map(h => ({
        name: h.name.length > 15 ? h.name.substring(0, 15) + '...' : h.name,
        rate: h.completionRate || 0
      }))
    : [];

  const topStreak = Math.max(...(analytics?.habitsStats?.map(h => h.currentStreak) || [0]), 0);

  return (
    <div className="flex flex-col gap-8 animate-fadeIn">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Top Streak/Metric summary banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Active Consistency"
          value={loading ? '...' : `${analytics?.completionRate || 0}%`}
          progress={loading ? 0 : analytics?.completionRate || 0}
          progressColor="stroke-[#D98C6B]"
          subtext="Daily checklist success rate"
        />

        <StatCard
          title="Total Actions Taken"
          value={loading ? '...' : `${analytics?.totalCompletions || 0} times`}
          icon={Trophy}
          subtext="Goal completions logged"
        />

        <StatCard
          title="Highest Active Streak"
          value={loading ? '...' : `${topStreak} Days`}
          icon={Flame}
          subtext="Momentum check streak record"
        />
      </div>

      {/* Recharts Graphical Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekday Completion Distributions */}
        <Card className="flex flex-col gap-4" hoverable={true}>
          <h3 className="font-display font-bold text-base text-[#5A4A42]">
            Completions by Day of Week
          </h3>
          <div className="h-64 w-full">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#D98C6B]" />
              </div>
            ) : weekdayData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-[#8B766C] font-bold">
                No completions mapped yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekdayData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5ECE5" />
                  <XAxis dataKey="day" tick={{ fill: '#8B766C', fontSize: 11, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8B766C', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="completions" fill="#D98C6B" radius={[6, 6, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Individual Habit Progress Levels */}
        <Card className="flex flex-col gap-4" hoverable={true}>
          <h3 className="font-display font-bold text-base text-[#5A4A42]">
            Habit Consistency Percentages
          </h3>
          <div className="h-64 w-full">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#D98C6B]" />
              </div>
            ) : habitProgressData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-[#8B766C] font-bold">
                No active progress records yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={habitProgressData} layout="vertical" margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F5ECE5" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#8B766C', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#8B766C', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="rate" radius={[0, 6, 6, 0]} maxBarSize={20}>
                    {habitProgressData.map((entry, idx) => {
                      const color = idx % 2 === 0 ? '#CFC8E8' : '#F7D8C5'; // Lavender and Peach
                      return <Cell key={`cell-${idx}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Mood-Habit Correlation Section */}
      <Card className="flex flex-col gap-6" hoverable={false}>
        <div className="flex flex-col gap-1">
          <h3 className="font-display font-bold text-base text-[#5A4A42] flex items-center gap-2">
            <Smile className="w-4.5 h-4.5 text-[#D98C6B]" />
            <span>Habit & Mood Impact Analytics</span>
          </h3>
          <p className="text-xs text-[#8B766C] font-medium">
            This engine correlates your logged moods with completed habits on the same calendar days.
          </p>
        </div>

        {/* Overall Correlation Score Box */}
        {correlation?.overallCorrelation && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#FFF9F5] border border-[#E7D8CC] rounded-2xl p-4 items-center">
            <div className="flex flex-col">
              <span className="text-[10px] text-[#8B766C] font-bold uppercase tracking-wider">High Habit Day Mood Average</span>
              <span className="text-xl font-extrabold text-[#5A4A42] font-display mt-0.5">
                {correlation.overallCorrelation.highHabitAvgMood} / 10
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#8B766C] font-bold uppercase tracking-wider">Low Habit Day Mood Average</span>
              <span className="text-xl font-extrabold text-[#5A4A42] font-display mt-0.5">
                {correlation.overallCorrelation.lowHabitAvgMood} / 10
              </span>
            </div>
            <div className="flex flex-col border-t md:border-t-0 md:border-l border-[#E7D8CC] pt-3 md:pt-0 md:pl-4">
              <span className="text-[10px] text-[#8B766C] font-bold uppercase tracking-wider">Overall Habit Mood Boost</span>
              <span className={`text-xl font-extrabold font-display mt-0.5 ${
                correlation.overallCorrelation.difference > 0 ? 'text-[#D98C6B]' : 'text-[#8B766C]'
              }`}>
                {correlation.overallCorrelation.difference > 0 ? `+${correlation.overallCorrelation.difference}` : correlation.overallCorrelation.difference} pts
              </span>
            </div>
          </div>
        )}

        {/* Per-habit table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E7D8CC] text-[#8B766C] font-bold uppercase tracking-wider font-mono">
                <th className="pb-3 pl-1 font-semibold">Habit Name</th>
                <th className="pb-3 text-center font-semibold">Completed Days Mood</th>
                <th className="pb-3 text-center font-semibold">Uncompleted Days Mood</th>
                <th className="pb-3 text-right pr-2 font-semibold">Net Mood Influence</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-[#8B766C] font-medium">
                    Calculating correlations...
                  </td>
                </tr>
              ) : !correlation?.habitCorrelations || correlation.habitCorrelations.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-[#8B766C] font-medium font-mono">
                    Log both habits and moods to run correlation reports.
                  </td>
                </tr>
              ) : (
                correlation.habitCorrelations.map((h, i) => (
                  <tr key={i} className="border-b border-[#E7D8CC] hover:bg-[#FFF9F5] transition-all">
                    <td className="py-3.5 pl-1 font-bold text-[#5A4A42]">{h.name}</td>
                    <td className="py-3.5 text-center text-[#8B766C] font-medium font-mono">
                      {h.completedDaysAvgMood ? `${h.completedDaysAvgMood}/10` : 'N/A'}
                    </td>
                    <td className="py-3.5 text-center text-[#8B766C] font-medium font-mono">
                      {h.uncompletedDaysAvgMood ? `${h.uncompletedDaysAvgMood}/10` : 'N/A'}
                    </td>
                    <td className="py-3.5 text-right pr-2 font-bold font-mono">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                        h.difference > 0.5
                          ? 'bg-[#B8C9A3]/15 border-[#B8C9A3]/30 text-[#5A4A42]'
                          : h.difference < -0.5
                          ? 'bg-red-500/10 border-red-500/20 text-red-500'
                          : 'bg-[#FFF9F5] border border-[#E7D8CC] text-[#8B766C]'
                      }`}>
                        {h.difference > 0 ? `+${h.difference}` : h.difference} ({h.correlation})
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Smart Suggestions Panel */}
      <Card className="flex flex-col gap-5 relative overflow-hidden" hoverable={false}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFF9F5] rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex justify-between items-start z-10">
          <div className="flex flex-col gap-1 relative">
            <h3 className="font-display font-bold text-base text-[#5A4A42] flex items-center gap-2">
              <Brain className="w-4.5 h-4.5 text-[#D98C6B]" />
              <span>Smart Habit Recommendations</span>
            </h3>
            <p className="text-xs text-[#8B766C] font-medium">
              AI-generated suggestions customized from your logged mood attributes, journals, and helper records.
            </p>
          </div>
          <span className="text-[9px] font-bold bg-[#CFC8E8]/20 border border-[#CFC8E8]/40 text-[#5A4A42] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0 animate-pulse">
            Gemini Active
          </span>
        </div>

        {loadingSuggestions ? (
          <div className="flex flex-col gap-3 justify-center py-6 items-center z-10">
            <Loader2 className="w-6 h-6 animate-spin text-[#D98C6B]" />
            <span className="text-xs text-[#8B766C] font-bold">Synthesizing suggestions...</span>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="bg-[#FFF9F5] border border-[#E7D8CC] p-5 rounded-xl text-center text-xs text-[#8B766C] font-bold font-mono z-10">
            No suggestions available. Log more entries to seed recommendations!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
            {suggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className="bg-[#FFF9F5] border border-[#E7D8CC] hover:border-[#D98C6B]/30 rounded-xl p-4.5 flex flex-col justify-between gap-3 hover:-translate-y-0.5 transition-all group"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#5A4A42] group-hover:text-[#D98C6B] transition-colors">
                      {suggestion.name}
                    </span>
                    <span className="text-[9px] font-extrabold bg-[#FFF9F5] border border-[#E7D8CC] px-2 py-0.5 rounded-md text-[#8B766C] font-mono uppercase">
                      {suggestion.frequency}
                    </span>
                  </div>
                  <p className="text-xs text-[#8B766C] font-medium leading-relaxed">
                    {suggestion.description}
                  </p>
                  <div className="bg-[#CFC8E8]/10 border border-[#CFC8E8]/20 p-2.5 rounded-lg">
                    <p className="text-[10px] text-[#5A4A42] font-semibold leading-relaxed">
                      💡 {suggestion.reason}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => handleAdoptSuggestion(suggestion, idx)}
                  disabled={adoptingId !== null}
                  variant="glass"
                  size="sm"
                  className="w-full"
                >
                  {adoptingId === idx ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  <span>Adopt Habit</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default HabitAnalytics;
