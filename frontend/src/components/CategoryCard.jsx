import React from 'react';

const CategoryCard = ({ category, emoji, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-center gap-3 hover:-translate-y-1 text-left group ${
        isSelected
          ? 'bg-[#F7D8C5]/20 border-[#D98C6B]/30 text-[#D98C6B] shadow-sm'
          : 'bg-white border-[#E7D8CC] text-[#8B766C] hover:border-[#D98C6B]/30 hover:bg-[#FFF9F5]'
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all shadow-inner flex-shrink-0 ${
        isSelected ? 'bg-[#F7D8C5]/35' : 'bg-[#FFF9F5] border border-[#E7D8CC] group-hover:scale-105'
      }`}>
        <span>{emoji}</span>
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <h4 className={`font-display font-black text-xs leading-tight truncate ${
          isSelected ? 'text-[#D98C6B]' : 'text-[#5A4A42]'
        }`}>
          {category}
        </h4>
        <span className="text-[9px] text-[#8B766C] font-bold uppercase tracking-wider">
          Explore Hub
        </span>
      </div>
    </button>
  );
};

export default CategoryCard;
