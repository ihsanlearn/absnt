'use client'

// ... (imports remain)
import { useCart } from "@/context/cart-context"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Trash, Minus, Plus, MapPin, CreditCard, Banknote, ArrowRight, Loader2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { createOrder } from "./actions"
import { useRouter } from "next/navigation"

import Modal from "@/components/ui/modal"
import AddressSelector from "@/components/checkout/address-selector"
import { getStoreStatusMessage } from "@/utils/time"

import { getStoreStatus } from "../settings-actions"

interface CheckoutFormProps {
  initialStoreStatus: boolean
}

export default function CheckoutForm({ initialStoreStatus }: CheckoutFormProps) {
  const { items, updateQuantity, removeItem, totalPrice, clearCart } = useCart()
  const [address, setAddress] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"qris" | "cod">("qris")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  
  // Use the initial status from server immediately
  const [storeOpen, setStoreOpen] = useState(initialStoreStatus)

  const router = useRouter()

  useEffect(() => {
    const checkStatus = async () => {
        const isOpen = await getStoreStatus()
        setStoreOpen(isOpen)
    }
    
    // We already have initial status, so we just set up polling
    // But we might want to check once on mount just in case of hydration mismatch? 
    // No, prop is reliable. Just polling is fine.
    
    // Update every minute to ensure status is fresh
    const interval = setInterval(() => {
        checkStatus()
    }, 60000)

    return () => clearInterval(interval)
  }, [])


  // Flat postage fee for now (PROMO: Free)
  const POSTAGE_FEE = 0
  const ORIGINAL_POSTAGE = 15000
  const GRAND_TOTAL = totalPrice + POSTAGE_FEE

  // Triggered by "Buat Pesanan" button
  function handlePlaceOrderClick() {
    if (!items.length) return
    if (!address.trim()) {
        setShowValidationModal(true)
        return
    }
    // Show confirmation first
    setShowConfirmationModal(true)
  }

  // Actual submission
  async function handleConfirmOrder() {
    setIsSubmitting(true)
    
    // Safety check again
    if (!storeOpen) {
        alert(getStoreStatusMessage())
        setIsSubmitting(false)
        setShowConfirmationModal(false)
        return
    }

    const formData = new FormData()
    formData.append("address", address)
    formData.append("paymentMethod", paymentMethod)
    formData.append("totalPrice", totalPrice.toString())
    formData.append("postage", POSTAGE_FEE.toString())
    formData.append("items", JSON.stringify(items))

    const res = await createOrder(formData)

    if (res?.success && res.orderId) {
        clearCart()
        router.push(`/order/${res.orderId}`)
    } else {
        alert(res?.error || "Gagal membuat pesanan")
        setIsSubmitting(false)
        setShowConfirmationModal(false)
    }
  }

  if (items.length === 0) {
    return (
        <div className="min-h-screen py-24 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-3xl font-bold font-(family-name:--font-lobster) mb-4">Keranjang Anda Kosong</h1>
            <p className="text-muted-foreground mb-8">Tidak ada kopi yang ditambahkan.</p>
            <Link href="/#menu">
                <Button className="rounded-full px-8">Lihat Menu</Button>
            </Link>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/10 py-12 px-4 lg:px-20">
      <div className="max-w-4xl mx-auto mb-8">
        <Link href="/#menu" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <ArrowRight className="mr-2 rotate-180" size={16} />
            Kembali ke Menu
        </Link>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Cart Items & Address */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Store Status Warning */}
            {!storeOpen && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-red-100 p-2 rounded-full text-red-600 shrink-0">
                        <Clock size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-red-900">Maaf, Kami Close Order</h3>
                        <p className="text-sm text-red-700 mt-1">
                            Saat ini kami sedang tidak menerima pesanan. Silahkan cek kembali nanti.
                        </p>
                    </div>
                </div>
            )}

            {/* 1. Review Items */}
            <div className="bg-background rounded-3xl p-6 shadow-sm border border-muted/50">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                    Review Pesanan Anda
                </h2>
                <div className="space-y-6">
                    {items.map((item) => (
                        <motion.div layout key={item.id} className="flex gap-4 p-4 bg-muted/20 rounded-2xl">
                            <div className="relative w-20 h-20 bg-white rounded-xl overflow-hidden shrink-0">
                                <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-foreground">{item.name}</h3>
                                    <p className="text-primary font-bold text-sm">Rp {item.price.toLocaleString()}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 bg-white rounded-lg p-1 border shadow-xs">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center hover:bg-muted rounded-md transition-colors disabled:opacity-50">
                                            <Minus size={14} />
                                        </button>
                                        <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center hover:bg-muted rounded-md transition-colors">
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 p-1">
                                        <Trash size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="text-right font-bold text-sm self-end">
                                Rp {(item.price * item.quantity).toLocaleString()}
                            </div>
                        </motion.div>
                    ))}
                </div>
                <div className="mt-6 pt-4 border-t border-dashed">
                    <Link href="/#menu">
                        <Button variant="outline" className="w-full border-dashed hover:bg-primary/5 hover:border-primary text-muted-foreground hover:text-primary transition-all">
                            <Plus size={16} className="mr-2" /> Tambah Kopi Lain
                        </Button>
                    </Link>
                </div>
            </div>

            {/* 2. Delivery Address */}
            <div className="bg-background rounded-3xl p-6 shadow-sm border border-muted/50">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                    Alamat Pengiriman
                </h2>
                
                <AddressSelector 
                    onSelect={(addr) => setAddress(addr)} 
                    initialAddress={address}
                />
            </div>
            
        </div>

        {/* RIGHT COLUMN: Payment & Summary */}
        <div className="space-y-6">
            
            {/* 3. Payment Method */}
            <div className="bg-background rounded-3xl p-6 shadow-sm border border-muted/50">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                    Metode Pembayaran
                </h2>
                <div className="space-y-3">
                    <label 
                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                            paymentMethod === "qris" 
                            ? "border-primary bg-primary/5 ring-1 ring-primary" 
                            : "border-muted hover:bg-muted/20"
                        }`}
                        onClick={() => setPaymentMethod("qris")}
                    >
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border shadow-xs">
                             <CreditCard size={20} className="text-primary" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm">QRIS</h4>
                            <p className="text-xs text-muted-foreground">Scan QR & Upload Bukti Pembayaran</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'qris' ? 'border-primary' : 'border-muted'}`}>
                             {paymentMethod === 'qris' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                        </div>
                    </label>

                    <label 
                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                            paymentMethod === "cod" 
                            ? "border-primary bg-primary/5 ring-1 ring-primary" 
                            : "border-muted hover:bg-muted/20"
                        }`}
                        onClick={() => setPaymentMethod("cod")}
                    >
                         <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border shadow-xs">
                             <Banknote size={20} className="text-green-600" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm">Cash on Delivery (COD)</h4>
                            <p className="text-xs text-muted-foreground">Bayar ketika kopi tiba</p>
                        </div>
                         <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-primary' : 'border-muted'}`}>
                             {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                        </div>
                    </label>
                </div>
            </div>

            {/* Order Summary (Sticky) */}
            <div className="bg-background rounded-3xl p-6 shadow-sm border border-muted/50 sticky top-6">
                <h3 className="font-bold text-lg mb-4">Ringkasan Pesanan</h3>
                <div className="space-y-3 text-sm border-b pb-4 mb-4 border-dashed">
                    <div className="flex justify-between text-muted-foreground">
                        <span>Total Item</span>
                        <span>Rp {totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground items-center">
                        <span>Biaya Pengiriman</span>
                        <div className="text-right flex flex-col">
                        <span className="text-red-400 line-through text-xs mr-2">Rp {ORIGINAL_POSTAGE.toLocaleString()}</span>
                        <span className="text-green-600 font-bold">Rp {POSTAGE_FEE.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-between items-end mb-6">
                    <span className="font-bold text-lg">Total</span>
                    <div className="text-right">
                        <span className="block text-2xl font-bold text-primary">Rp {GRAND_TOTAL.toLocaleString()}</span>
                    </div>
                </div>

                <Button 
                    size="lg" 
                    className="w-full font-bold text-lg h-14 rounded-xl shadow-lg shadow-primary/20" 
                    onClick={handlePlaceOrderClick}
                    disabled={isSubmitting || !storeOpen}
                >
                    {isSubmitting ? (
                        <>Processing... <Loader2 className="ml-2 animate-spin" /></>
                    ) : (
                        <>Buat Pesanan <ArrowRight className="ml-2" size={18} /></>
                    )}
                </Button>
                <p className="text-[10px] text-center text-muted-foreground mt-4">
                    Dengan menempatkan pesanan ini, Anda setuju untuk menunggu kopi yang luar biasa kami.
                </p>
            </div>

        </div>
      </div>

       {/* MISSING ADDRESS MODAL */}
       <Modal 
         isOpen={showValidationModal} 
         onClose={() => setShowValidationModal(false)}
         title="Alamat Pengiriman Belum Diisi"
         maxWidth="max-w-md"
       >
         <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-500 mb-4">
                <MapPin size={32} />
            </div>
            <p className="text-muted-foreground">
                Oops! Kamu belum memberikan alamat pengiriman. Silahkan masukkan alamat pengirimanmu untuk melanjutkan.
            </p>
            <Button className="w-full" onClick={() => setShowValidationModal(false)}>
                Ok, akan saya isi
            </Button>
         </div>
       </Modal>
       
       {/* CONFIRMATION MODAL */}
       <Modal
          isOpen={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          title="Konfirmasi Pesanan"
          maxWidth="max-w-md"
       >
           <div className="space-y-4">
               <p className="text-muted-foreground">
                   Apakah kamu yakin semua data sudah benar? Pesanan yang sudah dibuat tidak bisa dibatalkan secara instan.
               </p>
               <div className="bg-muted/30 p-4 rounded-xl space-y-2 text-sm">
                   <div className="flex justify-between">
                       <span className="text-muted-foreground">Total Pembayaran:</span>
                       <span className="font-bold">Rp {GRAND_TOTAL.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between">
                       <span className="text-muted-foreground">Metode:</span>
                       <span className="font-bold uppercase">{paymentMethod}</span>
                   </div>
               </div>
               
               <div className="flex justify-end gap-3 pt-4">
                   <Button variant="ghost" onClick={() => setShowConfirmationModal(false)} disabled={isSubmitting}>
                       Batal
                   </Button>
                   <Button onClick={handleConfirmOrder} disabled={isSubmitting} className="font-bold">
                       {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                       Ya, Pesan Sekarang
                   </Button>
               </div>
           </div>
       </Modal>
    </div>
  )
}
