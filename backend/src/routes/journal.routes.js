import express from 'express';
import {
  createJournalEntry,
  getUserJournalEntries,
  getJournalEntryById,
  updateJournalEntry,
  deleteJournalEntry,
  togglePinJournal,
  getJournalStats,
  getJournalAnalytics,
} from '../controllers/journal.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate, createJournalSchema, updateJournalSchema } from '../middlewares/validator.middleware.js';

const router = express.Router();

// Apply authentication middleware to protect all journal actions
router.use(protect);

router.post('/', validate(createJournalSchema), createJournalEntry);
router.get('/', getUserJournalEntries);
router.get('/stats', getJournalStats);
router.get('/analytics', getJournalAnalytics);
router.get('/:id', getJournalEntryById);
router.put('/:id', validate(updateJournalSchema), updateJournalEntry);
router.delete('/:id', deleteJournalEntry);
router.patch('/:id/pin', togglePinJournal);

export default router;
