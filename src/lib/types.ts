export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type OrderStatus = 'new' | 'preparing' | 'delivering' | 'done' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'pix';

export interface Profile {
  id: string;
  name: string;
  phone: string;
  address: string;
  neighborhood: string;
  city: string;
  is_admin: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
  categories?: Category;
}

export interface DeliveryZone {
  id: string;
  neighborhood: string;
  fee: number;
  active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: PaymentMethod;
  change_for: number | null;
  notes: string | null;
  address: string;
  neighborhood: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
  products?: Product;
}

export interface Settings {
  id: string;
  store_name: string;
  logo_url: string | null;
  banner_url: string | null;
  whatsapp: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// Supabase Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at'>;
        Update: Partial<Omit<Category, 'id' | 'created_at'>>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at'>;
        Update: Partial<Omit<Product, 'id' | 'created_at'>>;
      };
      delivery_zones: {
        Row: DeliveryZone;
        Insert: Omit<DeliveryZone, 'id' | 'created_at'>;
        Update: Partial<Omit<DeliveryZone, 'id' | 'created_at'>>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Order, 'id' | 'created_at'>>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, 'id' | 'created_at'>;
        Update: Partial<Omit<OrderItem, 'id' | 'created_at'>>;
      };
      settings: {
        Row: Settings;
        Insert: Omit<Settings, 'id' | 'updated_at'>;
        Update: Partial<Omit<Settings, 'id'>>;
      };
    };
  };
}
