/**
 * MenuItem Model
 * 
 * Represents a menu item in the restaurant.
 * Each item has a category, name, price, and availability status.
 */

import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  // Category ID (e.g., "pizza", "burger", "momos")
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  
  // Item name (e.g., "Margherita Pizza")
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  
  // Item price in rupees
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  
  // Whether the item is currently available
  isAvailable: {
    type: Boolean,
    default: true
  },
  
  // Optional: Item description
  description: {
    type: String,
    default: '',
    trim: true
  },
  
  // Optional: Item ID (for frontend compatibility)
  itemId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  
  // Optional: Tag (e.g., "Signature", "Chef's pick", "New")
  tag: {
    type: String,
    enum: ["Signature", "Chef's pick", "New"],
    default: undefined
  },
  
  // Optional: Image URL for the menu item
  imageUrl: {
    type: String,
    default: undefined,
    trim: true
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
  collection: 'menuitems' // Explicitly bind to 'menuitems' collection
});

// Create index for faster queries
menuItemSchema.index({ category: 1 });
menuItemSchema.index({ isAvailable: 1 });
menuItemSchema.index({ itemId: 1 }); // Index itemId for faster lookups

// Export the model
export const MenuItem = mongoose.model('MenuItem', menuItemSchema);






