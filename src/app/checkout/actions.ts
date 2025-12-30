'use server'

import { createClient } from "@/lib/supabase/server"
import { CartItem } from "@/context/cart-context"

export async function createOrder(formData: FormData) {
  const supabase = await createClient()

  // 1. Get Current User
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "You must be logged in to place an order." }
  }

  // Get Customer ID (Assuming user is already in customers table, if not we might need to handle that)
  // For now, assume id matches.
  
  const address = formData.get("address") as string
  const paymentMethod = formData.get("paymentMethod") as "qris" | "cod"
  const totalPrice = parseInt(formData.get("totalPrice") as string)
  const postage = parseInt(formData.get("postage") as string)
  const itemsJson = formData.get("items") as string
  const items = JSON.parse(itemsJson) as CartItem[]

  if (!items || items.length === 0) {
    return { error: "No items in cart" }
  }

  try {
    // 2. Insert Order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            customer_id: user.id,
            total_price: totalPrice,
            postage: postage,
            payment_method: paymentMethod,
            delivery_address: address,
            order_status: paymentMethod === 'cod' ? 'waiting_admin_confirmation' : 'waiting_payment',
            payment_status: paymentMethod === 'cod' ? 'pending' : 'waiting_payment'
        })
        .select()
        .single()

    if (orderError) {
        console.error("Order Insert Error:", orderError)
        return { error: "Failed to create order record." }
    }

    // 3. Insert Order Items
    const orderItemsData = items.map(item => ({
        order_id: order.id,
        coffe_id: item.id, // Note: 'coffe_id' typo matches schema
        quantity: item.quantity,
        price: item.price
    }))

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData)

    if (itemsError) {
        console.error("Items Insert Error:", itemsError)
        // Ideally should rollback order here
        return { error: "Failed to create order items." }
    }

    return { success: true, orderId: order.id }

  } catch (error) {
    console.error("Create Order Exception:", error)
    return { error: "An unexpected error occurred." }
  }
}
