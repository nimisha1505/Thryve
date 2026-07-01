import { z } from 'zod';
import { ApiError } from '../utils/ApiError.js';

export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please enter a valid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters'),
  avatarUrl: z.string().url('Invalid avatar URL format').optional().or(z.literal('')),
  bio: z.string().max(300, 'Bio cannot exceed 300 characters').optional().or(z.literal('')),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please enter a valid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

export const createMoodSchema = z.object({
  moodScore: z
    .number({ required_error: 'Mood score is required' })
    .min(1, 'Mood score must be at least 1')
    .max(10, 'Mood score cannot exceed 10'),
  moodTags: z
    .array(z.string(), { required_error: 'Mood tags are required' })
    .min(1, 'At least one mood tag is required'),
  notes: z
    .string()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
  loggedAt: z
    .string()
    .optional()
    .or(z.literal('')),
});

export const updateMoodSchema = z.object({
  moodScore: z
    .number()
    .min(1, 'Mood score must be at least 1')
    .max(10, 'Mood score cannot exceed 10')
    .optional(),
  moodTags: z
    .array(z.string())
    .min(1, 'At least one mood tag is required')
    .optional(),
  notes: z
    .string()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
  loggedAt: z
    .string()
    .optional()
    .or(z.literal('')),
});

export const createJournalSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(1, 'Title is required')
    .max(100, 'Title cannot exceed 100 characters'),
  content: z
    .string({ required_error: 'Content is required' })
    .min(1, 'Content is required'),
  moodTag: z
    .string({ required_error: 'Mood tag is required' })
    .min(1, 'Mood tag is required'),
  category: z
    .enum(['Personal', 'Work', 'Study', 'Health', 'Relationships', 'Gratitude', 'Other'])
    .optional(),
  isPinned: z
    .boolean()
    .optional(),
});

export const updateJournalSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(100, 'Title cannot exceed 100 characters')
    .optional(),
  content: z
    .string()
    .min(1, 'Content is required')
    .optional(),
  moodTag: z
    .string()
    .min(1, 'Mood tag is required')
    .optional(),
  category: z
    .enum(['Personal', 'Work', 'Study', 'Health', 'Relationships', 'Gratitude', 'Other'])
    .optional(),
  isPinned: z
    .boolean()
    .optional(),
});

export const chatMessageSchema = z.object({
  message: z
    .string({ required_error: 'Message is required' })
    .min(1, 'Message must be at least 1 character')
    .max(2000, 'Message cannot exceed 2000 characters'),
});

export const createHabitSchema = z.object({
  name: z
    .string({ required_error: 'Habit name is required' })
    .trim()
    .min(1, 'Habit name must be at least 1 character')
    .max(100, 'Habit name cannot exceed 100 characters'),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
  frequency: z
    .enum(['daily', 'weekly', 'monthly', 'custom'], { required_error: 'Frequency is required' }),
  customDetails: z
    .string()
    .max(100, 'Custom details cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
});

export const updateHabitSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Habit name must be at least 1 character')
    .max(100, 'Habit name cannot exceed 100 characters')
    .optional(),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
  frequency: z
    .enum(['daily', 'weekly', 'monthly', 'custom'])
    .optional(),
  customDetails: z
    .string()
    .max(100, 'Custom details cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
  isArchived: z
    .boolean()
    .optional(),
});

export const validate = (schema) => async (req, res, next) => {
  try {
    req.body = await schema.parseAsync(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return next(new ApiError(400, 'Validation failed', formattedErrors));
    }
    next(error);
  }
};
