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

  if (!order) return notFound()

  // Calculate total correctly
  const grandTotal = order.total_price + order.postage

  return (
    <div className="min-h-screen bg-muted/10 py-12 px-4 lg:px-20">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <Link href="/profile" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft size={16} className="mr-2" /> Back to My Orders
        </Link>
        
        {/* Header Status (Live) */}
        <div className="bg-background rounded-3xl p-8 border border-muted/50 text-center shadow-sm">
             <OrderStatusLive initialOrder={order} />
        </div>

        {/* Order Details */}
        <div className="bg-background rounded-3xl p-6 border border-muted/50 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Order Details</h3>
            <div className="space-y-4">
                {order.order_items.map((item: any) => (
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
                        <span>Postage</span>
                        <span>Rp {order.postage.toLocaleString()}</span>
                    </div>
                     <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-primary">Rp {grandTotal.toLocaleString()}</span>
                    </div>
                </div>
            </div>
            
            <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-muted-foreground">
                    Address: {order.delivery_address}
                </p>
            </div>
        </div>

      </div>
    </div>
  )
}
