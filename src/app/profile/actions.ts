'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Update public.customers table
  const { error } = await supabase
    .from('customers')
    .update({ name, phone: phone || null })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  // Also update Auth metadata if name changed, to keep it in sync for session display
  if (name) {
    await supabase.auth.updateUser({
      data: { full_name: name }
    })
  }

  revalidatePath('/profile')
  revalidatePath('/') // To update header
  
  return { success: 'Profile updated successfully' }
}


export async function changePassword(formData: FormData) {
  const supabase = await createClient()
  const currentPassword = formData.get('currentPassword') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }
  
  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

  // Get current user to get email for re-authentication
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user || !user.email) {
     return { error: 'Re-authentication failed. Please log in again.' }
  }

  // Verify current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword
  })

  if (signInError) {
    return { error: 'Current password is incorrect' }
  }

  // If correct, proceed to update
  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Password updated successfully' }
}

export async function getOrders() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items (
        id,
        quantity,
        price,
        coffee:coffee (name, image_url)
      )
    `)
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    return []
  }

  return orders
}

export async function getAdminOrders() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Check role
  const { data: customer } = await supabase
    .from('customers')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (customer?.role !== 'admin') {
      return []
  }

  // Fetch all orders with customer, items, and coffee details
  // Note: Joined fields like customer:customers!inner(name) are flattened or nested depending on query mod
  // We need to map this carefully in the UI.
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      customers (name, phone),
      payments (proof_url),
      items:order_items (
        id,
        quantity,
        price,
        coffee:coffee (name, image_url)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching admin orders:', error)
    // For now, return empty but we should ideally propogate this error
    throw new Error(error.message)
  }

  return orders
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
    const supabase = await createClient()

     // Check role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }
    
    const { data: customer } = await supabase
        .from('customers')
        .select('role')
        .eq('id', user.id)
        .single()
    
    if (customer?.role !== 'admin') return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus as any })
        .eq('id', orderId)
    
    if (error) return { error: error.message }
    return { success: true }
}

// Address Actions
export async function getAddresses() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: addresses, error } = await supabase
    .from('delivery_addresses')
    .select('*')
    .eq('customer_id', user.id)
    .order('is_default', { ascending: false }) // Defaults first
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching addresses:', error)
    return []
  }

  return addresses
}

export async function addAddress(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const label = formData.get('label') as string
  const recipient_name = formData.get('recipient_name') as string
  const phone = formData.get('phone') as string
  const address_details = formData.get('address_details') as string
  const is_default = formData.get('is_default') === 'on'

  if (is_default) {
      await supabase
        .from('delivery_addresses')
        .update({ is_default: false })
        .eq('customer_id', user.id)
  }

  const { error } = await supabase
    .from('delivery_addresses')
    .insert({
      customer_id: user.id,
      label,
      recipient_name,
      phone,
      address_details,
      is_default
    })

  if (error) return { error: error.message }
  
  revalidatePath('/profile')
  revalidatePath('/checkout')
  return { success: 'Address added' }
}

export async function updateAddress(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const label = formData.get('label') as string
  const recipient_name = formData.get('recipient_name') as string
  const phone = formData.get('phone') as string
  const address_details = formData.get('address_details') as string
  const is_default = formData.get('is_default') === 'on'

  if (is_default) {
      await supabase
        .from('delivery_addresses')
        .update({ is_default: false })
        .eq('customer_id', user.id)
  }

  if (!is_default) {
      const { error: err } = await supabase
        .from('delivery_addresses')
        .update({
             label, recipient_name, phone, address_details, is_default: false
        })
        .eq('id', id)
      if(err) return { error: err.message }
  } else {
      const { error: err } = await supabase
        .from('delivery_addresses')
        .update({
             label, recipient_name, phone, address_details, is_default: true
        })
        .eq('id', id)
      if(err) return { error: err.message }
  }

  revalidatePath('/profile')
  revalidatePath('/checkout')
  return { success: 'Address updated' }
}

export async function deleteAddress(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('delivery_addresses')
        .delete()
        .eq('id', id)
        .eq('customer_id', user.id)

    if (error) return { error: error.message }
    
    revalidatePath('/profile')
    revalidatePath('/checkout')
    return { success: 'Address deleted' }
}

export async function setDefaultAddress(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    await supabase
        .from('delivery_addresses')
        .update({ is_default: false })
        .eq('customer_id', user.id)

    const { error } = await supabase
        .from('delivery_addresses')
        .update({ is_default: true })
        .eq('id', id)
        .eq('customer_id', user.id)

    if (error) return { error: error.message }
    
    revalidatePath('/profile')
    revalidatePath('/checkout')
    return { success: 'Default address updated' }
}
