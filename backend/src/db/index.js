import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is not defined.');
    }

    const connectionInstance = await mongoose.connect(mongoURI, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`\nMongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);

    // Gracefully close connection if Node process terminates
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination.');
      process.exit(0);
    });

  } catch (error) {
    console.log('MONGODB connection FAILED ', error.message);
    process.exit(1);
  }
};

export default connectDB;
