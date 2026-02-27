'use client'

import { ServiceFormField } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from '@/components/ui/checkbox'

interface ServiceOrderFormProps {
    fields: ServiceFormField[]
    values: Record<string, any>
    onChange: (values: Record<string, any>) => void
}

export function ServiceOrderForm({ fields, values, onChange }: ServiceOrderFormProps) {
    const handleFieldChange = (id: string, value: any) => {
        onChange({ ...values, [id]: value })
    }

    if (fields.length === 0) {
        return null
    }

    return (
        <div className="space-y-4">
            {fields.map((field) => (
                <div key={field.id} className="grid gap-2">
                    <Label htmlFor={field.id}>
                        {field.label} {field.required && <span className="text-destructive">*</span>}
                    </Label>

                    {field.type === 'text' && (
                        <Input
                            id={field.id}
                            value={values[field.id] || ''}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            required={field.required}
                            placeholder={`Enter ${field.label.toLowerCase()}...`}
                        />
                    )}

                    {field.type === 'dropdown' && (
                        <Select
                            value={values[field.id] || ''}
                            onValueChange={(value) => handleFieldChange(field.id, value)}
                            required={field.required}
                        >
                            <SelectTrigger id={field.id}>
                                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                            </SelectTrigger>
                            <SelectContent>
                                {field.options?.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                </div>
            ))}
        </div>
    )
}
