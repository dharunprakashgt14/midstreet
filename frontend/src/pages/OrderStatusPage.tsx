import { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useAppState } from "../context/AppStateContext";
import { useSocket } from "../context/SocketContext";
import { orderAPI } from "../utils/api";
import { OrderStatus } from "../components/OrderStatus";
import { Header } from "../components/Header";
import type { Order, OrderStep } from "../types";

const ORDER_STEPS: OrderStep[] = [
  "PLACED",
  "IN_PREPARATION",
  "READY",
  "SERVED"
];

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
 * OrderStatusPage component - Displays order status tracking for the current order.
 *
 * Route: /table/:tableId/order-status
 *
 * Fetches active order from MongoDB via backend API using table number.
 * Polls backend every 2.5 seconds for latest status updates.
 * Automatically hides order when status becomes SERVED (isActive = false).
 * All order data is persisted in MongoDB - no localStorage usage.
 */
export const OrderStatusPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { menuItems } = useAppState();
  const { socket } = useSocket();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderNotFound, setOrderNotFound] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  // Store served order data separately to persist during thank-you screen
  const [servedOrderData, setServedOrderData] = useState<{ billNumber?: string; table: number } | null>(null);

  const tableId = params.tableId ? Number(params.tableId) : null;

  if (!tableId) {
    return <Navigate to="/" replace />;
  }

  // Fetch active order from backend using table number only (no localStorage)
  // Poll every 2-3 seconds to sync with admin status updates
  useEffect(() => {
    // Fetch active order by table number from MongoDB
    const fetchActiveOrderByTable = async (isPolling = false) => {
      try {
        if (!isPolling) {
          setIsLoading(true);
        }
        
        // If thank-you screen is active, ignore polling updates to prevent interference
        if (showThankYou) {
          if (!isPolling) {
            setIsLoading(false);
          }
          return;
        }
        
        // Fetch active order from backend - backend queries MongoDB (isCompleted = false)
        const backendOrder = await orderAPI.getActiveByTable(tableId);
        
        // COMPLETED orders (isCompleted = true) are removed from customer view
        if (!backendOrder || backendOrder.isCompleted) {
          // No active order found (COMPLETED orders are hidden)
          if (!showThankYou) {
            setOrder(null);
            setOrderNotFound(true);
          }
          if (!isPolling) {
            setIsLoading(false);
          }
          return;
        }
        
        // Transform backend order to frontend format for UI rendering
        const frontendOrder: Order = {
          id: backendOrder._id,
          table: Number(backendOrder.tableNo) as any,
          batches: backendOrder.batches.map((batch: any) => ({
            batchId: batch.batchId,
            items: batch.items.map((item: any) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              // Preserve name and price from backend for item display
              name: item.name,
              price: item.price
            })) as any,
            status: mapBackendStatusToFrontend(batch.status),
            total: batch.total,
            createdAt: new Date(batch.createdAt || backendOrder.createdAt)
          })),
          status: mapBackendStatusToFrontend(backendOrder.status),
          createdAt: new Date(backendOrder.createdAt),
          billNumber: backendOrder.billNumber || '',
          total: backendOrder.total
        };
        
        // SERVED orders: Hide order details, show thank-you message ONLY
        // EXACT conditional rendering as specified
        if (frontendOrder.status === 'SERVED') {
          // Show thank-you message only, no order items, no "No active order" message
          if (!showThankYou) {
            setShowThankYou(true);
            setServedOrderData({
              billNumber: frontendOrder.billNumber || undefined,
              table: frontendOrder.table
            });
          }
          // Do NOT set order - hide order details completely
          setOrder(null);
          setOrderNotFound(false); // Prevent "No active order" message
        } else {
          // Update UI state with backend data (order persisted in MongoDB)
          setOrder(frontendOrder);
          setOrderNotFound(false);
          // Hide thank-you if status changed from SERVED
          if (showThankYou && frontendOrder.status !== 'SERVED') {
            setShowThankYou(false);
          }
        }
        
        setOrderNotFound(false);
        
        if (!isPolling) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch active order by table:', error);
        setOrder(null);
        setOrderNotFound(true);
        if (!isPolling) {
          setIsLoading(false);
        }
      }
    };

    // Initial fetch from backend
    fetchActiveOrderByTable(false);

    // Poll every 2.5 seconds to sync with admin updates
    const pollInterval = setInterval(() => {
      fetchActiveOrderByTable(true);
    }, 2500);

    return () => {
      clearInterval(pollInterval);
    };
  }, [tableId, showThankYou]);

  // Set up real-time Socket.IO listeners - fetch from backend, no localStorage
  // Join table room to receive order updates for this table
  useEffect(() => {
    if (!socket) return;

    // Join table room for this table - ensures we receive all updates for this table
    socket.emit('join:table', tableId);
    
    // Join order room if we have a current order
    if (order?.id) {
      socket.emit('join:order', order.id);
    }

    // Listen for order updates - check if update is for this table
    const handleOrderUpdate = (data: { order: any; batchId?: string }) => {
      // If thank-you screen is active, ignore socket updates to prevent interference
      if (showThankYou) {
        return;
      }
      
      const orderTableId = Number(data.order.tableNo);
      
      // Update if order matches this table
      if (orderTableId === tableId) {
        // COMPLETED orders (isCompleted = true) are removed from view
        // Reset customer view like a new session - no navigation, just clear state
        if (data.order.isCompleted) {
          // COMPLETED order - reset all customer state
          setOrder(null);
          setOrderNotFound(true);
          setShowThankYou(false);
          setServedOrderData(null);
          // Stay on same page - do NOT navigate
          return;
        }

        // SERVED (paid) orders: Hide order details, show thank-you message ONLY
        if (data.order.status === 'paid') {
          // Show thank-you message and hide order details
          // No order items, no "No active order" message
          setOrder(null);
          setShowThankYou(true);
          setServedOrderData({
            billNumber: data.order.billNumber || undefined,
            table: orderTableId
          });
          setOrderNotFound(false); // Prevent "No active order" message
          return;
        }

        // Update if order is not completed and for this table
        if (!data.order.isCompleted && !showThankYou) {
          const updatedOrder: Order = {
            id: data.order._id,
            table: orderTableId as any,
            batches: data.order.batches.map((batch: any) => ({
              batchId: batch.batchId,
              items: batch.items.map((item: any) => ({
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                // Preserve name and price from backend for item display
                name: item.name,
                price: item.price
              })) as any,
              status: mapBackendStatusToFrontend(batch.status),
              total: batch.total,
              createdAt: new Date(batch.createdAt || data.order.createdAt)
            })),
            status: mapBackendStatusToFrontend(data.order.status),
            createdAt: new Date(data.order.createdAt),
            billNumber: data.order.billNumber || '',
            total: data.order.total
          };

          // Check if order status just became SERVED - hide order details, show thank-you only
          if (updatedOrder.status === 'SERVED') {
            setShowThankYou(true);
            setServedOrderData({
              billNumber: updatedOrder.billNumber || undefined,
              table: updatedOrder.table
            });
            // Hide order details completely - do NOT set order
            setOrder(null);
            setOrderNotFound(false); // Prevent "No active order" message
          } else {
            // Update UI state with backend data for non-SERVED orders
            setOrder(updatedOrder);
            setOrderNotFound(false);
            // Hide thank-you if status changed from SERVED
            if (showThankYou && updatedOrder.status !== 'SERVED') {
              setShowThankYou(false);
            }
          }
          
          // Join order room for this specific order
          socket.emit('join:order', data.order._id);
        }
      }
    };

    socket.on('order:update', handleOrderUpdate);

    // Cleanup listeners on unmount
    return () => {
      socket.off('order:update', handleOrderUpdate);
      socket.emit('leave:table', tableId);
      if (order?.id) {
        socket.emit('leave:order', order.id);
      }
    };
  }, [socket, tableId, order, showThankYou]);

  const handleBack = () => {
    navigate(`/table/${tableId}`, { replace: true });
  };

  // Auto-redirect after 6-7 seconds when SERVED status is detected
  // Timer starts ONLY when status === SERVED
  useEffect(() => {
    if (showThankYou) {
      const redirectTimer = setTimeout(() => {
        // Clear all states and redirect to home page
        setShowThankYou(false);
        setServedOrderData(null);
        setOrder(null);
        navigate(`/table/${tableId}`, { replace: true });
      }, 6500); // 6.5 seconds - matches POS UX standards

      return () => {
        clearTimeout(redirectTimer);
      };
    }
  }, [showThankYou, navigate, tableId]);

  return (
    <div className="ms-app-shell">
      <Header tableNumber={tableId} cart={[]} />

      <div className="ms-layout">
        <aside className="ms-sidebar">
          <div className="ms-sidebar-inner">
            <div className="ms-sidebar-section">
              <h2 className="ms-sidebar-title">Order Status</h2>
              <p className="ms-sidebar-text">
                Track your order progress in real-time.
              </p>
            </div>
          </div>
        </aside>

        <main className="ms-main">
          <div className="ms-main-header-row">
            <button
              className="ms-back-button"
              type="button"
              onClick={handleBack}
            >
              ← Back
            </button>
            <span className="ms-main-context">Table {tableId}</span>
          </div>

          {isLoading ? (
            <div className="ms-panel">
              <p>Loading order status...</p>
            </div>
          ) : showThankYou ? (
            // EXACT conditional rendering: IF order.status === "SERVED"
            // Show thank-you message only, no order items, no "No active order" message
            <div className="ms-thank-you-screen">
              <div className="ms-thank-you-content">
                <div className="ms-thank-you-icon">✓</div>
                <h1 className="ms-thank-you-title">Thank you for dining with us!</h1>
                <p className="ms-thank-you-message">
                  Your order has been served successfully.
                </p>
                <p className="ms-thank-you-submessage">
                  We hope you enjoyed your meal. You'll be redirected to the menu in a moment.
                </p>
                {servedOrderData?.billNumber && (
                  <div className="ms-thank-you-bill">
                    <span>Bill Number: {servedOrderData.billNumber}</span>
                  </div>
                )}
              </div>
            </div>
          ) : orderNotFound || !order ? (
            // ELSE IF no order exists: Show "No active order"
            <div className="ms-panel">
              <header className="ms-panel-header">
                <h2 className="ms-panel-title">No active order</h2>
                <p className="ms-panel-subtitle">
                  Place an order to track its status here.
                </p>
              </header>
            </div>
          ) : (
            // ELSE: Show normal order tracking UI
            <div style={{ marginBottom: "24px" }}>
              {/* CRITICAL FIX: Render ONLY ONE status bar per order, bound to order.status */}
              {/* Admin controls order.status at ORDER level, not batch level */}
              <OrderStatus 
                order={{
                  id: order.id,
                  table: order.table,
                  batches: order.batches, // Keep all batches for item display
                  status: order.status, // Use ORDER-level status (not batch.status)
                  createdAt: order.createdAt,
                  billNumber: order.billNumber,
                  total: order.total
                }} 
                steps={ORDER_STEPS} 
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
