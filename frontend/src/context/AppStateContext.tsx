import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import type { MenuItem, Order } from "../types";
import { menuAPI } from "../utils/api";

interface AppStateContextValue {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  menuItems: MenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  isLoadingMenu: boolean;
  refreshMenu: () => Promise<void>;
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

/**
 * AppStateProvider - Provides shared application state (orders, menu items).
 * 
 * Menu items are fetched from the backend API only.
 * No static fallback - backend connection is required.
 */
export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);

  // Fetch menu items from backend
  const fetchMenu = useCallback(async () => {
    try {
      setIsLoadingMenu(true);
      // Fetch menu from backend API
      const backendMenu = await menuAPI.getAll();
      
      // Transform backend menu items to frontend format
      // Backend uses: _id, category, name, price, isAvailable, itemId, imageUrl
      // Frontend expects: id, categoryId, name, price, isAvailable, description, tag, imageUrl
      const transformedMenu: MenuItem[] = backendMenu.map((item) => ({
        id: item.itemId || item._id,
        categoryId: item.category,
        name: item.name,
        price: item.price,
        isAvailable: item.isAvailable,
        description: item.description || '',
        tag: item.tag as "Signature" | "Chef's pick" | "New" | undefined,
        imageUrl: item.imageUrl
      }));
      
      setMenuItems(transformedMenu);
    } catch (error) {
      console.error('Failed to fetch menu from backend:', error);
      // Don't use fallback - require backend connection
      // Only show alert on initial load, not on refresh
      setMenuItems((prev) => {
        if (prev.length === 0) {
          window.alert('Failed to load menu. Please check if the backend server is running.');
        }
        return prev;
      });
    } finally {
      setIsLoadingMenu(false);
    }
  }, []);

  // Fetch menu items from backend on mount
  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // Periodically refresh menu to sync with admin updates (every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMenu();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchMenu]);

  // Refresh menu function - can be called after updates
  const refreshMenu = async () => {
    await fetchMenu();
  };

  return (
    <AppStateContext.Provider
      value={{
        orders,
        setOrders,
        menuItems,
        setMenuItems,
        isLoadingMenu,
        refreshMenu
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = (): AppStateContextValue => {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return ctx;
};

