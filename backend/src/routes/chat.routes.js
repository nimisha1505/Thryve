import express from 'express';
import {
  sendMessage,
  getChatHistory,
  clearChatHistory,
} from '../controllers/chat.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate, chatMessageSchema } from '../middlewares/validator.middleware.js';

const router = express.Router();

// Protect all chat routes
router.use(protect);

router.post('/', validate(chatMessageSchema), sendMessage);
router.get('/history', getChatHistory);
router.delete('/history', clearChatHistory);

export default router;
