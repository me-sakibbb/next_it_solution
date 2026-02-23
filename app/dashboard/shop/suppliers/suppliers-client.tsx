'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { Plus, Search, Pencil, DollarSign, ExternalLink, Users, AlertCircle } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { SupplierDialog } from './supplier-dialog'
import { DuePaymentDialog } from './due-payment-dialog'
import { formatCurrency } from '@/lib/utils'
import { useSuppliers } from '@/hooks/use-suppliers'

interface SuppliersClientProps {
    shopId: string
}

export function SuppliersClient({ shopId }: SuppliersClientProps) {
    const [selectedSupplier, setSelectedSupplier] = useState<any | null>(null)
    const [showSupplierDialog, setShowSupplierDialog] = useState(false)
    const [showDueDialog, setShowDueDialog] = useState(false)

    const {
        suppliers,
        total,
        loading,
        page,
        limit,
        setPage,
        setLimit,
        setSearch,
        setFilters,
        refresh,
        stats
    } = useSuppliers(shopId)

    const columns = [
        {
            key: 'name',
            label: 'সাপ্লায়ার',
            render: (supplier: any) => (
                <div>
                    <div className="font-medium text-foreground">{supplier.name}</div>
                    {supplier.contact_person && (
                        <div className="text-sm text-muted-foreground">{supplier.contact_person}</div>
                    )}
                </div>
            ),
        },
        {
            key: 'phone',
            label: 'ফোন',
            render: (supplier: any) => supplier.phone || '-',
        },
        {
            key: 'address',
            label: 'ঠিকানা',
            render: (supplier: any) => (
                <div className="text-sm max-w-[200px] truncate" title={supplier.address}>
                    {supplier.address ? `${supplier.address}${supplier.city ? `, ${supplier.city}` : ''}` : '-'}
                </div>
            ),
        },
        {
            key: 'due',
            label: 'বকেয়া (Due)',
            render: (supplier: any) => {
                const dueAmount = Number(supplier.due) || 0;
                return (
                    <div className={`font-semibold ${dueAmount > 0 ? 'text-destructive' : 'text-green-600'}`}>
                        {formatCurrency(dueAmount)}
                    </div>
                )
            },
        },
    ]

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="p-6 flex flex-row items-center justify-between space-y-0">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">মোট সাপ্লায়ার</p>
                            <p className="text-2xl font-bold">{stats.totalSuppliers}</p>
                        </div>
                        <Users className="h-8 w-8 text-muted-foreground/30" />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex flex-row items-center justify-between space-y-0">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">মোট বকেয়া (Due)</p>
                            <p className="text-2xl font-bold text-destructive">{formatCurrency(stats.totalDue)}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-destructive/30" />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex flex-row items-center justify-between space-y-0">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">বকেয়াদারি সাপ্লায়ার</p>
                            <p className="text-2xl font-bold text-orange-600">{stats.suppliersWithDueCount} জন</p>
                        </div>
                        <AlertCircle className="h-8 w-8 text-orange-600/30" />
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <Button onClick={() => {
                    setSelectedSupplier(null)
                    setShowSupplierDialog(true)
                }}>
                    <Plus className="h-4 w-4 mr-2" />
                    সাপ্লায়ার যোগ করুন
                </Button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="নাম বা মোবাইল নম্বর খুঁজুন..."
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>
            </div>

            <DataTable
                data={suppliers}
                columns={columns}
                hideSearch={true}
                total={total}
                page={page}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={setLimit}
                loading={loading}
                onRowClick={(supplier) => {
                    setSelectedSupplier(supplier)
                    setShowSupplierDialog(true)
                }}
                actions={(supplier) => (
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1 border-primary/20 text-primary hover:bg-primary/10"
                            onClick={(e) => {
                                e.stopPropagation()
                                setSelectedSupplier(supplier)
                                setShowDueDialog(true)
                            }}
                        >
                            <DollarSign className="h-3.5 w-3.5" />
                            পে / অ্যাডজাস্ট
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                                e.stopPropagation()
                                setSelectedSupplier(supplier)
                                setShowSupplierDialog(true)
                            }}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            />

            <SupplierDialog
                open={showSupplierDialog}
                onOpenChange={setShowSupplierDialog}
                supplier={selectedSupplier}
                shopId={shopId}
                onSuccess={() => {
                    refresh()
                    setShowSupplierDialog(false)
                }}
            />

            <DuePaymentDialog
                open={showDueDialog}
                onOpenChange={setShowDueDialog}
                supplier={selectedSupplier}
                shopId={shopId}
                onSuccess={() => {
                    setShowDueDialog(false)
                    refresh()
                }}
            />
        </div>
    )
}
