import 'dotenv/config'; // Load environment variables first before other imports execute
import connectDB from './db/index.js';
import app from './app.js';
import { seedDefaultResources } from './controllers/resource.controller.js';

const port = process.env.PORT || 5000;

// Catch synchronous exceptions before the application initializes
process.on('uncaughtException', (err) => {
  console.error(`CRITICAL UNCAUGHT EXCEPTION: ${err.message}\n${err.stack}`);
  console.log('Shutting down server instance due to uncaught exception...');
  process.exit(1);
});

connectDB()
  .then(() => {
    const server = app.listen(port, () => {
      console.log(`THRYVE backend server running in ${process.env.NODE_ENV} mode on port ${port}`);
    });
    
    // Seed default wellness materials
    seedDefaultResources().catch(err => {
      console.error('[Startup Seeding Error] Seeder failure:', err);
    });

    // Catch asynchronous promise rejections
    process.on('unhandledRejection', (err) => {
      console.error(`UNHANDLED PROMISE REJECTION: ${err.message}\n${err.stack}`);
      console.log('Initiating graceful server shutdown...');
      server.close(() => {
        process.exit(1);
      });
    });
  })
  .catch((err) => {
    console.error('MONGO db connection failed !!! ', err);
    process.exit(1);
  });
