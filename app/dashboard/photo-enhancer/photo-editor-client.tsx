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
import { Upload, Download, RotateCw, RotateCcw, Crop, Contrast, Sun, ImageIcon, Scissors, Printer, Maximize2, Sparkles, Palette, ZoomIn, ZoomOut, Eraser, Check, Undo2, X } from 'lucide-react'
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

interface HistorySnapshot {
  imageSrc: string
  brightness: number
  contrast: number
  saturation: number
  rotation: number
  blur: number
  bgRemoved: boolean
  bgColor: string
  eraseDataUrl: string | null
}

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
  // Enhancement state
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [enhanceProgress, setEnhanceProgress] = useState(0)
  const [originalBeforeEnhance, setOriginalBeforeEnhance] = useState<HTMLImageElement | null>(null)
  const [enhancedPreview, setEnhancedPreview] = useState<string | null>(null)
  const [showEnhanceComparison, setShowEnhanceComparison] = useState(false)
  // Ref mirror so that handleUndo can synchronously read the latest comparison state
  const showEnhanceComparisonRef = useRef(false)
  useEffect(() => { showEnhanceComparisonRef.current = showEnhanceComparison }, [showEnhanceComparison])

  // Download/Print dialog state
  const [showPrintDialog, setShowPrintDialog] = useState(false)
  const [printCopies, setPrintCopies] = useState(6)
  const [printSpacing, setPrintSpacing] = useState(10)

  // Undo history stack
  const [history, setHistory] = useState<HistorySnapshot[]>([])
  const canUndo = history.length > 0

  const eraseCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const pushHistory = useCallback(() => {
    setHistory(prev => {
      if (!image) return prev
      const snapshot: HistorySnapshot = {
        imageSrc: image.src,
        brightness,
        contrast,
        saturation,
        rotation,
        blur,
        bgRemoved,
        bgColor,
        eraseDataUrl: eraseCanvasRef.current ? eraseCanvasRef.current.toDataURL() : null,
      }
      return [...prev, snapshot]
    })
  }, [image, brightness, contrast, saturation, rotation, blur, bgRemoved, bgColor])

  const handleUndo = useCallback(() => {
    // If enhance comparison is showing, the first undo press dismisses it
    if (showEnhanceComparisonRef.current) {
      setShowEnhanceComparison(false)
      setEnhancedPreview(null)
      setOriginalBeforeEnhance(null)
      filterDirtyRef.current = true
      // Re-trigger Fit to Screen so the canvas shows up properly
      setTimeout(() => {
        handleFitToScreen()
      }, 50)
      toast({ title: 'Undo', description: 'Enhancement discarded' })
      return
    }

    setHistory(prev => {
      if (prev.length === 0) return prev
      const next = [...prev]
      const snapshot = next.pop()!

      const img = new Image()
      img.onload = () => {
        setImage(img)
        setBrightness(snapshot.brightness)
        setContrast(snapshot.contrast)
        setSaturation(snapshot.saturation)
        setRotation(snapshot.rotation)
        setBlur(snapshot.blur)
        setBgRemoved(snapshot.bgRemoved)
        setBgColor(snapshot.bgColor)
        setIsCropping(false)
        setIsPhotoMode(false)
        filterDirtyRef.current = true

        if (snapshot.eraseDataUrl) {
          const off = document.createElement('canvas')
          const eImg = new Image()
          eImg.onload = () => {
            off.width = eImg.width
            off.height = eImg.height
            const octx = off.getContext('2d')
            octx?.drawImage(eImg, 0, 0)
            eraseCanvasRef.current = off
          }
          eImg.src = snapshot.eraseDataUrl
        } else {
          eraseCanvasRef.current = null
        }

        toast({ title: 'Undo', description: 'Step undone' })
      }
      img.src = snapshot.imageSrc

      return next
    })
  }, [toast])
  // Ref to capture state snapshot just before a slider drag begins
  const sliderPreDragSnapshot = useRef<HistorySnapshot | null>(null)

  const handleSliderPointerDown = useCallback(() => {
    if (!image) return
    sliderPreDragSnapshot.current = {
      imageSrc: image.src,
      brightness,
      contrast,
      saturation,
      rotation,
      blur,
      bgRemoved,
      bgColor,
      eraseDataUrl: eraseCanvasRef.current ? eraseCanvasRef.current.toDataURL() : null,
    }
  }, [image, brightness, contrast, saturation, rotation, blur, bgRemoved, bgColor])

  const handleSliderCommit = useCallback(() => {
    if (!sliderPreDragSnapshot.current) return
    const snapshot = sliderPreDragSnapshot.current
    sliderPreDragSnapshot.current = null
    setHistory(prev => [...prev, snapshot])
  }, [])

  const handleFitToScreen = useCallback(() => {
    if (!image || !viewportRef.current) return
    const vp = viewportRef.current
    const padding = 40
    const availableWidth = vp.clientWidth - padding
    const availableHeight = vp.clientHeight - padding

    // Current baseScale logic fits to maxWidth/maxHeight.
    // If we set viewZoom to 1.0, it should already fit if baseScale is working correctly.
    setViewZoom(1.0)
  }, [image])

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
          setHistory([])

          // Fit image to screen after a short delay to allow viewport to measure correctly
          setTimeout(() => {
            handleFitToScreen()
          }, 100)
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
      // Push history once at the start of an erase stroke
      if (!eraseCanvasRef.current) {
        pushHistory()
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

    pushHistory()

    const croppedCanvas = document.createElement('canvas')
    croppedCanvas.width = cropWidth
    croppedCanvas.height = cropHeight
    const ctx = croppedCanvas.getContext('2d')

    if (ctx) {
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
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

  // Keyboard shortcuts for cropping + Ctrl+Z global undo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global Ctrl+Z / Cmd+Z undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
        return
      }

      if (!isCropping) return

      if (e.key === 'Enter') {
        e.preventDefault()
        applyCrop()
      } else if (e.key === 'Escape') {
        setIsCropping(false)
        setIsPhotoMode(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isCropping, applyCrop, handleUndo])

  const applyResize = () => {
    if (!image) return

    pushHistory()

    const resizedCanvas = document.createElement('canvas')
    resizedCanvas.width = resizeWidth
    resizedCanvas.height = resizeHeight
    const ctx = resizedCanvas.getContext('2d')

    if (ctx) {
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
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

    pushHistory()
    setIsRemovingBg(true)
    setBgProgress(1)

    try {
      // 1. Lazy load the processing library
      const { removeBackground: removeBg } = await import('@imgly/background-removal')

      // 2. High-Speed Client Correction: 
      // We downscale to 512px for the AI model. This is the "sweet spot" 
      // where inference takes < 3s on most devices but mask quality remains high.
      const INFERENCE_SIZE = 512
      const scale = Math.min(1, INFERENCE_SIZE / Math.max(image.width, image.height))
      const downW = Math.round(image.width * scale)
      const downH = Math.round(image.height * scale)

      const downCanvas = document.createElement('canvas')
      downCanvas.width = downW
      downCanvas.height = downH
      const downCtx = downCanvas.getContext('2d')!
      downCtx.drawImage(image, 0, 0, downW, downH)

      const downBlob = await new Promise<Blob>(resolve =>
        downCanvas.toBlob(b => resolve(b!), 'image/png')
      )

      // 3. Auto-detect best compute device
      const hasWebGPU = 'gpu' in navigator

      // 4. Run AI locally on user machine
      const result = await removeBg(downBlob, {
        model: hasWebGPU ? 'isnet_fp16' : 'isnet_quint8',
        device: hasWebGPU ? 'gpu' : 'cpu',
        proxyToWorker: true,
        publicPath: "https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/",
        progress: (key, current, total) => {
          if (total > 0) setBgProgress(Math.round((current / total) * 100))
        },
        output: { format: 'image/png', quality: 0.8 },
      })

      // 5. High-Res Mask Application
      // We take the alpha-mask generated at 512px and apply it back to 
      // the full-resolution original image for a professional finish.
      const maskUrl = URL.createObjectURL(result)
      const maskImg = new Image()

      maskImg.onload = () => {
        const resultCanvas = document.createElement('canvas')
        resultCanvas.width = image.width
        resultCanvas.height = image.height
        const rctx = resultCanvas.getContext('2d')!

        rctx.drawImage(image, 0, 0) // Draw original high-res
        rctx.globalCompositeOperation = 'destination-in'
        rctx.drawImage(maskImg, 0, 0, image.width, image.height) // Apply mask

        const finalUrl = resultCanvas.toDataURL('image/png')
        const finalImg = new Image()
        finalImg.onload = () => {
          setImage(finalImg)
          setBgRemoved(true)
          setBgColor('#06b6d4') // Default Sky Blue
          setIsRemovingBg(false)
          setBgProgress(0)
          setTimeout(() => handleFitToScreen(), 50)
          toast({ title: 'Success', description: 'Background removed in record time' })
          URL.revokeObjectURL(maskUrl)
        }
        finalImg.src = finalUrl
      }
      maskImg.src = maskUrl

    } catch (error: any) {
      console.error('Background removal error:', error)
      setIsRemovingBg(false)
      setBgProgress(0)
      toast({
        title: 'Error',
        description: 'Local processing failed. Ensure your browser is up to date.',
        variant: 'destructive',
      })
    }
  }

  const enhanceImage = async () => {
    if (!image || !canvasRef.current) return

    setIsEnhancing(true)
    setEnhanceProgress(10)

    try {
      // Convert current image to base64 data URL
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(image, 0, 0)
      const dataUrl = canvas.toDataURL('image/png')

      setEnhanceProgress(20)

      // Send to sharp API route for server-side enhancement
      const response = await fetch('/api/enhance-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl }),
      })

      setEnhanceProgress(70)

      if (!response.ok) {
        throw new Error(`Enhancement failed: ${response.statusText}`)
      }

      // Get the enhanced image back as base64 data URL
      const data = await response.json()
      const enhancedUrl = data.image

      setEnhanceProgress(90)

      // Store original + enhanced for before/after comparison
      setOriginalBeforeEnhance(image)
      setEnhancedPreview(enhancedUrl)
      setShowEnhanceComparison(true)
      setIsEnhancing(false)
      setEnhanceProgress(0)
    } catch (error) {
      console.error('Enhancement error:', error)
      setIsEnhancing(false)
      setEnhanceProgress(0)
      toast({
        title: "Enhancement Error",
        description: "Failed to enhance image. Please try again.",
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

    octx.imageSmoothingEnabled = true
    octx.imageSmoothingQuality = 'high'

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

    // Scale canvas to fit viewport while maintaining aspect ratio
    let maxWidth = 1200
    let maxHeight = 800

    if (viewportRef.current) {
      maxWidth = viewportRef.current.clientWidth - 40 // 20px padding
      maxHeight = viewportRef.current.clientHeight - 40
    }

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

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

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
      ctx.fillText(`${Math.round(cw)} Ã— ${Math.round(ch)}px`, cx + 10, cy + 25)
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
    if (!image) return

    // 1. Get the high-resolution filtered image (filters + rotation + erase)
    // buildFilteredCanvas already creates a canvas with image.width/height
    const filtered = buildFilteredCanvas()
    if (!filtered) return

    // 2. Create an export canvas at exact original resolution
    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = image.width
    exportCanvas.height = image.height
    const ctx = exportCanvas.getContext('2d')
    if (!ctx) return

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // 3. Draw background layer if needed
    if (bgRemoved && bgColor !== 'transparent') {
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height)
    }

    // 4. Draw the actual filtered high-res image
    ctx.drawImage(filtered, 0, 0)

    // 5. Trigger download
    const link = document.createElement('a')
    link.download = `photo-studio-export-${Date.now()}.png`
    link.href = exportCanvas.toDataURL('image/png', 1.0)
    link.click()

    toast({
      title: "Success",
      description: `High-resolution image (${exportCanvas.width}x${exportCanvas.height}) downloaded`,
    })
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
    pushHistory()
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
    <div
      className="rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col"
      style={{ height: '85vh' }}
    >
      {/*  STUDIO HEADER BAR  */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b bg-background shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <ImageIcon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight">Photo Studio</h1>
            <p className="text-xs text-muted-foreground">
              {image ? `${image.width} x ${image.height}px` : 'Upload a photo to begin'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-3.5 w-3.5 mr-1.5" />Upload
          </Button>
          {originalImage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                pushHistory()
                setImage(originalImage)
                setBrightness(100)
                setContrast(100)
                setSaturation(100)
                setBlur(0)
                setRotation(0)
                setBgRemoved(false)
                setBgColor('transparent')
                eraseCanvasRef.current = null
                filterDirtyRef.current = true
                setShowEnhanceComparison(false)
                setEnhancedPreview(null)
                setOriginalBeforeEnhance(null)
                toast({ title: 'Restored', description: 'Reverted to original image' })
              }}
              title="Restore exact original image"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />Restore Original
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
            <Undo2 className="h-3.5 w-3.5 mr-1.5" />Undo
            {canUndo && (
              <span className="ml-1.5 text-[10px] bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {history.length}
              </span>
            )}
          </Button>
          <Button
            size="sm"
            className="gap-1.5 font-semibold"
            style={{ backgroundColor: '#7c3aed' }}
            onClick={() => setShowPrintDialog(true)}
          >
            <Printer className="h-3.5 w-3.5" />Print Sheet
          </Button>
          <Button size="sm" className="gap-1.5 font-semibold bg-green-600 hover:bg-green-700" onClick={handleDownload}>
            <Download className="h-3.5 w-3.5" />Download PNG
          </Button>
        </div>
      </div>

      {/*  3-COLUMN BODY  */}
      <div className="flex flex-1 min-h-0">

        {/*  COLUMN 1: TOOLS + FILTERS  */}
        <div className="w-60 shrink-0 border-r bg-background flex flex-col overflow-y-auto">

          {/* Tool buttons */}
          <div className="p-4 border-b">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Tools</p>
            <div className="flex flex-col gap-2">

              {/* Crop  full width toggle */}
              <Button
                variant={isCropping ? 'default' : 'outline'}
                className="h-11 text-sm justify-start gap-2.5 w-full"
                onClick={isCropping ? applyCrop : startCropping}
              >
                <Crop className="h-4 w-4" />
                {isCropping ? 'Apply Crop' : 'Crop'}
              </Button>

              {/* Crop controls  inline when cropping */}
              {isCropping && (
                <div className="space-y-2 pt-1">
                  <Select value={cropPreset} onValueChange={(value) => { setCropPreset(value); if (value !== 'Custom') { const p = CROP_PRESETS.find(p => p.name === value); if (p) { setCropWidth(p.width); setCropHeight(p.height) } } }}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Crop preset" /></SelectTrigger>
                    <SelectContent>{CROP_PRESETS.map(p => <SelectItem key={p.name} value={p.name} className="text-xs">{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                  {cropPreset === 'Custom' && (
                    <div className="grid grid-cols-2 gap-1.5">
                      <div><Label className="text-xs">W</Label><Input type="number" value={customWidth} onChange={(e) => { const v = parseInt(e.target.value) || 0; setCustomWidth(v); setCropWidth(v) }} className="h-8 mt-0.5 text-xs" /></div>
                      <div><Label className="text-xs">H</Label><Input type="number" value={customHeight} onChange={(e) => { const v = parseInt(e.target.value) || 0; setCustomHeight(v); setCropHeight(v) }} className="h-8 mt-0.5 text-xs" /></div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="ar" checked={maintainAspectRatio} onChange={e => setMaintainAspectRatio(e.target.checked)} className="w-3.5 h-3.5 accent-primary" />
                    <Label htmlFor="ar" className="text-xs cursor-pointer">Lock ratio</Label>
                  </div>
                  <Button variant="outline" size="sm" className="w-full h-8 text-xs border-destructive/40 text-destructive" onClick={() => { setIsCropping(false); setIsPhotoMode(false) }}>
                    <X className="h-3.5 w-3.5 mr-1.5" />Cancel Crop
                  </Button>
                </div>
              )}

              {/* 2-col tool grid */}
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-14 text-xs flex flex-col gap-1 py-2" disabled={isEnhancing} onClick={enhanceImage}>
                  <Sparkles className={`h-5 w-5 ${isEnhancing ? 'animate-spin' : ''}`} />
                  <span>{isEnhancing ? `${enhanceProgress}%` : 'Enhance'}</span>
                </Button>

                <Button
                  variant={bgRemoved ? 'secondary' : 'default'}
                  className="h-14 text-xs flex flex-col gap-1 py-2 relative overflow-hidden"
                  disabled={isRemovingBg || bgRemoved}
                  onClick={removeBackground}
                >
                  <div className="relative z-10 flex flex-col items-center gap-1">
                    <Scissors className="h-5 w-5" />
                    <span>{isRemovingBg ? `${bgProgress}%` : bgRemoved ? 'Removed' : 'Remove BG'}</span>
                  </div>
                  {isRemovingBg && <div className="absolute left-0 top-0 bottom-0 bg-primary-foreground/20 transition-all" style={{ width: `${bgProgress}%` }} />}
                </Button>

                <Button
                  variant={isErasing ? 'default' : 'outline'}
                  className="h-14 text-xs flex flex-col gap-1 py-2"
                  disabled={!bgRemoved}
                  onClick={() => { setIsErasing(!isErasing); if (isCropping) setIsCropping(false) }}
                >
                  <Eraser className="h-5 w-5" />
                  <span>{isErasing ? 'Erasing' : 'Erase'}</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-14 text-xs flex flex-col gap-1 py-2"
                  disabled={!bgRemoved}
                  onClick={() => { if (originalImage) { pushHistory(); setImage(originalImage); setBgRemoved(false); setBgColor('transparent'); eraseCanvasRef.current = null; filterDirtyRef.current = true; setIsErasing(false); toast({ title: 'BG Restored' }) } }}
                >
                  <RotateCcw className="h-5 w-5" />
                  <span>Restore BG</span>
                </Button>

                <Button variant="outline" className="h-14 text-xs flex flex-col gap-1 py-2" onClick={() => { pushHistory(); handleRotate() }}>
                  <RotateCw className="h-5 w-5" />
                  <span>Rotate 90</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-14 text-xs flex flex-col gap-1 py-2 relative"
                  disabled={!canUndo}
                  onClick={handleUndo}
                >
                  <Undo2 className="h-5 w-5" />
                  <span>Undo</span>
                  {canUndo && <span className="absolute top-1 right-1 text-[9px] bg-primary text-primary-foreground rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">{history.length}</span>}
                </Button>
              </div>

              {/* Erase brush size  contextual */}
              {isErasing && (
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-semibold">Brush Size</Label>
                    <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full">{brushSize}px</span>
                  </div>
                  <Slider value={[brushSize]} onValueChange={([v]) => setBrushSize(v)} min={5} max={100} step={1} />
                  <div className="flex gap-1.5">
                    {[15, 30, 60].map(s => (
                      <Button key={s} variant="ghost" size="sm" className={`flex-1 h-7 text-xs ${brushSize === s ? 'bg-primary/20 text-primary font-bold' : ''}`} onClick={() => setBrushSize(s)}>
                        {s === 15 ? 'S' : s === 30 ? 'M' : 'L'}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 flex-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Filters</p>
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm flex items-center gap-2"><Sun className="h-3.5 w-3.5 text-amber-500" />Brightness</Label>
                  <span className="text-xs font-mono">{brightness}%</span>
                </div>
                <Slider value={[brightness]} onValueChange={(v) => { if (!sliderPreDragSnapshot.current && image) handleSliderPointerDown(); setBrightness(v[0]) }} onValueCommit={handleSliderCommit} min={0} max={200} step={1} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm flex items-center gap-2"><Contrast className="h-3.5 w-3.5 text-blue-500" />Contrast</Label>
                  <span className="text-xs font-mono">{contrast}%</span>
                </div>
                <Slider value={[contrast]} onValueChange={(v) => { if (!sliderPreDragSnapshot.current && image) handleSliderPointerDown(); setContrast(v[0]) }} onValueCommit={handleSliderCommit} min={0} max={200} step={1} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm flex items-center gap-2"><Palette className="h-3.5 w-3.5 text-pink-500" />Saturation</Label>
                  <span className="text-xs font-mono">{saturation}%</span>
                </div>
                <Slider value={[saturation]} onValueChange={(v) => { if (!sliderPreDragSnapshot.current && image) handleSliderPointerDown(); setSaturation(v[0]) }} onValueCommit={handleSliderCommit} min={0} max={200} step={1} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Blur</Label>
                  <span className="text-xs font-mono">{blur}px</span>
                </div>
                <Slider value={[blur]} onValueChange={(v) => { if (!sliderPreDragSnapshot.current && image) handleSliderPointerDown(); setBlur(v[0]) }} onValueCommit={handleSliderCommit} min={0} max={20} step={0.5} />
              </div>
            </div>
          </div>

          {/* Apply / Reset */}
          <div className="p-4 border-t grid grid-cols-2 gap-2">
            <Button className="h-11" onClick={() => { filterDirtyRef.current = true; drawCanvas() }} disabled={!image}>Apply</Button>
            <Button variant="outline" className="h-11" onClick={() => { if (image) { pushHistory(); setBrightness(100); setContrast(100); setSaturation(100); setBlur(0); setRotation(0) } }} disabled={!image}>Reset</Button>
          </div>
        </div>

        {/*  COLUMN 2: CANVAS  */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 relative bg-muted/10">
          <div
            ref={viewportRef}
            className="absolute inset-0 flex items-center justify-center overflow-auto"
            style={{ cursor: isPanning ? 'grabbing' : (!isCropping && !isErasing ? 'grab' : 'default') }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            {!image ? (
              <div className="flex flex-col items-center gap-6 text-center select-none cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                <div className="w-36 h-36 rounded-3xl bg-primary/10 group-hover:bg-primary/15 border-2 border-dashed border-primary/30 group-hover:border-primary/60 flex items-center justify-center transition-all">
                  <Upload className="h-14 w-14 text-primary/50 group-hover:text-primary/70 transition-colors" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Upload Image</p>
                  <p className="text-base text-muted-foreground mt-1">Or just drop image here</p>
                </div>
              </div>
            ) : showEnhanceComparison && enhancedPreview && originalBeforeEnhance ? (
              <div className="flex flex-col w-full h-full p-6 gap-4">
                <div className="flex-1 flex items-stretch gap-4 min-h-0">
                  <div className="flex-1 min-w-0">
                    <div className="relative rounded-xl overflow-hidden border-2 border-border shadow-lg h-full bg-black/5">
                      <div className="absolute top-3 left-3 bg-black/70 text-white text-[10px] sm:text-xs px-3 py-1 rounded-full font-bold z-10 uppercase tracking-wider">Before</div>
                      <img src={originalBeforeEnhance.src} alt="Before" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="relative rounded-xl overflow-hidden border-2 border-primary shadow-lg h-full bg-black/5">
                      <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] sm:text-xs px-3 py-1 rounded-full font-bold z-10 uppercase tracking-wider">After</div>
                      <img src={enhancedPreview} alt="After" className="w-full h-full object-contain" />
                    </div>
                  </div>
                </div>
                {/* Embedded Actions */}
                <div className="flex items-center justify-center gap-6 py-4 px-6 bg-background/50 border-t backdrop-blur-sm rounded-b-xl">
                  <div className="flex flex-col items-center gap-1.5 min-w-[120px]">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Keep original</p>
                    <Button
                      variant="outline"
                      className="h-12 px-8 border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50 transition-all font-bold"
                      onClick={() => {
                        if (originalBeforeEnhance) {
                          setImage(originalBeforeEnhance)
                        }
                        setShowEnhanceComparison(false)
                        setEnhancedPreview(null)
                        setOriginalBeforeEnhance(null)
                        filterDirtyRef.current = true
                        setTimeout(() => handleFitToScreen(), 50)
                        toast({ title: 'Discarded', description: 'Kept current edited photo' })
                      }}
                    >
                      <X className="h-5 w-5 mr-2" />
                      Reject Result
                    </Button>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 min-w-[120px]">
                    <p className="text-[10px] font-bold text-primary uppercase">Apply improvement</p>
                    <Button
                      className="h-12 px-12 bg-green-600 hover:bg-green-700 shadow-xl shadow-green-600/30 transition-all font-bold text-white border-0"
                      onClick={() => {
                        pushHistory()
                        const img = new window.Image()
                        img.onload = () => {
                          setImage(img)
                          setShowEnhanceComparison(false)
                          setEnhancedPreview(null)
                          setOriginalBeforeEnhance(null)
                          filterDirtyRef.current = true
                          setTimeout(() => handleFitToScreen(), 100)
                          toast({ title: 'Applied', description: 'Image enhanced successfully' })
                        }
                        img.src = enhancedPreview!
                      }}
                    >
                      <Check className="h-5 w-5 mr-2" />
                      Accept Result
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative inline-block">
                <canvas
                  ref={canvasRef}
                  className={`shadow-2xl bg-white border border-border/30 max-w-none ${isErasing ? '' : (isCropping ? 'cursor-crosshair' : 'cursor-grab')}`}
                  style={{ cursor: isErasing ? 'none' : undefined }}
                  onDoubleClick={handleDoubleClick}
                />
                {isCropping && (
                  <div className={`absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg animate-bounce ${isPhotoMode ? 'bg-green-500' : 'bg-primary'}`}>
                    {isPhotoMode ? 'IMAGE MODE  Double-click to exit' : 'CROP MODE  Drag handles'}
                  </div>
                )}
                {isErasing && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg animate-pulse bg-red-500">
                    ERASE  {brushSize}px brush
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Zoom pill */}
          {image && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 bg-background/90 backdrop-blur-md border border-border/50 shadow-xl rounded-full z-10">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setViewZoom(prev => Math.max(0.2, Math.round((prev - 0.2) * 10) / 10))}><ZoomOut className="h-3.5 w-3.5" /></Button>
              <span className="text-sm font-bold min-w-[52px] text-center cursor-pointer hover:text-primary" onClick={() => setViewZoom(1)}>{Math.round(viewZoom * 100)}%</span>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setViewZoom(prev => Math.min(3.0, Math.round((prev + 0.2) * 10) / 10))}><ZoomIn className="h-3.5 w-3.5" /></Button>
            </div>
          )}
        </div>

        {/*  COLUMN 3: RIGHT PANEL  */}
        <div className="w-60 shrink-0 border-l bg-background flex flex-col overflow-y-auto">

          {/* Image Tray */}
          <div className="p-4 border-b">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Image Tray</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-24 rounded-xl border-2 border-dashed border-primary/40 hover:border-primary hover:bg-primary/5 flex flex-col items-center justify-center gap-2 transition-all group"
            >
              <Upload className="h-8 w-8 text-primary/60 group-hover:text-primary transition-colors" />
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">Upload Photo</span>
            </button>
          </div>

          {/* Presets */}
          <div className="p-4 border-b">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Presets</p>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'vivid', label: 'Vivid' },
                { id: 'bw', label: 'B&W' },
                { id: 'vintage', label: 'Vintage' },
                { id: 'cool', label: 'Cool' },
                { id: 'warm', label: 'Warm' },
                { id: 'reset', label: 'Original' },
              ].map(p => (
                <button key={p.id} onClick={() => applyPreset(p.id)} className="h-10 rounded-lg border border-border bg-muted/30 hover:bg-primary/10 hover:border-primary/50 text-xs font-semibold transition-all">
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Background Colors */}
          <div className="p-4 border-b">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Background Color</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { color: 'transparent', label: 'None' },
                { color: '#ffffff', label: 'White' },
                { color: '#e5e7eb', label: 'Gray' },
                { color: '#000000', label: 'Black' },
                { color: '#06b6d4', label: 'Cyan' },
                { color: '#3b82f6', label: 'Blue' },
                { color: '#f59e0b', label: 'Amber' },
                { color: '#10b981', label: 'Green' },
              ].map(b => (
                <button
                  key={b.color}
                  onClick={() => { pushHistory(); setBgColor(b.color) }}
                  title={b.label}
                  className={`w-11 h-11 rounded-xl transition-all hover:scale-110 ${bgColor === b.color ? 'ring-2 ring-primary ring-offset-2 scale-110' : ''} ${b.color === 'transparent' ? 'bg-white border-2 border-dashed border-muted-foreground/40' : ''}`}
                  style={b.color !== 'transparent' ? { backgroundColor: b.color, boxShadow: '0 1px 4px rgba(0,0,0,0.2)' } : {}}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Input
                type="color"
                value={bgColor === 'transparent' ? '#ffffff' : bgColor}
                onFocus={handleSliderPointerDown}
                onChange={(e) => { if (sliderPreDragSnapshot.current) handleSliderCommit(); setBgColor(e.target.value) }}
                className="h-9 w-12 p-0.5 cursor-pointer"
              />
              <span className="text-xs text-muted-foreground">{bgColor === 'transparent' ? 'Transparent' : bgColor}</span>
            </div>
          </div>

          {/* Resize */}
          {image && (
            <div className="p-4 border-b space-y-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Resize</p>
              <div className="p-2.5 bg-muted/50 rounded-lg text-xs font-mono text-center text-muted-foreground">{image.width} x {image.height} px</div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Width</Label><Input type="number" value={resizeWidth} onChange={e => handleResizeWidthChange(parseInt(e.target.value) || 0)} className="h-9 mt-1 text-sm" /></div>
                <div><Label className="text-xs">Height</Label><Input type="number" value={resizeHeight} onChange={e => handleResizeHeightChange(parseInt(e.target.value) || 0)} className="h-9 mt-1 text-sm" /></div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="resize-aspect" checked={maintainResizeAspect} onChange={e => setMaintainResizeAspect(e.target.checked)} className="w-3.5 h-3.5 accent-primary" />
                <Label htmlFor="resize-aspect" className="text-xs cursor-pointer">Lock aspect ratio</Label>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 h-9" onClick={() => handleResizeWidthChange(Math.round(image.width * 0.5))}>50%</Button>
                <Button variant="outline" size="sm" className="flex-1 h-9" onClick={() => handleResizeWidthChange(Math.round(image.width * 2))}>200%</Button>
              </div>
              <Button className="w-full h-10" onClick={applyResize}><Maximize2 className="h-4 w-4 mr-2" />Apply Resize</Button>
            </div>
          )}

          <div className="flex-1" />
        </div>
      </div>

      {/* Print Dialog */}
      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Print Layout</DialogTitle>
            <DialogDescription>Configure multiple copies on A4 paper (210 x 297 mm)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Number of Copies</Label>
              <Input type="number" min="1" max="50" value={printCopies} onChange={(e) => setPrintCopies(parseInt(e.target.value) || 1)} />
            </div>
            <div className="space-y-2">
              <Label>Spacing (px)</Label>
              <Input type="number" min="0" max="100" value={printSpacing} onChange={(e) => setPrintSpacing(parseInt(e.target.value) || 0)} />
            </div>
            <div className="p-4 bg-muted rounded-lg text-sm">
              Layout: {Math.ceil(Math.sqrt(printCopies))} cols x {Math.ceil(printCopies / Math.ceil(Math.sqrt(printCopies)))} rows
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPrintDialog(false)}>Cancel</Button>
            <Button onClick={handlePrintDownload}><Download className="h-4 w-4 mr-2" />Download PDF</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
