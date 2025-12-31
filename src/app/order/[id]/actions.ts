'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function uploadPaymentProof(formData: FormData) {
  const supabase = await createClient()

  const orderId = formData.get("orderId") as string
  const file = formData.get("file") as File

  if (!file) {
    return { error: "Tidak ada file yang diunggah" }
  }

  // 1. Upload File
  const fileName = `${orderId}/${Date.now()}_${file.name}`
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('payment-proofs')
    .upload(fileName, file)

  if (uploadError) {
    console.error("Upload Error:", uploadError)
    return { error: "Gagal mengunggah bukti pembayaran. Silahkan coba lagi." }
  }

  // 2. Get Public URL (or just store path if private bucket)
  // Since it's a private bucket, we store the path, or a signed URL. 
  // For admin viewing, we will use createSignedUrl later in the UI. 
  // Ideally, we just store the path `fileName`.
  
  // 3. Insert Payment Record
  const { error: dbError } = await supabase
    .from('payments')
    .insert({
        order_id: orderId,
        proof_url: fileName,
        status: 'pending'
    })

  if (dbError) {
     console.error("DB Error:", dbError)
     return { error: "Gagal menyimpan record bukti pembayaran." }
  }

  // 4. Update Order Status
  const { error: updateError } = await supabase
    .from('orders')
    .update({ 
        order_status: 'waiting_admin_confirmation',
        payment_status: 'waiting_admin_confirmation'
    })
    .eq('id', orderId)

  if (updateError) {
      console.error("Order Status Update Error:", updateError)
      // We don't fail the whole request here as the upload succeeded, but good to log
  }

  revalidatePath(`/order/${orderId}`)
  return { success: true }
}

export async function cancelOrder(orderId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { error: 'Not authenticated' }

    // fetching order to verify ownership and status
    const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('customer_id, order_status, payment_method')
        .eq('id', orderId)
        .single()
    
    if (fetchError || !order) return { error: 'Order not found' }
    
    if (order.customer_id !== user.id) return { error: 'Unauthorized' }

    // Cancellation Rules:
    // 1. COD: Can cancel if waiting for confirmation (initial state)
    // 2. QRIS: Can cancel if waiting for payment. If waiting for confirmation (proof uploaded), cannot cancel easily.
    
    const canCancel = 
        (order.payment_method === 'cod' && order.order_status === 'waiting_admin_confirmation') ||
        (order.payment_method === 'qris' && order.order_status === 'waiting_payment') ||
        order.order_status === 'pending';

    if (!canCancel) {
        return { error: 'Pesanan tidak dapat dibatalkan pada tahap ini.' }
    }

    // Extra safety: Check if payment proof exists in database (in case status update failed or race condition)
    if (order.payment_method === 'qris') {
        const { count } = await supabase
           .from('payments')
           .select('*', { count: 'exact', head: true })
           .eq('order_id', orderId)
        
        if (count && count > 0) {
             return { error: 'Bukti pembayaran sudah diunggah. Mohon tunggu konfirmasi admin atau hubungi admin pembatalan.' }
        }
    }

    const { error } = await supabase
        .from('orders')
        .update({ order_status: 'cancelled' })
        .eq('id', orderId)

    if (error) return { error: error.message }

    revalidatePath(`/order/${orderId}`)
    revalidatePath('/profile')
    return { success: true }
}
