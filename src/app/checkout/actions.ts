'use server'

import { createClient } from "@/lib/supabase/server"
import { CartItem } from "@/context/cart-context"
import { isStoreOpen, getStoreStatusMessage } from "@/utils/time"

export async function createOrder(formData: FormData) {
  const supabase = await createClient()

  // 0. Validate Store Hours
  const isStoreOpen = await import("../settings-actions").then(mod => mod.getStoreStatus())
  if (!isStoreOpen) {
    return { error: "Maaf, toko sedang tutup. Silahkan coba lagi nanti." }
  }

  // 1. Get Current User
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Anda harus login terlebih dahulu sebelum membuat pesanan." }
  }
  
  const address = formData.get("address") as string
  const paymentMethod = formData.get("paymentMethod") as "qris" | "cod"
  const totalPrice = parseInt(formData.get("totalPrice") as string)
  const postage = parseInt(formData.get("postage") as string)
  const itemsJson = formData.get("items") as string
  const items = JSON.parse(itemsJson) as CartItem[]

  if (!items || items.length === 0) {
    return { error: "Tidak ada item dalam keranjang" }
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
        console.error("Gagal membuat pesanan:", orderError)
        return { error: "Gagal membuat pesanan." }
    }

    // 3. Insert Order Items
    const orderItemsData = items.map(item => ({
        order_id: order.id,
        coffe_id: item.id,
        quantity: item.quantity,
        price: item.price
    }))

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData)

    if (itemsError) {
        console.error("Gagal membuat item pesanan:", itemsError)
        // Ideally should rollback order here
        return { error: "Gagal membuat item pesanan." }
    }

    return { success: true, orderId: order.id }

  } catch (error) {
    console.error("Terjadi kesalahan saat membuat pesanan:", error)
    return { error: "Terjadi kesalahan saat membuat pesanan." }
  }
}
