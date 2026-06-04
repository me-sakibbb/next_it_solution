'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, FolderEdit } from 'lucide-react'
import { format, startOfDay, endOfDay, subDays, startOfMonth } from 'date-fns'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useExpenses } from '@/hooks/use-expenses'
import { useExpenseCategories } from '@/hooks/use-expense-categories'
import { formatCurrency } from '@/lib/utils'

interface ExpensesClientProps {
    shopId: string
    currency: string
}

export function ExpensesClient({ shopId, currency }: ExpensesClientProps) {
    const {
        expenses,
        total,
        loading,
        page,
        limit,
        setPage,
        setLimit,
        setSearch,
        setFilters,
        refresh,
        stats,
        handleCreateExpense,
        handleUpdateExpense,
        handleDeleteExpense
    } = useExpenses(shopId)
    const { categories } = useExpenseCategories(shopId)

    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingExpense, setEditingExpense] = useState<any | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'this_month' | 'custom' | 'jan' | 'feb' | 'mar' | 'apr' | 'may' | 'jun' | 'jul' | 'aug' | 'sep' | 'oct' | 'nov' | 'dec'>('this_month')
    const [customFrom, setCustomFrom] = useState('')
    const [customTo, setCustomTo] = useState('')

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
            default: {
                const monthIndex = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].indexOf(dateRange)
                if (monthIndex !== -1) {
                    const monthDate = new Date(now.getFullYear(), monthIndex, 1)
                    return {
                        from: startOfMonth(monthDate),
                        to: endOfDay(new Date(now.getFullYear(), monthIndex + 1, 0))
                    }
                }
                return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) }
            }
        }
    }, [dateRange, customFrom, customTo])

    const bounds = getDateBounds()

    useEffect(() => {
        const { from, to } = getDateBounds()
        setFilters({
            date_from: format(from, 'yyyy-MM-dd'),
            date_to: format(to, 'yyyy-MM-dd'),
        })
    }, [getDateBounds])

    const handleCategoryChange = (value: string) => {
        setSelectedCategory(value)
        setFilters({ category_id: value })
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const formData = new FormData(e.currentTarget)
            let success;
            if (editingExpense) {
                success = await handleUpdateExpense(editingExpense.id, formData)
            } else {
                success = await handleCreateExpense(formData)
            }

            if (success) {
                setIsOpen(false)
                setEditingExpense(null)
            }
        } catch (error) {
            console.error('Error saving expense:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteClick = async (id: string, refType: string) => {
        if (refType !== 'manual') {
            return
        }
        if (!confirm('আপনি কি নিশ্চিত?')) return
        await handleDeleteExpense(id)
    }

    const openEdit = (expense: any) => {
        if (expense.reference_type !== 'manual') {
            return
        }
        setEditingExpense(expense)
        setIsOpen(true)
    }

    const closeDialog = () => {
        setIsOpen(false)
        setEditingExpense(null)
    }

    const columns = [
        {
            key: 'expense_date',
            label: 'তারিখ',
            render: (e: any) => format(new Date(e.expense_date), 'dd MMM yyyy'),
        },
        {
            key: 'title',
            label: 'শিরোনাম',
            render: (e: any) => <span className="font-semibold">{e.title}</span>,
        },
        {
            key: 'category',
            label: 'ক্যাটাগরি',
            render: (e: any) => (
                <span className="font-medium text-muted-foreground">
                    {e.expense_categories?.name || 'Uncategorized'}
                </span>
            ),
        },
        {
            key: 'notes',
            label: 'বর্ণনা/নোট',
            render: (e: any) => <span className="truncate max-w-[200px] inline-block">{e.notes}</span>,
        },
        {
            key: 'reference_type',
            label: 'ধরণ',
            render: (e: any) => (
                e.reference_type === 'manual' ? (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">ম্যানুয়াল</span>
                ) : (
                    <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-800">অটো-সিস্টেম</span>
                )
            ),
        },
        {
            key: 'amount',
            label: 'পরিমাণ',
            render: (e: any) => (
                <span className="font-bold text-red-600">
                    {formatCurrency(e.amount)}
                </span>
            ),
        },
    ]

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex flex-col items-center gap-4 w-full">
                    <div className="flex items-center gap-4 w-full">
                        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="সব ক্যাটাগরি" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">সব ক্যাটাগরি</SelectItem>
                                {categories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Link href="/dashboard/shop/expenses/categories">
                            <Button variant="outline">
                                <FolderEdit className="mr-2 h-4 w-4" />
                                ক্যাটাগরি ম্যানেজমেন্ট
                            </Button>
                        </Link>
                    </div>

                    <Card className="border-primary/20 bg-linear-to-r from-primary/5 to-transparent w-full">
                        <CardContent className="py-2 px-4 shadow-none border-none">
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground whitespace-nowrap">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                                    সময়কাল:
                                </div>
                                <div className="flex flex-col gap-2 w-full">
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
                                                onClick={() => setDateRange(key as any)}
                                                className={`h-8 text-xs ${dateRange === key ? 'bg-green-700 hover:bg-green-800' : ''}`}
                                            >
                                                {label}
                                            </Button>
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <div className="flex flex-wrap gap-1 flex-1">
                                            {[
                                                { key: 'jan', label: 'জানু' }, { key: 'feb', label: 'ফেব্রু' }, { key: 'mar', label: 'মার্চ' },
                                                { key: 'apr', label: 'এপ্রি' }, { key: 'may', label: 'মে' }, { key: 'jun', label: 'জুন' },
                                                { key: 'jul', label: 'জুলা' }, { key: 'aug', label: 'আগ' }, { key: 'sep', label: 'সেপ্টে' },
                                                { key: 'oct', label: 'অক্টো' }, { key: 'nov', label: 'নভে' }, { key: 'dec', label: 'ডিসে' }
                                            ].map(({ key, label }) => (
                                                <Button
                                                    key={key}
                                                    variant={dateRange === key ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => setDateRange(key as any)}
                                                    className={`h-7 px-2 text-[10px] sm:h-8 sm:px-3 sm:text-xs ${dateRange === key ? 'bg-green-700 hover:bg-green-800' : ''}`}
                                                >
                                                    {label}
                                                </Button>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-white/50 px-2 py-1 rounded-md border border-gray-100 whitespace-nowrap">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line><path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path><path d="M8 18h.01"></path><path d="M12 18h.01"></path><path d="M16 18h.01"></path></svg>
                                            {format(bounds.from, 'dd MMM yyyy')} - {format(bounds.to, 'dd MMM yyyy')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {dateRange === 'custom' && (
                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-primary/10">
                                    <span className="text-xs text-muted-foreground">কাস্টম রেঞ্জ:</span>
                                    <Input
                                        type="date"
                                        value={customFrom}
                                        onChange={(e) => setCustomFrom(e.target.value)}
                                        className="h-8 max-w-[140px] text-xs"
                                    />
                                    <span className="text-xs">থেকে</span>
                                    <Input
                                        type="date"
                                        value={customTo}
                                        onChange={(e) => setCustomTo(e.target.value)}
                                        className="h-8 max-w-[140px] text-xs"
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <Dialog open={isOpen} onOpenChange={(open) => {
                    if (!open) closeDialog()
                    else setIsOpen(true)
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            নতুন খরচ যোগ করুন
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingExpense ? 'খরচ এডিট করুন' : 'নতুন খরচ যোগ করুন'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>শিরোনাম</Label>
                                <Input
                                    name="title"
                                    defaultValue={editingExpense?.title}
                                    required
                                    placeholder="খরচের নাম (যেমন: জানুয়ারির বিদ্যুৎ বিল)"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>খরচের ক্যাটাগরি (ঐচ্ছিক)</Label>
                                <Select name="category_id" defaultValue={editingExpense?.category_id || "none"}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন (ঐচ্ছিক)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">কোনো ক্যাটাগরি নেই</SelectItem>
                                        {categories.filter(c => c.is_active).map(cat => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name} {cat.is_system ? '(সিস্টেম)' : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>পরিমাণ ({currency})</Label>
                                <Input
                                    name="amount"
                                    type="number"
                                    step="0.01"
                                    defaultValue={editingExpense?.amount}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>দাবিকৃত তারিখ</Label>
                                <Input
                                    name="expense_date"
                                    type="date"
                                    defaultValue={editingExpense?.expense_date || new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>বিস্তারিত নোট</Label>
                                <Textarea
                                    name="notes"
                                    defaultValue={editingExpense?.notes || ''}
                                    placeholder="অতিরিক্ত তথ্য..."
                                />
                            </div>

                            <Button type="submit" disabled={isSubmitting} className="w-full">
                                {isSubmitting ? 'প্রসেসিং...' : 'সেভ করুন'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">ম্যানুয়াল খরচ</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.manualExpenses)}</div>
                        <p className="text-xs text-muted-foreground">সরাসরি যোগ করা খরচ</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">সিস্টেম খরচ</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{formatCurrency(stats.systemExpenses)}</div>
                        <p className="text-xs text-muted-foreground">অটো-জেনারেটেড খরচ</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">সর্বমোট খরচ</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalExpenses)}</div>
                        <p className="text-xs text-muted-foreground">দোকানের মোট ব্যয়</p>
                    </CardContent>
                </Card>
            </div>

            <DataTable
                data={expenses}
                columns={columns}
                total={total}
                page={page}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={setLimit}
                onSearchChange={setSearch}
                loading={loading}
                searchPlaceholder="শিরোনাম দিয়ে খুঁজুন..."
                actions={(expense) => (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(expense)}
                            disabled={expense.reference_type !== 'manual'}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(expense.id, expense.reference_type)}
                            disabled={expense.reference_type !== 'manual'}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            />
        </div>
    )
}
