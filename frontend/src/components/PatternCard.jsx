import React from 'react';
import { Eye, Clock, Smile, Tag, BookOpen, Activity } from 'lucide-react';
import Card from './Card.jsx';

const PatternCard = ({ patterns = {}, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-[#E7D8CC] rounded-[28px] h-80"></div>
        ))}
      </div>
    );
  }

  const {
    commonTags = [],
    commonCategories = [],
    timePeriods = [],
    peakTimePeriod = 'Morning',
    correlations = []
  } = patterns;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full animate-fadeIn">
      {/* 1. Time-Period Averages */}
      <Card className="flex flex-col gap-4 relative overflow-hidden" hoverable={true}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFF9F5] rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#D98C6B]" />
            <h3 className="font-display font-extrabold text-base text-[#5A4A42]">Time-of-Day Habits</h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D98C6B]/10 border border-[#D98C6B]/25 text-[#D98C6B]">
            Peak: {peakTimePeriod}
          </span>
        </div>

        <div className="flex flex-col gap-4 mt-2 z-10">
          {timePeriods.map((period, idx) => (
            <div key={idx} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-semibold text-[#8B766C]">
                <span>{period.period}</span>
                <span className="font-bold text-[#5A4A42]">
                  {period.avgScore} / 10 <span className="text-[10px] text-[#8B766C]/75 font-bold">({period.count} logs)</span>
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#F5ECE5] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#D98C6B] rounded-full"
                  style={{ width: `${period.avgScore * 10}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 2. Common Mood Tags Frequency */}
      <Card className="flex flex-col gap-4 relative overflow-hidden" hoverable={true}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFF9F5] rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-2 z-10">
          <Tag className="w-5 h-5 text-[#D98C6B]" />
          <h3 className="font-display font-extrabold text-base text-[#5A4A42]">Mood Tag Frequency</h3>
        </div>

        {commonTags.length > 0 ? (
          <div className="flex flex-wrap gap-2 mt-2 z-10">
            {commonTags.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFF9F5] border border-[#E7D8CC] hover:border-[#D98C6B]/30 hover:bg-[#FFF9F5]/70 transition-all duration-200"
              >
                <Smile className="w-3.5 h-3.5 text-[#8B766C]" />
                <span className="text-xs font-bold text-[#5A4A42]">{item.tag}</span>
                <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-[#FEFCFA] border border-[#E7D8CC] text-[#8B766C]">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#8B766C] font-medium italic mt-2 leading-relaxed z-10">
            Record mood logs to populate tag frequencies.
          </p>
        )}
      </Card>

      {/* 3. Category & Mood Correlations */}
      <Card className="flex flex-col gap-4 relative overflow-hidden" hoverable={true}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFF9F5] rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-2 z-10">
          <BookOpen className="w-5 h-5 text-[#D98C6B]" />
          <h3 className="font-display font-extrabold text-base text-[#5A4A42]">Reflections Correlation</h3>
        </div>

        {correlations.length > 0 ? (
          <div className="flex flex-col gap-3 mt-1 z-10">
            {correlations.map((corr, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-[#FFF9F5] border border-[#E7D8CC] hover:border-[#D98C6B]/30 transition-all hover:bg-[#FFF9F5]/80 rounded-2xl"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-[#5A4A42]">{corr.category}</span>
                  <span className="text-[9px] text-[#8B766C] font-bold uppercase tracking-wider font-mono">
                    Sample size: {corr.samples}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-[#B8C9A3]" />
                  <span className="text-xs font-extrabold text-[#5A4A42] font-display">
                    {corr.avgMoodScore} / 10
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#8B766C] font-medium italic mt-2 leading-relaxed z-10">
            Correlations will generate once mood logs and journals are recorded on matching calendar days.
          </p>
        )}
      </Card>
    </div>
  );
};

export default PatternCard;
