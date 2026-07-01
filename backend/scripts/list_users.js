import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../src/models/user.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, '../.env'),
});

const listUsers = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in the environment.');
    }

    await mongoose.connect(mongoURI);

    // Find all users (excluding sensitive password hashes)
    const users = await User.find({}).select('name email role isSuspended createdAt');

    console.log('\n=== REGISTERED THRYVE USERS ===');
    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Suspended: ${user.isSuspended}`);
        console.log(`   Created At: ${user.createdAt}`);
        console.log('------------------------------');
      });
    }
    console.log('===============================\n');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Failed to list users:', error.message);
    process.exit(1);
  }
};

listUsers();
