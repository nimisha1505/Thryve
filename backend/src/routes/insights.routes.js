import express from 'express';
import {
  getInsightsSummary,
  getInsightsPatterns,
  getInsightsRecommendations,
} from '../controllers/insights.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Apply authentication guards
router.use(protect);

router.get('/summary', getInsightsSummary);
router.get('/patterns', getInsightsPatterns);
router.get('/recommendations', getInsightsRecommendations);

export default router;
