'use client'

import { useState, useEffect } from 'react'
import { updateUserSubscription } from '@/actions/superadmin'
import { updateUserInfo, deleteUser } from '@/actions/superadmin-server'
import { useRouter } from 'next/navigation'
import { Search, Pencil, Crown, CheckCircle2, XCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import type { User, Subscription, SubscriptionPlanType, SubscriptionStatus } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

type UserWithSubscription = User & {
    subscription: Subscription | null
}

interface UsersTableProps {
    initialUsers: UserWithSubscription[]
    totalCount: number
    currentPage: number
    onParamsChange: (params: {
        page?: number
        search?: string
        plan?: string
        balanceFilter?: string
        sortBy?: string
        sortOrder?: 'asc' | 'desc'
    }) => void
    params: {
        search: string
        plan: string
        balanceFilter: string
        sortBy: string
        sortOrder: 'asc' | 'desc'
        pageSize: number
    }
}

// Matches SubscriptionPlanType in lib/types.ts
const PLAN_OPTIONS: { value: SubscriptionPlanType; label: string }[] = [
    { value: 'trial', label: 'Free Plan' },
    { value: 'basic_bit', label: 'Basic Bit' },
    { value: 'advance_plus', label: 'Advance Plus' },
    { value: 'premium_power', label: 'Premium Power' },
]

// Matches SubscriptionStatus in lib/types.ts
const SUB_STATUS_OPTIONS: { value: SubscriptionStatus; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'expired', label: 'Expired' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'suspended', label: 'Suspended' },
]

const PLAN_BADGE_COLORS: Record<SubscriptionPlanType, string> = {
    trial: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    basic_bit: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    advance_plus: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    premium_power: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
}

const PLAN_LABELS: Record<SubscriptionPlanType, string> = {
    trial: 'Free Plan',
    basic_bit: 'Basic Bit',
    advance_plus: 'Advance+',
    premium_power: 'Prem. Power',
}

const AVAILABLE_FEATURES = [
    { id: 'shop', label: 'শপ ম্যানেজমেন্ট' },
    { id: 'photo-enhancer', label: 'এআই ফটো এডিটর' },
    { id: 'cv-builder', label: 'এআই সিভি বিল্ডার' },
    { id: 'print-ready', label: 'প্রিন্ট রেডি' },
    { id: 'autofill-genius', label: 'Autofill Genius AI' },
    { id: 'instant-autofill', label: 'Instant Autofill Engine' },
    { id: 'flight-tickets', label: 'ফ্লাইট টিকেট বুকিং' },
    { id: 'graphics-files', label: 'প্রয়োজনীয় গ্রাফিক্স ফাইল' },
    { id: 'certificate-formats', label: 'গুরুত্বপূর্ণ সনদ ফরমেট' }
]

interface EditState {
    full_name: string
    phone: string
    shop_address: string
    balance: string
    is_active: boolean
    subPlan: SubscriptionPlanType
    subStatus: SubscriptionStatus
    subEndDate: string
    disabled_features: string[]
}

