'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Truck, Package, Clock, XCircle, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { getOrders } from '@/app/profile/actions'

// Type definition matching the Supabase query structure
// We can't easily import the inferred type from server action outcome without some helpers, 
// so defining a compatible interface here is pragmatic.
interface OrderItem {
  id: string
  quantity: number
  price: number
  coffee: {
    name: string
    image_url: string | null
  } | null
}

interface Order {
  id: string
  created_at: string | null
  order_status: "pending" | "waiting_payment" | "waiting_admin_confirmation" | "processing" | "done" | "completed" | "cancelled" | "rejected" | string | null
  total_price: number
  postage: number
  items: OrderItem[]
}

export default function CustomerOrders() {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active')
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await getOrders()
        // The data returned from action needs to be cast or checked, 
        // but for now we trust the structure matches our interface since we wrote the query.
        setOrders(data as any[]) 
      } catch (error) {
        console.error("Failed to load orders", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const activeOrders = orders.filter(o => ['pending', 'processing', 'waiting_payment', 'waiting_admin_confirmation'].includes(o.order_status || ''))
  const historyOrders = orders.filter(o => ['done', 'cancelled', 'completed', 'rejected'].includes(o.order_status || ''))

  const displayOrders = activeTab === 'active' ? activeOrders : historyOrders

  if (isLoading) {
      return (
          <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-primary" size={32} />
          </div>
      )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">My Orders</h3>
        <div className="bg-muted p-1 rounded-lg flex gap-1">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === 'active' 
                ? 'bg-background shadow-sm text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Active
          </button>
          <button
             onClick={() => setActiveTab('history')}
             className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
               activeTab === 'history' 
                 ? 'bg-background shadow-sm text-foreground' 
                 : 'text-muted-foreground hover:text-foreground'
             }`}
          >
            History
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {displayOrders.length > 0 ? (
            displayOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-muted"
            >
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No orders found in {activeTab}.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function OrderCard({ order }: { order: Order }) {
  const status = order.order_status || 'pending'
  
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    waiting_payment: 'bg-orange-100 text-orange-800',
    waiting_admin_confirmation: 'bg-purple-100 text-purple-800',
    processing: 'bg-blue-100 text-blue-800',
    done: 'bg-green-100 text-green-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  const statusIcons: Record<string, any> = {
    pending: Clock,
    waiting_payment: Clock,
    waiting_admin_confirmation: Clock,
    processing: Truck,
    done: CheckCircle,
    completed: CheckCircle,
    cancelled: XCircle,
  }

  const StatusIcon = statusIcons[status] || Clock

  return (
    <Link href={`/order/${order.id}`} className="block group">
        <motion.div
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="border border-muted rounded-xl bg-background overflow-hidden transition-all group-hover:border-primary/50 group-hover:shadow-md"
        >
          <div className="p-4 border-b border-muted bg-muted/20 flex justify-between items-center group-hover:bg-primary/5 transition-colors">
             <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted-foreground group-hover:text-primary transition-colors">Order #{order.id.slice(0, 8)}</span>
                <Badge className={`${statusColors[status] || 'bg-gray-100'} border-none shadow-none`}>
                   <StatusIcon className="w-3 h-3 mr-1" />
                   {status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </Badge>
             </div>
             <span className="text-xs text-muted-foreground">
                {order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}
             </span>
          </div>
          
          <div className="p-4 space-y-4">
             {/* Items */}
             <div className="space-y-3">
                {order.items.map((item) => (
                   <div key={item.id} className="flex gap-3">
                      <div className="w-12 h-12 bg-muted rounded-md relative overflow-hidden shrink-0">
                         <img src={item.coffee?.image_url || "/absnt/americano-nobg.png"} alt={item.coffee?.name || 'Item'} className="object-cover w-full h-full" />
                      </div>
                      <div className="flex-1">
                         <p className="font-medium text-sm group-hover:text-primary transition-colors">{item.coffee?.name || 'Unknown Item'}</p>
                         <p className="text-xs text-muted-foreground">{item.quantity} x Rp {item.price.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                         <p className="font-medium text-sm">Rp {(item.quantity * item.price).toLocaleString()}</p>
                      </div>
                   </div>
                ))}
             </div>
             
             {/* Status Tracker (Only for Active) */}
             {['pending', 'processing', 'waiting_payment', 'waiting_admin_confirmation'].includes(status) && (
                <div className="py-2">
                   <div className="h-1 w-full bg-muted rounded-full overflow-hidden flex">
                      <div className={`h-full transition-all duration-500 ${
                          status === 'pending' || status === 'waiting_payment' ? 'bg-yellow-400 w-1/4' :
                          status === 'waiting_admin_confirmation' ? 'bg-purple-400 w-1/2' :
                          status === 'processing' ? 'bg-blue-500 w-3/4' : 'bg-green-500 w-full'
                      }`} />
                   </div>
                   <p className="text-xs text-center mt-2 text-muted-foreground">
                      {status === 'waiting_payment' ? 'Waiting for payment...' :
                       status === 'waiting_admin_confirmation' ? 'Waiting for seller confirmation...' :
                       status === 'processing' ? 'Seller process your order' :
                       'Order received'}
                   </p>
                </div>
             )}
             
             <div className="pt-2 border-t border-muted px-1">
                <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                   <span>Subtotal ({order.items.length} Items)</span>
                   <span>Rp {order.total_price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
                   <span>Postage</span>
                   <span>Rp {order.postage.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-dashed border-muted">
                   <span className="font-medium text-sm">Total Payment</span>
                   <span className="text-lg font-bold text-primary">Rp {(order.total_price + order.postage).toLocaleString()}</span>
                </div>
             </div>
          </div>
        </motion.div>
    </Link>
  )
}
