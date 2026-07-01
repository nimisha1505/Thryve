import express from 'express';
import {
  createHabit,
  getHabits,
  getHabitById,
  updateHabit,
  deleteHabit,
  toggleHabitCompletion,
  getHabitAnalytics,
  getHabitMoodCorrelation,
  getSmartHabitSuggestions,
} from '../controllers/habit.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate, createHabitSchema, updateHabitSchema } from '../middlewares/validator.middleware.js';

const router = express.Router();

// Apply authentication shield to all habit entries
router.use(protect);

router.post('/', validate(createHabitSchema), createHabit);
router.get('/', getHabits);
router.get('/analytics', getHabitAnalytics);
router.get('/correlation', getHabitMoodCorrelation);
router.get('/suggestions', getSmartHabitSuggestions);
router.get('/:id', getHabitById);
router.put('/:id', validate(updateHabitSchema), updateHabit);
router.delete('/:id', deleteHabit);
router.post('/:id/toggle', toggleHabitCompletion);

export default router;
