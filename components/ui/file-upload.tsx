'use client'

import React from "react"

import { useState, useRef } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { Button } from './button'
import { uploadProductImage } from '@/lib/upload'
import Image from 'next/image'

interface FileUploadProps {
  onUpload: (url: string) => void
  currentImage?: string
  maxSize?: number
  accept?: string
}

export function FileUpload({ 
  onUpload, 
  currentImage, 
  maxSize = 5,
  accept = 'image/*' 
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`)
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    try {
      setUploading(true)
      setError(null)
      
      const formData = new FormData()
      formData.append('file', file)
      
      const result = await uploadProductImage(formData)
      onUpload(result.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setError(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    onUpload('')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {preview ? (
          <div className="relative h-32 w-32 rounded-lg border overflow-hidden">
            <Image 
              src={preview || "/placeholder.svg"} 
              alt="Preview" 
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-1 right-1 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="flex h-32 w-32 items-center justify-center rounded-lg border border-dashed">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
        )}

        <div className="flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Image
                </>
              )}
            </Button>
          </label>
          <p className="text-xs text-muted-foreground">
            Max size: {maxSize}MB. Supports JPG, PNG, WebP
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
