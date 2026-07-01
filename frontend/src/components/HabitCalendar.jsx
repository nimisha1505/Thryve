import React from 'react';
import { Calendar } from 'lucide-react';
import Card from './Card.jsx';
import EmptyState from './EmptyState.jsx';

const HabitCalendar = ({ habits }) => {
  // Generate the last 30 calendar dates in YYYY-MM-DD format
  const getLast30Days = () => {
    const dates = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dates.push({
        dateStr: `${year}-${month}-${day}`,
        rawDate: d,
        dayNum: d.getDate(),
        monthLabel: d.toLocaleDateString(undefined, { month: 'short' })
      });
    }
    return dates;
  };

  const datesList = getLast30Days();
  const activeHabitsCount = habits.length;

  const getHeatmapClass = (ratio) => {
    if (ratio === 0) return 'bg-[#FFF9F5] border-[#E7D8CC] text-[#8B766C] hover:bg-[#F7D8C5]/20';
    if (ratio <= 0.25) return 'bg-[#D98C6B]/15 border-[#D98C6B]/20 text-[#D98C6B]';
    if (ratio <= 0.50) return 'bg-[#D98C6B]/35 border-[#D98C6B]/40 text-[#D98C6B]';
    if (ratio <= 0.75) return 'bg-[#D98C6B]/60 border-[#D98C6B]/75 text-[#5A4A42]';
    return 'bg-[#D98C6B] border-transparent text-white font-extrabold shadow-sm shadow-[#D98C6B]/20';
  };

  return (
    <Card className="flex flex-col gap-6 relative overflow-hidden border border-[#E7D8CC]" hoverable={false}>
      <div className="absolute top-0 right-0 w-40 h-40 bg-[#FFF9F5] rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col gap-1 relative z-10">
        <h3 className="font-display font-bold text-lg text-[#5A4A42] flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#D98C6B]" />
          <span>Completion Heatmap</span>
        </h3>
        <p className="text-xs text-[#8B766C] font-medium">
          Visualizing your daily habit completions over the past 30 days.
        </p>
      </div>

      {activeHabitsCount === 0 ? (
        <EmptyState
          title="Create a habit to begin"
          description="Streaks and heatmap visualizations will generate here once logs are active."
        />
      ) : (
        <div className="flex flex-col gap-4 relative z-10 animate-fadeIn">
          {/* Heatmap Grid */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
            {datesList.map(({ dateStr, rawDate, dayNum, monthLabel }) => {
              let completedCount = 0;
              habits.forEach(h => {
                if (h.completedDates.includes(dateStr)) {
                  completedCount++;
                }
              });

              const ratio = activeHabitsCount > 0 ? completedCount / activeHabitsCount : 0;
              const pct = Math.round(ratio * 100);

              const formattedFullDate = rawDate.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              });

              return (
                <div
                  key={dateStr}
                  className={`aspect-square flex flex-col items-center justify-center border rounded-xl p-1 text-center transition-all duration-300 relative group cursor-help ${getHeatmapClass(ratio)}`}
                >
                  <span className="text-[9px] font-bold opacity-60 leading-none">
                    {monthLabel}
                  </span>
                  <span className="text-base font-display font-extrabold mt-0.5">
                    {dayNum}
                  </span>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-36 p-2 bg-white border border-[#E7D8CC] text-[#5A4A42] rounded-lg text-[10px] font-medium leading-normal pointer-events-none opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-200 shadow-xl z-35 text-center">
                    <span className="font-bold block text-[#8B766C]">{formattedFullDate}</span>
                    <span className="mt-1 block text-[#D98C6B] font-bold">
                      {completedCount} of {activeHabitsCount} done ({pct}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Color Legend */}
          <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-[#8B766C] mt-2 font-mono">
            <span>Less</span>
            <div className="w-3.5 h-3.5 rounded bg-[#FFF9F5] border border-[#E7D8CC]"></div>
            <div className="w-3.5 h-3.5 rounded bg-[#D98C6B]/15 border border-[#D98C6B]/20"></div>
            <div className="w-3.5 h-3.5 rounded bg-[#D98C6B]/35 border border-[#D98C6B]/40"></div>
            <div className="w-3.5 h-3.5 rounded bg-[#D98C6B]/60 border border-[#D98C6B]/75"></div>
            <div className="w-3.5 h-3.5 rounded bg-[#D98C6B]"></div>
            <span>More</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default HabitCalendar;
