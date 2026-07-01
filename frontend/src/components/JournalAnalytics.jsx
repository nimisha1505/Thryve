import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  LineChart,
  Line,
} from 'recharts';
import { Calendar, BarChart2, BookOpen, FileText } from 'lucide-react';
import Card from './Card.jsx';

const CustomTooltip = ({ active, payload, label, isWordCount = false }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#FFF9F5] border border-[#E7D8CC] p-3.5 rounded-2xl shadow-lg flex flex-col gap-1 text-xs text-[#5A4A42]">
        <span className="font-bold">{label}</span>
        <span className="font-extrabold text-[#D98C6B]">
          {isWordCount ? `Words: ${payload[0].value}` : `Entries: ${payload[0].value}`}
        </span>
      </div>
    );
  }
  return null;
};

const CompactEmptyState = ({ icon: Icon, message }) => (
  <div className="h-32 w-full flex flex-col items-center justify-center gap-2 p-4 text-center">
    <Icon className="w-8 h-8 text-[#D98C6B] opacity-40 stroke-[1.5]" />
    <span className="text-xs text-[#8B766C] font-semibold max-w-[200px] leading-relaxed">
      {message}
    </span>
  </div>
);

const JournalAnalytics = ({ analyticsData, loading }) => {
  if (loading || !analyticsData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-panel p-5 h-52 rounded-[28px] border border-[#E7D8CC] bg-[#F5ECE5]/30"></div>
        ))}
      </div>
    );
  }

  const {
    weeklyTrends = [],
    monthlyTrends = [],
    categoryDistribution = [],
    moodDistribution = [],
    wordCountTrends = [],
  } = analyticsData;

  const hasWeekly = weeklyTrends.length > 0;
  const hasMonthly = monthlyTrends.length > 0;
  const hasCategories = categoryDistribution.length > 0;
  const hasMoods = moodDistribution.length > 0;
  const hasWordCount = wordCountTrends.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* 1. Journals per week */}
      <Card className="flex flex-col gap-4 bg-white border border-[#E7D8CC] rounded-[28px] p-5" hoverable={false}>
        <div className="flex items-center gap-2 px-1">
          <Calendar className="w-4 h-4 text-[#D98C6B]" />
          <h4 className="font-display font-bold text-sm text-[#5A4A42]">Weekly Entry Volume (Last 8 Weeks)</h4>
        </div>
        <div className={hasWeekly ? "h-48 w-full" : "h-32 w-full flex items-center justify-center"}>
          {hasWeekly ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="weeklyColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D98C6B" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#D98C6B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7D8CC" opacity={0.5} />
                <XAxis dataKey="label" tick={{ fill: '#8B766C', fontSize: 10, fontWeight: 600 }} tickLine={false} axisLine={false} dy={8} />
                <YAxis allowDecimals={false} tick={{ fill: '#8B766C', fontSize: 10, fontWeight: 600 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" stroke="#D98C6B" strokeWidth={2.5} fillOpacity={1} fill="url(#weeklyColor)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <CompactEmptyState icon={Calendar} message="Log weekly reflections to see volume patterns." />
          )}
        </div>
      </Card>

      {/* 2. Journals per month */}
      <Card className="flex flex-col gap-4 bg-white border border-[#E7D8CC] rounded-[28px] p-5" hoverable={false}>
        <div className="flex items-center gap-2 px-1">
          <Calendar className="w-4 h-4 text-[#D98C6B]" />
          <h4 className="font-display font-bold text-sm text-[#5A4A42]">Monthly Entry Volume (Last 6 Months)</h4>
        </div>
        <div className={hasMonthly ? "h-48 w-full" : "h-32 w-full flex items-center justify-center"}>
          {hasMonthly ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7D8CC" opacity={0.5} />
                <XAxis dataKey="label" tick={{ fill: '#8B766C', fontSize: 10, fontWeight: 600 }} tickLine={false} axisLine={false} dy={8} />
                <YAxis allowDecimals={false} tick={{ fill: '#8B766C', fontSize: 10, fontWeight: 600 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#F7D8C5" radius={[5, 5, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <CompactEmptyState icon={Calendar} message="Your monthly timeline will appear here." />
          )}
        </div>
      </Card>

      {/* 3. Category Distribution */}
      <Card className="flex flex-col gap-4 bg-white border border-[#E7D8CC] rounded-[28px] p-5" hoverable={false}>
        <div className="flex items-center gap-2 px-1">
          <BarChart2 className="w-4 h-4 text-[#D98C6B]" />
          <h4 className="font-display font-bold text-sm text-[#5A4A42]">Reflection Categories</h4>
        </div>
        <div className={hasCategories ? "h-48 w-full" : "h-32 w-full flex items-center justify-center"}>
          {hasCategories ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDistribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7D8CC" opacity={0.5} />
                <XAxis dataKey="name" tick={{ fill: '#8B766C', fontSize: 10, fontWeight: 600 }} tickLine={false} axisLine={false} dy={8} />
                <YAxis allowDecimals={false} tick={{ fill: '#8B766C', fontSize: 10, fontWeight: 600 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#B8C9A3" radius={[5, 5, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <CompactEmptyState icon={BarChart2} message="Categories will populate as you write." />
          )}
        </div>
      </Card>

      {/* 4. Mood distribution */}
      <Card className="flex flex-col gap-4 bg-white border border-[#E7D8CC] rounded-[28px] p-5" hoverable={false}>
        <div className="flex items-center gap-2 px-1">
          <BookOpen className="w-4 h-4 text-[#D98C6B]" />
          <h4 className="font-display font-bold text-sm text-[#5A4A42]">Mood Tag Frequencies</h4>
        </div>
        <div className={hasMoods ? "h-48 w-full" : "h-32 w-full flex items-center justify-center"}>
          {hasMoods ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moodDistribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7D8CC" opacity={0.5} />
                <XAxis dataKey="name" tick={{ fill: '#8B766C', fontSize: 9, fontWeight: 600 }} tickLine={false} axisLine={false} dy={8} />
                <YAxis allowDecimals={false} tick={{ fill: '#8B766C', fontSize: 10, fontWeight: 600 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#D98C6B" radius={[5, 5, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <CompactEmptyState icon={BookOpen} message="Mood tags will reveal frequency data." />
          )}
        </div>
      </Card>

      {/* 5. Word Count Trend Chart */}
      <Card className="flex flex-col gap-4 lg:col-span-2 bg-white border border-[#E7D8CC] rounded-[28px] p-5" hoverable={false}>
        <div className="flex items-center gap-2 px-1">
          <FileText className="w-4 h-4 text-[#D98C6B]" />
          <h4 className="font-display font-bold text-sm text-[#5A4A42]">Chronological Word Count Trend</h4>
        </div>
        <div className={hasWordCount ? "h-48 w-full" : "h-32 w-full flex items-center justify-center"}>
          {hasWordCount ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={wordCountTrends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7D8CC" opacity={0.5} />
                <XAxis dataKey="date" tick={{ fill: '#8B766C', fontSize: 9, fontWeight: 600 }} tickLine={false} axisLine={false} dy={8} />
                <YAxis tick={{ fill: '#8B766C', fontSize: 10, fontWeight: 600 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip isWordCount={true} />} />
                <Line type="monotone" dataKey="wordCount" stroke="#D98C6B" strokeWidth={3} dot={{ r: 4, stroke: '#D98C6B', strokeWidth: 1.5, fill: '#FFF9F5' }} activeDot={{ r: 6, stroke: '#D98C6B', strokeWidth: 2, fill: '#D98C6B' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <CompactEmptyState icon={FileText} message="Word counts will chart here over time." />
          )}
        </div>
      </Card>
    </div>
  );
};

export default JournalAnalytics;
