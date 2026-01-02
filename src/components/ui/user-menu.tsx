'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { User, LogOut, Settings, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { logout } from '@/app/auth/actions'
import { type User as SupabaseUser } from '@supabase/supabase-js'

interface UserMenuProps {
  user: SupabaseUser
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const menuRef = useRef<HTMLDivElement>(null)

  // Close invalid clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const firstName = user.user_metadata?.full_name?.split(' ')[0] || 'User'

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-white/80 backdrop-blur-md pl-3 pr-4 py-1.5 rounded-full border border-primary/10 shadow-sm hover:shadow-md transition-all group"
      >
         <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <User size={16} />
         </div>
         <span className="text-sm font-medium hidden sm:inline-block max-w-[100px] truncate">
            Halo, {firstName}
         </span>
         <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-muted py-2 z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-muted/50 bg-muted/20">
              <p className="text-sm font-bold text-foreground">{user.user_metadata?.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            
            <div className="p-2">
              <Link 
                href="/profile" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <Settings size={16} />
                Pengaturan Profil
              </Link>
              
              <button 
                disabled={isPending}
                onClick={() => {
                  startTransition(async () => {
                    await logout()
                  })
                }}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-sm cursor-pointer rounded-xl hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                    <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                    <LogOut size={16} />
                )}
                {isPending ? 'Keluar...' : 'Keluar'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
