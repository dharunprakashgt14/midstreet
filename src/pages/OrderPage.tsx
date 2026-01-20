import { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { CATEGORIES } from "../data";
import type {
  CartItem,
  Order,
  OrderStep,
  TableNumber,
  MenuItem,
  MenuCategory
} from "../types";
import { generateBillNumber } from "../utils/billing";
import { isValidTableId } from "../utils/tableConfig";
import { storeTable } from "../utils/tablePersistence";
import { useAppState } from "../context/AppStateContext";
import { useOrderContext } from "../context/OrderContext";
import { orderAPI } from "../utils/api";
import { optimizeCloudinaryUrl } from "../utils/cloudinary";
import { Header } from "../components/Header";
import { TableInfo } from "../components/TableInfo";
import { Cart } from "../components/Cart";

const ORDER_STEPS: OrderStep[] = [
  "PLACED",
  "IN_PREPARATION",
  "READY",
  "SERVED"
];

/**
 * OrderPage component - Main ordering interface for a specific table.
 * 
 * Route: /table/:tableId
 * 
 * TODO (GET /menu): Menu data will be fetched from a backend GET /menu API
 * and stored in global state instead of relying on local static data.
 * TODO (POST /orders): When the guest places or updates an order, this flow
 * will call POST /orders (and possibly PATCH /orders/:id) and only update
 * local state after the server confirms.
 * TODO: QR codes will map to /table/:tableId routes (e.g., /table/2 for Table 2).
 */
export const OrderPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract tableId from URL params
  const tableIdParam = params.tableId;
  const tableId = tableIdParam ? Number(tableIdParam) : null;

  // Validate tableId
  if (!tableId || !isValidTableId(tableId)) {
    return (
      <div className="ms-app-shell">
        <div className="ms-panel">
          <header className="ms-panel-header">
            <h1 className="ms-panel-title">Invalid Table</h1>
            <p className="ms-panel-subtitle">
              The table number is invalid. Please scan a valid QR code or select a table.
            </p>
          </header>
        </div>
      </div>
    );
  }

  const activeTable = tableId as TableNumber;

  const { orders, setOrders, menuItems } = useAppState();
  const { activeOrder, createOrder, addItemsToOrder } = useOrderContext();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mostRecentOrder, setMostRecentOrder] = useState<Order | null>(null);

  // Store table number in localStorage when page loads
  useEffect(() => {
    if (activeTable) {
      storeTable(activeTable);
    }
  }, [activeTable]);

  // Fetch active order for this table to check if "Add to Existing Order" should be shown
  // FIRST-ORDER RULE: Only one active order per table at any time
  useEffect(() => {
    const fetchActiveOrder = async () => {
      try {
        // ORDER VISIBILITY RULE: getByTable only returns active orders (isActive = true)
        const backendOrders = await orderAPI.getByTable(activeTable);
        if (backendOrders && backendOrders.length > 0) {
          // Get the most recent active order (first in the array since sorted DESC)
          const mostRecent = backendOrders[0];
          
          // FIRST-ORDER RULE: If active order exists, show "Add to Existing Order"
          // Backend already filters by isActive = true, so this order is active
          const frontendOrder: Order = {
            id: mostRecent._id,
            table: activeTable,
            batches: mostRecent.batches.map((batch: any) => ({
              batchId: batch.batchId,
              items: batch.items.map((item: any) => ({
                menuItemId: item.menuItemId,
                quantity: item.quantity
              })),
              status: mapBackendStatusToFrontend(batch.status),
              total: batch.total,
              createdAt: new Date(batch.createdAt || mostRecent.createdAt)
            })),
            status: mapBackendStatusToFrontend(mostRecent.status),
            createdAt: new Date(mostRecent.createdAt),
            billNumber: mostRecent.billNumber || '',
            total: mostRecent.total
          };
          setMostRecentOrder(frontendOrder);
        } else {
          // No active order - customer can place new order
          setMostRecentOrder(null);
        }
      } catch (error) {
        console.error('Failed to fetch active order:', error);
        setMostRecentOrder(null);
      }
    };

    fetchActiveOrder();
  }, [activeTable]);

  // Derive categories dynamically from backend menu items
  // Use CATEGORIES array only for label mapping (metadata, not menu data)
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    menuItems.forEach((item) => {
      categorySet.add(item.categoryId);
    });
    
    // Map category IDs to proper labels using CATEGORIES array
    const categoryMap = new Map<string, MenuCategory>();
    CATEGORIES.forEach((cat) => {
      if (categorySet.has(cat.id)) {
        categoryMap.set(cat.id, cat);
      }
    });
    
    // Return categories in the order they appear in CATEGORIES, but only those that have items
    return Array.from(categoryMap.values());
  }, [menuItems]);

  const [activeCategoryId, setActiveCategoryId] = useState<string>("");

  // Update activeCategoryId when categories change
  useEffect(() => {
    if (categories.length > 0) {
      if (!activeCategoryId || !categories.find(c => c.id === activeCategoryId)) {
        setActiveCategoryId(categories[0].id);
      }
    }
  }, [categories, activeCategoryId]);

  const categoryItemsMap = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    categories.forEach((category) => {
      const items = menuItems.filter((item) => item.categoryId === category.id);
      if (items.length > 0) {
        map.set(category.id, items);
      }
    });
    return map;
  }, [menuItems, categories]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, cartItem) => {
      const menuItem = menuItems.find((m) => m.id === cartItem.menuItemId);
      if (!menuItem) return sum;
      return sum + menuItem.price * cartItem.quantity;
    }, 0);
  }, [cart, menuItems]);

  const currentOrderForTable = useMemo(() => {
    const tableOrders = orders.filter((o) => o.table === activeTable);
    if (tableOrders.length === 0) return null;
    return tableOrders[tableOrders.length - 1];
  }, [activeTable, orders]);

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

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;

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
    
    // Prepare items for backend API (with locked prices)
    const itemsForBackend = cart.map((cartItem) => {
      const menuItem = menuItems.find((m) => m.id === cartItem.menuItemId);
      if (!menuItem) throw new Error(`Menu item not found: ${cartItem.menuItemId}`);
      return {
        name: menuItem.name,
        price: menuItem.price, // Lock price at order time
        quantity: cartItem.quantity,
        menuItemId: cartItem.menuItemId
      };
    });

    const newItemsTotal = itemsForBackend.reduce((sum, item) => sum + item.price * item.quantity, 0);

    try {
      // Create a new order with first batch - backend persists to MongoDB
      // CRITICAL: Must await API call and handle errors properly
      const response = await orderAPI.create({
        tableNo: String(activeTable),
        items: itemsForBackend,
        total: newItemsTotal,
        billNumber
      });

      // apiRequest already extracts data.data, so response is the order object
      const backendOrder = response;

      // Validate response has required fields
      if (!backendOrder || !backendOrder._id) {
        throw new Error('Invalid order response from server');
      }

      // Transform backend order to frontend format (for UI only, not persistence)
      const newOrder: Order = {
        id: backendOrder._id,
        table: activeTable,
        batches: backendOrder.batches.map((batch: any) => ({
          batchId: batch.batchId,
          items: batch.items.map((item: any) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity
          })),
          status: mapBackendStatusToFrontend(batch.status),
          total: batch.total,
          createdAt: new Date(batch.createdAt || backendOrder.createdAt)
        })),
        status: mapBackendStatusToFrontend(backendOrder.status),
        createdAt: new Date(backendOrder.createdAt),
        billNumber: backendOrder.billNumber || billNumber,
        total: backendOrder.total
      };

      // Update local state for UI only (order is persisted in MongoDB)
      setOrders((prev) => [...prev, newOrder]);
      setMostRecentOrder(newOrder);
      
      // Clear cart after successful order
      setCart([]);
      
      // Navigate to order status page ONLY after successful order creation
      navigate(`/table/${activeTable}/order-status`, { replace: true });
    } catch (error: any) {
      console.error('Failed to submit order:', error);
      const errorMessage = error?.message || error?.error || 'Unknown error';
      const message = String(errorMessage).toLowerCase();

      // Suppress popup specifically when backend reports an existing active order
      if (message.includes('active order')) {
        return;
      }

      // Show error alert to user
      window.alert(`Failed to submit order: ${errorMessage}. Please try again.`);
    }
  };

  const handleAddToExistingOrder = async () => {
    if (cart.length === 0 || !mostRecentOrder) return;
    
    const unavailable = cart.filter((c) => {
      const menuItem = menuItems.find((m) => m.id === c.menuItemId);
      return !menuItem || !menuItem.isAvailable;
    });
    if (unavailable.length > 0) {
      window.alert("Some items are unavailable. Please review your cart.");
      pruneUnavailableFromCart(menuItems);
      return;
    }

    // Prepare items for backend API (with locked prices)
    const itemsForBackend = cart.map((cartItem) => {
      const menuItem = menuItems.find((m) => m.id === cartItem.menuItemId);
      if (!menuItem) throw new Error(`Menu item not found: ${cartItem.menuItemId}`);
      return {
        name: menuItem.name,
        price: menuItem.price,
        quantity: cartItem.quantity,
        menuItemId: cartItem.menuItemId
      };
    });

    const batchTotal = itemsForBackend.reduce((sum, item) => sum + item.price * item.quantity, 0);

    try {
      // DEBUG: Log orderId being sent
      console.log('[Add to Existing] Sending orderId:', mostRecentOrder.id, 'for table:', activeTable);
      
      // FIX: Use MongoDB _id as orderId - it's the ONLY orderId
      // Add new batch to existing order
      const backendOrder = await orderAPI.addBatch(
        mostRecentOrder.id, // This is the MongoDB _id
        itemsForBackend,
        batchTotal
      );

      // Transform backend order to frontend format
      const updatedOrder: Order = {
        id: backendOrder._id,
        table: activeTable,
        batches: backendOrder.batches.map((batch: any) => ({
          batchId: batch.batchId,
          items: batch.items.map((item: any) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity
          })),
          status: mapBackendStatusToFrontend(batch.status),
          total: batch.total,
          createdAt: new Date(batch.createdAt || backendOrder.createdAt)
        })),
        status: mapBackendStatusToFrontend(backendOrder.status),
        createdAt: new Date(backendOrder.createdAt),
        billNumber: backendOrder.billNumber || '',
        total: backendOrder.total
      };

      // Update UI state (order persisted in MongoDB)
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );
      setMostRecentOrder(updatedOrder);
      
      // Clear cart after successful batch addition
      setCart([]);
      
      // Navigate to order status page
      navigate(`/table/${activeTable}/order-status`, { replace: true });
    } catch (error) {
      console.error('Failed to add batch to order:', error);
      window.alert('Failed to add to existing order. Please try again.');
    }
  };

  // Helper function to map backend status to frontend status
  const mapBackendStatusToFrontend = (backendStatus: string): OrderStep => {
    const statusMap: Record<string, OrderStep> = {
      'pending': 'PLACED',
      'preparing': 'IN_PREPARATION',
      'served': 'READY',
      'paid': 'SERVED'
    };
    return statusMap[backendStatus] || 'PLACED';
  };

  const tableLabel = `Table ${activeTable}`;
  const items = categoryItemsMap.get(activeCategoryId) ?? [];

  return (
    <div className="ms-app-shell">
      <Header tableNumber={activeTable} cart={cart} />

      <div className="ms-layout">
        <TableInfo tableNumber={activeTable} currentOrder={currentOrderForTable} />

        <main className="ms-main">
          <div className="ms-main-header-row">
            <span className="ms-main-context">{tableLabel}</span>
          </div>

          <section className="ms-panel">
            <div className="ms-category-rail">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={
                    category.id === activeCategoryId
                      ? "ms-category-pill ms-category-pill-active"
                      : "ms-category-pill"
                  }
                  onClick={() => setActiveCategoryId(category.id)}
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
                    <div className="ms-menu-card-image-container">
                      {item.imageUrl ? (
                        <>
                          <div className="food-image-loading">
                            <span></span>
                          </div>
                          <img
                            src={optimizeCloudinaryUrl(item.imageUrl) || item.imageUrl}
                            alt={item.name}
                            className="food-image"
                            loading="lazy"
                            onLoad={(e) => {
                              // Hide loading placeholder when image loads
                              const target = e.target as HTMLImageElement;
                              const loadingPlaceholder = target.previousElementSibling as HTMLElement;
                              if (loadingPlaceholder && loadingPlaceholder.classList.contains('food-image-loading')) {
                                loadingPlaceholder.style.display = 'none';
                              }
                            }}
                            onError={(e) => {
                              // Hide image and loading placeholder on error, show error placeholder
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const loadingPlaceholder = target.previousElementSibling as HTMLElement;
                              const errorPlaceholder = target.nextElementSibling as HTMLElement;
                              if (loadingPlaceholder && loadingPlaceholder.classList.contains('food-image-loading')) {
                                loadingPlaceholder.style.display = 'none';
                              }
                              if (errorPlaceholder) {
                                errorPlaceholder.style.display = 'flex';
                              }
                            }}
                          />
                          <div className="food-image-placeholder" style={{ display: 'none' }}>
                            <span>No Image</span>
                          </div>
                        </>
                      ) : (
                        <div className="food-image-placeholder">
                          <span>No Image</span>
                        </div>
                      )}
                    </div>
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
                                  onClick={() => handleDecreaseFromCart(item.id)}
                                >
                                  −
                                </button>
                                <span>{cartEntry.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => handleAddToCart(item.id)}
                                >
                                  +
                                </button>
                              </div>
                            )}
                            {!cartEntry && (
                              <button
                                type="button"
                                className="ms-primary-cta"
                                onClick={() => handleAddToCart(item.id)}
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
                <span className="ms-price-strong">₹ {cartTotal}</span>
              </div>
              <div className="ms-cta-group">
                {mostRecentOrder && (
                  <button
                    type="button"
                    className="ms-secondary-cta"
                    disabled={cart.length === 0}
                    onClick={handleAddToExistingOrder}
                  >
                    Add to existing order
                  </button>
                )}
                {/* Hide \"Place order\" when an active order exists for this table */}
                {!mostRecentOrder && (
                  <button
                    type="button"
                    className="ms-primary-cta"
                    disabled={cart.length === 0}
                    onClick={handleSubmitOrder}
                  >
                    Place order
                  </button>
                )}
                {mostRecentOrder && (
                  <button
                    type="button"
                    className="ms-tertiary-cta"
                    onClick={() =>
                      navigate(`/table/${activeTable}/order-status`, { replace: false })
                    }
                  >
                    View order status
                  </button>
                )}
              </div>
            </div>
          </section>
        </main>

        <Cart
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