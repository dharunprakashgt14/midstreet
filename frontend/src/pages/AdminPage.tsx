import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { OrderStep, Order } from "../types";
import { useAppState } from "../context/AppStateContext";
import { useSocket } from "../context/SocketContext";
import { adminAPI, orderAPI } from "../utils/api";
import { AdminLayout } from "../components/AdminLayout";

// Status flow array - defines order of statuses
const STATUS_FLOW: OrderStep[] = [
  "PLACED",
  "IN_PREPARATION",
  "READY",
  "SERVED",
  "COMPLETED"
];

// Map frontend status to backend status
const mapFrontendStatusToBackend = (status: OrderStep): 'pending' | 'preparing' | 'served' | 'paid' | 'completed' => {
  const statusMap: Record<OrderStep, 'pending' | 'preparing' | 'served' | 'paid' | 'completed'> = {
    'PLACED': 'pending',
    'IN_PREPARATION': 'preparing',
    'READY': 'served',
    'SERVED': 'paid',
    'COMPLETED': 'completed'
  };
  return statusMap[status] || 'pending';
};

// Map backend order to frontend order format
const mapBackendOrderToFrontend = (backendOrder: any): Order => {
  return {
    id: backendOrder._id,
    table: Number(backendOrder.tableNo) as any,
    batches: backendOrder.batches?.map((batch: any) => ({
      batchId: batch.batchId,
      items: batch.items.map((item: any) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity
      })),
      status: mapBackendStatusToFrontend(batch.status),
      total: batch.total,
      createdAt: new Date(batch.createdAt || backendOrder.createdAt)
    })) || [],
    status: mapBackendStatusToFrontend(backendOrder.status),
    createdAt: new Date(backendOrder.createdAt),
    billNumber: backendOrder.billNumber || '',
    total: backendOrder.total
  };
};

// Map backend status to frontend status
const mapBackendStatusToFrontend = (backendStatus: string): OrderStep => {
  const statusMap: Record<string, OrderStep> = {
    'pending': 'PLACED',
    'preparing': 'IN_PREPARATION',
    'served': 'READY',
    'paid': 'SERVED',
    'completed': 'COMPLETED'
  };
  return statusMap[backendStatus] || 'PLACED';
};

/**
 * AdminPage component - Admin dashboard for managing orders, stocks, and daily summaries.
 * 
 * Route: /admin
 * 
 * Fetches orders from backend API and allows updating order status.
 */
