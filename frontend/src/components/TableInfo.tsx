import type { Order } from "../types";

interface TableInfoProps {
  tableNumber: number | null;
  currentOrder: Order | null;
}

/**
 * TableInfo component displaying current table number and order status in the sidebar.
 * 
 * TODO: Order data will be fetched from backend API when integration is added.
 */
export const TableInfo = ({ tableNumber, currentOrder }: TableInfoProps) => {
  return (
    <aside className="ms-sidebar">
      <div className="ms-sidebar-inner">
        <div className="ms-sidebar-section">
          <h2 className="ms-sidebar-title">Single QR · Multi Tables</h2>
          <p className="ms-sidebar-text">
            Guests scan once, select their table (1–9), and place orders
            directly from this console.
          </p>
        </div>
        {currentOrder && (
          <div className="ms-sidebar-section">
            <h3 className="ms-sidebar-subtitle">Current Order</h3>
            <p className="ms-sidebar-meta">
              Bill: <span>{currentOrder.billNumber}</span>
            </p>
            <p className="ms-sidebar-meta">
              Status: <span>{currentOrder.status}</span>
            </p>
            <p className="ms-sidebar-meta">
              Total: <span>₹ {currentOrder.total}</span>
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};












