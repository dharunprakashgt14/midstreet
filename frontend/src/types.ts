export type TableNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type OrderStep = "PLACED" | "IN_PREPARATION" | "READY" | "SERVED" | "COMPLETED";

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
  imageUrl?: string;
}

export interface CartItem {
  menuItemId: string;
  quantity: number;
}

export interface OrderBatch {
  batchId: string;
  items: CartItem[];
  status: OrderStep;
  total: number;
  createdAt: Date;
}

export interface Order {
  id: string;
  table: TableNumber;
  batches: OrderBatch[];
  status: OrderStep;
  createdAt: Date;
  billNumber: string;
  total: number;
  completedAt?: Date; // Timestamp when order was completed (admin-only)
}


