/**
 * Menu Controller
 * 
 * Handles all menu-related API requests.
 * GET /api/menu - Fetch all menu items
 * PATCH /api/menu/:id - Update menu item (availability, price, etc.)
 */

import { MenuItem } from '../models/MenuItem.js';

/**
 * Get all menu items
 * 
 * Returns all menu items grouped by category.
 * Used by frontend to display the menu.
 */
export const getMenuItems = async (req, res) => {
  try {
    // Fetch all menu items from database
    const menuItems = await MenuItem.find({}).sort({ category: 1, name: 1 });

    // Return success response with menu items
    res.status(200).json({
      success: true,
      data: menuItems,
      count: menuItems.length
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu items',
      message: error.message
    });
  }
};

/**
 * Update menu item
 * 
 * Updates a menu item's properties (availability, price, name, etc.).
 * Used by admin to manage stock availability.
 */
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Log incoming request for debugging
    console.log(`[PATCH /api/menu/:id] Updating menu item with id: ${id}`);
    console.log(`[PATCH /api/menu/:id] Update payload:`, JSON.stringify(updates, null, 2));

    // Validate that at least one field is being updated
    if (!updates || Object.keys(updates).length === 0) {
      console.warn(`[PATCH /api/menu/:id] No update fields provided for id: ${id}`);
      return res.status(400).json({
        success: false,
        error: 'No update fields provided'
      });
    }

    // Normalize inStock to isAvailable if frontend sends inStock
    if ('inStock' in updates && !('isAvailable' in updates)) {
      updates.isAvailable = updates.inStock;
      delete updates.inStock;
      console.log(`[PATCH /api/menu/:id] Mapped inStock to isAvailable: ${updates.isAvailable}`);
    }

    // Validate MongoDB ObjectId format
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    let menuItem;
    let documentId;

    if (isValidObjectId) {
      // Try direct findByIdAndUpdate first (most efficient for _id)
      console.log(`[PATCH /api/menu/:id] Attempting direct _id lookup: ${id}`);
      documentId = id;
    } else {
      // If not a valid ObjectId, search by itemId
      console.log(`[PATCH /api/menu/:id] Searching by itemId: ${id}`);
      menuItem = await MenuItem.findOne({ itemId: id });
      
      if (!menuItem) {
        console.error(`[PATCH /api/menu/:id] Menu item not found with itemId: ${id}`);
        return res.status(404).json({
          success: false,
          error: 'Menu item not found',
          details: `No menu item found with id or itemId: ${id}`
        });
      }
      
      documentId = menuItem._id.toString();
      console.log(`[PATCH /api/menu/:id] Found menu item by itemId, using _id: ${documentId}`);
    }

    // Update allowed fields only (security: prevent injection of unwanted fields)
    const allowedFields = ['isAvailable', 'price', 'name', 'description', 'tag'];
    const updateData = {};
    
    for (const field of allowedFields) {
      if (field in updates) {
        updateData[field] = updates[field];
      }
    }

    // Validate that at least one allowed field is being updated
    if (Object.keys(updateData).length === 0) {
      console.warn(`[PATCH /api/menu/:id] No allowed fields to update for id: ${id}`);
      return res.status(400).json({
        success: false,
        error: 'No valid update fields provided',
        allowedFields: allowedFields
      });
    }

    console.log(`[PATCH /api/menu/:id] Updating document _id: ${documentId} with data:`, JSON.stringify(updateData, null, 2));

    // Update the menu item using findByIdAndUpdate
    const updatedItem = await MenuItem.findByIdAndUpdate(
      documentId,
      { $set: updateData },
      { 
        new: true, // Return updated document
        runValidators: true, // Run schema validators
        lean: false // Return full Mongoose document (not plain object)
      }
    );

    if (!updatedItem) {
      console.error(`[PATCH /api/menu/:id] Menu item not found with _id: ${documentId}`);
      return res.status(404).json({
        success: false,
        error: 'Menu item not found',
        details: `No menu item found with _id: ${documentId}`
      });
    }

    console.log(`[PATCH /api/menu/:id] Successfully updated menu item: ${updatedItem.name} (${updatedItem._id})`);

    // Return success response with updated item
    res.status(200).json({
      success: true,
      data: updatedItem
    });
  } catch (error) {
    // Enhanced error logging
    console.error(`[PATCH /api/menu/:id] Error updating menu item:`, {
      error: error.message,
      stack: error.stack,
      params: req.params,
      body: req.body
    });

    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.message,
        details: error.errors
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID format',
        message: `Invalid menu item ID: ${req.params.id}`
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: 'Failed to update menu item',
      message: error.message
    });
  }
};






