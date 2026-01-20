/**
 * Admin Seed Script
 * 
 * Creates a default admin user for the system.
 * Run with: npm run seed:admin
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { Admin } from '../models/Admin.js';

// Load environment variables
dotenv.config();

/**
 * Seed the database with admin user
 */
const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB Atlas');

    // Default admin credentials
    const defaultUsername = 'admin';
    const defaultPassword = 'midstreet123';

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: defaultUsername });
    
    if (existingAdmin) {
      console.log(`⚠️  Admin user '${defaultUsername}' already exists`);
      console.log('💡 To reset admin, delete the existing admin first or use a different username');
      console.log(`📝 Current admin: ${existingAdmin.username}`);
    } else {
      // Create admin user
      console.log('👤 Creating admin user...');
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      
      const admin = await Admin.create({
        username: defaultUsername,
        passwordHash: hashedPassword
      });
      
      console.log(`✅ Admin user created successfully!`);
      console.log(`\n📋 Login Credentials:`);
      console.log(`   Username: ${admin.username}`);
      console.log(`   Password: ${defaultPassword}`);
      console.log(`\n⚠️  IMPORTANT: Change this password after first login!`);
    }

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    
    if (error.code === 11000) {
      console.error('⚠️  Admin user already exists with this username');
    }
    
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seed function
seedAdmin();





