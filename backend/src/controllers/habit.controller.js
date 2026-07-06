import Habit from '../models/habit.model.js';
import Mood from '../models/mood.model.js';
import Journal from '../models/journal.model.js';
import mongoose from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Helper to format date as YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Recalculates streak values for a habit based on completedDates array
const recalculateStreaks = (completedDates) => {
  if (!completedDates || completedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Remove duplicates and sort descending (YYYY-MM-DD sorts lexicographically descending)
  const uniqueDates = Array.from(new Set(completedDates)).sort().reverse();

  // 1. Calculate Current Streak
  let currentStreak = 0;

  // Local helper to format check dates
  const formatCheck = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = formatCheck(new Date());
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatCheck(yesterday);

  const hasCompletedToday = uniqueDates.includes(todayStr);
  const hasCompletedYesterday = uniqueDates.includes(yesterdayStr);

  if (hasCompletedToday || hasCompletedYesterday) {
    currentStreak = 1;
    let checkDate = new Date(hasCompletedToday ? todayStr : yesterdayStr);

    while (true) {
      checkDate.setDate(checkDate.getDate() - 1);
      const checkDateStr = formatCheck(checkDate);

      if (uniqueDates.includes(checkDateStr)) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // 2. Calculate Longest Streak (ascending search)
  const ascDates = [...uniqueDates].reverse();
  let longestStreak = 0;
  let runningStreak = 0;
  let prevDate = null;

  for (let i = 0; i < ascDates.length; i++) {
    const currDateStr = ascDates[i];
    const currDate = new Date(currDateStr);

    if (prevDate === null) {
      runningStreak = 1;
    } else {
      const diffTime = currDate - prevDate;
      const diffDays = Math.round(diffTime / (1000 * 60 * 65 * 24)); // handling timezone shifts safely

      if (diffDays === 1) {
        runningStreak++;
      } else if (diffDays > 1) {
        if (runningStreak > longestStreak) {
          longestStreak = runningStreak;
        }
        runningStreak = 1;
      }
    }
    prevDate = currDate;
  }

  if (runningStreak > longestStreak) {
    longestStreak = runningStreak;
  }

  return { currentStreak, longestStreak };
};

/**
 * Create a new habit
 */
export const createHabit = asyncHandler(async (req, res) => {
  const { name, description, frequency, customDetails } = req.body;
  const userId = req.user.userId;

  const habitExists = await Habit.findOne({ userId, name, isArchived: false });
  if (habitExists) {
    throw new ApiError(400, 'A habit with this name already exists.');
  }

  const habit = new Habit({
    userId,
    name,
    description,
    frequency,
    customDetails,
  });

  await habit.save();

  return res.status(201).json(
    new ApiResponse(201, { habit }, 'Habit created successfully.')
  );
});

/**
 * Get active habits
 */
export const getHabits = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const habits = await Habit.find({ userId, isArchived: false }).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, { habits }, 'Habits retrieved successfully.')
  );
});

/**
 * Get habit by ID
 */
export const getHabitById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid Habit ID.');
  }

  const habit = await Habit.findById(id);
  if (!habit) {
    throw new ApiError(404, 'Habit not found.');
  }

  if (habit.userId.toString() !== userId) {
    throw new ApiError(403, 'Unauthorized access to this habit.');
  }

  return res.status(200).json(
    new ApiResponse(200, { habit }, 'Habit retrieved successfully.')
  );
});

/**
 * Update habit details
 */
export const updateHabit = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, frequency, customDetails, isArchived } = req.body;
  const userId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid Habit ID.');
  }

  const habit = await Habit.findById(id);
  if (!habit) {
    throw new ApiError(404, 'Habit not found.');
  }

  if (habit.userId.toString() !== userId) {
    throw new ApiError(403, 'Unauthorized access to this habit.');
  }

  if (name !== undefined) habit.name = name;
  if (description !== undefined) habit.description = description;
  if (frequency !== undefined) habit.frequency = frequency;
  if (customDetails !== undefined) habit.customDetails = customDetails;
  if (isArchived !== undefined) habit.isArchived = isArchived;

  await habit.save();

  return res.status(200).json(
    new ApiResponse(200, { habit }, 'Habit updated successfully.')
  );
});

/**
 * Delete habit (hard delete)
 */
