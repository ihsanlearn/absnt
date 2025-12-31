'use client'

import { signup } from '../auth/actions'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { TermsModal, PrivacyModal } from '@/components/modals/policies'
import { Eye, EyeOff } from 'lucide-react'

export default function SignupForm() {
  const [error, setError] = useState<string | null>(null)
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  async function handleSubmit(formData: FormData) {
    const res = await signup(formData)
    if (res?.error) {
      setError(res.error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
        <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
        <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />

        <div className="max-w-md w-full bg-background rounded-2xl shadow-xl p-8 border border-muted">
         <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-(family-name:--font-lobster) mb-2">Buat Akun</h1>
            <p className="text-muted-foreground">Gabung bareng kita dan mulai pesan kopi enak.</p>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
            <input 
              name="name" 
              type="text" 
              required 
              className="w-full px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
              placeholder="John Doe"
            />
          </div>

          <div>
             <label className="block text-sm font-medium mb-1">
               Nomor Telepon <span className="text-muted-foreground ml-1 font-normal">(Opsional)</span>
             </label>
             <input 
               name="phone" 
               type="tel" 
               className="w-full px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
               placeholder="08123456789"
             />
           </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              name="email" 
              type="email" 
              required 
              className="w-full px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Kata Sandi</label>
            <div className="relative">
              <input 
                name="password" 
                type={showPassword ? "text" : "password"} 
                required 
                className="w-full px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:outline-hidden pr-10"
                placeholder="••••••••"
                minLength={6}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="flex items-start gap-2 text-sm text-muted-foreground">
               <input 
                 name="terms" 
                 type="checkbox" 
                 required 
                 className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
               />
               <span>
                  Saya setuju dengan <button type="button" onClick={() => setShowTerms(true)} className="text-primary hover:underline font-medium">Syarat Ketentuan</button> dan <button type="button" onClick={() => setShowPrivacy(true)} className="text-primary hover:underline font-medium">Kebijakan Privasi</button>
               </span>
            </label>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded text-sm text-center">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full font-bold">
            Daftar
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Sudah punya akun? <Link href="/login" className="text-primary hover:underline font-bold">Masuk</Link>
        </div>

        <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                ← Kembali ke Beranda
            </Link>
        </div>
      </div>
    </div>
  )
}
