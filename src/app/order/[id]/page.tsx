import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import OrderStatusLive from "@/components/order/order-status-live"

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: order } = await supabase
    .from('orders')
    .select(`
        *,
        payments (proof_url),
        order_items (
            *,
            coffee:coffee (name, image_url)
        )
    `)
    .eq('id', id)
    .single()

  // Cast to any to handle the new column not yet in types
  const orderWithReason = order as any

  if (!orderWithReason) return notFound()

  // Calculate total correctly
  const grandTotal = orderWithReason.total_price + orderWithReason.postage

  return (
    <div className="min-h-screen bg-muted/10 py-12 px-4 lg:px-20">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <Link href="/profile" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft size={16} className="mr-2" /> Kembali ke Pesanan
        </Link>
        
        {/* Header Status (Live) */}
        <div className="bg-background rounded-3xl p-8 border border-muted/50 text-center shadow-sm">
             <OrderStatusLive initialOrder={orderWithReason} />
        </div>

        {/* Rejection Notice */}
        {orderWithReason.order_status === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
                <div className="flex flex-col items-center gap-2">
                    <span className="bg-red-100 p-2 rounded-full text-red-600 font-bold">Pesanan Ditolak</span>
                </div>
                {orderWithReason.rejection_reason && (
                    <div className="bg-white/50 p-3 rounded-lg border border-red-100 text-sm">
                        <p className="font-bold text-red-900 mb-1">Alasan:</p>
                        <p className="text-red-800">{orderWithReason.rejection_reason}</p>
                    </div>
                )}
                <div className="text-sm text-muted-foreground pt-2">
                    <p>Jika kamu sudah melakukan pembayaran, mohon hubungi admin untuk pengembalian dana.</p>
                    <a 
                        href={`https://wa.me/628123456789?text=Halo admin, pesanan saya #${orderWithReason.id.slice(0,8)} ditolak. Saya ingin minta refund.`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-block mt-3 bg-green-600 text-white px-4 py-2 rounded-full font-bold hover:bg-green-700 transition-colors"
                    >
                        Hubungi via WhatsApp
                    </a>
                </div>
            </div>
        )}

        {/* Order Details */}
        <div className="bg-background rounded-3xl p-6 border border-muted/50 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Detail Pesanan</h3>
            <div className="space-y-4">
                {orderWithReason.order_items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                            <span className="font-medium">{item.coffee?.name || "Coffee"}</span>
                            <span className="text-muted-foreground">x{item.quantity}</span>
                        </div>
                        <span>Rp {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                ))}
                
                <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Biaya Pengiriman</span>
                        <span>Rp {orderWithReason.postage.toLocaleString()}</span>
                    </div>
                     <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-primary">Rp {grandTotal.toLocaleString()}</span>
                    </div>
                </div>
            </div>
            
            <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-muted-foreground">
                    Alamat Pengiriman: {orderWithReason.delivery_address}
                </p>
            </div>
        </div>

      </div>
    </div>
  )
}