export const AdminPage = () => {
  const navigate = useNavigate();
  const { orders, setOrders } = useAppState();
  const { socket } = useSocket();
  const [isLoading, setIsLoading] = useState(true);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [isLoadingCompleted, setIsLoadingCompleted] = useState(false);
  const [showCompletedOrders, setShowCompletedOrders] = useState(true);
  const fetchOrdersRef = React.useRef<(() => Promise<void>) | null>(null);

  // SINGLE SOURCE OF TRUTH: fetchOrders() is the ONLY function that calls setOrders
  // CRITICAL: Backend returns all orders where status != 'paid' (SERVED)
  // CRITICAL: Never clear orders on error - preserve existing state
  useEffect(() => {
    let isInitialLoad = true;
    let isMounted = true;

    const fetchOrders = async () => {
      try {
        // Only show loading on initial load to avoid UI flicker during auto-refresh
        if (isInitialLoad) {
          setIsLoading(true);
          isInitialLoad = false;
        }
        
        // Fetch all non-SERVED orders from MongoDB via backend API
        // Backend query: Order.find({ status: { $ne: 'paid' } }).sort({ createdAt: -1 })
        const response = await adminAPI.getAllOrders();
        
        // Only update state if component is still mounted
        if (isMounted) {
          const frontendOrders = response.data.map(mapBackendOrderToFrontend);
          // CRITICAL: This is the ONLY place setOrders is called
          // Backend filters orders (status != 'paid'), so we show everything returned
          setOrders(frontendOrders);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        // CRITICAL: DO NOT clear orders on error - preserve existing state
        // Failed fetch should not cause orders to disappear
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Store fetchOrders in ref so socket listeners can access it
    fetchOrdersRef.current = fetchOrders;

    // Initial fetch
    fetchOrders();

    // Auto-refresh every 3 seconds as fallback (polling)
    const interval = setInterval(fetchOrders, 3000);

    // Cleanup: clear interval and mark as unmounted
    return () => {
      isMounted = false;
      clearInterval(interval);
      fetchOrdersRef.current = null;
    };
  }, [setOrders]);

  // Socket.IO listeners - ONLY trigger fetchOrders(), never update state directly
  // CRITICAL: Socket events trigger refetch to maintain single source of truth
  // CRITICAL: fetchOrders() is the ONLY function that calls setOrders
  useEffect(() => {
    if (!socket) return;

    // Join admin room to receive order updates
    socket.emit('join:admin');

    // All socket handlers trigger refetch - no direct state mutation
    const handleNewOrder = () => {
      // Trigger refetch to get updated orders from backend
      if (fetchOrdersRef.current) {
        fetchOrdersRef.current();
      }
    };

    const handleOrderUpdate = () => {
      // Trigger refetch to get updated orders from backend
      if (fetchOrdersRef.current) {
        fetchOrdersRef.current();
      }
    };

    const handleOrderCompleted = () => {
      // Trigger refetch to get updated orders from backend (SERVED orders will be filtered out)
      if (fetchOrdersRef.current) {
        fetchOrdersRef.current();
      }
    };

    // Register socket listeners
    socket.on('order:new', handleNewOrder);
    socket.on('order:update', handleOrderUpdate);
    socket.on('order:completed', handleOrderCompleted);

    // Cleanup: Remove all listeners and leave admin room
    return () => {
      socket.off('order:new', handleNewOrder);
      socket.off('order:update', handleOrderUpdate);
      socket.off('order:completed', handleOrderCompleted);
      socket.emit('leave:admin');
    };
  }, [socket]);

  /**
   * Check if status transition is valid
   * Rules:
   * - Forward movement: ONLY one step at a time (targetIndex === currentIndex + 1)
   * - Backward movement: ALWAYS allowed (targetIndex < currentIndex)
   */
  const isValidTransition = (currentStatus: OrderStep, targetStatus: OrderStep): boolean => {
    const currentIndex = STATUS_FLOW.indexOf(currentStatus);
    const targetIndex = STATUS_FLOW.indexOf(targetStatus);

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
   * Handle status change (all status buttons)
   * Validates transition before sending to backend
   */
  const handleStatusChange = async (orderId: string, newStatus: OrderStep, currentStatus: OrderStep) => {
    try {
      // Frontend validation: check if transition is valid
      if (!isValidTransition(currentStatus, newStatus)) {
        window.alert(`Invalid status transition. Forward movement allowed only one step. Backward movement always allowed.`);
        return;
      }

      // Update status on backend
      const backendStatus = mapFrontendStatusToBackend(newStatus);
      await orderAPI.updateStatus(orderId, backendStatus);
      
      // CRITICAL: Trigger refetch instead of direct state mutation
      // fetchOrders() is the ONLY function that calls setOrders
      if (fetchOrdersRef.current) {
        fetchOrdersRef.current();
      }
    } catch (error: any) {
      console.error('Failed to update order status:', error);
      const errorMessage = error?.message || 'Failed to update order status. Please try again.';
      window.alert(errorMessage);
      // CRITICAL: Do NOT clear orders on error - state remains unchanged
    }
  };

  /**
   * Handle serving order (READY → SERVED)
   */
  const handleServeOrder = async (orderId: string) => {
    try {
      await orderAPI.serveOrder(orderId);
      if (fetchOrdersRef.current) {
        fetchOrdersRef.current();
      }
    } catch (error: any) {
      console.error('Failed to serve order:', error);
      window.alert(error?.message || 'Failed to serve order. Please try again.');
    }
  };

  /**
   * Handle completing order (SERVED → COMPLETED)
   * Removes order from live dashboard (admin-only action)
   */
  const handleCompleteOrder = async (orderId: string) => {
    try {
      // DEBUG: Log orderId being sent
      console.log('[Admin] Completing order with orderId:', orderId);
      
      // ADMIN "COMPLETE ORDER" CONTROL: Mark order as COMPLETED
      await orderAPI.completeOrder(orderId);
      
      // CRITICAL: Trigger refetch instead of direct state mutation
      // Backend will filter out COMPLETED orders (isCompleted = true)
      // fetchOrders() is the ONLY function that calls setOrders
      if (fetchOrdersRef.current) {
        fetchOrdersRef.current();
      }
      
      // Re-fetch completed orders to add the newly completed order to sidebar
      fetchCompletedOrders();
    } catch (error: any) {
      console.error('Failed to complete order:', error);
      const errorMessage = error?.message || 'Failed to complete order. Please try again.';
      window.alert(errorMessage);
    }
  };

  const openBillFromAdmin = (order: { id: string }) => {
    navigate(`/bill/${order.id}`);
  };

  // ORDER VISIBILITY RULE: Admin page only shows active orders (already filtered by backend)
  // Calculate metrics from visible orders
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const activeOrders = orders.filter(
    (o) => o.status !== "SERVED"
  ).length;

  const handlePrintDaily = () => {
    navigate("/admin/summary");
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Fetch completed orders for today only
  const fetchCompletedOrders = async () => {
    try {
      setIsLoadingCompleted(true);
      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      // Fetch only today's completed orders
      const response = await adminAPI.getCompletedOrdersByDate(todayStr);
      
      const frontendOrders = response.map((order: any) => ({
        id: order._id,
        table: Number(order.tableNo) as any,
        batches: order.batches?.map((batch: any) => ({
          batchId: batch.batchId,
          items: batch.items.map((item: any) => ({
            menuItemId: item.menuItemId,
            name: item.name || 'Unknown Item', // Item name from order
            price: item.price || 0, // Item price from order (locked at time of order)
            quantity: item.quantity || 1
          })),
          status: mapBackendStatusToFrontend(batch.status),
          total: batch.total,
          createdAt: new Date(batch.createdAt || order.createdAt)
        })) || [],
        status: 'COMPLETED' as OrderStep,
        createdAt: new Date(order.createdAt),
        billNumber: order.billNumber || '',
        total: order.total,
        completedAt: order.completedAt ? new Date(order.completedAt) : undefined
      }));
      setCompletedOrders(frontendOrders);
    } catch (error) {
      console.error('Failed to fetch completed orders:', error);
      setCompletedOrders([]); // Clear on error
    } finally {
      setIsLoadingCompleted(false);
    }
  };

  // Load completed orders on mount
  useEffect(() => {
    fetchCompletedOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch completed orders when an order is completed
  useEffect(() => {
    if (socket) {
      const handleOrderCompleted = () => {
        // Re-fetch completed orders when a new order is completed
        fetchCompletedOrders();
      };
      
      socket.on('order:completed', handleOrderCompleted);
      
      return () => {
        socket.off('order:completed', handleOrderCompleted);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  return (
    <AdminLayout>
      <style>{`
        /* Café Theme Colors */
        :root {
          --cafe-primary: #3B2F2F;
          --cafe-accent: #C49A6C;
          --cafe-bg: #FAF7F2;
          --cafe-success: #3E7C59;
          --cafe-card: #FFFFFF;
          --cafe-border: #E8DDD0;
        }
        
        /* Override AdminLayout constraints for full-width header */
        .ms-main {
          padding: 0 !important;
          overflow-x: visible !important;
        }
        
        /* Convert sidebar to compact info strip */
        .ms-sidebar {
          padding: 12px 16px !important;
          border-right: 1px solid var(--cafe-border);
          background: var(--cafe-bg);
        }
        
        .ms-sidebar-section {
          padding: 12px 16px !important;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        
        .ms-sidebar-title {
          font-size: 12px !important;
          font-weight: 600 !important;
          color: var(--cafe-primary);
          margin-bottom: 4px !important;
          opacity: 0.8;
        }
        
        .ms-sidebar-text {
          font-size: 11px !important;
          line-height: 1.4 !important;
          color: var(--cafe-primary);
          opacity: 0.6;
          margin: 0 !important;
        }
        
        /* Main admin shell spacing – full-width layout */
        .ms-admin-container-wrapper {
          min-height: 100vh;
          background-color: var(--cafe-bg);
          padding: 0;
          overflow: visible;
          width: 100%;
          box-sizing: border-box;
        }
        
        .ms-admin-grid-layout {
          display: grid;
          grid-template-columns: 1fr;
          grid-auto-rows: minmax(min-content, auto);
          gap: 24px;
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
          overflow-y: visible;
          min-height: 0;
          padding: 24px 32px;
        }
        
        /* Stats Top Bar - Horizontal */
        .ms-admin-stats-bar {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }
        
        @media (max-width: 767px) {
          .ms-admin-stats-bar {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
        
        .ms-metric-card {
          background: var(--cafe-card);
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(59, 47, 47, 0.08);
          border: 1px solid var(--cafe-border);
          transition: all 0.3s ease;
        }
        
        .ms-metric-card:hover {
          box-shadow: 0 4px 16px rgba(59, 47, 47, 0.12);
          transform: translateY(-2px);
        }
        
        .ms-metric-label {
          display: block;
          font-size: 13px;
          color: var(--cafe-primary);
          opacity: 0.7;
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        .ms-metric-value {
          display: block;
          font-size: 28px;
          font-weight: 700;
          color: var(--cafe-accent);
        }
        
        /* Live Orders - Full Width Section */
        .ms-admin-live-orders-section {
          background: var(--cafe-card);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(59, 47, 47, 0.08);
          border: 1px solid var(--cafe-border);
          min-height: 400px;
          width: 100%;
          box-sizing: border-box;
          overflow: visible;
        }
        
        .ms-admin-section-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--cafe-primary);
          margin-bottom: 20px;
        }
        
        /* Table styling with café theme */
        .ms-admin-table {
          width: 100%;
        }
        
        /* Live orders header row – responsive actions column */
        .ms-admin-table-head {
          display: grid;
          grid-template-columns: 100px 80px 1fr 100px minmax(450px, auto);
          gap: 16px;
          padding: 16px;
          background: var(--cafe-bg);
          border-radius: 12px;
          margin-bottom: 12px;
          font-weight: 600;
          font-size: 13px;
          color: var(--cafe-primary);
          width: 100%;
          box-sizing: border-box;
        }
        
        /* Live orders rows – ensure actions stay visible and aligned */
        .ms-admin-table-row {
          display: grid;
          grid-template-columns: 100px 80px 1fr 100px minmax(450px, auto);
          gap: 16px;
          padding: 16px;
          background: var(--cafe-card);
          border-radius: 12px;
          margin-bottom: 12px;
          border: 1px solid var(--cafe-border);
          transition: all 0.3s ease;
          align-items: start;
          width: 100%;
          box-sizing: border-box;
        }
        
        .ms-admin-table-row:active {
          transform: translateY(0);
        }
        
        /* Actions column – TWO-ROW STRUCTURE */
        .ms-admin-row-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-width: 0;
          width: 100%;
        }
        
        /* Row 1: Status buttons (PLACED, PREPARING, READY, SERVED) */
        .ms-admin-status-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          justify-content: flex-start;
        }
        
        .ms-admin-status-buttons button {
          white-space: nowrap;
          font-size: 11px;
          padding: 6px 14px;
          min-width: 100px;
        }
        
        /* Row 2: Secondary actions (Complete Order, View bill) */
        .ms-admin-secondary-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          justify-content: flex-start;
        }
        
        .ms-admin-secondary-actions button {
          white-space: nowrap;
          font-size: 12px;
          padding: 8px 16px;
          min-width: 120px;
        }
        
        .ms-admin-table-row:hover {
          box-shadow: 0 4px 12px rgba(59, 47, 47, 0.1);
          transform: translateY(-2px);
          border-color: var(--cafe-accent);
        }
        
        /* Button styling with café theme */
        .ms-primary-cta {
          background: #2a2121;
          color: white;
          border: none;
          border-radius: 12px;
          padding: 10px 20px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 6px rgba(59, 47, 47, 0.2);
        }
        
        .ms-primary-cta:hover {
          background: #1f1818;
          box-shadow: 0 4px 12px rgba(59, 47, 47, 0.3);
          transform: translateY(-1px);
        }
        
        .ms-primary-cta:active {
          transform: translateY(0);
        }
        
        .ms-secondary-cta {
          background: var(--cafe-accent);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 10px 20px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 6px rgba(196, 154, 108, 0.2);
        }
        
        .ms-secondary-cta:hover {
          background: #B0885A;
          box-shadow: 0 4px 12px rgba(196, 154, 108, 0.3);
          transform: translateY(-1px);
        }
        
        .ms-secondary-cta:active {
          transform: translateY(0);
        }
        
        .ms-tertiary-cta {
          background: transparent;
          color: var(--cafe-primary);
          border: 1px solid var(--cafe-border);
          border-radius: 12px;
          padding: 10px 20px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .ms-tertiary-cta:hover {
          background: var(--cafe-bg);
          border-color: var(--cafe-accent);
        }
        
        .ms-tertiary-cta:active {
          transform: translateY(0);
        }
        
        /* Completed Orders - Collapsible Section */
        .ms-admin-completed-section {
          background: var(--cafe-card);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(59, 47, 47, 0.08);
          border: 1px solid var(--cafe-border);
          margin-top: 24px;
          width: 100%;
          box-sizing: border-box;
          overflow: visible;
          max-height: 480px;
          overflow-y: auto;
        }
        
        .ms-completed-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          padding: 12px;
          border-radius: 12px;
          transition: background 0.3s ease;
          position: sticky;
          top: 0;
          background: var(--cafe-card);
          z-index: 1;
        }
        
        .ms-completed-header:hover {
          background: var(--cafe-bg);
        }
        
        .ms-completed-orders-list {
          max-height: 420px;
          overflow-y: auto;
          padding-top: 16px;
        }
        
        .ms-completed-order-item {
          padding: 16px;
          background: var(--cafe-bg);
          border: 1px solid var(--cafe-border);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 12px;
          word-wrap: break-word;
        }
        
        .ms-completed-order-item:hover {
          background: #F5F0E8;
          border-color: var(--cafe-accent);
          box-shadow: 0 2px 8px rgba(59, 47, 47, 0.1);
          transform: translateX(4px);
        }
        
        /* Item details styling within completed orders */
        .ms-completed-order-item .ms-order-item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid var(--cafe-border);
          font-size: 13px;
        }
        
        .ms-completed-order-item .ms-order-item-row:last-child {
          border-bottom: none;
        }
        
        .ms-completed-order-item .ms-order-item-name {
          font-weight: 500;
          color: var(--cafe-primary);
          margin-bottom: 2px;
        }
        
        .ms-completed-order-item .ms-order-item-meta {
          font-size: 11px;
          color: var(--cafe-primary);
          opacity: 0.6;
        }
        
        .ms-completed-order-item .ms-order-item-total {
          font-size: 13px;
          font-weight: 600;
          color: var(--cafe-primary);
        }
        
        /* Responsive adjustments for all devices */
        
        /* Tablet: 768px - 1023px */
        @media (min-width: 768px) and (max-width: 1023px) {
          .ms-admin-grid-layout {
            padding: 20px 24px;
          }
          
          .ms-admin-table-head,
          .ms-admin-table-row {
            grid-template-columns: 90px 70px 1fr 90px minmax(380px, auto);
            gap: 12px;
            padding: 14px;
          }
          
          .ms-admin-status-buttons button {
            font-size: 10px;
            padding: 5px 12px;
            min-width: 90px;
          }
          
          .ms-admin-secondary-actions button {
            font-size: 11px;
            padding: 7px 14px;
            min-width: 110px;
          }
        }
        
        /* Mobile: < 768px */
        @media (max-width: 767px) {
          .ms-admin-grid-layout {
            padding: 16px;
            gap: 20px;
          }
          
          .ms-admin-container-wrapper {
            padding: 0;
          }
          
          .ms-sidebar {
            padding: 10px 12px !important;
          }
          
          .ms-sidebar-section {
            padding: 8px 12px !important;
          }
          
          .ms-panel-header {
            flex-direction: column;
            gap: 16px;
          }
          
          .ms-panel-title {
            font-size: 24px;
          }
          
          .ms-admin-stats-bar {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          
          .ms-metric-card {
            padding: 16px;
          }
          
          .ms-admin-live-orders-section {
            padding: 16px;
            border-radius: 12px;
          }
          
          .ms-admin-section-title {
            font-size: 18px;
            margin-bottom: 16px;
          }
          
          .ms-admin-table-head,
          .ms-admin-table-row {
            grid-template-columns: 1fr;
            gap: 12px;
            padding: 12px;
          }
          
          .ms-admin-table-head span,
          .ms-admin-table-row span {
            display: block;
            margin-bottom: 4px;
          }
          
          .ms-admin-table-head span:first-child::before {
            content: "Bill: ";
            font-weight: 600;
          }
          
          .ms-admin-table-row span:nth-child(2)::before {
            content: "Table: ";
            font-weight: 600;
          }
          
          .ms-admin-table-row span:nth-child(3)::before {
            content: "Status: ";
            font-weight: 600;
          }
          
          .ms-admin-table-row span:nth-child(4)::before {
            content: "Total: ";
            font-weight: 600;
          }
          
          .ms-admin-row-actions {
            gap: 12px;
          }
          
          .ms-admin-status-buttons {
            flex-direction: column;
            width: 100%;
          }
          
          .ms-admin-status-buttons button {
            width: 100%;
            min-width: 0;
            font-size: 12px;
            padding: 10px 16px;
          }
          
          .ms-admin-secondary-actions {
            flex-direction: column;
            width: 100%;
          }
          
          .ms-admin-secondary-actions button {
            width: 100%;
            min-width: 0;
            font-size: 13px;
            padding: 10px 18px;
          }
          
          .ms-admin-completed-section {
            padding: 16px;
            border-radius: 12px;
          }
        }
        
        /* Large desktop: ≥ 1920px */
        @media (min-width: 1920px) {
          .ms-admin-grid-layout {
            padding: 32px 48px;
            max-width: 1920px;
            margin: 0 auto;
          }
          
          .ms-admin-table-head,
          .ms-admin-table-row {
            grid-template-columns: 120px 100px 1fr 120px minmax(500px, auto);
            gap: 20px;
            padding: 20px;
          }
        }
        
        /* Panel styling */
        .ms-panel {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          background: transparent;
        }
        
        /* Full-width header – no constraints */
        .ms-panel-header {
          margin-bottom: 24px;
          width: 100%;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
          flex-wrap: wrap;
        }
        
        .ms-panel-title {
          color: var(--cafe-primary);
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
          flex: 1;
          min-width: 0;
        }
        
        .ms-panel-subtitle {
          color: var(--cafe-primary);
          opacity: 0.6;
          font-size: 14px;
        }
        
        /* Header action buttons – full-width responsive group */
        .ms-admin-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
          justify-content: flex-end;
          flex-shrink: 0;
          min-width: 0;
        }
        
        .ms-admin-actions button {
          min-width: 140px;
          white-space: nowrap;
        }
        
        /* Responsive header adjustments */
        @media (max-width: 1023px) {
          .ms-panel-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .ms-admin-actions {
            width: 100%;
            justify-content: stretch;
          }
          
          .ms-admin-actions button {
            flex: 1;
            min-width: 0;
          }
        }
        
        @media (max-width: 767px) {
          .ms-admin-actions {
            flex-direction: column;
          }
          
          .ms-admin-actions button {
            width: 100%;
          }
        }
      `}</style>
      
      <div className="ms-admin-container-wrapper">
        <div className="ms-admin-grid-layout">
          {/* Header with Actions */}
        <header className="ms-panel-header ms-admin-header">
          <div>
            <h1 className="ms-panel-title">Admin dashboard</h1>
            <p className="ms-panel-subtitle">
              Franchise-ready overview with live orders, revenue and stock.
            </p>
          </div>
          <div className="ms-admin-actions">
            <button
              type="button"
              className="ms-secondary-cta"
              onClick={() => navigate("/admin/stocks")}
            >
              Stocks Management
            </button>
            <button
              type="button"
              className="ms-secondary-cta"
              onClick={handlePrintDaily}
            >
              Print daily summary
            </button>
          </div>
        </header>

          {/* Stats Top Bar - Horizontal */}
          <section className="ms-admin-stats-bar">
          <div className="ms-metric-card">
            <span className="ms-metric-label">Total revenue</span>
            <span className="ms-metric-value">₹ {totalRevenue}</span>
          </div>
          <div className="ms-metric-card">
            <span className="ms-metric-label">Orders today</span>
            <span className="ms-metric-value">{orders.length}</span>
          </div>
          <div className="ms-metric-card">
            <span className="ms-metric-label">Active orders</span>
            <span className="ms-metric-value">{activeOrders}</span>
          </div>
        </section>

          {/* Live Orders - Full Width Section */}
          <section className="ms-admin-live-orders-section">
            <h2 className="ms-admin-section-title">Live orders</h2>
            <div className="ms-admin-table-wrapper">
              <div className="ms-admin-table">
                <div className="ms-admin-table-head">
                  <span>Bill</span>
                  <span>Table</span>
                  <span>Status</span>
                  <span>Total</span>
                  <span>Actions</span>
                </div>
                <div className="ms-admin-table-body">
                  {isLoading ? (
                    <div className="ms-admin-table-empty">
                      Loading orders...
                    </div>
                  ) : (
                    <>
                      {orders.map((order) => {
                        const currentStatus = order.status;

                        return (
                          <div
                            key={order.id}
                            className="ms-admin-table-row"
                          >
                          <span>{order.billNumber}</span>
                          <span>{order.table}</span>
                          <span>{order.status}</span>
                          <span>₹ {order.total}</span>
                          <span className="ms-admin-row-actions">
                              {/* Row 1: Status flow buttons (PLACED → IN_PREPARATION → READY → SERVED) */}
                              <div className="ms-admin-status-buttons">
                                {STATUS_FLOW.slice(0, 4).map((status) => {
                                  const isCurrent = status === currentStatus;
                                  const canTransition =
                                    !isCurrent && isValidTransition(currentStatus, status);
                                  const isEnabled = canTransition;

                                  const className = isCurrent
                                    ? "ms-primary-cta" // current state highlighted
                                    : isEnabled
                                    ? "ms-secondary-cta" // valid forward/backward step
                                    : "ms-tertiary-cta"; // invalid future state

                                  return (
                                    <button
                                      key={status}
                                      type="button"
                                      className={className}
                                      disabled={!isEnabled}
                                      onClick={() => {
                                        if (isEnabled) {
                                          handleStatusChange(order.id, status, currentStatus);
                                        }
                                      }}
                                      style={{
                                        opacity: isCurrent || isEnabled ? 1 : 0.4,
                                        cursor: isEnabled ? "pointer" : "not-allowed",
                                      }}
                                      title={
                                        isCurrent
                                          ? `Current status: ${status}`
                                          : isEnabled
                                          ? `Change status to ${status}`
                                          : `Cannot jump to ${status}. Forward movement allowed only one step.`
                                      }
                                    >
                                      {status}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Row 2: Secondary actions (Complete Order, View bill) */}
                              <div className="ms-admin-secondary-actions">
                                {/* COMPLETE ORDER: always visible, enabled only when SERVED */}
                            <button
                              type="button"
                                  className="ms-secondary-cta"
                                  disabled={currentStatus !== "SERVED"}
                                  onClick={() => {
                                    if (currentStatus === "SERVED") {
                                      handleCompleteOrder(order.id);
                                    }
                                  }}
                                  style={{
                                    opacity: currentStatus === "SERVED" ? 1 : 0.4,
                                    cursor:
                                      currentStatus === "SERVED"
                                        ? "pointer"
                                        : "not-allowed",
                                  }}
                                  title={
                                    currentStatus === "SERVED"
                                      ? "Complete order and move to Completed Orders"
                                      : "Complete Order is available only after SERVED"
                                  }
                            >
                              Complete Order
                            </button>

                            <button
                              type="button"
                              className="ms-tertiary-cta"
                              onClick={() => openBillFromAdmin(order)}
                            >
                              View bill
                            </button>
                              </div>
                          </span>
                        </div>
                        );
                      })}
                      {orders.length === 0 && (
                        <div className="ms-admin-table-empty">
                          No orders yet today.
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Completed Orders - Collapsible Section */}
          <section className="ms-admin-completed-section">
            <div
              className="ms-completed-header"
              onClick={() => setShowCompletedOrders(!showCompletedOrders)}
            >
              <div>
                <h2 className="ms-admin-section-title" style={{ margin: 0 }}>
                  Completed Orders
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--cafe-primary)', opacity: 0.6, margin: '4px 0 0 0' }}>
                  {completedOrders.length} completed {completedOrders.length === 1 ? 'order' : 'orders'} today
                </p>
              </div>
              <span
                style={{
                  fontSize: '20px',
                  color: 'var(--cafe-accent)',
                  transform: showCompletedOrders ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }}
              >
                ▼
              </span>
          </div>

            {showCompletedOrders && (
              <div
                className="ms-completed-orders-list"
                style={{ overflowY: 'auto' }}
              >
                {isLoadingCompleted ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--cafe-primary)', opacity: 0.6 }}>
                    Loading...
                  </div>
                ) : (
                  <>
                    {completedOrders.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '24px', color: 'var(--cafe-primary)', opacity: 0.6 }}>
                        No completed orders today.
                      </div>
                    ) : (
                      completedOrders.map((order) => (
                        <div
                          key={order.id}
                          className="ms-completed-order-item"
                          onClick={() => navigate(`/bill/${order.id}`)}
                        >
                          {/* Order Header */}
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            marginBottom: '12px',
                            paddingBottom: '12px',
                            borderBottom: '1px solid var(--cafe-border)'
                          }}>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--cafe-primary)', marginBottom: '4px' }}>
                                {order.billNumber || `Order ${order.id.slice(-6)}`}
                              </div>
                              <div style={{ fontSize: '12px', color: 'var(--cafe-primary)', opacity: 0.7 }}>
                                Table {order.table}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--cafe-success)', marginBottom: '4px' }}>
                                ₹{order.total}
                              </div>
                              {order.completedAt && (
                                <div style={{ fontSize: '11px', color: 'var(--cafe-primary)', opacity: 0.5 }}>
                                  {new Date(order.completedAt).toLocaleTimeString()}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Full Item Details */}
                          <div style={{ marginTop: '12px' }}>
                            {order.batches && order.batches.length > 0 ? (
                              order.batches.map((batch: any, batchIndex: number) => (
                                <div key={batch.batchId || batchIndex} style={{ marginBottom: '12px' }}>
                                  {batch.items && batch.items.length > 0 && (
                                    <div>
                                      {batch.items.map((item: any, itemIndex: number) => (
                                        <div
                                          key={itemIndex}
                                          style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '8px 0',
                                            borderBottom: itemIndex < batch.items.length - 1 ? '1px solid var(--cafe-border)' : 'none',
                                            fontSize: '13px'
                                          }}
                                        >
                                          <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '500', color: 'var(--cafe-primary)', marginBottom: '2px' }}>
                                              {item.name || 'Unknown Item'}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--cafe-primary)', opacity: 0.6 }}>
                                              Qty: {item.quantity} × ₹{item.price}
                                            </div>
                                          </div>
                                          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--cafe-primary)' }}>
                                            ₹{item.price * item.quantity}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div style={{ fontSize: '12px', color: 'var(--cafe-primary)', opacity: 0.6, fontStyle: 'italic' }}>
                                No items found
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}
          </div>
            )}
        </section>
        </div>
      </div>
    </AdminLayout>
  );
};

