import { useState, useEffect } from "react";
import { adminAPI } from "../utils/api";

/**
 * PrintDailySummary component for displaying and printing daily order summaries.
 * 
 * Fetches today's SERVED/COMPLETED orders from backend and displays them for printing.
 */
export const PrintDailySummary = () => {
  const [summaryData, setSummaryData] = useState<{
    date: string;
    totalOrders: number;
    totalRevenue: number;
    orders: Array<{
      billNumber: string;
      tableNumber: string;
      totalAmount: number;
      finalStatus: string;
      createdAt: string;
    }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch daily summary from backend on mount
  useEffect(() => {
    const fetchDailySummary = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await adminAPI.getDailySummary();
        setSummaryData(response);
      } catch (err) {
        console.error('Failed to fetch daily summary:', err);
        setError('Failed to load daily summary. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDailySummary();
  }, []);

  // Trigger print when data is loaded
  useEffect(() => {
    if (!isLoading && summaryData) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        window.print();
      }, 100);
    }
  }, [isLoading, summaryData]);

  if (isLoading) {
    return (
      <div className="ms-admin-container">
        <section className="ms-panel ms-daily-summary">
          <p>Loading daily summary...</p>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ms-admin-container">
        <section className="ms-panel ms-daily-summary">
          <p>{error}</p>
        </section>
      </div>
    );
  }

  if (!summaryData) {
    return (
      <div className="ms-admin-container">
        <section className="ms-panel ms-daily-summary">
          <p>No summary data available.</p>
        </section>
      </div>
    );
  }

  const { date, totalOrders, totalRevenue, orders } = summaryData;

  return (
    <div className="ms-admin-container">
      <section className="ms-panel ms-daily-summary">
        <header className="ms-panel-header">
          <h1 className="ms-panel-title">Daily summary</h1>
          <p className="ms-panel-subtitle">
            Compact snapshot of today&apos;s orders for printout.
          </p>
        </header>
        <div className="ms-daily-meta">
          <span>Date: {new Date(date).toLocaleDateString()}</span>
          <span>Orders: {totalOrders}</span>
          <span>Total revenue: ₹ {totalRevenue}</span>
        </div>
        <div className="ms-admin-table-wrapper">
          <div className="ms-mobile-table-scroll">
            <div className="ms-daily-table">
              <div className="ms-daily-table-head">
                <span>Bill</span>
                <span>Table</span>
                <span>Total</span>
                <span>Time</span>
              </div>
              {orders.map((order, index) => (
                <div key={`${order.billNumber}-${order.tableNumber}-${index}`} className="ms-daily-table-row">
                  <span>{order.billNumber || 'N/A'}</span>
                  <span>{order.tableNumber}</span>
                  <span>₹ {order.totalAmount}</span>
                  <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="ms-daily-table-empty">No orders recorded for today.</div>
              )}
            </div>
          </div>
        </div>
        <div className="ms-daily-footer">
          <span>System Generated Report</span>
        </div>
      </section>
    </div>
  );
};

