import Mood from '../models/mood.model.js';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * Log a new mood entry.
 */
export const createMoodLog = asyncHandler(async (req, res) => {
  const { moodScore, moodTags, notes, loggedAt } = req.body;

  const mood = new Mood({
    userId: req.user.userId,
    moodScore,
    moodTags,
    notes,
    loggedAt: loggedAt ? new Date(loggedAt) : undefined,
  });

  await mood.save();

  return res.status(201).json(
    new ApiResponse(201, { mood }, 'Mood logged successfully.')
  );
});

/**
 * Get user mood entries (paginated, sorted by loggedAt descending).
 */
export const getUserMoodLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const logs = await Mood.find({ userId: req.user.userId })
    .sort({ loggedAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalCount = await Mood.countDocuments({ userId: req.user.userId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        moodLogs: logs,
        page,
        limit,
        totalCount,
      },
      'Mood logs retrieved successfully.'
    )
  );
});

/**
 * Get a specific mood entry by ID.
 */
export const getMoodLogById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid Mood Log ID.');
  }

  const log = await Mood.findById(id);

  if (!log) {
    throw new ApiError(404, 'Mood entry not found.');
  }

  if (log.userId.toString() !== req.user.userId) {
    throw new ApiError(403, 'Unauthorized access to this mood entry.');
  }

  return res.status(200).json(
    new ApiResponse(200, { moodLog: log }, 'Mood entry retrieved successfully.')
  );
});

/**
 * Update a specific mood entry.
 */
export const updateMoodLog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { moodScore, moodTags, notes, loggedAt } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid Mood Log ID.');
  }

  const log = await Mood.findById(id);

  if (!log) {
    throw new ApiError(404, 'Mood entry not found.');
  }

  if (log.userId.toString() !== req.user.userId) {
    throw new ApiError(403, 'Unauthorized access to this mood entry.');
  }

  if (moodScore !== undefined) log.moodScore = moodScore;
  if (moodTags !== undefined) log.moodTags = moodTags;
  if (notes !== undefined) log.notes = notes;
  if (loggedAt !== undefined) log.loggedAt = new Date(loggedAt);

  await log.save();

  return res.status(200).json(
    new ApiResponse(200, { moodLog: log }, 'Mood entry updated successfully.')
  );
});

/**
 * Delete a specific mood entry.
 */
export const deleteMoodLog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid Mood Log ID.');
  }

  const log = await Mood.findById(id);

  if (!log) {
    throw new ApiError(404, 'Mood entry not found.');
  }

  if (log.userId.toString() !== req.user.userId) {
    throw new ApiError(403, 'Unauthorized access to this mood entry.');
  }

  await Mood.deleteOne({ _id: id });

  return res.status(200).json(
    new ApiResponse(200, null, 'Mood entry deleted successfully.')
  );
});

/**
 * Fetch advanced statistics for dashboard displays using MongoDB aggregations.
 */
