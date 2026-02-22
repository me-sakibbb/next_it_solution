'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
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
import { useToast } from '@/components/ui/use-toast'

import { useExpenseCategories } from '@/hooks/use-expense-categories'
import { createExpenseCategory, updateExpenseCategory, deleteExpenseCategory } from '@/app/actions/expense-categories'

interface CategoriesClientProps {
    shopId: string
}

export function CategoriesClient({ shopId }: CategoriesClientProps) {
    const { categories, loading } = useExpenseCategories(shopId)
    const { toast } = useToast()

    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingCategory, setEditingCategory] = useState<any | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const formData = new FormData(e.currentTarget)
            if (editingCategory) {
                await updateExpenseCategory(editingCategory.id, formData)
                toast({ title: 'Success', description: 'ক্যাটাগরি আপডেট হয়েছে' })
            } else {
                await createExpenseCategory(shopId, formData)
                toast({ title: 'Success', description: 'নতুন ক্যাটাগরি তৈরি হয়েছে' })
            }
            setIsOpen(false)
            setEditingCategory(null)
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'কিছু একটা ভুল হয়েছে!' })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string, isSystem: boolean) => {
        if (isSystem) {
            toast({ variant: 'destructive', title: 'Error', description: 'সিস্টেম ক্যাটাগরি ডিলিট করা সম্ভব নয়!' })
            return
        }
        if (!confirm('আপনি কি নিশ্চিত?')) return

        try {
            await deleteExpenseCategory(id)
            toast({ title: 'Success', description: 'ক্যাটাগরি মুছে ফেলা হয়েছে' })
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'ডিলিট করতে সমস্যা হয়েছে' })
        }
    }

    const openEdit = (category: any) => {
        if (category.is_system) {
            toast({ variant: 'destructive', title: 'Error', description: 'সিস্টেম ক্যাটাগরি পরিবর্তন করা সম্ভব নয়!' })
            return
        }
        setEditingCategory(category)
        setIsOpen(true)
    }

    const closeDialog = () => {
        setIsOpen(false)
        setEditingCategory(null)
    }

    if (loading) return <div>Data Loading...</div>

    return (
        <div className="space-y-4">
            <div className="flex justify-end items-center">
                <Dialog open={isOpen} onOpenChange={(open) => {
                    if (!open) closeDialog()
                    else setIsOpen(true)
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            নতুন ক্যাটাগরি
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingCategory ? 'ক্যাটাগরি আপডেট' : 'নতুন ক্যাটাগরি'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>নাম</Label>
                                <Input
                                    name="name"
                                    defaultValue={editingCategory?.name}
                                    required
                                    placeholder="যেমন: বিদ্যুৎ বিল"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>বর্ণনা (ঐচ্ছিক)</Label>
                                <Textarea
                                    name="description"
                                    defaultValue={editingCategory?.description || ''}
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

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>নাম</TableHead>
                            <TableHead>বর্ণনা</TableHead>
                            <TableHead>ধরণ</TableHead>
                            <TableHead>তারিখ</TableHead>
                            <TableHead className="text-right">অ্যাকশন</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                    কোনো ক্যাটাগরি পাওয়া যায়নি
                                </TableCell>
                            </TableRow>
                        )}
                        {categories.map((category) => (
                            <TableRow key={category.id}>
                                <TableCell className="font-medium">{category.name}</TableCell>
                                <TableCell className="truncate max-w-[200px]">{category.description || '-'}</TableCell>
                                <TableCell>
                                    {category.is_system ? (
                                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">অটো-সিস্টেম</span>
                                    ) : (
                                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">ম্যানুয়াল</span>
                                    )}
                                </TableCell>
                                <TableCell>{format(new Date(category.created_at), 'dd MMM yyyy')}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openEdit(category)}
                                        disabled={category.is_system}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => handleDelete(category.id, category.is_system)}
                                        disabled={category.is_system}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
