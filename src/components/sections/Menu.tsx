"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Plus } from "lucide-react"
import Image from "next/image"

type Product = {
  id: string
  name: string
  price: string
  desc: string
  tag: string | null
  image: string
  category: "coffee" | "non-coffee"
}

const products: Product[] = [
  // COFFEE
  {
    id: "c1",
    name: "Americano",
    price: "10K",
    desc: "Espresso murni dengan tambahan air. Pahit nikmat bikin melek.",
    tag: null,
    image: "/absnt/americano-nobg.png",
    category: "coffee"
  },
  {
    id: "c2",
    name: "Kopi Gula Aren",
    price: "12K",
    desc: "Signature Absnt. Manis legit gula aren asli, bukan kaleng-kaleng.",
    tag: "Best Seller",
    image: "/absnt/gulaaren-nobg.png",
    category: "coffee"
  },
  {
    id: "c3",
    name: "Butterscotch Latte",
    price: "12K",
    desc: "Rasa buttery toffee yang unik. Creamy dan nagih banget.",
    tag: "Must Try",
    image: "/absnt/butterscotch-nobg.png",
    category: "coffee"
  },
  {
    id: "c4",
    name: "Hazelnut Latte",
    price: "12K",
    desc: "Aroma kacang hazelnut yang wangi berpadu sama kopi susu.",
    tag: null,
    image: "/absnt/hazlenut-nobg.png",
    category: "coffee"
  },
  {
    id: "c5",
    name: "Latte",
    price: "12K",
    desc: "Keseimbangan pas antara espresso dan susu steamed.",
    tag: null,
    image: "/absnt/late-nobg.png",
    category: "coffee"
  },
  {
    id: "c6",
    name: "Tiramisu",
    price: "12K",
    desc: "Sensasi dessert tiramisu dalam seglas kopi. Mewah.",
    tag: null,
    image: "/absnt/tiramisu-nobg.png",
    category: "coffee"
  },
  {
    id: "c7",
    name: "Regal",
    price: "14K",
    desc: "Kopi susu creamy dengan remah biskuit Regal yang nostalgic.",
    tag: "Favorite",
    image: "/absnt/regal-nobg.png",
    category: "coffee"
  },
  {
    id: "c8",
    name: "Derty Matcha",
    price: "15K",
    desc: "Matcha premium ditabrak espresso. Unik, strong, dan creamy.",
    tag: "New",
    image: "/absnt/dertymatcha-nobg.png",
    category: "coffee"
  },

  // NON-COFFEE
  {
    id: "nc1",
    name: "Matcha",
    price: "15K",
    desc: "Full matcha premium tanpa kopi. Smooth dan calming.",
    tag: "Best Seller",
    image: "/absnt/matcha-nobg.png",
    category: "non-coffee"
  },
  {
    id: "nc2",
    name: "Sweet Oreo",
    price: "15K",
    desc: "Susu creamy shake dengan oreo crumbs melimpah.",
    tag: "Kids Fav",
    image: "/absnt/sweetoreo-nobg.png",
    category: "non-coffee"
  }
]

export default function Menu() {
  const [activeTab, setActiveTab] = useState<"coffee" | "non-coffee">("coffee")

  const filteredProducts = products.filter(product => product.category === activeTab)

  return (
    <section id="menu" className="py-16 lg:py-24 px-4 lg:px-20 bg-muted/30 relative overflow-hidden">
       {/* Background accent */}
       <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />

      <div className="mb-12 text-center space-y-4">
        <h2 className="text-3xl lg:text-6xl font-(family-name:--font-lobster) text-foreground">
            Untuk <span className="text-primary">Setiap Jeda.</span>
        </h2>
        <p className="text-muted-foreground text-base lg:text-lg max-w-xl mx-auto">
            Dirancang untuk nemenin belajar, ngobrol, dan istirahat sebentar.
        </p>

        {/* Custom Tabs */}
        <div className="flex justify-center gap-4 mt-8">
            <button
                onClick={() => setActiveTab("coffee")}
                className={`px-8 py-3 rounded-full font-bold transition-all duration-300 ${
                    activeTab === "coffee" 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105" 
                    : "bg-background border hover:bg-muted text-muted-foreground"
                }`}
            >
                Coffee Series
            </button>
            <button
                onClick={() => setActiveTab("non-coffee")}
                className={`px-8 py-3 rounded-full font-bold transition-all duration-300 ${
                    activeTab === "non-coffee" 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105" 
                    : "bg-background border hover:bg-muted text-muted-foreground"
                }`}
            >
                Non-Coffee
            </button>
        </div>
      </div>

      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-14"
      >
        <AnimatePresence mode="popLayout">
            {filteredProducts.map((item) => (
            <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="group"
            >
                <Card className="h-full border-none shadow-sm bg-background hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-3xl overflow-visible relative pt-16 mt-6">
                    {/* Floating Image */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-48 z-10 drop-shadow-2xl group-hover:scale-110 transition-transform duration-500">
                         <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                         />
                    </div>

                    {item.tag && (
                         <Badge className="absolute top-4 right-4 z-20 bg-yellow-400 text-yellow-950 hover:bg-yellow-500 font-bold border-none shadow-sm">
                            {item.tag}
                        </Badge>
                    )}

                    <CardHeader className="pt-24 pb-2 text-center">
                        <h3 className="text-xl font-bold text-foreground leading-tight">{item.name}</h3>
                        <p className="text-lg font-bold text-primary">{item.price}</p>
                    </CardHeader>

                    <CardContent className="text-center px-6">
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {item.desc}
                        </p>
                    </CardContent>

                    {/* <CardFooter className="pb-6 px-6">
                        <Button className="w-full rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground text-foreground transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20">
                            Pesan <Plus className="ml-2 w-4 h-4" />
                        </Button>
                    </CardFooter> */}
                </Card>
            </motion.div>
            ))}
        </AnimatePresence>
      </motion.div>
    </section>
  )
}
