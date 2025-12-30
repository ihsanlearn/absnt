import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from './profile-form'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch customer data
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', user.id)
    .single()

  const initialData = {
    name: customer?.name || user.user_metadata?.full_name || '',
    phone: customer?.phone || '',
    email: user.email || '',
    role: customer?.role || 'customer'
  }

  return (
    <main className="min-h-screen bg-muted/20 pb-20">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
           <Link href="/" className="p-2 hover:bg-muted rounded-full transition-colors">
             <ArrowLeft size={20} />
           </Link>
           <h1 className="text-xl font-bold">My Settings</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <ProfileForm initialData={initialData} />
      </div>
    </main>
  )
}
