import Hero from "@/components/sections/Hero"
import About from "@/components/sections/About"
import Menu from "@/components/sections/Menu"
import Why from "@/components/sections/Why"
import LocationFooter from "@/components/sections/LocationFooter"

export default function Home() {
  return (
    <main className="min-h-screen bg-background font-sans selection:bg-primary/30 selection:text-primary-foreground w-full lg:w-3/4 mx-auto relative">
      <div className="grain-overlay" />
      
      <Hero />
      <About />
      <Menu />
      <Why />
      <LocationFooter />
    </main>
  );
}
