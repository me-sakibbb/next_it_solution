'use client'

import { useState } from 'react'
import { Service } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { ShoppingBag } from 'lucide-react'
import { ServiceOrderDialog } from './service-order-dialog'

interface ServiceCatalogProps {
    initialServices: Service[]
    userBalance: number
    onOrderSuccess?: () => void
}

export function ServiceCatalog({ initialServices, userBalance, onOrderSuccess }: ServiceCatalogProps) {
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)

    const handleOrderClick = (service: Service) => {
        setSelectedService(service)
        setIsOrderDialogOpen(true)
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

            <ServiceOrderDialog
                service={selectedService}
                isOpen={isOrderDialogOpen}
                onOpenChange={setIsOrderDialogOpen}
                userBalance={userBalance}
                onOrderSuccess={onOrderSuccess}
            />
        </div>
    )
}
