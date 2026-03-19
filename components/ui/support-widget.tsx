"use client"

import { MessageCircle, Phone, HelpCircle } from "lucide-react"
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
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" className="h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 transition-all hover:scale-105">
            <HelpCircle className="h-7 w-7" />
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
