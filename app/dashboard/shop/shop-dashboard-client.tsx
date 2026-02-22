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
    ArrowRight,
    Wallet,
    CalendarDays,
    ArrowDownRight,
    ArrowUpRight,
    CreditCard,
    Receipt,
    PlusCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils'

interface ShopDashboardClientProps {
    totalRevenue: number
    todayRevenue: number
    salesRevenue: number
    tasksRevenue: number
    totalExpenses: number
    todayExpenses: number
    netProfit: number
    todayProfit: number
    totalDue: number
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
    recentExpenses: any[]
    lowStockProductsList: any[]
    currency: string
}

export function ShopDashboardClient({
    totalRevenue,
    todayRevenue,
    salesRevenue,
    tasksRevenue,
    totalExpenses,
    todayExpenses,
    netProfit,
    todayProfit,
    totalDue,
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
    recentExpenses,
    lowStockProductsList,
    currency
}: ShopDashboardClientProps) {


    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header / Dynamic Hero Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-primary/5 via-transparent to-transparent p-6 rounded-2xl border border-primary/10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Activity className="w-6 h-6" />
                        </div>
                        {shopName}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        আপনার দোকানের দৈনন্দিন ব্যবসার ওভারভিউ এবং দ্রুত অ্যাকশন প্যানেল
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button asChild size="lg" className="shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
                        <Link href="/dashboard/shop/sales/pos">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            নতুন বিক্রয় (POS)
                        </Link>
                    </Button>
                    <Button asChild size="lg" variant="secondary" className="transition-all hover:scale-[1.02]">
                        <Link href="/dashboard/shop/expenses">
                            <Receipt className="mr-2 h-4 w-4" />
                            খরচ এন্ট্রি
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Quick Links Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {[
                    { title: 'ইনভেন্টরি', icon: Package, href: '/dashboard/shop/inventory', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { title: 'কাস্টমার', icon: Users, href: '/dashboard/shop/customers', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                    { title: 'সাপ্লায়ার', icon: ArrowUpRight, href: '/dashboard/shop/suppliers', color: 'text-orange-500', bg: 'bg-orange-500/10' },
                    { title: 'স্টাফ', icon: Users, href: '/dashboard/shop/staff', color: 'text-purple-500', bg: 'bg-purple-500/10' },
                    { title: 'সার্ভিস কাজ', icon: ClipboardList, href: '/dashboard/shop/tasks', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
                    { title: 'রিপোর্ট', icon: TrendingUp, href: '/dashboard/shop/reports', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                ].map((link, i) => (
                    <Link key={i} href={link.href} className="block group">
                        <Card className="h-full border-border/50 hover:border-primary/50 hover:shadow-md transition-all duration-300">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className={`p-2.5 rounded-lg ${link.bg} ${link.color} group-hover:scale-110 transition-transform`}>
                                    <link.icon className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium">{link.title}</span>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* 1. আজকের বিক্রি */}
                <Card className="relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-green-500/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10">
                        <CardTitle className="text-sm font-medium text-muted-foreground">আজকের আয়</CardTitle>
                        <CalendarDays className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent className="z-10">
                        <div className="text-3xl font-bold flex items-center gap-2">
                            {formatCurrency(todayRevenue)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <span className="text-green-600 bg-green-500/10 px-1 py-0.5 rounded text-[10px] font-medium">+আজকের হিসাব</span>
                        </p>
                    </CardContent>
                </Card>

                {/* 2. আজকের খরচ */}
                <Card className="relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-red-500/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10">
                        <CardTitle className="text-sm font-medium text-muted-foreground">আজকের খরচ</CardTitle>
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent className="z-10">
                        <div className="text-3xl font-bold text-red-600 flex items-center gap-2">
                            {formatCurrency(todayExpenses)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            দৈনন্দিন, সাপ্লায়ার ও পারিশ্রমিক
                        </p>
                    </CardContent>
                </Card>

                {/* 3. আজকের লাভ */}
                <Card className="relative overflow-hidden group shadow-sm bg-gradient-to-br from-background to-primary/5">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-primary/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10">
                        <CardTitle className="text-sm font-medium text-muted-foreground">আজকের লাভ</CardTitle>
                        <DollarSign className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent className="z-10">
                        <div className={`text-3xl font-bold ${todayProfit >= 0 ? "text-primary" : "text-destructive"}`}>
                            {todayProfit < 0 ? "-" : ""}{formatCurrency(Math.abs(todayProfit))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            আজকের বিক্রি - আজকের খরচ
                        </p>
                    </CardContent>
                </Card>

                {/* 4. মোট বাকি টাকা */}
                <Card className="relative overflow-hidden group border-orange-200 dark:border-orange-900/50">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-orange-500/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10">
                        <CardTitle className="text-sm font-medium text-muted-foreground">মোট বাকি টাকা</CardTitle>
                        <CreditCard className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent className="z-10">
                        <div className="text-3xl font-bold text-orange-600">
                            {formatCurrency(totalDue)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 flex justify-between items-center">
                            কাস্টমারদের কাছে পাওনা
                            <Link href="/dashboard/shop/sales?status=partial" className="text-primary hover:underline font-medium">দেখুন</Link>
                        </p>
                    </CardContent>
                </Card>

                {/* 5. স্বল্প স্টকের সতর্কতা */}
                <Card className={lowStockProducts > 0 ? "border-l-4 border-l-destructive shadow-sm" : "border-l-4 border-l-orange-400"}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">স্বল্প স্টকের সতর্কতা</CardTitle>
                        <AlertTriangle className={`h-4 w-4 ${lowStockProducts > 0 ? "text-destructive" : "text-orange-500"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${lowStockProducts > 0 ? "text-destructive" : ""}`}>
                            {lowStockProducts} <span className="text-sm font-normal text-muted-foreground">টি আইটেম</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">স্টক দ্রুত রিস্টক করুন</p>
                    </CardContent>
                </Card>

                {/* 6. চলমান কাজ */}
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">চলমান কাজ</CardTitle>
                        <ClipboardList className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{activeTasksCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">পেন্ডিং সার্ভিস/মেরামত</p>
                    </CardContent>
                </Card>


            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">

                {/* Left Column (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Recent Sales List */}
                    <Card className="flex flex-col shadow-sm border-border/50">
                        <CardHeader className="bg-muted/30 border-b pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <ShoppingCart className="w-5 h-5 text-green-600" />
                                        সাম্প্রতিক বিক্রয়
                                    </CardTitle>
                                </div>
                                <Button asChild variant="outline" size="sm" className="h-8">
                                    <Link href="/dashboard/shop/sales">সব দেখুন</Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[320px]">
                                {recentSales?.length > 0 ? (
                                    <div className="divide-y">
                                        {recentSales.map((sale) => (
                                            <div key={sale.id} className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                        {(sale.customer?.name || 'C').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold">{sale.customer?.name || 'সাধারণ কাস্টমার'}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {format(new Date(sale.created_at), 'MMM d, h:mm a')} • {sale.sale_items?.length || 0} আইটেম
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-foreground">{formatCurrency(sale.total_amount)}</p>
                                                    <Badge variant={sale.payment_status === 'paid' ? 'default' : 'secondary'} className="text-[10px] mt-1 h-5">
                                                        {sale.payment_status === 'paid' ? 'পরিশোধিত' : 'বাকি'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm p-6">
                                        <ShoppingCart className="w-8 h-8 opacity-20 mb-2" />
                                        কোনো সাম্প্রতিক বিক্রয় পাওয়া যায়নি
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* Recent Expenses List */}
                    <Card className="flex flex-col shadow-sm border-border/50">
                        <CardHeader className="bg-muted/30 border-b pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <ArrowDownRight className="w-5 h-5 text-red-500" />
                                        সাম্প্রতিক খরচ
                                    </CardTitle>
                                </div>
                                <Button asChild variant="outline" size="sm" className="h-8">
                                    <Link href="/dashboard/shop/expenses">সব দেখুন</Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[250px]">
                                {recentExpenses?.length > 0 ? (
                                    <div className="divide-y">
                                        {recentExpenses.map((exp) => (
                                            <div key={exp.id} className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium">{exp.title}</p>
                                                    <div className="flex gap-2 items-center">
                                                        <Badge variant="outline" className="text-[10px] font-normal tracking-wide">
                                                            {exp.expense_categories?.name || exp.reference_type || 'অন্যান্য'}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            {format(new Date(exp.expense_date || exp.created_at), 'MMM d, yy')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="font-semibold text-red-600">
                                                    {formatCurrency(exp.amount)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm p-6">
                                        <Receipt className="w-8 h-8 opacity-20 mb-2" />
                                        কোনো খরচ এন্ট্রি নেই
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column (3 cols) */}
                <div className="lg:col-span-3 space-y-6">

                    {/* Low Stock Warning Panel - High Priority! */}
                    {lowStockProductsList?.length > 0 && (
                        <Card className="border-destructive/30 shadow-sm bg-destructive/5">
                            <CardHeader className="pb-3 border-b border-destructive/10">
                                <CardTitle className="text-base flex items-center gap-2 text-destructive">
                                    <AlertTriangle className="w-5 h-5" />
                                    স্টক সতর্কতা ({lowStockProductsList.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ScrollArea className="h-[180px]">
                                    <div className="divide-y divide-destructive/10">
                                        {lowStockProductsList.map((product) => (
                                            <div key={product.id} className="p-3 flex items-center justify-between">
                                                <div className="overflow-hidden pr-2">
                                                    <p className="text-sm font-medium truncate">{product.name}</p>
                                                    <p className="text-[10px] text-muted-foreground">Min: {product.min_stock_level} {product.unit}</p>
                                                </div>
                                                <div className="shrink-0 bg-destructive/10 text-destructive px-2 py-1 rounded-md flex flex-col items-center">
                                                    <span className="font-bold leading-none">{product.available_quantity}</span>
                                                    <span className="text-[10px]">{product.unit}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                            <div className="p-2 border-t border-destructive/10 text-center">
                                <Button asChild variant="link" size="sm" className="text-destructive w-full h-auto py-1">
                                    <Link href="/dashboard/shop/inventory">ইনভেন্টরি আপডেট করুন</Link>
                                </Button>
                            </div>
                        </Card>
                    )}

                    {/* Pending Tasks Panel */}
                    <Card className="flex flex-col shadow-sm border-border/50">
                        <CardHeader className="bg-muted/30 border-b pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <ClipboardList className="w-5 h-5 text-blue-500" />
                                    অপেক্ষমান সার্ভিস/কাজ
                                </CardTitle>
                                <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-blue-500">
                                    <Link href="/dashboard/shop/tasks"><PlusCircle className="w-4 h-4" /></Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[250px]">
                                {pendingTasks?.length > 0 ? (
                                    <div className="divide-y">
                                        {pendingTasks.map((task) => (
                                            <div key={task.id} className="p-4 hover:bg-muted/50 transition-colors">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="text-sm font-semibold line-clamp-1">{task.title}</h4>
                                                    <span className="text-sm font-bold text-foreground">{formatCurrency(task.price)}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                                                    {task.description || task.customer_name || 'কোনো বিবরণ নেই'}
                                                </p>
                                                {task.due_date && (
                                                    <Badge variant="secondary" className="text-[10px] bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">
                                                        মেয়াদ: {format(new Date(task.due_date), 'dd MMM')}
                                                    </Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
                                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                                            <ClipboardList className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <p className="text-sm font-medium">কোনো পেন্ডিং কাজ নেই</p>
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* Staff & Company Snapshot */}
                    <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                                <Users className="w-4 h-4" />
                                স্টাফ ও কর্মী ওভারভিউ
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-background rounded-lg p-3 border shadow-sm flex flex-col items-center justify-center">
                                    <span className="text-2xl font-bold text-primary">{activeStaff}</span>
                                    <span className="text-xs text-muted-foreground mt-1 text-center">অ্যাক্টিভ স্টাফ</span>
                                </div>
                                <div className="bg-background rounded-lg p-3 border shadow-sm flex flex-col items-center justify-center">
                                    <span className="text-2xl font-bold text-foreground">{staffTotal}</span>
                                    <span className="text-xs text-muted-foreground mt-1 text-center">সর্বমোট স্টাফ</span>
                                </div>
                            </div>
                            <Button asChild variant="outline" className="w-full mt-4 h-9">
                                <Link href="/dashboard/shop/staff">স্টাফ তালিকা দেখুন</Link>
                            </Button>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    )
}
