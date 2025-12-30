'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function uploadPaymentProof(formData: FormData) {
  const supabase = await createClient()

  const orderId = formData.get("orderId") as string
  const file = formData.get("file") as File

  if (!file) {
    return { error: "No file provided" }
  }

  // 1. Upload File
  const fileName = `${orderId}/${Date.now()}_${file.name}`
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('payment-proofs')
    .upload(fileName, file)

  if (uploadError) {
    console.error("Upload Error:", uploadError)
    return { error: "Failed to upload image. Please try again." }
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
     return { error: "Failed to save payment record." }
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
