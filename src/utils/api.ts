/**
 * API Utility Functions
 * 
 * Centralized functions for making backend API calls.
 * All API calls go through this file for consistency.
 */

// Get API base URL from environment variable
// VITE_API_BASE_URL should include the full URL with /api suffix
// Example: http://localhost:5000/api
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Generic fetch wrapper with error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add JWT token if available (for admin routes)
  const token = window.sessionStorage.getItem('midstreet_admin_token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // CRITICAL FIX: Handle response structure correctly
    // Backend returns { success: true, data: ... } or { success: true, data: null }
    // Return data.data if it exists (even if null), otherwise return the whole response
    if ('data' in data) {
      return data.data;
    }
    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

/**
 * Menu API
 */
export const menuAPI = {
  /**
   * Fetch all menu items from backend
   */
  getAll: async () => {
    return apiRequest<Array<{
      _id: string;
      category: string;
      name: string;
      price: number;
      isAvailable: boolean;
      description?: string;
      itemId?: string;
      tag?: string;
      imageUrl?: string;
    }>>('/menu');
  },

  /**
   * Update menu item (admin only)
   * Updates availability, price, name, description, or tag
   * 
   * @param itemId - The menu item ID (can be MongoDB _id or itemId field)
   * @param updates - Object containing fields to update
   * @param updates.isAvailable - Stock availability status (true = in stock, false = out of stock)
   * @param updates.price - Item price
   * @param updates.name - Item name
   * @param updates.description - Item description
   * @param updates.tag - Item tag (Signature, Chef's pick, New)
   * 
   * Note: Backend accepts both 'isAvailable' and 'inStock' fields (inStock is mapped to isAvailable)
   */
  update: async (itemId: string, updates: {
    isAvailable?: boolean;
    inStock?: boolean; // Alternative field name (mapped to isAvailable on backend)
    price?: number;
    name?: string;
    description?: string;
    tag?: string;
  }) => {
    // Ensure we send isAvailable (backend will handle inStock mapping if needed)
    const normalizedUpdates = { ...updates };
    if ('inStock' in normalizedUpdates && !('isAvailable' in normalizedUpdates)) {
      normalizedUpdates.isAvailable = normalizedUpdates.inStock;
      delete normalizedUpdates.inStock;
    }

    console.log(`[menuAPI.update] Updating menu item ${itemId} with:`, normalizedUpdates);

    return apiRequest<{
      _id: string;
      category: string;
      name: string;
      price: number;
      isAvailable: boolean;
      description?: string;
      itemId?: string;
      tag?: string;
      imageUrl?: string;
    }>(`/menu/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(normalizedUpdates),
    });
  },
};

/**
 * Order API
 */
export const orderAPI = {
  /**
   * Create a new order
   */
  create: async (orderData: {
    tableNo: string;
    items: Array<{
      name: string;
      price: number;
      quantity: number;
      menuItemId: string;
    }>;
    total: number;
    billNumber?: string;
  }) => {
    return apiRequest<{
      _id: string;
      // FIX: Removed orderId field - _id is the ONLY orderId
      tableNo: string;
      batches: Array<{
        batchId: string;
        items: Array<{
          name: string;
          price: number;
          quantity: number;
          menuItemId: string;
        }>;
        status: string;
        total: number;
        createdAt: string;
      }>;
      total: number;
      status: string;
      billNumber?: string;
      createdAt: string;
    }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  /**
   * Get order by ID
   */
  getById: async (id: string) => {
    return apiRequest<{
      _id: string;
      // FIX: Removed orderId field - _id is the ONLY orderId
      tableNo: string;
      batches: Array<{
        batchId: string;
        items: Array<{
          name: string;
          price: number;
          quantity: number;
          menuItemId: string;
        }>;
        status: string;
        total: number;
        createdAt: string;
      }>;
      total: number;
      status: string;
      billNumber?: string;
      createdAt: string;
    }>(`/orders/${id}`);
  },

  /**
   * Get all orders for a table
   */
  getByTable: async (tableNo: string | number) => {
    return apiRequest<Array<{
      _id: string;
      // FIX: Removed orderId field - _id is the ONLY orderId
      tableNo: string;
      batches: Array<{
        batchId: string;
        items: Array<{
          name: string;
          price: number;
          quantity: number;
          menuItemId: string;
        }>;
        status: string;
        total: number;
        createdAt: string;
      }>;
      total: number;
      status: string;
      billNumber?: string;
      createdAt: string;
    }>>(`/orders/table/${tableNo}`);
  },

  /**
   * Get active order for a table
   * Returns latest order where isCompleted = false
   */
  getActiveByTable: async (tableNumber: string | number) => {
    return apiRequest<{
      _id: string;
      // FIX: Removed orderId field - _id is the ONLY orderId
      tableNo: string;
      batches: Array<{
        batchId: string;
        items: Array<{
          name: string;
          price: number;
          quantity: number;
          menuItemId: string;
        }>;
        status: string;
        total: number;
        createdAt: string;
      }>;
      total: number;
      status: string;
      billNumber?: string;
      createdAt: string;
      isCompleted: boolean;
      servedAt?: string;
      completedAt?: string;
    } | null>(`/orders/active?tableNumber=${tableNumber}`);
  },

  /**
   * Add batch to existing order
   */
  addBatch: async (orderId: string, items: Array<{
    name: string;
    price: number;
    quantity: number;
    menuItemId: string;
  }>, batchTotal: number) => {
    return apiRequest<{
      _id: string;
      // FIX: Removed orderId field - _id is the ONLY orderId (orderId parameter is actually _id)
      tableNo: string;
      batches: Array<{
        batchId: string;
        items: Array<{
          name: string;
          price: number;
          quantity: number;
          menuItemId: string;
        }>;
        status: string;
        total: number;
        createdAt: string;
      }>;
      total: number;
      status: string;
      billNumber?: string;
      createdAt: string;
    }>(`/orders/${orderId}/add-batch`, {
      method: 'PATCH',
      body: JSON.stringify({ items, batchTotal }),
    });
  },

  /**
   * Update batch or order status
   * Supports forward (one step) and backward transitions
   */
  updateStatus: async (orderId: string, status: 'pending' | 'preparing' | 'served' | 'paid' | 'completed', batchId?: string) => {
    return apiRequest<{
      _id: string;
      // FIX: Removed orderId field - _id is the ONLY orderId (orderId parameter is actually _id)
      tableNo: string;
      batches: Array<{
        batchId: string;
        items: Array<{
          name: string;
          price: number;
          quantity: number;
          menuItemId: string;
        }>;
        status: string;
        total: number;
        createdAt: string;
      }>;
      total: number;
      status: string;
      billNumber?: string;
      createdAt: string;
    }>(`/orders/${orderId}/status`, {
      method: 'PUT', // Use PUT method as specified in requirements
      body: JSON.stringify({ status, batchId }),
    });
  },

  /**
   * Advance order status to next valid state (single-action button)
   * OPTIMIZED FOR PEAK-HOUR SPEED: One-click action
   * Enforces valid transitions: PLACED → IN_PREPARATION → READY → SERVED
   */
  advanceStatus: async (orderId: string) => {
    return apiRequest<{
      _id: string;
      tableNo: string;
      batches: Array<{
        batchId: string;
        items: Array<{
          name: string;
          price: number;
          quantity: number;
          menuItemId: string;
        }>;
        status: string;
        total: number;
        createdAt: string;
      }>;
      total: number;
      status: string;
      billNumber?: string;
      createdAt: string;
      isActive?: boolean;
      previousStatus?: string;
      newStatus?: string;
    }>(`/orders/${orderId}/advance-status`, {
      method: 'POST',
    });
  },

  /**
   * Serve order (Admin action)
   * Sets order status to SERVED (paid)
   * Order stays in Live Orders, customer sees thank-you and redirects
   */
  serveOrder: async (orderId: string) => {
    return apiRequest<{
      _id: string;
      tableNo: string;
      batches: Array<{
        batchId: string;
        items: Array<{
          name: string;
          price: number;
          quantity: number;
          menuItemId: string;
        }>;
        status: string;
        total: number;
        createdAt: string;
      }>;
      total: number;
      status: string;
      billNumber?: string;
      createdAt: string;
      isActive?: boolean;
    }>(`/orders/${orderId}/serve`, {
      method: 'PATCH',
    });
  },

  /**
   * Complete order (Admin action)
   * Sets isCompleted = true and completedAt timestamp
   * Order moves to Completed Orders section
   * NEVER navigates - only calls API
   */
  completeOrder: async (orderId: string) => {
    return apiRequest<{
      _id: string;
      tableNo: string;
      batches: Array<{
        batchId: string;
        items: Array<{
          name: string;
          price: number;
          quantity: number;
          menuItemId: string;
        }>;
        status: string;
        total: number;
        createdAt: string;
      }>;
      total: number;
      status: string;
      billNumber?: string;
      createdAt: string;
      isCompleted: boolean;
      completedAt: string;
    }>(`/orders/complete/${orderId}`, {
      method: 'POST',
    });
  },
};

/**
 * Admin API
 */
export const adminAPI = {
  /**
   * Admin login
   */
  login: async (username: string, password: string) => {
    const response = await apiRequest<{
      token: string;
      username: string;
    }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    // Store token in sessionStorage
    if (response.token) {
      window.sessionStorage.setItem('midstreet_admin_token', response.token);
    }
    
    return response;
  },

  /**
   * Get all orders (admin only)
   * CRITICAL: Backend returns { success: true, data: orders, summary: {...} }
   * We need to preserve the full structure including summary
   */
  getAllOrders: async (status?: string) => {
    const endpoint = status ? `/admin/orders?status=${status}` : '/admin/orders';
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Add JWT token if available (for admin routes)
    const token = window.sessionStorage.getItem('midstreet_admin_token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Backend returns { success: true, data: orders, summary: {...} }
    // Return the full structure with data and summary
    if (data.success && data.data) {
      return {
        data: data.data, // Array of orders
        summary: data.summary || { total: 0, active: 0, totalRevenue: 0 }
      };
    }
    
    // Fallback if structure is different
    return {
      data: Array.isArray(data) ? data : (data.data || []),
      summary: data.summary || { total: 0, active: 0, totalRevenue: 0 }
    };
  },

  /**
   * Get completed orders (admin only)
   * Returns all orders with isCompleted = true, sorted by completedAt descending
   */
  getCompletedOrders: async () => {
    return apiRequest<Array<{
      _id: string;
      billNumber: string;
      tableNo: string;
      total: number;
      completedAt: string;
      createdAt: string;
      batches: Array<{
        batchId: string;
        items: Array<{
          name: string;
          price: number;
          quantity: number;
          menuItemId: string;
        }>;
        status: string;
        total: number;
        createdAt: string;
      }>;
    }>>('/admin/orders/completed');
  },

  /**
   * Get completed orders by date (admin only)
   * Returns completed orders for a specific date (YYYY-MM-DD)
   */
  getCompletedOrdersByDate: async (date: string) => {
    return apiRequest<Array<{
      _id: string;
      billNumber: string;
      tableNo: string;
      total: number;
      completedAt: string;
      createdAt: string;
      batches: Array<{
        batchId: string;
        items: Array<{
          name: string;
          price: number;
          quantity: number;
          menuItemId: string;
        }>;
        status: string;
        total: number;
        createdAt: string;
      }>;
    }>>(`/admin/orders/completed/by-date?date=${date}`);
  },

  /**
   * Get daily summary (admin only)
   * Returns today's SERVED/COMPLETED orders sorted by createdAt ascending
   */
  getDailySummary: async () => {
    return apiRequest<{
      date: string;
      totalOrders: number;
      totalRevenue: number;
      ordersByStatus: {
        pending: number;
        preparing: number;
        served: number;
        paid: number;
      };
      ordersByTable: Record<string, {
        count: number;
        revenue: number;
      }>;
      orders: Array<{
        billNumber: string;
        tableNumber: string;
        totalAmount: number;
        finalStatus: string;
        createdAt: string;
      }>;
    }>('/admin/summary');
  },
};
