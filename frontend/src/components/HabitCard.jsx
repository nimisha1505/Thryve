import React, { useState } from 'react';
import { toggleHabit } from '../services/habitService.js';
import { Flame, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import Card from './Card.jsx';

const HabitCard = ({ habit, onEdit, onDelete, onToggleSuccess }) => {
  const [loadingToggle, setLoadingToggle] = useState(false);

  // Helper to get local date strings for the last 7 days
  const getLast7Days = () => {
    const days = [];
    const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dateNum = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${dateNum}`;
      
      days.push({
        dateStr,
        dayLabel: DAYS_SHORT[d.getDay()],
        dayNum: d.getDate(),
        isToday: i === 0
      });
    }
    return days;
  };

  const last7Days = getLast7Days();
  const todayStr = last7Days[6].dateStr;
  const isCompletedToday = habit.completedDates.includes(todayStr);

  const handleToggleDate = async (dateStr) => {
    try {
      setLoadingToggle(true);
      const res = await toggleHabit(habit._id, dateStr);
      if (res?.success && onToggleSuccess) {
        onToggleSuccess();
      }
    } catch (err) {
      console.error('Failed to toggle habit completion:', err);
    } finally {
      setLoadingToggle(false);
    }
  };

  // Calculate local completion percentage (completions in last 30 days)
  const completionsCount = habit.completedDates.length;
  // Dynamic age calculation in days
  const habitAge = Math.max(1, Math.round((new Date() - new Date(habit.createdAt)) / (1000 * 60 * 60 * 24)));
  const completionPercentage = Math.min(100, Math.round((completionsCount / habitAge) * 100));

  return (
    <Card className="p-5 flex flex-col gap-4 relative overflow-hidden border border-[#E7D8CC]" hoverable={true}>
      {/* Subtle completion indicator light */}
      {isCompletedToday && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#D98C6B]/80 animate-pulse"></div>
      )}

      {/* Habit Heading */}
      <div className="flex justify-between items-start gap-4 z-10">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-display font-extrabold text-base text-[#5A4A42] line-clamp-1">
              {habit.name}
            </h4>
            <span className="text-[10px] font-bold bg-[#D98C6B]/10 border border-[#D98C6B]/20 text-[#D98C6B] px-2 py-0.5 rounded-md capitalize flex-shrink-0">
              {habit.frequency}
            </span>
            {habit.frequency === 'custom' && habit.customDetails && (
              <span className="text-[10px] text-[#8B766C] font-semibold truncate max-w-[100px]">
                ({habit.customDetails})
              </span>
            )}
          </div>
          {habit.description && (
            <p className="text-xs text-[#8B766C] font-medium line-clamp-2 pr-2 leading-relaxed">
              {habit.description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(habit)}
            className="p-1.5 hover:bg-[#FFF9F5] text-[#8B766C] hover:text-[#5A4A42] rounded-lg transition-colors"
            title="Edit Habit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(habit._id)}
            className="p-1.5 hover:bg-red-500/10 text-[#8B766C] hover:text-red-400 rounded-lg transition-colors"
            title="Delete Habit"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress & Streaks Metrics */}
      <div className="grid grid-cols-2 gap-4 bg-[#FFF9F5] border border-[#E7D8CC] rounded-xl p-3 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#D98C6B]/10 border border-[#D98C6B]/20 flex items-center justify-center text-[#D98C6B]">
            <Flame className="w-4 h-4 fill-[#D98C6B]/10" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-[#8B766C] font-bold uppercase tracking-wider leading-none">Streak</span>
            <span className="text-xs font-bold text-[#5A4A42] mt-1">
              {habit.currentStreak}d / {habit.longestStreak}d
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#D98C6B]/10 border border-[#D98C6B]/20 flex items-center justify-center text-[#D98C6B]">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-[#8B766C] font-bold uppercase tracking-wider leading-none">Completions</span>
            <span className="text-xs font-bold text-[#5A4A42] mt-1">
              {completionsCount} times
            </span>
          </div>
        </div>
      </div>

      {/* Linear Sanctuary Progress Bar */}
      <div className="flex flex-col gap-1 z-10">
        <div className="flex justify-between items-center text-[10px] font-bold text-[#8B766C] font-mono">
          <span>Overall Consistency</span>
          <span>{completionPercentage}%</span>
        </div>
        <div className="w-full h-1.5 bg-[#F5ECE5] rounded-full overflow-hidden">
          <div
            style={{ width: `${completionPercentage}%` }}
            className="h-full bg-[#D98C6B] rounded-full transition-all duration-500 ease-out"
          ></div>
        </div>
      </div>

      {/* 7-Day Completion Tracker Checklist */}
      <div className="flex flex-col gap-2 border-t border-[#E7D8CC] pt-3 z-10">
        <span className="text-[10px] text-[#8B766C] font-bold uppercase tracking-wider px-1">
          Last 7 Days Tracker
        </span>
        <div className="flex justify-between items-center px-1">
          {last7Days.map((day) => {
            const isCompleted = habit.completedDates.includes(day.dateStr);
            return (
              <button
                key={day.dateStr}
                disabled={loadingToggle}
                onClick={() => handleToggleDate(day.dateStr)}
                className="flex flex-col items-center gap-1.5 group/day focus:outline-none disabled:opacity-50"
              >
                <span className={`text-[9px] font-bold font-mono transition-colors ${
                  day.isToday ? 'text-[#D98C6B] font-extrabold animate-pulse' : 'text-[#8B766C] group-hover/day:text-[#5A4A42]'
                }`}>
                  {day.dayLabel}
                </span>
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-[#D98C6B] border-transparent text-white scale-105 shadow-sm shadow-[#D98C6B]/15'
                    : 'bg-[#FFF9F5] border-[#E7D8CC] text-[#8B766C] hover:border-[#D98C6B]/30 hover:text-[#D98C6B]'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-white animate-fadeIn" />
                  ) : (
                    <span className="text-[9px] font-bold">{day.dayNum}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default HabitCard;
