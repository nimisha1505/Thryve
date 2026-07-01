import React, { useState, useEffect } from 'react';
import HabitForm from '../components/HabitForm.jsx';
import HabitCard from '../components/HabitCard.jsx';
import HabitCalendar from '../components/HabitCalendar.jsx';
import HabitAnalytics from '../components/HabitAnalytics.jsx';
import { getHabits, deleteHabit } from '../services/habitService.js';
import { Calendar, BarChart3, AlertCircle, Loader2 } from 'lucide-react';
import SectionHeader from '../components/SectionHeader.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import EmptyState from '../components/EmptyState.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';

const HabitTracker = () => {
  const [activeTab, setActiveTab] = useState('logs');
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editHabit, setEditHabit] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchHabitList = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await getHabits();
      if (res?.success) {
        setHabits(res.data.habits || []);
      }
    } catch (err) {
      console.error('Failed to fetch habits list:', err);
      setErrorMessage('Failed to retrieve habits checklist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabitList();
  }, []);

  const handleFormSubmitSuccess = () => {
    setEditHabit(null);
    fetchHabitList();
  };

  const handleEditInit = (habit) => {
    setEditHabit(habit);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditHabit(null);
  };

  const handleDeleteHabit = async (id) => {
    if (!window.confirm('Are you sure you want to delete this habit? All streaks and history will be lost.')) {
      return;
    }

    try {
      setErrorMessage(null);
      const res = await deleteHabit(id);
      if (res?.success) {
        fetchHabitList();
        if (editHabit && editHabit._id === id) {
          setEditHabit(null);
        }
      }
    } catch (err) {
      console.error('Failed to delete habit:', err);
      setErrorMessage('Failed to delete habit. Please try again.');
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Header */}
      <SectionHeader
        title="Habit & Goal Tracker"
        description="Build habits, establish daily check-in streaks, and track overall progress metrics."
      />

      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex border-b border-[#E7D8CC] gap-6">
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-all duration-150 ${
            activeTab === 'logs'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-slate-500 hover:text-slate-350'
          }`}
        >
          <span>Daily Goals Checklist</span>
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-all duration-150 ${
            activeTab === 'analytics'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-slate-500 hover:text-slate-350'
          }`}
        >
          <BarChart3 className="w-4.5 h-4.5" />
          <span>Analytics & Correlations</span>
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-all duration-150 ${
            activeTab === 'calendar'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-slate-500 hover:text-slate-350'
          }`}
        >
          <Calendar className="w-4.5 h-4.5" />
          <span>Heatmap Grid</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="mt-2">
        {activeTab === 'logs' ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* Left Column: Form */}
            <div className="lg:col-span-2">
              <HabitForm
                onSubmitSuccess={handleFormSubmitSuccess}
                editEntry={editHabit}
                onCancelEdit={handleCancelEdit}
              />
            </div>

            {/* Right Column: Grid List */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-display font-bold text-base text-slate-200">
                  Active Habits ({habits.length})
                </h3>
              </div>

              {loading && habits.length === 0 ? (
                <LoadingSkeleton variant="card" count={2} />
              ) : habits.length === 0 ? (
                <EmptyState
                  title="No Habits Tracked"
                  description="You are not tracking any active habits yet. Use the form on the left to add a custom habit or adopt recommended patterns."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {habits.map((habit) => (
                    <HabitCard
                      key={habit._id}
                      habit={habit}
                      onEdit={handleEditInit}
                      onDelete={handleDeleteHabit}
                      onToggleSuccess={fetchHabitList}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'analytics' ? (
          <HabitAnalytics habits={habits} onSuggestionsAdopted={fetchHabitList} />
        ) : (
          <HabitCalendar habits={habits} />
        )}
      </div>
    </div>
  );
};

export default HabitTracker;
