'use client'

import { useState } from 'react'
import { Service } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label'
import { Plus, Pencil } from 'lucide-react'
import { ServiceFormBuilder } from './service-form-builder'

interface ServicesManagementProps {
    services: Service[]
    onSaveService: (service: Partial<Service>) => Promise<boolean>
}

export function ServicesManagement({ services, onSaveService }: ServicesManagementProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [currentService, setCurrentService] = useState<Partial<Service>>({})
    const [priceInput, setPriceInput] = useState('')
    const [loading, setLoading] = useState(false)

    const handleOpenDialog = (service?: Service) => {
        if (service) {
            setCurrentService(service)
            setPriceInput(service.price.toString())
        } else {
            setCurrentService({
                name: '',
                description: '',
                price: 0,
                category: '',
                is_active: true,
                form_config: [],
            })
            setPriceInput('0')
        }
        setIsDialogOpen(true)
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            const serviceToSave = {
                ...currentService,
                price: parseFloat(priceInput) || 0
            }
            await onSaveService(serviceToSave)
            setIsDialogOpen(false)
        } catch (error) {
            console.error('Failed to save service', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                </Button>
            </div>

            <div className="rounded-md border bg-white dark:bg-gray-950">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {services.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                    No services found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            services.map((service) => (
                                <TableRow key={service.id}>
                                    <TableCell className="font-medium text-gray-950 dark:text-gray-50">{service.name}</TableCell>
                                    <TableCell>{service.category}</TableCell>
                                    <TableCell className="font-medium">৳{service.price.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${service.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-850 dark:text-gray-400'}`}>
                                            {service.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(service)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{currentService.id ? 'Edit Service' : 'Add New Service'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={currentService.name || ''}
                                onChange={(e) => setCurrentService({ ...currentService, name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category">Category</Label>
                            <Input
                                id="category"
                                value={currentService.category || ''}
                                onChange={(e) => setCurrentService({ ...currentService, category: e.target.value })}
                                placeholder="e.g. Design, Development"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="price">Price</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                value={priceInput}
                                onChange={(e) => setPriceInput(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={currentService.description || ''}
                                onChange={(e) => setCurrentService({ ...currentService, description: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                id="active"
                                checked={currentService.is_active ?? true}
                                onCheckedChange={(checked) => setCurrentService({ ...currentService, is_active: checked })}
                            />
                            <Label htmlFor="active">Active</Label>
                        </div>

                        <div className="pt-4 border-t">
                            <ServiceFormBuilder
                                fields={currentService.form_config || []}
                                onChange={(fields) => setCurrentService({ ...currentService, form_config: fields })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Service'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
