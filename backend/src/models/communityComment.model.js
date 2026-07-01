import mongoose from 'mongoose';

const communityCommentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityPost',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [300, 'Comment content cannot exceed 300 characters'],
    },
    anonymousName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index to find comments for a post quickly
communityCommentSchema.index({ postId: 1, createdAt: 1 });

const CommunityComment = mongoose.model('CommunityComment', communityCommentSchema);

export default CommunityComment;
