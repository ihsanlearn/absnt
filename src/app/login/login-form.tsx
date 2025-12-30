'use client'

import { login } from '../auth/actions'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  
  async function handleSubmit(formData: FormData) {
    const res = await login(formData)
    if (res?.error) {
      setError(res.error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
      <div className="max-w-md w-full bg-background rounded-2xl shadow-xl p-8 border border-muted">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-(family-name:--font-lobster) mb-2">Selamat Datang Kembali</h1>
            <p className="text-muted-foreground">Masuk ke akunmu untuk memesan.</p>
        </div>

        <form action={handleSubmit} className="space-y-4">
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
            <input 
              name="password" 
              type="password" 
              required 
              className="w-full px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded text-sm text-center">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full font-bold">
            Masuk
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Belum punya akun? <Link href="/signup" className="text-primary hover:underline font-bold">Daftar</Link>
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
