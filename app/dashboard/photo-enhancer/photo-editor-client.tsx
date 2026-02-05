'use client'

import React from "react"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, Download, RotateCw, Crop, Contrast, Sun, ImageIcon } from 'lucide-react'

interface PhotoEditorClientProps {
  shopId: string
}

export function PhotoEditorClient({ shopId }: PhotoEditorClientProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [rotation, setRotation] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          setImage(img)
          setBrightness(100)
          setContrast(100)
          setSaturation(100)
          setRotation(0)
        }
        img.src = event.target?.result as string
      }
      reader.readAsDataURL(file)
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
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
      
      // Draw image
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
      ctx.restore()
    }
  }, [image, brightness, contrast, saturation, rotation])

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a')
      link.download = `edited-image-${Date.now()}.png`
      link.href = canvasRef.current.toDataURL()
      link.click()
    }
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
      default:
        setBrightness(100)
        setContrast(100)
        setSaturation(100)
    }
  }

  return (
    <div className="flex h-full gap-6">
      {/* Editor Canvas */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
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
              <Button onClick={handleDownload} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </div>

        <Card className="flex-1 flex items-center justify-center bg-muted/30 overflow-hidden">
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
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-full object-contain"
            />
          )}
        </Card>
      </div>

      {/* Controls Panel */}
      {image && (
        <Card className="w-80 p-6">
          <Tabs defaultValue="adjust" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="adjust">Adjust</TabsTrigger>
              <TabsTrigger value="presets">Presets</TabsTrigger>
            </TabsList>

            <TabsContent value="adjust" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <Label>Brightness</Label>
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
                  <Label>Contrast</Label>
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
                  <Label>Saturation</Label>
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

              <div className="pt-4 border-t space-y-2">
                <Button onClick={handleRotate} variant="outline" className="w-full bg-transparent">
                  <RotateCw className="h-4 w-4 mr-2" />
                  Rotate 90°
                </Button>
                <Button
                  onClick={() => {
                    setBrightness(100)
                    setContrast(100)
                    setSaturation(100)
                    setRotation(0)
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Reset All
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="presets" className="space-y-3">
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
                <ImageIcon className="h-4 w-4 mr-2" />
                Cool Tone
              </Button>
              <Button
                onClick={() => applyPreset('reset')}
                variant="outline"
                className="w-full justify-start"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Original
              </Button>
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  )
}
