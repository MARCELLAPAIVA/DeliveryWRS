export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          phone: string
          address: string
          neighborhood: string
          complement: string
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string
          phone?: string
          address?: string
          neighborhood?: string
          complement?: string
          is_admin?: boolean
        }
        Update: {
          full_name?: string
          phone?: string
          address?: string
          neighborhood?: string
          complement?: string
          is_admin?: boolean
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          icon: string
          sort_order: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          icon?: string
          sort_order?: number
          active?: boolean
        }
        Update: {
          name?: string
          icon?: string
          sort_order?: number
          active?: boolean
        }
      }
      products: {
        Row: {
          id: string
          category_id: string
          name: string
          description: string
          price: number
          image_url: string
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          description?: string
          price: number
          image_url?: string
          active?: boolean
        }
        Update: {
          category_id?: string
          name?: string
          description?: string
          price?: number
          image_url?: string
          active?: boolean
        }
      }
      delivery_zones: {
        Row: {
          id: string
          neighborhood: string
          fee: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          neighborhood: string
          fee: number
          active?: boolean
        }
        Update: {
          neighborhood?: string
          fee?: number
          active?: boolean
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          status: 'new' | 'preparing' | 'delivering' | 'done' | 'cancelled'
          customer_name: string
          customer_phone: string
          customer_address: string
          customer_neighborhood: string
          payment_method: 'money' | 'card' | 'pix'
          needs_change: boolean
          change_for: number
          notes: string
          subtotal: number
          delivery_fee: number
          total: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: string
          customer_name: string
          customer_phone: string
          customer_address: string
          customer_neighborhood: string
          payment_method: string
          needs_change?: boolean
          change_for?: number
          notes?: string
          subtotal: number
          delivery_fee: number
          total: number
        }
        Update: {
          status?: string
          customer_name?: string
          customer_phone?: string
          customer_address?: string
          customer_neighborhood?: string
          payment_method?: string
          needs_change?: boolean
          change_for?: number
          notes?: string
          subtotal?: number
          delivery_fee?: number
          total?: number
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          unit_price: number
          total_price: number
        }
        Update: {
          product_name?: string
          quantity?: number
          unit_price?: number
          total_price?: number
        }
      }
      settings: {
        Row: {
          id: string
          store_name: string
          logo_url: string
          banner_url: string
          whatsapp: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_name?: string
          logo_url?: string
          banner_url?: string
          whatsapp?: string
        }
        Update: {
          store_name?: string
          logo_url?: string
          banner_url?: string
          whatsapp?: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type DeliveryZone = Database['public']['Tables']['delivery_zones']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type Settings = Database['public']['Tables']['settings']['Row']
