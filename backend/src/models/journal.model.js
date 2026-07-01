import mongoose from 'mongoose';

const journalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Journal title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    content: {
      type: String,
      required: [true, 'Journal content is required'],
    },
    moodTag: {
      type: String,
      required: [true, 'Mood tag is required'],
    },
    category: {
      type: String,
      enum: {
        values: [
          'Personal',
          'Work',
          'Study',
          'Health',
          'Relationships',
          'Gratitude',
          'Other',
        ],
        message: '{VALUE} is not a valid category',
      },
      default: 'Personal',
      required: [true, 'Category is required'],
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    aiSummary: {
      type: String,
      default: '',
    },
    sentimentScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for pagination, sorting by creation date, and pin prioritizations
journalSchema.index({ userId: 1, createdAt: -1 });
journalSchema.index({ userId: 1, isPinned: -1 });

const Journal = mongoose.model('Journal', journalSchema);

export default Journal;
