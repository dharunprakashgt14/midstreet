import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { CartItem } from "../types";

interface HeaderProps {
  tableNumber: number | null;
  cart: CartItem[];
}

/**
 * Header component displaying brand, table info, admin link, and cart icon.
 * 
 * TODO: Menu data will be injected here when backend integration is added.
 * TODO: Cart count will be synced with backend cart state.
 */
export const Header = ({ tableNumber, cart }: HeaderProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleAdminNav = () => {
    if (isAuthenticated) {
      navigate("/admin");
    } else {
      navigate("/admin/login");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const cartItemCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <header className="ms-header">
      <div className="ms-header-left">
        <div className="ms-brand">
          <span className="ms-brand-mark">MID</span>
          <span className="ms-brand-text">Street Café</span>
        </div>
        <div className="ms-header-divider" />
        <div className="ms-context">
          <span className="ms-context-label">Ordering Console</span>
        </div>
      </div>
      <div className="ms-header-right">
        <div className="ms-table-badge">
          <span className="ms-table-label">Table</span>
          <span className="ms-table-value">
            {tableNumber ?? "—"}
          </span>
        </div>
        <button
          type="button"
          className="ms-header-link"
          onClick={handleAdminNav}
        >
          Admin
        </button>
        {isAuthenticated && (
          <button
            type="button"
            className="ms-header-link"
            onClick={handleLogout}
          >
            Logout
          </button>
        )}
        <div className="ms-cart-icon">
          <span className="ms-cart-symbol">🧺</span>
          <span className="ms-cart-count">
            {cartItemCount}
          </span>
        </div>
      </div>
    </header>
  );
};












