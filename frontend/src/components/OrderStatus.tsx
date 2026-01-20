import type { Order, OrderStep } from "../types";

interface OrderStatusProps {
  order: Order;
  steps: OrderStep[];
}

/**
 * OrderStatus component displaying order tracking status.
 * 
 * TODO: Order status will be fetched from backend API when integration is added.
 * TODO: Real-time status updates will be implemented with WebSocket/SSE when backend is added.
 */
export const OrderStatus = ({ order, steps }: OrderStatusProps) => {
  const currentIndex = steps.indexOf(order.status);

  // Combine all items from all batches into a single list for display
  // Items are stored with name and price from backend (locked at order time)
  const allItems = order.batches.flatMap((batch) => 
    batch.items.map((item: any) => ({
      name: item.name || 'Unknown Item',
      quantity: item.quantity,
      price: item.price || 0
    }))
  );

  return (
    <div className="ms-orders-container">
      <section className="ms-panel">
        <header className="ms-panel-header">
          <h1 className="ms-panel-title">Order status</h1>
          <p className="ms-panel-subtitle">
            Calm, step-by-step tracking while the bar moves.
          </p>
        </header>
        <div className="ms-status-meta">
          <span>Bill: {order.billNumber}</span>
          <span>Table: {order.table}</span>
          <span>Total: ₹ {order.total}</span>
        </div>
        <ol className="ms-status-steps">
          {steps.map((step, index) => {
            const state =
              index < currentIndex
                ? "done"
                : index === currentIndex
                ? "active"
                : "upcoming";
            return (
              <li key={step} className={`ms-status-step ms-status-step-${state}`}>
                <div className="ms-status-bullet" />
                <div className="ms-status-label">{step}</div>
              </li>
            );
          })}
        </ol>
        
        {/* Display ordered items for customer verification */}
        {allItems.length > 0 && (
          <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid #E5E7EB" }}>
            <h3 style={{ marginBottom: "16px", fontSize: "16px", fontWeight: "600", color: "#1F2937", fontFamily: "'Poppins', 'Inter', sans-serif" }}>Ordered Items</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {allItems.map((item, index) => (
                <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontWeight: "500", color: "#1F2937" }}>{item.name}</span>
                    <span style={{ color: "#6B7280", fontSize: "14px" }}>× {item.quantity}</span>
                  </div>
                  <span style={{ fontWeight: "500", color: "#1F2937" }}>₹ {item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};












