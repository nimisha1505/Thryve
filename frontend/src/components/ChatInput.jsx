import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

const ChatInput = ({ onSend, loading }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;
    onSend(message.trim());
    setMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const charLimit = 2000;
  const currentLength = message.length;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-1.5 relative w-full">
      <div className="relative flex items-center w-full">
        <textarea
          rows="1"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={charLimit}
          disabled={loading}
          placeholder="Describe how you are feeling or ask for coping tips..."
          className="w-full bg-[#FEFCFA] border border-[#E7D8CC] text-[#5A4A42] text-xs rounded-2xl pl-4 pr-12 py-3.5 focus:outline-none focus:border-[#D98C6B] focus:ring-2 focus:ring-[#D98C6B]/10 transition-all duration-200 placeholder-[#8B766C]/50 font-semibold resize-none leading-relaxed min-h-[50px] max-h-[140px]"
        />

        <button
          type="submit"
          disabled={!message.trim() || loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-[#D98C6B] text-white shadow-md shadow-[#D98C6B]/15 hover:bg-[#D98C6B]/90 disabled:opacity-40 disabled:shadow-none hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 flex items-center justify-center cursor-pointer"
          title="Send message"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5 text-white" />
          )}
        </button>
      </div>

      <div className="flex justify-between items-center px-2 text-[10px] text-slate-500 font-bold font-mono">
        <span>Press Enter to send, Shift + Enter for newline</span>
        <span className={currentLength >= charLimit - 100 ? 'text-red-500 animate-pulse' : ''}>
          {currentLength} / {charLimit}
        </span>
      </div>
    </form>
  );
};

export default ChatInput;
