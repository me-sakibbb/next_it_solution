'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, FolderEdit } from 'lucide-react'
import { format } from 'date-fns'
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
                <div className="flex items-center gap-4 w-full sm:w-auto">
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
