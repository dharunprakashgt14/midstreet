/**
 * Order Model
 * 
 * Represents a customer order.
 * Orders contain items with locked prices, table number, status, and total.
 */

import mongoose from 'mongoose';

// Schema for order items (nested document)
const orderItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  menuItemId: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false }); // Don't create separate _id for nested items

// Schema for order batch (nested document)
const batchSchema = new mongoose.Schema({
  batchId: {
    type: String,
    required: true,
    trim: true
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: function(items) {
        return items && items.length > 0;
      },
      message: 'Batch must contain at least one item'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'served', 'paid', 'completed'],
    default: 'pending'
  },
  total: {
    type: Number,
    required: true,
    min: 0
  }
}, { 
  _id: false,
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

const orderSchema = new mongoose.Schema({
  // Table number (1-9)
  tableNo: {
    type: String,
    required: [true, 'Table number is required'],
    trim: true
  },
  
  // Array of batches - each batch is independent
  batches: {
    type: [batchSchema],
    required: [true, 'Order must contain at least one batch'],
    validate: {
      validator: function(batches) {
        return batches && batches.length > 0;
      },
      message: 'Order must contain at least one batch'
    }
  },
  
  // Total order amount (sum of all batches)
  total: {
    type: Number,
    required: [true, 'Total is required'],
    min: [0, 'Total cannot be negative']
  },
  
  // Overall order status (derived from batches)
  status: {
    type: String,
    enum: ['pending', 'preparing', 'served', 'paid', 'completed'],
    default: 'pending'
  },
  
  // Bill number (for printing/reference)
  billNumber: {
    type: String,
    trim: true
  },
  
  // Completion flag - true when order is COMPLETED (admin closure), false otherwise
  // SERVED orders have isCompleted = false (still in Live Orders)
  // Only COMPLETED orders have isCompleted = true (moved to Completed Orders)
  isCompleted: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Timestamp when order was served (status = SERVED)
  servedAt: {
    type: Date,
    default: undefined
  },
  
  // Timestamp when order was completed (admin-only closure, isCompleted = true)
  completedAt: {
    type: Date,
    default: undefined
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Create indexes for faster queries
orderSchema.index({ tableNo: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ tableNo: 1, isCompleted: 1 }); // Composite index for active order queries
orderSchema.index({ isCompleted: 1 }); // Index for Completed Orders queries

// Export the model
export const Order = mongoose.model('Order', orderSchema);


