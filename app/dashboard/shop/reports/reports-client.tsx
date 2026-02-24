'use client'

import { useState, useMemo, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Receipt,
  Download,
  CalendarDays,
  DollarSign,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  BarChart3,
  PieChart as PieChartIcon,
  FileSpreadsheet,
  Filter,
  Users,
  CreditCard,
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { format, subDays, startOfMonth, startOfDay, endOfDay, isWithinInterval } from 'date-fns'
import { formatCurrency } from '@/lib/utils'

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899',
  '#6366f1', '#14b8a6', '#f97316', '#ef4444', '#06b6d4',
]

type DateRange = 'today' | '7days' | '30days' | 'this_month' | 'custom'

import { useReports } from '@/hooks/use-reports'

interface ReportsClientProps {
  shopId: string
  currency: string
}

export function ReportsClient({ shopId, currency }: ReportsClientProps) {
  const { sales, products, expenses, loading, refresh } = useReports(shopId)
  const [dateRange, setDateRange] = useState<DateRange>('30days')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')



  // --- Date filtering ---
  const getDateBounds = useCallback(() => {
    const now = new Date()
    switch (dateRange) {
      case 'today':
        return { from: startOfDay(now), to: endOfDay(now) }
      case '7days':
        return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) }
      case '30days':
        return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) }
      case 'this_month':
        return { from: startOfMonth(now), to: endOfDay(now) }
      case 'custom':
        return {
          from: customFrom ? startOfDay(new Date(customFrom)) : startOfDay(subDays(now, 29)),
          to: customTo ? endOfDay(new Date(customTo)) : endOfDay(now),
        }
    }
  }, [dateRange, customFrom, customTo])

  const bounds = getDateBounds()

  const filteredSales = useMemo(() =>
    sales.filter(s => {
      const d = new Date(s.sale_date || s.created_at)
      return isWithinInterval(d, { start: bounds.from, end: bounds.to })
    }), [sales, bounds])

  const filteredExpenses = useMemo(() =>
    expenses.filter(e => {
      const d = new Date(e.expense_date || e.created_at)
      return isWithinInterval(d, { start: bounds.from, end: bounds.to })
    }), [expenses, bounds])

  // --- KPIs ---
  const totalRevenue = filteredSales.reduce((s, sale) => s + Number(sale.total_amount || 0), 0)
  const totalPaid = filteredSales.reduce((s, sale) => s + Number(sale.paid_amount || 0), 0)
  const totalDue = filteredSales.reduce((s, sale) => s + Number(sale.balance_amount || 0), 0)
  const totalExpensesAmount = filteredExpenses.reduce((s, e) => s + Number(e.amount || 0), 0)
  const grossProfit = filteredSales.reduce((sum, sale) => {
    const profit = sale.sale_items?.reduce((itemSum: number, item: any) => {
      const product = products.find((p: any) => p.id === item.product_id)
      const costPrice = product?.cost_price || 0
      return itemSum + ((item.unit_price - costPrice) * item.quantity)
    }, 0) || 0
    return sum + profit
  }, 0)
  const netProfit = grossProfit - totalExpensesAmount
  const avgSaleValue = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0
  const totalItemsSold = filteredSales.reduce((s, sale) =>
    s + (sale.sale_items?.reduce((is: number, item: any) => is + item.quantity, 0) || 0), 0)
  const paidSalesCount = filteredSales.filter(s => s.payment_status === 'paid').length
  const paymentRate = filteredSales.length > 0 ? (paidSalesCount / filteredSales.length) * 100 : 0

  const manualExpenses = filteredExpenses.filter(e => e.reference_type === 'manual')
  const systemExpenses = filteredExpenses.filter(e => e.reference_type !== 'manual')
  const dailyAvgExpense = filteredExpenses.length > 0
    ? totalExpensesAmount / Math.max(1, Math.ceil((bounds.to.getTime() - bounds.from.getTime()) / (86400000)))
    : 0

  const lowStockProducts = products.filter((p: any) =>
    (p.inventory?.[0]?.quantity || 0) <= p.min_stock_level
  )
  const totalStockValue = products.reduce((s: number, p: any) => {
    const qty = p.inventory?.[0]?.quantity || 0
    return s + (qty * Number(p.cost_price || 0))
  }, 0)

  // --- Helper: get local date key from any date string ---
  const toLocalDateKey = (dateStr: string) => format(new Date(dateStr), 'yyyy-MM-dd')
  const toLocalMonthKey = (dateStr: string) => format(new Date(dateStr), 'yyyy-MM')

  // --- Chart data ---
  const dailySalesData = useMemo(() => {
    const dayCount = Math.max(1, Math.ceil((bounds.to.getTime() - bounds.from.getTime()) / 86400000))
    const days = [...Array(dayCount)].map((_, i) => {
      const d = new Date(bounds.from)
      d.setDate(d.getDate() + i)
      return format(d, 'yyyy-MM-dd')
    })
    return days.map(date => {
      const daySales = filteredSales.filter(s => toLocalDateKey(s.sale_date || s.created_at) === date)
      const revenue = daySales.reduce((s, sale) => s + Number(sale.total_amount || 0), 0)
      const profit = daySales.reduce((sum, sale) => {
        const p = sale.sale_items?.reduce((itemSum: number, item: any) => {
          const prod = products.find((pp: any) => pp.id === item.product_id)
          return itemSum + ((item.unit_price - (prod?.cost_price || 0)) * item.quantity)
        }, 0) || 0
        return sum + p
      }, 0)
      const expense = filteredExpenses.filter(e => toLocalDateKey(e.expense_date || e.created_at) === date)
        .reduce((s, e) => s + Number(e.amount || 0), 0)
      return {
        date: format(new Date(date), 'dd MMM'),
        আয়: revenue,
        লাভ: profit,
        খরচ: expense,
      }
    })
  }, [filteredSales, filteredExpenses, bounds, products])

  const monthlyRevenueData = useMemo(() => {
    const months = [...Array(12)].map((_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - (11 - i))
      return {
        month: format(d, 'MMM'),
        key: format(d, 'yyyy-MM'),
      }
    })
    return months.map(({ month, key }) => {
      const ms = sales.filter(s => toLocalMonthKey(s.sale_date || s.created_at) === key)
      const revenue = ms.reduce((s, sale) => s + Number(sale.total_amount || 0), 0)
      const exp = expenses.filter(e => toLocalMonthKey(e.expense_date || e.created_at) === key)
        .reduce((s, e) => s + Number(e.amount || 0), 0)
      return { month, আয়: revenue, খরচ: exp }
    })
  }, [sales, expenses])

  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number }> = {}
    filteredSales.forEach(sale => {
      sale.sale_items?.forEach((item: any) => {
        const prod = products.find((p: any) => p.id === item.product_id)
        if (prod) {
          if (!map[prod.id]) map[prod.id] = { name: prod.name, qty: 0, revenue: 0 }
          map[prod.id].qty += item.quantity
          map[prod.id].revenue += item.quantity * item.unit_price
        }
      })
    })
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 10)
  }, [filteredSales, products])

  const categoryDistribution = useMemo(() => {
    const map: Record<string, number> = {}
    filteredSales.forEach(sale => {
      sale.sale_items?.forEach((item: any) => {
        const prod = products.find((p: any) => p.id === item.product_id)
        const cat = prod?.category?.name || 'অন্যান্য'
        map[cat] = (map[cat] || 0) + (item.quantity * item.unit_price)
      })
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [filteredSales, products])

  const expenseCategoryData = useMemo(() => {
    const map: Record<string, number> = {}
    filteredExpenses.forEach(e => {
      const cat = e.expense_categories?.name || e.reference_type || 'অন্যান্য'
      map[cat] = (map[cat] || 0) + Number(e.amount || 0)
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [filteredExpenses])

  // --- CSV Download ---
  const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
    // Add BOM for proper Unicode/Bangla support in Excel
    const BOM = '\uFEFF'
    const csv = BOM + [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadSalesCSV = () => {
    const headers = ['তারিখ', 'ইনভয়েস', 'কাস্টমার', 'মোট', 'পরিশোধিত', 'বাকি', 'স্ট্যাটাস']
    const rows = filteredSales.map(s => [
      format(new Date(s.sale_date || s.created_at), 'yyyy-MM-dd'),
      s.sale_number || '',
      s.customer?.name || 'সাধারণ',
      String(s.total_amount || 0),
      String(s.paid_amount || 0),
      String(s.balance_amount || 0),
      s.payment_status || '',
    ])
    downloadCSV(`sales_report_${format(new Date(), 'yyyyMMdd')}.csv`, headers, rows)
  }

  const downloadExpensesCSV = () => {
    const headers = ['তারিখ', 'শিরোনাম', 'ক্যাটাগরি', 'টাইপ', 'পরিমাণ']
    const rows = filteredExpenses.map(e => [
      format(new Date(e.expense_date || e.created_at), 'yyyy-MM-dd'),
      e.title || '',
      e.expense_categories?.name || '',
      e.reference_type || '',
      String(e.amount || 0),
    ])
    downloadCSV(`expenses_report_${format(new Date(), 'yyyyMMdd')}.csv`, headers, rows)
  }

  const downloadInventoryCSV = () => {
    const headers = ['পণ্যের নাম', 'ক্যাটাগরি', 'স্টক', 'ক্রয় মূল্য', 'বিক্রয় মূল্য', 'স্টক মূল্য']
    const rows = products.map((p: any) => {
      const qty = p.inventory?.[0]?.quantity || 0
      return [
        p.name,
        p.category?.name || '',
        String(qty),
        String(p.cost_price || 0),
        String(p.selling_price || 0),
        String(qty * Number(p.cost_price || 0)),
      ]
    })
    downloadCSV(`inventory_report_${format(new Date(), 'yyyyMMdd')}.csv`, headers, rows)
  }

  // --- Render Helpers ---
  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'text-primary', trend }: any) => (
    <Card className="relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className={`absolute right-0 top-0 w-20 h-20 ${color.replace('text-', 'bg-')}/10 rounded-bl-full -z-0 transition-transform group-hover:scale-110`} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent className="z-10">
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {trend !== undefined && (
          <div className={`text-xs mt-1 flex items-center gap-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-[200px] w-full bg-muted animate-pulse rounded-lg" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="h-[400px] w-full bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  const dateRangeLabel = () => {
    switch (dateRange) {
      case 'today': return 'আজ'
      case '7days': return 'গত ৭ দিন'
      case '30days': return 'গত ৩০ দিন'
      case 'this_month': return 'এই মাস'
      case 'custom': return 'কাস্টম'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <BarChart3 className="w-6 h-6" />
            </div>
            রিপোর্ট ও অ্যানালিটিক্স
          </h1>
          <p className="text-muted-foreground mt-1">
            বিস্তারিত বিজনেস ইন্টেলিজেন্স, ফিল্টার এবং ডাউনলোডযোগ্য রিপোর্ট
          </p>
        </div>
      </div>

      {/* Date Filter Bar */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Filter className="w-4 h-4" />
              সময়কাল:
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'today', label: 'আজ' },
                { key: '7days', label: '৭ দিন' },
                { key: '30days', label: '৩০ দিন' },
                { key: 'this_month', label: 'এই মাস' },
                { key: 'custom', label: 'কাস্টম' },
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  variant={dateRange === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDateRange(key as DateRange)}
                  className="h-8 text-xs"
                >
                  {label}
                </Button>
              ))}
            </div>
            {dateRange === 'custom' && (
              <div className="flex items-center gap-2">
                <Input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="h-8 text-xs w-36" />
                <span className="text-xs text-muted-foreground">—</span>
                <Input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="h-8 text-xs w-36" />
              </div>
            )}
            <Badge variant="secondary" className="ml-auto text-xs">
              <CalendarDays className="w-3 h-3 mr-1" />
              {format(bounds.from, 'dd MMM')} - {format(bounds.to, 'dd MMM yyyy')}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-11 p-1">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            <BarChart3 className="w-4 h-4 mr-1.5 hidden sm:block" />ওভারভিউ
          </TabsTrigger>
          <TabsTrigger value="sales" className="text-xs sm:text-sm">
            <ShoppingCart className="w-4 h-4 mr-1.5 hidden sm:block" />বিক্রয়
          </TabsTrigger>
          <TabsTrigger value="expenses" className="text-xs sm:text-sm">
            <Receipt className="w-4 h-4 mr-1.5 hidden sm:block" />খরচ
          </TabsTrigger>
          <TabsTrigger value="inventory" className="text-xs sm:text-sm">
            <Package className="w-4 h-4 mr-1.5 hidden sm:block" />ইনভেন্টরি
          </TabsTrigger>
        </TabsList>

        {/* ===== OVERVIEW TAB ===== */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard title="মোট বিক্রয়" value={formatCurrency(totalRevenue)} icon={TrendingUp} color="text-green-600" subtitle={`${filteredSales.length} বিক্রয়`} />
            <StatCard title="মোট খরচ" value={formatCurrency(totalExpensesAmount)} icon={ArrowDownRight} color="text-red-500" subtitle={`${filteredExpenses.length} এন্ট্রি`} />
            <StatCard title="গ্রস লাভ" value={formatCurrency(grossProfit)} icon={DollarSign} color="text-emerald-600" subtitle={`${totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : 0}% মার্জিন`} />
            <StatCard title="নীট লাভ" value={formatCurrency(netProfit)} icon={DollarSign} color={netProfit >= 0 ? "text-primary" : "text-red-600"} subtitle="খরচ বাদে" />
            <StatCard title="মোট বাকি" value={formatCurrency(totalDue)} icon={CreditCard} color="text-orange-500" subtitle="কাস্টমার পাওনা" />
            <StatCard title="লো স্টক" value={`${lowStockProducts.length} আইটেম`} icon={AlertTriangle} color="text-destructive" subtitle={`${products.length} মোট পণ্য`} />
          </div>

          {/* Revenue vs Expense Trend */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  দৈনিক আয় ও খরচ ({dateRangeLabel()})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailySalesData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="আয়" stroke="#3b82f6" fill="url(#colorRevenue)" strokeWidth={2} />
                    <Area type="monotone" dataKey="খরচ" stroke="#ef4444" fill="url(#colorExpense)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  মাসিক আয় ও খরচ (১২ মাস)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="আয়" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="খরচ" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== SALES TAB ===== */}
        <TabsContent value="sales" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">বিক্রয় বিশ্লেষণ ({dateRangeLabel()})</h2>
            <Button variant="outline" size="sm" onClick={downloadSalesCSV} className="gap-2">
              <Download className="w-4 h-4" />
              CSV ডাউনলোড
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="মোট বিক্রয়" value={formatCurrency(totalRevenue)} icon={TrendingUp} color="text-green-600" />
            <StatCard title="গড় বিক্রয় মূল্য" value={formatCurrency(avgSaleValue)} icon={ShoppingCart} color="text-blue-500" />
            <StatCard title="মোট বিক্রিত পণ্য" value={totalItemsSold} icon={Package} color="text-indigo-500" />
            <StatCard title="পেমেন্ট রেট" value={`${paymentRate.toFixed(0)}%`} icon={CreditCard} color="text-emerald-500" subtitle={`${paidSalesCount}/${filteredSales.length} পরিশোধিত`} />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Top Products */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">টপ পণ্য (বিক্রয় অনুযায়ী)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="qty" name="বিক্রয়" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4" />
                  ক্যাটাগরি অনুযায়ী বিক্রয়
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%" cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {categoryDistribution.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Daily Sales Trend */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">দৈনিক আয় ও লাভ</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={dailySalesData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="আয়" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="লাভ" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sales Data Table */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-primary" />
                  বিক্রয় তালিকা ({filteredSales.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[360px]">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="p-3 text-left font-medium text-muted-foreground">তারিখ</th>
                      <th className="p-3 text-left font-medium text-muted-foreground">ইনভয়েস</th>
                      <th className="p-3 text-left font-medium text-muted-foreground">কাস্টমার</th>
                      <th className="p-3 text-right font-medium text-muted-foreground">মোট</th>
                      <th className="p-3 text-right font-medium text-muted-foreground">পরিশোধিত</th>
                      <th className="p-3 text-center font-medium text-muted-foreground">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredSales.slice(0, 100).map(sale => (
                      <tr key={sale.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 text-xs">{format(new Date(sale.sale_date || sale.created_at), 'dd MMM yy')}</td>
                        <td className="p-3 font-mono text-xs">{sale.sale_number || '—'}</td>
                        <td className="p-3">{sale.customer?.name || 'সাধারণ'}</td>
                        <td className="p-3 text-right font-semibold">{formatCurrency(sale.total_amount)}</td>
                        <td className="p-3 text-right">{formatCurrency(sale.paid_amount)}</td>
                        <td className="p-3 text-center">
                          <Badge variant={sale.payment_status === 'paid' ? 'default' : 'secondary'} className="text-[10px]">
                            {sale.payment_status === 'paid' ? 'পরিশোধিত' : sale.payment_status === 'partial' ? 'আংশিক' : 'বাকি'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {filteredSales.length === 0 && (
                      <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">এই সময়কালে কোনো বিক্রয় নেই</td></tr>
                    )}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== EXPENSES TAB ===== */}
        <TabsContent value="expenses" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">খরচ বিশ্লেষণ ({dateRangeLabel()})</h2>
            <Button variant="outline" size="sm" onClick={downloadExpensesCSV} className="gap-2">
              <Download className="w-4 h-4" />
              CSV ডাউনলোড
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="মোট খরচ" value={formatCurrency(totalExpensesAmount)} icon={Receipt} color="text-red-500" />
            <StatCard title="ম্যানুয়াল খরচ" value={formatCurrency(manualExpenses.reduce((s, e) => s + Number(e.amount), 0))} icon={Receipt} color="text-orange-500" subtitle={`${manualExpenses.length} এন্ট্রি`} />
            <StatCard title="সিস্টেম খরচ" value={formatCurrency(systemExpenses.reduce((s, e) => s + Number(e.amount), 0))} icon={Receipt} color="text-blue-500" subtitle={`${systemExpenses.length} এন্ট্রি`} />
            <StatCard title="দৈনিক গড়" value={formatCurrency(dailyAvgExpense)} icon={CalendarDays} color="text-purple-500" />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Expense Category Distribution */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-red-500" />
                  ক্যাটাগরি অনুযায়ী খরচ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseCategoryData}
                      cx="50%" cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {expenseCategoryData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Daily Expense Trend */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">দৈনিক খরচ ট্রেন্ড</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailySalesData}>
                    <defs>
                      <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="খরচ" stroke="#ef4444" fill="url(#colorExp)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Expenses Data Table */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-red-500" />
                খরচ তালিকা ({filteredExpenses.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[360px]">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="p-3 text-left font-medium text-muted-foreground">তারিখ</th>
                      <th className="p-3 text-left font-medium text-muted-foreground">শিরোনাম</th>
                      <th className="p-3 text-left font-medium text-muted-foreground">ক্যাটাগরি</th>
                      <th className="p-3 text-center font-medium text-muted-foreground">টাইপ</th>
                      <th className="p-3 text-right font-medium text-muted-foreground">পরিমাণ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredExpenses.slice(0, 100).map(exp => (
                      <tr key={exp.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 text-xs">{format(new Date(exp.expense_date || exp.created_at), 'dd MMM yy')}</td>
                        <td className="p-3 font-medium">{exp.title}</td>
                        <td className="p-3 text-muted-foreground">{exp.expense_categories?.name || '—'}</td>
                        <td className="p-3 text-center">
                          <Badge variant={exp.reference_type === 'manual' ? 'outline' : 'secondary'} className="text-[10px]">
                            {exp.reference_type === 'manual' ? 'ম্যানুয়াল' : 'সিস্টেম'}
                          </Badge>
                        </td>
                        <td className="p-3 text-right font-semibold text-red-600">{formatCurrency(exp.amount)}</td>
                      </tr>
                    ))}
                    {filteredExpenses.length === 0 && (
                      <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">এই সময়কালে কোনো খরচ এন্ট্রি নেই</td></tr>
                    )}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== INVENTORY TAB ===== */}
        <TabsContent value="inventory" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">ইনভেন্টরি বিশ্লেষণ</h2>
            <Button variant="outline" size="sm" onClick={downloadInventoryCSV} className="gap-2">
              <Download className="w-4 h-4" />
              CSV ডাউনলোড
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="মোট পণ্য" value={products.length} icon={Package} color="text-blue-500" subtitle={`${products.filter((p: any) => p.is_active).length} সক্রিয়`} />
            <StatCard title="লো স্টক পণ্য" value={lowStockProducts.length} icon={AlertTriangle} color="text-destructive" subtitle="রিস্টক করা প্রয়োজন" />
            <StatCard title="মোট স্টক মূল্য" value={formatCurrency(totalStockValue)} icon={DollarSign} color="text-emerald-500" subtitle="ক্রয় মূল্যে" />
            <StatCard title="গড় পণ্য মূল্য" value={formatCurrency(products.length > 0 ? totalStockValue / products.length : 0)} icon={DollarSign} color="text-purple-500" />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Stock Value by Category */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-blue-500" />
                  ক্যাটাগরি অনুযায়ী স্টক মূল্য
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const catStock: Record<string, number> = {}
                  products.forEach((p: any) => {
                    const cat = p.category?.name || 'অন্যান্য'
                    const qty = p.inventory?.[0]?.quantity || 0
                    catStock[cat] = (catStock[cat] || 0) + (qty * Number(p.cost_price || 0))
                  })
                  const data = Object.entries(catStock).map(([name, value]) => ({ name, value }))
                  return (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={data} cx="50%" cy="50%" labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100} dataKey="value">
                          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )
                })()}
              </CardContent>
            </Card>

            {/* Low Stock Table */}
            <Card className="shadow-sm border-destructive/20">
              <CardHeader className="pb-3 border-b border-destructive/10">
                <CardTitle className="text-base flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  লো স্টক পণ্য ({lowStockProducts.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[280px]">
                  <table className="w-full text-sm">
                    <thead className="bg-destructive/5 sticky top-0">
                      <tr>
                        <th className="p-3 text-left font-medium text-muted-foreground">পণ্য</th>
                        <th className="p-3 text-center font-medium text-muted-foreground">বর্তমান</th>
                        <th className="p-3 text-center font-medium text-muted-foreground">ন্যূনতম</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-destructive/10">
                      {lowStockProducts.map((p: any) => (
                        <tr key={p.id} className="hover:bg-destructive/5 transition-colors">
                          <td className="p-3 font-medium">{p.name}</td>
                          <td className="p-3 text-center">
                            <Badge variant="destructive" className="text-[10px]">{p.inventory?.[0]?.quantity || 0} {p.unit}</Badge>
                          </td>
                          <td className="p-3 text-center text-muted-foreground text-xs">{p.min_stock_level} {p.unit}</td>
                        </tr>
                      ))}
                      {lowStockProducts.length === 0 && (
                        <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">কোনো লো স্টক পণ্য নেই ✓</td></tr>
                      )}
                    </tbody>
                  </table>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Full Product Stock Table */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-500" />
                সকল পণ্যের স্টক ({products.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[360px]">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="p-3 text-left font-medium text-muted-foreground">পণ্যের নাম</th>
                      <th className="p-3 text-left font-medium text-muted-foreground">ক্যাটাগরি</th>
                      <th className="p-3 text-center font-medium text-muted-foreground">স্টক</th>
                      <th className="p-3 text-right font-medium text-muted-foreground">ক্রয় মূল্য</th>
                      <th className="p-3 text-right font-medium text-muted-foreground">বিক্রয় মূল্য</th>
                      <th className="p-3 text-right font-medium text-muted-foreground">স্টক মূল্য</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {products.map((p: any) => {
                      const qty = p.inventory?.[0]?.quantity || 0
                      const isLow = qty <= p.min_stock_level
                      return (
                        <tr key={p.id} className={`hover:bg-muted/30 transition-colors ${isLow ? 'bg-destructive/5' : ''}`}>
                          <td className="p-3 font-medium">{p.name}</td>
                          <td className="p-3 text-muted-foreground text-xs">{p.category?.name || '—'}</td>
                          <td className="p-3 text-center">
                            <Badge variant={isLow ? 'destructive' : 'outline'} className="text-[10px]">{qty} {p.unit}</Badge>
                          </td>
                          <td className="p-3 text-right">{formatCurrency(p.cost_price)}</td>
                          <td className="p-3 text-right">{formatCurrency(p.selling_price)}</td>
                          <td className="p-3 text-right font-semibold">{formatCurrency(qty * Number(p.cost_price || 0))}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
