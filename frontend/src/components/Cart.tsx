import { useState } from "react";
import type { CartItem, MenuItem } from "../types";

interface CartProps {
  cart: CartItem[];
  total: number;
  onAdd: (menuItemId: string) => void;
  onDecrease: (menuItemId: string) => void;
  menuItems: MenuItem[];
}

/**
 * Cart component displaying the shopping cart dock with expandable items list.
 * 
 * TODO: Cart state will be synced with backend when API integration is added.
 * TODO (Order sync): When orders are backed by the server, this component
 * will reflect server-confirmed quantities and totals, and cart changes will
 * be reconciled with the active order on the backend.
 */
export const Cart = ({ cart, total, onAdd, onDecrease, menuItems }: CartProps) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const enrichedItems = cart.map((c) => {
    const menuItem = menuItems.find((m) => m.id === c.menuItemId);
    return { cart: c, menuItem };
  });

  return (
    <section className={expanded ? "ms-cart-dock ms-cart-dock-open" : "ms-cart-dock"}>
      <button
        type="button"
        className="ms-cart-dock-toggle"
        onClick={() => setExpanded((e) => !e)}
      >
        <span>Cart</span>
        <span className="ms-cart-pill">
          {cart.reduce((sum, c) => sum + c.quantity, 0)} items · ₹ {total}
        </span>
      </button>
      {expanded && (
        <div className="ms-cart-dock-body">
          {cart.length === 0 && (
            <p className="ms-cart-empty">Your order basket is empty.</p>
          )}
          {cart.length > 0 && (
            <>
              <ul className="ms-cart-list">
                {enrichedItems.map(({ cart: c, menuItem }) =>
                  !menuItem ? null : (
                    <li key={c.menuItemId} className="ms-cart-row">
                      <div className="ms-cart-row-main">
                        <span className="ms-cart-item-name">{menuItem.name}</span>
                        <span className="ms-cart-item-price">
                          ₹ {menuItem.price * c.quantity}
                        </span>
                      </div>
                      <div className="ms-qty-control ms-qty-control-compact">
                        <button
                          type="button"
                          onClick={() => onDecrease(c.menuItemId)}
                        >
                          −
                        </button>
                        <span>{c.quantity}</span>
                        <button
                          type="button"
                          onClick={() => onAdd(c.menuItemId)}
                        >
                          +
                        </button>
                      </div>
                    </li>
                  )
                )}
              </ul>
              <div className="ms-cart-dock-footer">
                <span>Total</span>
                <span className="ms-price-strong">₹ {total}</span>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
};

