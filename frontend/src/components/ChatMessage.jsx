import React from 'react';
import { User, Sparkles } from 'lucide-react';

/**
 * Custom lightweight markdown parser.
 * Renders Markdown-like formats into safe React nodes.
 */
export const renderMarkdown = (text) => {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let key = 0;

  let currentListItems = [];
  let currentListType = null; // 'ul' or 'ol'

  const parseInline = (lineText) => {
    // Split by bold patterns first (**bold**)
    const boldParts = lineText.split(/\*\*([\s\S]*?)\*\*/g);
    return boldParts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-black text-[#5A4A42]">{part}</strong>;
      }
      
      // Parse italic patterns inside non-bold text (*italic* or _italic_)
      const italicParts = part.split(/[\*_]([\s\S]*?)[\*_]/g);
      return italicParts.map((subPart, subIndex) => {
        if (subIndex % 2 === 1) {
          return <em key={subIndex} className="italic text-[#8B766C]">{subPart}</em>;
        }
        return subPart;
      });
    });
  };

  const flushList = () => {
    if (currentListItems.length > 0) {
      const listKey = `list-${key++}`;
      if (currentListType === 'ul') {
        elements.push(
          <ul key={listKey} className="list-disc pl-5 my-2 flex flex-col gap-1 text-[#725E54] leading-relaxed font-medium">
            {currentListItems}
          </ul>
        );
      } else {
        elements.push(
          <ol key={listKey} className="list-decimal pl-5 my-2 flex flex-col gap-1 text-[#725E54] leading-relaxed font-medium">
            {currentListItems}
          </ol>
        );
      }
      currentListItems = [];
      currentListType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // 1. Headings (e.g. ### Header or ## Header)
    if (trimmedLine.startsWith('#')) {
      flushList();
      const match = trimmedLine.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const headerText = match[2];
        const headerClass = level === 1 
          ? 'text-sm font-black text-[#5A4A42] mt-3 mb-1.5' 
          : level === 2 
          ? 'text-xs font-black text-[#5A4A42] mt-2 mb-1.5' 
          : 'text-[11px] font-black text-[#725E54] mt-2 mb-1';
        
        elements.push(
          <h4 key={key++} className={headerClass}>
            {parseInline(headerText)}
          </h4>
        );
        continue;
      }
    }

    // 2. Unordered lists (e.g. * Item or - Item)
    const bulletMatch = line.match(/^(\s*)[*\-]\s+(.*)$/);
    if (bulletMatch) {
      if (currentListType && currentListType !== 'ul') {
        flushList();
      }
      currentListType = 'ul';
      currentListItems.push(
        <li key={`li-${key++}`} className="text-xs text-[#725E54] ml-1 leading-relaxed">
          {parseInline(bulletMatch[2])}
        </li>
      );
      continue;
    }

    // 3. Ordered lists (e.g. 1. Item)
    const numberedMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);
    if (numberedMatch) {
      if (currentListType && currentListType !== 'ol') {
        flushList();
      }
      currentListType = 'ol';
      currentListItems.push(
        <li key={`li-${key++}`} className="text-xs text-[#725E54] ml-1 leading-relaxed">
          {parseInline(numberedMatch[2])}
        </li>
      );
      continue;
    }

    // 4. Empty line
    if (trimmedLine === '') {
      flushList();
      elements.push(<div key={key++} className="h-2.5" />);
      continue;
    }

    // 5. Normal paragraphs
    flushList();
    elements.push(
      <p key={key++} className="text-xs text-[#725E54] leading-relaxed font-medium mb-1.5">
        {parseInline(line)}
      </p>
    );
  }

  flushList();
  return <div className="flex flex-col">{elements}</div>;
};

const ChatMessage = ({ log }) => {
  const isUser = log.role === 'user';

  return (
    <div
      className={`flex gap-3 w-full animate-fadeIn ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[#CFC8E8]/20 border border-[#CFC8E8]/35 flex items-center justify-center text-[#5A4A42] shadow-sm flex-shrink-0">
          <Sparkles className="w-4 h-4 text-[#D98C6B]" />
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={`max-w-[80%] md:max-w-[70%] p-4 rounded-2xl border transition-all duration-200 shadow-sm ${
          isUser
            ? 'bg-[#F7D8C5]/50 text-[#5A4A42] border-[#F7D8C5] rounded-tr-none'
            : 'glass-panel text-[#725E54] border-[#E7D8CC] rounded-tl-none'
        }`}
      >
        {!isUser && (
          <span className="text-[9px] font-extrabold text-[#D98C6B] tracking-wider uppercase block mb-1 font-mono">
            AI Companion
          </span>
        )}
        
        {isUser ? (
          <p className="text-xs leading-relaxed font-bold text-[#5A4A42] whitespace-pre-wrap">
            {log.message}
          </p>
        ) : (
          renderMarkdown(log.message)
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-full border border-[#E7D8CC] bg-[#FFF9F5] flex items-center justify-center text-[#8B766C] shadow-sm flex-shrink-0">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
