import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, Smile } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center relative glow-effect px-6 py-20 animate-fadeIn">
      <div className="max-w-4xl text-center flex flex-col items-center gap-8">
        
        {/* Soothing Tagline Badge */}
        <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 text-xs font-semibold text-slate-400 tracking-wide shadow-sm border-[#222030]">
          <Sparkles className="w-4 h-4 text-brand-primary animate-pulse" />
          <span>THRYVE WELLNESS SYSTEM</span>
        </div>

        {/* Headline */}
        <h1 className="font-display font-extrabold text-5xl md:text-7xl tracking-tight leading-none text-gradient">
          Grow Through What <br />
          You Go Through.
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed font-medium">
          THRYVE is your secure, AI-powered mental wellness ecosystem. Track your daily emotions, 
          maintain private journals with detailed sentiment analysis, and find community support.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-center mt-2">
          {user ? (
            <Link
              to="/dashboard"
              className="brand-gradient px-8 py-4 rounded-full font-bold text-[#0A090F] shadow-lg shadow-indigo-500/10 hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="brand-gradient px-8 py-4 rounded-full font-bold text-[#0A090F] shadow-lg shadow-indigo-500/10 hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
              >
                Start Your Journey
              </Link>
              <Link
                to="/login"
                className="glass-panel px-8 py-4 rounded-full font-bold text-slate-200 hover:text-white hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-200"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Value props Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-16 text-left">
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-3 hover-premium">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Smile className="w-5 h-5" />
            </div>
            <h3 className="font-display font-semibold text-lg text-slate-200">Mood Analytics</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Log daily mood indices and observe emotional trends over time with clean visual charts.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-3 hover-premium">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-display font-semibold text-lg text-slate-200">AI Feedback</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Write secure journals and receive compassionate AI sentiment analysis and coping strategies.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-3 hover-premium">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-display font-semibold text-lg text-slate-200">Private & Secure</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Stateless JWT checks and HTTP-only cookies guarantee that your mental health data remains private.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
