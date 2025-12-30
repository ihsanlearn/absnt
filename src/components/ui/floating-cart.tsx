'use client'

import { useCart } from "@/context/cart-context"
import { ShoppingBag } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export default function FloatingCart() {
  const { totalItems, totalPrice } = useCart()
  const pathname = usePathname()

  if (totalItems === 0 || pathname !== '/') return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Link href="/checkout">
            <div className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 rounded-full px-6 py-4 flex items-center gap-4 transition-all cursor-pointer group hover:scale-105 active:scale-95">
                <div className="relative">
                    <ShoppingBag strokeWidth={2.5} />
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-primary">
                        {totalItems}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-medium opacity-90">Total Payment</span>
                    <span className="font-bold text-sm">Rp {totalPrice.toLocaleString()}</span>
                </div>
                <div className="bg-white/20 p-1.5 rounded-full rotate-180 group-hover:translate-x-1 transition-transform">
                   <svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-180"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                </div>
            </div>
        </Link>
      </motion.div>
    </AnimatePresence>
  )
}
