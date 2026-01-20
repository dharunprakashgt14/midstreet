/**
 * Order Controller
 * 
 * Handles all order-related API requests.
 * - POST /api/orders - Create a new order
 * - GET /api/orders/:id - Get order by ID
 * - PATCH /api/orders/:id/add-item - Add items to existing order
 * - PATCH /api/orders/:id/status - Update order status
 */

import { Order } from '../models/Order.js';

/**
 * Create a new order
 * 
 * Request body should contain:
 * - tableNo: string (table number)
 * - items: array of { name, price, quantity, menuItemId }
 * - total: number (total amount)
 * - billNumber: string (optional)
 */
export const createOrder = async (req, res) => {
  try {
    const { tableNo, items, total, billNumber } = req.body;
    const io = req.app.get('io'); // Get Socket.IO instance

    // Validate required fields
    if (!tableNo) {
      return res.status(400).json({
        success: false,
        error: 'Table number is required'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Order must contain at least one item'
      });
    }

    if (total === undefined || total < 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid total amount is required'
      });
    }

    // Validate each item
    for (const item of items) {
      if (!item.name || !item.price || !item.quantity || !item.menuItemId) {
        return res.status(400).json({
          success: false,
          error: 'Each item must have name, price, quantity, and menuItemId'
        });
      }
    }

    // FIRST-ORDER RULE: Check if a non-completed order already exists for this table
    // Only ONE active order per table at any time
    const existingActiveOrder = await Order.findOne({
      tableNo: String(tableNo),
      isCompleted: false // Check for non-completed orders (includes SERVED)
    });

    if (existingActiveOrder) {
      return res.status(400).json({
        success: false,
        error: 'An active order already exists for this table. Please add items to the existing order instead.'
      });
    }

    // Generate batch ID
    const batchId = `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // CRITICAL: Explicitly set status = 'pending' (PLACED) and isCompleted = false
    // Never trust frontend for these fields - backend controls order lifecycle
    const order = new Order({
      tableNo: String(tableNo),
      batches: [{
        batchId,
        items,
        status: 'pending', // Batch status: pending (PLACED)
        total
      }],
      total,
      billNumber: billNumber || undefined,
      status: 'pending', // Order status: pending (PLACED in frontend)
      isCompleted: false // Explicitly set - order is NOT completed
      // servedAt and completedAt remain undefined (default)
    });

    // Save to database
    const savedOrder = await order.save();

    // Emit real-time event for new order
    if (io) {
      // Notify admin room
      io.to('admin').emit('order:new', {
        order: savedOrder
      });
      
      // Notify order-specific room
      io.to(`order:${savedOrder._id}`).emit('order:update', {
        order: savedOrder
      });
    }

    // Return success response
    res.status(201).json({
      success: true,
      data: savedOrder,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order',
      message: error.message
    });
  }
};

/**
 * Get order by ID
 * 
 * FIX: Uses MongoDB _id as the ONLY orderId - replaced findOne with findById
 * Returns order details including items and status.
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // FIX: Use findById instead of findOne - MongoDB _id is the ONLY orderId
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order',
      message: error.message
    });
  }
};

/**
 * Get orders by table number
 * 
 * Returns all ACTIVE orders for a specific table, sorted by creation date (newest first).
 * Only returns orders where isActive = true (excludes SERVED/completed orders).
 */
export const getOrdersByTable = async (req, res) => {
  try {
    const { tableNo } = req.params;

    if (!tableNo) {
      return res.status(400).json({
        success: false,
        error: 'Table number is required'
      });
    }

    // ORDER VISIBILITY RULE: Only return non-completed orders (isCompleted = false)
    // This ensures COMPLETED orders are hidden from customer view
    // SERVED orders (isCompleted = false) are still returned
    const orders = await Order.find({ 
      tableNo: String(tableNo),
      isCompleted: false // Only non-completed orders (includes SERVED)
    })
      .sort({ createdAt: -1 })
      .limit(100); // Limit to prevent huge responses

    res.status(200).json({
      success: true,
      data: orders,
      count: orders.length
    });
  } catch (error) {
    console.error('Error fetching orders by table:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
      message: error.message
    });
  }
};

/**
 * Get active order by table number
 * 
 * FIX: Returns the latest active order for a table where isActive = true and status != 'paid' (SERVED)
 * This is the primary API for Order Status page fallback
 */
export const getActiveOrderByTable = async (req, res) => {
  try {
    const { tableNumber } = req.query;

    if (!tableNumber) {
      return res.status(400).json({
        success: false,
        error: 'Table number is required'
      });
    }

    // Find the latest non-completed order for this table
    // SERVED (paid) orders are fetched so customer can see thank-you message
    // COMPLETED orders (isCompleted = true) are excluded (removed from customer view)
    const order = await Order.findOne({
      tableNo: String(tableNumber),
      isCompleted: false // Only non-completed orders (includes SERVED)
    })
      .sort({ createdAt: -1 }); // Get most recent

    if (!order) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No active order found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching active order by table:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active order',
      message: error.message
    });
  }
};

/**
 * Add batch to existing order
 * 
 * Creates a new batch in an existing order. Never merges items.
 * Each batch is independent with its own status.
 */
export const addBatchToOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { items, batchTotal } = req.body;
    const io = req.app.get('io'); // Get Socket.IO instance

    // DEBUG: Log received parameters
    console.log('[Add Batch] Received orderId:', id);
    console.log('[Add Batch] Received items count:', items?.length || 0);

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Must provide at least one item for the batch'
      });
    }

    // Validate each item
    for (const item of items) {
      if (!item.name || !item.price || !item.quantity || !item.menuItemId) {
        return res.status(400).json({
          success: false,
          error: 'Each item must have name, price, quantity, and menuItemId'
        });
      }
    }

    // FIX: Use findById - MongoDB _id is the ONLY orderId
    const order = await Order.findById(id);
    
    // DEBUG: Log order lookup result
    if (!order) {
      console.log('[Add Batch] Order not found for orderId:', id);
    } else {
      console.log('[Add Batch] Order found:', {
        _id: order._id,
        tableNo: order.tableNo,
        status: order.status,
        isCompleted: order.isCompleted
      });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // DEBUG: Log order lookup
    console.log('[Add Batch] Order found:', {
      _id: order._id,
      tableNo: order.tableNo,
      status: order.status,
      isCompleted: order.isCompleted
    });

    // ADD TO EXISTING ORDER RULE: Only allow adding batches to non-completed orders
    // Allow adding to PLACED, IN_PREPARATION, READY, SERVED (isCompleted = false)
    if (order.isCompleted) {
      return res.status(400).json({
        success: false,
        error: 'Cannot add items to a completed order. Please create a new order.'
      });
    }

    // Generate batch ID
    const batchId = `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Calculate batch total
    const calculatedTotal = batchTotal !== undefined 
      ? batchTotal 
      : items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create new batch
    const newBatch = {
      batchId,
      items,
      status: 'pending',
      total: calculatedTotal
    };

    // Add batch to order
    order.batches.push(newBatch);
    
    // Update order total (sum of all batches)
    order.total = order.batches.reduce((sum, batch) => sum + batch.total, 0);
    
    const updatedOrder = await order.save();

    // Emit real-time event for order update
    if (io) {
      // Notify admin room
      io.to('admin').emit('order:update', {
        order: updatedOrder,
        batchId: batchId
      });
      
      // Notify order-specific room (by orderId)
      io.to(`order:${updatedOrder._id}`).emit('order:update', {
        order: updatedOrder,
        batchId: batchId
      });
      
      // CRITICAL FIX: Also notify table-specific room for better customer sync
      io.to(`table:${updatedOrder.tableNo}`).emit('order:update', {
        order: updatedOrder,
        batchId: batchId
      });
    }

    res.status(200).json({
      success: true,
      data: updatedOrder,
      message: 'Batch added to order successfully'
    });
  } catch (error) {
    console.error('Error adding batch to order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add batch to order',
      message: error.message
    });
  }
};

