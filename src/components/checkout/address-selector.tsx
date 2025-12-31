'use client'

import { useState, useEffect } from 'react'
import { MapPin, Plus, ChevronRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getAddresses, addAddress } from '@/app/profile/actions'
import Modal from '@/components/ui/modal'
import { Loader2 } from 'lucide-react'

interface Address {
    id: string
    label: string | null
    recipient_name: string
    phone: string
    address_details: string
    is_default: boolean
}

interface AddressSelectorProps {
    onSelect: (addressString: string) => void
    initialAddress?: string
}

export default function AddressSelector({ onSelect, initialAddress }: AddressSelectorProps) {
    const [addresses, setAddresses] = useState<Address[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isAdding, setIsAdding] = useState(false)

    async function loadAddresses() {
        try {
            const data = await getAddresses()
            const cleanData = data?.map(addr => ({ ...addr, is_default: !!addr.is_default })) || []
            setAddresses(cleanData)
            
            // Auto Select Logic
            if (cleanData.length > 0 && !selectedId && !initialAddress) {
                const defaultAddr = cleanData.find(a => a.is_default) || cleanData[0]
                handleSelect(defaultAddr)
            }
        } catch (error) {
            console.error("Failed to load addresses")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadAddresses()
    }, [])

    function handleSelect(addr: Address) {
        setSelectedId(addr.id)
        const fullString = `${addr.label ? `[${addr.label}] ` : ''}${addr.recipient_name} (${addr.phone}) - ${addr.address_details}`
        onSelect(fullString)
        setIsOpen(false)
    }

    async function handleAddAddress(formData: FormData) {
        setIsAdding(true)
        await addAddress(formData)
        await loadAddresses()
        setIsAdding(false)
        setIsAddModalOpen(false)
        setIsOpen(true) // Re-open selector to let user pick the new one
    }

    // Validation State
    const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})

    function validateAndSubmit(formData: FormData) {
        const errors: {[key: string]: string} = {}
        const phone = formData.get('phone') as string
        const recipient = formData.get('recipient_name') as string
        const details = formData.get('address_details') as string

        // Strict Validation
        if (!recipient || recipient.length < 3) {
            errors.recipient = "Name must be at least 3 characters"
        }
        
        // Mobile phone validation (Indonesia context mostly)
        // Must start with 0 or 62, min 10 digits, numeric only
        const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/
        if (!phone || !phoneRegex.test(phone.replace(/\s|-/g, ''))) {
            errors.phone = "Invalid phone number format (e.g. 08123456789)"
        }

        if (!details || details.length < 10) {
            errors.details = "Address must be detailed (min 10 chars)"
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors)
            return
        }

        setFormErrors({})
        handleAddAddress(formData)
    }

    // Derived display for selected address
    const selectedAddressObj = addresses.find(a => a.id === selectedId)
    
    return (
        <div className="space-y-4">
             <div className="flex justify-between items-center mb-2">
                 <label className="text-sm font-bold text-foreground flex items-center gap-2">
                    <MapPin size={16} /> Alamat Pengiriman
                 </label>
                 {addresses.length > 0 && (
                     <button onClick={() => setIsOpen(true)} className="text-xs text-primary font-bold hover:underline bg-primary/5 px-3 py-1.5 rounded-full transition-colors hover:bg-primary/10">
                         Ubah Alamat
                     </button>
                 )}
             </div>
             
             <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex gap-3 text-sm text-yellow-800 mb-4 items-start">
                <div className="mt-0.5 shrink-0">⚠️</div>
                <p>
                    <span className="font-bold">Penting:</span> Hanya pengiriman ke <span className="font-bold">Area Wonosari</span>. Pesanan di luar area ini atau terlalu jauh mungkin akan ditolak (kecuali si pengantar lagi pengen).
                </p>
             </div>

             {isLoading ? (
                 <div className="h-32 bg-muted/20 animate-pulse rounded-2xl" />
             ) : addresses.length === 0 ? (
                 <div className="p-6 border-2 border-dashed border-muted rounded-2xl text-center space-y-3 bg-muted/5 hover:bg-muted/10 transition-colors">
                     <p className="text-sm text-muted-foreground font-medium">Kamu belum memiliki alamat yang disimpan.</p>
                     <Button size="sm" onClick={() => setIsAddModalOpen(true)} className="rounded-full shadow-lg shadow-primary/20">
                         <Plus size={14} className="mr-1" /> Tambah Alamat Baru
                     </Button>
                 </div>
             ) : (
                 <div 
                    className="p-5 border rounded-2xl bg-card hover:border-primary/50 transition-all group relative shadow-xs"
                    onClick={() => setIsOpen(true)}
                 >
                     {selectedAddressObj ? (
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-1">
                                <MapPin size={20} />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-base">{selectedAddressObj.label || 'Home'}</span>
                                    {selectedAddressObj.is_default && <span className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-bold shadow-xs">Default</span>}
                                </div>
                                <p className="font-medium text-sm text-foreground">{selectedAddressObj.recipient_name} • {selectedAddressObj.phone}</p>
                                <p className="text-sm text-muted-foreground leading-relaxed">{selectedAddressObj.address_details}</p>
                            </div>
                            <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                                <span className="text-xs font-bold">Ubah</span>
                            </div>
                        </div>
                     ) : (
                         <div className="flex items-center justify-between text-muted-foreground p-2">
                             <span>Pilih alamat untuk melanjutkan...</span>
                             <ChevronRight size={16} />
                         </div>
                     )}
                 </div>
             )}

             {/* Selection Modal */}
             <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Select Delivery Address"
             >
                 <div className="space-y-3 max-h-[60vh] overflow-y-auto p-1">
                     {addresses.map(addr => (
                         <div 
                            key={addr.id}
                            onClick={() => handleSelect(addr)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-4 active:scale-[0.98] ${
                                selectedId === addr.id 
                                ? 'border-primary bg-primary/5 shadow-inner' 
                                : 'border-transparent bg-muted/30 hover:bg-muted'
                            }`}
                         >
                             <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${selectedId === addr.id ? 'border-primary bg-primary text-white' : 'border-muted-foreground/30'}`}>
                                 {selectedId === addr.id && <Check size={10} strokeWidth={4} />}
                             </div>
                             <div className="flex-1">
                                 <div className="flex items-center gap-2 mb-1">
                                     <span className={`font-bold text-sm ${selectedId === addr.id ? 'text-primary' : 'text-foreground'}`}>{addr.label || 'Address'}</span>
                                     {addr.is_default && <span className="bg-muted-foreground/10 text-muted-foreground text-[10px] px-2 py-0.5 rounded-full font-medium">Default</span>}
                                 </div>
                                 <p className="text-sm font-medium mb-0.5">{addr.recipient_name} <span className="text-muted-foreground font-normal">| {addr.phone}</span></p>
                                 <p className="text-xs text-muted-foreground leading-relaxed">{addr.address_details}</p>
                             </div>
                         </div>
                     ))}

                     <Button variant="outline" className="w-full mt-4 border-dashed h-12 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all font-medium" onClick={() => { setIsOpen(false); setIsAddModalOpen(true); }}>
                         <Plus size={16} className="mr-2" /> Tambah Alamat Baru
                     </Button>
                 </div>
             </Modal>

             {/* Add New Modal (Strict Validation) */}
             <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Address"
             >
                <form action={validateAndSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Label</label>
                            <input name="label" placeholder="Rumah, Kantor..." className="w-full px-4 py-2.5 rounded-xl border bg-muted/30 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Nama Penerima <span className="text-red-500">*</span></label>
                            <input 
                                name="recipient_name" 
                                className={`w-full px-4 py-2.5 rounded-xl border bg-muted/30 focus:bg-background focus:ring-2 focus:border-primary transition-all text-sm outline-none ${formErrors.recipient ? 'border-red-500 bg-red-50 ring-red-200' : 'focus:ring-primary/20'}`}
                                placeholder="Joko Widodo"
                            />
                            {formErrors.recipient && <p className="text-[10px] text-red-500 font-bold">{formErrors.recipient}</p>}
                        </div>
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Nomor Telepon <span className="text-red-500">*</span></label>
                        <input 
                            name="phone" 
                            type="tel"
                            className={`w-full px-4 py-2.5 rounded-xl border bg-muted/30 focus:bg-background focus:ring-2 focus:border-primary transition-all text-sm outline-none ${formErrors.phone ? 'border-red-500 bg-red-50 ring-red-200' : 'focus:ring-primary/20'}`}
                            placeholder="0812xxxxxxx"
                        />
                        {formErrors.phone && <p className="text-[10px] text-red-500 font-bold">{formErrors.phone}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Alamat Lengkap <span className="text-red-500">*</span></label>
                        <textarea 
                            name="address_details" 
                            rows={3} 
                            className={`w-full px-4 py-2.5 rounded-xl border bg-muted/30 focus:bg-background focus:ring-2 focus:border-primary transition-all text-sm outline-none resize-none ${formErrors.details ? 'border-red-500 bg-red-50 ring-red-200' : 'focus:ring-primary/20'}`} 
                            placeholder="Jalan, Nomor Rumah, RT/RW Desa, Kecamatan, Kota, Kode Pos..." 
                        />
                        {formErrors.details && <p className="text-[10px] text-red-500 font-bold">{formErrors.details}</p>}
                    </div>

                    <div className="flex items-center gap-3 pt-2 p-3 bg-muted/30 rounded-xl cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => document.getElementById('new_default')?.click()}>
                        <input type="checkbox" name="is_default" id="new_default" className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer accent-primary" />
                        <label htmlFor="new_default" className="text-sm font-medium cursor-pointer select-none">Simpan sebagai alamat default</label>
                    </div>

                    <Button type="submit" disabled={isAdding} className="w-full mt-4 h-12 font-bold text-base rounded-xl shadow-lg shadow-primary/20">
                        {isAdding ? <Loader2 className="animate-spin mr-2" /> : "Simpan & Gunakan Alamat"}
                    </Button>
                </form>
             </Modal>
        </div>
    )
}
