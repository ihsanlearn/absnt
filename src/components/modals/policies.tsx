'use client'

import Modal from '@/components/ui/modal'

interface PolicyModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TermsModal({ isOpen, onClose }: PolicyModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Syarat dan Ketentuan">
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
        <p>Terakhir diperbarui: Desember 2025</p>
        
        <h3 className="text-foreground font-bold text-lg">1. Penerimaan Syarat</h3>
        <p>Dengan mengakses dan menggunakan layanan Absnt Coffee, kamu setuju untuk terikat oleh Syarat dan Ketentuan ini.</p>

        <h3 className="text-foreground font-bold text-lg">2. Deskripsi Layanan</h3>
        <p>Absnt Coffee menyediakan layanan pemesanan dan pengiriman kopi. Kami berhak mengubah atau menghentikan layanan kapan saja.</p>

        <h3 className="text-foreground font-bold text-lg">3. Akun Pengguna</h3>
        <p>Kamu bertanggung jawab menjaga kerahasiaan kredensial akunmu. Kamu setuju untuk memberikan informasi yang akurat dan lengkap saat membuat akun.</p>

        <h3 className="text-foreground font-bold text-lg">4. Pemesanan dan Pembayaran</h3>
        <p>Semua pesanan tergantung ketersediaan. Harga dapat berubah sewaktu-waktu. Pembayaran harus dilakukan melalui metode yang diterima.</p>

        <h3 className="text-foreground font-bold text-lg">5. Batasan Tanggung Jawab</h3>
        <p>Absnt Coffee tidak bertanggung jawab atas kerugian tidak langsung, insidental, khusus, konsekuensial, atau punitif.</p>
      </div>
    </Modal>
  )
}

export function PrivacyModal({ isOpen, onClose }: PolicyModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Kebijakan Privasi">
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
        <p>Terakhir diperbarui: Desember 2025</p>
        
        <h3 className="text-foreground font-bold text-lg">1. Informasi yang Kami Kumpulkan</h3>
        <p>Kami mengumpulkan informasi yang kamu berikan langsung kepada kami, seperti nama, alamat email, nomor telepon, dan informasi pembayaran.</p>

        <h3 className="text-foreground font-bold text-lg">2. Cara Kami Menggunakan Informasimu</h3>
        <p>Kami menggunakan informasimu untuk memproses pesanan, berkomunikasi denganmu, dan meningkatkan layanan kami.</p>

        <h3 className="text-foreground font-bold text-lg">3. Berbagi Informasi</h3>
        <p>Kami tidak menjual informasi pribadimu. Kami dapat membagikan informasi dengan penyedia layanan yang membantu operasional kami (contoh: pemroses pembayaran, mitra pengiriman).</p>

        <h3 className="text-foreground font-bold text-lg">4. Keamanan Data</h3>
        <p>Kami menerapkan langkah keamanan yang wajar untuk melindungi informasi pribadimu.</p>

        <h3 className="text-foreground font-bold text-lg">5. Hak-Hakmu</h3>
        <p>Kamu dapat memperbarui informasi akunmu kapan saja. Kamu juga dapat menghubungi kami untuk meminta penghapusan datamu.</p>
      </div>
    </Modal>
  )
}