export const getMoodStats = asyncHandler(async (req, res) => {
  const userObjectId = new mongoose.Types.ObjectId(req.user.userId);

  // Time metrics
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // 1. Total logs
  const totalCount = await Mood.countDocuments({ userId: userObjectId });

  // 2. Latest log
  const latestLog = await Mood.findOne({ userId: userObjectId }).sort({ loggedAt: -1 });

  // 3. 7-day average
  const stats7d = await Mood.aggregate([
    { $match: { userId: userObjectId, loggedAt: { $gte: sevenDaysAgo } } },
    { $group: { _id: null, avgScore: { $avg: '$moodScore' } } },
  ]);
  const average7d = stats7d[0]?.avgScore ? parseFloat(stats7d[0].avgScore.toFixed(1)) : null;

  // 4. 30-day average
  const stats30d = await Mood.aggregate([
    { $match: { userId: userObjectId, loggedAt: { $gte: thirtyDaysAgo } } },
    { $group: { _id: null, avgScore: { $avg: '$moodScore' } } },
  ]);
  const average30d = stats30d[0]?.avgScore ? parseFloat(stats30d[0].avgScore.toFixed(1)) : null;

  // 5. Monthly High/Low
  const statsMonth = await Mood.aggregate([
    { $match: { userId: userObjectId, loggedAt: { $gte: startOfMonth } } },
    {
      $group: {
        _id: null,
        highest: { $max: '$moodScore' },
        lowest: { $min: '$moodScore' },
      },
    },
  ]);
  const highestThisMonth = statsMonth[0]?.highest || null;
  const lowestThisMonth = statsMonth[0]?.lowest || null;

  // 6. Streak calculator (consecutive logging days)
  const loggedDates = await Mood.aggregate([
    { $match: { userId: userObjectId } },
    {
      $project: {
        dateStr: { $dateToString: { format: '%Y-%m-%d', date: '$loggedAt' } },
      },
    },
    { $group: { _id: '$dateStr' } },
    { $sort: { _id: -1 } },
  ]);

  let streak = 0;
  if (loggedDates.length > 0) {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const mostRecentLogStr = loggedDates[0]._id;

    // Check if user has logged today or yesterday (otherwise streak is broken/0)
    if (mostRecentLogStr === todayStr || mostRecentLogStr === yesterdayStr) {
      streak = 1;
      for (let i = 1; i < loggedDates.length; i++) {
        const prevDate = new Date(loggedDates[i - 1]._id);
        const currDate = new Date(loggedDates[i]._id);
        const diff = Math.round((prevDate - currDate) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
          streak++;
        } else {
          break;
        }
      }
    }
  }

  // 7. Trend indicator (comparing current 7d avg to previous 7d avg)
  const statsPrev7d = await Mood.aggregate([
    { $match: { userId: userObjectId, loggedAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } } },
    { $group: { _id: null, avgScore: { $avg: '$moodScore' } } },
  ]);

  const prevAvg = statsPrev7d[0]?.avgScore || null;

  let trend = 'stable';
  if (average7d && prevAvg) {
    if (average7d > prevAvg + 0.5) {
      trend = 'improving';
    } else if (average7d < prevAvg - 0.5) {
      trend = 'declining';
    }
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalCount,
        latestLog,
        average7d,
        average30d,
        highestThisMonth,
        lowestThisMonth,
        streak,
        trend,
      },
      'Mood statistics computed successfully.'
    )
  );
});

/**
 * Fetch daily trends, weekly trends, and mood score distributions.
 */
export const getMoodTrends = asyncHandler(async (req, res) => {
  const userObjectId = new mongoose.Types.ObjectId(req.user.userId);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

  // 1. Daily Trend
  const dailyTrends = await Mood.aggregate([
    { $match: { userId: userObjectId, loggedAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$loggedAt' } },
        avgScore: { $avg: '$moodScore' },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        date: '$_id',
        avgScore: { $round: ['$avgScore', 1] },
        _id: 0,
      },
    },
  ]);

  // 2. Weekly Trend
  const weeklyTrends = await Mood.aggregate([
    { $match: { userId: userObjectId, loggedAt: { $gte: eightWeeksAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$loggedAt' },
          week: { $week: '$loggedAt' },
        },
        avgScore: { $avg: '$moodScore' },
      },
    },
    { $sort: { '_id.year': 1, '_id.week': 1 } },
    {
      $project: {
        label: { $concat: ['Wk ', { $toString: '$_id.week' }, ', ', { $toString: '$_id.year' }] },
        avgScore: { $round: ['$avgScore', 1] },
        _id: 0,
      },
    },
  ]);

  // 3. Distribution
  const distribution = await Mood.aggregate([
    { $match: { userId: userObjectId } },
    {
      $group: {
        _id: '$moodScore',
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        score: '$_id',
        count: 1,
        _id: 0,
      },
    },
  ]);

  const fullDistribution = Array.from({ length: 10 }, (_, i) => {
    const score = i + 1;
    const match = distribution.find((d) => d.score === score);
    return {
      score,
      count: match ? match.count : 0,
    };
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        dailyTrends,
        weeklyTrends,
        distribution: fullDistribution,
      },
      'Mood trends retrieved successfully.'
    )
  );
});
