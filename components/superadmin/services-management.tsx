'use client'

import { useState, useEffect } from 'react'
import { Service } from '@/lib/types'
import { upsertService } from '@/actions/superadmin'
import { useRouter } from 'next/navigation'
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
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Trash2, ClipboardList } from 'lucide-react'
import { ServiceFormBuilder } from './service-form-builder'

interface ServicesManagementProps {
    initialServices: Service[]
}

export function ServicesManagement({ initialServices }: ServicesManagementProps) {
    const router = useRouter()
    const [services, setServices] = useState(initialServices)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [currentService, setCurrentService] = useState<Partial<Service>>({})
    const [priceInput, setPriceInput] = useState('')
    const [loading, setLoading] = useState(false)

    // Synchronize local state with props when they change
    useEffect(() => {
        setServices(initialServices);
    }, [initialServices]);

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
            await upsertService(serviceToSave)
            setIsDialogOpen(false)
            router.refresh()
        } catch (error) {
            console.error('Failed to save service', error)
            alert('Failed to save service')
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

            <div className="rounded-md border">
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
                        {services.map((service) => (
                            <TableRow key={service.id}>
                                <TableCell className="font-medium">{service.name}</TableCell>
                                <TableCell>{service.category}</TableCell>
                                <TableCell>${service.price.toFixed(2)}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs ${service.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {service.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(service)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
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
                                checked={currentService.is_active}
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
