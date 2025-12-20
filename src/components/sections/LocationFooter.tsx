
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Instagram, MapPin } from "lucide-react"

function TikTok({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  )
}

export default function LocationFooter() {
  return (
    <footer id="location" className="bg-foreground text-card pt-16 lg:pt-24 pb-8 lg:pb-12 px-4 lg:px-20 rounded-t-[30px] lg:rounded-t-[50px] relative z-10">
      <div className="flex flex-col lg:flex-row justify-between gap-12 mb-20">
        <div className="space-y-6 max-w-md">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-background mb-2">Mampir Sini,</h2>
            <h2 className="text-3xl lg:text-4xl font-bold text-muted-foreground">Kita Ngopi Bareng.</h2>
          </motion.div>
          
          <p className="text-muted-foreground text-base lg:text-lg leading-relaxed">
            Kita buka di pinggir jalan, suasananya santai, angin sepoi-sepoi. 
            Nggak perlu fafifu, yang penting bawa cerita seru.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button asChild size="lg" className="rounded-full border-border bg-background text-[#E1306C] hover:bg-linear-to-r hover:from-[#833ab4] hover:via-[#fd1d1d] hover:to-[#fcb045] hover:text-white hover:border-transparent transition-all duration-300">
                <Link href="https://www.instagram.com/absntcoffe/" target="_blank">
                    <Instagram className="mr-2 w-5 h-5" /> Instagram
                </Link>
            </Button>
            {/* button link for tiktok */}
            <Button asChild size="lg" className="rounded-full border-border bg-background text-foreground hover:bg-black hover:text-white hover:shadow-[2px_2px_0px_rgba(37,244,238,1),-2px_-2px_0px_rgba(254,44,85,1)] hover:border-transparent transition-all duration-300">
                <Link href="https://www.tiktok.com/@absent.coffe" target="_blank">
                    <TikTok className="mr-2 w-5 h-5" /> Tiktok
                </Link>
            </Button>
          </div>
        </div>

        <div className="w-full lg:w-1/2 h-[300px] bg-muted rounded-3xl overflow-hidden relative">
            {/* Placeholder for Map */}
            <div className="absolute inset-0 flex items-center justify-center bg-card">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m10!1m8!1m3!1d247.49395360350002!2d110.60101541420825!3d-7.9663765502947586!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sid!4v1766243223515!5m2!1sen!2sid" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full"
              />
            </div>
             <div className="absolute bottom-2 left-2 right-2 bg-foreground/90 backdrop-blur-sm p-4 rounded-xl border border-border">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-bold text-background text-sm">Absnt Coffee</p>
                        <p className="text-muted-foreground text-xs">Jl. Brig Katamso NO.11, Madusari, Wonosari (Depan Bank BPD Wonosari)</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Absnt Coffee. All rights reserved.</p>
        <div className="flex gap-6">
            <a href="#" className="hover:text-background transition-colors">Privacy</a>
            <a href="#" className="hover:text-background transition-colors">Terms</a>
            <a href="#" className="hover:text-background transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  )
}