export const deleteHabit = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid Habit ID.');
  }

  const habit = await Habit.findById(id);
  if (!habit) {
    throw new ApiError(404, 'Habit not found.');
  }

  if (habit.userId.toString() !== userId) {
    throw new ApiError(403, 'Unauthorized access to this habit.');
  }

  await Habit.deleteOne({ _id: id });

  return res.status(200).json(
    new ApiResponse(200, null, 'Habit deleted successfully.')
  );
});

/**
 * Toggle completion of a habit for a date
 */
export const toggleHabitCompletion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { date } = req.body; // Expecting YYYY-MM-DD
  const userId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid Habit ID.');
  }

  const habit = await Habit.findById(id);
  if (!habit) {
    throw new ApiError(404, 'Habit not found.');
  }

  if (habit.userId.toString() !== userId) {
    throw new ApiError(403, 'Unauthorized access to this habit.');
  }

  const targetDateStr = date || formatDate(new Date());

  const index = habit.completedDates.indexOf(targetDateStr);
  if (index > -1) {
    // Remove completion
    habit.completedDates.splice(index, 1);
  } else {
    // Add completion
    habit.completedDates.push(targetDateStr);
  }

  // Update streaks
  const { currentStreak, longestStreak } = recalculateStreaks(habit.completedDates);
  habit.currentStreak = currentStreak;
  habit.longestStreak = longestStreak;

  await habit.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { habit, toggledDate: targetDateStr, isCompleted: index === -1 },
      'Habit completion toggled successfully.'
    )
  );
});

/**
 * Get habit analytics
 */
export const getHabitAnalytics = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.userId);
  
  const habits = await Habit.find({ userId, isArchived: false });
  if (habits.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, {
        completionRate: 0,
        totalCompletions: 0,
        habitsStats: [],
        weekdayStats: { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0 }
      }, 'No habits found for analytics.')
    );
  }

  let totalCompletions = 0;
  const habitsStats = [];
  const weekdayCounts = {
    Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0
  };

  const DAYS_MAP = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  habits.forEach(habit => {
    const completions = habit.completedDates.length;
    totalCompletions += completions;

    // Calculate completion rate based on habit age or a default 30-day window
    const createdDate = new Date(habit.createdAt);
    const now = new Date();
    const ageInDays = Math.max(1, Math.round((now - createdDate) / (1000 * 60 * 60 * 24)));
    const completionRate = Math.min(100, Math.round((completions / ageInDays) * 100));

    habitsStats.push({
      _id: habit._id,
      name: habit.name,
      frequency: habit.frequency,
      completions,
      currentStreak: habit.currentStreak,
      longestStreak: habit.longestStreak,
      completionRate
    });

    // Populate weekday stats
    habit.completedDates.forEach(dateStr => {
      const d = new Date(dateStr);
      const dayName = DAYS_MAP[d.getDay()];
      if (dayName) {
        weekdayCounts[dayName]++;
      }
    });
  });

  // Calculate overall completion rate: completions per active habit day (capped at 30 days max window)
  const overallCompletions = totalCompletions;
  const overallPossible = habits.length * 30; // 30-day index baseline
  const overallCompletionRate = overallPossible > 0 ? Math.min(100, Math.round((overallCompletions / overallPossible) * 100)) : 0;

  return res.status(200).json(
    new ApiResponse(200, {
      completionRate: overallCompletionRate,
      totalCompletions: overallCompletions,
      habitsStats,
      weekdayStats: weekdayCounts
    }, 'Habit analytics retrieved successfully.')
  );
});

/**
 * Mood-Habit Correlation Analytics
 */
