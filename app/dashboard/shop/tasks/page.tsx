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

export default function ShopTasksPage() {
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
                customer_name: newTaskCustomer,
                due_date: newTaskDueDate ? new Date(newTaskDueDate).toISOString() : undefined,
            })
            setIsCreateOpen(false)
            // Reset form
            setNewTaskTitle('')
            setNewTaskDescription('')
            setNewTaskPrice('')
            setNewTaskCustomer('')
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
                    <h1 className="text-3xl font-bold tracking-tight">Tasks & Services</h1>
                    <p className="text-muted-foreground">
                        Manage repair jobs, services, and custom orders
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Task
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Task</DialogTitle>
                            <DialogDescription>
                                Add a new task or service request to track.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Task Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g., Laptop Screen Replacement"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="customer">Customer Name (Optional)</Label>
                                <Input
                                    id="customer"
                                    placeholder="e.g., John Doe"
                                    value={newTaskCustomer}
                                    onChange={(e) => setNewTaskCustomer(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="price">Price</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    placeholder="0.00"
                                    value={newTaskPrice}
                                    onChange={(e) => setNewTaskPrice(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="dueDate">Due Date (Optional)</Label>
                                <Input
                                    id="dueDate"
                                    type="date"
                                    value={newTaskDueDate}
                                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Details about the task..."
                                    value={newTaskDescription}
                                    onChange={(e) => setNewTaskDescription(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateTask}>Create Task</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Tasks waiting to be completed
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Value</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(pendingValue)}</div>
                        <p className="text-xs text-muted-foreground">
                            Potential revenue from pending tasks
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Total tasks completed
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tasks..."
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
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Tasks Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Task</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    Loading tasks...
                                </TableCell>
                            </TableRow>
                        ) : filteredTasks.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No tasks found
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
                                            {task.status === 'completed' ? 'Completed' : 'Pending'}
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
                                                    Complete
                                                </Button>
                                            )}
                                            {task.status === 'completed' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => updateStatus(task.id, 'pending')}
                                                >
                                                    Mark Pending
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
