'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react'
import PaymentUploader from '@/app/order/[id]/payment-uploader'
import { useRouter } from 'next/navigation'
import { PaymentProofImage } from '@/components/ui/payment-proof-image'
import NextImage from 'next/image'
import { cancelOrder } from '@/app/order/[id]/actions'
import { Button } from '@/components/ui/button'
import Modal from '@/components/ui/modal'

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

    const [showCancelModal, setShowCancelModal] = useState(false)
    const [isCancelling, setIsCancelling] = useState(false)

    function handleOpenCancel() {
        setShowCancelModal(true)
    }

    async function handleConfirmCancel() {
        setIsCancelling(true)
        const res = await cancelOrder(order.id)
        if (!res.success) {
            alert(res.error || "Gagal membatalkan pesanan")
            setIsCancelling(false)
        } else {
             // Success, modal will close or component will re-render due to status change, but let's be safe
             setShowCancelModal(false)
             setIsCancelling(false)
        }
    }

    // Render logic breakdown
    if (order.payment_method === 'cod') {
        return (
             <div className="flex flex-col items-center">
                 {status === 'rejected' || status === 'cancelled' ? (
                     <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                         <XCircle size={32} />
                     </div>
                 ) : (
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle size={32} />
                    </div>
                 )}
                
                <h1 className="text-2xl font-bold mb-2">
                    {status === 'rejected' ? 'Pesanan Ditolak' : status === 'cancelled' ? 'Pesanan Dibatalkan' : 'Pesanan Berhasil Dibuat!'}
                </h1>
                
                {status !== 'rejected' && status !== 'cancelled' && (
                    <p className="text-muted-foreground mb-6">
                        Terima kasih telah memesan. Silahkan siapkan uang sebesar <span className="font-bold text-foreground">Rp {grandTotal.toLocaleString()}</span> dalam tunai untuk pengiriman.
                    </p>
                )}

                <StatusBadge status={status} />

                {/* Cancel Button for COD */}
                {(status === 'waiting_admin_confirmation' || status === 'pending') && (
                    <>
                        <Button 
                            variant="destructive" 
                            className="mt-6 text-red-500 bg-background hover:text-red-600 hover:bg-red-50 border-red-200"
                            onClick={handleOpenCancel}
                        >
                            Batalkan Pesanan
                        </Button>
                        <CancelModal 
                            isOpen={showCancelModal} 
                            onClose={() => setShowCancelModal(false)} 
                            onConfirm={handleConfirmCancel}
                            isCancelling={isCancelling}
                        />
                    </>
                )}
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
                    <h1 className="text-2xl font-bold mb-2">Lengkapi Pembayaran Anda</h1>
                    <p className="text-muted-foreground mb-6">
                        Silahkan scan QRIS code di bawah ini dan upload bukti pembayaran Anda.
                    </p>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex gap-3 text-sm text-yellow-800 mb-4 items-start">
                        <div className="mt-0.5 shrink-0">⚠️</div>
                        <p>
                            <span className="font-bold">Penting:</span> Hanya pengiriman ke <span className="font-bold">Area Wonosari</span>. Pesanan di luar area ini atau terlalu jauh mungkin akan ditolak (kecuali si pengantar lagi pengen).
                            <a 
                                href={`https://wa.me/628123456789?text=Mas, mau engga ya antar ke alamat saya di ${order.delivery_address || '...'} sebelum saya bayar, mohon konfirmasi cepatnya.`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-block ml-1 text-primary hover:underline font-bold"
                            >
                                Tanya Admin Disini ↗
                            </a>
                        </p>
                    </div>
                    
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

                    <div className="flex flex-col gap-3 w-full max-w-sm items-center">
                        <PaymentUploader orderId={order.id} />
                        
                        <Button 
                            variant="ghost" 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={handleOpenCancel}
                        >
                            Batalkan Pesanan
                        </Button>
                        <CancelModal 
                            isOpen={showCancelModal} 
                            onClose={() => setShowCancelModal(false)} 
                            onConfirm={handleConfirmCancel}
                            isCancelling={isCancelling}
                        />
                    </div>
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
                    <h1 className="text-2xl font-bold mb-2">Bukti Pembayaran Dikirim</h1>
                    <p className="text-muted-foreground mb-4">
                        Kami sedang memverifikasi pembayaran Anda. Mngkin ini memerlukan beberapa menit.
                    </p>
                    
                    {order.payments?.length > 0 && order.payments[0].proof_url && (
                        <div className="w-full max-w-xs mb-6 border rounded-lg overflow-hidden bg-background shadow-sm">
                             <div className="p-2 border-b text-xs text-muted-foreground font-medium bg-muted/30">Bukti Pembayaran Anda</div>
                             <PaymentProofImage path={order.payments[0].proof_url} />
                        </div>
                    )}

                    <StatusBadge status={status} />
                </div>
             )
        }
        
        // 3. Rejected or Cancelled
         if (status === 'rejected' || status === 'cancelled') {
             return (
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                        <XCircle size={32} />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">
                        {status === 'rejected' ? 'Pesanan Ditolak' : 'Pesanan Dibatalkan'}
                    </h1>
                    <p className="text-muted-foreground mb-4">
                        {status === 'rejected' 
                            ? 'Pesanan atau pembayaran Anda ditolak oleh admin.'
                            : 'Pesanan ini telah dibatalkan.'
                        }
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
                <h1 className="text-2xl font-bold mb-2">Pesanan Diterima!</h1>
                <p className="text-muted-foreground mb-6">
                    Pesanan kamu sedang diproses.
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

function CancelModal({ isOpen, onClose, onConfirm, isCancelling }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, isCancelling: boolean }) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Batalkan Pesanan?"
            maxWidth="max-w-md"
        >
            <div className="space-y-4">
                <p className="text-muted-foreground">
                    Apakah kamu yakin ingin membatalkan pesanan ini? Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex justify-end gap-3 pt-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isCancelling}
                    >
                        Tidak, Jangan
                    </Button>
                    <Button
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={onConfirm}
                        disabled={isCancelling}
                    >
                        {isCancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Ya, Batalkan
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
