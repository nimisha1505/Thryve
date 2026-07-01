import React from 'react';
import { Calendar as CalIcon, Info } from 'lucide-react';
import Card from './Card.jsx';

// Format date to local key YYYY-MM-DD to avoid UTC timezone shifting
function formatLocalDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const JournalCalendar = ({ heatmapData = [], onDateClick, selectedDate }) => {
  // Generate grid dates (last 24 weeks / 168 days) aligned to Sunday
  const getGridDays = () => {
    const days = [];
    const now = new Date();
    const dow = now.getDay();

    const start = new Date(now);
    // Go to Sunday of current week, then back 23 weeks (161 days)
    start.setDate(now.getDate() - dow - 161);
    start.setHours(0, 0, 0, 0);

    for (let i = 0; i < 168; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const gridDays = getGridDays();

  // Find matches in heatmapData using local keys
  const getLogCountForDate = (date) => {
    const dateStr = formatLocalDate(date);
    const match = heatmapData.find((d) => d.date === dateStr);
    return match ? match.count : 0;
  };

  // Color mapping based on user specifications:
  // 0 entries: #F5ECE5
  // 1 entry: #F7D8C5
  // 2 entries: #D98C6B
  // 3+ entries: #B8C9A3
  const getHeatClass = (count) => {
    if (count === 0) return 'bg-[#F5ECE5] border-[#E7D8CC]/40 hover:bg-[#F5ECE5]/80';
    if (count === 1) return 'bg-[#F7D8C5] border-[#F7D8C5]/30 cursor-pointer';
    if (count === 2) return 'bg-[#D98C6B] border-[#D98C6B]/20 cursor-pointer';
    return 'bg-[#B8C9A3] border-[#B8C9A3]/20 cursor-pointer';
  };

  const formatDateStr = (date) => {
    return date.toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Group days into weeks for column layout (7 days per column)
  const weeks = [];
  let currentWeek = [];
  gridDays.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || index === gridDays.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const handleBlockClick = (day, count) => {
    const dateStr = formatLocalDate(day);
    if (dateStr === selectedDate) {
      if (onDateClick) onDateClick(null); // Clear filter when clicked again
    } else {
      if (onDateClick) onDateClick(dateStr);
    }
  };

  const totalLogsCount = heatmapData.reduce((sum, curr) => sum + (curr.count || 0), 0);

  // Calculate month labels dynamically from actual dates in grid columns
  const getMonthLabel = (week, wIdx) => {
    if (wIdx === 0) {
      return week[0]?.toLocaleDateString(undefined, { month: 'short' });
    }
    // Find if any day in the current week is the 1st of the month
    const firstOfMonthDay = week.find(d => d.getDate() === 1);
    if (firstOfMonthDay) {
      return firstOfMonthDay.toLocaleDateString(undefined, { month: 'short' });
    }
    return null;
  };

  return (
    <Card className="flex flex-col gap-6 relative bg-white border border-[#E7D8CC] rounded-[28px] p-5 shadow-[0_4px_24px_rgba(90,74,66,0.02)]" hoverable={false}>
      {/* Title block */}
      <div className="flex items-center justify-between border-b border-[#E7D8CC]/50 pb-2">
        <div className="flex items-center gap-2">
          <CalIcon className="w-4 h-4 text-[#D98C6B]" />
          <h4 className="font-display font-bold text-sm text-[#5A4A42]">Activity Calendar</h4>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[#8B766C] font-bold uppercase tracking-wider select-none">
          <Info className="w-3.5 h-3.5" />
          <span>Click colored block to filter journals</span>
        </div>
      </div>

      {/* Grid container with proper centering and scroll wrapper */}
      <div className="flex flex-col gap-5 w-full">
        <div
          className="flex justify-center w-full overflow-x-auto pb-2"
          style={{ opacity: totalLogsCount === 0 ? 0.6 : 1 }}
        >
          <div className="flex gap-2 items-start">

            {/* Weekday labels column */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              paddingTop: '20px', // aligns with month labels height (16px) + gap (4px)
              flexShrink: 0,
            }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((lbl, idx) => (
                <div key={idx} style={{
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  fontSize: '9px',
                  fontWeight: 800,
                  color: '#8B766C',
                  textTransform: 'uppercase',
                  paddingRight: '6px',
                }}>
                  {idx % 2 === 0 ? lbl : ''}
                </div>
              ))}
            </div>

            {/* Heatmap Grid (Months + Columns container) */}
            <div className="flex flex-col gap-[4px]">

              {/* Month labels row */}
              <div style={{ display: 'flex', gap: '4px', height: '16px' }}>
                {weeks.map((week, wIdx) => {
                  const monthLabel = getMonthLabel(week, wIdx);
                  return (
                    <div key={wIdx} style={{ width: '16px', position: 'relative' }}>
                      {monthLabel && (
                        <span className="absolute left-0 bottom-0 text-[9px] font-extrabold text-[#8B766C] uppercase tracking-wider whiteSpace-nowrap leading-none select-none">
                          {monthLabel}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Columns container (stuck closely together for dense streaks) */}
              <div className="flex gap-[4px]">
                {weeks.map((week, wIndex) => (
                  <div key={wIndex} className="flex flex-col gap-[4px]">
                    {week.map((day, dIndex) => {
                      const count = getLogCountForDate(day);
                      const heatClass = getHeatClass(count);
                      const localStr = formatLocalDate(day);
                      const isSelected = selectedDate === localStr;

                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const dayTime = new Date(day);
                      dayTime.setHours(0, 0, 0, 0);

                      const isFuture = dayTime > today;
                      const isToday = dayTime.getTime() === today.getTime();

                      return (
                        <div
                          key={dIndex}
                          onClick={() => !isFuture && handleBlockClick(day, count)}
                          className={`w-[16px] h-[16px] rounded-[4px] transition-all duration-200 ${isFuture ? '' : 'hover:scale-110 active:scale-95'
                            } ${isFuture ? '' : heatClass}`}
                          style={{
                            border: isToday ? '2px solid #D98C6B' : undefined,
                            outline: isSelected ? '2px solid #D98C6B' : 'none',
                            outlineOffset: '1px',
                            visibility: isFuture ? 'hidden' : 'visible',
                            pointerEvents: isFuture ? 'none' : 'auto',
                          }}
                          title={isFuture ? '' : `${formatDateStr(day)} — ${count} ${count === 1 ? 'journal entry' : 'journal entries'}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[10px] text-[#8B766C] font-bold px-1 select-none">
          <div className="flex items-center gap-2">
            <span>Less</span>
            <div className="w-[10px] h-[10px] rounded-[2px] bg-[#F5ECE5] border border-[#E7D8CC]" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-[#F7D8C5] border border-[#E7D8CC]" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-[#D98C6B] border border-[#D98C6B]/20" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-[#B8C9A3] border border-[#B8C9A3]/20" />
            <span>More</span>
          </div>
          <span className="font-mono">Showing past 24 weeks</span>
        </div>
      </div>

      {/* Empty / Low-data state friendly message */}
      {totalLogsCount === 0 && (
        <div className="text-center p-4 rounded-2xl bg-[#FFF9F5] border border-dashed border-[#E7D8CC] max-w-sm mx-auto animate-fadeIn mt-2">
          <p className="text-xs text-[#8B766C] font-semibold italic">
            "Start journaling to build your reflection streak."
          </p>
        </div>
      )}

      {/* Selected Block Info Panel */}
      {selectedDate && (
        <div className="p-3.5 bg-[#FFF9F5] border border-[#E7D8CC] rounded-xl flex items-center justify-between animate-fadeIn">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] text-[#8B766C] font-bold uppercase tracking-wider font-mono">Selected Day</span>
            <span className="text-xs font-bold text-[#5A4A42]">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <span className="text-xs font-bold text-[#D98C6B] bg-[#D98C6B]/10 border border-[#D98C6B]/25 px-3 py-1 rounded-full font-display">
            {getLogCountForDate(new Date(selectedDate + 'T00:00:00'))} {getLogCountForDate(new Date(selectedDate + 'T00:00:00')) === 1 ? 'journal log' : 'journal logs'}
          </span>
        </div>
      )}
    </Card>
  );
};

export default JournalCalendar;
export { formatLocalDate };



