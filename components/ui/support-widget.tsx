"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function SupportWidget() {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const ref = useRef<HTMLDivElement>(null)
  const hasDragged = useRef(false)
  const startX = useRef(0)
  const startY = useRef(0)
  const initX = useRef(0)
  const initY = useRef(0)
  const rectWidth = useRef(0)
  const rectHeight = useRef(0)
  
  const ignoreRadixOpen = useRef(false)
  const wasOpenRef = useRef(false)

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return // Only drag on left click

    ignoreRadixOpen.current = true

    const element = ref.current
    if (!element) return

    hasDragged.current = false
    setIsDragging(true)
    
    wasOpenRef.current = isOpen
    if (isOpen) {
      setIsOpen(false)
    }

    const rect = element.getBoundingClientRect()
    
    // Use the current rendered coordinates to initialize start position
    const currentX = position ? position.x : rect.left
    const currentY = position ? position.y : rect.top

    startX.current = e.clientX
    startY.current = e.clientY
    initX.current = currentX
    initY.current = currentY
    rectWidth.current = rect.width
    rectHeight.current = rect.height

    // Prevent text selection on body while dragging
    document.body.style.userSelect = "none"
    document.body.style.webkitUserSelect = "none"

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX.current
      const dy = moveEvent.clientY - startY.current

      if (Math.hypot(dx, dy) > 5) {
        hasDragged.current = true
      }

      const newX = initX.current + dx
      const newY = initY.current + dy

      // Constraints to keep element in viewport
      const padding = 16
      const minX = padding
      const maxX = window.innerWidth - rectWidth.current - padding
      const minY = padding
      const maxY = window.innerHeight - rectHeight.current - padding

      const constrainedX = Math.max(minX, Math.min(maxX, newX))
      const constrainedY = Math.max(minY, Math.min(maxY, newY))

      setPosition({ x: constrainedX, y: constrainedY })
    }

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
      window.removeEventListener("pointercancel", handlePointerUp)
      
      // Restore text selection
      document.body.style.userSelect = ""
      document.body.style.webkitUserSelect = ""
      
      setIsDragging(false)
      
      setTimeout(() => {
        ignoreRadixOpen.current = false
      }, 50)
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
    window.addEventListener("pointercancel", handlePointerUp)
  }

  // Ensure body style cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.userSelect = ""
      document.body.style.webkitUserSelect = ""
    }
  }, [])

  return (
    <div
      ref={ref}
      onPointerDown={handlePointerDown}
      onDragStart={(e) => e.preventDefault()}
      draggable={false}
      style={{
        left: position ? `${position.x}px` : undefined,
        top: position ? `${position.y}px` : undefined,
        bottom: position ? "auto" : undefined,
        right: position ? "auto" : undefined,
        touchAction: "none",
      }}
      className={`fixed bottom-6 right-6 z-[9999] select-none ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      <DropdownMenu open={isOpen} onOpenChange={(open) => {
        if (open && ignoreRadixOpen.current) return
        setIsOpen(open)
      }}>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            onClick={(e) => {
              if (hasDragged.current) {
                e.preventDefault()
                return
              }
              if (wasOpenRef.current) {
                wasOpenRef.current = false
                return
              }
              setIsOpen(true)
            }}
            className="h-16 w-16 rounded-full shadow-xl bg-primary hover:bg-primary/90 transition-all hover:scale-110 animate-ring-glow group"
          >
            <Phone className="size-8 animate-wiggle" />
            <span className="sr-only">Support</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 p-2 shadow-xl border-border/50">
          <DropdownMenuLabel className="text-base font-semibold">Contact Support</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="p-3 mb-1 mt-1 cursor-pointer hover:bg-muted/50 transition-colors">
            <a href="https://wa.me/8801866873470" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium">WhatsApp</span>
                <span className="text-xs text-muted-foreground">+8801866873470</span>
              </div>
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <a href="tel:09638876754" className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium">Call Us</span>
                <span className="text-xs text-muted-foreground">09638876754</span>
              </div>
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
