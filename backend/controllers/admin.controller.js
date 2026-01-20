/**
 * Admin Controller
 * 
 * Handles admin authentication and admin-only operations.
 * - POST /api/admin/login - Admin login (returns JWT token)
 * - GET /api/admin/orders - Get all orders (admin only)
 * - GET /api/admin/summary - Get daily summary (admin only)
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Admin } from '../models/Admin.js';
import { Order } from '../models/Order.js';

/**
 * Admin Login
 * 
 * Authenticates admin user and returns JWT token.
 * Request body: { username, password }
 */
export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // Find admin by username
    const admin = await Admin.findOne({ username: username.toLowerCase().trim() });

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Compare password with hashed password
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const token = jwt.sign(
      { 
        id: admin._id,
        username: admin.username 
      },
      secret,
      { expiresIn: '24h' } // Token expires in 24 hours
    );

    // Return success with token
    res.status(200).json({
      success: true,
      data: {
        token,
        username: admin.username
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: error.message
    });
  }
};

/**
 * Get all orders (Admin only)
 * 
 * Returns all orders EXCEPT SERVED (paid) status.
 * Admin must see all PLACED, PREPARING, and READY orders.
 * Sorted by newest first - new orders appear at the top.
 * 
 * CRITICAL: This query ensures admin sees new PLACED orders immediately.
 * Both admin and customer read from the SAME orders collection.
 */
export const getAllOrders = async (req, res) => {
  try {
    // Query: All orders where isCompleted = false (Live Orders)
    // SERVED (paid) orders stay in Live Orders until admin clicks COMPLETE
    // Backend status mapping: 'paid' = SERVED in frontend
    // This ensures admin sees: PLACED (pending), PREPARING (preparing), READY (served), SERVED (paid)
    // Only COMPLETED orders (isCompleted = true) are removed from live dashboard
    const orders = await Order.find({
      isCompleted: false // Only non-completed orders (includes SERVED)
    })
      .sort({ createdAt: -1 }) // Most recent first - new orders at top
      .limit(1000); // Limit to prevent huge responses

    // Calculate summary statistics
    const totalRevenue = orders.reduce((sum, order) => {
      return order.status === 'paid' ? sum + order.total : sum;
    }, 0);

    const activeOrders = orders.filter(
      order => order.status !== 'served' && order.status !== 'paid'
    ).length;

    res.status(200).json({
      success: true,
      data: orders,
      summary: {
        total: orders.length,
        active: activeOrders,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
      message: error.message
    });
  }
};

/**
 * Get completed orders (Admin only)
 * 
 * Returns all orders where isCompleted = true.
 * Sorted by completedAt descending (most recent first).
 */
export const getCompletedOrders = async (req, res) => {
  try {
    // Fetch all completed orders
    const orders = await Order.find({
      isCompleted: true // Only completed orders
    })
      .sort({ completedAt: -1 }) // Most recently completed first
      .limit(1000); // Limit to prevent huge responses

    // Format orders for response
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      billNumber: order.billNumber || '',
      tableNo: order.tableNo,
      total: order.total,
      completedAt: order.completedAt,
      createdAt: order.createdAt,
      batches: order.batches
    }));

    res.status(200).json({
      success: true,
      data: formattedOrders,
      count: formattedOrders.length
    });
  } catch (error) {
    console.error('Error fetching completed orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch completed orders',
      message: error.message
    });
  }
};

/**
 * Get completed orders by date (Admin only)
 * 
 * Route: GET /api/admin/orders/completed/by-date?date=YYYY-MM-DD
 * 
 * Returns completed orders for a specific date.
 * Sorted by completedAt descending (most recent first).
 */
export const getCompletedOrdersByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'Date parameter is required (format: YYYY-MM-DD)'
      });
    }

    // Parse date string (YYYY-MM-DD)
    const dateParts = String(date).split('-');
    if (dateParts.length !== 3) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    // Create start of day (00:00:00)
    const startOfDay = new Date(
      parseInt(dateParts[0]), // year
      parseInt(dateParts[1]) - 1, // month (0-indexed)
      parseInt(dateParts[2]) // day
    );
    startOfDay.setHours(0, 0, 0, 0);

    // Create end of day (23:59:59.999)
    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch completed orders for the specified date
    const orders = await Order.find({
      isCompleted: true,
      completedAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    })
      .sort({ completedAt: -1 }) // Most recently completed first
      .limit(1000); // Limit to prevent huge responses

    // Format orders for response
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      billNumber: order.billNumber || '',
      tableNo: order.tableNo,
      total: order.total,
      completedAt: order.completedAt,
      createdAt: order.createdAt,
      batches: order.batches
    }));

    res.status(200).json({
      success: true,
      data: formattedOrders,
      count: formattedOrders.length,
      date: String(date)
    });
  } catch (error) {
    console.error('Error fetching completed orders by date:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch completed orders by date',
      message: error.message
    });
  }
};

/**
 * Get daily summary (Admin only)
 * 
 * Returns summary statistics for the current day.
 * Only includes orders with status = 'paid' (SERVED/COMPLETED).
 * Sorted by createdAt ascending (oldest first).
 */
export const getDailySummary = async (req, res) => {
  try {
    // Get start and end of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch today's orders that are SERVED or COMPLETED (status = 'paid')
    // Sort by createdAt ascending (oldest first)
    const orders = await Order.find({
      createdAt: {
        $gte: today,
        $lt: tomorrow
      },
      status: 'paid' // Only SERVED/COMPLETED orders
    }).sort({ createdAt: 1 }); // Ascending order (oldest first)

    // Calculate statistics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    const ordersByStatus = {
      pending: 0,
      preparing: 0,
      served: 0,
      paid: orders.length // All orders in summary are paid
    };

    // Group by table
    const ordersByTable = {};
    orders.forEach(order => {
      const table = order.tableNo;
      if (!ordersByTable[table]) {
        ordersByTable[table] = {
          count: 0,
          revenue: 0
        };
      }
      ordersByTable[table].count++;
      ordersByTable[table].revenue += order.total;
    });

    // Format orders for response (only include required fields)
    const formattedOrders = orders.map(order => ({
      billNumber: order.billNumber || '',
      tableNumber: order.tableNo,
      totalAmount: order.total,
      finalStatus: order.status, // 'paid' = SERVED/COMPLETED
      createdAt: order.createdAt
    }));

    res.status(200).json({
      success: true,
      data: {
        date: today.toISOString().split('T')[0],
        totalOrders,
        totalRevenue,
        ordersByStatus,
        ordersByTable,
        orders: formattedOrders // Formatted order list for printing
      }
    });
  } catch (error) {
    console.error('Error fetching daily summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch daily summary',
      message: error.message
    });
  }
};






