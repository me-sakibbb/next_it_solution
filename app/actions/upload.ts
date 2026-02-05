'use server'

import { put } from '@vercel/blob'
import { revalidatePath } from 'next/cache'

export async function uploadFile(formData: FormData) {
  try {
    const file = formData.get('file') as File
    
    if (!file) {
      return { error: 'No file provided' }
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
    })

    revalidatePath('/')
    
    return { url: blob.url, error: null }
  } catch (error) {
    console.error('[v0] Upload error:', error)
    return { error: 'Failed to upload file', url: null }
  }
}

export async function uploadMultipleFiles(formData: FormData) {
  try {
    const files = formData.getAll('files') as File[]
    
    if (files.length === 0) {
      return { error: 'No files provided' }
    }

    const uploadPromises = files.map(file => 
      put(file.name, file, { access: 'public' })
    )

    const blobs = await Promise.all(uploadPromises)
    const urls = blobs.map(blob => blob.url)

    revalidatePath('/')
    
    return { urls, error: null }
  } catch (error) {
    console.error('[v0] Multiple upload error:', error)
    return { error: 'Failed to upload files', urls: null }
  }
}
