import express from 'express';
import {
  createMoodLog,
  getUserMoodLogs,
  getMoodLogById,
  updateMoodLog,
  deleteMoodLog,
  getMoodStats,
  getMoodTrends,
} from '../controllers/mood.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate, createMoodSchema, updateMoodSchema } from '../middlewares/validator.middleware.js';

const router = express.Router();

// Apply authentication shield to all mood entries
router.use(protect);

router.post('/', validate(createMoodSchema), createMoodLog);
router.get('/', getUserMoodLogs);
router.get('/stats', getMoodStats);
router.get('/trends', getMoodTrends);
router.get('/:id', getMoodLogById);
router.put('/:id', validate(updateMoodSchema), updateMoodLog);
router.delete('/:id', deleteMoodLog);

export default router;
