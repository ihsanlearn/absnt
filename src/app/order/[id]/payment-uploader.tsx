'use client'

import { useState, useEffect } from "react"
import { Upload, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { uploadPaymentProof } from "./actions"

export default function PaymentUploader({ orderId }: { orderId: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleUpload() {
    if (!file) return
    setIsUploading(true)
    
    const formData = new FormData()
    formData.append("orderId", orderId)
    formData.append("file", file)

    const res = await uploadPaymentProof(formData)
    
    setIsUploading(false)
    if (res?.success) {
        setIsSuccess(true)
    } else {
        alert(res?.error || "Upload failed")
    }
  }

  if (isSuccess) {
    return (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center w-full">
            <div className="flex justify-center mb-2 text-green-600">
                <CheckCircle size={32} />
            </div>
            <h3 className="font-bold text-green-800">Payment Proof Sent!</h3>
            <p className="text-sm text-green-700 mt-1">Please wait for admin confirmation.</p>
        </div>
    )
  }

  return (
    <div className="w-full space-y-4">
        {/* File Input */}
        <div className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors rounded-xl p-8 text-center cursor-pointer bg-muted/5 relative">
            <input 
                type="file" 
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            
            {file ? (
                <div className="text-primary font-medium">
                     <p className="line-clamp-1">{file.name}</p>
                     <p className="text-xs text-muted-foreground mt-1">Click to change</p>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2">
                    <Upload className="text-muted-foreground" />
                    <span className="text-sm font-medium">Click to Upload Payment Proof</span>
                    <span className="text-xs text-muted-foreground">Supported formats: JPG, PNG</span>
                </div>
            )}
        </div>

        <Button 
            className="w-full h-12 text-lg font-bold rounded-xl"
            disabled={!file || isUploading}
            onClick={handleUpload}
        >
            {isUploading ? <Loader2 className="animate-spin" /> : "Confirm Payment"}
        </Button>
    </div>
  )
}
