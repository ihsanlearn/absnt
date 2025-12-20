"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import { useRef } from "react"

const coffeeImages = [
  "/absnt/americano-nobg.png",
  "/absnt/butterscotch-nobg.png",
  "/absnt/dertymatcha-nobg.png",
  "/absnt/gulaaren-nobg.png",
  "/absnt/hazlenut-nobg.png",
  "/absnt/late-nobg.png",
  "/absnt/matcha-nobg.png",
  "/absnt/regal-nobg.png",
  "/absnt/sweetoreo-nobg.png",
  "/absnt/tiramisu-nobg.png",
]

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Clean, minimal animations
  const fadeUp = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  return (
    <section ref={containerRef} className="py-24 bg-foreground text-background relative overflow-hidden rounded-t-[3rem] md:rounded-t-[10rem]">
        
      <div className="container mx-auto px-6 mb-16 lg:mb-24 text-center">
        <motion.div
           initial="hidden"
           whileInView="show"
           viewport={{ once: true, margin: "-50px" }}
           variants={fadeUp}
           className="space-y-4 max-w-2xl mx-auto"
        >
            <h2 className="text-3xl lg:text-4xl font-light tracking-tight">
               <span className="font-bold text-accent block mb-2">FOKUS TANPA BATAS.</span>
               Rasa "Pejabat", Harga Mahasiswa. <br className="hidden lg:block"/>Tanpa Basa-basi.
            </h2>
            <p className="text-muted-foreground/80 text-lg">
                Singkirkan distraksi, nikmati esensi. Kopi enak gak harus bikin dompet teriak.
            </p>
        </motion.div>
      </div>

      {/* Elegant Infinite Marquee / Gallery */}
      <div className="relative w-full overflow-hidden py-10">
         {/* Gradient Masks */}
         <div className="absolute left-0 top-0 bottom-0 w-20 lg:w-40 z-10 bg-linear-to-r from-foreground to-transparent pointer-events-none" />
         <div className="absolute right-0 top-0 bottom-0 w-20 lg:w-40 z-10 bg-linear-to-l from-foreground to-transparent pointer-events-none" />

         <div className="flex gap-8 lg:gap-16 items-center animate-scroll whitespace-nowrap hover:[animation-play-state:paused] cursor-grab active:cursor-grabbing">
             {/* Duplicate array for seamless loop */}
             {[...coffeeImages, ...coffeeImages, ...coffeeImages].map((src, i) => (
                 <motion.div 
                    key={i}
                    className="relative w-48 h-64 lg:w-64 lg:h-80 shrink-0 group perspective-500"
                    whileHover={{ scale: 1.05, y: -10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                 >
                     <div className="absolute inset-0 bg-white/5 rounded-[30px] -z-10 group-hover:bg-white/10 transition-colors duration-500" />
                     
                     <div className="w-full h-full flex flex-col items-center justify-center p-6">
                        <Image 
                            src={src} 
                            alt={`Absnt Coffee ${i}`} 
                            width={200} 
                            height={250} 
                            className="object-contain drop-shadow-xl group-hover:drop-shadow-2xl group-hover:scale-110 transition-all duration-500"
                        />
                        {/* Optional Minimal Label on Hover */}
                        <div className="absolute bottom-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                           <span className="text-xs font-bold tracking-widest uppercase text-accent">Discover</span>
                        </div>
                     </div>
                 </motion.div>
             ))}
         </div>
      </div>
      
    </section>
  )
}
