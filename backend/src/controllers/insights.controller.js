import Mood from '../models/mood.model.js';
import Journal from '../models/journal.model.js';
import Chat from '../models/chat.model.js';
import mongoose from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Helper to calculate standard deviation
const getStandardDeviation = (array, mean) => {
  if (array.length <= 1) return 0;
  const variance = array.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / array.length;
  return Math.sqrt(variance);
};

// Days of the week lookup
const DAYS_OF_WEEK = ['', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Endpoint 1: GET /api/v1/insights/summary
 * Computes average mood (7d/30d), journaling counts, writing streak,
 * best/worst days, trend indications, and next-day score predictions.
 */
export const getInsightsSummary = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.userId);
  const now = new Date();
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  // 1. Fetch Mood logs for averages (last 30 days)
  const moodLogs30d = await Mood.find({
    userId,
    loggedAt: { $gte: thirtyDaysAgo }
  }).sort({ loggedAt: -1 });

  const moodScores30d = moodLogs30d.map(log => log.moodScore);
  const totalLogs30d = moodScores30d.length;
  
  const avg30d = totalLogs30d > 0
    ? moodScores30d.reduce((sum, score) => sum + score, 0) / totalLogs30d
    : 7.0; // Fallback score if no logs

  const moodLogs7d = moodLogs30d.filter(log => log.loggedAt >= sevenDaysAgo);
  const moodScores7d = moodLogs7d.map(log => log.moodScore);
  const avg7d = moodScores7d.length > 0
    ? moodScores7d.reduce((sum, score) => sum + score, 0) / moodScores7d.length
    : avg30d;

  // 2. Fetch journal entries (last 30 days)
  const journalCount30d = await Journal.countDocuments({
    userId,
    createdAt: { $gte: thirtyDaysAgo }
  });
  const totalJournalsAllTime = await Journal.countDocuments({ userId });

  // 3. Compute Streak (consecutive check-in days using both mood and journal logs)
  const [moodDates, journalDates] = await Promise.all([
    Mood.aggregate([
      { $match: { userId } },
      { $project: { dateStr: { $dateToString: { format: '%Y-%m-%d', date: '$loggedAt' } } } },
      { $group: { _id: '$dateStr' } }
    ]),
    Journal.aggregate([
      { $match: { userId } },
      { $project: { dateStr: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } } },
      { $group: { _id: '$dateStr' } }
    ])
  ]);

  const uniqueCheckinDates = new Set([
    ...moodDates.map(d => d._id),
    ...journalDates.map(d => d._id)
  ]);

  const sortedDates = Array.from(uniqueCheckinDates).sort((a, b) => new Date(b) - new Date(a));
  let currentStreak = 0;
  if (sortedDates.length > 0) {
    const todayStr = now.toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const mostRecentDate = sortedDates[0];
    if (mostRecentDate === todayStr || mostRecentDate === yesterdayStr) {
      currentStreak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        const diff = Math.round((prev - curr) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
  }

  // 4. Trend calculation (Last 7d vs Previous 7d [days 8-14])
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(now.getDate() - 14);
  const prev7dLogs = moodLogs30d.filter(log => log.loggedAt >= fourteenDaysAgo && log.loggedAt < sevenDaysAgo);
  const prev7dAvg = prev7dLogs.length > 0
    ? prev7dLogs.reduce((sum, log) => sum + log.moodScore, 0) / prev7dLogs.length
    : avg30d;

  const trendDiff = avg7d - prev7dAvg;
  let moodTrend = 'stable';
  if (trendDiff > 0.5) moodTrend = 'improving';
  else if (trendDiff < -0.5) moodTrend = 'declining';

  // 5. Best & Worst weekdays (using aggregation)
  const weekdayStats = await Mood.aggregate([
    { $match: { userId } },
    {
      $project: {
        moodScore: 1,
        dayOfWeek: { $dayOfWeek: '$loggedAt' } // 1 (Sunday) to 7 (Saturday)
      }
    },
    {
      $group: {
        _id: '$dayOfWeek',
        avgScore: { $avg: '$moodScore' }
      }
    },
    { $sort: { avgScore: -1 } }
  ]);

  const bestWeekdayId = weekdayStats.length > 0 ? weekdayStats[0]._id : null;
  const worstWeekdayId = weekdayStats.length > 0 ? weekdayStats[weekdayStats.length - 1]._id : null;

  const bestWeekday = bestWeekdayId ? DAYS_OF_WEEK[bestWeekdayId] : 'N/A';
  const worstWeekday = worstWeekdayId ? DAYS_OF_WEEK[worstWeekdayId] : 'N/A';

  // 6. Dynamic Wellbeing Score Engine (0-100)
  // - Recent mood averages (40%)
  const moodScoreContribution = avg30d * 10 * 0.4;

  // - Mood consistency/stability (20%)
  const sd = getStandardDeviation(moodScores30d, avg30d);
  const stabilityBaseScore = Math.max(0, 100 - (sd * 25));
  const stabilityContribution = stabilityBaseScore * 0.2;

  // - Journal activity frequency (15%) - capped at 10 journals in 30 days
  const journalCapScore = Math.min(100, journalCount30d * 10);
  const journalContribution = journalCapScore * 0.15;

  // - Positive mood trends (15%)
  const trendBaseScore = Math.min(100, Math.max(0, 75 + (trendDiff * 25)));
  const trendContribution = trendBaseScore * 0.15;

  // - Companion engagement (10%) - capped at 10 user messages in 30 days
  const chatCount30d = await Chat.countDocuments({
    userId,
    role: 'user',
    createdAt: { $gte: thirtyDaysAgo }
  });
  const chatCapScore = Math.min(100, chatCount30d * 10);
  const companionContribution = chatCapScore * 0.1;

  const wellbeingScore = Math.round(
    moodScoreContribution +
    stabilityContribution +
    journalContribution +
    trendContribution +
    companionContribution
  );

  const wellbeingBreakdown = {
    moodAverage: { score: Math.round(avg30d * 10), weight: 40, points: Math.round(moodScoreContribution) },
    stability: { score: Math.round(stabilityBaseScore), weight: 20, points: Math.round(stabilityContribution) },
    journalFrequency: { score: Math.round(journalCapScore), weight: 15, points: Math.round(journalContribution) },
    moodTrend: { score: Math.round(trendBaseScore), weight: 15, points: Math.round(trendContribution) },
    companionEngagement: { score: Math.round(chatCapScore), weight: 10, points: Math.round(companionContribution) }
  };

  // 7. Prediction Engine (weighted moving average of last 7 entries)
  const last7Logs = await Mood.find({ userId })
    .sort({ loggedAt: -1 })
    .limit(7);

  let predictedMood = 7.0;
  let confidence = 50;
  let riskLevel = 'Low';
  const factors = [];

  if (last7Logs.length > 0) {
    let weightedSum = 0;
    let sumOfWeights = 0;
    // Reverse logs to chronologically order (oldest -> newest for weighting)
    const logsChronological = [...last7Logs].reverse();
    
    logsChronological.forEach((log, index) => {
      const weight = index + 1; // higher weight for recent entries
      weightedSum += log.moodScore * weight;
      sumOfWeights += weight;
    });

    predictedMood = parseFloat((weightedSum / sumOfWeights).toFixed(1));

    // Confidence mapping
    const logsCountFactor = Math.min(50, totalLogs30d * 5); // up to 50%
    const stabilityFactor = Math.max(0, 45 - (sd * 10)); // up to 45%
    confidence = Math.min(95, Math.max(30, Math.round(logsCountFactor + stabilityFactor)));

    // Risk Mapping
    if (predictedMood < 4.5) riskLevel = 'High';
    else if (predictedMood < 6.5) riskLevel = 'Moderate';
    else riskLevel = 'Low';

    // Influence Factors Compile
    if (trendDiff > 0.3) {
      factors.push('Upward trajectory in recent daily check-ins is driving the forecast positive.');
    } else if (trendDiff < -0.3) {
      factors.push('Slight downward trend in weekly mood is generating a precautionary outlook.');
    }

    if (sd > 1.8) {
      factors.push('High emotional volatility (variable score spikes) reduces forecast certainty.');
    } else {
      factors.push('High emotional consistency stabilizes next-day forecast bounds.');
    }

    if (journalCount30d > 4) {
      factors.push('Consistent journaling reflections support positive emotional processing.');
    } else {
      factors.push('Lower journaling logs frequency reduces self-reflection outlet scores.');
    }
  } else {
    factors.push('Insufficient check-in metrics logged yet. Set baseline to enhance forecast analytics.');
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        avg30d: parseFloat(avg30d.toFixed(1)),
        avg7d: parseFloat(avg7d.toFixed(1)),
        journalCount30d,
        totalJournalsAllTime,
        currentStreak,
        bestWeekday,
        worstWeekday,
        moodTrend,
        wellbeingScore,
        wellbeingBreakdown,
        forecast: {
          predictedMood,
          riskLevel,
          confidence,
          factors
        }
      },
      'Insights summary calculated successfully.'
    )
  );
});

