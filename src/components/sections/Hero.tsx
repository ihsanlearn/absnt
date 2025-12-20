"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight, MapPin, Coffee, Droplets } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col lg:flex-row items-center justify-center p-4 lg:p-20 relative overflow-hidden bg-background">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-full h-1/2 lg:w-3/5 lg:h-full bg-secondary/15 rounded-bl-[150px] -z-10" />
      <div className="absolute top-20 left-10 w-24 h-24 bg-primary/5 rounded-full blur-2xl -z-10" />
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-accent/5 rounded-full blur-3xl -z-10" />

      {/* Logic for floating beans or water droplets */}
      {[...Array(5)].map((_, i) => (
         <motion.div
            key={i}
            initial={{ y: 0, opacity: 0.3 }}
            animate={{ y: -20, opacity: 0.6 }}
            transition={{
                duration: 2 + i,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: i * 0.5
            }}
            className="absolute z-0 pointer-events-none text-primary/20"
            style={{
                top: `${20 + (i * 15)}%`,
                left: `${10 + (i * 20)}%`,
            }}
         >
            {i % 2 === 0 ? <Coffee size={24 + (i * 4)} /> : <Droplets size={20 + (i * 4)} />}
         </motion.div>
      ))}

      {/* Text Content */}
      <div className="w-full lg:w-1/2 space-y-6 lg:space-y-8 z-10 pt-24 lg:pt-0 text-center lg:text-left">
        <motion.div
           initial={{ opacity: 0, x: -50 }}
           whileInView={{ opacity: 1, x: 0 }}
           animate={{ opacity: 1, x: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8 }}
        >
          <div className="flex h-16 items-center justify-center lg:justify-start gap-2 mb-3">
            <Image 
              src="/logo.jpg" 
              alt="Absnt Coffee Logo" 
              width={60} 
              height={60} 
              className="rounded-full shadow-md object-cover ring-2 ring-primary/20"
            />
            <span className="py-1 px-4 rounded-full bg-primary/10 text-primary text-md font-bold tracking-wide border border-primary/20">
              EST. 2024 • Coffee
            </span>
          </div>
          <h1 className="text-5xl lg:text-8xl font-(family-name:--font-lobster) text-foreground leading-[1] drop-shadow-sm">
            Ngopi Enak,<br />
            <span className="text-primary relative">
              Ga Ribet.
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-secondary -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" opacity="0.3" />
              </svg>
            </span><br />
            Ga Mahal.
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-base lg:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed font-light"
        >
          &quot;Hidup itu pahit? Kopiin aja dulu.&quot; <br/>
          Secangkir jeda di tengah hari yang ramai. Rasa luar biasa, harga tetap bersahabat.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4"
        >
          <Button size="lg" className="rounded-full text-lg px-8 h-14 shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-1">
            Lihat Menu <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Link href="#location" className="rounded-full flex items-center justify-center text-lg px-8 h-14 border hover:bg-background/80 hover:text-primary transition-colors">
            Belii <MapPin className="ml-2 w-5 h-5" />
          </Link>
        </motion.div>
      </div>

      {/* Visual Content */}
      <div className="w-full lg:w-1/2 mt-16 lg:mt-0 flex justify-center items-center relative perspective-1000">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 50, duration: 1.2 }}
          className="relative w-full max-w-[350px] h-[450px] lg:w-[500px] lg:h-[600px] flex items-center justify-center"
        >
           {/* Dynamic Blobs */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-linear-to-tr from-secondary/30 to-primary/20 rounded-full blur-[80px] animate-pulse" />
           
           {/* Images Composition */}
           <div className="relative w-full h-full flex justify-center items-center">
              {/* Main Cup */}
              <motion.div 
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-30"
              >
                 <Image 
                    src="/absnt/late-nobg.png"
                    alt="Absnt Late"
                    width={380}
                    height={500}
                    className="object-contain drop-shadow-2xl"
                    priority
                  />
                  {/* Steam effect placeholder */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 opacity-0 lg:opacity-100">
                     <div className="w-4 h-20 bg-white/20 blur-xl rounded-full absolute bottom-0 left-4 animate-[wiggle_2s_ease-in-out_infinite]" />
                     <div className="w-4 h-24 bg-white/10 blur-xl rounded-full absolute bottom-0 right-4 animate-[wiggle_3s_ease-in-out_infinite_0.5s]" />
                  </div>
              </motion.div>
              
              {/* Secondary Cup */}
              <motion.div 
                animate={{ y: [10, -10, 10], rotate: [5, 10, 5] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -right-4 bottom-10 z-20 opacity-90 blur-[0.5px]"
              >
                  <Image 
                      src="/absnt/matcha-nobg.png"
                      alt="Absnt Matcha"
                      width={300}
                      height={400}
                      className="object-contain drop-shadow-xl"
                  />
              </motion.div>

              {/* Decorative Sticker/Badge */}
              <motion.div
                initial={{ rotate: -15, scale: 0 }}
                animate={{ rotate: -15, scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
                className="absolute -top-7 -right-1 md:-top-6 md:-right-6 z-40 bg-yellow-400 text-black font-black p-3 mdp-4 rounded-full w-24 h-24 flex items-center justify-center text-center md:text-xs shadow-lg rotate-12"
              >
                 BEST SELLER
              </motion.div>
           </div>
        </motion.div>
      </div>
    </section>
  )
}
