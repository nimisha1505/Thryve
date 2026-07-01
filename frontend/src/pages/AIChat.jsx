import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from '../components/ChatMessage.jsx';
import ChatInput from '../components/ChatInput.jsx';
import {
  sendMessage,
  getChatHistory,
  clearChatHistory,
} from '../services/chatService.js';
import { Sparkles, Trash2, HelpCircle, MessageSquare, AlertCircle } from 'lucide-react';
import SectionHeader from '../components/SectionHeader.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import { Meditation } from '../components/Illustrations.jsx';

const SUGGESTED_PROMPTS = [
  { text: "I'm feeling anxious about a deadline today.", label: "Manage Anxiety" },
  { text: "Can you guide me through a 2-minute breathing exercise?", label: "Breathing Exercise" },
  { text: "Help me reframe a negative thought I had.", label: "Reframe Thoughts" },
  { text: "Give me a daily self-compassion affirmation.", label: "Self-Affirmation" },
];

const AIChat = () => {
  const [history, setHistory] = useState([]);
  const [conversationTitle, setConversationTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const fetchHistory = async () => {
    try {
      setInitialLoading(true);
      setError(null);
      const res = await getChatHistory();
      if (res?.success) {
        setHistory(res.data.history || []);
        setConversationTitle(res.data.conversationTitle || '');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve conversation history.');
    } finally {
      setInitialLoading(false);
      setTimeout(() => scrollToBottom('instant'), 50);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [history, loading]);

  const handleSend = async (messageText) => {
    try {
      setLoading(true);
      setError(null);
      
      const tempUserMsg = {
        _id: `temp-user-${Date.now()}`,
        role: 'user',
        message: messageText,
        createdAt: new Date().toISOString()
      };
      setHistory(prev => [...prev, tempUserMsg]);

      const res = await sendMessage(messageText);
      if (res?.success) {
        const actualUserMsg = res.data.userMessage;
        const assistantMsg = res.data.assistantResponse;

        setHistory(prev => {
          const filtered = prev.filter(msg => msg._id !== tempUserMsg._id);
          return [...filtered, actualUserMsg, assistantMsg];
        });

        if (assistantMsg?.conversationTitle) {
          setConversationTitle(assistantMsg.conversationTitle);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to communicate with AI Companion.');
      setHistory(prev => prev.filter(msg => !msg._id.toString().startsWith('temp-user')));
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Are you sure you want to clear this entire conversation history? This cannot be undone.')) {
      return;
    }
    try {
      setError(null);
      const res = await clearChatHistory();
      if (res?.success) {
        setHistory([]);
        setConversationTitle('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to clear chat history.');
    }
  };

  const handleSuggestedPromptClick = (text) => {
    handleSend(text);
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-120px)] animate-fadeIn">
      {/* Title Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-display font-extrabold text-3xl text-gradient flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-brand-primary" />
            <span>AI Companion</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            Your empathetic companion for mental wellness guidelines and emotional guidance.
          </p>
        </div>

        {history.length > 0 && (
          <Button
            onClick={handleClear}
            variant="glass"
            size="sm"
            className="flex items-center gap-1.5 !text-red-400 !border-red-500/20 hover:!border-red-500/40 hover:!bg-red-500/5 cursor-pointer"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear Chat</span>
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm animate-fadeIn flex-shrink-0">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Main Chat Area */}
      <Card className="flex-1 p-6 flex flex-col justify-between overflow-hidden relative shadow-2xl h-full border border-[#E7D8CC]" hoverable={false}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFF9F5] rounded-full blur-3xl pointer-events-none"></div>

        {/* Message Feed view */}
        <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4 mb-4 scrollbar-thin">
          {initialLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#D98C6B] border-t-transparent animate-spin"></div>
              <span className="text-xs text-[#8B766C] font-bold font-mono">Loading companion...</span>
            </div>
          ) : history.length === 0 ? (
            /* Empty Chat State & Suggested Prompts */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-8 max-w-lg mx-auto">
              <div className="flex flex-col gap-2">
                <Meditation className="w-20 h-20 mx-auto" />
                <h3 className="font-display font-extrabold text-lg text-[#5A4A42] mt-2">
                  Empathetic Space
                </h3>
                <p className="text-xs text-[#725E54] leading-relaxed font-semibold">
                  Hello! I am your AI Companion. I am here to listen, offer mindful coping structures, and suggest wellness routines. Let me know what is on your mind.
                </p>
              </div>

              {/* Suggestions grid */}
              <div className="flex flex-col gap-3.5 w-full">
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#8B766C] font-bold uppercase tracking-wider">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Choose a suggested prompt to begin</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  {SUGGESTED_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestedPromptClick(prompt.text)}
                      className="p-4 bg-[#FFF9F5] border border-[#E7D8CC] rounded-2xl hover:border-[#D98C6B]/40 hover:bg-[#FFF9F5]/80 hover:-translate-y-0.5 transition-all text-left font-display cursor-pointer hover:shadow-sm"
                    >
                      <span className="text-[10px] font-bold text-[#D98C6B] uppercase tracking-wide block mb-0.5 font-mono">
                        {prompt.label}
                      </span>
                      <span className="text-xs text-[#5A4A42] font-bold leading-normal block">
                        "{prompt.text}"
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Message Bubbles list */
            <div className="flex flex-col gap-4">
              {conversationTitle && (
                <div className="flex items-center gap-1.5 self-center bg-[#D98C6B]/10 border border-[#D98C6B]/20 px-3.5 py-1.5 rounded-full text-[10px] text-[#D98C6B] font-bold uppercase tracking-wider font-mono animate-fadeIn mb-2 shadow-sm">
                  <Sparkles className="w-3 h-3 text-[#D98C6B] animate-pulse" />
                  <span>Topic: {conversationTitle}</span>
                </div>
              )}

              {history.map((log) => (
                <ChatMessage key={log._id} log={log} />
              ))}

              {/* Typing/Thinking Indicator */}
              {loading && (
                <div className="flex gap-3 w-full animate-pulse justify-start">
                  <div className="w-8 h-8 rounded-full bg-[#CFC8E8]/20 border border-[#CFC8E8]/35 flex items-center justify-center text-[#5A4A42] shadow-sm flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-[#D98C6B]" />
                  </div>
                  <div className="glass-panel p-4 rounded-2xl rounded-tl-none flex items-center gap-1.5 max-w-[200px] border-[#E7D8CC]">
                    <span className="text-[10px] font-bold text-[#8B766C] font-mono">Companion is writing</span>
                    <span className="flex gap-0.5 items-center mt-1">
                      <span className="w-1.5 h-1.5 bg-[#8B766C] rounded-full animate-bounce delay-100"></span>
                      <span className="w-1.5 h-1.5 bg-[#8B766C] rounded-full animate-bounce delay-200"></span>
                      <span className="w-1.5 h-1.5 bg-[#8B766C] rounded-full animate-bounce delay-300"></span>
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input container */}
        <div className="border-t border-[#E7D8CC] pt-4 flex-shrink-0">
          <ChatInput onSend={handleSend} loading={loading} />
        </div>
      </Card>
    </div>
  );
};

export default AIChat;
