/**
 * Admin Routes
 * 
 * Defines all admin-related API endpoints.
 * Protected routes require JWT authentication.
 */

import express from 'express';
import {
  adminLogin,
  getAllOrders,
  getCompletedOrders,
  getCompletedOrdersByDate,
  getDailySummary
} from '../controllers/admin.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// POST /api/admin/login - Admin login (public, no auth required)
router.post('/login', adminLogin);

// GET /api/admin/orders - Get all orders (protected, requires auth)
router.get('/orders', authenticateToken, getAllOrders);

// GET /api/admin/orders/completed - Get completed orders (protected, requires auth)
router.get('/orders/completed', authenticateToken, getCompletedOrders);

// GET /api/admin/orders/completed/by-date - Get completed orders by date (protected, requires auth)
router.get('/orders/completed/by-date', authenticateToken, getCompletedOrdersByDate);

// GET /api/admin/summary - Get daily summary (protected, requires auth)
router.get('/summary', authenticateToken, getDailySummary);

export default router;






