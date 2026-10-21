export type AdminRole = "super_admin" | "manager" | "support";

export interface AdminPermissions {
  products?: boolean;
  categories?: boolean;
  orders?: boolean;
  coupons?: boolean;
  customers?: boolean;
  admins?: boolean;
  [key: string]: boolean | undefined;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  password_hash?: string;
  role: AdminRole;
  permissions: AdminPermissions;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  is_active: boolean;
  created_at?: string;
}

export interface Product {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  category_name?: string | null;
  price: number;
  discount_price: number | null;
  fabric: string | null;
  sizes: string[] | null;
  stock_quantity: number;
  is_featured: boolean;
  images: string[] | null;
  created_at?: string;
  // joined fields
  category?: Category;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: "PERCENTAGE" | "FLAT";
  discount_value: number;
  min_order_amount: number;
  usage_limit: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at?: string;
}

export interface Offer {
  id: string;
  title: string;
  banner_image: string | null;
  link_url: string | null;
  is_active: boolean;
  created_at?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  total_orders: number;
  total_spent: number;
  created_at?: string;
}

export interface OrderItem {
  id?: string;
  product_id?: string;
  title: string;
  size: string;
  quantity: number;
  price: number;
  image?: string;
}

export type OrderStatus =
  | "Order Placed"
  | "Confirmed"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export type PaymentMethod = "Razorpay" | "COD";
export type PaymentStatus = "Pending" | "Paid" | "Failed";

export interface Order {
  id: string;
  customer_id: string | null;
  customer_name: string;
  items: OrderItem[] | any;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  created_at?: string;
}
