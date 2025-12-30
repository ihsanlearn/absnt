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
    return { error: 'Email and password are required' }
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
    return { error: 'Email, password, and name are required' }
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

  // Manually create the customer record if signup is successful and we have a user ID
  // Policies might block this if not careful, but usually 'authenticated' user can insert into 'customers' 
  // IF policy is "customer read own profile" (id=auth.uid()). 
  // Wait, looking at the user request:
  // create policy "customers update own profile" on customers for update using (id = auth.uid())
  // There is NO INSERT policy for customers in the user request!
  // It says:
  // create table customers (id uuid primary key references auth.users(id) on delete cascade ...)
  //
  // Usually the best way is a database trigger (handle_new_user) which the user didn't mention, 
  // OR we insert it here using the Service Role (admin) client if we want to bypass RLS, 
  // OR we rely on the user adding an INSERT policy.
  // 
  // Given the user provided schema policies:
  // create policy "customers read own profile" on customers for select using (id = auth.uid())
  // create policy "customers update own profile" on customers for update using (id = auth.uid())
  // create policy "admin full access customers" on customers for all using (exists(select 1 from customers where id = auth.uid() and role = 'admin'))
  //
  // THERE IS NO INSERT POLICY FOR PLAIN USERS.
  // So a regular user CANNOT insert into 'customers' table directly from client or even server action acting as that user.
  //
  // Recommendation: Use a Trigger (best) or Admin Client (easier here without SQL).
  // Since I can't easily run SQL triggers without SQL access (I could try via Supabase dashboard recommendation, but code is better),
  // I will try to rely on a Trigger likely being the intended path, OR I will assume the user has set one up.
  // User *did* provide triggers for payments and orders, but NOT for users.
  //
  // Let's try to insert using the current client. If it fails due to RLS, I will handle it.
  // ACTUALLY, I can't use Service Role key because I don't have it (only Anon key in env).
  // So... I'll try to insert. If RLS blocks it, the user needs to add an INSERT policy or a Trigger.
  //
  // Let's add the INSERT policy via SQL instruction in the walkthrough later if it fails.
  // For now, I'll attempt the insert. If I can't, I'll fail gracefully.

  if (data.user) {
     // We need to insert into public.customers
     const { error: profileError } = await supabase.from('customers').insert({
        id: data.user.id,
        name: name,
        phone: phone || null,
        role: 'customer'
     })

     if (profileError) {
        console.error("Error creating profile:", profileError)
        // If RLS blocks, we might need to tell user to add a trigger.
        // Or add a policy: create policy "enable insert for authenticated users only" on customers for insert with check (auth.uid() = id);
        return { error: 'Account created but profile setup failed. ' + profileError.message }
     }
  }

  revalidatePath('/', 'layout')
  redirect('/verify-email')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  revalidatePath('/', 'layout')
  redirect('/login')
}
