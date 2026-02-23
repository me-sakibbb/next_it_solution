'use client'

import { useState, useEffect } from 'react'
import { useShop } from '@/hooks/use-shop'
import { useShopTasks } from '@/hooks/use-shop-tasks'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Plus, Search, Trash2, CheckCircle, Clock } from 'lucide-react'
import { TaskStatus } from '@/lib/types'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import { CustomerSelector } from '@/components/dashboard/shop/customer-selector'
import { useCustomers } from '@/hooks/use-customers'

export function TasksClient() {
    const { shop } = useShop()
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all')

    const {
        tasks,
        total,
        loading,
        page,
        limit,
        setPage,
        setLimit,
        setSearch,
        setFilters,
        stats,
        createTask,
        updateStatus,
        deleteTask,
    } = useShopTasks(shop?.id, statusFilter)

    const { customers } = useCustomers(shop?.id || '')

    useEffect(() => {
        setFilters({ status: statusFilter })
    }, [statusFilter, setFilters])

    // Form state
    const [newTaskTitle, setNewTaskTitle] = useState('')
    const [newTaskDescription, setNewTaskDescription] = useState('')
    const [newTaskPrice, setNewTaskPrice] = useState('')
    const [newTaskCustomer, setNewTaskCustomer] = useState('')
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
    const [newTaskDueDate, setNewTaskDueDate] = useState('')
    const [newTaskCost, setNewTaskCost] = useState('')

    const handleCreateTask = async () => {
        if (!newTaskTitle || !newTaskPrice) {
            toast.error('Please fill in title and price')
            return
        }

        try {
            await createTask({
                title: newTaskTitle,
                description: newTaskDescription,
                price: parseFloat(newTaskPrice),
                cost: parseFloat(newTaskCost || '0'),
                customer_name: newTaskCustomer,
                due_date: newTaskDueDate ? new Date(newTaskDueDate).toISOString() : undefined,
            })
            setIsCreateOpen(false)
            // Reset form
            setNewTaskTitle('')
            setNewTaskDescription('')
            setNewTaskPrice('')
            setNewTaskCost('')
            setNewTaskCustomer('')
            setSelectedCustomerId('')
            setNewTaskDueDate('')
        } catch (error) {
            // Error handled in hook
        }
    }

    const columns = [
        {
            key: 'title',
            label: 'টাস্ক',
            render: (task: any) => (
                <div>
                    <div className="font-medium">{task.title}</div>
                    {task.description && (
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {task.description}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'customer_name',
            label: 'কাস্টমার',
            render: (task: any) => task.customer_name || '-',
        },
        {
            key: 'due_date',
            label: 'নির্ধারিত তারিখ',
            render: (task: any) => task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : '-',
        },
        {
            key: 'price',
            label: 'মূল্য',
            render: (task: any) => formatCurrency(task.price),
        },
        {
            key: 'cost',
            label: 'খরচ',
            render: (task: any) => formatCurrency(task.cost || 0),
        },
        {
            key: 'status',
            label: 'স্টেটাস',
            render: (task: any) => (
                <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                    {task.status === 'completed' ? 'সম্পন্ন' : 'অপেক্ষমান'}
                </Badge>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">টাস্ক এবং সার্ভিস</h1>
                    <p className="text-muted-foreground">
                        মেরামত কাজ, সার্ভিস এবং কাস্টম অর্ডার পরিচালনা করুন
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            টাস্ক তৈরি করুন
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>নতুন টাস্ক তৈরি করুন</DialogTitle>
                            <DialogDescription>
                                ট্র্যাক করার জন্য একটি নতুন টাস্ক বা সার্ভিস রিকোয়েস্ট যোগ করুন।
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">টাস্ক শিরোনাম</Label>
                                <Input
                                    id="title"
                                    placeholder="যেমন: ল্যাপটপ স্ক্রিন প্রতিস্থাপন"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="customer">কাস্টমার (ঐচ্ছিক)</Label>
                                <CustomerSelector
                                    customers={customers}
                                    value={selectedCustomerId}
                                    onChange={setSelectedCustomerId}
                                    onSelectCustomer={(customer) => {
                                        if (customer) {
                                            setNewTaskCustomer(customer.name)
                                        } else {
                                            setNewTaskCustomer('')
                                        }
                                    }}
                                    placeholder="কাস্টমার নির্বাচন করুন..."
                                />
                                {selectedCustomerId === '' && (
                                    <Input
                                        id="customer-manual"
                                        placeholder="অথবা কাস্টমারের নাম লিখুন"
                                        value={newTaskCustomer}
                                        onChange={(e) => setNewTaskCustomer(e.target.value)}
                                        className="mt-2"
                                    />
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="price">মূল্য (বিক্রয়)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        placeholder="0.00"
                                        value={newTaskPrice}
                                        onChange={(e) => setNewTaskPrice(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="cost">খরচ (কেনা/খরচ)</Label>
                                    <Input
                                        id="cost"
                                        type="number"
                                        placeholder="0.00"
                                        value={newTaskCost}
                                        onChange={(e) => setNewTaskCost(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="dueDate">নির্ধারিত তারিখ (ঐচ্ছিক)</Label>
                                <Input
                                    id="dueDate"
                                    type="date"
                                    value={newTaskDueDate}
                                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">বিবরণ (ঐচ্ছিক)</Label>
                                <Textarea
                                    id="description"
                                    placeholder="টাস্ক সম্পর্কে বিস্তারিত..."
                                    value={newTaskDescription}
                                    onChange={(e) => setNewTaskDescription(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                                বাতিল
                            </Button>
                            <Button onClick={handleCreateTask}>টাস্ক তৈরি করুন</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">অপেক্ষমান টাস্ক</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingCount}</div>
                        <p className="text-xs text-muted-foreground">
                            যে টাস্কগুলো সম্পন্ন হওয়ার অপেক্ষায় আছে
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">অপেক্ষমান মূল্য</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.pendingValue)}</div>
                        <p className="text-xs text-muted-foreground">
                            অপেক্ষমান টাস্ক থেকে সম্ভাব্য আয়
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">সম্পন্ন টাস্ক</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completedCount}</div>
                        <p className="text-xs text-muted-foreground">
                            মোট সম্পন্ন টাস্ক
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="টাস্ক খুঁজুন..."
                        className="pl-8"
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select
                    value={statusFilter}
                    onValueChange={(value: 'all' | TaskStatus) => setStatusFilter(value)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="স্টেটাস অনুযায়ী ফিল্টার করুন" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">সকল স্টেটাস</SelectItem>
                        <SelectItem value="pending">অপেক্ষমান</SelectItem>
                        <SelectItem value="completed">সম্পন্ন</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <DataTable
                data={tasks}
                columns={columns}
                hideSearch={true}
                total={total}
                page={page}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={setLimit}
                loading={loading}
                actions={(task) => (
                    <div className="flex justify-end gap-2">
                        {task.status === 'pending' && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateStatus(task.id, 'completed')}
                            >
                                সম্পন্ন করুন
                            </Button>
                        )}
                        {task.status === 'completed' && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateStatus(task.id, 'pending')}
                            >
                                অপেক্ষমান
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive/90"
                            onClick={() => deleteTask(task.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            />
        </div>
    )
}
