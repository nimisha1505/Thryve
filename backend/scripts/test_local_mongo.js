import mongoose from 'mongoose';

const test = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/thryve', {
      serverSelectionTimeoutMS: 2000
    });
    console.log('Connected to local MongoDB!');
    await mongoose.connection.close();
  } catch (err) {
    console.error('Local MongoDB failed:', err.message);
  }
};
test();
