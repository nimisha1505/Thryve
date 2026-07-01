import React from 'react';

const CommunityCommentCard = ({ comment }) => {
  const formatTimestamp = (isoStr) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-[#13121C]/50 border border-[#222030] p-3 rounded-xl flex flex-col gap-1.5 transition-all hover:bg-[#13121C]/80">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center font-bold text-[9px] text-brand-primary uppercase">
            {comment.anonymousName.split(' ').map(n => n[0]).join('')}
          </div>
          <span className="text-[11px] font-bold text-slate-200">
            {comment.anonymousName}
          </span>
        </div>
        <span className="text-[9px] text-slate-500 font-bold font-mono">
          {formatTimestamp(comment.createdAt)}
        </span>
      </div>
      <p className="text-xs text-slate-300 font-medium leading-relaxed pl-1.5">
        {comment.content}
      </p>
    </div>
  );
};

export default CommunityCommentCard;
