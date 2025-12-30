'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Filter, Eye, Check, X, Clock, Loader2 } from 'lucide-react'
import Modal from '@/components/ui/modal'
import { getAdminOrders, updateOrderStatus } from '@/app/profile/actions'
import { PaymentProofImage } from '@/components/ui/payment-proof-image'

export type OrderStatus = 'pending' | 'waiting_payment' | 'waiting_admin_confirmation' | 'processing' | 'done' | 'completed' | 'cancelled' | 'rejected'

interface OrderItem {
    id: string
    quantity: number
    price: number
    coffee_name: string
    coffee_image: string
    coffee?: {
        name: string
        image_url: string
    }
}

interface Order {
    id: string
    created_at: string
    order_status: OrderStatus
    total_price: number
    postage: number
    payment_method: string
    payment_status: string
    delivery_address: string
    customer_name: string
    customers?: {
        name: string
        phone: string
        email?: string
    }
    items: OrderItem[]
    payments?: {
        proof_url: string
    }[]
}

export default function AdminOrders() {
  const [filter, setFilter] = useState<'all' | OrderStatus>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  const [confirmationModal, setConfirmationModal] = useState<{
      isOpen: boolean
      type: 'process' | 'complete' | 'cancel' | null
      orderId: string | null
      orderStatus: OrderStatus | null
  }>({
      isOpen: false,
      type: null,
      orderId: null,
      orderStatus: null
  })

  async function fetchOrders() {
      setIsLoading(true)
      try {
          const data = await getAdminOrders()
          // Map data to match interface if needed, or use directly if fields align
          const mappedOrders = data?.map((o: any) => ({
             ...o,
             customer_name: o.customers?.name || 'Unknown',
             items: o.items?.map((i: any) => ({
                 ...i,
                 coffee_name: i.coffee?.name || 'Unknown Item',
                 coffee_image: i.coffee?.image_url
             }))
          })) || []
          
          setOrders(mappedOrders)
      } catch (error) {
          console.error("Failed to fetch admin orders", error)
      } finally {
          setIsLoading(false)
      }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.order_status === filter)

  function openConfirmation(id: string, newStatus: OrderStatus, type: 'process' | 'complete' | 'cancel') {
      setConfirmationModal({
          isOpen: true,
          type,
          orderId: id,
          orderStatus: newStatus
      })
  }

  async function handleConfirmAction() {
    const { orderId, orderStatus } = confirmationModal
    if (!orderId || !orderStatus) return

    setIsUpdating(true)
    const result = await updateOrderStatus(orderId, orderStatus)
    
    if (result.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: orderStatus } : o))
        if (selectedOrder && selectedOrder.id === orderId) {
            setSelectedOrder(prev => prev ? { ...prev, order_status: orderStatus } : null)
        }
        setConfirmationModal({ isOpen: false, type: null, orderId: null, orderStatus: null })
    } else {
        alert("Failed to update status: " + result.error)
    }
    setIsUpdating(false)
  }

  if (isLoading) {
      return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="space-y-6">
       {/* Header & Filter */}
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-xl font-bold">Incoming Orders</h3>
          <div className="flex gap-2 p-1 bg-muted rounded-lg overflow-x-auto max-w-full">
             {(['all', 'completed', 'waiting_payment', 'waiting_admin_confirmation', 'processing', 'rejected', 'cancelled'] as const).map((status) => (
                <button
                   key={status}
                   onClick={() => setFilter(status)}
                   className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize whitespace-nowrap transition-all ${
                      filter === status 
                      ? 'bg-background shadow-sm text-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                   }`}
                >
                   {status.replace(/_/g, ' ')}
                </button>
             ))}
          </div>
       </div>

       {/* Orders List */}
       <div className="border rounded-xl bg-background overflow-hidden shadow-sm">
          <div className="grid grid-cols-[1fr_24px] md:grid-cols-[2fr_1.5fr_120px_100px_100px_50px] gap-4 p-4 border-b bg-muted/40 text-xs font-medium text-muted-foreground uppercase tracking-wider items-center">
             <div className="hidden md:block">Order Details</div>
             <div className="hidden md:block">Customer</div>
             <div className="hidden md:block">Total</div>
             <div className="hidden md:block">Status</div>
             <div className="hidden md:block">Payment</div>
             <div className="md:hidden col-span-2">Orders</div>
             <div className="hidden md:flex justify-end pr-2">Act</div>
          </div>
          
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                    <div 
                        key={order.id} 
                        className="grid grid-cols-[1fr_auto] md:grid-cols-[2fr_1.5fr_120px_100px_100px_50px] gap-4 p-4 items-center text-sm hover:bg-muted/5 transition-colors group cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
                    >
                        {/* Order Info */}
                        <div className="flex flex-col gap-1 pr-2">
                            <div className="font-semibold text-primary font-mono tracking-tight">#{order.id.slice(0, 8).toUpperCase()}</div>
                            <div className="text-secondary-foreground text-xs line-clamp-2 md:line-clamp-1" title={order.items?.map(i => `${i.quantity} ${i.coffee_name}`).join(', ')}>
                                {order.items?.map(i => `${i.quantity} ${i.coffee_name}`).join(', ')}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Clock size={10} />
                                {new Date(order.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                        </div>
                        
                        {/* Customer Info */}
                        <div className="md:hidden text-right">
                             <StatusBadge status={order.order_status} />
                             <div className="mt-1 font-bold text-sm">Rp {(order.total_price + order.postage).toLocaleString()}</div>
                        </div>

                        <div className="hidden md:block pr-4">
                            <div className="font-medium text-foreground truncate" title={order.customer_name}>{order.customer_name}</div>
                            <div className="text-xs text-muted-foreground truncate" title={order.delivery_address}>{order.delivery_address || 'No address provided'}</div>
                        </div>
                        
                        <div className="hidden md:block font-bold text-foreground/90">
                            Rp {(order.total_price + order.postage).toLocaleString()}
                        </div>
                        
                        <div className="hidden md:block">
                            <StatusBadge status={order.order_status} />
                        </div>
                        
                        <div className="hidden md:block">
                            <Badge variant="secondary" className="capitalize text-xs font-normal border-border/50">{order.payment_method}</Badge>
                        </div>
                        
                        <div className="hidden md:flex justify-end">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" onClick={() => setSelectedOrder(order)}>
                                <Eye size={16} />
                            </Button>
                        </div>
                        
                        {/* Mobile Action (Hidden on desktop) */}
                        <div className="col-span-2 md:hidden pt-2 border-t mt-2 flex justify-between items-center text-xs text-muted-foreground">
                            <span>{order.payment_method} · {order.items.length} Items</span>
                            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setSelectedOrder(order)}>
                                View Details
                            </Button>
                        </div>
                    </div>
                ))
            ) : (
                <div className="p-16 flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <Filter className="h-8 w-8 opacity-20" />
                    <p>No orders found matching this filter.</p>
                </div>
            )}
          </div>
       </div>

       {/* Detail Modal */}
       <Modal 
         isOpen={!!selectedOrder} 
         onClose={() => setSelectedOrder(null)} 
         title={`Order Details #${selectedOrder?.id.slice(0,8).toUpperCase()}`}
         maxWidth="max-w-xl"
       >
         {selectedOrder && (
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-bold text-lg">{selectedOrder.customer_name}</h4>
                        <div className="text-muted-foreground text-sm space-y-1">
                             {/* Email is optional/removed from query, so careful accessing it */}
                             {selectedOrder.customers?.email && <p>{selectedOrder.customers.email}</p>}
                             <p>{selectedOrder.customers?.phone}</p>
                             <p className="border-t pt-1 mt-1">{selectedOrder.delivery_address}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <StatusBadge status={selectedOrder.order_status} />
                        <p className="text-xs text-muted-foreground mt-2">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                    </div>
                </div>

                <div className="border-t border-b py-4 space-y-3">
                    {selectedOrder.items?.map(item => (
                        <div key={item.id} className="flex justify-between items-center bg-muted/30 p-2 rounded-lg">
                             <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 bg-muted rounded overflow-hidden shrink-0">
                                     <img src={item.coffee_image || "/absnt/americano-nobg.png"} className="w-full h-full object-cover" />
                                 </div>
                                 <div className="overflow-hidden">
                                     <p className="font-medium text-sm truncate">{item.coffee_name}</p>
                                     <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                                 </div>
                             </div>
                             <p className="font-medium whitespace-nowrap">Rp {(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                    ))}
                    <div className="space-y-2 pt-2 border-t text-sm">
                        <div className="flex justify-between text-muted-foreground">
                            <span>Subtotal</span>
                            <span>Rp {selectedOrder.total_price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                            <span>Postage</span>
                            <span>Rp {selectedOrder.postage.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-dashed">
                            <span className="font-bold">Total Amount</span>
                            <span className="font-bold text-primary text-lg">Rp {(selectedOrder.total_price + selectedOrder.postage).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-muted/30 p-4 rounded-xl space-y-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment Method:</span>
                        <span className="font-medium uppercase">{selectedOrder.payment_method}</span>
                    </div>

                    {selectedOrder.payment_method === 'qris' && selectedOrder.payments && selectedOrder.payments.length > 0 && selectedOrder.payments[0].proof_url && (
                        <div className="space-y-2">
                             <p className="font-medium">Payment Proof</p>
                             <div className="rounded-lg overflow-hidden border bg-background">
                                 {/* Using a helper to get URL or just constructing it if environment is known. */}
                                 {/* Since we can't easily use async getPublicUrl in render, we use a component or specialized image logic. */}
                                 {/* For now, I will assume public bucket access pattern if direct URL is simplest, OR use an Img tag that handles it? */}
                                 {/* Simplest: Pass the path to a configured Image component? No, I'll just use the pattern: */}
                                 {/* https://<PROJECT_ID>.supabase.co/storage/v1/object/public/payment-proofs/<PATH> */}
                                 {/* I will use the Project URL from env if available, or just a hardcoded guess if I must. */}
                                 {/* Actually, I will use a simple component <PaymentProofImage path={...} /> defined in this file to fetch the URL cleanly. */}
                                 <PaymentProofImage path={selectedOrder.payments[0].proof_url} />
                             </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    {['pending', 'waiting_payment', 'waiting_admin_confirmation'].includes(selectedOrder.order_status) && (
                        <>
                           <Button 
                                variant="outline" 
                                className="text-red-500 hover:text-red-700 hover:bg-red-50" 
                                onClick={() => openConfirmation(selectedOrder.id, 'rejected', 'cancel')}
                                disabled={isUpdating}
                           >
                                Reject Order
                           </Button>
                           <Button 
                                className="bg-blue-600 hover:bg-blue-700" 
                                onClick={() => openConfirmation(selectedOrder.id, 'processing', 'process')}
                                disabled={isUpdating}
                           >
                                Accept & Process
                           </Button>
                        </>
                    )}
                    {selectedOrder.order_status === 'processing' && (
                         <Button 
                            className="col-span-2 bg-green-600 hover:bg-green-700" 
                            onClick={() => openConfirmation(selectedOrder.id, 'completed', 'complete')}
                            disabled={isUpdating}
                         >
                             Mark as Completed
                         </Button>
                    )}
                    {['done', 'completed', 'cancelled', 'rejected'].includes(selectedOrder.order_status) && (
                        <p className="col-span-2 text-center text-sm text-muted-foreground italic">
                            Order is closed.
                        </p>
                    )}
                </div>
            </div>
         )}
       </Modal>

       {/* Confirmation Modal */}
       <Modal
          isOpen={confirmationModal.isOpen}
          onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
          title={
              confirmationModal.type === 'cancel' ? 'Reject Order?' :
              confirmationModal.type === 'process' ? 'Accept Order?' :
              'Complete Order?'
          }
           maxWidth="max-w-md"
       >
          <div className="space-y-4">
              <p className="text-muted-foreground">
                  {confirmationModal.type === 'cancel' 
                    ? 'Are you sure you want to reject this order? This action cannot be undone.' 
                    : confirmationModal.type === 'process'
                    ? 'Are you sure you want to accept and process this order?'
                    : 'Are you sure you want to mark this order as completed?'}
              </p>
              
              <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
                    disabled={isUpdating}
                  >
                      Cancel
                  </Button>
                  <Button 
                    className={
                        confirmationModal.type === 'cancel' ? 'bg-red-600 hover:bg-red-700' :
                        confirmationModal.type === 'process' ? 'bg-blue-600 hover:bg-blue-700' :
                        'bg-green-600 hover:bg-green-700'
                    }
                    onClick={handleConfirmAction}
                    disabled={isUpdating}
                  >
                      {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {confirmationModal.type === 'cancel' ? 'Yes, Reject' : 'Yes, Confirm'}
                  </Button>
              </div>
          </div>
       </Modal>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        waiting_payment: 'bg-orange-100 text-orange-800 border-orange-200',
        waiting_admin_confirmation: 'bg-purple-100 text-purple-800 border-purple-200',
        processing: 'bg-blue-100 text-blue-800 border-blue-200',
        done: 'bg-green-100 text-green-800 border-green-200',
        completed: 'bg-green-100 text-green-800 border-green-200',
        cancelled: 'bg-red-100 text-red-800 border-red-200',
        rejected: 'bg-red-100 text-red-800 border-red-200',
    }[status] || 'bg-gray-100 text-gray-800'

    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${styles} capitalize inline-block text-center min-w-[80px]`}>
            {status.replace(/_/g, ' ')}
        </span>
    )
}


