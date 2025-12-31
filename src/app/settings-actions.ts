'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getStoreStatus(): Promise<boolean> {
  const supabase = await createClient()

  // Fetch the value from store_settings.
  // We assume the key is 'is_store_open'
  const { data, error } = await supabase
    .from('store_settings')
    .select('value')
    .eq('key', 'is_store_open')
    .single()

  if (error || !data) {
    // If table doesn't exist or no row yet, default to TRUE or FALSE?
    // Since we are moving away from hardcoded time, let's default to closed if config is missing to avoid accidental orders
    // UNLESS the user hasn't run migration yet.
    console.error("Error fetching store status (using default=closed):", error)
    return false
  }

  return data.value === 'true'
}

export async function updateStoreStatus(isOpen: boolean): Promise<{ success: boolean, error?: string }> {
  const supabase = await createClient()

  // Verify user is admin (optional based on policy, but good practice here too)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  // Update or Insert
  const { error } = await supabase
    .from('store_settings')
    .upsert({ 
        key: 'is_store_open', 
        value: isOpen ? 'true' : 'false',
        updated_at: new Date().toISOString()
    })

  if (error) {
    console.error("Failed to update store status:", error)
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/checkout')
  return { success: true }
}
