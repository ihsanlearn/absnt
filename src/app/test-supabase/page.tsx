'use client'

import { createClient } from "@/lib/supabase/client"
import { getCoffees } from "@/app/profile/coffee-actions"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

export default function SupabaseTestPage() {
  const [status, setStatus] = useState<"loading" | "connected" | "error">("loading")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [coffees, setCoffees] = useState<any[]>([])
  
  useEffect(() => {
    const init = async () => {
      try {
        const supabase = createClient()
        // Check basic connection
        const { error } = await supabase.from('coffee').select('count', { count: 'exact', head: true })
        if (error) throw error
        
        setStatus("connected")

        // Fetch Coffee Data via Server Action
        const data = await getCoffees()
        // The return type of getCoffees might need handling if it returns { error } or []
        // getCoffees returns 'data' which is Coffee[] | [] based on previous read.
        // Actually, looking at getCoffees:
        // if error -> return [] (printed to console) or returns { error } if upsert?
        // getCoffees: returns data (array) or [].
        // Wait, let's double check getCoffees signature from Step 63.
        // It returns data. If error, returns [].
        // So it always returns an array (maybe null if data is null?). 
        // supabase .select('*') returns { data, error }. 
        // The function returns `data`. `data` can be null.
        
        if (Array.isArray(data)) {
            setCoffees(data)
        } else {
            console.error("Unexpected data format", data)
        }

      } catch (err: any) {
        setStatus("error")
        setErrorMsg(err.message || "Unknown error")
      }
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setStatus("error") 
      setErrorMsg("Missing environment variables. Please check .env.local")
      return
    }

    init()
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="border-b border-zinc-800 pb-6">
            <h1 className="text-3xl font-bold mb-2">Supabase Connection Test</h1>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-zinc-400">Status:</span>
                    <span className={`px-2 py-1 rounded text-sm font-medium flex items-center gap-2 ${
                    status === 'loading' ? 'bg-yellow-500/10 text-yellow-500' :
                    status === 'connected' ? 'bg-green-500/10 text-green-500' :
                    'bg-red-500/10 text-red-500'
                    }`}>
                    {status === 'loading' && <Loader2 className="w-3 h-3 animate-spin"/>}
                    {status.toUpperCase()}
                    </span>
                </div>
            </div>
        </div>

        {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              Error: {errorMsg}
            </div>
        )}

        {/* Coffee Grid */}
        {status === 'connected' && (
            <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    Coffee Items 
                    <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-xs text-zinc-400">{coffees.length}</span>
                </h2>
                
                {coffees.length === 0 ? (
                    <p className="text-zinc-500 italic">No coffee items found. Try adding some via the Profile page.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {coffees.map((coffee) => (
                            <div key={coffee.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors">
                                <div className="aspect-video bg-zinc-800 relative">
                                    {coffee.image_url ? (
                                        <img 
                                            src={coffee.image_url} 
                                            alt={coffee.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                            No Image
                                        </div>
                                    )}
                                        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                                            {!coffee.is_available && (
                                                <span className="px-2 py-1 bg-black/70 text-white text-xs rounded-md backdrop-blur-sm">
                                                    Out of Stock
                                                </span>
                                            )}
                                            {coffee.category && (
                                                <span className="px-2 py-1 bg-primary/80 text-white text-xs rounded-md backdrop-blur-sm shadow-sm">
                                                    {coffee.category}
                                                </span>
                                            )}
                                        </div>
                                </div>
                                <div className="p-4 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold truncate pr-2">{coffee.name}</h3>
                                            {coffee.tag && (
                                                <span className="inline-block px-1.5 py-0.5 rounded-md bg-yellow-500/20 text-yellow-600 text-[10px] font-bold uppercase tracking-wider mt-1">
                                                    {coffee.tag}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-green-400 font-mono text-sm whitespace-nowrap">Rp {coffee.price.toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm text-zinc-400 line-clamp-2 min-h-[2.5em]">
                                        {coffee.description}
                                    </p>
                                    <div className="pt-2 text-xs text-zinc-600 font-mono">
                                        ID: {coffee.id.slice(0, 8)}...
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  )
}