/**
 * Endpoint 2: GET /api/v1/insights/patterns
 * Analyzes common tags, categories, weekday splits, hourly blocks, and correlates journal categories to mood.
 */
export const getInsightsPatterns = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.userId);

  // 1. Most common mood tags
  const commonTags = await Mood.aggregate([
    { $match: { userId } },
    { $unwind: '$moodTags' },
    { $group: { _id: '$moodTags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    { $project: { tag: '$_id', count: 1, _id: 0 } }
  ]);

  // 2. Most common journal categories
  const commonCategories = await Journal.aggregate([
    { $match: { userId } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 7 },
    { $project: { category: '$_id', count: 1, _id: 0 } }
  ]);

  // 3. Weekday breakdowns (Average scores per day-of-week)
  const weekdayDistribution = await Mood.aggregate([
    { $match: { userId } },
    {
      $project: {
        moodScore: 1,
        dayOfWeek: { $dayOfWeek: '$loggedAt' }
      }
    },
    {
      $group: {
        _id: '$dayOfWeek',
        avgScore: { $avg: '$moodScore' },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const weekdaysMapped = weekdayDistribution.map(item => ({
    dayNumber: item._id,
    dayName: DAYS_OF_WEEK[item._id],
    avgScore: parseFloat(item.avgScore.toFixed(1)),
    count: item.count
  }));

  // 4. Time of day distribution
  const hourlyStats = await Mood.aggregate([
    { $match: { userId } },
    {
      $project: {
        moodScore: 1,
        hour: { $hour: '$loggedAt' }
      }
    },
    {
      $group: {
        _id: {
          $cond: [
            { $and: [{ $gte: ['$hour', 5] }, { $lt: ['$hour', 12] }] }, 'Morning',
            {
              $cond: [
                { $and: [{ $gte: ['$hour', 12] }, { $lt: ['$hour', 17] }] }, 'Afternoon',
                {
                  $cond: [
                    { $and: [{ $gte: ['$hour', 17] }, { $lt: ['$hour', 21] }] }, 'Evening',
                    'Night'
                  ]
                }
              ]
            }
          ]
        },
        avgScore: { $avg: '$moodScore' },
        count: { $sum: 1 }
      }
    }
  ]);

  const timePeriods = ['Morning', 'Afternoon', 'Evening', 'Night'].map(period => {
    const match = hourlyStats.find(h => h._id === period);
    return {
      period,
      avgScore: match ? parseFloat(match.avgScore.toFixed(1)) : 7.0,
      count: match ? match.count : 0
    };
  });

  // Determine peak productive/balanced period
  const sortedPeriods = [...timePeriods].sort((a, b) => b.avgScore - a.avgScore);
  const peakTimePeriod = sortedPeriods[0]?.count > 0 ? sortedPeriods[0].period : 'Morning';

  // 5. In-memory correlation between Journal categories and daily mood averages (Last 30 Days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(new Date().getDate() - 30);

  const moodLogs = await Mood.find({ userId, loggedAt: { $gte: thirtyDaysAgo } });
  const journalLogs = await Journal.find({ userId, createdAt: { $gte: thirtyDaysAgo } });

  // Map mood scores to date string keys (YYYY-MM-DD)
  const dailyMoods = {};
  moodLogs.forEach(log => {
    const dateStr = log.loggedAt.toISOString().split('T')[0];
    if (!dailyMoods[dateStr]) dailyMoods[dateStr] = [];
    dailyMoods[dateStr].push(log.moodScore);
  });

  const dailyMoodAverages = {};
  Object.keys(dailyMoods).forEach(dateStr => {
    const scores = dailyMoods[dateStr];
    dailyMoodAverages[dateStr] = scores.reduce((sum, val) => sum + val, 0) / scores.length;
  });

  // Map journal categories against dates with daily mood averages
  const categoryCorrelations = {};
  journalLogs.forEach(journal => {
    const dateStr = journal.createdAt.toISOString().split('T')[0];
    const avgMoodOnDay = dailyMoodAverages[dateStr];
    if (avgMoodOnDay !== undefined) {
      if (!categoryCorrelations[journal.category]) {
        categoryCorrelations[journal.category] = [];
      }
      categoryCorrelations[journal.category].push(avgMoodOnDay);
    }
  });

  const correlationStats = Object.keys(categoryCorrelations).map(cat => {
    const moods = categoryCorrelations[cat];
    const avgMood = moods.reduce((sum, val) => sum + val, 0) / moods.length;
    return {
      category: cat,
      avgMoodScore: parseFloat(avgMood.toFixed(1)),
      samples: moods.length
    };
  });

  // Sort correlations desc to see which categories match highest mood
  correlationStats.sort((a, b) => b.avgMoodScore - a.avgMoodScore);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        commonTags,
        commonCategories,
        weekdaysMapped,
        timePeriods,
        peakTimePeriod,
        correlations: correlationStats
      },
      'Insight patterns compiled successfully.'
    )
  );
});

/**
 * Endpoint 3: GET /api/v1/insights/recommendations
 * Leverages Gemini API to compile empathetic suggestions, habit tips, prompts, and actions.
 */
export const getInsightsRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  // Retrieve data ranges
  const last30Moods = await Mood.find({ userId })
    .sort({ loggedAt: -1 })
    .limit(30);

  const last20Journals = await Journal.find({ userId })
    .sort({ createdAt: -1 })
    .limit(20);

  // Check for environment variables & mock state
  const apiKey = process.env.GEMINI_API_KEY;
  const isMockMode = !apiKey || apiKey === 'mock' || apiKey === '';

  // Prepare fallback data structure matching prompt expectations
  const mockRecommendations = {
    wellbeingScore: 78,
    recommendations: [
      'Mindful Evening wind-downs: Focus on writing down 2 quick positive things to stabilize evening low states.',
      'Delegate high-anxiety study logs early in weekdays. A study session on Saturday mornings correlates with peak mood scores.',
      'Active gratitude mapping: Keep logging your Gratitude Category journals to maintain consistent wellness points.'
    ],
    habits: [
      'Log daily mood logs directly in the mornings to identify early emotional baselines.',
      'Keep journal log reflections under 100 words during work periods to extend Streaks.'
    ],
    prompts: [
      'What is one small detail from yesterday that made you feel peaceful or calm?',
      'Reflect on how your breathing changed when you felt stressed during your study sessions.'
    ],
    companionSuggestions: [
      'Talk to the Companion about: "Help me practice a 2-minute box breathing routine."',
      'Ask the Companion: "Give me an encouraging affirmation to start my workday."'
    ]
  };

  // Compile context summaries for Gemini
  const moodsSummaryText = last30Moods.map(log => 
    `Date: ${log.loggedAt.toISOString().split('T')[0]}, Score: ${log.moodScore}, Tags: ${log.moodTags.join(', ')}`
  ).join('\n');

  const journalsSummaryText = last20Journals.map(entry =>
    `Date: ${entry.createdAt.toISOString().split('T')[0]}, Category: ${entry.category}, MoodTag: ${entry.moodTag}, Title: ${entry.title}`
  ).join('\n');

  if (isMockMode || (last30Moods.length === 0 && last20Journals.length === 0)) {
    // Return offline mock response directly
    return res.status(200).json(
      new ApiResponse(
        200,
        mockRecommendations,
        'Wellness recommendations computed successfully (Offline fallback).'
      )
    );
  }

  // Live Gemini query mode
  const genAI = new GoogleGenerativeAI(apiKey);
  let parsedAIResponse = null;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are the THRYVE AI insights engine. Your role is to analyze a user's mood logs and journal logs over the past month, and generate supportive, empathetic, and actionable wellness suggestions.

Input logs to analyze:
--- MOOD LOGS ---
${moodsSummaryText}

--- JOURNAL LOGS ---
${journalsSummaryText}
---

Based on these logs, please generate a structured JSON object response with the following keys. Do NOT wrap the JSON inside markdown, return ONLY the raw JSON string:
{
  "recommendations": ["empowering suggestion 1", "empowering suggestion 2", "empowering suggestion 3"],
  "habits": ["actionable habit tip 1", "actionable habit tip 2"],
  "prompts": ["meditation or writing reflection prompt 1", "meditation or writing reflection prompt 2"],
  "companionSuggestions": ["topic to talk to AI Companion about 1", "topic to talk to AI Companion about 2"]
}

Wellness boundaries:
- Do not diagnostic-label, do not suggest clinical pathologies.
- Keep suggestions warm, supportive, actionable, and concise.`;

    const result = await model.generateContent(prompt);
    let rawText = result.response.text().trim();
    // Strip potential markdown JSON wraps
    rawText = rawText.replace(/^```json/i, '').replace(/```$/g, '').trim();
    parsedAIResponse = JSON.parse(rawText);
  } catch (err) {
    console.error('Gemini insights generation error details:', err);
    // Graceful fallback to mock data on API failures
    parsedAIResponse = mockRecommendations;
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      parsedAIResponse,
      'AI Wellness recommendations generated successfully.'
    )
  );
});
