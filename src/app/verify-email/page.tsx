import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
      <div className="max-w-md w-full bg-background rounded-2xl shadow-xl p-8 border border-muted text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        
        <h1 className="text-2xl font-bold font-(family-name:--font-lobster) mb-4">Cek Email Kamu</h1>
        
        <p className="text-muted-foreground mb-8">
          Registrasi Berhasil! Kami telah mengirimkan link verifikasi ke alamat email kamu. Silahkan klik link untuk mengaktifkan akunmu.
        </p>

        <div className="space-y-4">
            <Button asChild className="w-full font-bold">
            <Link href="/login">
                Login
            </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
            <Link href="/">
                Kembali ke Beranda
            </Link>
            </Button>
        </div>
      </div>
    </div>
  )
}
