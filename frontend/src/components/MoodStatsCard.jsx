import React from 'react';
import Card from './Card.jsx';

const MoodStatsCard = ({ title, value, icon: Icon, colorClass = 'text-[#D98C6B] bg-[#D98C6B]/10 border-[#D98C6B]/20', description }) => {
  return (
    <Card className="p-5 flex items-center justify-between gap-4 hover-lift" hoverable={false}>
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] text-[#8B766C] font-bold uppercase tracking-wider">{title}</span>
        <span className="text-2xl font-extrabold text-[#5A4A42] font-display leading-none">
          {value !== null && value !== undefined ? value : '—'}
        </span>
        {description && (
          <span className="text-xs text-[#8B766C] font-medium">{description}</span>
        )}
      </div>

      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border flex-shrink-0 transition-transform duration-[250ms] ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
    </Card>
  );
};

export default MoodStatsCard;
