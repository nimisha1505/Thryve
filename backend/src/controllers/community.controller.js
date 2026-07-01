import mongoose from 'mongoose';
import CommunityPost from '../models/communityPost.model.js';
import CommunityComment from '../models/communityComment.model.js';
import CommunityReaction from '../models/communityReaction.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Random Supportive Anonymous Display Name Generator
const adjectives = ['Brave', 'Calm', 'Hopeful', 'Gentle', 'Bright', 'Peaceful', 'Quiet', 'Serene', 'Mindful', 'Resilient'];
const nouns = ['Sparrow', 'Ocean', 'Moon', 'Forest', 'Sunrise', 'Star', 'River', 'Breeze', 'Meadow', 'Lotus'];

export const generateAnonymousName = () => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}`;
};

/**
 * Create a new anonymous post
 */
export const createPost = asyncHandler(async (req, res) => {
  const { title, content, moodTag } = req.body;

  if (!title || !content || !moodTag) {
    throw new ApiError(400, 'Title, content, and moodTag are required.');
  }

  const anonymousName = generateAnonymousName();

  const post = await CommunityPost.create({
    userId: req.user.userId,
    title,
    content,
    moodTag,
    anonymousName,
  });

  // Project userId out of the returned object to ensure anonymity
  const postData = post.toObject();
  delete postData.userId;

  return res.status(201).json(
    new ApiResponse(201, { post: postData }, 'Community post shared successfully.')
  );
});

/**
 * Fetch all posts (Chronological or Trending, with filters)
 */
export const getFeed = asyncHandler(async (req, res) => {
  const { moodTag, search, sort = 'latest' } = req.query;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Build match stage for aggregation pipeline
  const matchStage = {};
  if (moodTag && moodTag !== 'All') {
    matchStage.moodTag = moodTag;
  }
  if (search) {
    matchStage.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
    ];
  }

  // Build aggregation pipeline to support dynamic trending calculations
  const pipeline = [];
  if (Object.keys(matchStage).length > 0) {
    pipeline.push({ $match: matchStage });
  }

  // Calculate age and recentness boost for trending score
  pipeline.push(
    {
      $addFields: {
        ageInHours: {
          $divide: [
            { $subtract: [new Date(), "$createdAt"] },
            1000 * 60 * 60
          ]
        }
      }
    },
    {
      $addFields: {
        recentnessBoost: {
          $multiply: [
            {
              $max: [
                0,
                { $subtract: [24, "$ageInHours"] }
              ]
            },
            2
          ]
        }
      }
    },
    {
      $addFields: {
        totalReactions: {
          $add: ["$supportCount", "$hugCount", "$stayStrongCount"]
        }
      }
    },
    {
      $addFields: {
        trendingScore: {
          $add: [
            { $multiply: ["$totalReactions", 2] },
            { $multiply: ["$commentsCount", 3] },
            "$recentnessBoost"
          ]
        }
      }
    }
  );

  // Sorting
  if (sort === 'trending') {
    pipeline.push({ $sort: { trendingScore: -1, createdAt: -1 } });
  } else {
    pipeline.push({ $sort: { createdAt: -1 } });
  }

  // Pagination
  pipeline.push(
    { $skip: skip },
    { $limit: limit }
  );

  // Exclude sensitive user info
  pipeline.push({
    $project: {
      userId: 0,
      ageInHours: 0,
      recentnessBoost: 0,
      trendingScore: 0,
    }
  });

  const posts = await CommunityPost.aggregate(pipeline);

  // Fetch reaction status of these posts for the current user
  const postIds = posts.map(p => p._id);
  const userReactions = await CommunityReaction.find({
    userId: req.user.userId,
    postId: { $in: postIds }
  });

  const reactionsMap = {};
  userReactions.forEach(r => {
    const key = r.postId.toString();
    if (!reactionsMap[key]) {
      reactionsMap[key] = new Set();
    }
    reactionsMap[key].add(r.reactionType);
  });

  const postsWithReactions = posts.map(p => {
    const key = p._id.toString();
    const activeReactions = reactionsMap[key] || new Set();
    return {
      ...p,
      isSupported: activeReactions.has('support'),
      isHugged: activeReactions.has('hug'),
      isStayStronged: activeReactions.has('stayStrong')
    };
  });

  return res.status(200).json(
    new ApiResponse(200, { posts: postsWithReactions, page, limit }, 'Community feed retrieved successfully.')
  );
});

/**
 * Fetch a single post detail with its comments
 */
export const getSinglePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid post ID.');
  }

  const post = await CommunityPost.findById(id).select('-userId');
  if (!post) {
    throw new ApiError(404, 'Post not found.');
  }

  // Check if current user has reacted
  const reactions = await CommunityReaction.find({
    userId: req.user.userId,
    postId: id
  });
  const activeReactions = new Set(reactions.map(r => r.reactionType));

  const postObj = {
    ...post.toObject(),
    isSupported: activeReactions.has('support'),
    isHugged: activeReactions.has('hug'),
    isStayStronged: activeReactions.has('stayStrong')
  };

  // Fetch comments
  const comments = await CommunityComment.find({ postId: id })
    .select('-userId')
    .sort({ createdAt: 1 });

  return res.status(200).json(
    new ApiResponse(200, { post: postObj, comments }, 'Post details retrieved successfully.')
  );
});

/**
 * Add a comment to a post
 */
export const createComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, 'Comment content is required.');
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid post ID.');
  }

  const post = await CommunityPost.findById(id);
  if (!post) {
    throw new ApiError(404, 'Post not found.');
  }

  const anonymousName = generateAnonymousName();

  const comment = await CommunityComment.create({
    postId: id,
    userId: req.user.userId,
    content,
    anonymousName
  });

  // Increment commentsCount
  post.commentsCount += 1;
  await post.save();

  const commentData = comment.toObject();
  delete commentData.userId;

  return res.status(201).json(
    new ApiResponse(201, { comment: commentData }, 'Comment added successfully.')
  );
});

/**
 * Add a support reaction (Support, Hug, Stay Strong)
 */
export const reactPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reactionType } = req.body;

  if (!['support', 'hug', 'stayStrong'].includes(reactionType)) {
    throw new ApiError(400, "Invalid reaction type. Choose 'support', 'hug', or 'stayStrong'.");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid post ID.');
  }

  const post = await CommunityPost.findById(id);
  if (!post) {
    throw new ApiError(404, 'Post not found.');
  }

  // Check if reaction already exists
  const existingReaction = await CommunityReaction.findOne({
    postId: id,
    userId: req.user.userId,
    reactionType
  });

  if (existingReaction) {
    return res.status(200).json(
      new ApiResponse(200, {}, 'Reaction already recorded.')
    );
  }

  await CommunityReaction.create({
    postId: id,
    userId: req.user.userId,
    reactionType
  });

  // Increment specific count on post
  if (reactionType === 'support') post.supportCount += 1;
  if (reactionType === 'hug') post.hugCount += 1;
  if (reactionType === 'stayStrong') post.stayStrongCount += 1;
  await post.save();

  return res.status(200).json(
    new ApiResponse(200, {
      supportCount: post.supportCount,
      hugCount: post.hugCount,
      stayStrongCount: post.stayStrongCount
    }, 'Reaction recorded successfully.')
  );
});

/**
 * Remove a support reaction
 */
export const unreactPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reactionType } = req.body;

  if (!['support', 'hug', 'stayStrong'].includes(reactionType)) {
    throw new ApiError(400, "Invalid reaction type. Choose 'support', 'hug', or 'stayStrong'.");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid post ID.');
  }

  const post = await CommunityPost.findById(id);
  if (!post) {
    throw new ApiError(404, 'Post not found.');
  }

  const reaction = await CommunityReaction.findOneAndDelete({
    postId: id,
    userId: req.user.userId,
    reactionType
  });

  if (reaction) {
    // Decrement specific count, preventing negative numbers
    if (reactionType === 'support') post.supportCount = Math.max(0, post.supportCount - 1);
    if (reactionType === 'hug') post.hugCount = Math.max(0, post.hugCount - 1);
    if (reactionType === 'stayStrong') post.stayStrongCount = Math.max(0, post.stayStrongCount - 1);
    await post.save();
  }

  return res.status(200).json(
    new ApiResponse(200, {
      supportCount: post.supportCount,
      hugCount: post.hugCount,
      stayStrongCount: post.stayStrongCount
    }, 'Reaction removed successfully.')
  );
});

/**
 * Get trending posts for Dashboard preview
 */
export const getTrendingPosts = asyncHandler(async (req, res) => {
  const pipeline = [
    {
      $addFields: {
        ageInHours: {
          $divide: [
            { $subtract: [new Date(), "$createdAt"] },
            1000 * 60 * 60
          ]
        }
      }
    },
    {
      $addFields: {
        recentnessBoost: {
          $multiply: [
            {
              $max: [
                0,
                { $subtract: [24, "$ageInHours"] }
              ]
            },
            2
          ]
        }
      }
    },
    {
      $addFields: {
        totalReactions: {
          $add: ["$supportCount", "$hugCount", "$stayStrongCount"]
        }
      }
    },
    {
      $addFields: {
        trendingScore: {
          $add: [
            { $multiply: ["$totalReactions", 2] },
            { $multiply: ["$commentsCount", 3] },
            "$recentnessBoost"
          ]
        }
      }
    },
    {
      $sort: { trendingScore: -1, createdAt: -1 }
    },
    {
      $limit: 3 // Fetch top 3 latest trending posts
    },
    {
      $project: {
        userId: 0,
        ageInHours: 0,
        recentnessBoost: 0,
        trendingScore: 0,
      }
    }
  ];

  const posts = await CommunityPost.aggregate(pipeline);

  return res.status(200).json(
    new ApiResponse(200, { posts }, 'Trending community discussions retrieved successfully.')
  );
});
