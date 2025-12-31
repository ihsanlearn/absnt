'use client'

import { motion } from 'framer-motion'

export default function CoffeeLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative w-24 h-24">
        {/* Steam 1 */}
        <motion.div
          className="absolute -top-6 left-1/4 w-2 h-6 bg-white/50 rounded-full blur-sm"
          animate={{
            y: [-5, -20, -5],
            opacity: [0, 0.8, 0],
            scaleY: [1, 1.5, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0
          }}
        />
        {/* Steam 2 */}
        <motion.div
          className="absolute -top-8 left-1/2 w-2 h-8 bg-white/50 rounded-full blur-sm"
          animate={{
            y: [-5, -25, -5],
            opacity: [0, 0.8, 0],
            scaleY: [1, 1.5, 1]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
        {/* Steam 3 */}
        <motion.div
          className="absolute -top-6 right-1/4 w-2 h-6 bg-white/50 rounded-full blur-sm"
          animate={{
            y: [-5, -20, -5],
            opacity: [0, 0.8, 0],
            scaleY: [1, 1.5, 1]
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2
          }}
        />

        {/* Cup Handle */}
        <div className="absolute top-4 -right-3 w-8 h-10 border-4 border-primary rounded-r-xl" />

        {/* Cup Body */}
        <motion.div 
          className="relative w-full h-full bg-primary rounded-b-3xl rounded-t-sm z-10 overflow-hidden border-4 border-primary-foreground/10"
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, -2, 2, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
             {/* Coffee Liquid */}
             <motion.div 
                className="absolute bottom-0 w-full bg-[#4B3621]"
                initial={{ height: "0%" }}
                animate={{ height: ["0%", "80%", "70%"] }}
                transition={{ duration: 3, ease: "easeInOut", times: [0, 0.8, 1], repeat: Infinity, repeatDelay: 1 }}
             />
             
             {/* Eyes */}
             <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-4 z-20">
                <motion.div 
                    className="w-2 h-2 bg-white rounded-full"
                    animate={{ scaleY: [1, 0.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                />
                <motion.div 
                     className="w-2 h-2 bg-white rounded-full"
                     animate={{ scaleY: [1, 0.1, 1] }}
                     transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                />
             </div>
             
             {/* Smile */}
             <div className="absolute top-12 left-1/2 -translate-x-1/2 w-4 h-2 border-b-2 border-white/80 rounded-full z-20" />
        </motion.div>
        
        {/* Saucer */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-28 h-2 bg-muted rounded-full z-0" />
      </div>
      
      <p className="text-muted-foreground font-medium animate-pulse text-sm">Brewing...</p>
    </div>
  )
}
