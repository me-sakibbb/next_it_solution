'use client'

import Link from 'next/link'
import { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface FeatureCardProps {
    title: string
    description: string
    icon: LucideIcon
    href: string
    gradient: string
    stats?: {
        label: string
        value: string | number
    }[]
}

export function FeatureCard({
    title,
    description,
    icon: Icon,
    href,
    gradient,
    stats,
}: FeatureCardProps) {
    return (
        <Link href={href} className="group block">
            <Card className="feature-card border-2 h-full">
                <div
                    className="feature-card-gradient"
                    style={{ background: gradient }}
                />
                <CardHeader className="feature-card-content">
                    <div className="feature-icon-wrapper inline-flex bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm border border-border/50">
                        <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl mt-4 group-hover:text-primary transition-colors">
                        {title}
                    </CardTitle>
                    <CardDescription className="text-base">
                        {description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="feature-card-content">
                    {stats && stats.length > 0 && (
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {stats.map((stat, index) => (
                                <div key={index} className="space-y-1">
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    <Button
                        variant="outline"
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                    >
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                </CardContent>
            </Card>
        </Link>
    )
}
