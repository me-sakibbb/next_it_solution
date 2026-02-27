'use client'

import { useState } from 'react'
import { Service } from '@/lib/types'
import { createServiceOrder } from '@/actions/services'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
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
import { Loader2, Info } from 'lucide-react'
import { ServiceOrderForm } from './service-order-form'

interface ServiceOrderDialogProps {
    service: Service | null
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    userBalance: number
    onOrderSuccess?: () => void
}

export function ServiceOrderDialog({ service, isOpen, onOpenChange, userBalance, onOrderSuccess }: ServiceOrderDialogProps) {
    const router = useRouter()
    const [requirements, setRequirements] = useState('')
    const [formValues, setFormValues] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState(false)

    const handleConfirmOrder = async () => {
        if (!service) return
        setLoading(true)
        try {
            let finalRequirements = requirements

            if (service.form_config && service.form_config.length > 0) {
                const formDetails = service.form_config.map(field => {
                    const value = formValues[field.id]
                    const displayValue = value === undefined || value === ''
                        ? '(N/A)'
                        : (typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value)
                    return `${field.label}: ${displayValue}`
                }).join('\n')

                finalRequirements = requirements
                    ? `--- Form Details ---\n${formDetails}\n\n--- Additional Notes ---\n${requirements}`
                    : formDetails
            }

            await createServiceOrder(service.id, finalRequirements, service.price)
            onOpenChange(false)
            setRequirements('')
            setFormValues({})
            router.refresh()
            if (onOrderSuccess) {
                onOrderSuccess()
            }
            alert('Order placed successfully!')
        } catch (error: any) {
            console.error('Failed to place order', error)
            alert(error.message || 'Failed to place order')
        } finally {
            setLoading(false)
        }
    }

    if (!service) return null

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Confirm Order</DialogTitle>
                    <DialogDescription>
                        Ordering: <span className="font-semibold text-primary">{service.name}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Service Price:</span>
                            <span className="font-medium">${service.price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Your Balance:</span>
                            <span className="font-medium">${userBalance.toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                            <span>Remaining:</span>
                            <span className={userBalance >= (service.price || 0) ? 'text-green-600' : 'text-red-600'}>
                                ${(userBalance - (service.price || 0)).toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {userBalance < (service.price || 0) && (
                        <div className="p-3 bg-red-100 text-red-800 rounded-md text-sm">
                            Insufficient balance. Please contact admin to top up.
                        </div>
                    )}

                    {service.form_config && service.form_config.length > 0 && (
                        <div className="space-y-4 pt-2 border-t mt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Info className="w-4 h-4 text-primary" />
                                <h4 className="text-sm font-semibold">Service Details Form</h4>
                            </div>
                            <ServiceOrderForm
                                fields={service.form_config}
                                values={formValues}
                                onChange={setFormValues}
                            />
                        </div>
                    )}

                    <div className="space-y-2 pt-2 border-t mt-4">
                        <Label htmlFor="requirements">
                            {service.form_config && service.form_config.length > 0
                                ? "Additional Notes (Optional)"
                                : "Requirements / Instructions"}
                        </Label>
                        <Textarea
                            id="requirements"
                            value={requirements}
                            onChange={(e) => setRequirements(e.target.value)}
                            placeholder="Describe any additional needs..."
                            className="min-h-[100px]"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button
                        onClick={handleConfirmOrder}
                        disabled={loading || userBalance < (service.price || 0)}
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
    )
}
