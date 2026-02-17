
'use client'

import { ImageIcon, FileUser, Store, Type, ShoppingBag } from 'lucide-react'
import { ServiceCard } from '@/components/dashboard/service-card'
import { AccountOverview } from '@/components/dashboard/account-overview'
import { RecentOrdersWidget } from '@/components/dashboard/recent-orders-widget'
import { ServiceOrder } from '@/lib/types'

interface DashboardClientProps {
    totalRevenue: number
    activeProducts: number
    activeStaff: number
    salesCount: number
    shopName: string
    productsTotal: number
    staffTotal: number
    userEmail: string | undefined
    user: any
    profile: any
    orders: ServiceOrder[]
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
    user,
    profile,
    orders
}: DashboardClientProps) {

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">

            {/* Account Overview Section */}
            <section>
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground">Manage your account, services, and activity.</p>
                </div>
                <AccountOverview user={{ email: userEmail, id: user?.id }} profile={profile} />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Services Section - Spans 2 columns on large screens */}
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight mb-4">Your Services</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ServiceCard
                                title="Photo Optimizer"
                                description="AI-powered image enhancement. Adjust lighting, remove backgrounds, and more."
                                icon={ImageIcon}
                                href="/dashboard/photo-enhancer"
                                colorClass="bg-purple-500/10 text-purple-600"
                                iconColorClass="text-purple-600"
                            />
                            <ServiceCard
                                title="AI CV Builder"
                                description="Create professional resumes with AI assistance and templates."
                                icon={FileUser}
                                href="/dashboard/cv-builder"
                                colorClass="bg-blue-500/10 text-blue-600"
                                iconColorClass="text-blue-600"
                            />
                            <ServiceCard
                                title="Shop Management"
                                description="Complete business operations: sales, inventory, staff, and reports."
                                icon={Store}
                                href="/dashboard/shop"
                                colorClass="bg-emerald-500/10 text-emerald-600"
                                iconColorClass="text-emerald-600"
                            />
                            <ServiceCard
                                title="Form Autofill AI"
                                description="Automate form filling with intelligent AI suggestions."
                                icon={Type}
                                href="#"
                                colorClass="bg-orange-500/10 text-orange-600"
                                iconColorClass="text-orange-600"
                                disabled={true}
                            />
                            <ServiceCard
                                title="Order Premium Services"
                                description="Boost your business with our professional services."
                                icon={ShoppingBag}
                                href="/dashboard/services"
                                colorClass="bg-pink-500/10 text-pink-600"
                                iconColorClass="text-pink-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Recent Orders Section - Spans 1 column */}
                <div className="lg:col-span-1">
                    <h2 className="text-xl font-semibold tracking-tight mb-4">Recent Orders</h2>
                    <RecentOrdersWidget orders={orders || []} />
                </div>
            </div>
        </div>
    )
}

