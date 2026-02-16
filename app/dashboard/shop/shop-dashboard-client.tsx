'use client'

import Link from 'next/link'
import {
    DollarSign,
    Package,
    Users,
    ShoppingCart,
    TrendingUp,
    Activity,
    ClipboardList,
    AlertTriangle,
    ArrowRight
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

interface ShopDashboardClientProps {
    totalRevenue: number
    salesRevenue: number
    tasksRevenue: number
    activeProducts: number
    lowStockProducts: number
    activeStaff: number
    salesCount: number
    activeTasksCount: number
    shopName: string
    productsTotal: number
    staffTotal: number
    userEmail: string | undefined
    recentSales: any[]
    pendingTasks: any[]
    currency: string
}

export function ShopDashboardClient({
    totalRevenue,
    salesRevenue,
    tasksRevenue,
    activeProducts,
    lowStockProducts,
    activeStaff,
    salesCount,
    activeTasksCount,
    shopName,
    productsTotal,
    staffTotal,
    recentSales,
    pendingTasks,
    currency
}: ShopDashboardClientProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD',
        }).format(amount)
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{shopName}</h1>
                    <p className="text-muted-foreground">
                        Overview of your business performance
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/dashboard/shop/sales">
                        <Button>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            New Sale
                        </Button>
                    </Link>
                    <Link href="/dashboard/shop/tasks">
                        <Button variant="secondary">
                            <ClipboardList className="mr-2 h-4 w-4" />
                            New Task
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Hero Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-primary">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Revenue
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            <span className="text-green-600 font-medium">
                                +{formatCurrency(salesRevenue)}
                            </span> sales
                            <span className="mx-1">•</span>
                            <span className="text-blue-600 font-medium">
                                +{formatCurrency(tasksRevenue)}
                            </span> tasks
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Tasks
                        </CardTitle>
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeTasksCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Pending completion
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Sales
                        </CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{salesCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Lifetime transactions
                        </p>
                    </CardContent>
                </Card>

                <Card className={lowStockProducts > 0 ? "border-l-4 border-l-destructive" : "border-l-4 border-l-orange-500"}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Low Stock Alerts
                        </CardTitle>
                        <AlertTriangle className={`h-4 w-4 ${lowStockProducts > 0 ? "text-destructive" : "text-muted-foreground"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${lowStockProducts > 0 ? "text-destructive" : ""}`}>
                            {lowStockProducts}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Products need restocking
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">
                {/* Left Column: Recent Activity & Quick Actions (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Recent Sales */}
                    <Card className="h-[400px] flex flex-col">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Recent Sales</CardTitle>
                                    <CardDescription>Latest transactions from your shop</CardDescription>
                                </div>
                                <Link href="/dashboard/shop/sales">
                                    <Button variant="ghost" size="sm" className="gap-1">
                                        View All <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-hidden">
                            <ScrollArea className="h-full pr-4">
                                {recentSales.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentSales.map((sale) => (
                                            <div key={sale.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium leading-none">
                                                        {sale.customer?.name || 'Walk-in Customer'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {format(new Date(sale.created_at), 'MMM d, h:mm a')} • {sale.sale_items?.length || 0} items
                                                    </p>
                                                </div>
                                                <div className="font-medium">
                                                    {formatCurrency(sale.total_amount)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                                        No recent sales found
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* Quick Links Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <Link href="/dashboard/shop/inventory" className="block">
                            <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                                <CardContent className="flex flex-col items-center justify-center p-6 gap-2 text-center">
                                    <Package className="h-6 w-6 text-primary" />
                                    <span className="text-sm font-medium">Inventory</span>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/dashboard/shop/customers" className="block">
                            <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                                <CardContent className="flex flex-col items-center justify-center p-6 gap-2 text-center">
                                    <Users className="h-6 w-6 text-primary" />
                                    <span className="text-sm font-medium">Customers</span>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/dashboard/shop/staff" className="block">
                            <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                                <CardContent className="flex flex-col items-center justify-center p-6 gap-2 text-center">
                                    <Users className="h-6 w-6 text-primary" />
                                    <span className="text-sm font-medium">Staff</span>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/dashboard/shop/reports" className="block">
                            <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                                <CardContent className="flex flex-col items-center justify-center p-6 gap-2 text-center">
                                    <TrendingUp className="h-6 w-6 text-primary" />
                                    <span className="text-sm font-medium">Reports</span>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </div>

                {/* Right Column: Pending Tasks & Staff (3 cols) */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Pending Tasks */}
                    <Card className="h-[400px] flex flex-col">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Pending Tasks</CardTitle>
                                    <CardDescription>Work that needs attention</CardDescription>
                                </div>
                                <Link href="/dashboard/shop/tasks">
                                    <Button variant="ghost" size="sm" className="gap-1">
                                        View All <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-hidden">
                            <ScrollArea className="h-full pr-4">
                                {pendingTasks.length > 0 ? (
                                    <div className="space-y-4">
                                        {pendingTasks.map((task) => (
                                            <div key={task.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium leading-none">
                                                        {task.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                                        {task.description || 'No description'}
                                                    </p>
                                                    {task.due_date && (
                                                        <Badge variant="outline" className="text-[10px] h-5">
                                                            Due {format(new Date(task.due_date), 'MMM d')}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="font-medium text-blue-600">
                                                    {formatCurrency(task.price)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                                        <ClipboardList className="h-8 w-8 text-muted-foreground/30" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">No pending tasks</p>
                                            <p className="text-xs text-muted-foreground">Create a task to track service or repair jobs</p>
                                        </div>
                                        <Link href="/dashboard/shop/tasks">
                                            <Button variant="outline" size="sm">Create Task</Button>
                                        </Link>
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* Staff Stats Card */}
                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium">Staff Overview</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold">{activeStaff}</div>
                                    <p className="text-xs text-muted-foreground">Active Members</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-semibold text-muted-foreground">{staffTotal}</div>
                                    <p className="text-xs text-muted-foreground">Total Registered</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
