'use server'

import { put, del } from '@vercel/blob'

export async function uploadFile(formData: FormData) {
  const file = formData.get('file') as File
  
  if (!file) {
    throw new Error('No file provided')
  }

  const blob = await put(file.name, file, {
    access: 'public',
  })

  return { url: blob.url }
}

export async function deleteFile(url: string) {
  await del(url)
  return { success: true }
}

export async function uploadProductImage(formData: FormData) {
  const file = formData.get('file') as File
  
  if (!file) {
    throw new Error('No file provided')
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image')
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size must be less than 5MB')
  }

  const blob = await put(`products/${Date.now()}-${file.name}`, file, {
    access: 'public',
  })

  return { url: blob.url }
}

export async function uploadShopLogo(formData: FormData) {
  const file = formData.get('file') as File
  
  if (!file) {
    throw new Error('No file provided')
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image')
  }

  if (file.size > 2 * 1024 * 1024) {
    throw new Error('File size must be less than 2MB')
  }

  const blob = await put(`logos/${Date.now()}-${file.name}`, file, {
    access: 'public',
  })

  return { url: blob.url }
}
