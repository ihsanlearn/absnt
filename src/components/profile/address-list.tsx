'use client'

import { useState, useEffect } from 'react'
import { Plus, MapPin, Edit2, Trash2, CheckCircle2, Loader2, MoreVertical, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '@/app/profile/actions'
import Modal from '@/components/ui/modal'

interface Address {
    id: string
    label: string | null
    recipient_name: string
    phone: string
    address_details: string
    is_default: boolean
}

export default function AddressList() {
    const [addresses, setAddresses] = useState<Address[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isActionLoading, setIsActionLoading] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingAddress, setEditingAddress] = useState<Address | null>(null)

    async function refreshAddresses() {
        try {
            const data = await getAddresses()
            const cleanData = data?.map(addr => ({
                ...addr,
                is_default: !!addr.is_default
            })) || []
            setAddresses(cleanData)
        } catch (error) {
            console.error("Failed to load addresses", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        refreshAddresses()
    }, [])

    async function handleSubmit(formData: FormData) {
        setIsActionLoading(true)
        if (editingAddress) {
            await updateAddress(editingAddress.id, formData)
        } else {
            await addAddress(formData)
        }
        await refreshAddresses()
        setIsActionLoading(false)
        setModalOpen(false)
        setEditingAddress(null)
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this address?')) return
        setIsActionLoading(true)
        await deleteAddress(id)
        await refreshAddresses()
        setIsActionLoading(false)
    }

    async function handleSetDefault(id: string) {
        setIsActionLoading(true)
        await setDefaultAddress(id)
        await refreshAddresses()
        setIsActionLoading(false)
    }

    function openAddModal() {
        setEditingAddress(null)
        setModalOpen(true)
    }

    function openEditModal(addr: Address) {
        setEditingAddress(addr)
        setModalOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Alamat Saya</h3>
                <Button size="sm" onClick={openAddModal} className="gap-2">
                    <Plus size={16} />
                    Tambah Alamat
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-8">
                     <Loader2 className="animate-spin text-muted-foreground" />
                </div>
            ) : addresses.length === 0 ? (
                <div className="text-center p-8 border border-dashed rounded-xl text-muted-foreground">
                    <MapPin className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p>Tidak ada alamat yang disimpan.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {addresses.map((addr) => (
                        <div 
                           key={addr.id} 
                           className={`relative p-4 rounded-xl border flex flex-col gap-2 transition-all ${
                               addr.is_default ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'bg-background hover:border-foreground/20'
                           }`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-sm">{addr.label || 'Alamat'}</span>
                                        {addr.is_default && (
                                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">Default</span>
                                        )}
                                    </div>
                                    <p className="font-medium text-sm">{addr.recipient_name}</p>
                                    <p className="text-xs text-muted-foreground">{addr.phone}</p>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => openEditModal(addr)}>
                                        <Edit2 size={14} />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50" onClick={() => handleDelete(addr.id)}>
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1 min-h-[40px]">{addr.address_details}</p>
                            
                            {!addr.is_default && (
                                <button 
                                    onClick={() => handleSetDefault(addr.id)}
                                    disabled={isActionLoading}
                                    className="text-xs text-primary font-medium hover:underline mt-auto self-start"
                                >
                                    Simpan sebagai alamat default
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingAddress ? 'Edit Alamat' : 'Tambah Alamat Baru'}
            >
                <form action={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Label</label>
                            <input name="label" placeholder="e.g. Rumah, Kantor" defaultValue={editingAddress?.label || ''} className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Nama Penerima</label>
                            <input name="recipient_name" required defaultValue={editingAddress?.recipient_name || ''} className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
                        </div>
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Nomor Telepon</label>
                        <input name="phone" required defaultValue={editingAddress?.phone || ''} className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Alamat Lengkap</label>
                        <textarea name="address_details" required rows={3} defaultValue={editingAddress?.address_details || ''} className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input type="checkbox" name="is_default" id="default_check" defaultChecked={editingAddress?.is_default} className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                        <label htmlFor="default_check" className="text-sm">Simpan sebagai alamat defualt</label>
                    </div>

                    <Button type="submit" disabled={isActionLoading} className="w-full mt-4">
                        {isActionLoading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 w-4 h-4" />}
                        Simpan Alamat
                    </Button>
                </form>
            </Modal>
        </div>
    )
}
