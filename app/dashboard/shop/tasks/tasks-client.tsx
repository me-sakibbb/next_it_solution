'use client'

import { useState } from 'react'
import { useShop } from '@/hooks/use-shop'
import { useShopTasks } from '@/hooks/use-shop-tasks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Plus, Search, Trash2, CheckCircle, Clock } from 'lucide-react'
import { TaskStatus } from '@/lib/types'
import { toast } from 'sonner'
import { CustomerSelector } from '@/components/dashboard/shop/customer-selector'

interface TasksClientProps {
    customers: any[]
}

export function TasksClient({ customers }: TasksClientProps) {
    const { shop } = useShop()
    const { tasks, loading, createTask, updateStatus, deleteTask } = useShopTasks(shop?.id)

    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all')

    // Form state
    const [newTaskTitle, setNewTaskTitle] = useState('')
    const [newTaskDescription, setNewTaskDescription] = useState('')
    const [newTaskPrice, setNewTaskPrice] = useState('')
    const [newTaskCustomer, setNewTaskCustomer] = useState('')
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
    const [newTaskDueDate, setNewTaskDueDate] = useState('')

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
                customer_name: newTaskCustomer, // We still use the name for now as the schema expects it
                due_date: newTaskDueDate ? new Date(newTaskDueDate).toISOString() : undefined,
            })
            setIsCreateOpen(false)
            // Reset form
            setNewTaskTitle('')
            setNewTaskDescription('')
            setNewTaskPrice('')
            setNewTaskCustomer('')
            setSelectedCustomerId('')
            setNewTaskDueDate('')
        } catch (error) {
            // Error handled in hook
        }
    }

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter
        return matchesSearch && matchesStatus
    })

    // Calculate stats
    const pendingCount = tasks.filter(t => t.status === 'pending').length
    const completedCount = tasks.filter(t => t.status === 'completed').length
    const pendingValue = tasks
        .filter(t => t.status === 'pending')
        .reduce((sum, t) => sum + Number(t.price), 0)

    const formatCurrency = (amount: number) => {
        return `৳${new Intl.NumberFormat('en-BD', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount)}`
    }

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
                                {/* Hidden input to store custom name if needed, or fallback */}
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
                            <div className="grid gap-2">
                                <Label htmlFor="price">মূল্য</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    placeholder="0.00"
                                    value={newTaskPrice}
                                    onChange={(e) => setNewTaskPrice(e.target.value)}
                                />
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

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">অপেক্ষমান টাস্ক</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingCount}</div>
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
                        <div className="text-2xl font-bold">{formatCurrency(pendingValue)}</div>
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
                        <div className="text-2xl font-bold">{completedCount}</div>
                        <p className="text-xs text-muted-foreground">
                            মোট সম্পন্ন টাস্ক
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="টাস্ক খুঁজুন..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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

            {/* Tasks Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>টাস্ক</TableHead>
                            <TableHead>কাস্টমার</TableHead>
                            <TableHead>নির্ধারিত তারিখ</TableHead>
                            <TableHead>মূল্য</TableHead>
                            <TableHead>স্টেটাস</TableHead>
                            <TableHead className="text-right">অ্যাকশন</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    টাস্ক লোড হচ্ছে...
                                </TableCell>
                            </TableRow>
                        ) : filteredTasks.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    কোনো টাস্ক পাওয়া যায়নি
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTasks.map((task) => (
                                <TableRow key={task.id}>
                                    <TableCell>
                                        <div className="font-medium">{task.title}</div>
                                        {task.description && (
                                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                {task.description}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>{task.customer_name || '-'}</TableCell>
                                    <TableCell>
                                        {task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : '-'}
                                    </TableCell>
                                    <TableCell>{formatCurrency(task.price)}</TableCell>
                                    <TableCell>
                                        <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                                            {task.status === 'completed' ? 'সম্পন্ন' : 'অপেক্ষমান'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
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
                                                    অপেক্ষমান হিসেবে চিহ্নিত করুন
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
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
