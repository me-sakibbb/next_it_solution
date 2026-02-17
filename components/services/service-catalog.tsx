'use client'

import { useState } from 'react'
import { Service } from '@/lib/types'
import { createServiceOrder } from '@/actions/services'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, Loader2 } from 'lucide-react'

interface ServiceCatalogProps {
    initialServices: any[]
    userBalance: number
}

export function ServiceCatalog({ initialServices, userBalance }: ServiceCatalogProps) {
    const router = useRouter()
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
    const [requirements, setRequirements] = useState('')
    const [loading, setLoading] = useState(false)

    const handleOrderClick = (service: Service) => {
        setSelectedService(service)
        setRequirements('')
        setIsOrderDialogOpen(true)
    }

    const handleConfirmOrder = async () => {
        if (!selectedService) return
        setLoading(true)
        try {
            await createServiceOrder(selectedService.id, requirements, selectedService.price)
            setIsOrderDialogOpen(false)
            router.refresh()
            // Optional: Redirect to orders page or show success toast
            alert('Order placed successfully!')
        } catch (error: any) {
            console.error('Failed to place order', error)
            alert(error.message || 'Failed to place order')
        } finally {
            setLoading(false)
        }
    }

    // Group services by category
    const groupedServices = initialServices.reduce((acc, service) => {
        const category = service.category || 'Other'
        if (!acc[category]) acc[category] = []
        acc[category].push(service)
        return acc
    }, {} as Record<string, Service[]>)

    return (
        <div className="space-y-8">
            {Object.entries(groupedServices).map(([category, services]) => (
                <div key={category} className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 border-b pb-2 border-gray-200 dark:border-gray-700">
                        {category}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service) => (
                            <Card key={service.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg">{service.name}</CardTitle>
                                        <Badge variant="secondary">${service.price}</Badge>
                                    </div>
                                    <CardDescription className="line-clamp-2">{service.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    {/* Image placeholder or details could go here */}
                                    <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center text-gray-400">
                                        <ShoppingBag className="w-8 h-8 opacity-20" />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className="w-full"
                                        onClick={() => handleOrderClick(service)}
                                    >
                                        Order Now
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}

            <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Order</DialogTitle>
                        <DialogDescription>
                            Ordering: <span className="font-semibold text-primary">{selectedService?.name}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Service Price:</span>
                                <span className="font-medium">${selectedService?.price.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Your Balance:</span>
                                <span className="font-medium">${userBalance.toFixed(2)}</span>
                            </div>
                            <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                                <span>Remaining:</span>
                                <span className={userBalance >= (selectedService?.price || 0) ? 'text-green-600' : 'text-red-600'}>
                                    ${(userBalance - (selectedService?.price || 0)).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {userBalance < (selectedService?.price || 0) && (
                            <div className="p-3 bg-red-100 text-red-800 rounded-md text-sm">
                                Insufficient balance. Please contact admin to top up.
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="requirements">Requirements / Instructions</Label>
                            <Textarea
                                id="requirements"
                                value={requirements}
                                onChange={(e) => setRequirements(e.target.value)}
                                placeholder="Describe what you need..."
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleConfirmOrder}
                            disabled={loading || userBalance < (selectedService?.price || 0)}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : 'Confirm & Pay'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
