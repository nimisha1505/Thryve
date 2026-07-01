import React from 'react';
import { Sparkles, TrendingUp, AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';
import Card from './Card.jsx';

const MoodForecastCard = ({ forecast = {}, loading }) => {
  if (loading) {
    return (
      <div className="glass-panel p-6 rounded-3xl border border-slate-200/5 animate-pulse h-80 flex flex-col justify-between">
        <div className="w-1/4 h-5 bg-slate-800 rounded"></div>
        <div className="h-10 bg-slate-800 rounded w-1/2"></div>
        <div className="flex flex-col gap-2">
          <div className="h-4 bg-slate-800 rounded w-full"></div>
          <div className="h-4 bg-slate-800 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  const {
    predictedMood = 7.0,
    riskLevel = 'Low',
    confidence = 70,
    factors = [],
  } = forecast;

  const getRiskStyles = (risk) => {
    if (risk === 'High') return 'bg-red-500/10 border-red-500/20 text-red-400';
    if (risk === 'Moderate') return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
  };

  const getRiskIcon = (risk) => {
    if (risk === 'High') return <AlertTriangle className="w-4 h-4 text-red-400" />;
    if (risk === 'Moderate') return <AlertCircle className="w-4 h-4 text-amber-400" />;
    return <TrendingUp className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <Card className="flex flex-col gap-5 relative overflow-hidden h-full border border-slate-200/5" hoverable={true}>
      <div className="absolute top-0 right-0 w-60 h-60 bg-brand-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand-primary" />
          <h3 className="font-display font-extrabold text-lg text-slate-200">Mood Forecast</h3>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold ${getRiskStyles(riskLevel)}`}>
          {getRiskIcon(riskLevel)}
          <span>{riskLevel} Risk Outlook</span>
        </div>
      </div>

      <div className="flex items-baseline gap-4 z-10 mt-1">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-555 font-bold uppercase tracking-wider font-mono">
            Predicted Mood
          </span>
          <span className="text-4xl font-extrabold text-slate-100 font-display">
            {predictedMood} <span className="text-base text-slate-500 font-bold">/ 10</span>
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-slate-555 font-bold uppercase tracking-wider font-mono">
            Confidence
          </span>
          <span className="text-sm font-extrabold text-slate-300 font-display">
            {confidence}% <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Rating</span>
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 z-10 flex-1">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Key Forecast Indicators</span>
        </div>

        {factors.length > 0 ? (
          <ul className="flex flex-col gap-2.5">
            {factors.map((factor, idx) => (
              <li key={idx} className="flex gap-2 items-start text-xs font-semibold text-slate-350 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full brand-gradient mt-1.5 flex-shrink-0 animate-pulse" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-500 font-medium italic leading-relaxed">
            Record mood logs or journal reflections over a few days to compute prediction variables.
          </p>
        )}
      </div>
    </Card>
  );
};

export default MoodForecastCard;
