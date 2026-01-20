import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from "react";
import type { CartItem, Order } from "../types";

interface ActiveOrder {
  orderId: string;
  tableId: number;
  status: "ACTIVE";
  items: CartItem[];
  total: number;
}

interface OrderContextValue {
  activeOrder: ActiveOrder | null;
  createOrder: (tableId: number, items: CartItem[], total: number, orderId: string) => void;
  addItemsToOrder: (newItems: CartItem[], newTotal: number) => void;
  updateOrderTotal: (total: number) => void;
  clearOrder: () => void;
}

const OrderContext = createContext<OrderContextValue | undefined>(undefined);

/**
 * OrderProvider - Manages the active order lifecycle per table.
 * 
 * REFACTORED: Removed localStorage persistence - orders are now fully backend-driven.
 * This context only manages UI state for rendering, not persistence.
 * All order data is stored in MongoDB and fetched from backend APIs.
 */
export const OrderProvider = ({ children }: { children: ReactNode }) => {
  // UI state only - no localStorage persistence
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);

  const createOrder = (
    tableId: number,
    items: CartItem[],
    total: number,
    orderId: string
  ) => {
    setActiveOrder((prev) => {
      // One ACTIVE order per table – if one already exists for this table, keep it.
      if (prev && prev.tableId === tableId && prev.status === "ACTIVE") {
        return prev;
      }
      return {
        orderId,
        tableId,
        status: "ACTIVE",
        items,
        total
      };
    });
  };

  const addItemsToOrder = (newItems: CartItem[], newTotal: number) => {
    setActiveOrder((prev) => {
      if (!prev) return prev;

      const mergedMap = new Map<string, number>();
      for (const item of prev.items) {
        mergedMap.set(
          item.menuItemId,
          (mergedMap.get(item.menuItemId) ?? 0) + item.quantity
        );
      }
      for (const item of newItems) {
        mergedMap.set(
          item.menuItemId,
          (mergedMap.get(item.menuItemId) ?? 0) + item.quantity
        );
      }
      const mergedItems: CartItem[] = Array.from(mergedMap.entries()).map(
        ([menuItemId, quantity]) => ({ menuItemId, quantity })
      );

      return {
        ...prev,
        items: mergedItems,
        total: newTotal
      };
    });
  };

  const updateOrderTotal = (total: number) => {
    setActiveOrder((prev) => (prev ? { ...prev, total } : prev));
  };

  const clearOrder = () => {
    setActiveOrder(null);
  };

  const value: OrderContextValue = {
    activeOrder,
    createOrder,
    addItemsToOrder,
    updateOrderTotal,
    clearOrder
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrderContext = (): OrderContextValue => {
  const ctx = useContext(OrderContext);
  if (!ctx) {
    throw new Error("useOrderContext must be used within OrderProvider");
  }
  return ctx;
};


