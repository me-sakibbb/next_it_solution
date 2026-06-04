'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plane } from 'lucide-react'
import { FlightTicketForm } from './flight-ticket-form'

interface FlightTicketDialogProps {
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    triggerButton?: boolean
    onSuccess?: () => void
}

export function FlightTicketDialog({ isOpen, onOpenChange, triggerButton = false, onSuccess }: FlightTicketDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const activeOpen = isOpen !== undefined ? isOpen : internalOpen
    const activeOpenChange = onOpenChange !== undefined ? onOpenChange : setInternalOpen

    const handleSuccess = () => {
        if (onSuccess) onSuccess()
        activeOpenChange(false)
    }

    const dialogContent = (
        <Dialog open={activeOpen} onOpenChange={activeOpenChange}>
            <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden hide-scrollbar max-h-[90vh] flex flex-col border-none">
                <div className="overflow-y-auto overflow-x-hidden flex-1">
                    <FlightTicketForm onSuccess={handleSuccess} />
                </div>
            </DialogContent>
        </Dialog>
    )

    if (triggerButton) {
        return (
            <>
                <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                    onClick={() => setInternalOpen(true)}
                >
                    <Plane className="w-4 h-4 mr-2" />
                    নতুন রিকোয়েস্ট করুন
                </Button>
                {dialogContent}
            </>
        )
    }

    return dialogContent
}
