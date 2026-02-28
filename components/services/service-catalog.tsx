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
import { ShoppingBag, FolderOpen, FileText, ExternalLink } from 'lucide-react'
import { ServiceOrderDialog } from './service-order-dialog'

interface ServiceCatalogProps {
    initialServices: Service[]
    userBalance: number
    onOrderSuccess?: () => void
    graphicsFilesUrl?: string
    certificateFormatsUrl?: string
}

interface ResourceCardProps {
    title: string
    description: string
    icon: React.ReactNode
    url: string
    colorClass: string
}

function ResourceCard({ title, description, icon, url, colorClass }: ResourceCardProps) {
    const isConfigured = !!url

    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow border-dashed">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <Badge variant="secondary" className="text-xs">ফ্রি</Badge>
                </div>
                <CardDescription className="line-clamp-2">{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <div className={`h-24 ${colorClass} rounded-md flex items-center justify-center`}>
                    {icon}
                </div>
            </CardContent>
            <CardFooter>
                {isConfigured ? (
                    <Button
                        className="w-full gap-2"
                        variant="outline"
                        asChild
                    >
                        <a href={url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                            Google Drive-এ দেখুন
                        </a>
                    </Button>
                ) : (
                    <Button className="w-full" variant="outline" disabled>
                        শীঘ্রই আসছে...
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}

export function ServiceCatalog({ initialServices, userBalance, onOrderSuccess, graphicsFilesUrl, certificateFormatsUrl }: ServiceCatalogProps) {
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

    const hasResourceLinks = graphicsFilesUrl !== undefined || certificateFormatsUrl !== undefined

    return (
        <div className="space-y-8">
            {/* Resource Links Section */}
            {hasResourceLinks && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 border-b pb-2 border-gray-200 dark:border-gray-700">
                        রিসোর্স ফাইলসমূহ
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ResourceCard
                            title="প্রয়োজনীয় গ্রাফিক্স ফাইল"
                            description="ব্যবসায়িক কাজে প্রয়োজনীয় গ্রাফিক্স টেমপ্লেট ও ফাইলসমূহ ডাউনলোড করুন"
                            icon={<FolderOpen className="w-10 h-10 text-purple-500 opacity-70" />}
                            url={graphicsFilesUrl ?? ''}
                            colorClass="bg-purple-50 dark:bg-purple-950/30"
                        />
                        <ResourceCard
                            title="গুরুত্বপূর্ণ সনদ ফরমেট"
                            description="বিভিন্ন ধরনের সনদপত্র ও সার্টিফিকেটের রেডিমেড ফরমেট ডাউনলোড করুন"
                            icon={<FileText className="w-10 h-10 text-green-500 opacity-70" />}
                            url={certificateFormatsUrl ?? ''}
                            colorClass="bg-green-50 dark:bg-green-950/30"
                        />
                    </div>
                </div>
            )}

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

