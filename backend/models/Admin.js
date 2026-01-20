/**
 * Admin Model
 * 
 * Represents an admin user who can manage orders and view summaries.
 * Passwords are hashed using bcrypt for security.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const adminSchema = new mongoose.Schema({
  // Admin username (unique)
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  
  // Hashed password (never store plain text passwords!)
  passwordHash: {
    type: String,
    required: [true, 'Password is required']
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

/**
 * Method to compare a plain password with the hashed password
 * Used during login
 */
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Export the model
export const Admin = mongoose.model('Admin', adminSchema);






