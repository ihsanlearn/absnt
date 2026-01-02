'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Wajib mengisi email dan password' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const origin = (await headers()).get('origin')
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const terms = formData.get('terms')

  if (!email || !password || !name) {
    return { error: 'Wajib mengisi email, password, dan nama' }
  }

  if (!terms) {
    return { error: 'You must agree to the Terms and Privacy Policy' }
  }

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
        emailRedirectTo: `${origin}/auth/callback?next=/`,
        data: {
          full_name: name,
        }
    }
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
     // We need to insert into public.customers
     const { error: profileError } = await supabase.from('customers').insert({
        id: data.user.id,
        name: name,
        phone: phone || null,
        role: 'customer'
     })

     if (profileError) {
        console.error("Error pembuatan profil:", profileError)
        return { error: 'Akun berhasil dibuat, namun gagal membuat profil. ' + profileError.message }
     }
  }

  revalidatePath('/', 'layout')
  redirect('/verify-email')
}

export async function logout() {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Logout error:', error)
    // You might want to return this error if you change this to return a value
    // return { error: error.message }
  } else {
    console.log('Logout successful')
  }
  
  revalidatePath('/', 'layout')
  redirect('/login')
}
