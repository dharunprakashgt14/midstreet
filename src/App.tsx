import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { CATEGORIES, MENU_ITEMS } from "./data";
import { RequireAuth, useAuth } from "./auth/AuthContext";
import type {
  CartItem,
  MenuItem,
  Order,
  OrderStep,
  TableNumber
} from "./types";
import { generateBillNumber } from "./utils/billing";

const ORDER_STEPS: OrderStep[] = [
  "PLACED",
  "IN_PREPARATION",
  "READY",
  "SERVED"
];

export const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const [activeTable, setActiveTable] = useState<TableNumber | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    CATEGORIES[0]?.id ?? ""
  );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU_ITEMS);
  const [activeBillId, setActiveBillId] = useState<string | null>(null);

  const categoryItemsMap = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const category of CATEGORIES) {
      map.set(
        category.id,
        menuItems.filter((item) => item.categoryId === category.id)
      );
    }
    return map;
  }, [menuItems]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, cartItem) => {
      const menuItem = menuItems.find((m) => m.id === cartItem.menuItemId);
      if (!menuItem) return sum;
      return sum + menuItem.price * cartItem.quantity;
    }, 0);
  }, [cart, menuItems]);

  const tableLabel = activeTable ? `Table ${activeTable}` : "No table selected";

  const handleSelectTable = (table: TableNumber) => {
    setActiveTable(table);
    setCart([]);
    navigate("/menu", { replace: true });
  };

  const handleBack = () => {
    const path = location.pathname;
    if (path === "/menu") {
      setActiveTable(null);
      setCart([]);
      navigate("/", { replace: true });
      return;
    }
    if (path === "/status") {
      navigate("/menu", { replace: true });
      return;
    }
    if (path.startsWith("/admin")) {
      navigate("/", { replace: true });
      return;
    }
    if (path.startsWith("/bill")) {
      navigate("/admin", { replace: true });
      return;
    }
    navigate("/", { replace: true });
  };

  const handleAddToCart = (menuItemId: string) => {
    const menuItem = menuItems.find((m) => m.id === menuItemId);
    if (!menuItem || !menuItem.isAvailable) {
      window.alert("This item is currently unavailable.");
      return;
    }
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === menuItemId);
      if (!existing) {
        return [...prev, { menuItemId, quantity: 1 }];
      }
      return prev.map((c) =>
        c.menuItemId === menuItemId
          ? { ...c, quantity: c.quantity + 1 }
          : c
      );
    });
  };

  const handleDecreaseFromCart = (menuItemId: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === menuItemId);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter((c) => c.menuItemId !== menuItemId);
      }
      return prev.map((c) =>
        c.menuItemId === menuItemId
          ? { ...c, quantity: c.quantity - 1 }
          : c
      );
    });
  };

  const pruneUnavailableFromCart = (items: MenuItem[]) => {
    setCart((prev) =>
      prev.filter((c) => {
        const item = items.find((m) => m.id === c.menuItemId);
        return item && item.isAvailable;
      })
    );
  };

  const handlePlaceOrder = () => {
    if (!activeTable || cart.length === 0) return;
    const unavailable = cart.filter((c) => {
      const menuItem = menuItems.find((m) => m.id === c.menuItemId);
      return !menuItem || !menuItem.isAvailable;
    });
    if (unavailable.length > 0) {
      window.alert("Some items are unavailable. Please review your cart.");
      pruneUnavailableFromCart(menuItems);
      return;
    }
    const now = new Date();
    const billNumber = generateBillNumber(now);
    const total = cart.reduce((sum, c) => {
      const item = menuItems.find((m) => m.id === c.menuItemId);
      if (!item) return sum;
      return sum + item.price * c.quantity;
    }, 0);
    const newOrder: Order = {
      id: `${now.getTime()}`,
      table: activeTable,
      items: cart,
      status: "PLACED",
      createdAt: now,
      billNumber,
      total
    };
    setOrders((prev) => [...prev, newOrder]);
    setActiveBillId(newOrder.id);
    setCart([]);
    navigate("/status", { replace: true });
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStep) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const openBillFromAdmin = (order: Order) => {
    setActiveBillId(order.id);
    navigate(`/bill/${order.id}`);
  };

  const currentOrderForTable = useMemo(() => {
    if (!activeTable) return null;
    const tableOrders = orders.filter((o) => o.table === activeTable);
    if (tableOrders.length === 0) return null;
    return tableOrders[tableOrders.length - 1];
  }, [activeTable, orders]);

  const findOrderById = (id: string | undefined) =>
    orders.find((o) => o.id === id) ?? null;

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

  const handleUpdateMenuItem = (
    id: string,
    updates: Partial<Pick<MenuItem, "name" | "price" | "isAvailable">>
  ) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
    if (updates.isAvailable === false) {
      setCart((prev) => prev.filter((c) => c.menuItemId !== id));
    }
  };

  const handleDeleteMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
    setCart((prev) => prev.filter((c) => c.menuItemId !== id));
  };

  const handleAddMenuItem = (item: Omit<MenuItem, "id">) => {
    const newId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newItem: MenuItem = { ...item, id: newId };
    setMenuItems((prev) => [...prev, newItem]);
  };

  return (
    <div className="ms-app-shell">
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
              {activeTable ?? "—"}
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
              {cart.reduce((sum, c) => sum + c.quantity, 0)}
            </span>
          </div>
        </div>
      </header>

      <div className="ms-layout">
        <aside className="ms-sidebar">
          <div className="ms-sidebar-inner">
            <div className="ms-sidebar-section">
              <h2 className="ms-sidebar-title">Single QR · Multi Tables</h2>
              <p className="ms-sidebar-text">
                Guests scan once, select their table (1–8), and place orders
                directly from this console.
              </p>
            </div>
            {currentOrderForTable && (
              <div className="ms-sidebar-section">
                <h3 className="ms-sidebar-subtitle">Current Order</h3>
                <p className="ms-sidebar-meta">
                  Bill: <span>{currentOrderForTable.billNumber}</span>
                </p>
                <p className="ms-sidebar-meta">
                  Status: <span>{currentOrderForTable.status}</span>
                </p>
                <p className="ms-sidebar-meta">
                  Total: <span>₹ {currentOrderForTable.total}</span>
                </p>
              </div>
            )}
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
            <span className="ms-main-context">{tableLabel}</span>
          </div>

          <Routes>
            <Route
              path="/"
              element={<TableSelection onSelectTable={handleSelectTable} />}
            />
            <Route
              path="/order"
              element={
                <OrderEntry
                  // Reuse the same handler used by manual table selection
                  // so QR-based table detection follows the existing flow.
                  onSelectTable={handleSelectTable}
                />
              }
            />
            <Route
              path="/menu"
              element={
                <MenuView
                  activeCategoryId={activeCategoryId}
                  onCategoryChange={setActiveCategoryId}
                  categoryItemsMap={categoryItemsMap}
                  cart={cart}
                  onAddToCart={handleAddToCart}
                  onDecreaseFromCart={handleDecreaseFromCart}
                  onPlaceOrder={handlePlaceOrder}
                  total={cartTotal}
                />
              }
            />
            <Route
              path="/status"
              element={
                activeBillId ? (
                  (() => {
                    const order = findOrderById(activeBillId) ?? orders[orders.length - 1];
                    if (!order) return <Navigate to="/" replace />;
                    return <OrderStatusView order={order} steps={ORDER_STEPS} />;
                  })()
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route path="/bill/:orderId" element={<BillView orders={orders} menuItems={menuItems} />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element={<RequireAuth />}>
              <Route
                path="/admin"
                element={
                  <AdminDashboardView
                    orders={orders}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                    onOpenBill={openBillFromAdmin}
                    onOpenDailySummary={() => navigate("/admin/summary")}
                    onOpenStocks={() => navigate("/admin/stocks")}
                  />
                }
              />
              <Route
                path="/admin/stocks"
                element={
                  <StocksManagementView
                    menuItems={menuItems}
                    onUpdateItem={handleUpdateMenuItem}
                    onDeleteItem={handleDeleteMenuItem}
                    onAddItem={handleAddMenuItem}
                  />
                }
              />
              <Route
                path="/admin/summary"
                element={<DailySummaryView orders={orders} />}
              />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <CartDock
          cart={cart}
          total={cartTotal}
          onAdd={handleAddToCart}
          onDecrease={handleDecreaseFromCart}
          menuItems={menuItems}
        />
      </div>
    </div>
  );
};

interface TableSelectionProps {
  onSelectTable: (table: TableNumber) => void;
}

const TableSelection = ({ onSelectTable }: TableSelectionProps) => {
  return (
    <section className="ms-panel">
      <header className="ms-panel-header">
        <h1 className="ms-panel-title">Choose your table</h1>
        <p className="ms-panel-subtitle">
          Single QR across the floor. Confirm where you&apos;re seated to begin
          ordering.
        </p>
      </header>
      <div className="ms-table-grid">
        {Array.from({ length: 8 }, (_, i) => i + 1 as TableNumber).map(
          (table) => (
            <button
              key={table}
              type="button"
              className="ms-table-card"
              onClick={() => onSelectTable(table)}
            >
              <span className="ms-table-card-label">Table</span>
              <span className="ms-table-card-number">{table}</span>
            </button>
          )
        )}
      </div>
    </section>
  );
};

interface OrderEntryProps {
  onSelectTable: (table: TableNumber) => void;
}

const OrderEntry = ({ onSelectTable }: OrderEntryProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Read the "table" query parameter once on initial load for QR-based entry.
    const params = new URLSearchParams(location.search);
    const rawTable = params.get("table");

    if (!rawTable) {
      // Missing parameter: fall back to the existing table selection flow.
      navigate("/", { replace: true });
      return;
    }

    const parsed = Number(rawTable);
    const isValid =
      Number.isInteger(parsed) && Number.isFinite(parsed) && parsed > 0;

    if (!isValid) {
      // Invalid parameter: fall back to the existing table selection flow.
      navigate("/", { replace: true });
      return;
    }

    // For valid positive integers, reuse the existing table selection logic.
    // This keeps all side effects (table state, cart reset, navigation) identical
    // to the manual "Select Table" flow.
    onSelectTable(parsed as TableNumber);
  }, [location.search, navigate, onSelectTable]);

  // This route is purely behavioral: it does not render any new UI.
  return null;
};

