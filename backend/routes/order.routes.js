/**
 * Order Routes
 * 
 * Defines all order-related API endpoints.
 */

import express from 'express';
import {
  createOrder,
  getOrderById,
  getOrdersByTable,
  getActiveOrderByTable,
  addBatchToOrder,
  updateBatchStatus,
  advanceOrderStatus,
  serveOrder,
  completeOrder
} from '../controllers/order.controller.js';

const router = express.Router();

// POST /api/orders - Create a new order
router.post('/', createOrder);

// GET /api/orders/table/:tableNo - Get all orders for a table
router.get('/table/:tableNo', getOrdersByTable);

// GET /api/orders/active?tableNumber=:table - Get active order for a table
// FIX: New endpoint for Order Status page fallback
router.get('/active', getActiveOrderByTable);

// POST /api/orders/complete/:orderId - Complete order (MUST be before /:id route to avoid conflicts)
router.post('/complete/:orderId', completeOrder);

// GET /api/orders/:id - Get order by ID (must be after specific routes)
router.get('/:id', getOrderById);

// PATCH /api/orders/:id/add-batch - Add new batch to existing order
router.patch('/:id/add-batch', addBatchToOrder);

// PATCH /api/orders/:id/status - Update batch or order status
router.patch('/:id/status', updateBatchStatus);

// PUT /api/orders/:id/status - Update batch or order status (alternative method)
router.put('/:id/status', updateBatchStatus);

// POST /api/orders/:id/advance-status - Advance order to next valid status (single-action button)
// OPTIMIZED FOR PEAK-HOUR SPEED: One-click action
router.post('/:id/advance-status', advanceOrderStatus);

// PATCH /api/orders/:id/serve - Serve order (sets status = SERVED, keeps in Live Orders)
router.patch('/:id/serve', serveOrder);

export default router;


