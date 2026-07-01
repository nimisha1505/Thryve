import mongoose from 'mongoose';

const communityPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
      maxlength: [500, 'Content cannot exceed 500 characters'],
    },
    moodTag: {
      type: String,
      enum: ['Motivation', 'Anxiety', 'Stress', 'Success Stories'],
      required: [true, 'Mood tag is required'],
    },
    anonymousName: {
      type: String,
      required: true,
      trim: true,
    },
    supportCount: {
      type: Number,
      default: 0,
    },
    hugCount: {
      type: Number,
      default: 0,
    },
    stayStrongCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast querying
communityPostSchema.index({ createdAt: -1 });
communityPostSchema.index({ moodTag: 1 });

const CommunityPost = mongoose.model('CommunityPost', communityPostSchema);

export default CommunityPost;
