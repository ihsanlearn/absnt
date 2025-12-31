'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getCoffees, upsertCoffee, deleteCoffee } from '@/app/profile/coffee-actions'
import Modal from '@/components/ui/modal'
import { createClient } from '@/lib/supabase/client'

// Type definition based on table
interface Coffee {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_available: boolean | null
  category: "coffee" | "non coffee" | null
  tag: string | null
}

export default function ManageCoffee() {
  const [coffees, setCoffees] = useState<Coffee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCoffee, setEditingCoffee] = useState<Coffee | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  // Form States
  const [uploading, setUploading] = useState(false)
  
  useEffect(() => {
    loadCoffees()
  }, [])

  async function loadCoffees() {
    setIsLoading(true)
    const data = await getCoffees()
    setCoffees(data as Coffee[]) // Cast or validate
    setIsLoading(false)
  }

  function handleAddNew() {
    setEditingCoffee(null)
    setIsModalOpen(true)
  }

  function handleEdit(coffee: Coffee) {
    setEditingCoffee(coffee)
    setIsModalOpen(true)
  }

  function handleDeleteClick(id: string) {
    setDeletingId(id)
  }

  async function handleConfirmDelete() {
    if (!deletingId) return
    await deleteCoffee(deletingId)
    setDeletingId(null)
    loadCoffees()
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setUploading(true)
    
    const form = e.currentTarget
    const formData = new FormData(form)
    
    // Handle Image Upload if file selected
    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement
    const file = fileInput?.files?.[0]

    if (file) {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('coffee-images')
        .upload(filePath, file)

      if (uploadError) {
        alert("Error uploading image: " + uploadError.message)
        setUploading(false)
        return
      }

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('coffee-images')
        .getPublicUrl(filePath)
      
      formData.set('image_url', publicUrl)
    } else {
       // If editing and no new file, keep old url
       if (editingCoffee?.image_url) {
         formData.set('image_url', editingCoffee.image_url)
       }
    }
    
    // Add ID if editing
    if (editingCoffee) {
      formData.set('id', editingCoffee.id)
    }

    const res = await upsertCoffee(formData)
    setUploading(false)
    
    if (res?.error) {
      alert(res.error)
    } else {
      setIsModalOpen(false)
      loadCoffees()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">Menu Kopi</h3>
        <Button onClick={handleAddNew} size="sm" className="font-bold">
           <Plus size={16} className="mr-2" />
           Tambah Kopi
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
             <div key={i} className="flex items-center gap-4 bg-white/40 p-3 rounded-xl border border-muted/50">
               <Skeleton className="w-16 h-16 rounded-lg shrink-0" />
               <div className="flex-1 space-y-2">
                 <Skeleton className="h-5 w-32" />
                 <Skeleton className="h-3 w-48" />
                 <Skeleton className="h-4 w-20" />
               </div>
               <div className="flex gap-2">
                 <Skeleton className="h-8 w-8 rounded-md" />
                 <Skeleton className="h-8 w-8 rounded-md" />
               </div>
             </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
           {coffees.map((coffee) => (
             <div key={coffee.id} className="flex items-center gap-4 bg-white/40 p-3 rounded-xl border border-muted/50">
               <div className="w-16 h-16 bg-muted rounded-lg shrink-0 overflow-hidden relative">
                 {coffee.image_url ? (
                   <img src={coffee.image_url} alt={coffee.name} className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ImageIcon size={20} />
                   </div>
                 )}
               </div>
               
               <div className="flex-1 min-w-0">
                  <h4 className="font-bold truncate">{coffee.name}</h4>
                  <p className="text-xs text-muted-foreground truncate">{coffee.description}</p>
                  <p className="text-sm font-semibold text-primary">Rp {coffee.price.toLocaleString()}</p>
               </div>

               <div className="flex gap-2">
                 <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEdit(coffee)}>
                    <Edit size={14} />
                 </Button>
                 <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => handleDeleteClick(coffee.id)}>
                    <Trash size={14} />
                 </Button>
               </div>
             </div>
           ))}
           {coffees.length === 0 && <p className="text-center text-muted-foreground py-4">Tidak ada menu kopi yang ditemukan.</p>}
        </div>
      )}

      {/* CRUD Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCoffee ? "Edit Coffee" : "Add New Coffee"}>
         <form onSubmit={handleSubmit} className="space-y-4">
            <div>
               <label className="block text-sm font-medium mb-1">Nama</label>
               <input name="name" defaultValue={editingCoffee?.name} required className="w-full px-3 py-2 border rounded-lg bg-background" />
            </div>
            
            <div>
               <label className="block text-sm font-medium mb-1">Deskripsi</label>
               <textarea name="description" defaultValue={editingCoffee?.description || ''} className="w-full px-3 py-2 border rounded-lg bg-background h-20" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="block text-sm font-medium mb-1">Harga (Rp)</label>
                 <input name="price" type="number" defaultValue={editingCoffee?.price} required className="w-full px-3 py-2 border rounded-lg bg-background" />
              </div>
              
              <div>
                 <label className="block text-sm font-medium mb-1">Tersedia</label>
                 <select name="is_available" defaultValue={String(editingCoffee?.is_available ?? true)} className="w-full px-3 py-2 border rounded-lg bg-background">
                    <option value="true">Tersedia</option>
                    <option value="false">Habis</option>
                 </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="block text-sm font-medium mb-1">Kategori</label>
                 <select name="category" defaultValue={editingCoffee?.category || 'coffee'} className="w-full px-3 py-2 border rounded-lg bg-background">
                    <option value="coffee">Coffee</option>
                    <option value="non coffee">Non-Coffee</option>
                 </select>
              </div>
              
              <div>
                 <label className="block text-sm font-medium mb-1">Tag (Optional)</label>
                 <input name="tag" placeholder="e.g. Best Seller" defaultValue={editingCoffee?.tag || ''} className="w-full px-3 py-2 border rounded-lg bg-background" />
              </div>
            </div>

            <div>
               <label className="block text-sm font-medium mb-1">Image</label>
               <input type="file" accept="image/*" className="w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-primary/10 file:text-primary
                hover:file:bg-primary/20
              "/>
               {editingCoffee?.image_url && <p className="text-xs text-muted-foreground mt-1">Leave empty to keep existing image</p>}
            </div>

            <div className="pt-4 flex justify-end gap-2">
               <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
               <Button type="submit" disabled={uploading}>
                  {uploading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                  Save Coffee
               </Button>
            </div>
         </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={!!deletingId} 
        onClose={() => setDeletingId(null)} 
        title="Confirm Delete"
        maxWidth="max-w-md"
      >
        <div className="space-y-6">
            <p className="text-muted-foreground">Apakah kamu yakin ingin menghapus menu ini? Tindakan ini tidak dapat dikembalikan.</p>
            <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setDeletingId(null)}>Batal</Button>
                <Button variant="destructive" onClick={handleConfirmDelete}>Hapus</Button>
            </div>
        </div>
      </Modal>
    </div>
  )
}
