import express from 'express';
import {
  getResources,
  getFeaturedResources,
  getResourceById,
  getResourcesByCategory,
} from '../controllers/resource.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Apply authentication shield to all resource logs
router.use(protect);

router.get('/', getResources);
router.get('/featured', getFeaturedResources);
router.get('/category/:category', getResourcesByCategory);
router.get('/:id', getResourceById);

export default router;
