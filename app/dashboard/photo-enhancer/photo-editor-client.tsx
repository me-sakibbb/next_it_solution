'use client'

import React from "react"

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Upload, Download, RotateCw, Crop, Contrast, Sun, ImageIcon, Scissors, Printer, Maximize2, Sparkles, Palette, ZoomIn, ZoomOut, Eraser } from 'lucide-react'
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
  // Performance: refs for values that change at high frequency during drag
  const cropRef = useRef({ x: 0, y: 0, w: 600, h: 600 })
  const photoRef = useRef({ x: 0, y: 0, scale: 1 })
  const rafRef = useRef<number>(0)
  const filteredCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const filterDirtyRef = useRef(true)
  const displayScaleRef = useRef({ x: 1, y: 1 }) // scale from original to display canvas
  const viewportRef = useRef<HTMLDivElement>(null)
  const canvasMousePosRef = useRef({ x: 0, y: 0 })

  // Panning state
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 })

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
  const [bgProgress, setBgProgress] = useState(0)
  const [bgColor, setBgColor] = useState('transparent')

  // View and Erase state
  const [viewZoom, setViewZoom] = useState(1.0)
  const [isErasing, setIsErasing] = useState(false)
  const [brushSize, setBrushSize] = useState(30)

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
          setBgColor('transparent')
          setResizeWidth(img.width)
          setResizeHeight(img.height)
          const preset = getCropDimensions()
          setCropWidth(preset.width)
          setCropHeight(preset.height)
          eraseCanvasRef.current = null
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
    const cr = cropRef.current
    const ds = displayScaleRef.current

    // Convert crop coordinates to display canvas space
    const handles = [
      { name: 'tl' as ResizeHandle, x: cr.x * ds.x, y: cr.y * ds.y },
      { name: 'tr' as ResizeHandle, x: (cr.x + cr.w) * ds.x, y: cr.y * ds.y },
      { name: 'bl' as ResizeHandle, x: cr.x * ds.x, y: (cr.y + cr.h) * ds.y },
      { name: 'br' as ResizeHandle, x: (cr.x + cr.w) * ds.x, y: (cr.y + cr.h) * ds.y },
      { name: 'tm' as ResizeHandle, x: (cr.x + cr.w / 2) * ds.x, y: cr.y * ds.y },
      { name: 'bm' as ResizeHandle, x: (cr.x + cr.w / 2) * ds.x, y: (cr.y + cr.h) * ds.y },
      { name: 'ml' as ResizeHandle, x: cr.x * ds.x, y: (cr.y + cr.h / 2) * ds.y },
      { name: 'mr' as ResizeHandle, x: (cr.x + cr.w) * ds.x, y: (cr.y + cr.h / 2) * ds.y },
    ]

    for (const handle of handles) {
      const distance = Math.sqrt(Math.pow(x - handle.x, 2) + Math.pow(y - handle.y, 2))
      if (distance < handleSize) {
        return handle.name
      }
    }

    // Check if inside crop box (convert x,y to original image space)
    const origX = x / ds.x
    const origY = y / ds.y
    if (origX >= cr.x && origX <= cr.x + cr.w && origY >= cr.y && origY <= cr.y + cr.h) {
      return 'move' as ResizeHandle
    }

    return null
  }

  // Get the photo's bounding rect in canvas coordinates (accounting for photoX/Y/Scale)
  const getPhotoBounds = () => {
    if (!image) return { x: 0, y: 0, w: 0, h: 0 }
    const pr = photoRef.current
    const ds = displayScaleRef.current
    return {
      x: pr.x * ds.x,
      y: pr.y * ds.y,
      w: image.width * pr.scale * ds.x,
      h: image.height * pr.scale * ds.y,
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

  const eraseCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current || !image) return
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    if (isErasing) {
      setIsDragging(true)
      // Initialize erasure canvas with current image
      if (!eraseCanvasRef.current) {
        const off = document.createElement('canvas')
        off.width = image.width
        off.height = image.height
        const octx = off.getContext('2d')
        octx?.drawImage(image, 0, 0)
        eraseCanvasRef.current = off
      }
      performErase(x, y)
      return
    }

    if (!isCropping) {
      // Start viewport panning if not cropping or erasing
      if (viewportRef.current) {
        setIsPanning(true)
        setPanStart({
          x: e.clientX,
          y: e.clientY,
          scrollLeft: viewportRef.current.scrollLeft,
          scrollTop: viewportRef.current.scrollTop
        })
        canvas.style.cursor = 'grabbing'
      }
      return
    }

    const ds = displayScaleRef.current

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
        // Store offset in display space
        setDragStart({ x: x - photoRef.current.x * ds.x, y: y - photoRef.current.y * ds.y })
        canvas.style.cursor = 'grabbing'
      }
    } else {
      // Crop box mode: move/resize the crop box
      const handle = getHandleAtPosition(x, y)
      if (handle === 'move') {
        setIsDragging(true)
        // Store offset in display space
        setDragStart({ x: x - cropRef.current.x * ds.x, y: y - cropRef.current.y * ds.y })
      } else if (handle) {
        setIsResizing(true)
        setActiveHandle(handle)
        setDragStart({ x, y })
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current || !image) return
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    const ds = displayScaleRef.current

    if (isErasing) {
      canvasMousePosRef.current = { x, y }
      if (isDragging) {
        performErase(x, y)
      } else {
        scheduleRender() // For brush preview
      }
      return
    }

    if (isPanning && viewportRef.current) {
      const dx = e.clientX - panStart.x
      const dy = e.clientY - panStart.y
      viewportRef.current.scrollLeft = panStart.scrollLeft - dx
      viewportRef.current.scrollTop = panStart.scrollTop - dy
      return
    }

    if (!isCropping || (!isDragging && !isResizing)) {
      if (isErasing) canvas.style.cursor = 'none'
      else if (isCropping) {
        if (isPhotoMode) {
          const handle = getPhotoHandleAtPosition(x, y)
          if (handle && handle !== 'move') canvas.style.cursor = 'nwse-resize'
          else if (handle === 'move') canvas.style.cursor = 'grab'
          else canvas.style.cursor = 'default'
        } else {
          const handle = getHandleAtPosition(x, y)
          if (handle === 'move') canvas.style.cursor = 'move'
          else if (handle) canvas.style.cursor = 'nwse-resize'
          else canvas.style.cursor = 'default'
        }
      } else {
        canvas.style.cursor = 'default'
      }
    }

    if (!isCropping) return

    if (isPhotoMode) {
      if (isDragging) {
        // Move the photo - convert to original image space
        photoRef.current.x = (x - dragStart.x) / ds.x
        photoRef.current.y = (y - dragStart.y) / ds.y
        scheduleRender()
      } else if (isResizing && photoResizeHandle) {
        const pr = photoRef.current
        const b = { x: pr.x * ds.x, y: pr.y * ds.y, w: image.width * pr.scale * ds.x, h: image.height * pr.scale * ds.y }
        const aspect = image.width / image.height

        let newX = pr.x
        let newY = pr.y
        let newW = b.w

        switch (photoResizeHandle) {
          case 'br': {
            newW = Math.max(50, x - b.x)
            break
          }
          case 'bl': {
            newW = Math.max(50, (b.x + b.w) - x)
            newX = ((b.x + b.w) - newW) / ds.x
            break
          }
          case 'tr': {
            newW = Math.max(50, x - b.x)
            const newH = newW / aspect
            newY = ((b.y + b.h) - newH) / ds.y
            break
          }
          case 'tl': {
            newW = Math.max(50, (b.x + b.w) - x)
            const newH = newW / aspect
            newX = ((b.x + b.w) - newW) / ds.x
            newY = ((b.y + b.h) - newH) / ds.y
            break
          }
        }

        photoRef.current.x = newX
        photoRef.current.y = newY
        photoRef.current.scale = newW / (image.width * ds.x)
        scheduleRender()
      } else {
        // Cursor feedback only (no render needed)
        const handle = getPhotoHandleAtPosition(x, y)
        if (handle === 'tl' || handle === 'br') canvas.style.cursor = 'nwse-resize'
        else if (handle === 'tr' || handle === 'bl') canvas.style.cursor = 'nesw-resize'
        else if (handle === 'move') canvas.style.cursor = 'grab'
        else canvas.style.cursor = 'default'
      }
    } else if (isCropping) {
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
        const cr = cropRef.current
        // Convert to original image space
        const newX = Math.max(0, Math.min((x - dragStart.x) / ds.x, image.width - cr.w))
        const newY = Math.max(0, Math.min((y - dragStart.y) / ds.y, image.height - cr.h))
        cr.x = newX
        cr.y = newY
        scheduleRender()
      } else if (isResizing && activeHandle) {
        const dx = x - dragStart.x
        const dy = y - dragStart.y
        const cr = cropRef.current
        const aspectRatio = cr.w / cr.h

        let newX = cr.x
        let newY = cr.y
        let newWidth = cr.w
        let newHeight = cr.h

        switch (activeHandle) {
          case 'br':
            newWidth = Math.max(50, cr.w + dx / ds.x)
            newHeight = maintainAspectRatio ? newWidth / aspectRatio : Math.max(50, cr.h + dy / ds.y)
            break
          case 'bl':
            newWidth = Math.max(50, cr.w - dx / ds.x)
            newHeight = maintainAspectRatio ? newWidth / aspectRatio : Math.max(50, cr.h + dy / ds.y)
            newX = cr.x + (cr.w - newWidth)
            break
          case 'tr':
            newWidth = Math.max(50, cr.w + dx / ds.x)
            newHeight = maintainAspectRatio ? newWidth / aspectRatio : Math.max(50, cr.h - dy / ds.y)
            newY = cr.y + (cr.h - newHeight)
            break
          case 'tl':
            newWidth = Math.max(50, cr.w - dx / ds.x)
            newHeight = maintainAspectRatio ? newWidth / aspectRatio : Math.max(50, cr.h - dy / ds.y)
            newX = cr.x + (cr.w - newWidth)
            newY = cr.y + (cr.h - newHeight)
            break
          case 'mr':
            newWidth = Math.max(50, cr.w + dx / ds.x)
            if (maintainAspectRatio) newHeight = newWidth / aspectRatio
            break
          case 'ml':
            newWidth = Math.max(50, cr.w - dx / ds.x)
            newX = cr.x + (cr.w - newWidth)
            if (maintainAspectRatio) newHeight = newWidth / aspectRatio
            break
          case 'bm':
            newHeight = Math.max(50, cr.h + dy / ds.y)
            if (maintainAspectRatio) newWidth = newHeight * aspectRatio
            break
          case 'tm':
            newHeight = Math.max(50, cr.h - dy / ds.y)
            newY = cr.y + (cr.h - newHeight)
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

        cr.x = newX
        cr.y = newY
        cr.w = newWidth
        cr.h = newHeight
        setDragStart({ x, y })
        scheduleRender()
      }
    }
  }

  const handleMouseUp = () => {
    if (isErasing && isDragging && eraseCanvasRef.current) {
      const img = new Image()
      img.onload = () => {
        setImage(img)
        setIsDragging(false)
        filterDirtyRef.current = true
        scheduleRender()
      }
      img.src = eraseCanvasRef.current.toDataURL()
    }

    // Sync refs back to state on mouse up (triggers one final proper render)
    if (isDragging || isResizing) {
      setCropX(cropRef.current.x)
      setCropY(cropRef.current.y)
      setCropWidth(cropRef.current.w)
      setCropHeight(cropRef.current.h)
      setPhotoX(photoRef.current.x)
      setPhotoY(photoRef.current.y)
      setPhotoScale(photoRef.current.scale)
    }
    setIsDragging(false)
    setIsResizing(false)
    setIsPanning(false)
    setActiveHandle(null)
    setPhotoResizeHandle(null)
    if (canvasRef.current) {
      if (isErasing) canvasRef.current.style.cursor = 'none'
      else if (isCropping) canvasRef.current.style.cursor = 'move'
      else canvasRef.current.style.cursor = 'grab'
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (!image) return

    if (isCropping && isPhotoMode) {
      e.preventDefault()
      const pr = photoRef.current
      const cr = cropRef.current
      const delta = e.deltaY > 0 ? -0.03 : 0.03
      const newScale = Math.max(0.1, Math.min(5, pr.scale + delta))

      const cropCenterX = cr.x + cr.w / 2
      const cropCenterY = cr.y + cr.h / 2
      const oldW = image.width * pr.scale
      const oldH = image.height * pr.scale
      const newW = image.width * newScale
      const newH = image.height * newScale

      pr.x = pr.x - (newW - oldW) * ((cropCenterX - pr.x) / oldW)
      pr.y = pr.y - (newH - oldH) * ((cropCenterY - pr.y) / oldH)
      pr.scale = newScale
      scheduleRender()

      // Debounce state sync for wheel
      setPhotoX(pr.x)
      setPhotoY(pr.y)
      setPhotoScale(pr.scale)
    }
    // Global wheel zoom removed per request
  }

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCropping || !canvasRef.current || !image) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    const ds = displayScaleRef.current

    if (isPhotoMode) {
      // Double-click to go back to crop box mode
      setIsPhotoMode(false)
    } else {
      // Double-click inside crop to enter photo mode
      const cr = cropRef.current
      // Convert x, y to original image space for hit test
      const origX = x / ds.x
      const origY = y / ds.y
      if (origX >= cr.x && origX <= cr.x + cr.w && origY >= cr.y && origY <= cr.y + cr.h) {
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
    setIsErasing(false)
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

  const performErase = (x: number, y: number) => {
    if (!eraseCanvasRef.current || !image) return
    const off = eraseCanvasRef.current
    const octx = off.getContext('2d')
    if (!octx) return

    const ds = displayScaleRef.current
    const imgX = x / ds.x
    const imgY = y / ds.y

    octx.save()
    octx.globalCompositeOperation = 'destination-out'
    octx.beginPath()
    octx.arc(imgX, imgY, brushSize / 2, 0, Math.PI * 2)
    octx.fill()
    octx.restore()

    filterDirtyRef.current = true
    scheduleRender()
  }

  // Keyboard shortcuts for cropping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isCropping) return

      if (e.key === 'Enter') {
        e.preventDefault()
        applyCrop()
      } else if (e.key === 'Escape') {
        setIsCropping(false)
        setIsPhotoMode(false)
      }
    }

    if (isCropping) {
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isCropping, applyCrop])

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
    setBgProgress(1)
    try {
      // Revert to @imgly/background-removal for free local processing
      const { removeBackground: removeBg } = await import('@imgly/background-removal')

      // Check for WebGPU support for faster processing
      const hasWebGPU = 'gpu' in navigator;

      const blob = await (await fetch(image.src)).blob()

      const result = await removeBg(blob, {
        // use isnet_fp16 for GPU as it's much faster than quint8 on most GPUs
        // use isnet_quint8 for CPU as it's the smallest download
        model: hasWebGPU ? 'isnet_fp16' : 'isnet_quint8',
        device: hasWebGPU ? 'gpu' : 'cpu',
        proxyToWorker: true,
        publicPath: "https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/",
        progress: (key, current, total) => {
          if (total > 0) {
            setBgProgress(Math.round((current / total) * 100))
          }
        },
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
        setBgProgress(0)
        toast({
          title: "Success",
          description: "Background removed locally using AI",
        })
      }
      img.onerror = () => {
        setIsRemovingBg(false)
        setBgProgress(0)
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
      setBgProgress(0)
      toast({
        title: "Error",
        description: "Local background removal failed. Your browser might not support the required features.",
        variant: "destructive",
      })
    }
  }

  // Build pre-filtered offscreen canvas when filters/rotation change
  useEffect(() => {
    filterDirtyRef.current = true
  }, [image, brightness, contrast, saturation, rotation, blur])

  const buildFilteredCanvas = useCallback(() => {
    if (!image) return null
    const offscreen = document.createElement('canvas')
    offscreen.width = image.width
    offscreen.height = image.height
    const octx = offscreen.getContext('2d')
    if (!octx) return null

    octx.save()
    octx.translate(offscreen.width / 2, offscreen.height / 2)
    octx.rotate((rotation * Math.PI) / 180)
    octx.translate(-offscreen.width / 2, -offscreen.height / 2)

    let filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
    if (blur > 0) filterString += ` blur(${blur}px)`
    octx.filter = filterString

    // Live erase: use eraseCanvas if it exists
    const source = eraseCanvasRef.current || image
    octx.drawImage(source, 0, 0, offscreen.width, offscreen.height)
    octx.restore()

    filteredCanvasRef.current = offscreen
    filterDirtyRef.current = false
    return offscreen
  }, [image, brightness, contrast, saturation, rotation, blur])

  // Fast draw function that uses the pre-filtered canvas
  const drawCanvas = useCallback(() => {
    if (!image || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Scale canvas to fit container (max 1200x800) while maintaining aspect ratio
    const maxWidth = 1200
    const maxHeight = 800
    let baseScale = 1

    if (image.width > maxWidth || image.height > maxHeight) {
      baseScale = Math.min(maxWidth / image.width, maxHeight / image.height)
    }

    let displayWidth = Math.floor(image.width * baseScale * viewZoom)
    let displayHeight = Math.floor(image.height * baseScale * viewZoom)

    // Only resize canvas if dimensions changed
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth
      canvas.height = displayHeight
      filterDirtyRef.current = true
    }

    // Store display scale for mouse coordinate conversion
    displayScaleRef.current = {
      x: displayWidth / image.width,
      y: displayHeight / image.height
    }

    // Rebuild filtered image only when filters changed
    let filtered = filteredCanvasRef.current
    if (filterDirtyRef.current || !filtered) {
      filtered = buildFilteredCanvas()
    }
    if (!filtered) return

    // Calculate scale factor from original image to display canvas
    const scaleX = canvas.width / image.width
    const scaleY = canvas.height / image.height

    const cx = cropRef.current.x * scaleX
    const cy = cropRef.current.y * scaleY
    const cw = cropRef.current.w * scaleX
    const ch = cropRef.current.h * scaleY
    const px = photoRef.current.x * scaleX
    const py = photoRef.current.y * scaleY
    const ps = photoRef.current.scale

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw base image (with optional background layer first)
    if (bgRemoved && bgColor !== 'transparent') {
      ctx.fillStyle = bgColor
      if (isCropping && isPhotoMode) {
        ctx.fillRect(px, py, canvas.width * ps, canvas.height * ps)
      } else {
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }

    if (isCropping && isPhotoMode) {
      ctx.drawImage(filtered, px, py, canvas.width * ps, canvas.height * ps)
    } else {
      ctx.drawImage(filtered, 0, 0, canvas.width, canvas.height)
    }

    // Eraser cursor preview (Rendered BEFORE cropping return to ensure visibility)
    if (isErasing) {
      const { x, y } = canvasMousePosRef.current
      const ds = displayScaleRef.current
      const radiusOnCanvas = (brushSize * ds.x) / 2

      // Only draw if within reasonable bounds (e.g. not 0,0 before move)
      if (x !== 0 || y !== 0) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(x, y, radiusOnCanvas, 0, Math.PI * 2)
        // Double stroke for visibility on any background
        ctx.strokeStyle = 'white'
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
        ctx.fill()
        ctx.restore()
      }
    }

    if (!isCropping) return

    // --- CROP OVERLAY ---
    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Reveal crop area
    ctx.save()
    ctx.beginPath()
    ctx.rect(cx, cy, cw, ch)
    ctx.clip()

    // Fill background only inside crop area if solid color selected
    if (bgRemoved && bgColor !== 'transparent') {
      ctx.fillStyle = bgColor
      if (isPhotoMode) {
        ctx.fillRect(px, py, canvas.width * ps, canvas.height * ps)
      } else {
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }

    if (isPhotoMode) {
      ctx.drawImage(filtered, px, py, canvas.width * ps, canvas.height * ps)
    } else {
      ctx.drawImage(filtered, 0, 0, canvas.width, canvas.height)
    }
    ctx.restore()

    if (isPhotoMode) {
      // Faded full image boundary
      ctx.save()
      ctx.globalAlpha = 0.3
      ctx.drawImage(filtered, px, py, canvas.width * ps, canvas.height * ps)
      ctx.restore()

      // Re-draw crop area at full opacity on top
      ctx.save()
      ctx.beginPath()
      ctx.rect(cx, cy, cw, ch)
      ctx.clip()

      if (bgRemoved && bgColor !== 'transparent') {
        ctx.fillStyle = bgColor
        ctx.fillRect(px, py, canvas.width * ps, canvas.height * ps)
      }
      ctx.drawImage(filtered, px, py, canvas.width * ps, canvas.height * ps)
      ctx.restore()

      // Locked crop border (green dashed)
      ctx.strokeStyle = '#10b981'
      ctx.lineWidth = 3
      ctx.setLineDash([8, 4])
      ctx.strokeRect(cx, cy, cw, ch)
      ctx.setLineDash([])

      // Photo boundary + handles
      const pbw = canvas.width * ps
      const pbh = canvas.height * ps
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 2
      ctx.strokeRect(px, py, pbw, pbh)

      const hs = 14
      const ihs = 8
      const corners = [
        [px, py], [px + pbw, py],
        [px, py + pbh], [px + pbw, py + pbh]
      ]
      for (const [hx, hy] of corners) {
        ctx.fillStyle = '#3b82f6'
        ctx.fillRect(hx - hs / 2, hy - hs / 2, hs, hs)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(hx - ihs / 2, hy - ihs / 2, ihs, ihs)
      }

      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 14px sans-serif'
      ctx.fillText(`${Math.round(ps * 100)}%`, cx + 8, cy - 8)
    } else {
      // CROP BOX MODE border
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 3
      ctx.strokeRect(cx, cy, cw, ch)

      // Grid (rule of thirds)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(cx + cw / 3, cy)
      ctx.lineTo(cx + cw / 3, cy + ch)
      ctx.moveTo(cx + (2 * cw) / 3, cy)
      ctx.lineTo(cx + (2 * cw) / 3, cy + ch)
      ctx.moveTo(cx, cy + ch / 3)
      ctx.lineTo(cx + cw, cy + ch / 3)
      ctx.moveTo(cx, cy + (2 * ch) / 3)
      ctx.lineTo(cx + cw, cy + (2 * ch) / 3)
      ctx.stroke()

      // Handles
      const hs = 12
      ctx.fillStyle = '#3b82f6'
      const handlePositions = [
        [cx, cy], [cx + cw, cy], [cx, cy + ch], [cx + cw, cy + ch],
        [cx + cw / 2, cy], [cx + cw / 2, cy + ch],
        [cx, cy + ch / 2], [cx + cw, cy + ch / 2]
      ]
      for (const [hx, hy] of handlePositions) {
        ctx.fillRect(hx - hs / 2, hy - hs / 2, hs, hs)
      }

      // Dimensions
      ctx.fillStyle = '#3b82f6'
      ctx.font = 'bold 14px sans-serif'
      ctx.fillText(`${Math.round(cw)} × ${Math.round(ch)}px`, cx + 10, cy + 25)
    }
  }, [image, isCropping, isPhotoMode, buildFilteredCanvas, bgRemoved, bgColor, viewZoom, isErasing, brushSize])

  // Schedule a render on next animation frame
  const scheduleRender = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      drawCanvas()
    })
  }, [drawCanvas])

  // Trigger full re-render when non-drag state changes
  useEffect(() => {
    // Sync refs from state (for when state is set outside drag, e.g. preset change)
    cropRef.current = { x: cropX, y: cropY, w: cropWidth, h: cropHeight }
    photoRef.current = { x: photoX, y: photoY, scale: photoScale }
    scheduleRender()
    return () => cancelAnimationFrame(rafRef.current)
  }, [image, brightness, contrast, saturation, rotation, blur, isCropping, cropX, cropY, cropWidth, cropHeight, photoX, photoY, photoScale, isPhotoMode, bgRemoved, bgColor, viewZoom, scheduleRender])

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

          <Card className="flex-1 flex bg-muted/30 overflow-hidden min-h-0 relative group/canvas">
            <div
              ref={viewportRef}
              className="flex-1 overflow-auto p-4 flex items-center justify-center"
              style={{ cursor: isPanning ? 'grabbing' : (!isCropping && !isErasing ? 'grab' : 'default') }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
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
                <div className="relative inline-block mx-auto transition-all duration-200">
                  <canvas
                    ref={canvasRef}
                    className={`shadow-2xl bg-white border border-border/50 max-w-none ${isErasing ? '' : (isCropping ? 'cursor-move' : 'cursor-grab')}`}
                    style={{ cursor: isErasing ? 'none' : undefined }}
                    onDoubleClick={handleDoubleClick}
                  />

                  {isCropping && (
                    <div className={`absolute top-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg animate-bounce ${isPhotoMode ? 'bg-green-500' : 'bg-primary'}`}>
                      {isPhotoMode ? 'IMAGE MODE: Drag/resize photo • Double-click to exit' : 'CROP MODE: Drag handles to adjust crop'}
                    </div>
                  )}

                  {isErasing && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg animate-pulse bg-red-500">
                      ERASE MODE: {brushSize}px brush • Drag to erase
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Viewport Zoom Controls - Always Visible at the Bottom */}
            {image && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-background/90 backdrop-blur-md border border-border/50 shadow-2xl rounded-full z-50 transition-all hover:scale-103">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full hover:bg-primary/10 transition-colors"
                  onClick={() => setViewZoom(prev => Math.max(0.2, Math.round((prev - 0.2) * 10) / 10))}
                  title="Zoom Out"
                >
                  <ZoomOut className="h-5 w-5" />
                </Button>
                <div
                  className="px-3 min-w-[70px] text-center text-sm font-black cursor-pointer hover:text-primary select-none transition-colors"
                  onClick={() => setViewZoom(1.0)}
                  title="Reset to 100%"
                >
                  {Math.round(viewZoom * 100)}%
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full hover:bg-primary/10 transition-colors"
                  onClick={() => setViewZoom(prev => Math.min(3.0, Math.round((prev + 0.2) * 10) / 10))}
                  title="Zoom In"
                >
                  <ZoomIn className="h-5 w-5" />
                </Button>
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

                <div className="pt-4 border-t space-y-3">
                  <Button
                    onClick={removeBackground}
                    variant="default"
                    className="w-full relative overflow-hidden"
                    disabled={isRemovingBg || bgRemoved}
                  >
                    <div className="relative z-10 flex items-center">
                      <Scissors className="h-4 w-4 mr-2" />
                      {isRemovingBg ? `Removing ${bgProgress}%...` : bgRemoved ? 'Background Removed' : 'Remove Background'}
                    </div>
                    {isRemovingBg && (
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-primary-foreground/20 transition-all duration-300"
                        style={{ width: `${bgProgress}%` }}
                      />
                    )}
                  </Button>

                  {bgRemoved && (
                    <div className="space-y-4 p-4 bg-muted/40 rounded-xl border border-primary/20 shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary/40" />

                      <div className="flex items-center justify-between mb-1">
                        <Label className="text-sm font-semibold flex items-center gap-2">
                          <Eraser className="h-4 w-4 text-primary" />
                          Manual Erase Tool
                        </Label>
                        <Button
                          variant={isErasing ? "default" : "outline"}
                          size="sm"
                          className={`h-8 px-3 transition-all ${isErasing ? 'bg-primary shadow-lg scale-105' : 'hover:border-primary/50'}`}
                          onClick={() => {
                            setIsErasing(!isErasing)
                            if (isCropping) setIsCropping(false)
                          }}
                        >
                          {isErasing ? "Tool Active" : "Enable Eraser"}
                        </Button>
                      </div>

                      {isErasing && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                          <p className="text-[11px] text-muted-foreground leading-tight italic">
                            * Click and drag on the photo to manually remove any remaining background parts.
                          </p>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-medium">Brush Size</span>
                              <span className="bg-primary/10 px-2 py-0.5 rounded-full font-bold text-primary">{brushSize}px</span>
                            </div>
                            <Slider
                              value={[brushSize]}
                              onValueChange={([val]) => setBrushSize(val)}
                              min={5}
                              max={100}
                              step={1}
                              className="py-2"
                            />
                            <div className="flex gap-1">
                              {[15, 30, 60].map(size => (
                                <Button
                                  key={size}
                                  variant="ghost"
                                  size="sm"
                                  className={`flex-1 h-7 text-[10px] ${brushSize === size ? 'bg-primary/20 text-primary font-bold' : ''}`}
                                  onClick={() => setBrushSize(size)}
                                >
                                  {size === 15 ? 'Small' : size === 30 ? 'Medium' : 'Large'}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {bgRemoved && (
                    <div className="space-y-2 p-3 bg-muted/40 rounded-lg border">
                      <Label className="text-xs font-medium">Background Color</Label>
                      <div className="flex gap-2 flex-wrap pb-1">
                        <button
                          onClick={() => setBgColor('transparent')}
                          className={`w-6 h-6 rounded-md border-2 ${bgColor === 'transparent' ? 'border-primary scale-110' : 'border-transparent'} bg-[url('/checkers.png')] bg-repeat bg-[length:10px_10px] bg-slate-200 transition-all`}
                          title="Transparent"
                        />
                        <button
                          onClick={() => setBgColor('#ffffff')}
                          className={`w-6 h-6 rounded-md border text-slate-200 shadow-sm transition-all ${bgColor === '#ffffff' ? 'ring-2 ring-primary ring-offset-1 scale-110' : ''}`}
                          style={{ backgroundColor: '#ffffff' }}
                          title="White"
                        />
                        <button
                          onClick={() => setBgColor('#000000')}
                          className={`w-6 h-6 rounded-md shadow-sm transition-all ${bgColor === '#000000' ? 'ring-2 ring-primary ring-offset-1 scale-110' : ''}`}
                          style={{ backgroundColor: '#000000' }}
                          title="Black"
                        />
                        <button
                          onClick={() => setBgColor('#3b82f6')} // blue-500
                          className={`w-6 h-6 rounded-md shadow-sm transition-all ${bgColor === '#3b82f6' ? 'ring-2 ring-primary ring-offset-1 scale-110' : ''}`}
                          style={{ backgroundColor: '#3b82f6' }}
                          title="Blue"
                        />
                        <button
                          onClick={() => setBgColor('#ef4444')} // red-500
                          className={`w-6 h-6 rounded-md shadow-sm transition-all ${bgColor === '#ef4444' ? 'ring-2 ring-primary ring-offset-1 scale-110' : ''}`}
                          style={{ backgroundColor: '#ef4444' }}
                          title="Red"
                        />
                        <button
                          onClick={() => setBgColor('#10b981')} // emerald-500
                          className={`w-6 h-6 rounded-md shadow-sm transition-all ${bgColor === '#10b981' ? 'ring-2 ring-primary ring-offset-1 scale-110' : ''}`}
                          style={{ backgroundColor: '#10b981' }}
                          title="Green"
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="color"
                          value={bgColor === 'transparent' ? '#ffffff' : bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="h-8 w-12 p-1 cursor-pointer"
                        />
                        <span className="text-xs text-muted-foreground mr-auto">{bgColor === 'transparent' ? 'No color' : bgColor}</span>
                      </div>
                    </div>
                  )}

                  {bgRemoved && (
                    <Button
                      onClick={() => {
                        if (originalImage) {
                          setImage(originalImage)
                          setBgRemoved(false)
                          setBgColor('transparent')
                          eraseCanvasRef.current = null
                          toast({
                            title: "Restored",
                            description: "Original image restored",
                          })
                        }
                      }}
                      variant="outline"
                      className="w-full"
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
