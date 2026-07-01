import React from 'react';
import { ShieldCheck, Heart, Sparkles, Smile, BookOpen, Activity } from 'lucide-react';
import Card from './Card.jsx';

const InsightCard = ({ score = 70, breakdown = {}, loading }) => {
  if (loading) {
    return (
      <div className="glass-panel p-6 rounded-3xl border border-slate-200/5 animate-pulse h-80 flex flex-col justify-between">
        <div className="w-1/3 h-5 bg-slate-800 rounded"></div>
        <div className="flex items-center gap-6">
          <div className="w-28 h-28 rounded-full bg-slate-800"></div>
          <div className="flex-1 flex flex-col gap-3">
            <div className="w-full h-3 bg-slate-800 rounded"></div>
            <div className="w-5/6 h-3 bg-slate-800 rounded"></div>
            <div className="w-2/3 h-3 bg-slate-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const getScoreRating = (val) => {
    if (val >= 85) return { text: 'Exceptional Wellbeing', color: 'text-emerald-400 border-emerald-500/20', bg: 'bg-emerald-500/10' };
    if (val >= 70) return { text: 'Balanced & Steady', color: 'text-brand-primary border-brand-primary/20', bg: 'bg-brand-primary/10' };
    if (val >= 50) return { text: 'Moderate Wellbeing', color: 'text-amber-400 border-amber-500/20', bg: 'bg-amber-500/10' };
    return { text: 'Needs Care & Reflection', color: 'text-rose-400 border-rose-500/20', bg: 'bg-rose-500/10' };
  };

  const rating = getScoreRating(score);

  return (
    <Card className="flex flex-col gap-6 relative overflow-hidden h-full border border-slate-200/5" hoverable={true}>
      <div className="absolute top-0 right-0 w-60 h-60 bg-brand-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-brand-primary fill-brand-primary/10" />
          <h3 className="font-display font-extrabold text-lg text-slate-200">Wellbeing Score</h3>
        </div>
        <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border ${rating.bg} ${rating.color}`}>
          {rating.text}
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8 z-10">
        {/* Progress Ring visualizer */}
        <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="52"
              className="stroke-slate-800"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="64"
              cy="64"
              r="52"
              className="stroke-brand-primary"
              strokeWidth="8.5"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 52}
              strokeDashoffset={2 * Math.PI * 52 * (1 - score / 100)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-slate-100 font-display">
              {score}
            </span>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
              Score
            </span>
          </div>
        </div>

        {/* Breakdown parameters */}
        <div className="flex-1 flex flex-col gap-3.5 w-full">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono px-0.5">
            Wellbeing Factor Breakdown
          </span>

          <div className="flex flex-col gap-2.5">
            {/* Mood Averages (40%) */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-slate-500" />
                  <span>Mood Baseline (40%)</span>
                </div>
                <span className="font-bold text-slate-200">
                  {breakdown.moodAverage?.points || 0} / 40 pts
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full brand-gradient rounded-full"
                  style={{ width: `${(breakdown.moodAverage?.score || 0)}%` }}
                ></div>
              </div>
            </div>

            {/* Stability index (20%) */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-slate-500" />
                  <span>Emotional Stability (20%)</span>
                </div>
                <span className="font-bold text-slate-200">
                  {breakdown.stability?.points || 0} / 20 pts
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full brand-gradient rounded-full"
                  style={{ width: `${(breakdown.stability?.score || 0)}%` }}
                ></div>
              </div>
            </div>

            {/* Journal activity count (15%) */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reflection Writing (15%)</span>
                </div>
                <span className="font-bold text-slate-200">
                  {breakdown.journalFrequency?.points || 0} / 15 pts
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full brand-gradient rounded-full"
                  style={{ width: `${(breakdown.journalFrequency?.score || 0)}%` }}
                ></div>
              </div>
            </div>

            {/* Mood trends (15%) */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-slate-500" />
                  <span>Weekly Direction (15%)</span>
                </div>
                <span className="font-bold text-slate-200">
                  {breakdown.moodTrend?.points || 0} / 15 pts
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full brand-gradient rounded-full"
                  style={{ width: `${(breakdown.moodTrend?.score || 0)}%` }}
                ></div>
              </div>
            </div>

            {/* Companion logs count (10%) */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                  <span>Companion Chat (10%)</span>
                </div>
                <span className="font-bold text-slate-200">
                  {breakdown.companionEngagement?.points || 0} / 10 pts
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full brand-gradient rounded-full"
                  style={{ width: `${(breakdown.companionEngagement?.score || 0)}%` }}
                ></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Card>
  );
};

export default InsightCard;
