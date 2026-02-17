'use client'

import { useState } from 'react'
import { User } from '@/lib/types'
import { updateUserBalance } from '@/actions/superadmin'
import { useRouter } from 'next/navigation'
import { Search, DollarSign, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label'

interface UsersTableProps {
    initialUsers: User[]
}

export function UsersTable({ initialUsers }: UsersTableProps) {
    const router = useRouter()
    const [search, setSearch] = useState('')
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [balanceAmount, setBalanceAmount] = useState('')
    const [isBalanceDialogOpen, setIsBalanceDialogOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        router.push(`/superadmin/users?search=${search}`)
    }

    const handleOpenBalanceDialog = (user: User) => {
        setSelectedUser(user)
        setBalanceAmount(user.balance?.toString() || '0')
        setIsBalanceDialogOpen(true)
    }

    const handleUpdateBalance = async () => {
        if (!selectedUser) return
        setLoading(true)
        try {
            await updateUserBalance(selectedUser.id, parseFloat(balanceAmount))
            setIsBalanceDialogOpen(false)
            router.refresh()
        } catch (error) {
            console.error('Failed to update balance', error)
            alert('Failed to update balance')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Button type="submit">Search</Button>
            </form>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Balance</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div>
                                        <div className="font-medium">{user.full_name || 'No Name'}</div>
                                        <div className="text-sm text-gray-500">{user.email}</div>
                                    </div>
                                </TableCell>
                                <TableCell className="capitalize">{user.role}</TableCell>
                                <TableCell>${user.balance?.toFixed(2) || '0.00'}</TableCell>
                                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenBalanceDialog(user)}>
                                        <DollarSign className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isBalanceDialogOpen} onOpenChange={setIsBalanceDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Balance</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Current Balance: ${selectedUser?.balance?.toFixed(2) || '0.00'}</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={balanceAmount}
                                onChange={(e) => setBalanceAmount(e.target.value)}
                                placeholder="Enter new balance"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBalanceDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateBalance} disabled={loading}>
                            {loading ? 'Updating...' : 'Update Balance'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
