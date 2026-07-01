import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Habit name is required'],
      trim: true,
      maxlength: [100, 'Habit name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    frequency: {
      type: String,
      enum: {
        values: ['daily', 'weekly', 'monthly', 'custom'],
        message: '{VALUE} is not a valid frequency',
      },
      required: [true, 'Frequency is required'],
      default: 'daily',
    },
    customDetails: {
      type: String,
      maxlength: [100, 'Custom details cannot exceed 100 characters'],
      default: '',
    },
    completedDates: {
      type: [String], // Array of 'YYYY-MM-DD' local date strings
      default: [],
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for user's habits sorting and listing
habitSchema.index({ userId: 1, isArchived: 1 });
habitSchema.index({ userId: 1, name: 1 });

const Habit = mongoose.model('Habit', habitSchema);

export default Habit;
