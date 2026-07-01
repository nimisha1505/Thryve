import express from 'express';
import { register, login, logout, refresh, getMe } from '../controllers/user.controller.js';
import { validate, registerSchema, loginSchema } from '../middlewares/validator.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Publicly accessible endpoints
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);

// Protected endpoints (verify accessToken cookie validity)
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;
