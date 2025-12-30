'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react'
import PaymentUploader from '@/app/order/[id]/payment-uploader'
import { useRouter } from 'next/navigation'
import { PaymentProofImage } from '@/components/ui/payment-proof-image'
import NextImage from 'next/image'

interface Order {
    id: string
    total_price: number
    postage: number
    order_status: string
    payment_method: string
    payments: any[]
    [key: string]: any
}

interface OrderStatusLiveProps {
    initialOrder: any
}

export default function OrderStatusLive({ initialOrder }: OrderStatusLiveProps) {
    const [order, setOrder] = useState<Order>(initialOrder)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const channel = supabase
            .channel(`order-${order.id}`)
            .on('postgres_changes', { 
                event: 'UPDATE', 
                schema: 'public', 
                table: 'orders', 
                filter: `id=eq.${order.id}` 
            }, (payload) => {
                console.log("Order updated!", payload)
                setOrder(prev => ({ ...prev, ...payload.new }))
                router.refresh() // Refresh server components if needed
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [order.id, supabase, router])

    const grandTotal = order.total_price + order.postage
    const status = order.order_status

    // Render logic breakdown
    if (order.payment_method === 'cod') {
        return (
             <div className="flex flex-col items-center">
                 {status === 'rejected' ? (
                     <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                         <XCircle size={32} />
                     </div>
                 ) : (
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle size={32} />
                    </div>
                 )}
                
                <h1 className="text-2xl font-bold mb-2">
                    {status === 'rejected' ? 'Order Rejected' : 'Order Placed Successfully!'}
                </h1>
                
                {status !== 'rejected' && (
                    <p className="text-muted-foreground mb-6">
                        Thank you for your order. Please prepare exactly <span className="font-bold text-foreground">Rp {grandTotal.toLocaleString()}</span> in cash for our courier.
                    </p>
                )}

                <StatusBadge status={status} />
            </div>
        )
    }

    // QRIS Flow
    if (order.payment_method === 'qris') {
        // 1. Waiting for Payment
        if (status === 'waiting_payment') {
            return (
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                        <Clock size={32} />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Complete Your Payment</h1>
                    <p className="text-muted-foreground mb-6">
                        Please scan the QRIS code below and upload your proof of payment.
                    </p>
                    
                    {/* QRIS Placeholder */}
                    <div className="w-full max-w-[250px] bg-white p-3 border border-gray-200 rounded-2xl shadow-sm mb-6 relative overflow-hidden mx-auto">
                         <NextImage
                            src="/absnt/barcode.jpg"
                            alt="QRIS Barcode"
                            width={300}
                            height={300}
                            className="w-full h-auto rounded-xl"
                         />
                    </div>
                    <div className="flex flex-col items-center mb-8">
                        <h1 className='font-bold'>Absent Coffe, WONOSARI</h1>
                        <p>2JM2+CGX, Madusari, Wonosari, Kec. Wonosari, Kab. Gunungkidul, Daerah Istimewa Yogyakarta, Indonesia</p>
                        <h2 className='font-bold'>NMID: ID1025417796725</h2>
                    </div>

                    <PaymentUploader orderId={order.id} />
                </div>
            )
        }

        // 2. Proof Uploaded / Waiting Confirmation
        if (status === 'waiting_admin_confirmation') {
             return (
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4">
                        <Clock size={32} />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Payment Proof Uploaded</h1>
                    <p className="text-muted-foreground mb-4">
                        We are verifying your payment. This usually takes a few minutes.
                    </p>
                    
                    {order.payments?.length > 0 && order.payments[0].proof_url && (
                        <div className="w-full max-w-xs mb-6 border rounded-lg overflow-hidden bg-background shadow-sm">
                             <div className="p-2 border-b text-xs text-muted-foreground font-medium bg-muted/30">Your Upload</div>
                             <PaymentProofImage path={order.payments[0].proof_url} />
                        </div>
                    )}

                    <StatusBadge status={status} />
                </div>
             )
        }
        
        // 3. Rejected
         if (status === 'rejected') {
             return (
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                        <XCircle size={32} />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Order Rejected</h1>
                    <p className="text-muted-foreground mb-4">
                        Your order or payment was rejected by the admin.
                    </p>
                    
                    {order.payments?.length > 0 && order.payments[0].proof_url && (
                        <div className="w-full max-w-xs mb-6 border rounded-lg overflow-hidden bg-background shadow-sm">
                             <div className="p-2 border-b text-xs text-muted-foreground font-medium bg-muted/30">Your Upload</div>
                             <PaymentProofImage path={order.payments[0].proof_url} />
                        </div>
                    )}

                    <StatusBadge status={status} />
                </div>
             )
        }

        // 4. Processing / Done / Completed
        return (
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle size={32} />
                </div>
                <h1 className="text-2xl font-bold mb-2">Payment Confirmed!</h1>
                <p className="text-muted-foreground mb-6">
                    Your order is now being processed.
                </p>
                <StatusBadge status={status} />
            </div>
        )
    }

    return <div>Unknown State</div>
}

function StatusBadge({ status }: { status: string }) {
    const text = {
        'waiting_payment': 'Waiting for Payment',
        'waiting_admin_confirmation': 'Waiting for Seller Confirmation',
        'processing': 'Seller is Processing Your Order',
        'completed': 'Order Completed',
        'rejected': 'Order Rejected',
        'cancelled': 'Order Cancelled',
        'pending': 'Pending'
    }[status] || status

    const styles = {
        'waiting_payment': 'bg-blue-50 text-blue-800 border-blue-100',
        'waiting_admin_confirmation': 'bg-yellow-50 text-yellow-800 border-yellow-100',
        'processing': 'bg-blue-50 text-blue-800 border-blue-100',
        'completed': 'bg-green-50 text-green-800 border-green-100',
        'rejected': 'bg-red-50 text-red-800 border-red-100',
    }[status] || 'bg-gray-50 text-gray-800 border-gray-100'

    return (
        <div className={`px-4 py-2 rounded-lg text-sm font-medium border animate-in fade-in zoom-in ${styles}`}>
            Status: {text}
        </div>
    )
}
