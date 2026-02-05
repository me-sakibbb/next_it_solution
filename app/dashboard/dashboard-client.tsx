'use client'

import { ImageIcon, FileUser, Store } from 'lucide-react'
import { FeatureCard } from '@/components/dashboard/feature-card'

interface DashboardClientProps {
    totalRevenue: number
    activeProducts: number
    activeStaff: number
    salesCount: number
    shopName: string
    productsTotal: number
    staffTotal: number
    userEmail: string | undefined
}

export function DashboardClient({
    totalRevenue,
    activeProducts,
    activeStaff,
    salesCount,
    shopName,
    productsTotal,
    staffTotal,
    userEmail,
}: DashboardClientProps) {
    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="space-y-2 text-center">
                <h1 className="text-5xl font-bold tracking-tight text-foreground">
                    Welcome to Next AI Solution
                </h1>
                <p className="text-xl text-muted-foreground">
                    Choose a service to get started
                </p>
            </div>

            {/* Main Feature Cards - Only 3 Options */}
            <div className="grid gap-8 md:grid-cols-3 mt-12">
                {/* Photo Optimizer */}
                <FeatureCard
                    title="Photo Optimizer"
                    description="Transform your images with AI-powered enhancement. Adjust lighting, remove backgrounds, and apply professional filters instantly."
                    icon={ImageIcon}
                    href="/dashboard/photo-enhancer"
                    gradient="var(--gradient-photo)"
                    stats={[
                        { label: 'Enhancement Types', value: '10+' },
                        { label: 'Quick Processing', value: '<5s' },
                    ]}
                />

                {/* AI CV Builder */}
                <FeatureCard
                    title="AI CV Builder"
                    description="Create professional resumes with AI assistance. Choose from multiple templates, get content suggestions, and export to PDF."
                    icon={FileUser}
                    href="/dashboard/cv-builder"
                    gradient="var(--gradient-cv)"
                    stats={[
                        { label: 'Templates', value: '15+' },
                        { label: 'AI Suggestions', value: 'Smart' },
                    ]}
                />

                {/* Shop Management */}
                <FeatureCard
                    title="Shop Management"
                    description="Manage your entire business operations. Track sales, inventory, staff, payroll, and generate comprehensive reports."
                    icon={Store}
                    href="/dashboard/shop"
                    gradient="var(--gradient-inventory)"
                    stats={[
                        { label: 'Total Revenue', value: `$${totalRevenue.toFixed(0)}` },
                        { label: 'Active Products', value: activeProducts },
                        { label: 'Sales', value: salesCount },
                        { label: 'Staff', value: activeStaff },
                    ]}
                />
            </div>

            {/* Welcome Tips */}
            <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 to-primary/10 p-6 mt-12">
                <h3 className="text-lg font-semibold mb-3 text-foreground">
                    💡 Getting Started
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>Use <strong>Photo Optimizer</strong> to enhance and transform your images with AI</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>Build professional CVs with the <strong>AI CV Builder</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>Manage all business operations from <strong>Shop Management</strong></span>
                    </li>
                </ul>
            </div>
        </div>
    )
}
