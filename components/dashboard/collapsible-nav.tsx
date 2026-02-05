'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SubMenuItem {
    name: string
    href: string
    icon: LucideIcon
}

interface CollapsibleNavProps {
    name: string
    icon: LucideIcon
    subItems: SubMenuItem[]
}

export function CollapsibleNav({ name, icon: Icon, subItems }: CollapsibleNavProps) {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(() => {
        // Check if any sub-item is active
        return subItems.some(item => pathname.startsWith(item.href))
    })

    const isAnySubItemActive = subItems.some(
        item => pathname === item.href || pathname.startsWith(`${item.href}/`)
    )

    return (
        <div className="space-y-1">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isAnySubItemActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
            >
                <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    {name}
                </div>
                <ChevronDown
                    className={cn(
                        'h-4 w-4 transition-transform duration-200',
                        isOpen && 'rotate-180'
                    )}
                />
            </button>

            <div
                className={cn(
                    'overflow-hidden transition-all duration-300 ease-in-out',
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                )}
            >
                <div className="ml-4 space-y-1 border-l border-border/50 pl-4 py-1 animate-slide-down">
                    {subItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
