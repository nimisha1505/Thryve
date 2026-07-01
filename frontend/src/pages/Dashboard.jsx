import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { getMoodStats, createMood, getMoods } from '../services/moodService.js';
import { getJournalStats } from '../services/journalService.js';
import { getInsightsSummary } from '../services/insightsService.js';
import { getHabits, toggleHabit } from '../services/habitService.js';
import { getFeed, reactPost } from '../services/communityService.js';
import { getResources } from '../services/resourceService.js';
import {
  Heart,
  Sparkles,
  Wind,
  Play,
  ArrowRight,
  ChevronRight,
  MessageSquare,
  Volume2,
  Smile,
  Calendar,
  Activity,
  Compass,
  Users
} from 'lucide-react';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import {
  MorningSunrise,
  Reading,
  Meditation,
  Leaves,
  Flowers,
  Journal,
  Breathing,
  Forest,
  Mountains,
  Moon,
  Community,
  Plant,
  Tea,
  Clouds,
  Rain
} from '../components/Illustrations.jsx';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [journalStats, setJournalStats] = useState(null);
  const [insightsSummary, setInsightsSummary] = useState(null);
  const [habits, setHabits] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [allMoodLogs, setAllMoodLogs] = useState([]);
  const [allResources, setAllResources] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Mood check-in form states
  const [moodLogging, setMoodLogging] = useState(false);
  const [loggedToday, setLoggedToday] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedScore, setSelectedScore] = useState(null);
  const [checkInNote, setCheckInNote] = useState('');

  // Gratitude state
  const [gratitudeText, setGratitudeText] = useState(() => {
    return localStorage.getItem(`thryve_gratitude_${new Date().toDateString()}`) || '';
  });
  const [gratitudeSaved, setGratitudeSaved] = useState(false);

  // Guided Breathing states
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState('idle'); // 'inhale' | 'exhale' | 'idle'
  const [breathTimer, setBreathTimer] = useState(60);
  const [breathText, setBreathText] = useState('Ready to slow down?');

  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const todayStr = getTodayStr();

  const fetchDashboardData = async (showSilently = false) => {
    try {
      if (!showSilently) setLoading(true);
      const [moodRes, journalRes, insightsRes, habitsRes, feedRes, allMoodsRes, resourcesRes] = await Promise.all([
        getMoodStats().catch(() => null),
        getJournalStats().catch(() => null),
        getInsightsSummary().catch(() => null),
        getHabits().catch(() => null),
        getFeed({ limit: 5 }).catch(() => null),
        getMoods(1, 100).catch(() => null),
        getResources().catch(() => null)
      ]);

      if (moodRes?.success) {
        setStats(moodRes.data);
        if (moodRes.data.latestLog) {
          const logDate = new Date(moodRes.data.latestLog.createdAt).toDateString();
          const todayDate = new Date().toDateString();
          if (logDate === todayDate) {
            setLoggedToday(true);
            setSelectedScore(moodRes.data.latestLog.moodScore);
          }
        }
      }
      if (journalRes?.success) {
        setJournalStats(journalRes.data);
      }
      if (insightsRes?.success) {
        setInsightsSummary(insightsRes.data);
      }
      if (habitsRes?.success) {
        setHabits(habitsRes.data.habits || []);
      }
      if (feedRes?.success && feedRes.data.posts?.length > 0) {
        setCommunityPosts(feedRes.data.posts.slice(0, 2));
      }
      if (allMoodsRes?.success) {
        setAllMoodLogs(allMoodsRes.data.moodLogs || []);
      }
      if (resourcesRes?.success) {
        setAllResources(resourcesRes.data.resources || []);
      }
    } catch (err) {
      console.error('Failed to load sanctuary dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleMoodCheckIn = async (e) => {
    if (e) e.preventDefault();
    if (!selectedScore) {
      setToastMessage('Please select a mood score.');
      return;
    }
    try {
      setMoodLogging(true);
      let tags = ['Sanctuary'];
      if (selectedScore >= 9) tags = ['Great', 'Hopeful'];
      else if (selectedScore >= 7) tags = ['Good', 'Calm'];
      else if (selectedScore >= 5) tags = ['Okay', 'Neutral'];
      else if (selectedScore >= 3) tags = ['Low', 'Tired'];
      else tags = ['Struggling', 'Anxious'];

      const res = await createMood({
        moodScore: selectedScore,
        moodTags: tags,
        notes: checkInNote || 'Logged from your sanctuary check-in'
      });

      if (res?.success) {
        setLoggedToday(true);
        setToastMessage('Check-in saved. Feel the peace around you.');
        setTimeout(() => setToastMessage(''), 4000);
        setCheckInNote('');
        fetchDashboardData(true);
      }
    } catch (err) {
      console.error('Failed to log mood check-in:', err);
    } finally {
      setMoodLogging(false);
    }
  };

  const handleGratitudeSave = () => {
    localStorage.setItem(`thryve_gratitude_${new Date().toDateString()}`, gratitudeText);
    setGratitudeSaved(true);
    setTimeout(() => setGratitudeSaved(false), 3000);
  };

  // Breathing break loop
  useEffect(() => {
    let interval = null;
    let phaseTimeout = null;

    if (isBreathing && breathTimer > 0) {
      interval = setInterval(() => {
        setBreathTimer((prev) => prev - 1);
      }, 1000);

      const triggerInhale = () => {
        if (!isBreathing) return;
        setBreathPhase('inhale');
        setBreathText('Breathe in slowly...');
        phaseTimeout = setTimeout(() => {
          triggerExhale();
        }, 4000);
      };

      const triggerExhale = () => {
        if (!isBreathing) return;
        setBreathPhase('exhale');
        setBreathText('Release and exhale...');
        phaseTimeout = setTimeout(() => {
          triggerInhale();
        }, 6000);
      };

      triggerInhale();
    } else if (breathTimer <= 0) {
      setIsBreathing(false);
      setBreathPhase('idle');
      setBreathText('Thank you for pausing. You did great.');
      setBreathTimer(60);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (phaseTimeout) clearTimeout(phaseTimeout);
    };
  }, [isBreathing, breathTimer]);

  const startBreathingSession = () => {
    setBreathTimer(60);
    setIsBreathing(true);
  };

  const stopBreathingSession = () => {
    setIsBreathing(false);
    setBreathPhase('idle');
    setBreathText('Paused breathing.');
    setBreathTimer(60);
  };

  const handleReaction = async (postId, type) => {
    try {
      const res = await reactPost(postId, type);
      if (res?.success) {
        setCommunityPosts(prev =>
          prev.map(p => p._id === postId ? { ...p, ...res.data } : p)
        );
      }
    } catch (err) {
      console.error('Failed to react to community post:', err);
    }
  };

  // Math Computations
  const completedTodayCount = habits.filter(h => h.completedDates?.includes(todayStr)).length;
  const totalHabitsCount = habits.length;
  const todayCompletionPct = totalHabitsCount > 0 ? Math.round((completedTodayCount / totalHabitsCount) * 100) : 0;
  const wellbeingVal = insightsSummary?.wellbeingScore || (stats?.average7d ? Math.round(stats.average7d * 10) : 70);
  const journalStreakVal = journalStats?.streak || stats?.streak || 0;

  // Build the past 28 days for the Mood Journey
  const past28Days = (() => {
    const arr = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      arr.push(d);
    }
    return arr;
  })();

  // Calculate consistency of logs in the past 28 days
  const checkedInDays = past28Days.filter(d => {
    const dStr = d.toLocaleDateString('en-CA');
    return allMoodLogs.some(log => new Date(log.loggedAt).toLocaleDateString('en-CA') === dStr);
  }).length;
  const consistencyPct = Math.round((checkedInDays / 28) * 100);

  // BADGE UNLOCK LOGIC
  const isSproutingStreak = journalStreakVal >= 7;
  const isBloomingStreak = journalStreakVal >= 30;
  const isMountainPeak = (stats?.totalCount || allMoodLogs.length) >= 100;

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getMoodEmoji = (score) => {
    if (score >= 9) return '😊';
    if (score >= 7) return '🙂';
    if (score >= 5) return '😐';
    if (score >= 3) return '😔';
    return '😣';
  };

  const getMoodLabel = (score) => {
    if (score >= 9) return 'Great';
    if (score >= 7) return 'Good';
    if (score >= 5) return 'Okay';
    if (score >= 3) return 'Low';
    return 'Struggling';
  };

  // Color mapping based on score for Mood Journey
  const getCellColor = (score) => {
    if (score === null || score === undefined) return 'bg-[#FFFDFB] border border-[#E7D8CC]';
    if (score >= 9) return 'bg-[#B8C9A3] text-white'; // Sage Green
    if (score >= 7) return 'bg-[#B8C9A3]/60 text-[#5A4A42]'; // Soft Sage Green
    if (score >= 5) return 'bg-[#F7D8C5] text-[#5A4A42]'; // Soft Peach
    if (score >= 3) return 'bg-[#D98C6B]/60 text-[#5A4A42]'; // Soft Terracotta
    return 'bg-[#D98C6B] text-white'; // Muted Terracotta
  };

  // Narrative mind weather description
  const getMindWeather = () => {
    const latest = stats?.latestLog;
    if (!latest) return "Clear skies ahead. Take a first step to log your mind's weather today.";
    const emoji = getMoodEmoji(latest.moodScore);
    const label = getMoodLabel(latest.moodScore);
    const completedText = totalHabitsCount > 0 
      ? (totalHabitsCount === completedTodayCount ? 'all habits complete! 🌿' : `${totalHabitsCount - completedTodayCount} habit${totalHabitsCount - completedTodayCount > 1 ? 's' : ''} left today 🌿`)
      : 'no habits set for today';
    return (
      <div className="space-y-1 text-xs md:text-sm text-[#725E54] font-medium leading-relaxed">
        <p className="flex items-center gap-1.5 justify-center md:justify-start">
          <span className="text-lg leading-none">{emoji}</span>
          <span>Today's weather for your mind is <strong>{label}</strong>.</span>
        </p>
        <p>You have journaled for <strong>{journalStreakVal} day{journalStreakVal !== 1 ? 's' : ''}</strong>. {completedText}.</p>
      </div>
    );
  };

  if (loading && !stats) {
    return (
      <div className="flex flex-col gap-8 py-6 max-w-5xl mx-auto px-4">
        <LoadingSkeleton className="h-64 rounded-[32px]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LoadingSkeleton className="h-44 rounded-[28px]" />
          <LoadingSkeleton className="h-44 rounded-[28px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-[1280px] mx-auto py-6 px-4 w-full animate-fadeIn text-[#5A4A42]">
      
      {/* 1. HERO - WELCOME & MIND WEATHER (Full Width) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#FEFCFA] via-[#FFF9F5] to-[#F7D8C5]/20 rounded-[28px] p-6 md:p-8 border border-[#E7D8CC] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
        {/* Custom SVG calming illustration */}
        <div className="w-full md:w-2/5 flex justify-center items-center order-first md:order-last">
          <MorningSunrise className="w-48 h-auto md:w-56 lg:w-64 max-h-[160px] md:max-h-[200px] object-contain drop-shadow-sm transition-transform duration-700 hover:scale-105 animate-scaleUp" />
        </div>

        {/* Content text */}
        <div className="flex flex-col gap-3 text-left w-full md:w-3/5">
          <span className="text-[#D98C6B] font-extrabold tracking-widest text-[10px] md:text-xs uppercase font-mono">Your Sanctuary</span>
          <h1 className="font-display font-black text-3xl md:text-4xl text-[#5A4A42] tracking-tight leading-tight">
            {getGreeting()}, {user?.name || 'Sasha'} 🌼
          </h1>
          <p className="text-xs md:text-sm text-[#725E54] font-medium leading-relaxed max-w-lg">
            Welcome back to your safe space. Take a slow breath, reflect, and check in with your mind today.
          </p>

          {/* Wellness Stat Pills */}
          <div className="flex flex-wrap gap-2 mt-1">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF9F5] border border-[#E7D8CC] text-[10px] font-bold text-[#8B766C] shadow-sm transition-transform hover:scale-105 cursor-default">
              <span className="text-xs">🔥</span>
              <span>{journalStreakVal}-day Streak</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF9F5] border border-[#E7D8CC] text-[10px] font-bold text-[#8B766C] shadow-sm transition-transform hover:scale-105 cursor-default">
              <span className="text-xs">🌱</span>
              <span>{wellbeingVal}% Wellbeing</span>
            </div>
            {totalHabitsCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF9F5] border border-[#E7D8CC] text-[10px] font-bold text-[#8B766C] shadow-sm transition-transform hover:scale-105 cursor-default">
                <span className="text-xs">🌿</span>
                <span>{completedTodayCount}/{totalHabitsCount} Habits</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF9F5] border border-[#E7D8CC] text-[10px] font-bold text-[#8B766C] shadow-sm transition-transform hover:scale-105 cursor-default">
              <span className="text-xs">📅</span>
              <span>{stats?.totalCount || allMoodLogs.length} Logs</span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-[#E7D8CC]/60 max-w-lg">
            {getMindWeather()}
          </div>
        </div>
      </div>

      {/* Main Responsive Grid Layout (2 columns: left is 2/3, right is 1/3 on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start w-full">
        
        {/* Left Column (Main active sanctuary content) */}
        <div className="lg:col-span-8 flex flex-col gap-6 md:gap-8 w-full">
          
          {/* 2. DAILY CHECK-IN CARD */}
          <div className="flex flex-col gap-3 text-left w-full">
            <div className="flex items-center gap-2 pl-1">
              <Smile className="w-5 h-5 text-[#D98C6B] stroke-[2]" />
              <h2 className="font-display font-black text-lg md:text-xl text-[#5A4A42] tracking-tight">Daily Sanctuary Check-in</h2>
            </div>
            
            <Card hoverable={false} className="p-5 md:p-6 border border-[#E7D8CC] bg-white rounded-[28px] shadow-sm flex flex-col gap-5 w-full">
              <div className="flex flex-col gap-3">
                <h3 className="font-display font-extrabold text-sm text-[#8B766C]">How are you feeling in this moment?</h3>
                <div className="grid grid-cols-5 gap-2 sm:gap-3 w-full max-w-md mt-1">
                  {[
                    { emoji: '😣', score: 1, label: 'Struggling', color: 'hover:bg-[#D98C6B]/15 hover:border-[#D98C6B]' },
                    { emoji: '😔', score: 3, label: 'Low', color: 'hover:bg-[#D98C6B]/10 hover:border-[#D98C6B]/60' },
                    { emoji: '😐', score: 5, label: 'Okay', color: 'hover:bg-[#F7D8C5]/30 hover:border-[#F7D8C5]' },
                    { emoji: '🙂', score: 7, label: 'Good', color: 'hover:bg-[#B8C9A3]/10 hover:border-[#B8C9A3]/60' },
                    { emoji: '😊', score: 9, label: 'Great', color: 'hover:bg-[#B8C9A3]/20 hover:border-[#B8C9A3]' }
                  ].map((mood) => {
                    const isActive = selectedScore === mood.score;
                    return (
                      <button
                        key={mood.score}
                        type="button"
                        onClick={() => setSelectedScore(mood.score)}
                        className={`w-full h-18 sm:h-20 rounded-[16px] sm:rounded-[20px] bg-[#FEFCFA] border border-[#E7D8CC] shadow-sm flex flex-col items-center justify-center gap-1 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md active:scale-[0.97] mood-chip-bounce ${mood.color} ${
                          isActive ? 'border-[#D98C6B] bg-[#FFF9F5] shadow-md ring-2 ring-[#D98C6B]/10' : ''
                        }`}
                      >
                        <span className={`text-xl sm:text-2xl transition-transform ${isActive ? 'animate-bounce-emoji' : 'group-hover:scale-110'}`}>
                          {mood.emoji}
                        </span>
                        <span className="text-[10px] font-extrabold tracking-wider text-[#8B766C] uppercase font-mono">
                          {mood.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes textarea & Quick actions */}
              <form onSubmit={handleMoodCheckIn} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="notes" className="font-display font-extrabold text-xs text-[#8B766C]">Reflections or feelings (optional)</label>
                  <textarea
                    id="notes"
                    rows="3"
                    value={checkInNote}
                    onChange={(e) => setCheckInNote(e.target.value)}
                    placeholder="Write down whatever anchors your mind right now..."
                    className="w-full p-4 rounded-2xl border border-[#E7D8CC] bg-[#FEFCFA] text-sm text-[#5A4A42] placeholder-[#8B766C]/50 focus:outline-none focus:ring-4 focus:ring-[#D98C6B]/10 focus:border-[#D98C6B] transition-all"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-1">
                  {/* Guided breathing mini trigger */}
                  <div className="flex items-center gap-2">
                    {!isBreathing ? (
                      <Button
                        variant="glass"
                        onClick={startBreathingSession}
                        className="bg-[#FEFCFA] hover:bg-[#FFF9F5] border border-[#E7D8CC] text-[#D98C6B] px-4 py-2 rounded-full text-xs font-bold btn-compress"
                      >
                        <Wind className="w-4 h-4 mr-1.5 stroke-[2]" />
                        <span>Mindful Pause (1 min)</span>
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#B8C9A3]/10 border border-[#B8C9A3]/20">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#B8C9A3] animate-ping"></span>
                        <span className="text-xs font-bold text-[#8B766C]">{breathText} ({breathTimer}s)</span>
                        <button onClick={stopBreathingSession} className="text-xs text-[#D98C6B] hover:underline font-bold ml-2">Stop</button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <Link to="/journal" className="text-xs font-bold text-[#8B766C] hover:text-[#5A4A42] hover:underline">
                      Go to Journal
                    </Link>
                    <Button
                      type="submit"
                      disabled={moodLogging}
                      className="w-full sm:w-auto bg-[#D98C6B] hover:bg-[#D98C6B]/90 text-white font-bold px-6 py-2.5 rounded-full text-xs btn-compress"
                    >
                      {moodLogging ? 'Saving...' : 'Log Sanctuary Check-in'}
                    </Button>
                  </div>
                </div>
              </form>

              {toastMessage && (
                <p className="text-xs font-bold text-[#D98C6B] animate-fadeIn flex items-center gap-1.5">
                  <span>🌸</span>
                  <span>{toastMessage}</span>
                </p>
              )}
            </Card>
          </div>

          {/* 3. MOOD JOURNEY (LEETCODE CALENDAR) */}
          <div className="flex flex-col gap-3 text-left w-full">
            <div className="flex items-center gap-2 pl-1">
              <Calendar className="w-5 h-5 text-[#D98C6B] stroke-[2]" />
              <h2 className="font-display font-black text-lg md:text-xl text-[#5A4A42] tracking-tight">Mood Journey</h2>
            </div>

            <Card hoverable={false} className="p-5 md:p-6 border border-[#E7D8CC] bg-white rounded-[28px] shadow-sm flex flex-col gap-6 w-full">
              
              {/* Streak details metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#FFF9F5] border border-[#E7D8CC] p-3 rounded-2xl text-center flex flex-col gap-0.5 shadow-inner">
                  <span className="text-[10px] font-black text-[#8B766C] uppercase tracking-wider font-mono">Current Streak</span>
                  <span className="text-xl font-black text-[#D98C6B] font-display">{journalStreakVal} Day{journalStreakVal !== 1 ? 's' : ''} 🔥</span>
                </div>
                <div className="bg-[#FFF9F5] border border-[#E7D8CC] p-3 rounded-2xl text-center flex flex-col gap-0.5 shadow-inner">
                  <span className="text-[10px] font-black text-[#8B766C] uppercase tracking-wider font-mono">Longest Streak</span>
                  <span className="text-xl font-black text-[#B8C9A3] font-display">{Math.max(journalStreakVal, stats?.streak || 0)} Day{Math.max(journalStreakVal, stats?.streak || 0) !== 1 ? 's' : ''} 🏆</span>
                </div>
                <div className="bg-[#FFF9F5] border border-[#E7D8CC] p-3 rounded-2xl text-center flex flex-col gap-0.5 shadow-inner">
                  <span className="text-[10px] font-black text-[#8B766C] uppercase tracking-wider font-mono">Total Mood Logs</span>
                  <span className="text-xl font-black text-[#5A4A42] font-display">{stats?.totalCount || allMoodLogs.length} Logs 📅</span>
                </div>
                <div className="bg-[#FFF9F5] border border-[#E7D8CC] p-3 rounded-2xl text-center flex flex-col gap-0.5 shadow-inner">
                  <span className="text-[10px] font-black text-[#8B766C] uppercase tracking-wider font-mono">Consistency (28d)</span>
                  <span className="text-xl font-black text-[#5A4A42] font-display">{consistencyPct}% 🌸</span>
                </div>
              </div>

              {/* LeetCode/GitHub contribution grid */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-bold text-[#8B766C] gap-2">
                  <span>Past 28 Days Journey</span>
                  <span className="flex items-center gap-1.5">
                    <span>Struggling</span>
                    <span className="w-3.5 h-3.5 rounded-sm bg-[#D98C6B]"></span>
                    <span className="w-3.5 h-3.5 rounded-sm bg-[#D98C6B]/60"></span>
                    <span className="w-3.5 h-3.5 rounded-sm bg-[#F7D8C5]"></span>
                    <span className="w-3.5 h-3.5 rounded-sm bg-[#B8C9A3]/60"></span>
                    <span className="w-3.5 h-3.5 rounded-sm bg-[#B8C9A3]"></span>
                    <span>Calm</span>
                  </span>
                </div>

                {/* Grid of rounded cells (7 columns represents weeks, preventing overflows) */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2 justify-items-center py-2 max-w-lg mx-auto md:mx-0">
                  {past28Days.map((date, idx) => {
                    const dStr = date.toLocaleDateString('en-CA');
                    const matchingLogs = allMoodLogs.filter(log => new Date(log.loggedAt).toLocaleDateString('en-CA') === dStr);
                    const hasLogged = matchingLogs.length > 0;
                    const score = hasLogged ? matchingLogs[0].moodScore : null;
                    const note = hasLogged ? matchingLogs[0].notes : '';

                    // Calculate completed habits on that day
                    const habitsDone = habits.filter(h => h.completedDates?.includes(dStr)).length;
                    const totalHabits = habits.length;

                    return (
                      <div key={idx} className="journey-tooltip">
                        <div
                          className={`w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 rounded-[6px] sm:rounded-[8px] journey-cell shadow-sm flex items-center justify-center text-xs sm:text-sm font-black cursor-pointer ${getCellColor(score)}`}
                        >
                          {hasLogged ? (
                            <span className="text-xs sm:text-base leading-none">{getMoodEmoji(score)}</span>
                          ) : (
                            ''
                          )}
                        </div>
                        
                        <span className="journey-tooltiptext">
                          <p className="font-bold">{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                          {hasLogged ? (
                            <div className="mt-1 space-y-0.5 text-left">
                              <p>Mood: {score}/10 ({getMoodLabel(score)})</p>
                              {note && <p className="italic text-[10px] truncate">"{note}"</p>}
                              {totalHabits > 0 && <p className="text-[#B8C9A3]">🌱 {habitsDone}/{totalHabits} Habits</p>}
                            </div>
                          ) : (
                            <p className="opacity-75 mt-0.5">No check-in</p>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Emotional Insights & Milestone Badges */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-[#E7D8CC]">
                {/* Insights text */}
                <div className="text-left space-y-1.5 flex-grow">
                  <span className="text-[10px] font-black text-[#D98C6B] uppercase tracking-wider font-mono">Sanctuary Reflection</span>
                  <p className="text-xs md:text-sm font-semibold text-[#725E54]">
                    "You've checked in on <strong>{consistencyPct}%</strong> of days in the past month. {journalStreakVal > 0 ? `Your ${journalStreakVal}-day streak is blooming beautifully!` : 'Pause for a quick daily check-in to build your reflection streak.'}"
                  </p>
                  <p className="text-[10px] md:text-xs text-[#8B766C] italic">
                    You tend to feel most grounded and happy when you check off your habits and write reflections.
                  </p>
                </div>

                {/* Milestones badges strip */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  {/* Badge 1: 7-day */}
                  <div
                    title="7-day Journal Streak Milestone"
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-300 ${
                      isSproutingStreak 
                        ? 'bg-[#B8C9A3]/10 border-[#B8C9A3] text-[#5A4A42]' 
                        : 'bg-[#FFFDFB] border-[#E7D8CC] text-[#8B766C] opacity-40'
                    }`}
                  >
                    <Plant className="w-8 h-8" />
                    <span className="text-[10px] font-extrabold tracking-wide uppercase font-mono">Sprouting 7d</span>
                  </div>

                  {/* Badge 2: 30-day */}
                  <div
                    title="30-day Journal Streak Milestone"
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-300 ${
                      isBloomingStreak 
                        ? 'bg-[#F7D8C5]/10 border-[#F7D8C5] text-[#5A4A42]' 
                        : 'bg-[#FFFDFB] border-[#E7D8CC] text-[#8B766C] opacity-40'
                    }`}
                  >
                    <Flowers className="w-8 h-8" />
                    <span className="text-[10px] font-extrabold tracking-wide uppercase font-mono">Blooming 30d</span>
                  </div>

                  {/* Badge 3: 100 logs */}
                  <div
                    title="100 Wellness Logs Milestone"
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-300 ${
                      isMountainPeak 
                        ? 'bg-[#D98C6B]/10 border-[#D98C6B] text-[#5A4A42]' 
                        : 'bg-[#FFFDFB] border-[#E7D8CC] text-[#8B766C] opacity-40'
                    }`}
                  >
                    <Mountains className="w-8 h-8" />
                    <span className="text-[10px] font-extrabold tracking-wide uppercase font-mono">Peak 100</span>
                  </div>
                </div>
              </div>

            </Card>
          </div>

        </div>

        {/* Right Column (Sidebar metrics and recommendations) */}
        <div className="lg:col-span-4 flex flex-col gap-6 md:gap-8 w-full">
          
          {/* 4. WELLNESS SNAPSHOT (TODAY'S PROGRESS) */}
          <div className="flex flex-col gap-3 text-left w-full">
            <div className="flex items-center gap-2 pl-1">
              <Activity className="w-5 h-5 text-[#D98C6B] stroke-[2]" />
              <h2 className="font-display font-black text-lg md:text-xl text-[#5A4A42] tracking-tight">Wellness Snapshot</h2>
            </div>
            
            <Card hoverable={false} className="p-5 md:p-6 border border-[#E7D8CC] bg-white rounded-[28px] shadow-sm flex flex-col gap-6 w-full">
              <div className="grid grid-cols-2 gap-4">
                
                {/* Gauge 1: Wellbeing */}
                <div className="p-3 border border-[#E7D8CC] bg-[#FEFCFA] rounded-2xl text-center flex flex-col items-center justify-between gap-3 hover-premium transition-all duration-300 min-h-[140px]">
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="32" cy="32" r="26" className="stroke-[#FFF9F5]" strokeWidth="4.5" fill="transparent" />
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        className="stroke-[#B8C9A3]"
                        strokeWidth="4.5"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 26}
                        strokeDashoffset={2 * Math.PI * 26 * (1 - wellbeingVal / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-[#5A4A42] font-display">
                      {wellbeingVal}%
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-[#8B766C] uppercase tracking-wider font-mono">Wellbeing</span>
                </div>

                {/* Gauge 2: Habits Completion */}
                <div className="p-3 border border-[#E7D8CC] bg-[#FEFCFA] rounded-2xl text-center flex flex-col items-center justify-between gap-3 hover-premium transition-all duration-300 min-h-[140px]">
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="32" cy="32" r="26" className="stroke-[#FFF9F5]" strokeWidth="4.5" fill="transparent" />
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        className="stroke-[#D98C6B]"
                        strokeWidth="4.5"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 26}
                        strokeDashoffset={2 * Math.PI * 26 * (1 - todayCompletionPct / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-[#5A4A42] font-display">
                      {todayCompletionPct}%
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-[#8B766C] uppercase tracking-wider font-mono">Habits Done</span>
                </div>

                {/* Gauge 3: Journal Streak */}
                <div className="p-3 border border-[#E7D8CC] bg-[#FEFCFA] rounded-2xl text-center flex flex-col items-center justify-between gap-3 hover-premium transition-all duration-300 min-h-[140px]">
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="32" cy="32" r="26" className="stroke-[#FFF9F5]" strokeWidth="4.5" fill="transparent" />
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        className="stroke-[#B8C9A3]"
                        strokeWidth="4.5"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 26}
                        strokeDashoffset={2 * Math.PI * 26 * (1 - Math.min(journalStreakVal, 7) / 7)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-[#5A4A42] font-display">
                      {journalStreakVal}d
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-[#8B766C] uppercase tracking-wider font-mono">Journal Streak</span>
                </div>

                {/* Gauge 4: Weekly Consistency */}
                <div className="p-3 border border-[#E7D8CC] bg-[#FEFCFA] rounded-2xl text-center flex flex-col items-center justify-between gap-3 hover-premium transition-all duration-300 min-h-[140px]">
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="32" cy="32" r="26" className="stroke-[#FFF9F5]" strokeWidth="4.5" fill="transparent" />
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        className="stroke-[#F7D8C5]"
                        strokeWidth="4.5"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 26}
                        strokeDashoffset={2 * Math.PI * 26 * (1 - consistencyPct / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-[#5A4A42] font-display">
                      {consistencyPct}%
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-[#8B766C] uppercase tracking-wider font-mono">Consistency</span>
                </div>

              </div>
            </Card>
          </div>

          {/* 6. AI INSIGHT */}
          <div className="flex flex-col gap-3 text-left w-full">
            <div className="flex items-center gap-2 pl-1">
              <Sparkles className="w-5 h-5 text-[#D98C6B] stroke-[2]" />
              <h2 className="font-display font-black text-lg md:text-xl text-[#5A4A42] tracking-tight">AI Insight</h2>
            </div>

            <Card hoverable={true} className="p-5 md:p-6 border border-[#E7D8CC] bg-gradient-to-br from-[#FEFCFA] to-[#FFF9F5] rounded-[28px] shadow-sm relative overflow-hidden flex flex-col gap-4 w-full justify-between min-h-[200px]">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#F7D8C5]/30 flex items-center justify-center text-[#5A4A42] text-lg font-display">
                  ✨
                </div>
                <span className="text-[10px] font-black text-[#D98C6B] uppercase tracking-widest font-mono">Calming Tip</span>
              </div>
              <p className="font-display font-bold text-xs md:text-sm text-[#5A4A42] leading-relaxed">
                {insightsSummary?.summary ? (
                  `"${insightsSummary.summary}"`
                ) : (
                  `"Every small act of self-care is a flower blooming on your path of recovery. Take 5 minutes to pause today."`
                )}
              </p>
              <p className="text-[10px] text-[#8B766C] italic">
                — Generated from your wellness patterns
              </p>
            </Card>
          </div>

        </div>

      </div>

      {/* 5. CONTINUE YOUR JOURNEY (Full Width) */}
      <div className="flex flex-col gap-3 text-left w-full">
        <div className="flex items-center gap-2 pl-1">
          <Compass className="w-5 h-5 text-[#D98C6B] stroke-[2]" />
          <h2 className="font-display font-black text-lg md:text-xl text-[#5A4A42] tracking-tight">Continue Your Journey</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Card A: Journal */}
          <Card hoverable={true} className="bg-gradient-to-br from-[#FEFCFA] to-[#FFF9F5] border border-[#E7D8CC] p-5 md:p-6 rounded-[28px] flex flex-col items-center text-center justify-between gap-4 w-full">
            <div className="w-24 h-24 flex items-center justify-center mt-2 flex-shrink-0">
              <Journal className="w-20 h-20" />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-display font-black text-lg text-[#5A4A42]">Reflection Journal</h4>
              <p className="text-xs text-[#725E54] leading-relaxed">
                Reflect on your emotions, write entries, and review past logs to track your mental patterns.
              </p>
            </div>
            <Link to="/journal" className="w-full">
              <Button variant="glass" className="w-full bg-[#FEFCFA] text-[#D98C6B] py-2 rounded-full text-xs btn-compress">
                <span>Write in Journal</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 stroke-[2]" />
              </Button>
            </Link>
          </Card>

          {/* Card B: Habits */}
          <Card hoverable={true} className="bg-gradient-to-br from-[#FEFCFA] to-[#FFF9F5] border border-[#E7D8CC] p-5 md:p-6 rounded-[28px] flex flex-col items-center text-center justify-between gap-4 w-full">
            <div className="w-24 h-24 flex items-center justify-center mt-2 flex-shrink-0">
              <Plant className="w-20 h-20" />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-display font-black text-lg text-[#5A4A42]">Habit Tracker</h4>
              <p className="text-xs text-[#725E54] leading-relaxed">
                Maintain daily self-care routines. Tick off small mindful actions that anchor your energy.
              </p>
            </div>
            <Link to="/habits" className="w-full">
              <Button variant="glass" className="w-full bg-[#FEFCFA] text-[#D98C6B] py-2 rounded-full text-xs btn-compress">
                <span>Complete Habits</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 stroke-[2]" />
              </Button>
            </Link>
          </Card>

          {/* Card C: AI Companion */}
          <Card hoverable={true} className="bg-gradient-to-br from-[#FEFCFA] to-[#FFF9F5] border border-[#E7D8CC] p-5 md:p-6 rounded-[28px] flex flex-col items-center text-center justify-between gap-4 w-full">
            <div className="w-24 h-24 flex items-center justify-center mt-2 flex-shrink-0">
              <Tea className="w-20 h-20" />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-display font-black text-lg text-[#5A4A42]">AI Chat Companion</h4>
              <p className="text-xs text-[#725E54] leading-relaxed">
                Connect with our empathetic assistant anytime. Explore gentle coping strategies without judgment.
              </p>
            </div>
            <Link to="/companion" className="w-full">
              <Button variant="glass" className="w-full bg-[#FEFCFA] text-[#D98C6B] py-2 rounded-full text-xs btn-compress">
                <span>Talk to Companion</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 stroke-[2]" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* Row 3 (Community Corner & Moments of Calm side-by-side on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-stretch w-full">
        
        {/* 7. COMMUNITY CORNER */}
        <div className="flex flex-col gap-3 text-left w-full h-full justify-between">
          <div className="flex items-center justify-between pl-1">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#D98C6B] stroke-[2]" />
              <h2 className="font-display font-black text-lg md:text-xl text-[#5A4A42] tracking-tight">Community Corner</h2>
            </div>
            <Link to="/community" className="text-xs font-black text-[#D98C6B] hover:underline flex items-center gap-1">
              <span>View Support Feed</span>
              <ChevronRight className="w-3 h-3 stroke-[2]" />
            </Link>
          </div>

          <div className="flex-1 flex flex-col">
            {communityPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
                {communityPosts.map((post) => (
                  <Card key={post._id} hoverable={true} className="p-5 border border-[#E7D8CC] bg-white rounded-[28px] shadow-sm flex flex-col justify-between gap-4 relative overflow-hidden text-left h-full">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-black text-[#8B766C]">
                        <span className="bg-[#FFF9F5] px-2.5 py-1 rounded-md border border-[#E7D8CC] font-mono tracking-wide">
                          {post.moodTag}
                        </span>
                        <span>Shared by {post.anonymousName}</span>
                      </div>

                      <div className="space-y-1.5 mt-3">
                        <h4 className="font-display font-black text-base text-[#5A4A42] leading-tight">
                          {post.title}
                        </h4>
                        <p className="text-xs text-[#725E54] leading-relaxed line-clamp-3">
                          {post.content}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-[#E7D8CC] mt-1 text-[#8B766C] text-[10px] font-bold">
                      <button
                        onClick={() => handleReaction(post._id, 'support')}
                        className="flex items-center gap-1 hover:text-[#D98C6B] transition-colors"
                      >
                        <span>❤️</span>
                        <span>{post.supportCount || 0} Support</span>
                      </button>
                      <button
                        onClick={() => handleReaction(post._id, 'hug')}
                        className="flex items-center gap-1 hover:text-[#D98C6B] transition-colors"
                      >
                        <span>🤗</span>
                        <span>{post.hugCount || 0} Hugs</span>
                      </button>
                      <button
                        onClick={() => handleReaction(post._id, 'stayStrong')}
                        className="flex items-center gap-1 hover:text-[#B8C9A3] transition-colors"
                      >
                        <span>💪</span>
                        <span>{post.stayStrongCount || 0} Strong</span>
                      </button>
                      <div className="flex items-center gap-1.5 ml-auto">
                        <MessageSquare className="w-3.5 h-3.5 stroke-[2]" />
                        <span>{post.commentsCount || 0}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card hoverable={false} className="p-5 md:p-6 border border-[#E7D8CC] bg-white rounded-[28px] text-center flex flex-col items-center justify-center gap-3 h-full">
                <div className="w-12 h-12 rounded-full bg-[#F7D8C5]/30 flex items-center justify-center text-[#D98C6B]">
                  <Users className="w-6 h-6 stroke-[2]" />
                </div>
                <p className="text-sm font-semibold text-[#725E54]">The sanctuary feed is quiet right now.</p>
                <p className="text-xs text-[#8B766C] max-w-sm">Share your own reflection or words of support on the community page to lift others on their path.</p>
                <Link to="/community" className="mt-2">
                  <Button variant="glass" className="bg-[#FEFCFA] text-[#D98C6B] px-4 py-2 rounded-full text-xs font-bold btn-compress">
                    Share a Reflection
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        </div>

        {/* 8. MOMENTS OF CALM */}
        <div className="flex flex-col gap-3 text-left w-full h-full justify-between">
          <div className="flex items-center justify-between pl-1">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-[#D98C6B] stroke-[2]" />
              <h2 className="font-display font-black text-lg md:text-xl text-[#5A4A42] tracking-tight">Moments of Calm</h2>
            </div>
            <Link to="/resources" className="text-xs font-black text-[#D98C6B] hover:underline flex items-center gap-1">
              <span>Explore All Sounds</span>
              <ChevronRight className="w-3 h-3 stroke-[2]" />
            </Link>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <Card hoverable={false} className="p-5 md:p-6 border border-[#E7D8CC] bg-white rounded-[28px] shadow-sm flex flex-col gap-5 w-full h-full justify-between">
              <div className="space-y-1">
                <h3 className="font-display font-extrabold text-sm text-[#8B766C]">Relaxing Sound Sanctuary</h3>
                <p className="text-xs text-[#725E54]">Immerse yourself in nature loops to ground your mind and soothe anxiety.</p>
              </div>
              
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2.5 sm:gap-3">
                {[
                  { name: 'Rain', ill: <Rain className="w-6 h-6 sm:w-8 sm:h-8" />, searchKey: 'rain' },
                  { name: 'Forest', ill: <Forest className="w-6 h-6 sm:w-8 sm:h-8" />, searchKey: 'forest' },
                  { name: 'Meditation', ill: <Meditation className="w-6 h-6 sm:w-8 sm:h-8" />, searchKey: 'meditation' },
                  { name: 'Breathing', ill: <Breathing className="w-6 h-6 sm:w-8 sm:h-8" />, searchKey: 'breathing' },
                  { name: 'Sleep', ill: <Moon className="w-6 h-6 sm:w-8 sm:h-8" />, searchKey: 'sleep' }
                ].map((item, index) => {
                  const matchedResource = allResources.find(r => 
                    r.thumbnail?.toLowerCase() === item.searchKey || 
                    r.title?.toLowerCase().includes(item.searchKey) ||
                    r.category?.toLowerCase().includes(item.searchKey)
                  );
                  
                  const targetLink = matchedResource ? `/resources/${matchedResource._id}` : '/resources';
                  
                  return (
                    <Link key={index} to={targetLink} className="w-full">
                      <div className="p-2 sm:p-3 border border-[#E7D8CC] bg-[#FEFCFA] rounded-xl sm:rounded-2xl text-center flex flex-col items-center gap-1.5 sm:gap-2 hover-premium transition-all duration-300 cursor-pointer h-full justify-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#FFF9F5] rounded-lg sm:rounded-xl border border-[#E7D8CC] flex items-center justify-center">
                          {item.ill}
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold text-[#5A4A42] truncate w-full">{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>

      </div>

      {/* 9. GRATITUDE REFLECTION (Full Width, Calm & Spacious) */}
      <div className="flex flex-col gap-3 text-left w-full">
        <div className="flex items-center gap-2 pl-1">
          <Heart className="w-5 h-5 text-[#D98C6B] stroke-[2]" />
          <h2 className="font-display font-black text-lg md:text-xl text-[#5A4A42] tracking-tight">Gratitude Reflection</h2>
        </div>

        <Card hoverable={false} className="p-5 md:p-6 border border-[#E7D8CC] bg-gradient-to-br from-[#FEFCFA] via-[#FFF9F5] to-[#F7D8C5]/10 rounded-[32px] shadow-sm flex flex-col gap-6 w-full">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-[#D98C6B] uppercase tracking-widest font-mono">Gratefulness</span>
            <h4 className="font-display font-black text-lg md:text-xl text-[#5A4A42] tracking-tight">What are you grateful for today?</h4>
            <p className="text-xs text-[#725E54]">Writing down small highlights trains your mind to discover peace in the everyday.</p>
          </div>

          <textarea
            rows="3"
            value={gratitudeText}
            onChange={(e) => setGratitudeText(e.target.value)}
            placeholder="A warm cup of coffee, a call with a friend, a gentle sunbeam..."
            className="w-full p-4 rounded-2xl border border-[#E7D8CC] bg-[#FEFCFA] text-sm text-[#5A4A42] placeholder-[#8B766C]/50 focus:outline-none focus:ring-4 focus:ring-[#D98C6B]/10 focus:border-[#D98C6B] transition-all"
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {gratitudeSaved ? (
              <p className="text-xs text-[#B8C9A3] font-bold animate-fadeIn">✓ Your reflection is anchored in your sanctuary.</p>
            ) : (
              <span className="text-[10px] text-[#8B766C] font-mono">No tracking charts, just deep presence.</span>
            )}
            <Button
              onClick={handleGratitudeSave}
              className="w-full sm:w-auto bg-[#B8C9A3] hover:bg-[#B8C9A3]/90 text-white font-bold px-6 py-2 rounded-full text-xs btn-compress"
            >
              Save Reflection
            </Button>
          </div>
        </Card>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-[#E7D8CC] pt-8 pb-4 text-center w-full">
        <p className="text-xs font-bold text-[#8B766C] leading-relaxed max-w-md mx-auto">
          Thryve is a safe, compassionate space for your mind. You are doing enough just by being here. 🌱
        </p>
      </footer>

    </div>
  );
};

export default Dashboard;
