'use client'

import Link from 'next/link'
import { 
  DollarSign, 
  Package, 
  Users, 
  ShoppingCart,
  TrendingUp,
  Activity 
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ShopDashboardClientProps {
    totalRevenue: number
    activeProducts: number
    activeStaff: number
    salesCount: number
    shopName: string
    productsTotal: number
    staffTotal: number
    userEmail: string | undefined
}

export function ShopDashboardClient({
    totalRevenue,
    activeProducts,
    activeStaff,
    salesCount,
    shopName,
    productsTotal,
    staffTotal,
}: ShopDashboardClientProps) {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{shopName}</h1>
                <p className="text-muted-foreground">
                    Your shop management dashboard
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Revenue
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            From {salesCount} sales
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Sales
                        </CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{salesCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Total transactions
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Products
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeProducts}</div>
                        <p className="text-xs text-muted-foreground">
                            {activeProducts} active / {productsTotal} total
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Staff
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeStaff}</div>
                        <p className="text-xs text-muted-foreground">
                            {activeStaff} active / {staffTotal} total
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Link href="/dashboard/shop/sales">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">Sales & POS</CardTitle>
                            </div>
                            <CardDescription>
                                Process transactions and manage sales
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/dashboard/shop/inventory">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">Inventory</CardTitle>
                            </div>
                            <CardDescription>
                                Manage products and stock levels
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/dashboard/shop/staff">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">Staff Management</CardTitle>
                            </div>
                            <CardDescription>
                                Manage team members and roles
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/dashboard/shop/payroll">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">Payroll</CardTitle>
                            </div>
                            <CardDescription>
                                Process salaries and manage payroll
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/dashboard/shop/reports">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">Reports</CardTitle>
                            </div>
                            <CardDescription>
                                View analytics and generate reports
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/dashboard/shop/customers">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">Customers</CardTitle>
                            </div>
                            <CardDescription>
                                Manage customer relationships
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                        Your latest business activities
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground text-center py-8">
                        No recent activity to display
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
