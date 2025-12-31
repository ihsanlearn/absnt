
"use client"

import { motion } from "framer-motion"
import { BatteryCharging, Coffee, DollarSign, Heart } from "lucide-react"

const features = [
  {
    icon: Coffee,
    title: "Ga Ada Obat",
    desc: "Bukan kopi sachet-an. Rasanya bikin kamu lupa sama masalah hidup bentar.",
  },
  {
    icon: DollarSign,
    title: "Harga Mahasiswa",
    desc: "Mulai dari 12rb, kamu udah bisa dapet kopi enak. Dompet aman, caffeine fix dapet.",
  },
  {
    icon: BatteryCharging,
    title: "Mood Booster",
    desc: "Cocok buat temen nugas atau sekadar ngisi tenaga sebelum lanjut aktivitas.",
  },
  {
    icon: Heart,
    title: "Cocok untuk Sehari-hari",
    desc: "Minuman yang enak dinikmati kapan saja, tanpa mikir harga.",
  },
]

export default function Why() {
  return (
    <section className="py-24 px-6 lg:px-20 bg-background relative overflow-hidden border-t border-border">
      <div className="absolute top-0 left-0 w-full h-full bg-muted/50 mask-[linear-gradient(0deg,var(--color-background),rgba(255,255,255,0.6))] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground">Kenapa Absnt?</h2>
          <p className="text-muted-foreground">Alasan kenapa kamu wajib mampir ke lapak kami.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="p-8 rounded-3xl bg-muted border border-border hover:border-secondary hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-card flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300 text-primary">
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
