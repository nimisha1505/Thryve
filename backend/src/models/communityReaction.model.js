import mongoose from 'mongoose';

const communityReactionSchema = new mongoose.Schema(
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
    reactionType: {
      type: String,
      enum: ['support', 'hug', 'stayStrong'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reactions of same type by same user on a post
communityReactionSchema.index({ postId: 1, userId: 1, reactionType: 1 }, { unique: true });

const CommunityReaction = mongoose.model('CommunityReaction', communityReactionSchema);

export default CommunityReaction;
