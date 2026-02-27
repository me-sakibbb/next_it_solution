'use client'

import Link from 'next/link'
import { LucideIcon, ArrowUpRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ServiceCardProps {
    title: string
    description: string
    icon: LucideIcon
    href: string
    colorClass?: string
    iconColorClass?: string
    disabled?: boolean
    price?: number | string
    onClick?: () => void
}

export function ServiceCard({
    title,
    description,
    icon: Icon,
    href,
    colorClass = "bg-primary/5 hover:bg-primary/10",
    iconColorClass = "text-primary",
    disabled = false,
    price,
    onClick
}: ServiceCardProps) {
    const formatPrice = (p: number | string) => {
        if (typeof p === 'string') return p
        return `৳${p.toLocaleString()}`
    }
    const Content = (
        <Card className={cn(
            "h-full transition-all duration-300 border-border/50 hover:shadow-md hover:border-primary/20 group relative overflow-hidden",
            disabled && "opacity-60 cursor-not-allowed"
        )}>
            <CardContent className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                    <div className={cn("p-3 rounded-xl transition-colors", colorClass)}>
                        <Icon className={cn("w-6 h-6", iconColorClass)} />
                    </div>
                    {!disabled && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300">
                            <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                    )}
                </div>

                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-grow">
                    {description}
                </p>

                {price && (
                    <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">মূল্য:</span>
                        <span className="text-lg font-bold text-primary">{formatPrice(price)}</span>
                    </div>
                )}

                {disabled && (
                    <div className="mt-4 pt-3 border-t border-border/50">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">শীঘ্রই আসছে</span>
                    </div>
                )}
            </CardContent>

            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </Card>
    )

    if (disabled) {
        return <div className="block h-full">{Content}</div>
    }

    if (onClick) {
        return (
            <button
                onClick={onClick}
                className="block w-full text-left h-full focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-xl"
            >
                {Content}
            </button>
        )
    }

    return (
        <Link href={href} className="block h-full focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-xl">
            {Content}
        </Link>
    )
}
