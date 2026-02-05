'use client'

import React from "react"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Upload, Download, RotateCw, Crop, Contrast, Sun, ImageIcon, Scissors, Printer, Maximize2, Sparkles, Palette } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import jsPDF from 'jspdf'

interface PhotoEditorClientProps {
  shopId: string
}

interface CropPreset {
  name: string
  width: number
  height: number
  unit: 'px' | 'mm'
}

const CROP_PRESETS: CropPreset[] = [
  { name: 'Passport (2x2 inch)', width: 600, height: 600, unit: 'px' },
  { name: 'Passport US (2x2 inch)', width: 600, height: 600, unit: 'px' },
  { name: 'Passport India (35x45mm)', width: 413, height: 531, unit: 'px' },
  { name: 'Stamp Size (25x35mm)', width: 295, height: 413, unit: 'px' },
  { name: 'Visa (35x45mm)', width: 413, height: 531, unit: 'px' },
  { name: 'ID Card (35x45mm)', width: 413, height: 531, unit: 'px' },
  { name: 'Custom', width: 0, height: 0, unit: 'px' },
]

type ResizeHandle = 'tl' | 'tr' | 'bl' | 'br' | 'tm' | 'bm' | 'ml' | 'mr' | 'move' | null

export function PhotoEditorClient({ shopId }: PhotoEditorClientProps) {
  const { toast } = useToast()
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [blur, setBlur] = useState(0)
  const [sharpness, setSharpness] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Crop state
  const [isCropping, setIsCropping] = useState(false)
  const [cropPreset, setCropPreset] = useState<string>('Passport (2x2 inch)')
  const [customWidth, setCustomWidth] = useState(600)
  const [customHeight, setCustomHeight] = useState(600)
  const [cropX, setCropX] = useState(0)
  const [cropY, setCropY] = useState(0)
  const [cropWidth, setCropWidth] = useState(600)
  const [cropHeight, setCropHeight] = useState(600)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [activeHandle, setActiveHandle] = useState<ResizeHandle>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
  // Photo mode: crop box locks, image becomes draggable/resizable (like Canva)
  const [isPhotoMode, setIsPhotoMode] = useState(false)
  const [photoX, setPhotoX] = useState(0) // image x offset
  const [photoY, setPhotoY] = useState(0) // image y offset
  const [photoScale, setPhotoScale] = useState(1) // image scale
  const [photoResizeHandle, setPhotoResizeHandle] = useState<ResizeHandle>(null)
  
  // Resize image state
  const [resizeWidth, setResizeWidth] = useState(0)
  const [resizeHeight, setResizeHeight] = useState(0)
  const [maintainResizeAspect, setMaintainResizeAspect] = useState(true)
  
  // Background removal state
  const [isRemovingBg, setIsRemovingBg] = useState(false)
  const [bgRemoved, setBgRemoved] = useState(false)
  
  // Download/Print dialog state
  const [showPrintDialog, setShowPrintDialog] = useState(false)
  const [printCopies, setPrintCopies] = useState(6)
  const [printSpacing, setPrintSpacing] = useState(10)
  
  // Initialize resize dimensions when image loads
  useEffect(() => {
    if (image) {
      setResizeWidth(image.width)
      setResizeHeight(image.height)
    }
  }, [image])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          setImage(img)
          setOriginalImage(img)
          setBrightness(100)
          setContrast(100)
          setSaturation(100)
          setRotation(0)
          setBlur(0)
          setSharpness(0)
          setIsCropping(false)
          setBgRemoved(false)
          setResizeWidth(img.width)
          setResizeHeight(img.height)
          const preset = getCropDimensions()
          setCropWidth(preset.width)
          setCropHeight(preset.height)
        }
        img.src = event.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  const getCropDimensions = () => {
    const preset = CROP_PRESETS.find(p => p.name === cropPreset)
    if (preset?.name === 'Custom') {
      return { width: customWidth, height: customHeight }
    }
    return preset ? { width: preset.width, height: preset.height } : { width: 600, height: 600 }
  }

  const getHandleAtPosition = (x: number, y: number, handleSize: number = 12) => {
    const handles = [
      { name: 'tl' as ResizeHandle, x: cropX, y: cropY },
      { name: 'tr' as ResizeHandle, x: cropX + cropWidth, y: cropY },
      { name: 'bl' as ResizeHandle, x: cropX, y: cropY + cropHeight },
      { name: 'br' as ResizeHandle, x: cropX + cropWidth, y: cropY + cropHeight },
      { name: 'tm' as ResizeHandle, x: cropX + cropWidth / 2, y: cropY },
      { name: 'bm' as ResizeHandle, x: cropX + cropWidth / 2, y: cropY + cropHeight },
      { name: 'ml' as ResizeHandle, x: cropX, y: cropY + cropHeight / 2 },
      { name: 'mr' as ResizeHandle, x: cropX + cropWidth, y: cropY + cropHeight / 2 },
    ]
    
    for (const handle of handles) {
      const distance = Math.sqrt(Math.pow(x - handle.x, 2) + Math.pow(y - handle.y, 2))
      if (distance < handleSize) {
        return handle.name
      }
    }
    
    // Check if inside crop box
    if (x >= cropX && x <= cropX + cropWidth && y >= cropY && y <= cropY + cropHeight) {
      return 'move' as ResizeHandle
    }
    
    return null
  }

  // Get the photo's bounding rect in canvas coordinates (accounting for photoX/Y/Scale)
  const getPhotoBounds = () => {
    if (!image) return { x: 0, y: 0, w: 0, h: 0 }
    return {
      x: photoX,
      y: photoY,
      w: image.width * photoScale,
      h: image.height * photoScale,
    }
  }

  // Check if a point is near a photo corner handle (in photo mode)
  const getPhotoHandleAtPosition = (mx: number, my: number, handleSize: number = 16): ResizeHandle => {
    const b = getPhotoBounds()
    const handles: { name: ResizeHandle; x: number; y: number }[] = [
      { name: 'tl', x: b.x, y: b.y },
      { name: 'tr', x: b.x + b.w, y: b.y },
      { name: 'bl', x: b.x, y: b.y + b.h },
      { name: 'br', x: b.x + b.w, y: b.y + b.h },
    ]
    for (const h of handles) {
      if (Math.abs(mx - h.x) < handleSize && Math.abs(my - h.y) < handleSize) {
        return h.name
      }
    }
    // Check if inside the photo rect -> move
    if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
      return 'move'
    }
    return null
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCropping || !canvasRef.current) return
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY
    
    if (isPhotoMode) {
      // Photo mode: drag or resize the image itself
      const handle = getPhotoHandleAtPosition(x, y)
      if (handle && handle !== 'move') {
        setIsResizing(true)
        setPhotoResizeHandle(handle)
        setDragStart({ x, y })
        canvas.style.cursor = 'nwse-resize'
      } else if (handle === 'move') {
        setIsDragging(true)
        setDragStart({ x: x - photoX, y: y - photoY })
        canvas.style.cursor = 'grabbing'
      }
    } else {
      // Crop box mode: move/resize the crop box
      const handle = getHandleAtPosition(x, y)
      if (handle === 'move') {
        setIsDragging(true)
        setDragStart({ x: x - cropX, y: y - cropY })
      } else if (handle) {
        setIsResizing(true)
        setActiveHandle(handle)
        setDragStart({ x, y })
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCropping || !canvasRef.current || !image) return
    
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY
    
    if (isPhotoMode) {
      if (isDragging) {
        // Move the photo
        setPhotoX(x - dragStart.x)
        setPhotoY(y - dragStart.y)
      } else if (isResizing && photoResizeHandle) {
        // Resize the photo from the corner handle, maintaining aspect ratio
        const b = getPhotoBounds()
        const aspect = image.width / image.height
        
        let newX = photoX
        let newY = photoY
        let newW = b.w
        let newH = b.h
        
        switch (photoResizeHandle) {
          case 'br': {
            newW = Math.max(50, x - b.x)
            newH = newW / aspect
            break
          }
          case 'bl': {
            newW = Math.max(50, (b.x + b.w) - x)
            newH = newW / aspect
            newX = (b.x + b.w) - newW
            break
          }
          case 'tr': {
            newW = Math.max(50, x - b.x)
            newH = newW / aspect
            newY = (b.y + b.h) - newH
            break
          }
          case 'tl': {
            newW = Math.max(50, (b.x + b.w) - x)
            newH = newW / aspect
            newX = (b.x + b.w) - newW
            newY = (b.y + b.h) - newH
            break
          }
        }
        
        setPhotoX(newX)
        setPhotoY(newY)
        setPhotoScale(newW / image.width)
      } else {
        // Cursor feedback
        const handle = getPhotoHandleAtPosition(x, y)
        if (handle === 'tl' || handle === 'br') canvas.style.cursor = 'nwse-resize'
        else if (handle === 'tr' || handle === 'bl') canvas.style.cursor = 'nesw-resize'
        else if (handle === 'move') canvas.style.cursor = 'grab'
        else canvas.style.cursor = 'default'
      }
    } else {
      // Crop box mode
      if (!isDragging && !isResizing) {
        const handle = getHandleAtPosition(x, y)
        if (handle === 'move') canvas.style.cursor = 'move'
        else if (handle === 'tl' || handle === 'br') canvas.style.cursor = 'nwse-resize'
        else if (handle === 'tr' || handle === 'bl') canvas.style.cursor = 'nesw-resize'
        else if (handle === 'tm' || handle === 'bm') canvas.style.cursor = 'ns-resize'
        else if (handle === 'ml' || handle === 'mr') canvas.style.cursor = 'ew-resize'
        else canvas.style.cursor = 'default'
      }
      
      if (isDragging) {
        const newX = Math.max(0, Math.min(x - dragStart.x, image.width - cropWidth))
        const newY = Math.max(0, Math.min(y - dragStart.y, image.height - cropHeight))
        setCropX(newX)
        setCropY(newY)
      } else if (isResizing && activeHandle) {
        const dx = x - dragStart.x
        const dy = y - dragStart.y
        const aspectRatio = cropWidth / cropHeight
        
        let newX = cropX
        let newY = cropY
        let newWidth = cropWidth
        let newHeight = cropHeight
      
      switch (activeHandle) {
        case 'br':
          newWidth = Math.max(50, cropWidth + dx)
          newHeight = maintainAspectRatio ? newWidth / aspectRatio : Math.max(50, cropHeight + dy)
          break
        case 'bl':
          newWidth = Math.max(50, cropWidth - dx)
          newHeight = maintainAspectRatio ? newWidth / aspectRatio : Math.max(50, cropHeight + dy)
          newX = cropX + (cropWidth - newWidth)
          break
        case 'tr':
          newWidth = Math.max(50, cropWidth + dx)
          newHeight = maintainAspectRatio ? newWidth / aspectRatio : Math.max(50, cropHeight - dy)
          newY = cropY + (cropHeight - newHeight)
          break
        case 'tl':
          newWidth = Math.max(50, cropWidth - dx)
          newHeight = maintainAspectRatio ? newWidth / aspectRatio : Math.max(50, cropHeight - dy)
          newX = cropX + (cropWidth - newWidth)
          newY = cropY + (cropHeight - newHeight)
          break
        case 'mr':
          newWidth = Math.max(50, cropWidth + dx)
          if (maintainAspectRatio) newHeight = newWidth / aspectRatio
          break
        case 'ml':
          newWidth = Math.max(50, cropWidth - dx)
          newX = cropX + (cropWidth - newWidth)
          if (maintainAspectRatio) newHeight = newWidth / aspectRatio
          break
        case 'bm':
          newHeight = Math.max(50, cropHeight + dy)
          if (maintainAspectRatio) newWidth = newHeight * aspectRatio
          break
        case 'tm':
          newHeight = Math.max(50, cropHeight - dy)
          newY = cropY + (cropHeight - newHeight)
          if (maintainAspectRatio) newWidth = newHeight * aspectRatio
          break
      }
      
      // Keep within bounds
      if (newX < 0) {
        newWidth += newX
        newX = 0
      }
      if (newY < 0) {
        newHeight += newY
        newY = 0
      }
      if (newX + newWidth > image.width) {
        newWidth = image.width - newX
      }
      if (newY + newHeight > image.height) {
        newHeight = image.height - newY
      }
      
      setCropX(newX)
      setCropY(newY)
      setCropWidth(newWidth)
      setCropHeight(newHeight)
      setDragStart({ x, y })
      }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
    setActiveHandle(null)
    setPhotoResizeHandle(null)
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'default'
    }
  }

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (!isCropping || !isPhotoMode || !image) return
    e.preventDefault()
    
    // Scale the photo up/down centered on the crop area
    const delta = e.deltaY > 0 ? -0.03 : 0.03
    const newScale = Math.max(0.1, Math.min(5, photoScale + delta))
    
    // Keep image centered around the crop center while scaling
    const cropCenterX = cropX + cropWidth / 2
    const cropCenterY = cropY + cropHeight / 2
    const oldW = image.width * photoScale
    const oldH = image.height * photoScale
    const newW = image.width * newScale
    const newH = image.height * newScale
    
    setPhotoX(photoX - (newW - oldW) * ((cropCenterX - photoX) / oldW))
    setPhotoY(photoY - (newH - oldH) * ((cropCenterY - photoY) / oldH))
    setPhotoScale(newScale)
  }

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCropping || !canvasRef.current || !image) return
    
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY
    
    if (isPhotoMode) {
      // Double-click to go back to crop box mode
      setIsPhotoMode(false)
    } else {
      // Double-click inside crop to enter photo mode
      if (x >= cropX && x <= cropX + cropWidth && y >= cropY && y <= cropY + cropHeight) {
        // Initialize photo position/scale: image is at (0,0) with scale 1 by default
        if (photoScale === 1 && photoX === 0 && photoY === 0) {
          setPhotoX(0)
          setPhotoY(0)
          setPhotoScale(1)
        }
        setIsPhotoMode(true)
      }
    }
  }

  const startCropping = () => {
    const preset = getCropDimensions()
    setCropWidth(preset.width)
    setCropHeight(preset.height)
    setCropX(0)
    setCropY(0)
    setPhotoX(0)
    setPhotoY(0)
    setPhotoScale(1)
    setIsPhotoMode(false)
    setIsCropping(true)
  }

  const applyCrop = () => {
    if (!image || !canvasRef.current) return
    
    const croppedCanvas = document.createElement('canvas')
    croppedCanvas.width = cropWidth
    croppedCanvas.height = cropHeight
    const ctx = croppedCanvas.getContext('2d')
    
    if (ctx) {
      if (isPhotoMode || photoScale !== 1 || photoX !== 0 || photoY !== 0) {
        // Photo was repositioned/scaled: draw image at its transform, clipped to crop box
        ctx.drawImage(
          image,
          photoX - cropX, photoY - cropY,
          image.width * photoScale, image.height * photoScale
        )
      } else {
        // Normal crop: extract the crop region from the original image
        ctx.drawImage(
          image,
          cropX, cropY, cropWidth, cropHeight,
          0, 0, cropWidth, cropHeight
        )
      }
      
      const croppedImg = new Image()
      croppedImg.onload = () => {
        setImage(croppedImg)
        setIsCropping(false)
        setIsPhotoMode(false)
        setCropX(0)
        setCropY(0)
        setPhotoX(0)
        setPhotoY(0)
        setPhotoScale(1)
        toast({
          title: "Success",
          description: "Image cropped successfully",
        })
      }
      croppedImg.src = croppedCanvas.toDataURL()
    }
  }

  const applyResize = () => {
    if (!image) return
    
    const resizedCanvas = document.createElement('canvas')
    resizedCanvas.width = resizeWidth
    resizedCanvas.height = resizeHeight
    const ctx = resizedCanvas.getContext('2d')
    
    if (ctx) {
      ctx.drawImage(image, 0, 0, resizeWidth, resizeHeight)
      
      const resizedImg = new Image()
      resizedImg.onload = () => {
        setImage(resizedImg)
        toast({
          title: "Success",
          description: `Image resized to ${resizeWidth}x${resizeHeight}px`,
        })
      }
      resizedImg.src = resizedCanvas.toDataURL()
    }
  }

  const handleResizeWidthChange = (value: number) => {
    setResizeWidth(value)
    if (maintainResizeAspect && image) {
      const aspectRatio = image.width / image.height
      setResizeHeight(Math.round(value / aspectRatio))
    }
  }

  const handleResizeHeightChange = (value: number) => {
    setResizeHeight(value)
    if (maintainResizeAspect && image) {
      const aspectRatio = image.width / image.height
      setResizeWidth(Math.round(value * aspectRatio))
    }
  }

  const removeBackground = async () => {
    if (!image) return
    
    setIsRemovingBg(true)
    try {
      // Using @imgly/background-removal library
      const { removeBackground: removeBg } = await import('@imgly/background-removal')
      
      const blob = await (await fetch(image.src)).blob()
      const result = await removeBg(blob, {
        output: {
          format: 'image/png',
          quality: 0.8,
        }
      })
      
      const url = URL.createObjectURL(result)
      const img = new Image()
      img.onload = () => {
        setImage(img)
        setBgRemoved(true)
        setIsRemovingBg(false)
        toast({
          title: "Success",
          description: "Background removed successfully",
        })
      }
      img.onerror = () => {
        setIsRemovingBg(false)
        toast({
          title: "Error",
          description: "Failed to load processed image",
          variant: "destructive",
        })
      }
      img.src = url
    } catch (error) {
      console.error('Background removal error:', error)
      setIsRemovingBg(false)
      toast({
        title: "Error",
        description: "Failed to remove background. This feature requires a stable internet connection.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (image && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Set canvas size
      canvas.width = image.width
      canvas.height = image.height

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Apply transformations
      ctx.save()
      
      // Move to center for rotation
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.translate(-canvas.width / 2, -canvas.height / 2)

      // Apply filters
      let filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
      if (blur > 0) filterString += ` blur(${blur}px)`
      ctx.filter = filterString
      
      // Draw image (at photoX/Y/Scale if in photo mode, otherwise normally)
      if (isCropping && isPhotoMode) {
        ctx.drawImage(image, photoX, photoY, image.width * photoScale, image.height * photoScale)
      } else {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
      }
      ctx.restore()
      
      // Draw crop overlay if cropping
      if (isCropping) {
        // Draw dark overlay on full canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Clear crop area to reveal image
        ctx.clearRect(cropX, cropY, cropWidth, cropHeight)
        
        // Redraw image only inside crop area (clip to crop box)
        ctx.save()
        ctx.beginPath()
        ctx.rect(cropX, cropY, cropWidth, cropHeight)
        ctx.clip()
        
        let cropFilterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
        if (blur > 0) cropFilterString += ` blur(${blur}px)`
        ctx.filter = cropFilterString
        
        if (isPhotoMode) {
          ctx.drawImage(image, photoX, photoY, image.width * photoScale, image.height * photoScale)
        } else {
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
        }
        ctx.restore()
        
        if (isPhotoMode) {
          // PHOTO MODE: Draw the full image boundary (faded) outside crop area
          // to show where the image is
          ctx.save()
          ctx.globalAlpha = 0.3
          let photoFilterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
          if (blur > 0) photoFilterString += ` blur(${blur}px)`
          ctx.filter = photoFilterString
          ctx.drawImage(image, photoX, photoY, image.width * photoScale, image.height * photoScale)
          ctx.restore()
          
          // Re-draw the crop area at full opacity on top
          ctx.save()
          ctx.beginPath()
          ctx.rect(cropX, cropY, cropWidth, cropHeight)
          ctx.clip()
          let cropFilterString2 = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
          if (blur > 0) cropFilterString2 += ` blur(${blur}px)`
          ctx.filter = cropFilterString2
          ctx.drawImage(image, photoX, photoY, image.width * photoScale, image.height * photoScale)
          ctx.restore()
          
          // Draw crop box border (green, locked)
          ctx.strokeStyle = '#10b981'
          ctx.lineWidth = 3
          ctx.setLineDash([8, 4])
          ctx.strokeRect(cropX, cropY, cropWidth, cropHeight)
          ctx.setLineDash([])
          
          // Draw photo boundary border with corner handles
          const pb = { x: photoX, y: photoY, w: image.width * photoScale, h: image.height * photoScale }
          ctx.strokeStyle = '#3b82f6'
          ctx.lineWidth = 2
          ctx.strokeRect(pb.x, pb.y, pb.w, pb.h)
          
          // Draw corner handles on the photo
          const hs = 14
          ctx.fillStyle = '#3b82f6'
          ctx.fillRect(pb.x - hs/2, pb.y - hs/2, hs, hs)
          ctx.fillRect(pb.x + pb.w - hs/2, pb.y - hs/2, hs, hs)
          ctx.fillRect(pb.x - hs/2, pb.y + pb.h - hs/2, hs, hs)
          ctx.fillRect(pb.x + pb.w - hs/2, pb.y + pb.h - hs/2, hs, hs)
          
          // White inner squares on handles
          const ihs = 8
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(pb.x - ihs/2, pb.y - ihs/2, ihs, ihs)
          ctx.fillRect(pb.x + pb.w - ihs/2, pb.y - ihs/2, ihs, ihs)
          ctx.fillRect(pb.x - ihs/2, pb.y + pb.h - ihs/2, ihs, ihs)
          ctx.fillRect(pb.x + pb.w - ihs/2, pb.y + pb.h - ihs/2, ihs, ihs)
          
          // Label
          ctx.fillStyle = '#10b981'
          ctx.font = 'bold 14px sans-serif'
          ctx.fillText(`${Math.round(photoScale * 100)}%`, cropX + 8, cropY - 8)
        } else {
          // CROP BOX MODE: Draw crop box border + grid + handles
          ctx.strokeStyle = '#3b82f6'
          ctx.lineWidth = 3
          ctx.strokeRect(cropX, cropY, cropWidth, cropHeight)
          
          // Grid lines (rule of thirds)
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(cropX + cropWidth / 3, cropY)
          ctx.lineTo(cropX + cropWidth / 3, cropY + cropHeight)
          ctx.moveTo(cropX + (2 * cropWidth) / 3, cropY)
          ctx.lineTo(cropX + (2 * cropWidth) / 3, cropY + cropHeight)
          ctx.moveTo(cropX, cropY + cropHeight / 3)
          ctx.lineTo(cropX + cropWidth, cropY + cropHeight / 3)
          ctx.moveTo(cropX, cropY + (2 * cropHeight) / 3)
          ctx.lineTo(cropX + cropWidth, cropY + (2 * cropHeight) / 3)
          ctx.stroke()
          
          // Crop corner and edge handles
          const handleSize = 12
          ctx.fillStyle = '#3b82f6'
          ctx.fillRect(cropX - handleSize/2, cropY - handleSize/2, handleSize, handleSize)
          ctx.fillRect(cropX + cropWidth - handleSize/2, cropY - handleSize/2, handleSize, handleSize)
          ctx.fillRect(cropX - handleSize/2, cropY + cropHeight - handleSize/2, handleSize, handleSize)
          ctx.fillRect(cropX + cropWidth - handleSize/2, cropY + cropHeight - handleSize/2, handleSize, handleSize)
          ctx.fillRect(cropX + cropWidth/2 - handleSize/2, cropY - handleSize/2, handleSize, handleSize)
          ctx.fillRect(cropX + cropWidth/2 - handleSize/2, cropY + cropHeight - handleSize/2, handleSize, handleSize)
          ctx.fillRect(cropX - handleSize/2, cropY + cropHeight/2 - handleSize/2, handleSize, handleSize)
          ctx.fillRect(cropX + cropWidth - handleSize/2, cropY + cropHeight/2 - handleSize/2, handleSize, handleSize)
          
          // Dimension label
          ctx.fillStyle = '#3b82f6'
          ctx.font = 'bold 14px sans-serif'
          ctx.fillText(`${Math.round(cropWidth)} × ${Math.round(cropHeight)}px`, cropX + 10, cropY + 25)
        }
      }
    }
  }, [image, brightness, contrast, saturation, rotation, blur, isCropping, cropX, cropY, cropWidth, cropHeight, photoX, photoY, photoScale, isPhotoMode])

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a')
      link.download = `edited-image-${Date.now()}.png`
      link.href = canvasRef.current.toDataURL()
      link.click()
      toast({
        title: "Success",
        description: "Image downloaded successfully",
      })
    }
  }

  const handlePrintDownload = () => {
    if (!canvasRef.current || !image) return
    
    // A4 dimensions in mm and pixels at 300 DPI
    const A4_WIDTH_MM = 210
    const A4_HEIGHT_MM = 297
    const DPI = 300
    const MM_TO_PX = DPI / 25.4
    
    const pageWidthPx = A4_WIDTH_MM * MM_TO_PX
    const pageHeightPx = A4_HEIGHT_MM * MM_TO_PX
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    // Calculate how many images fit on one page
    const spacingMm = printSpacing / MM_TO_PX / 25.4 * 10
    const imageWidthMm = image.width / MM_TO_PX / 25.4 * 10
    const imageHeightMm = image.height / MM_TO_PX / 25.4 * 10
    
    const margin = 10 // mm
    const availableWidth = A4_WIDTH_MM - (2 * margin)
    const availableHeight = A4_HEIGHT_MM - (2 * margin)
    
    const cols = Math.floor((availableWidth + spacingMm) / (imageWidthMm + spacingMm))
    const rows = Math.floor((availableHeight + spacingMm) / (imageHeightMm + spacingMm))
    const imagesPerPage = cols * rows
    
    if (imagesPerPage === 0) {
      toast({
        title: "Error",
        description: "Image is too large for A4 paper. Please resize it first.",
        variant: "destructive",
      })
      return
    }
    
    const totalPages = Math.ceil(printCopies / imagesPerPage)
    
    // Get image data
    const imageData = canvasRef.current.toDataURL('image/png')
    
    let copiesPlaced = 0
    for (let page = 0; page < totalPages; page++) {
      if (page > 0) pdf.addPage()
      
      for (let row = 0; row < rows && copiesPlaced < printCopies; row++) {
        for (let col = 0; col < cols && copiesPlaced < printCopies; col++) {
          const x = margin + col * (imageWidthMm + spacingMm)
          const y = margin + row * (imageHeightMm + spacingMm)
          
          pdf.addImage(imageData, 'PNG', x, y, imageWidthMm, imageHeightMm)
          copiesPlaced++
        }
      }
    }
    
    // Save PDF
    pdf.save(`print-layout-${printCopies}-copies-${Date.now()}.pdf`)
    
    setShowPrintDialog(false)
    toast({
      title: "Success",
      description: `PDF with ${printCopies} copies on ${totalPages} page(s) downloaded successfully`,
    })
  }

  const applyPreset = (preset: string) => {
    switch (preset) {
      case 'vivid':
        setBrightness(110)
        setContrast(120)
        setSaturation(130)
        break
      case 'bw':
        setSaturation(0)
        setContrast(110)
        break
      case 'vintage':
        setBrightness(95)
        setContrast(90)
        setSaturation(80)
        break
      case 'cool':
        setBrightness(105)
        setContrast(105)
        setSaturation(110)
        break
      case 'warm':
        setBrightness(110)
        setContrast(105)
        setSaturation(120)
        break
      default:
        setBrightness(100)
        setContrast(100)
        setSaturation(100)
    }
  }

  return (
    <>
      <div className="flex h-full gap-6">
        {/* Editor Canvas */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Photo Editor</h1>
              <p className="text-muted-foreground">Edit product photos with advanced tools</p>
            </div>
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
              {image && (
                <>
                  <Button onClick={handleDownload} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button onClick={() => setShowPrintDialog(true)} variant="outline">
                    <Printer className="h-4 w-4 mr-2" />
                    Print Layout
                  </Button>
                </>
              )}
            </div>
          </div>

        <Card className="flex-1 flex items-center justify-center bg-muted/30 overflow-hidden p-4 min-h-0">
          {!image ? (
            <div className="text-center">
              <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Image Loaded</h3>
              <p className="text-muted-foreground mb-4">Upload an image to start editing</p>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
            </div>
          ) : (
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full object-contain cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onDoubleClick={handleDoubleClick}
                onWheel={handleWheel}
              />
              {isCropping && (
                <div className={`absolute top-2 left-2 px-3 py-1 rounded text-sm text-white ${isPhotoMode ? 'bg-green-500' : 'bg-blue-500'}`}>
                  {isPhotoMode ? 'Drag/resize photo • Double-click to exit' : 'Double-click crop to adjust photo'}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Controls Panel */}
      {image && (
        <Card className="w-80 p-6 shrink-0 overflow-y-auto">
          <Tabs defaultValue="adjust" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 text-xs">
              <TabsTrigger value="adjust">Adjust</TabsTrigger>
              <TabsTrigger value="crop">Crop</TabsTrigger>
              <TabsTrigger value="resize">Resize</TabsTrigger>
              <TabsTrigger value="effects">Effects</TabsTrigger>
            </TabsList>

            <TabsContent value="adjust" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <Label className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Brightness
                  </Label>
                  <span className="text-sm text-muted-foreground">{brightness}%</span>
                </div>
                <Slider
                  value={[brightness]}
                  onValueChange={([value]) => setBrightness(value)}
                  min={0}
                  max={200}
                  step={1}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <Label className="flex items-center gap-2">
                    <Contrast className="h-4 w-4" />
                    Contrast
                  </Label>
                  <span className="text-sm text-muted-foreground">{contrast}%</span>
                </div>
                <Slider
                  value={[contrast]}
                  onValueChange={([value]) => setContrast(value)}
                  min={0}
                  max={200}
                  step={1}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <Label className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Saturation
                  </Label>
                  <span className="text-sm text-muted-foreground">{saturation}%</span>
                </div>
                <Slider
                  value={[saturation]}
                  onValueChange={([value]) => setSaturation(value)}
                  min={0}
                  max={200}
                  step={1}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <Label>Blur</Label>
                  <span className="text-sm text-muted-foreground">{blur}px</span>
                </div>
                <Slider
                  value={[blur]}
                  onValueChange={([value]) => setBlur(value)}
                  min={0}
                  max={20}
                  step={0.5}
                />
              </div>

              <div className="pt-4 border-t space-y-2">
                <Button onClick={handleRotate} variant="outline" className="w-full">
                  <RotateCw className="h-4 w-4 mr-2" />
                  Rotate 90°
                </Button>
                <Button
                  onClick={() => {
                    setBrightness(100)
                    setContrast(100)
                    setSaturation(100)
                    setRotation(0)
                    setBlur(0)
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Reset Adjustments
                </Button>
              </div>

              <div className="pt-4 border-t">
                <Button 
                  onClick={removeBackground} 
                  variant="default" 
                  className="w-full"
                  disabled={isRemovingBg || bgRemoved}
                >
                  <Scissors className="h-4 w-4 mr-2" />
                  {isRemovingBg ? 'Removing Background...' : bgRemoved ? 'Background Removed' : 'Remove Background'}
                </Button>
                {bgRemoved && (
                  <Button
                    onClick={() => {
                      if (originalImage) {
                        setImage(originalImage)
                        setBgRemoved(false)
                        toast({
                          title: "Restored",
                          description: "Original image restored",
                        })
                      }
                    }}
                    variant="outline"
                    className="w-full mt-2"
                  >
                    Restore Original
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="crop" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Crop Preset</Label>
                  <Select value={cropPreset} onValueChange={(value) => {
                    setCropPreset(value)
                    if (value !== 'Custom') {
                      const preset = CROP_PRESETS.find(p => p.name === value)
                      if (preset) {
                        setCropWidth(preset.width)
                        setCropHeight(preset.height)
                      }
                    }
                  }}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CROP_PRESETS.map((preset) => (
                        <SelectItem key={preset.name} value={preset.name}>
                          {preset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {cropPreset === 'Custom' && (
                  <div className="space-y-3">
                    <div>
                      <Label>Width (px)</Label>
                      <Input
                        type="number"
                        value={customWidth}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0
                          setCustomWidth(val)
                          setCropWidth(val)
                        }}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Height (px)</Label>
                      <Input
                        type="number"
                        value={customHeight}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0
                          setCustomHeight(val)
                          setCropHeight(val)
                        }}
                        className="mt-2"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="aspect-ratio"
                    checked={maintainAspectRatio}
                    onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="aspect-ratio" className="text-sm cursor-pointer">
                    Lock aspect ratio
                  </Label>
                </div>

                {isCropping && (
                  <div className={`p-3 rounded-lg space-y-1 ${isPhotoMode ? 'bg-green-50 dark:bg-green-950' : 'bg-blue-50 dark:bg-blue-950'}`}>
                    <p className={`text-xs font-medium ${isPhotoMode ? 'text-green-900 dark:text-green-100' : 'text-blue-900 dark:text-blue-100'}`}>
                      {isPhotoMode ? "📸 Photo Mode — Crop locked" : "✂️ Crop Box Mode"}
                    </p>
                    {isPhotoMode ? (
                      <>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          • Drag the photo to reposition it
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          • Drag corner handles to resize photo
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          • Scroll to zoom photo in/out
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          • Double-click to go back to crop mode
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          • Double-click inside crop to adjust photo
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          • Drag to move crop box
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          • Drag corners/edges to resize crop box
                        </p>
                      </>
                    )}
                  </div>
                )}

                <div className="pt-4 space-y-2">
                  {!isCropping ? (
                    <Button onClick={startCropping} className="w-full">
                      <Crop className="h-4 w-4 mr-2" />
                      Start Cropping
                    </Button>
                  ) : (
                    <>
                      <Button onClick={applyCrop} className="w-full">
                        <Crop className="h-4 w-4 mr-2" />
                        Apply Crop
                      </Button>
                      <Button 
                        onClick={() => {
                          setIsCropping(false)
                          setIsPhotoMode(false)
                          setPhotoX(0)
                          setPhotoY(0)
                          setPhotoScale(1)
                          setCropX(0)
                          setCropY(0)
                        }} 
                        variant="outline" 
                        className="w-full"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="resize" className="space-y-4">
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Current Size</p>
                  <p className="text-sm text-muted-foreground">
                    {image.width} × {image.height} pixels
                  </p>
                </div>

                <div>
                  <Label>New Width (px)</Label>
                  <Input
                    type="number"
                    value={resizeWidth}
                    onChange={(e) => handleResizeWidthChange(parseInt(e.target.value) || 0)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>New Height (px)</Label>
                  <Input
                    type="number"
                    value={resizeHeight}
                    onChange={(e) => handleResizeHeightChange(parseInt(e.target.value) || 0)}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="resize-aspect"
                    checked={maintainResizeAspect}
                    onChange={(e) => setMaintainResizeAspect(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="resize-aspect" className="text-sm cursor-pointer">
                    Maintain aspect ratio
                  </Label>
                </div>

                <div className="space-y-2 pt-2">
                  <Button
                    onClick={() => {
                      handleResizeWidthChange(Math.round(image.width * 0.5))
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    50% Size
                  </Button>
                  <Button
                    onClick={() => {
                      handleResizeWidthChange(Math.round(image.width * 2))
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    200% Size
                  </Button>
                </div>

                <Button onClick={applyResize} className="w-full">
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Apply Resize
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="effects" className="space-y-3">
              <Button
                onClick={() => applyPreset('vivid')}
                variant="outline"
                className="w-full justify-start"
              >
                <Sun className="h-4 w-4 mr-2" />
                Vivid
              </Button>
              <Button
                onClick={() => applyPreset('bw')}
                variant="outline"
                className="w-full justify-start"
              >
                <Contrast className="h-4 w-4 mr-2" />
                Black & White
              </Button>
              <Button
                onClick={() => applyPreset('vintage')}
                variant="outline"
                className="w-full justify-start"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Vintage
              </Button>
              <Button
                onClick={() => applyPreset('cool')}
                variant="outline"
                className="w-full justify-start"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Cool Tone
              </Button>
              <Button
                onClick={() => applyPreset('warm')}
                variant="outline"
                className="w-full justify-start"
              >
                <Sun className="h-4 w-4 mr-2" />
                Warm Tone
              </Button>
              <Button
                onClick={() => applyPreset('reset')}
                variant="outline"
                className="w-full justify-start"
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Original
              </Button>
            </TabsContent>
          </Tabs>
        </Card>
      )}

      {/* Print Dialog */}
      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Print Layout</DialogTitle>
            <DialogDescription>
              Configure your print layout with multiple copies on A4 paper (210 x 297 mm)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Number of Copies</Label>
              <Input
                type="number"
                min="1"
                max="50"
                value={printCopies}
                onChange={(e) => setPrintCopies(parseInt(e.target.value) || 1)}
              />
              <p className="text-xs text-muted-foreground">
                Maximum 50 copies per sheet
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Spacing Between Images (px)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={printSpacing}
                onChange={(e) => setPrintSpacing(parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Standard spacing is 10px
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Preview Layout</p>
              <p className="text-sm text-muted-foreground">
                {Math.ceil(Math.sqrt(printCopies))} columns × {Math.ceil(printCopies / Math.ceil(Math.sqrt(printCopies)))} rows
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPrintDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePrintDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download Print Layout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </>
  )
}
