import { Navigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAppState } from "../context/AppStateContext";
import { useOrderContext } from "../context/OrderContext";
import { orderAPI } from "../utils/api";
import type { Order, CartItem } from "../types";

/**
 * PrintBill component for displaying and printing order bills.
 *
 * FIX: Now fetches order from backend by orderId to ensure data is available.
 * Handles both batch-based orders (new structure) and legacy item-based orders.
 */
export const PrintBill = () => {
  const params = useParams();
  const { orders, menuItems } = useAppState();
  const { activeOrder } = useOrderContext();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch order from backend by orderId (supports both _id and orderId lookup)
  useEffect(() => {
    const fetchOrder = async () => {
      if (!params.orderId) {
        setIsLoading(false);
        return;
      }

      try {
        // Try to find in local state first
        const orderFromState = orders.find((o) => o.id === params.orderId);
        if (orderFromState) {
          setOrder(orderFromState);
          setIsLoading(false);
          return;
        }

        // Fetch from backend
        const backendOrder = await orderAPI.getById(params.orderId);
        
        const frontendOrder: Order = {
          id: backendOrder._id,
          table: Number(backendOrder.tableNo) as any,
          batches: backendOrder.batches.map((batch: any) => ({
            batchId: batch.batchId,
            items: batch.items.map((item: any) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity
            })),
            status: backendOrder.status as any, // Status mapping not needed for bill
            total: batch.total,
            createdAt: new Date(batch.createdAt || backendOrder.createdAt)
          })),
          status: backendOrder.status as any,
          createdAt: new Date(backendOrder.createdAt),
          billNumber: backendOrder.billNumber || '',
          total: backendOrder.total // FIX: Use order total, not batch total
        };
        
        setOrder(frontendOrder);
      } catch (error) {
        console.error('Failed to fetch order for bill:', error);
        // FIX: Fallback to activeOrder if available - params.orderId is MongoDB _id
        if (activeOrder && activeOrder.orderId === params.orderId) {
          // Convert activeOrder to Order format (legacy support)
          const legacyOrder: Order = {
            id: activeOrder.orderId, // This is MongoDB _id
            table: activeOrder.tableId as any,
            batches: [{
              batchId: 'legacy',
              items: activeOrder.items,
              status: 'PLACED' as any,
              total: activeOrder.total,
              createdAt: new Date()
            }],
            status: 'PLACED' as any,
            createdAt: new Date(),
            billNumber: activeOrder.orderId,
            total: activeOrder.total
          };
          setOrder(legacyOrder);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [params.orderId, orders, activeOrder]);

  // FIX: Wait for data before rendering to prevent blank page
  if (isLoading) {
    return (
      <div className="ms-admin-container">
        <section className="ms-panel ms-bill">
          <p>Loading bill...</p>
        </section>
      </div>
    );
  }

  // FIX: Only show "No order" after loading completes and no order found
  if (!order) {
    return <Navigate to="/" replace />;
  }

  // Flatten all batches into a single items array for bill display
  const allItems: CartItem[] = [];
  order.batches.forEach((batch) => {
    batch.items.forEach((item) => {
      const existing = allItems.find((i) => i.menuItemId === item.menuItemId);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        allItems.push({ ...item });
      }
    });
  });

  const lines = allItems.map((c) => {
    const menuItem = menuItems.find((m) => m.id === c.menuItemId);
    return { cart: c, menuItem };
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="ms-admin-container">
      <section className="ms-panel ms-bill">
        <header className="ms-bill-header">
          <div>
            <h1 className="ms-panel-title">Bill</h1>
            <p className="ms-panel-subtitle">
              Generated reference: {order.billNumber}
            </p>
          </div>
          <button
            type="button"
            className="ms-secondary-cta ms-print-hide"
            onClick={handlePrint}
          >
            Print bill
          </button>
        </header>

        <div className="ms-bill-receipt">
          <div className="ms-bill-brand">
            <strong>MID STREET</strong>
            <span>Modern Café · Downtown (placeholder)</span>
          </div>
          <div className="ms-bill-meta">
            <span>Bill No: {order.billNumber}</span>
            <span>
              Date: {order.createdAt.toLocaleDateString()} ·{" "}
              {order.createdAt.toLocaleTimeString()}
            </span>
            <span>Table: {order.table}</span>
          </div>
          <div className="ms-admin-table-wrapper">
            <div className="ms-mobile-table-scroll">
              <div className="ms-bill-lines">
                <div className="ms-bill-lines-head">
                  <span>Item</span>
                  <span>Qty</span>
                  <span>Price</span>
                  <span>Subtotal</span>
                </div>
                {lines.map(({ cart, menuItem }) => (
                  <div key={cart.menuItemId} className="ms-bill-line-row">
                    <span>{menuItem?.name ?? "Removed item"}</span>
                    <span>{cart.quantity}</span>
                    <span>₹ {menuItem?.price ?? 0}</span>
                    <span>₹ {(menuItem?.price ?? 0) * cart.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="ms-bill-total-row">
            <span>Total</span>
            <span className="ms-price-strong">₹ {order.total}</span>
          </div>
          <div className="ms-bill-footer">
            <span>Thank you for dining with us.</span>
          </div>
        </div>
      </section>
    </div>
  );
};

