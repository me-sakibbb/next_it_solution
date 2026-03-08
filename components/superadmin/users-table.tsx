'use client'

import { useState } from 'react'
import { updateUserSubscription } from '@/actions/superadmin'
import { updateUserInfo } from '@/actions/superadmin-server'
import { useRouter } from 'next/navigation'
import { Search, Pencil, Crown, CheckCircle2, XCircle } from 'lucide-react'
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
import type { User, Subscription, SubscriptionPlanType, SubscriptionStatus } from '@/lib/types'

type UserWithSubscription = User & {
    subscription: Subscription | null
}

interface UsersTableProps {
    initialUsers: UserWithSubscription[]
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

interface EditState {
    full_name: string
    phone: string
    balance: string
    is_active: boolean
    subPlan: SubscriptionPlanType
    subStatus: SubscriptionStatus
    subEndDate: string
}

export function UsersTable({ initialUsers }: UsersTableProps) {
    const router = useRouter()
    const [search, setSearch] = useState('')
    const [users, setUsers] = useState(initialUsers)
    const [editUser, setEditUser] = useState<UserWithSubscription | null>(null)
    const [editState, setEditState] = useState<EditState | null>(null)
    const [loading, setLoading] = useState(false)

    const filtered = search
        ? users.filter(
            (u) =>
                u.email.toLowerCase().includes(search.toLowerCase()) ||
                (u.full_name ?? '').toLowerCase().includes(search.toLowerCase())
        )
        : users

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        router.push(`/superadmin/users?search=${search}`)
    }

    const handleOpenEdit = (user: UserWithSubscription) => {
        setEditUser(user)
        setEditState({
            full_name: user.full_name ?? '',
            phone: user.phone ?? '',
            balance: user.balance?.toString() ?? '0',
            is_active: user.is_active ?? true,
            subPlan: (user.subscription?.plan_type ?? 'trial') as SubscriptionPlanType,
            subStatus: (user.subscription?.status ?? 'active') as SubscriptionStatus,
            subEndDate: user.subscription?.subscription_end_date
                ? user.subscription.subscription_end_date.slice(0, 10)
                : '',
        })
    }

    const handleSave = async () => {
        if (!editUser || !editState) return
        setLoading(true)
        try {
            await updateUserInfo(editUser.id, {
                full_name: editState.full_name,
                phone: editState.phone,
                balance: parseFloat(editState.balance),
                is_active: editState.is_active,
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
                            balance: parseFloat(editState.balance),
                            is_active: editState.is_active,
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
                            <TableHead>Phone</TableHead>
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
                                    <TableCell className="capitalize">{user.role}</TableCell>
                                    <TableCell className="font-medium">
                                        ${user.balance?.toFixed(2) || '0.00'}
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
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleOpenEdit(user)}
                                            className="gap-1.5"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                            Edit
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Unified Edit Modal */}
            <Dialog
                open={!!editUser}
                onOpenChange={(open) => {
                    if (!open) { setEditUser(null); setEditState(null) }
                }}
            >
                <DialogContent className="max-w-lg">
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
                                    <Label>Balance ($)</Label>
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