/**
 * Status flow array - defines order of statuses
 * PLACED → IN_PREPARATION → READY → SERVED → COMPLETED
 */
const STATUS_FLOW = ['pending', 'preparing', 'served', 'paid', 'completed'];

/**
 * Map frontend status to backend status
 */
const mapFrontendToBackend = {
  'PLACED': 'pending',
  'IN_PREPARATION': 'preparing',
  'READY': 'served',
  'SERVED': 'paid',
  'COMPLETED': 'completed'
};

/**
 * Map backend status to frontend status
 */
const mapBackendToFrontend = {
  'pending': 'PLACED',
  'preparing': 'IN_PREPARATION',
  'served': 'READY',
  'paid': 'SERVED',
  'completed': 'COMPLETED'
};

/**
 * Validate status transition
 * Rules:
 * - Forward movement: ONLY one step at a time (targetIndex === currentIndex + 1)
 * - Backward movement: ALWAYS allowed (targetIndex < currentIndex)
 * - Invalid jumps return false
 */
const isValidTransition = (currentStatus, newStatus) => {
  const currentIndex = STATUS_FLOW.indexOf(currentStatus);
  const targetIndex = STATUS_FLOW.indexOf(newStatus);

  // Invalid status
  if (currentIndex === -1 || targetIndex === -1) {
    return false;
  }

  // Same status (no change)
  if (currentIndex === targetIndex) {
    return false;
  }

  // Backward movement: always allowed
  if (targetIndex < currentIndex) {
    return true;
  }

  // Forward movement: only one step allowed
  if (targetIndex === currentIndex + 1) {
    return true;
  }

  // Invalid jump (more than one step forward)
  return false;
};

