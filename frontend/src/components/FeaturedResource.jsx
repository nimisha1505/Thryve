import React from 'react';
import { Link } from 'react-router-dom';
import ResourceThumbnail from './ResourceThumbnail.jsx';
import { Sparkles, ArrowRight, Play, FileText } from 'lucide-react';
import Card from './Card.jsx';
import Button from './Button.jsx';

const FeaturedResource = ({ resource }) => {
  if (!resource) return null;

  return (
    <Card className="p-6 flex flex-col md:flex-row gap-6 items-center relative overflow-hidden shadow-2xl border border-[#E7D8CC]" hoverable={true}>
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFF9F5] rounded-full blur-3xl pointer-events-none"></div>

      {/* Thumbnail Block (Left) */}
      <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0 relative rounded-2xl overflow-hidden">
        <ResourceThumbnail name={resource.thumbnail} />
      </div>

      {/* Info Block (Right) */}
      <div className="flex flex-col gap-3.5 flex-grow text-center md:text-left z-10">
        <div className="flex flex-col gap-1.5 items-center md:items-start">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D98C6B]/10 border border-[#D98C6B]/20 text-[#D98C6B] text-[10px] font-bold uppercase tracking-wider font-mono">
            <Sparkles className="w-3 h-3 text-[#D98C6B] animate-pulse" />
            <span>Featured Guide</span>
          </div>
          <h2 className="font-display font-extrabold text-xl md:text-2xl text-[#5A4A42] mt-1">
            {resource.title}
          </h2>
          <span className="text-[10px] text-[#D98C6B] font-bold uppercase tracking-wider font-mono leading-none">
            {resource.category} • {resource.type}
          </span>
        </div>

        <p className="text-sm text-[#8B766C] font-medium leading-relaxed max-w-xl">
          {resource.description}
        </p>

        <Link to={`/resources/${resource._id}`} className="self-center md:self-start">
          <Button variant="primary" size="md" className="bg-[#D98C6B] text-white hover:bg-[#D98C6B]/90 shadow-md shadow-[#D98C6B]/15 hover:-translate-y-0.5 transition-all">
            {resource.type === 'audio' ? (
              <>
                <Play className="w-4 h-4 text-white mr-1.5" />
                <span>Listen Instantly</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 text-white mr-1.5" />
                <span>Read Article</span>
              </>
            )}
            <ArrowRight className="w-3.5 h-3.5 text-white ml-1.5" />
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default FeaturedResource;
