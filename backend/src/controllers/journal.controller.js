import Journal from '../models/journal.model.js';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * Helper to count words in a string.
 */
const getWordCountStr = (text) => {
  if (!text || typeof text !== 'string') return 0;
  const trimmed = text.trim();
  if (trimmed === '') return 0;
  return trimmed.split(/\s+/).length;
};

/**
 * Create a new journal entry.
 */
export const createJournalEntry = asyncHandler(async (req, res) => {
  const { title, content, moodTag, category, isPinned } = req.body;

  const journal = new Journal({
    userId: req.user.userId,
    title,
    content,
    moodTag,
    category,
    isPinned,
  });

  await journal.save();

  return res.status(201).json(
    new ApiResponse(201, { journal }, 'Journal entry successfully created.')
  );
});

/**
 * Fetch paginated journal entries for the current user.
 * Supports title/content search, mood filter, category filter, and prioritizes pinned entries.
 */
export const getUserJournalEntries = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const { search, moodTag, category } = req.query;

  const query = { userId: req.user.userId };

  // Case-insensitive regex search on title and content
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
    ];
  }

  // Filter by mood tag
  if (moodTag) {
    query.moodTag = moodTag;
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Query records: Pinned first, then newest first
  const logs = await Journal.find(query)
    .sort({ isPinned: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalCount = await Journal.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        journals: logs,
        page,
        limit,
        totalCount,
      },
      'Journal entries retrieved successfully.'
    )
  );
});

/**
 * Fetch a single journal entry by ID.
 */
export const getJournalEntryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid Journal ID.');
  }

  const log = await Journal.findById(id);

  if (!log) {
    throw new ApiError(404, 'Journal entry not found.');
  }

  if (log.userId.toString() !== req.user.userId) {
    throw new ApiError(403, 'Unauthorized access to this journal entry.');
  }

  return res.status(200).json(
    new ApiResponse(200, { journal: log }, 'Journal entry retrieved successfully.')
  );
});

/**
 * Update a specific journal entry.
 */
export const updateJournalEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content, moodTag, category, isPinned } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid Journal ID.');
  }

  const log = await Journal.findById(id);

  if (!log) {
    throw new ApiError(404, 'Journal entry not found.');
  }

  if (log.userId.toString() !== req.user.userId) {
    throw new ApiError(403, 'Unauthorized access to this journal entry.');
  }

  if (title !== undefined) log.title = title;
  if (content !== undefined) log.content = content;
  if (moodTag !== undefined) log.moodTag = moodTag;
  if (category !== undefined) log.category = category;
  if (isPinned !== undefined) log.isPinned = isPinned;

  await log.save();

  return res.status(200).json(
    new ApiResponse(200, { journal: log }, 'Journal entry updated successfully.')
  );
});

/**
 * Delete a specific journal entry.
 */
export const deleteJournalEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid Journal ID.');
  }

  const log = await Journal.findById(id);

  if (!log) {
    throw new ApiError(404, 'Journal entry not found.');
  }

  if (log.userId.toString() !== req.user.userId) {
    throw new ApiError(403, 'Unauthorized access to this journal entry.');
  }

  await Journal.deleteOne({ _id: id });

  return res.status(200).json(
    new ApiResponse(200, null, 'Journal entry deleted successfully.')
  );
});

/**
 * Toggle the pinned status of a specific journal entry.
 */
export const togglePinJournal = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid Journal ID.');
  }

  const log = await Journal.findById(id);

  if (!log) {
    throw new ApiError(404, 'Journal entry not found.');
  }

  if (log.userId.toString() !== req.user.userId) {
    throw new ApiError(403, 'Unauthorized access to this journal entry.');
  }

  log.isPinned = !log.isPinned;
  await log.save();

  return res.status(200).json(
    new ApiResponse(200, { journal: log }, `Journal entry successfully ${log.isPinned ? 'pinned' : 'unpinned'}.`)
  );
});

/**
 * Compute key statistics for user dashboard metrics.
 */
