import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Resource description is required'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'Nature Sounds',
          'Breathing Exercises',
          'Meditation',
          'Daily Affirmations',
          'Motivation',
          'Sleep Improvement',
          'Stress Relief',
        ],
        message: '{VALUE} is not a valid category',
      },
    },
    type: {
      type: String,
      required: [true, 'Resource type is required'],
      enum: {
        values: ['audio', 'quote', 'exercise', 'article'],
        message: '{VALUE} is not a valid type',
      },
    },
    content: {
      type: String,
      default: '',
    },
    audioUrl: {
      type: String,
      default: '',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for category filter and featured lists
resourceSchema.index({ category: 1 });
resourceSchema.index({ isFeatured: 1 });

const Resource = mongoose.model('Resource', resourceSchema);

export default Resource;
