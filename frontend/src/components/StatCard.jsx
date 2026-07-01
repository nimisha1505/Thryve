import React from 'react';
import Card from './Card.jsx';

const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend, // { type: 'increase' | 'decrease', value: '12%' }
  progress, // number 0-100 (for circular progress)
  progressColor = 'stroke-brand-primary',
  className = '',
}) => {
  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <div className="flex justify-between items-start">
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-[#7A6A5A] uppercase tracking-wide">
            {title}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#2D2115] tracking-tight">
              {value}
            </span>
            {trend && (
              <span
                className={`text-xs font-bold ${
                  trend.type === 'increase' ? 'text-[#B8C9A3]' : 'text-red-400'
                }`}
              >
                {trend.type === 'increase' ? '↑' : '↓'} {trend.value}
              </span>
            )}
          </div>
          {subtext && <p className="text-xs text-[#7A6A5A] font-semibold">{subtext}</p>}
        </div>

        {progress !== undefined ? (
          <div className="relative w-16 h-16">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="26"
                className="stroke-[#F5ECE5]"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r="26"
                className={progressColor}
                strokeWidth="4.5"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 26}
                strokeDashoffset={2 * Math.PI * 26 * (1 - progress / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-[#2D2115]">
              {Math.round(progress)}%
            </div>
          </div>
        ) : (
          Icon && (
            <div className="w-10 h-10 rounded-xl bg-[#FFF7F2] border border-[#E7D8CC] flex items-center justify-center text-[#7A6A5A]">
              <Icon className="w-5 h-5" />
            </div>
          )
        )}
      </div>
    </Card>
  );
};

export default StatCard;