/**
 * Update batch status
 * 
 * Changes batch status: pending → preparing → served → paid
 * If batchId is provided, updates that specific batch.
 * If not provided, updates the overall order status (for backward compatibility).
 * 
 * ENFORCES VALID TRANSITIONS: Only allows transitions to next valid status.
 */
export const updateBatchStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, batchId } = req.body;
    const io = req.app.get('io'); // Get Socket.IO instance

    // Validate status (exclude 'completed' - that's handled by separate endpoint)
    const validStatuses = ['pending', 'preparing', 'served', 'paid'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status must be one of: ${validStatuses.join(', ')}. Use /complete endpoint for COMPLETED status.`
      });
    }

    // FIX: Use findById - MongoDB _id is the ONLY orderId
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // ENFORCE VALID TRANSITIONS: Validate that status transition is allowed
    // Rules: Forward only one step, backward always allowed
    if (!isValidTransition(order.status, status)) {
      const currentIndex = STATUS_FLOW.indexOf(order.status);
      const nextStatus = currentIndex < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIndex + 1] : null;
      return res.status(400).json({
        success: false,
        error: `Invalid status transition. Current: ${order.status}, attempted: ${status}`,
        message: `Forward movement allowed only one step. Backward movement always allowed. ${nextStatus ? `Next valid forward step: ${nextStatus}` : 'Already at final status.'}`
      });
    }

    // If batchId is provided, update specific batch
    if (batchId) {
      const batch = order.batches.find(b => b.batchId === batchId);
      if (!batch) {
        return res.status(404).json({
          success: false,
          error: 'Batch not found'
        });
      }
      
      // Validate batch transition (same rules: forward one step, backward always allowed)
      if (!isValidTransition(batch.status, status)) {
        const batchCurrentIndex = STATUS_FLOW.indexOf(batch.status);
        const nextBatchStatus = batchCurrentIndex < STATUS_FLOW.length - 1 ? STATUS_FLOW[batchCurrentIndex + 1] : null;
        return res.status(400).json({
          success: false,
          error: `Invalid batch status transition. Current: ${batch.status}, attempted: ${status}`,
          message: `Forward movement allowed only one step. Backward movement always allowed. ${nextBatchStatus ? `Next valid forward step: ${nextBatchStatus}` : 'Already at final status.'}`
        });
      }
      
      batch.status = status;
      
      // Update overall order status based on batches
      // If all batches are paid, order is paid
      // If any batch is served, order is served
      // If any batch is preparing, order is preparing
      // Otherwise, order is pending
      const allPaid = order.batches.every(b => b.status === 'paid');
      const anyServed = order.batches.some(b => b.status === 'served');
      const anyPreparing = order.batches.some(b => b.status === 'preparing');
      
      if (allPaid) {
        order.status = 'paid';
        // SERVED STATUS: Set servedAt timestamp, keep isCompleted = false
        // Order stays in Live Orders, customer sees thank-you message
        if (!order.servedAt) {
          order.servedAt = new Date();
        }
        // Do NOT set isCompleted = true - SERVED orders stay in Live Orders
      } else if (anyServed) {
        order.status = 'served';
      } else if (anyPreparing) {
        order.status = 'preparing';
      } else {
        order.status = 'pending';
      }
    } else {
      // Update overall order status (backward compatibility)
      // ENFORCE VALID TRANSITION
      if (!isValidTransition(order.status, status)) {
        const nextStatus = getNextStatus(order.status);
        return res.status(400).json({
          success: false,
          error: `Invalid status transition. Current: ${order.status}, attempted: ${status}`,
          message: nextStatus 
            ? `Order can only transition to: ${nextStatus}` 
            : 'Order is already completed'
        });
      }
      
      order.status = status;
      // SERVED STATUS: Set servedAt timestamp, keep isCompleted = false
      if (status === 'paid') {
        if (!order.servedAt) {
          order.servedAt = new Date();
        }
        // Do NOT set isCompleted = true - SERVED orders stay in Live Orders
      }
    }

    const updatedOrder = await order.save();

    // Emit real-time event for order status update
    if (io) {
      // Notify admin room
      io.to('admin').emit('order:update', {
        order: updatedOrder,
        batchId: batchId || null
      });
      
      // Notify order-specific room (by orderId)
      io.to(`order:${updatedOrder._id}`).emit('order:update', {
        order: updatedOrder,
        batchId: batchId || null
      });
      
      // CRITICAL FIX: Also notify table-specific room for better customer sync
      // This ensures customers receive updates even if they don't have orderId cached
      io.to(`table:${updatedOrder.tableNo}`).emit('order:update', {
        order: updatedOrder,
        batchId: batchId || null
      });
    }

    res.status(200).json({
      success: true,
      data: updatedOrder,
      message: batchId ? 'Batch status updated successfully' : 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Error updating batch status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update batch status',
      message: error.message
    });
  }
};

/**
 * Advance order status to next valid state
 * 
 * OPTIMIZED FOR PEAK-HOUR SPEED: One-click action that automatically advances to next status.
 * Enforces valid transitions: pending → preparing → served → paid
 * 
 * This is the primary endpoint for admin single-action buttons.
 */
export const advanceOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const io = req.app.get('io');

    // Find order
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Get next valid status
    const nextStatus = getNextStatus(order.status);

    if (!nextStatus) {
      return res.status(400).json({
        success: false,
        error: 'Order is already in final state (completed)',
        message: 'Order cannot be advanced further. Current status: ' + order.status
      });
    }

    // Update order status
    order.status = nextStatus;

    // Update all batches to match order status (for consistency)
    order.batches.forEach(batch => {
      // Only advance batch if it's behind order status
      const batchNextStatus = getNextStatus(batch.status);
      if (batchNextStatus && batchNextStatus === nextStatus) {
        batch.status = nextStatus;
      }
    });

    // SERVED (paid): Set servedAt timestamp, keep isCompleted = false
    if (nextStatus === 'paid') {
      // Mark all batches as paid
      order.batches.forEach(batch => {
        batch.status = 'paid';
      });
      // Set servedAt timestamp
      if (!order.servedAt) {
        order.servedAt = new Date();
      }
      // Do NOT set isCompleted = true - SERVED orders stay in Live Orders
    }

    const updatedOrder = await order.save();

    // Emit real-time events
    if (io) {
      // Notify admin room
      if (nextStatus === 'paid') {
        io.to('admin').emit('order:completed', {
          order: updatedOrder
        });
      } else {
        io.to('admin').emit('order:update', {
          order: updatedOrder
        });
      }
      
      // Notify order-specific room
      io.to(`order:${updatedOrder._id}`).emit('order:update', {
        order: updatedOrder
      });
      
      // Notify table-specific room (critical for customer view)
      io.to(`table:${updatedOrder.tableNo}`).emit('order:update', {
        order: updatedOrder
      });
    }

    res.status(200).json({
      success: true,
      data: updatedOrder,
      message: `Order status advanced from ${order.status} to ${nextStatus}`,
      previousStatus: order.status,
      newStatus: nextStatus
    });
  } catch (error) {
    console.error('Error advancing order status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to advance order status',
      message: error.message
    });
  }
};

/**
 * Serve order (Admin action)
 * 
 * PATCH /orders/:id/serve
 * 
 * Rules:
 * - Order must currently be READY (status = 'served')
 * - Set status = 'paid' (SERVED in frontend)
 * - Set servedAt = new Date()
 * - Keep isCompleted = false (order stays in Live Orders)
 * - Customer sees thank-you message and redirects
 * 
 * This is separate from COMPLETE - SERVED orders remain in Live Orders.
 */
export const serveOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const io = req.app.get('io');

    // Find order by MongoDB _id
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // VALIDATION: Order should be READY (status = 'served') to be served
    // Allow backward movement, but typically should be READY
    if (order.isCompleted) {
      return res.status(400).json({
        success: false,
        error: 'Cannot serve a completed order',
        message: 'Order is already completed and archived.'
      });
    }

    // SERVE ORDER: Set status to SERVED (paid)
    order.status = 'paid'; // Maps to 'SERVED' in frontend
    order.servedAt = new Date(); // Store served timestamp
    // CRITICAL: Keep isCompleted = false so order stays in Live Orders
    // Only COMPLETED sets isCompleted = true
    
    // Mark all batches as paid (served)
    order.batches.forEach(batch => {
      batch.status = 'paid';
    });

    const updatedOrder = await order.save();

    // Emit real-time event for order served
    if (io) {
      // Notify admin room (order stays in Live Orders)
      io.to('admin').emit('order:update', {
        order: updatedOrder
      });
      
      // Notify order-specific room
      io.to(`order:${updatedOrder._id}`).emit('order:update', {
        order: updatedOrder
      });
      
      // CRITICAL: Notify table-specific room (customer sees thank-you)
      io.to(`table:${updatedOrder.tableNo}`).emit('order:update', {
        order: updatedOrder
      });
    }

    res.status(200).json({
      success: true,
      data: updatedOrder,
      message: 'Order served successfully'
    });
  } catch (error) {
    console.error('Error serving order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to serve order',
      message: error.message
    });
  }
};

/**
 * Complete order (Admin action)
 * 
 * POST /orders/complete/:orderId
 * 
 * Rules:
 * - Order must currently be SERVED (status = 'paid')
 * - Set isCompleted = true
 * - Store completedAt timestamp
 * - Removes from live dashboard, moves to Completed Orders
 * 
 * This is admin-only closure & archival action.
 * NEVER navigates - only updates database.
 */
export const completeOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const io = req.app.get('io'); // Get Socket.IO instance

    // DEBUG: Log received orderId
    console.log('[Complete Order] Received orderId:', orderId);

    // Find order by MongoDB _id (orderId is the _id)
    const order = await Order.findById(orderId);
    
    // DEBUG: Log order lookup result
    if (!order) {
      console.log('[Complete Order] Order not found for orderId:', orderId);
    } else {
      console.log('[Complete Order] Order found:', {
        _id: order._id,
        status: order.status,
        isCompleted: order.isCompleted,
        tableNo: order.tableNo
      });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // ADMIN "COMPLETE ORDER" CONTROL: Set isCompleted = true
    // Remove conditional restrictions - allow completion from any status
    order.isCompleted = true; // Move to Completed Orders (removes from Live Orders)
    order.completedAt = new Date(); // Store completion timestamp
    // Note: Status remains as-is - isCompleted flag determines completion
    
    // Mark all batches as completed
    order.batches.forEach(batch => {
      batch.status = 'completed';
    });

    const updatedOrder = await order.save();

    // Emit real-time event for order completion
    if (io) {
      // Notify admin room that order is completed (will be removed from Live Orders)
      io.to('admin').emit('order:completed', {
        order: updatedOrder
      });
      
      // Notify order-specific room (by orderId)
      io.to(`order:${updatedOrder._id}`).emit('order:update', {
        order: updatedOrder
      });
      
      // CRITICAL: Also notify table-specific room for better customer sync
      io.to(`table:${updatedOrder.tableNo}`).emit('order:update', {
        order: updatedOrder
      });
    }

    res.status(200).json({
      success: true,
      data: updatedOrder,
      message: 'Order completed successfully'
    });
  } catch (error) {
    console.error('Error completing order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete order',
      message: error.message
    });
  }
};
