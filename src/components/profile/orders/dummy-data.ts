import { Database } from "@/types/supabase"

// Define types based on our Schema
export type OrderStatus = "pending" | "processing" | "done" | "cancelled"
export type PaymentStatus = "pending" | "confirmed" | "rejected"
export type PaymentMethod = "cod" | "qris"

export interface OrderItem {
  id: string
  order_id: string
  coffee_id: string
  quantity: number
  price: number
  coffee_name: string // Joined data
  coffee_image: string // Joined data
}

export interface Order {
  id: string
  customer_id: string
  customer_name: string // Joined data for Admin view
  total_price: number
  postage: number
  payment_method: PaymentMethod
  delivery_address: string | null
  order_status: OrderStatus
  created_at: string
  items: OrderItem[]
  payment_status: PaymentStatus // Joined from payments table
  payment_proof?: string | null
}

// Mock Data
export const mockOrders: Order[] = [
  {
    id: "ord-001",
    customer_id: "user-123", // Assuming this is the current user for testing
    customer_name: "Ihsan Dev",
    total_price: 45000,
    postage: 5000,
    payment_method: "qris",
    delivery_address: "Jalan Teknologi No. 10, Bandung",
    order_status: "pending",
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    payment_status: "pending",
    payment_proof: null,
    items: [
      {
        id: "item-1",
        order_id: "ord-001",
        coffee_id: "coffee-1",
        quantity: 2,
        price: 15000,
        coffee_name: "Aren Latte",
        coffee_image: "/absnt/americano-nobg.png"
      },
      {
        id: "item-2",
        order_id: "ord-001",
        coffee_id: "coffee-2",
        quantity: 1,
        price: 15000,
        coffee_name: "Americano",
        coffee_image: "/absnt/americano-nobg.png"
      }
    ]
  },
  {
    id: "ord-002",
    customer_id: "user-123",
    customer_name: "Ihsan Dev",
    total_price: 25000,
    postage: 10000,
    payment_method: "cod",
    delivery_address: "Jalan Dago Atas No. 42",
    order_status: "processing",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    payment_status: "pending", // COD usually pending until delivery
    items: [
      {
        id: "item-3",
        order_id: "ord-002",
        coffee_id: "coffee-3",
        quantity: 1,
        price: 25000,
        coffee_name: "Caramel Macchiato",
        coffee_image: "/absnt/americano-nobg.png"
      }
    ]
  },
  {
    id: "ord-003",
    customer_id: "user-123",
    customer_name: "Ihsan Dev",
    total_price: 60000,
    postage: 0,
    payment_method: "qris",
    delivery_address: "Kampus ITB, Ganesha",
    order_status: "done",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    payment_status: "confirmed",
    items: [
      {
        id: "item-4",
        order_id: "ord-003",
        coffee_id: "coffee-1",
        quantity: 4,
        price: 15000,
        coffee_name: "Aren Latte",
        coffee_image: "/absnt/americano-nobg.png"
      }
    ]
  },
  {
    id: "ord-004",
    customer_id: "user-999",
    customer_name: "Sarah Connors",
    total_price: 30000,
    postage: 15000,
    payment_method: "qris",
    delivery_address: "Skynet HQ",
    order_status: "pending",
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 mins ago
    payment_status: "pending",
    items: [
      {
        id: "item-5",
        order_id: "ord-004",
        coffee_id: "coffee-5",
        quantity: 1,
        price: 30000,
        coffee_name: "Vanilla Latte",
        coffee_image: "/absnt/americano-nobg.png"
      }
    ]
  },
  {
    id: "ord-005",
    customer_id: "user-888",
    customer_name: "John Wick",
    total_price: 15000,
    postage: 20000,
    payment_method: "cod",
    delivery_address: "Continental Hotel",
    order_status: "cancelled",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    payment_status: "rejected",
    items: [
      {
        id: "item-6",
        order_id: "ord-005",
        coffee_id: "coffee-2",
        quantity: 1,
        price: 15000,
        coffee_name: "Americano (Black)",
        coffee_image: "/absnt/americano-nobg.png"
      }
    ]
  }
]
