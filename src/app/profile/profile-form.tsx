'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { updateProfile, changePassword } from './actions'
import { User, Lock, Save, Loader2, Coffee, Package } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import ManageCoffee from '@/components/profile/manage-coffee'
import CustomerOrders from '@/components/profile/orders/customer-orders'
import AdminOrders from '@/components/profile/orders/admin-orders'
import AddressList from '@/components/profile/address-list'
import { MapPin } from 'lucide-react'

interface ProfileFormProps {
  initialData: {
    name: string
    phone: string
    email: string
    role: string
  }
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'addresses' | 'coffee' | 'orders'>('orders')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)
  
  const router = useRouter()

  async function handleProfileUpdate(formData: FormData) {
    setIsLoading(true)
    setMessage(null)
    
    const res = await updateProfile(formData)
    
    if (res?.error) {
      setMessage({ text: res.error, type: 'error' })
    } else if (res?.success) {
      setMessage({ text: res.success, type: 'success' })
      router.refresh()
    }
    
    setIsLoading(false)
  }

  async function handlePasswordChange(formData: FormData) {
    setIsLoading(true)
    setMessage(null)
    
    const res = await changePassword(formData)
    
    if (res?.error) {
      setMessage({ text: res.error, type: 'error' })
    } else if (res?.success) {
      setMessage({ text: res.success, type: 'success' })
      // Optional: reset form
      const form = document.getElementById('password-form') as HTMLFormElement
      form?.reset()
    }
    
    setIsLoading(false)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar / Tabs */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
           <div className="p-4 bg-white/50 backdrop-blur-sm border rounded-2xl mb-6 flex flex-row md:flex-col items-center gap-4 md:gap-0 text-left md:text-center">
             <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-full flex items-center justify-center shrink-0 md:mb-3 text-primary">
                <User size={32} />
             </div>
             <div className="overflow-hidden">
                <h3 className="font-bold truncate text-lg">{initialData.name}</h3>
                <p className="text-xs text-muted-foreground truncate">{initialData.email}</p>
             </div>
           </div>

           <button
             onClick={() => setActiveTab('general')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'general' 
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-bold' 
                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
             }`}
           >
              <User size={18} />
              General Info
           </button>
           
           <button
             onClick={() => setActiveTab('security')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'security' 
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-bold' 
                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
             }`}
           >
              <Lock size={18} />
              Security
           </button>

           <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                 activeTab === 'orders' 
                 ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-bold' 
                 : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
           >
               <Package size={18} />
               Orders
               {initialData.role === 'admin' && <span className="ml-auto bg-white/20 text-xs px-2 py-0.5 rounded-full">Admin</span>}
           </button>

           {initialData.role === 'admin' && (
             <button
               onClick={() => setActiveTab('coffee')}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'coffee' 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-bold' 
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
               }`}
             >
                <Coffee size={18} />
                Manage Coffee
             </button>
           )}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white/50 backdrop-blur-sm border rounded-3xl p-6 md:p-8 shadow-sm">
           <h2 className="text-2xl font-bold font-(family-name:--font-lobster) mb-6">
             {activeTab === 'general' && 'Edit Profile'}
             {activeTab === 'security' && 'Change Password'}
             {activeTab === 'addresses' && 'Manage Addresses'}
             {activeTab === 'coffee' && 'Manage Coffee Menu'}
             {activeTab === 'orders' && (initialData.role === 'admin' ? 'Order Management' : 'Track Orders')}
           </h2>

           {message && (
             <motion.div 
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               className={`p-4 rounded-xl mb-6 text-sm flex items-center gap-2 ${
                 message.type === 'success' 
                   ? 'bg-green-500/10 text-green-600 border border-green-500/20' 
                   : 'bg-red-500/10 text-red-500 border border-red-500/20'
               }`}
             >
                {message.text}
             </motion.div>
           )}

           {activeTab === 'general' && (
             <form action={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name</label>
                      <input 
                        name="name"
                        defaultValue={initialData.name}
                        type="text"
                        required
                        className="w-full px-4 py-2 rounded-lg border bg-background/50 focus:ring-2 focus:ring-primary focus:outline-hidden transition-all"
                      />
                   </div>
                   
                   <div className="space-y-2">
                      <label className="text-sm font-medium">Phone Number</label>
                      <input 
                        name="phone"
                        defaultValue={initialData.phone}
                        type="tel"
                        className="w-full px-4 py-2 rounded-lg border bg-background/50 focus:ring-2 focus:ring-primary focus:outline-hidden transition-all"
                      />
                   </div>
                   
                   <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">Email Address</label>
                      <input 
                        value={initialData.email}
                        disabled
                        className="w-full px-4 py-2 rounded-lg border bg-muted text-muted-foreground cursor-not-allowed"
                      />
                      <p className="text-xs text-muted-foreground">Email cannot be changed successfully.</p>
                   </div>
                </div>

                <div className="pt-4">
                  <Button type="submit" disabled={isLoading} className="w-full md:w-auto font-bold px-8">
                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 w-4 h-4" />}
                    Save Changes
                  </Button>
                </div>
             </form>
           )}

           {activeTab === 'security' && (
             <form id="password-form" action={handlePasswordChange} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-sm font-medium">Current Password</label>
                   <input 
                     name="currentPassword"
                     type="password"
                     required
                     className="w-full px-4 py-2 rounded-lg border bg-background/50 focus:ring-2 focus:ring-primary focus:outline-hidden transition-all"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-sm font-medium">New Password</label>
                   <input 
                     name="password"
                     type="password"
                     required
                     minLength={6}
                     className="w-full px-4 py-2 rounded-lg border bg-background/50 focus:ring-2 focus:ring-primary focus:outline-hidden transition-all"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-sm font-medium">Confirm New Password</label>
                   <input 
                     name="confirmPassword"
                     type="password"
                     required
                     minLength={6}
                     className="w-full px-4 py-2 rounded-lg border bg-background/50 focus:ring-2 focus:ring-primary focus:outline-hidden transition-all"
                   />
                </div>

                <div className="pt-4">
                  <Button type="submit" disabled={isLoading} className="w-full md:w-auto font-bold px-8">
                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 w-4 h-4" />}
                    Update Password
                  </Button>
                </div>
             </form>
           )}

           {activeTab === 'addresses' && (
              <AddressList />
           )}

           {activeTab === 'coffee' && initialData.role === 'admin' && (
              <ManageCoffee />
           )}
           
           {activeTab === 'orders' && (
              <div className="space-y-6">
                 {initialData.role === 'admin' ? <AdminOrders /> : <CustomerOrders />}
              </div>
           )}
        </div>
      </div>
    </div>
  )
}
