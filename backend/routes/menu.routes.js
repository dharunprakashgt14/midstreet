/**
 * Menu Routes
 * 
 * Defines all menu-related API endpoints.
 */

import express from 'express';
import { getMenuItems, updateMenuItem } from '../controllers/menu.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET /api/menu - Get all menu items (public)
router.get('/', getMenuItems);

// PATCH /api/menu/:id - Update menu item (admin only)
router.patch('/:id', authenticateToken, updateMenuItem);

export default router;






