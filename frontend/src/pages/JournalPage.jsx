import React, { useState, useEffect, useMemo } from 'react';
import JournalForm from '../components/JournalForm.jsx';
import JournalList from '../components/JournalList.jsx';
import JournalAnalytics from '../components/JournalAnalytics.jsx';
import JournalCalendar from '../components/JournalCalendar.jsx';
import {
  getJournals,
  deleteJournal,
  togglePin,
  getJournalAnalytics
} from '../services/journalService.js';
import { BookOpen, BarChart3, Calendar as CalIcon, AlertCircle } from 'lucide-react';

const JournalPage = () => {
  const [activeTab, setActiveTab] = useState('journals');
  
  // List state
  const [journals, setJournals] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingList, setLoadingList] = useState(false);

  // Filter state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [moodTag, setMoodTag] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const [editEntry, setEditEntry] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Fetch journals list
  const fetchList = async (pageNum = 1, currentSearch = search, currentCategory = category, currentMood = moodTag) => {
    try {
      setLoadingList(true);
      setErrorMessage(null);
      const res = await getJournals({
        page: pageNum,
        limit,
        search: currentSearch,
        category: currentCategory,
        moodTag: currentMood
      });
      if (res?.success) {
        setJournals(res.data.journals);
        setTotalCount(res.data.totalCount);
        setPage(res.data.page);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to retrieve journal entries.');
    } finally {
      setLoadingList(false);
    }
  };

  // Fetch analytics/calendar data
  const fetchAnalyticsData = async () => {
    try {
      setLoadingAnalytics(true);
      setErrorMessage(null);
      const res = await getJournalAnalytics();
      if (res?.success) {
        setAnalyticsData(res.data);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to retrieve journal analytics.');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Trigger list fetch when page, category, or moodTag changes
  useEffect(() => {
    fetchList(page, search, category, moodTag);
  }, [page, category, moodTag]);

  // Load search with a small debounce delay
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchList(1, search, category, moodTag);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // Fetch analytics initially and keep updated
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const handleFormSubmitSuccess = () => {
    setEditEntry(null);
    fetchList(1, search, category, moodTag);
    fetchAnalyticsData();
  };

  const handleEditInit = (entry) => {
    setEditEntry(entry);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditEntry(null);
  };

  const handleDelete = async (id) => {
    try {
      setErrorMessage(null);
      const res = await deleteJournal(id);
      if (res?.success) {
        const newTotal = totalCount - 1;
        const totalPages = Math.ceil(newTotal / limit) || 1;
        const pageToFetch = page > totalPages ? totalPages : page;
        
        fetchList(pageToFetch, search, category, moodTag);
        if (editEntry && editEntry._id === id) {
          setEditEntry(null);
        }
        fetchAnalyticsData();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to delete journal entry.');
    }
  };

  const handlePinToggle = async (id) => {
    try {
      setErrorMessage(null);
      const res = await togglePin(id);
      if (res?.success) {
        fetchList(page, search, category, moodTag);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to toggle pin status.');
    }
  };

  const handleCalendarDateClick = (dateStr) => {
    setSelectedDate(dateStr);
    if (dateStr) {
      setActiveTab('journals');
      setSearch('');
      setCategory('');
      setMoodTag('');
    }
  };

  const handleClearDateFilter = () => {
    setSelectedDate(null);
  };

  // Filter journals list locally if calendar date filter is set
  const displayedJournals = selectedDate
    ? journals.filter((entry) => entry.createdAt.startsWith(selectedDate))
    : journals;

  // Stats Calculations
  const journalsThisMonth = useMemo(() => {
    if (!analyticsData?.heatmapData) return 0;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    return analyticsData.heatmapData.reduce((acc, curr) => {
      const d = new Date(curr.date);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        return acc + curr.count;
      }
      return acc;
    }, 0);
  }, [analyticsData]);

  const journalsThisWeek = useMemo(() => {
    if (!analyticsData?.heatmapData) return 0;
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return analyticsData.heatmapData.reduce((acc, curr) => {
      const d = new Date(curr.date);
      if (d >= oneWeekAgo) {
        return acc + curr.count;
      }
      return acc;
    }, 0);
  }, [analyticsData]);

  const mostCommonMoodInfo = useMemo(() => {
    if (!analyticsData?.moodDistribution?.length) {
      return { mood: 'None', pct: 0 };
    }
    let maxMood = 'None';
    let maxCount = 0;
    let totalMoods = 0;
    
    analyticsData.moodDistribution.forEach((m) => {
      totalMoods += m.value;
      if (m.value > maxCount) {
        maxCount = m.value;
        maxMood = m.name;
      }
    });
    
    const pct = totalMoods > 0 ? Math.round((maxCount / totalMoods) * 100) : 0;
    return { mood: maxMood, pct };
  }, [analyticsData]);

  const streakDays = useMemo(() => {
    if (!analyticsData?.heatmapData?.length) return 0;
    
    const datesLogged = new Set(
      analyticsData.heatmapData.filter(d => d.count > 0).map(d => d.date)
    );
    
    let streak = 0;
    const checkDate = new Date();
    
    const getLocalDateKey = (date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    while (true) {
      const checkStr = getLocalDateKey(checkDate);
      if (datesLogged.has(checkStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [analyticsData]);

  return (
    <div className="flex flex-col gap-6 animate-fadeIn mx-auto w-full" style={{ maxWidth: '1320px' }}>
      
      {/* Header layout matching reference image */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-3 border-b border-[#E7D8CC]/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F7D8C5]/45 flex items-center justify-center text-[#D98C6B] border border-[#F7D8C5]/60 flex-shrink-0 shadow-sm">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#D98C6B]" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 8C8 8 4 12 4 20C4 20 8 16 17 16C18.5 16 20 15 20 13C20 10 19 8 17 8Z" opacity="0.4" />
              <path d="M12 3C12 3 8 7 8 12C8 14 9.5 15 11 15C15 15 19 11 19 3C19 3 15 3 12 3Z" />
            </svg>
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="font-display font-extrabold text-3xl text-[#5A4A42] tracking-tight leading-tight">Personal Journal</h1>
            <p className="text-sm text-[#8B766C] font-semibold leading-relaxed opacity-90 max-w-[650px]">
              Chronicle your thoughts, reflect on daily experiences, and analyze emotional patterns.
            </p>
          </div>
        </div>

        {/* Tab Headers aligned on the right of the header */}
        <div className="flex gap-6 pb-0.5">
          <button
            onClick={() => setActiveTab('journals')}
            className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-all duration-200 ${
              activeTab === 'journals'
                ? 'border-[#D98C6B] text-[#D98C6B]'
                : 'border-transparent text-[#8B766C] hover:text-[#5A4A42]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Journals</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-all duration-200 ${
              activeTab === 'analytics'
                ? 'border-[#D98C6B] text-[#D98C6B]'
                : 'border-transparent text-[#8B766C] hover:text-[#5A4A42]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-all duration-200 ${
              activeTab === 'calendar'
                ? 'border-[#D98C6B] text-[#D98C6B]'
                : 'border-transparent text-[#8B766C] hover:text-[#5A4A42]'
            }`}
          >
            <CalIcon className="w-4 h-4" />
            <span>Calendar</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-[#E79A9A]/15 border border-[#E79A9A]/30 text-[#D88A8A] px-4 py-3 rounded-2xl flex items-center gap-3 text-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-[#E79A9A]" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Main Responsive Grid with 38% / 62% columns ratio on desktop */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Form: Takes 38% width on desktop */}
        <div className="w-full lg:w-[38%] flex-shrink-0">
          <JournalForm
            onSubmitSuccess={handleFormSubmitSuccess}
            editEntry={editEntry}
            onCancelEdit={handleCancelEdit}
          />
        </div>

        {/* Right Content Tabs: Takes 62% width on desktop */}
        <div className="w-full lg:w-[62%] flex flex-col gap-5">
          {/* Active Tab rendering */}
          <div>
            {activeTab === 'journals' && (
              <div className="flex flex-col gap-5">
                {selectedDate && (
                  <div className="bg-[#F7D8C5]/20 border border-[#F7D8C5]/50 px-4 py-3 rounded-2xl flex items-center justify-between animate-fadeIn mb-1">
                    <div className="flex items-center gap-2 text-xs text-[#D98C6B] font-bold">
                      <CalIcon className="w-4 h-4 text-[#D98C6B]" />
                      <span>Showing entries from {new Date(selectedDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <button
                      onClick={handleClearDateFilter}
                      className="text-xs font-bold text-[#8B766C] hover:text-[#5A4A42] transition-colors"
                    >
                      Clear Filter
                    </button>
                  </div>
                )}

                <JournalList
                  journals={displayedJournals}
                  page={page}
                  limit={limit}
                  totalCount={selectedDate ? displayedJournals.length : totalCount}
                  loading={loadingList}
                  search={search}
                  category={category}
                  moodTag={moodTag}
                  onSearchChange={setSearch}
                  onCategoryChange={setCategory}
                  onMoodChange={setMoodTag}
                  onPageChange={setPage}
                  onEdit={handleEditInit}
                  onDelete={handleDelete}
                  onPinToggle={handlePinToggle}
                />

                {/* Connected bottom dashboard statistics strip */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
                  {/* Total Entries */}
                  <div className="bg-white border border-[#E7D8CC] rounded-[20px] p-3.5 flex flex-col justify-between h-[96px] shadow-[0_2px_8px_rgba(90,74,66,0.015)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(90,74,66,0.03)]">
                    <div className="flex items-center gap-2 text-[10px] text-[#8B766C] font-extrabold uppercase tracking-wider select-none">
                      <div className="w-7 h-7 rounded-lg bg-[#F7D8C5]/35 flex items-center justify-center text-[#D98C6B] border border-[#F7D8C5]/50 flex-shrink-0">
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">Total Entries</span>
                    </div>
                    <div className="flex items-baseline gap-2 leading-none mt-1">
                      <span className="text-2xl font-extrabold text-[#5A4A42] font-display">{totalCount}</span>
                      <span className="text-[9px] text-[#B8C9A3] font-bold select-none">
                        ↑ +{journalsThisMonth}
                      </span>
                    </div>
                  </div>

                  {/* This Week */}
                  <div className="bg-white border border-[#E7D8CC] rounded-[20px] p-3.5 flex flex-col justify-between h-[96px] shadow-[0_2px_8px_rgba(90,74,66,0.015)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(90,74,66,0.03)]">
                    <div className="flex items-center gap-2 text-[10px] text-[#8B766C] font-extrabold uppercase tracking-wider select-none">
                      <div className="w-7 h-7 rounded-lg bg-[#CFC8E8]/35 flex items-center justify-center text-[#5A4A42] border border-[#CFC8E8]/50 flex-shrink-0">
                        <CalIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">This Week</span>
                    </div>
                    <div className="flex flex-col gap-0.5 mt-1 leading-none">
                      <span className="text-2xl font-extrabold text-[#5A4A42] font-display">{journalsThisWeek}</span>
                      <span className="text-[8px] text-[#8B766C]/70 font-bold select-none truncate">
                        {journalsThisWeek > 0 ? `+${journalsThisWeek} logs` : 'no logs'}
                      </span>
                    </div>
                  </div>

                  {/* Most Common Mood */}
                  <div className="bg-white border border-[#E7D8CC] rounded-[20px] p-3.5 flex flex-col justify-between h-[96px] shadow-[0_2px_8px_rgba(90,74,66,0.015)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(90,74,66,0.03)]">
                    <div className="flex items-center gap-2 text-[10px] text-[#8B766C] font-extrabold uppercase tracking-wider select-none">
                      <div className="w-7 h-7 rounded-lg bg-[#B8C9A3]/25 flex items-center justify-center text-[#5A9070] border border-[#B8C9A3]/50 flex-shrink-0">
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current stroke-2" fill="none">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                          <line x1="9" y1="9" x2="9.01" y2="9" />
                          <line x1="15" y1="9" x2="15.01" y2="9" />
                        </svg>
                      </div>
                      <span className="truncate">Common Mood</span>
                    </div>
                    <div className="flex items-baseline gap-1 mt-1 leading-none min-w-0">
                      <span className="text-[17px] font-extrabold text-[#5A4A42] font-display truncate max-w-[60px]">{mostCommonMoodInfo.mood}</span>
                      <span className="text-[8px] text-[#8B766C]/70 font-bold select-none truncate">{mostCommonMoodInfo.pct}%</span>
                    </div>
                  </div>

                  {/* Writing Streak */}
                  <div className="bg-white border border-[#E7D8CC] rounded-[20px] p-3.5 flex flex-col justify-between h-[96px] shadow-[0_2px_8px_rgba(90,74,66,0.015)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(90,74,66,0.03)]">
                    <div className="flex items-center gap-2 text-[10px] text-[#8B766C] font-extrabold uppercase tracking-wider select-none">
                      <div className="w-7 h-7 rounded-lg bg-[#E2834A]/10 flex items-center justify-center text-[#E2834A] border border-[#E2834A]/25 flex-shrink-0">
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current text-[#E2834A]">
                          <path d="M12 2c0 0-4 4.5-4 7.5C8 12 10 14 12 14s4-2 4-4.5C16 6.5 12 2 12 2z" />
                        </svg>
                      </div>
                      <span className="truncate">Streak</span>
                    </div>
                    <div className="flex flex-col gap-0.5 mt-1 leading-none">
                      <span className="text-2xl font-extrabold text-[#5A4A42] font-display">{streakDays} {streakDays === 1 ? 'day' : 'days'}</span>
                      <span className="text-[8px] text-[#8B766C]/70 font-bold select-none truncate">Keep it going!</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <JournalAnalytics
                analyticsData={analyticsData}
                loading={loadingAnalytics}
              />
            )}

            {activeTab === 'calendar' && (
              <JournalCalendar
                heatmapData={analyticsData?.heatmapData || []}
                onDateClick={handleCalendarDateClick}
                selectedDate={selectedDate}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalPage;
