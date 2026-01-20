import { Routes, Route, Navigate } from "react-router-dom";
import { RequireAuth } from "./auth/AuthContext";
import { AppStateProvider } from "./context/AppStateContext";
import { OrderProvider } from "./context/OrderContext";
import { SocketProvider } from "./context/SocketContext";
import { getStoredTable } from "./utils/tablePersistence";
import { OrderPage } from "./pages/OrderPage";
import { OrderStatusPage } from "./pages/OrderStatusPage";
import { AdminPage } from "./pages/AdminPage";
import { AdminLogin } from "./pages/AdminLogin";
import { StocksManagement } from "./pages/StocksManagement";
import { PrintBill } from "./components/PrintBill";
import { PrintDailySummary } from "./components/PrintDailySummary";

/**
 * App component - Main router setup for the restaurant ordering system.
 * 
 * Route Structure:
 * - /table/:tableId → Ordering page (auto-loads tableId from URL)
 * - /table/:tableId/order-status → Order status tracking
 * - /admin → Admin dashboard (requires authentication)
 * - /admin/login → Admin login page
 * - /admin/stocks → Stocks management
 * - /admin/summary → Daily summary print view
 * - /bill/:orderId → Print bill view
 * 
 * TODO: QR codes will map to /table/:tableId routes (e.g., /table/2 for Table 2).
 * TODO: All routes will be protected/validated with backend when API integration is added.
 */
/**
 * Root redirect component - redirects to stored table or shows table selection
 */
const RootRedirect = () => {
  const storedTable = getStoredTable();
  if (storedTable) {
    return <Navigate to={`/table/${storedTable}`} replace />;
  }
  // If no stored table, redirect to table 1 as fallback
  return <Navigate to="/table/1" replace />;
};

export const App = () => {
  return (
    <SocketProvider>
      <AppStateProvider>
        <OrderProvider>
          <Routes>
          {/* Landing/root route - redirect to stored table or table 1 */}
          <Route path="/" element={<RootRedirect />} />

          {/* Order page routes - table-specific ordering */}
          <Route path="/table/:tableId" element={<OrderPage />} />
          <Route path="/table/:tableId/order-status" element={<OrderStatusPage />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<RequireAuth />}>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/stocks" element={<StocksManagement />} />
            <Route path="/admin/summary" element={<PrintDailySummary />} />
          </Route>

          {/* Print/view routes */}
          <Route path="/bill/:orderId" element={<PrintBill />} />

          {/* Catch-all - redirect to stored table or table 1 */}
          <Route path="*" element={<RootRedirect />} />
          </Routes>
        </OrderProvider>
      </AppStateProvider>
    </SocketProvider>
  );
};