interface MenuViewProps {
  activeCategoryId: string;
  onCategoryChange: (id: string) => void;
  categoryItemsMap: Map<string, MenuItem[]>;
  cart: CartItem[];
  onAddToCart: (menuItemId: string) => void;
  onDecreaseFromCart: (menuItemId: string) => void;
  onPlaceOrder: () => void;
  total: number;
}

const MenuView = ({
  activeCategoryId,
  onCategoryChange,
  categoryItemsMap,
  cart,
  onAddToCart,
  onDecreaseFromCart,
  onPlaceOrder,
  total
}: MenuViewProps) => {
  const items = categoryItemsMap.get(activeCategoryId) ?? [];

  return (
    <section className="ms-panel">
      <div className="ms-category-rail">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            className={
              category.id === activeCategoryId
                ? "ms-category-pill ms-category-pill-active"
                : "ms-category-pill"
            }
            onClick={() => onCategoryChange(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="ms-menu-grid">
        {items.map((item) => {
          const cartEntry = cart.find((c) => c.menuItemId === item.id);
          const disabled = !item.isAvailable;
          return (
            <article
              key={item.id}
              className={
                disabled ? "ms-menu-card ms-menu-card-disabled" : "ms-menu-card"
              }
            >
              <header className="ms-menu-card-header">
                <h3 className="ms-menu-card-title">{item.name}</h3>
                {item.tag && (
                  <span className="ms-menu-tag">
                    {item.tag}
                  </span>
                )}
              </header>
              <p className="ms-menu-card-desc">{item.description}</p>
              <div className="ms-menu-card-footer">
                <span className="ms-price">₹ {item.price}</span>
                <div className="ms-cta-group">
                  {disabled ? (
                    <span className="ms-out-of-stock">Out of stock</span>
                  ) : (
                    <>
                      {cartEntry && (
                        <div className="ms-qty-control">
                          <button
                            type="button"
                            onClick={() => onDecreaseFromCart(item.id)}
                          >
                            −
                          </button>
                          <span>{cartEntry.quantity}</span>
                          <button
                            type="button"
                            onClick={() => onAddToCart(item.id)}
                          >
                            +
                          </button>
                        </div>
                      )}
                      {!cartEntry && (
                        <button
                          type="button"
                          className="ms-primary-cta"
                          onClick={() => onAddToCart(item.id)}
                        >
                          Add
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="ms-menu-footer">
        <div className="ms-menu-total">
          <span>Total</span>
          <span className="ms-price-strong">₹ {total}</span>
        </div>
        <button
          type="button"
          className="ms-primary-cta"
          disabled={cart.length === 0}
          onClick={onPlaceOrder}
        >
          Place order
        </button>
      </div>
    </section>
  );
};

interface CartDockProps {
  cart: CartItem[];
  total: number;
  onAdd: (menuItemId: string) => void;
  onDecrease: (menuItemId: string) => void;
  menuItems: MenuItem[];
}

const CartDock = ({ cart, total, onAdd, onDecrease, menuItems }: CartDockProps) => {
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

interface OrderStatusViewProps {
  order: Order;
  steps: OrderStep[];
}

const OrderStatusView = ({ order, steps }: OrderStatusViewProps) => {
  const currentIndex = steps.indexOf(order.status);

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
      </section>
    </div>
  );
};

interface AdminDashboardViewProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStep) => void;
  onOpenBill: (order: Order) => void;
  onOpenDailySummary: () => void;
  onOpenStocks: () => void;
}

const AdminDashboardView = ({
  orders,
  onUpdateOrderStatus,
  onOpenBill,
  onOpenDailySummary,
  onOpenStocks
}: AdminDashboardViewProps) => {
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const activeOrders = orders.filter(
    (o) => o.status !== "SERVED"
  ).length;

  const handlePrintDaily = () => {
    onOpenDailySummary();
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="ms-admin-container">
      <section className="ms-panel ms-admin">
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
              onClick={onOpenStocks}
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

        <section className="ms-admin-metrics">
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

        <section className="ms-admin-grid">
          <div className="ms-admin-column">
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
                  {orders.map((order) => (
                    <div key={order.id} className="ms-admin-table-row">
                      <span>{order.billNumber}</span>
                      <span>{order.table}</span>
                      <span>{order.status}</span>
                      <span>₹ {order.total}</span>
                      <span className="ms-admin-row-actions">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            onUpdateOrderStatus(
                              order.id,
                              e.target.value as OrderStep
                            )
                          }
                        >
                          {ORDER_STEPS.map((step) => (
                            <option key={step} value={step}>
                              {step}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="ms-tertiary-cta"
                          onClick={() => onOpenBill(order)}
                        >
                          View bill
                        </button>
                      </span>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="ms-admin-table-empty">
                      No orders yet today.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="ms-admin-column">
            <h2 className="ms-admin-section-title">Stock availability</h2>
            <div className="ms-admin-stock-list">
              {orders.length === 0 && (
                <div className="ms-admin-table-empty">Use Stocks Management to edit availability.</div>
              )}
              {orders.length > 0 && (
                <div className="ms-admin-table-empty">
                  Stocks managed in the dedicated view.
                </div>
              )}
            </div>
          </div>
        </section>
      </section>
    </div>
  );
};

interface StocksManagementViewProps {
  menuItems: MenuItem[];
  onUpdateItem: (
    id: string,
    updates: Partial<Pick<MenuItem, "name" | "price" | "isAvailable">>
  ) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (item: Omit<MenuItem, "id">) => void;
}

const StocksManagementView = ({
  menuItems,
  onUpdateItem,
  onDeleteItem,
  onAddItem
}: StocksManagementViewProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftPrice, setDraftPrice] = useState<number>(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemPrice, setNewItemPrice] = useState<number>(0);
  const [newItemCategory, setNewItemCategory] = useState<string>(CATEGORIES[0]?.id ?? "");
  const [newItemTag, setNewItemTag] = useState<MenuItem["tag"]>(undefined);

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setDraftName(item.name);
    setDraftPrice(item.price);
  };

  const saveEdit = () => {
    if (!editingId) return;
    onUpdateItem(editingId, { name: draftName, price: draftPrice });
    setEditingId(null);
  };

  const handleAddNewItem = () => {
    if (!newItemName.trim() || newItemPrice <= 0 || !newItemCategory) {
      window.alert("Please fill in name, price, and category.");
      return;
    }
    onAddItem({
      name: newItemName.trim(),
      description: newItemDesc.trim() || "No description",
      price: newItemPrice,
      categoryId: newItemCategory,
      isAvailable: true,
      tag: newItemTag
    });
    setNewItemName("");
    setNewItemDesc("");
    setNewItemPrice(0);
    setNewItemCategory(CATEGORIES[0]?.id ?? "");
    setNewItemTag(undefined);
    setShowAddForm(false);
  };

  return (
    <div className="ms-admin-container">
      <section className="ms-panel ms-admin">
        <header className="ms-panel-header ms-admin-header">
          <div>
            <h1 className="ms-panel-title">Stocks Management</h1>
            <p className="ms-panel-subtitle">
              Control availability, pricing, and catalogue integrity.
            </p>
          </div>
          <div className="ms-admin-actions">
            <button
              type="button"
              className="ms-primary-cta"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? "Cancel" : "Add Items"}
            </button>
          </div>
        </header>

      {showAddForm && (
        <div className="ms-add-item-form">
          <h3 className="ms-admin-section-title">Add New Item</h3>
          <div className="ms-add-item-fields">
            <label className="ms-login-field">
              <span>Item Name</span>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="e.g., Espresso Shot"
              />
            </label>
            <label className="ms-login-field">
              <span>Description</span>
              <input
                type="text"
                value={newItemDesc}
                onChange={(e) => setNewItemDesc(e.target.value)}
                placeholder="Brief description"
              />
            </label>
            <label className="ms-login-field">
              <span>Price (₹)</span>
              <input
                type="number"
                value={newItemPrice || ""}
                onChange={(e) => setNewItemPrice(Number(e.target.value))}
                placeholder="0"
                min="0"
              />
            </label>
            <label className="ms-login-field">
              <span>Category</span>
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="ms-login-field">
              <span>Tag (Optional)</span>
              <select
                value={newItemTag || ""}
                onChange={(e) =>
                  setNewItemTag(
                    e.target.value
                      ? (e.target.value as MenuItem["tag"])
                      : undefined
                  )
                }
              >
                <option value="">None</option>
                <option value="Signature">Signature</option>
                <option value="Chef's pick">Chef's pick</option>
                <option value="New">New</option>
              </select>
            </label>
          </div>
          <button
            type="button"
            className="ms-primary-cta"
            onClick={handleAddNewItem}
          >
            Add Item
          </button>
        </div>
      )}

      <div className="ms-stocks-groups">
        {CATEGORIES.map((category) => {
          const items = menuItems.filter((m) => m.categoryId === category.id);
          return (
            <div key={category.id} className="ms-stocks-block">
              <div className="ms-stocks-block-header">
                <span className="ms-admin-section-title">{category.label}</span>
                <span className="ms-stocks-count">{items.length} items</span>
              </div>
              {items.length === 0 && (
                <div className="ms-admin-table-empty">No items in this category.</div>
              )}
              {items.map((item) => {
                const isEditing = editingId === item.id;
                return (
                  <div key={item.id} className="ms-stocks-row">
                    <div className="ms-stocks-main">
                      {isEditing ? (
                        <>
                          <input
                            value={draftName}
                            onChange={(e) => setDraftName(e.target.value)}
                            className="ms-stocks-input"
                          />
                          <input
                            type="number"
                            value={draftPrice}
                            onChange={(e) => setDraftPrice(Number(e.target.value))}
                            className="ms-stocks-input ms-stocks-input-small"
                          />
                        </>
                      ) : (
                        <>
                          <span className="ms-admin-stock-name">{item.name}</span>
                          <span className="ms-admin-stock-meta">₹ {item.price}</span>
                        </>
                      )}
                    </div>
                    <div className="ms-stocks-actions">
                      <span
                        className={
                          item.isAvailable ? "ms-chip ms-chip-ok" : "ms-chip ms-chip-off"
                        }
                      >
                        {item.isAvailable ? "In stock" : "Out of stock"}
                      </span>
                      <button
                        type="button"
                        className="ms-tertiary-cta"
                        onClick={() =>
                          onUpdateItem(item.id, { isAvailable: !item.isAvailable })
                        }
                      >
                        Toggle
                      </button>
                      {isEditing ? (
                        <button
                          type="button"
                          className="ms-primary-cta"
                          onClick={saveEdit}
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="ms-secondary-cta"
                          onClick={() => startEdit(item)}
                        >
                          Edit
                        </button>
                      )}
                      <button
                        type="button"
                        className="ms-tertiary-cta"
                        onClick={() => onDeleteItem(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      </section>
    </div>
  );
};

interface BillViewProps {
  orders: Order[];
  menuItems: MenuItem[];
}

const BillView = ({ orders, menuItems }: BillViewProps) => {
  const params = useParams();
  const order = orders.find((o) => o.id === params.orderId);

  if (!order) {
    return <Navigate to="/" replace />;
  }

  const lines = order.items.map((c) => {
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
              Date: {order.createdAt.toLocaleDateString()} · {order.createdAt.toLocaleTimeString()}
            </span>
            <span>Table: {order.table}</span>
          </div>
          <div className="ms-admin-table-wrapper">
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

interface DailySummaryViewProps {
  orders: Order[];
}

const DailySummaryView = ({ orders }: DailySummaryViewProps) => {
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

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
          <span>Date: {new Date().toLocaleDateString()}</span>
          <span>Orders: {orders.length}</span>
          <span>Total revenue: ₹ {totalRevenue}</span>
        </div>
        <div className="ms-admin-table-wrapper">
          <div className="ms-daily-table">
            <div className="ms-daily-table-head">
              <span>Bill</span>
              <span>Table</span>
              <span>Total</span>
              <span>Time</span>
            </div>
            {orders.map((order) => (
              <div key={order.id} className="ms-daily-table-row">
                <span>{order.billNumber}</span>
                <span>{order.table}</span>
                <span>₹ {order.total}</span>
                <span>{order.createdAt.toLocaleTimeString()}</span>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="ms-daily-table-empty">No orders recorded.</div>
            )}
          </div>
        </div>
        <div className="ms-daily-footer">
          <span>System Generated Report</span>
        </div>
      </section>
    </div>
  );
};

const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = login(username.trim(), password);
    if (!ok) {
      setError("Invalid credentials.");
      return;
    }
    const redirectTo =
      (location.state as { from?: { pathname?: string } })?.from?.pathname ??
      "/admin";
    navigate(redirectTo, { replace: true });
  };

  return (
    <section className="ms-panel">
      <header className="ms-panel-header">
        <h1 className="ms-panel-title">Admin login</h1>
        <p className="ms-panel-subtitle">Restricted area — MID STREET team only.</p>
      </header>
      <form className="ms-login-form" onSubmit={handleSubmit}>
        <label className="ms-login-field">
          <span>Username</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label className="ms-login-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <div className="ms-login-error">{error}</div>}
        <button type="submit" className="ms-primary-cta">
          Login
        </button>
      </form>
    </section>
  );
};


