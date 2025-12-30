'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getCoffees() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('coffee')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching coffee:', error)
    return []
  }

  return data
}

export async function upsertCoffee(formData: FormData) {
  const supabase = await createClient()

  // Verify Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: customer } = await supabase
    .from('customers')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (customer?.role !== 'admin') {
    return { error: 'Unauthorized: Admin only' }
  }

  const id = formData.get('id') as string // If present, it's an update
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = Number(formData.get('price'))
  const is_available = formData.get('is_available') === 'true'
  const image_url = formData.get('image_url') as string
  const categoryRaw = formData.get('category') as string
  const tag = formData.get('tag') as string

  // Validate category
  const validCategories = ['coffee', 'non coffee']
  const category = validCategories.includes(categoryRaw) ? categoryRaw : 'coffee'

  const coffeeData = {
    name,
    description,
    price,
    is_available,
    image_url: image_url || null,
    category: category as "coffee" | "non coffee", // Cast after validation
    tag: tag || null,
  }

  let error
  if (id) {
    // Update
    const res = await supabase
      .from('coffee')
      .update(coffeeData)
      .eq('id', id)
    error = res.error
  } else {
    // Insert
    const res = await supabase
      .from('coffee')
      .insert(coffeeData)
    error = res.error
  }

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/profile')
  revalidatePath('/') // If displayed on home
  return { success: 'Coffee saved successfully' }
}

export async function deleteCoffee(id: string) {
  const supabase = await createClient()

   // Verify Admin (duplicated check for safety)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: customer } = await supabase
    .from('customers')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (customer?.role !== 'admin') {
    return { error: 'Unauthorized' }
  }

  // 1. Get the coffee data first to find the image_url
  const { data: coffeeData } = await supabase
    .from('coffee')
    .select('image_url')
    .eq('id', id)
    .single()

  // 2. Delete from Storage if image exists
  if (coffeeData?.image_url) {
    const imageUrl = coffeeData.image_url
    // Extract filename from URL 
    // Format: .../storage/v1/object/public/coffee-images/filename.ext
    const fileName = imageUrl.split('/').pop()
    
    if (fileName) {
        await supabase.storage
          .from('coffee-images')
          .remove([fileName])
    }
  }

  const { error } = await supabase
    .from('coffee')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/profile')
  revalidatePath('/')
  return { success: 'Coffee deleted' }
}
