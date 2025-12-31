'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

export function PaymentProofImage({ path }: { path: string }) {
    const supabase = createClient()
    const [imageUrl, setImageUrl] = useState<string | null>(null)

    useEffect(() => {
        if (!path) return
        
        async function fetchUrl() {
            const { data } = await supabase.storage.from('payment-proofs').createSignedUrl(path, 3600)
            if (data?.signedUrl) {
                setImageUrl(data.signedUrl)
            }
        }
        fetchUrl()
    }, [path, supabase]) 
    
    if (!imageUrl) return <div className="h-48 w-full bg-muted animate-pulse rounded-lg flex items-center justify-center text-xs text-muted-foreground">Loading proof...</div>

    return (
        <div className="relative group">
            <img 
                src={imageUrl} 
                alt="Payment Proof" 
                className="w-full max-h-[400px] object-contain bg-black/5 rounded-lg"
            />
            <a 
                href={imageUrl} 
                target="_blank" 
                rel="noreferrer"
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white font-medium rounded-lg"
                onClick={(e) => e.stopPropagation()}
            >
                View Original
            </a>
        </div>
    )
}