export const getHabitMoodCorrelation = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.userId);

  // Fetch unarchived habits and all mood logs
  const [habits, moodLogs] = await Promise.all([
    Habit.find({ userId, isArchived: false }),
    Mood.find({ userId }).sort({ loggedAt: 1 })
  ]);

  if (habits.length === 0 || moodLogs.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, {
        overallCorrelation: { highHabitAvgMood: 7.0, lowHabitAvgMood: 7.0, difference: 0 },
        habitCorrelations: []
      }, 'Insufficient habits or mood logs for correlation.')
    );
  }

  // Group mood logs by date (YYYY-MM-DD)
  const moodsByDate = {};
  moodLogs.forEach(log => {
    const dStr = formatDate(log.loggedAt);
    if (!moodsByDate[dStr]) moodsByDate[dStr] = [];
    moodsByDate[dStr].push(log.moodScore);
  });

  const moodAveragesByDate = {};
  Object.keys(moodsByDate).forEach(dateStr => {
    const scores = moodsByDate[dateStr];
    moodAveragesByDate[dateStr] = scores.reduce((a, b) => a + b, 0) / scores.length;
  });

  // Calculate correlations per habit
  const habitCorrelations = habits.map(habit => {
    const completedDatesSet = new Set(habit.completedDates);
    const completedDaysMoods = [];
    const uncompletedDaysMoods = [];

    // Evaluate for each calendar date we have a mood log
    Object.keys(moodAveragesByDate).forEach(dateStr => {
      const avgMood = moodAveragesByDate[dateStr];
      if (completedDatesSet.has(dateStr)) {
        completedDaysMoods.push(avgMood);
      } else {
        uncompletedDaysMoods.push(avgMood);
      }
    });

    const completedAvg = completedDaysMoods.length > 0
      ? completedDaysMoods.reduce((a, b) => a + b, 0) / completedDaysMoods.length
      : null;

    const uncompletedAvg = uncompletedDaysMoods.length > 0
      ? uncompletedDaysMoods.reduce((a, b) => a + b, 0) / uncompletedDaysMoods.length
      : null;

    const difference = (completedAvg !== null && uncompletedAvg !== null)
      ? completedAvg - uncompletedAvg
      : 0;

    let correlationText = 'Neutral';
    if (difference > 0.5) correlationText = 'Positive';
    else if (difference < -0.5) correlationText = 'Negative';

    return {
      habitId: habit._id,
      name: habit.name,
      completedDaysCount: completedDaysMoods.length,
      uncompletedDaysCount: uncompletedDaysMoods.length,
      completedDaysAvgMood: completedAvg ? parseFloat(completedAvg.toFixed(1)) : null,
      uncompletedDaysAvgMood: uncompletedAvg ? parseFloat(uncompletedAvg.toFixed(1)) : null,
      difference: parseFloat(difference.toFixed(1)),
      correlation: correlationText
    };
  });

  // Calculate overall day correlation: High Habit Completion days (>= 50% active habits) vs Low (< 50%)
  const highHabitMoods = [];
  const lowHabitMoods = [];

  Object.keys(moodAveragesByDate).forEach(dateStr => {
    const avgMood = moodAveragesByDate[dateStr];
    // Count how many habits were completed on this date
    let completedCount = 0;
    habits.forEach(h => {
      if (h.completedDates.includes(dateStr)) {
        completedCount++;
      }
    });

    const completionPct = (completedCount / habits.length) * 100;
    if (completionPct >= 50) {
      highHabitMoods.push(avgMood);
    } else {
      lowHabitMoods.push(avgMood);
    }
  });

  const highAvg = highHabitMoods.length > 0 ? highHabitMoods.reduce((a, b) => a + b, 0) / highHabitMoods.length : 7.0;
  const lowAvg = lowHabitMoods.length > 0 ? lowHabitMoods.reduce((a, b) => a + b, 0) / lowHabitMoods.length : 7.0;

  return res.status(200).json(
    new ApiResponse(200, {
      overallCorrelation: {
        highHabitAvgMood: parseFloat(highAvg.toFixed(1)),
        lowHabitAvgMood: parseFloat(lowAvg.toFixed(1)),
        difference: parseFloat((highAvg - lowAvg).toFixed(1))
      },
      habitCorrelations
    }, 'Habit-mood correlations calculated successfully.')
  );
});

/**
 * Smart Habit Suggestions based on Mood, Journals, and AI Insights
 */
