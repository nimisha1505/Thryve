import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { moderateContent } from '../middlewares/moderation.middleware.js';
import {
  createPost,
  getFeed,
  getSinglePost,
  createComment,
  reactPost,
  unreactPost,
  getTrendingPosts
} from '../controllers/community.controller.js';

const router = Router();

// Secure all endpoints with authentication middleware
router.use(protect);

router.route('/')
  .post(moderateContent, createPost)
  .get(getFeed);

router.route('/trending')
  .get(getTrendingPosts);

router.route('/:id')
  .get(getSinglePost);

router.route('/:id/comment')
  .post(moderateContent, createComment);

router.route('/:id/reaction')
  .post(reactPost)
  .delete(unreactPost);

export default router;
