import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import userRouter from './routes/user.routes.js';
import moodRouter from './routes/mood.routes.js';
import journalRouter from './routes/journal.routes.js';
import chatRouter from './routes/chat.routes.js';
import insightsRouter from './routes/insights.routes.js';
import habitRouter from './routes/habit.routes.js';
import resourceRouter from './routes/resource.routes.js';
import communityRouter from './routes/community.routes.js';

// express application instance
const app = express();

// Set HTTP headers for application security
app.use(helmet());

// Enable CORS configuration (support Vite local port shifts)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin === process.env.CLIENT_ORIGIN) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy mismatch'), false);
    },
    credentials: true,
  })
);

// Parse incoming requests containing JSON payloads
app.use(express.json());

// Parse cookies header for secure HTTP-only session tokens
app.use(cookieParser());

// Enable HTTP request logs for developer diagnostic visibility
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Implement basic Global API rate limiting
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 mins
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100, // Max 100 per window
  message: {
    status: 429,
    message: 'Too many requests from this IP address. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

// Register API Route Groups
app.use('/api/v1/auth', userRouter);
app.use('/api/v1/moods', moodRouter);
app.use('/api/v1/journals', journalRouter);
app.use('/api/v1/chat', chatRouter);
app.use('/api/v1/insights', insightsRouter);
app.use('/api/v1/habits', habitRouter);
app.use('/api/v1/resources', resourceRouter);
app.use('/api/v1/community', communityRouter);

// Health check endpoint verifying basic app activity
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// Catch-all route handler for non-existent API paths
app.use('*', (req, res, next) => {
  const err = new Error(`Cannot find requested route ${req.originalUrl}`);
  err.status = 404;
  next(err);
});

// Centralized Global Error Handler Middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error Handler] Details: ${err.stack}`);

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    errors: err.errors || [],
    // Avoid leaking stack trace details in production environment
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

export default app;
