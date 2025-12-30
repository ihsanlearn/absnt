import Hero from "@/components/sections/Hero"
import About from "@/components/sections/About"
import { getCoffees } from "@/app/profile/coffee-actions"
import Menu, { Product } from "@/components/sections/Menu"
import Why from "@/components/sections/Why"
import LocationFooter from "@/components/sections/LocationFooter"
import { createClient } from "@/lib/supabase/server"

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const rawCoffees = await getCoffees()
  
  // Transform data
  const products: Product[] = Array.isArray(rawCoffees) ? rawCoffees.map(coffee => ({
    id: coffee.id,
    name: coffee.name,
    price: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(coffee.price),
    desc: coffee.description || "",
    tag: coffee.tag,
    image: coffee.image_url || "/absnt/americano-nobg.png", 
    category: coffee.category || 'coffee'
  })) : []

  return (
    <main className="min-h-screen bg-background font-sans selection:bg-primary/30 selection:text-primary-foreground w-full lg:w-3/4 mx-auto relative">
      <div className="grain-overlay" />
      
      <Hero user={user} />
      <About />
      <Menu products={products} user={user} />
      <Why />
      <LocationFooter />
    </main>
  );
}