export function UsersTable({
    initialUsers,
    totalCount,
    currentPage,
    onParamsChange,
    params
}: UsersTableProps) {
    const [search, setSearch] = useState(params.search)
    const [users, setUsers] = useState(initialUsers)
    const [editUser, setEditUser] = useState<UserWithSubscription | null>(null)
    const [editState, setEditState] = useState<EditState | null>(null)
    const [loading, setLoading] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    // Sync local users when prop changes
    useEffect(() => {
        setUsers(initialUsers)
    }, [initialUsers])

    // Sync local search when reset or changed from outside
    useEffect(() => {
        setSearch(params.search)
    }, [params.search])

    const filtered = users // Data is now filtered server-side

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        onParamsChange({ search, page: 1 })
    }

    const clearFilters = () => {
        setSearch('')
        onParamsChange({
            search: '',
            plan: 'all',
            balanceFilter: 'all',
            sortBy: 'created_at',
            sortOrder: 'desc',
            page: 1
        })
    }

    const handleOpenEdit = (user: UserWithSubscription) => {
        setEditUser(user)
        setEditState({
            full_name: user.full_name ?? '',
            phone: user.phone ?? '',
            shop_address: user.shop_address ?? '',
            balance: user.balance?.toString() ?? '0',
            is_active: user.is_active ?? true,
            subPlan: (user.subscription?.plan_type ?? 'trial') as SubscriptionPlanType,
            subStatus: (user.subscription?.status ?? 'active') as SubscriptionStatus,
            subEndDate: user.subscription?.subscription_end_date
                ? user.subscription.subscription_end_date.slice(0, 10)
                : '',
            disabled_features: user.disabled_features || [],
        })
    }

    const handleSave = async () => {
        if (!editUser || !editState) return
        setLoading(true)
        try {
            await updateUserInfo(editUser.id, {
                full_name: editState.full_name,
                phone: editState.phone,
                shop_address: editState.shop_address,
                balance: parseFloat(editState.balance),
                is_active: editState.is_active,
                disabled_features: editState.disabled_features,
            })
            await updateUserSubscription(
                editUser.id,
                editState.subPlan,
                editState.subStatus,
                editState.subEndDate
                    ? new Date(editState.subEndDate).toISOString()
                    : undefined
            )
            setUsers((prev) =>
                prev.map((u): UserWithSubscription =>
                    u.id === editUser.id
                        ? {
                            ...u,
                            full_name: editState.full_name,
                            phone: editState.phone,
                            shop_address: editState.shop_address,
                            balance: parseFloat(editState.balance),
                            is_active: editState.is_active,
                            disabled_features: editState.disabled_features,
                            subscription: {
                                ...(u.subscription ?? {
                                    id: '',
                                    user_id: u.id,
                                    auto_renew: false,
                                    created_at: new Date().toISOString(),
                                    updated_at: new Date().toISOString(),
                                }),
                                plan_type: editState.subPlan as SubscriptionPlanType,
                                status: editState.subStatus as SubscriptionStatus,
                                subscription_end_date: editState.subEndDate
                                    ? new Date(editState.subEndDate).toISOString()
                                    : undefined,
                            } as Subscription,
                        }
                        : u
                )
            )
            setEditUser(null)
            setEditState(null)
        } catch (err) {
            console.error(err)
            alert('Failed to save changes.')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteUser = async (userId: string, identifier: string) => {
        if (!confirm(`Are you sure you want to permanently delete user "${identifier}"? This action cannot be undone and will delete all their shops, subscriptions, and associated files.`)) {
            return
        }
        setDeletingId(userId)
        try {
            await deleteUser(userId)
            setUsers((prev) => prev.filter((u) => u.id !== userId))
            alert('User deleted successfully.')
        } catch (err: any) {
            console.error(err)
            alert(err.message || 'Failed to delete user.')
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4">
                <form onSubmit={handleSearch} className="flex-1 min-w-[200px] space-y-1.5">
                    <Label className="text-xs">Search</Label>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Email or Name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </form>

                <div className="w-[140px] space-y-1.5">
                    <Label className="text-xs">Plan</Label>
                    <Select value={params.plan} onValueChange={(val) => onParamsChange({ plan: val, page: 1 })}>
                        <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Plan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Plans</SelectItem>
                            {PLAN_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-[140px] space-y-1.5">
                    <Label className="text-xs">Balance</Label>
                    <Select value={params.balanceFilter} onValueChange={(val) => onParamsChange({ balanceFilter: val, page: 1 })}>
                        <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Balance" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="zero">Zero Balance</SelectItem>
                            <SelectItem value="positive">Has Balance</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-[180px] space-y-1.5">
                    <Label className="text-xs">Sort By</Label>
                    <Select
                        value={`${params.sortBy}:${params.sortOrder}`}
                        onValueChange={(val) => {
                            const [sortBy, sortOrder] = val.split(':') as [string, 'asc' | 'desc']
                            onParamsChange({ sortBy, sortOrder, page: 1 })
                        }}
                    >
                        <SelectTrigger className="bg-background">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="created_at:desc">Newest First</SelectItem>
                            <SelectItem value="created_at:asc">Oldest First</SelectItem>
                            <SelectItem value="balance:desc">Highest Balance</SelectItem>
                            <SelectItem value="balance:asc">Lowest Balance</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex gap-2">
                    <Button type="submit">Filter</Button>
                    <Button variant="ghost" type="button" onClick={clearFilters}>Reset</Button>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Balance</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Subscription</TableHead>
                            <TableHead>Sub Status</TableHead>
                            <TableHead>Sub Expiry</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.map((user) => {
                            const sub = user.subscription
                            const planKey = (sub?.plan_type ?? 'trial') as SubscriptionPlanType
                            const planColor = PLAN_BADGE_COLORS[planKey] ?? PLAN_BADGE_COLORS.trial
                            const planLabel = PLAN_LABELS[planKey] ?? planKey
                            return (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{user.full_name || 'No Name'}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                        {user.phone || '—'}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                                        {user.shop_address || '—'}
                                    </TableCell>
                                    <TableCell className="capitalize">{user.role}</TableCell>
                                    <TableCell className="font-medium">
                                        {formatCurrency(user.balance || 0)}
                                    </TableCell>
                                    <TableCell>
                                        {user.is_active ? (
                                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                                <CheckCircle2 className="h-3.5 w-3.5" /> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs text-red-500 font-medium">
                                                <XCircle className="h-3.5 w-3.5" /> Inactive
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${planColor}`}>
                                            <Crown className="h-3 w-3" />
                                            {planLabel}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {sub ? (
                                            <Badge
                                                variant={
                                                    sub.status === 'active'
                                                        ? 'default'
                                                        : sub.status === 'expired' || sub.status === 'cancelled'
                                                            ? 'destructive'
                                                            : 'secondary'
                                                }
                                                className="text-xs"
                                            >
                                                {sub.status}
                                            </Badge>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {sub?.subscription_end_date
                                            ? new Date(sub.subscription_end_date).toLocaleDateString()
                                            : sub?.trial_end_date
                                                ? `Free: ${new Date(sub.trial_end_date).toLocaleDateString()}`
                                                : '—'}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleOpenEdit(user)}
                                                className="gap-1.5"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteUser(user.id, user.email || user.full_name || '')}
                                                disabled={deletingId === user.id}
                                                className="gap-1.5"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                {deletingId === user.id ? 'Deleting...' : 'Delete'}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-2">
                <div className="text-sm text-muted-foreground">
                    Total {totalCount} users
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onParamsChange({ page: currentPage - 1 })}
                        disabled={currentPage <= 1 || loading}
                    >
                        Previous
                    </Button>
                    <div className="text-sm font-medium">
                        Page {currentPage} of {Math.ceil(totalCount / params.pageSize)}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onParamsChange({ page: currentPage + 1 })}
                        disabled={currentPage >= Math.ceil(totalCount / params.pageSize) || loading}
                    >
                        Next
                    </Button>
                </div>
            </div>

            {/* Unified Edit Modal */}
            <Dialog
                open={!!editUser}
                onOpenChange={(open) => {
                    if (!open) { setEditUser(null); setEditState(null) }
                }}
            >
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                            Edit User — {editUser?.full_name || editUser?.email}
                        </DialogTitle>
                    </DialogHeader>

                    {editState && (
                        <div className="space-y-5 py-2">
                            <div className="space-y-3">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    User Info
                                </p>
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input
                                        value={editState.full_name}
                                        onChange={(e) =>
                                            setEditState((s) => s && { ...s, full_name: e.target.value })
                                        }
                                        placeholder="Full name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone Number</Label>
                                    <Input
                                        value={editState.phone}
                                        onChange={(e) =>
                                            setEditState((s) => s && { ...s, phone: e.target.value })
                                        }
                                        placeholder="Phone number"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Shop Address</Label>
                                    <Input
                                        value={editState.shop_address}
                                        onChange={(e) =>
                                            setEditState((s) => s && { ...s, shop_address: e.target.value })
                                        }
                                        placeholder="Shop address"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Balance (৳)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={editState.balance}
                                        onChange={(e) =>
                                            setEditState((s) => s && { ...s, balance: e.target.value })
                                        }
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Account Status</Label>
                                    <Select
                                        value={editState.is_active ? 'active' : 'inactive'}
                                        onValueChange={(v) =>
                                            setEditState((s) => s && { ...s, is_active: v === 'active' })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Subscription
                                </p>
                                <div className="space-y-2">
                                    <Label>Plan</Label>
                                    <Select
                                        value={editState.subPlan}
                                        onValueChange={(v) =>
                                            setEditState((s) => s && { ...s, subPlan: v as SubscriptionPlanType })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PLAN_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Subscription Status</Label>
                                    <Select
                                        value={editState.subStatus}
                                        onValueChange={(v) =>
                                            setEditState((s) => s && { ...s, subStatus: v as SubscriptionStatus })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SUB_STATUS_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Subscription End Date</Label>
                                    <Input
                                        type="date"
                                        value={editState.subEndDate}
                                        onChange={(e) =>
                                            setEditState((s) => s && { ...s, subEndDate: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                            <Separator />

                            <div className="space-y-3">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Feature Access
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    {AVAILABLE_FEATURES.map(feature => {
                                        const isEnabled = !editState.disabled_features.includes(feature.id)
                                        return (
                                            <div key={feature.id} className="flex items-start space-x-2">
                                                <Checkbox 
                                                    id={`feature-${feature.id}`}
                                                    checked={isEnabled}
                                                    onCheckedChange={(checked) => {
                                                        setEditState(s => {
                                                            if (!s) return s
                                                            if (checked) {
                                                                return { ...s, disabled_features: s.disabled_features.filter(id => id !== feature.id) }
                                                            } else {
                                                                return { ...s, disabled_features: [...s.disabled_features, feature.id] }
                                                            }
                                                        })
                                                    }}
                                                />
                                                <Label htmlFor={`feature-${feature.id}`} className="text-sm font-medium leading-none cursor-pointer">
                                                    {feature.label}
                                                </Label>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => { setEditUser(null); setEditState(null) }}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
