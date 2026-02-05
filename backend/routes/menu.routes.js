/**
 * Menu Routes
 * 
 * Defines all menu-related API endpoints.
 */

import express from 'express';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../controllers/menu.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET /api/menu - Get all menu items (public)
router.get('/', getMenuItems);

// POST /api/menu - Create new menu item (admin only)
router.post('/', authenticateToken, createMenuItem);

// PATCH /api/menu/:id - Update menu item (admin only)
router.patch('/:id', authenticateToken, updateMenuItem);

// DELETE /api/menu/:id - Delete menu item (admin only)
router.delete('/:id', authenticateToken, deleteMenuItem);

export default router;