export const getSmartHabitSuggestions = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  // Retrieve user baseline datasets
  const [moodLogs, journals, activeHabits] = await Promise.all([
    Mood.find({ userId }).sort({ loggedAt: -1 }).limit(10),
    Journal.find({ userId }).sort({ createdAt: -1 }).limit(10),
    Habit.find({ userId, isArchived: false })
  ]);

  const apiKey = process.env.GEMINI_API_KEY;
  const isOffline = !apiKey || apiKey === 'mock' || apiKey === '';

  // Safe mockup lists
  const defaultSuggestions = [
    {
      name: 'Drink 2L Water',
      description: 'Keep hydrated throughout the day to sustain energy and stabilize mood.',
      frequency: 'daily',
      reason: 'Physical hydration supports cognitive clarity and emotional stability.'
    },
    {
      name: '5-Minute Breathing Exercises',
      description: 'Practice brief slow breathing exercises to calm the nervous system.',
      frequency: 'daily',
      reason: 'Helps control cortisol levels when logs show moderate anxiety tags.'
    },
    {
      name: 'Write 1 Gratitude Entry',
      description: 'Record one good thing that happened today in your journal category.',
      frequency: 'daily',
      reason: 'Sustained gratitude habits correlate strongly with increased daily wellness scores.'
    },
    {
      name: 'Weekly Reflective Walk',
      description: 'Spend 20 minutes walking in nature without digital distractions.',
      frequency: 'weekly',
      reason: 'Unwinding weekly matches patterns of lower mood logged towards late weekdays.'
    }
  ];

  if (isOffline) {
    // Customize mocks based on logged data if offline
    const customSuggestions = [...defaultSuggestions];
    
    // Check if user has lower mood average
    const recentScores = moodLogs.map(m => m.moodScore);
    const avgRecent = recentScores.length > 0 ? recentScores.reduce((a,b)=>a+b, 0)/recentScores.length : 7.0;

    if (avgRecent < 6.0) {
      customSuggestions.unshift({
        name: 'Morning Affirmation Journaling',
        description: 'Read and log one positive quote when starting the day.',
        frequency: 'daily',
        reason: 'Recommended because your recent average mood is slightly lower than normal.'
      });
    }

    // Check for common tags
    const allTags = moodLogs.flatMap(m => m.moodTags);
    if (allTags.includes('stressed') || allTags.includes('anxious') || allTags.includes('tired')) {
      customSuggestions.unshift({
        name: 'Evening Wind-down Routine',
        description: 'No screens for 30 minutes before sleep to stabilize cortisol.',
        frequency: 'daily',
        reason: 'Recommended to address stressful and tired tags found in your recent check-ins.'
      });
    }

    // Ensure we don't suggest habits they already track
    const activeNames = new Set(activeHabits.map(h => h.name.toLowerCase()));
    const filteredSuggestions = customSuggestions.filter(s => !activeNames.has(s.name.toLowerCase())).slice(0, 3);

    return res.status(200).json(
      new ApiResponse(200, { suggestions: filteredSuggestions }, 'Smart habit suggestions retrieved (Offline mode).')
    );
  }

  // If online, use Gemini
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const moodSummary = moodLogs.map(m => `Score: ${m.moodScore}, Tags: ${m.moodTags.join(', ')}`).join('\n');
    const journalSummary = journals.map(j => `Category: ${j.category}, Tag: ${j.moodTag}, Title: ${j.title}`).join('\n');
    const activeSummary = activeHabits.map(h => h.name).join(', ');

    const prompt = `You are the THRYVE Smart Habits engine. Analyze this wellness context:
--- RECENT MOOD RECORDS ---
${moodSummary}

--- RECENT JOURNAL RECORDS ---
${journalSummary}

--- CURRENTLY TRACKING HABITS ---
${activeSummary}
---

Generate 3 personalized, highly supportive habit suggestions that would help improve the user's wellbeing. Do not recommend habits they are already tracking.
Return ONLY a raw JSON array matching this schema (no markdown blocks):
[
  {
    "name": "Habit Name",
    "description": "Short description of what to do (max 100 chars)",
    "frequency": "daily" or "weekly" or "monthly",
    "reason": "Empathetic reason based on their records (max 100 chars)"
  }
]`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    text = text.replace(/^```json/i, '').replace(/```$/g, '').trim();
    const suggestions = JSON.parse(text);

    return res.status(200).json(
      new ApiResponse(200, { suggestions }, 'Smart habit suggestions generated successfully.')
    );
  } catch (err) {
    console.error('Gemini Smart suggestions error:', err);
    return res.status(200).json(
      new ApiResponse(200, { suggestions: defaultSuggestions.slice(0, 3) }, 'Smart habit suggestions retrieved (Fallback).')
    );
  }
});
