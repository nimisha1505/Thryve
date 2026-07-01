import React from 'react';
import { Link } from 'react-router-dom';
import ResourceThumbnail from './ResourceThumbnail.jsx';
import { Play, FileText, Quote, Compass } from 'lucide-react';

const ResourceCard = ({ resource }) => {
  const TYPE_ICONS = {
    audio: Play,
    article: FileText,
    exercise: Compass,
    quote: Quote,
  };

  const IconComponent = TYPE_ICONS[resource.type] || Compass;

  const TYPE_COLOR_MAP = {
    audio: 'bg-[#CFC8E8]/20 border-[#CFC8E8]/35 text-[#5A4A42]',       // Lavender
    article: 'bg-[#B8C9A3]/20 border-[#B8C9A3]/35 text-[#5A4A42]',     // Sage
    exercise: 'bg-[#F7D8C5]/20 border-[#F7D8C5]/35 text-[#5A4A42]',    // Peach
    quote: 'bg-[#D98C6B]/15 border-[#D98C6B]/30 text-[#D98C6B]',       // Terracotta
  };

  const badgeColor = TYPE_COLOR_MAP[resource.type] || 'bg-[#FFF9F5] border-[#E7D8CC] text-[#8B766C]';

  return (
    <Link
      to={`/resources/${resource._id}`}
      className="bg-white p-4.5 rounded-[28px] border border-[#E7D8CC] flex flex-col gap-3.5 hover:-translate-y-1 transition-all duration-250 group hover:shadow-md hover:border-[#D98C6B]/20"
    >
      {/* Thumbnail Block */}
      <div className="w-full relative rounded-2xl overflow-hidden">
        <ResourceThumbnail name={resource.thumbnail} />
        {/* Resource Type Floater tag */}
        <div className={`absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider font-mono shadow-sm ${badgeColor}`}>
          <IconComponent className="w-3.5 h-3.5" />
          <span>{resource.type}</span>
        </div>
      </div>

      {/* Info Block */}
      <div className="flex flex-col gap-1.5 flex-grow">
        <span className="text-[10px] text-[#8B766C] font-bold uppercase tracking-widest leading-none">
          {resource.category}
        </span>
        <h4 className="font-display font-extrabold text-sm text-[#5A4A42] line-clamp-1 group-hover:text-[#D98C6B] transition-colors">
          {resource.title}
        </h4>
        <p className="text-xs text-[#8B766C] font-medium leading-relaxed line-clamp-2">
          {resource.description}
        </p>
      </div>

      {/* Action Footer */}
      <div className="border-t border-[#E7D8CC] pt-3 flex justify-between items-center text-[10px] font-bold text-[#D98C6B] group-hover:text-[#D98C6B]/80 transition-colors font-mono">
        <span>ACCESS INSTANTLY</span>
        <span className="group-hover:translate-x-0.5 transition-transform">→</span>
      </div>
    </Link>
  );
};

export default ResourceCard;
