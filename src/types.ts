export type TableNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type OrderStep = "PLACED" | "IN_PREPARATION" | "READY" | "SERVED";

export interface MenuCategory {
  id: string;
  label: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  isAvailable: boolean;
  tag?: "Signature" | "Chef's pick" | "New";
}

export interface CartItem {
  menuItemId: string;
  quantity: number;
}

export interface Order {
  id: string;
  table: TableNumber;
  items: CartItem[];
  status: OrderStep;
  createdAt: Date;
  billNumber: string;
  total: number;
}


