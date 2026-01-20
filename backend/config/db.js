/**
 * Database Configuration
 * 
 * This file handles the MongoDB Atlas connection.
 * Make sure to set MONGODB_URI in your .env file.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Connects to MongoDB Atlas database
 * This function is called when the server starts
 */
export const connectDB = async () => {
  try {
    // Get connection string from environment variables
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    // Connect to MongoDB Atlas
    const conn = await mongoose.connect(mongoURI);
    
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('1. Check your MONGODB_URI in .env file');
    console.error('2. Make sure your IP is whitelisted in MongoDB Atlas');
    console.error('3. Verify your username and password are correct');
    console.error('4. Check your internet connection');
    process.exit(1); // Exit the process if database connection fails
  }
};