export const getJournalStats = asyncHandler(async (req, res) => {
  const userObjectId = new mongoose.Types.ObjectId(req.user.userId);

  // 1. Total journals count
  const totalJournals = await Journal.countDocuments({ userId: userObjectId });

  // 2. Fetch total and average words using MongoDB Aggregations
  const wordStats = await Journal.aggregate([
    { $match: { userId: userObjectId } },
    {
      $project: {
        wordCount: {
          $cond: {
            if: { $eq: [{ $trim: { input: '$content' } }, ''] },
            then: 0,
            else: {
              $size: {
                $split: [
                  { $replaceAll: { input: { $trim: { input: '$content' } }, find: '  ', replacement: ' ' } },
                  ' ',
                ],
              },
            },
          },
        },
      },
    },
    {
      $group: {
        _id: null,
        totalWords: { $sum: '$wordCount' },
        avgWords: { $avg: '$wordCount' },
      },
    },
  ]);

  const totalWordsWritten = wordStats[0]?.totalWords || 0;
  const averageWordsPerJournal = wordStats[0]?.avgWords ? Math.round(wordStats[0].avgWords) : 0;

  // 3. Writing Streak calculation (consecutive calendar days logged)
  const loggedDates = await Journal.aggregate([
    { $match: { userId: userObjectId } },
    {
      $project: {
        dateStr: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
      },
    },
    { $group: { _id: '$dateStr' } },
    { $sort: { _id: -1 } },
  ]);

  let currentWritingStreak = 0;
  if (loggedDates.length > 0) {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const mostRecentLogStr = loggedDates[0]._id;

    if (mostRecentLogStr === todayStr || mostRecentLogStr === yesterdayStr) {
      currentWritingStreak = 1;
      for (let i = 1; i < loggedDates.length; i++) {
        const prevDate = new Date(loggedDates[i - 1]._id);
        const currDate = new Date(loggedDates[i]._id);
        const diff = Math.round((prevDate - currDate) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
          currentWritingStreak++;
        } else {
          break;
        }
      }
    }
  }

  // 4. Latest 5 entries
  const recentEntries = await Journal.find({ userId: userObjectId })
    .sort({ createdAt: -1 })
    .limit(5);

  // Return word counts explicitly for individual items
  const recentEntriesWithWordCounts = recentEntries.map((entry) => ({
    ...entry.toObject(),
    wordCount: getWordCountStr(entry.content),
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalJournals,
        totalWordsWritten,
        averageWordsPerJournal,
        currentWritingStreak,
        recentEntries: recentEntriesWithWordCounts,
      },
      'Journal statistics computed successfully.'
    )
  );
});

/**
 * Fetch monthly, weekly, and daily distributions for Recharts visualization panels.
 */
export const getJournalAnalytics = asyncHandler(async (req, res) => {
  const userObjectId = new mongoose.Types.ObjectId(req.user.userId);

  // Set ranges
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // 1. Journals per day (Last 30 Days)
  const dailyTrends = await Journal.aggregate([
    { $match: { userId: userObjectId, createdAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        date: '$_id',
        count: 1,
        _id: 0,
      },
    },
  ]);

  // 2. Journals per week (Last 8 Weeks)
  const weeklyTrends = await Journal.aggregate([
    { $match: { userId: userObjectId, createdAt: { $gte: eightWeeksAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.week': 1 } },
    {
      $project: {
        label: { $concat: ['Wk ', { $toString: '$_id.week' }, ', ', { $toString: '$_id.year' }] },
        count: 1,
        _id: 0,
      },
    },
  ]);

  // 3. Journals per month (Last 6 Months)
  const monthlyTrends = await Journal.aggregate([
    { $match: { userId: userObjectId, createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    {
      $project: {
        label: {
          $concat: [
            {
              $let: {
                vars: {
                  monthsInStr: [
                    '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                  ]
                },
                in: { $arrayElemAt: ['$$monthsInStr', '$_id.month'] }
              }
            },
            ' ',
            { $toString: '$_id.year' }
          ]
        },
        count: 1,
        _id: 0,
      },
    },
  ]);

  // 4. Category distribution count
  const categoryStats = await Journal.aggregate([
    { $match: { userId: userObjectId } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    {
      $project: {
        name: '$_id',
        value: '$count',
        _id: 0,
      },
    },
  ]);

  // 5. Mood tag distribution count
  const moodStats = await Journal.aggregate([
    { $match: { userId: userObjectId } },
    {
      $group: {
        _id: '$moodTag',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    {
      $project: {
        name: '$_id',
        value: '$count',
        _id: 0,
      },
    },
  ]);

  // 6. Word count trends (words written in each journal chronologically)
  const wordCountTrends = await Journal.aggregate([
    { $match: { userId: userObjectId } },
    { $sort: { createdAt: 1 } },
    {
      $project: {
        title: 1,
        date: { $dateToString: { format: '%m-%d', date: '$createdAt' } },
        wordCount: {
          $cond: {
            if: { $eq: [{ $trim: { input: '$content' } }, ''] },
            then: 0,
            else: {
              $size: {
                $split: [
                  { $replaceAll: { input: { $trim: { input: '$content' } }, find: '  ', replacement: ' ' } },
                  ' ',
                ],
              },
            },
          },
        },
        _id: 0,
      },
    },
  ]);

  // 7. Full contributions heatmap log for Calendar View (Grouped by YYYY-MM-DD counts)
  const heatmapData = await Journal.aggregate([
    { $match: { userId: userObjectId } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        date: '$_id',
        count: 1,
        _id: 0,
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        dailyTrends,
        weeklyTrends,
        monthlyTrends,
        categoryDistribution: categoryStats,
        moodDistribution: moodStats,
        wordCountTrends,
        heatmapData,
      },
      'Journal analytics computed successfully.'
    )
  );
});
