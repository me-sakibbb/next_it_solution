'use client'

import { useState, useEffect } from 'react'
import { ServiceFormField } from '@/lib/types'
import { Button } from '@/components/ui/button'
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
import { Plus, Trash2, GripVertical } from 'lucide-react'

const generateId = () => Math.random().toString(36).substring(2, 11)

interface ServiceFormBuilderProps {
    fields: ServiceFormField[]
    onChange: (fields: ServiceFormField[]) => void
}

export function ServiceFormBuilder({ fields, onChange }: ServiceFormBuilderProps) {
    const [optionsStrings, setOptionsStrings] = useState<Record<string, string>>(() =>
        Object.fromEntries(fields.map(f => [f.id, f.options?.join(', ') || '']))
    )

    // Effect to keep optionsStrings in sync if fields change from outside
    useEffect(() => {
        setOptionsStrings(prev => {
            const newOptionsStrings: Record<string, string> = {}
            const currentFieldIds = new Set(fields.map(f => f.id));

            fields.forEach(f => {
                if (prev[f.id] !== undefined) {
                    newOptionsStrings[f.id] = prev[f.id]; // Keep existing if present
                } else {
                    newOptionsStrings[f.id] = f.options?.join(', ') || ''; // Initialize new ones
                }
            });

            // Remove options for fields that no longer exist
            for (const id in prev) {
                if (!currentFieldIds.has(id)) {
                    delete newOptionsStrings[id];
                }
            }
            return newOptionsStrings;
        });
    }, [fields]);

    const addField = () => {
        const id = generateId()
        const newField: ServiceFormField = {
            id,
            label: '',
            type: 'text',
            required: false,
        }
        setOptionsStrings(prev => ({ ...prev, [id]: '' }))
        onChange([...fields, newField])
    }

    const removeField = (id: string) => {
        onChange(fields.filter(f => f.id !== id))
        setOptionsStrings(prev => {
            const next = { ...prev }
            delete next[id]
            return next
        })
    }

    const updateField = (id: string, updates: Partial<ServiceFormField>) => {
        onChange(fields.map(f => f.id === id ? { ...f, ...updates } : f))
    }

    const handleOptionsChange = (id: string, value: string) => {
        setOptionsStrings(prev => ({ ...prev, [id]: value }))
        const options = value.split(',').map(s => s.trim()).filter(s => s !== '')
        updateField(id, { options })
    }

    return (
        <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
            <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">User Requirements Form</Label>
                <Button type="button" variant="outline" size="sm" onClick={addField}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Field
                </Button>
            </div>

            {fields.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                    No fields added yet. Users will only see a generic requirements box.
                </p>
            ) : (
                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid gap-3 p-3 border rounded-md bg-background relative group">
                            <div className="flex items-start justify-between gap-4">
                                <div className="grid gap-1 flex-1">
                                    <Label htmlFor={`label-${field.id}`} className="text-xs">Field Label</Label>
                                    <Input
                                        id={`label-${field.id}`}
                                        value={field.label}
                                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                                        placeholder="e.g. Full Name, Date of Birth"
                                        className="h-8"
                                    />
                                </div>
                                <div className="grid gap-1 w-32">
                                    <Label className="text-xs">Type</Label>
                                    <Select
                                        value={field.type}
                                        onValueChange={(value: any) => updateField(field.id, { type: value, options: value === 'dropdown' ? [] : undefined })}
                                    >
                                        <SelectTrigger className="h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="text">Text Input</SelectItem>
                                            <SelectItem value="dropdown">Dropdown</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col items-center justify-center gap-1 pt-6">
                                    <Checkbox
                                        id={`req-${field.id}`}
                                        checked={field.required}
                                        onCheckedChange={(checked) => updateField(field.id, { required: !!checked })}
                                    />
                                    <Label htmlFor={`req-${field.id}`} className="text-[10px]">Required</Label>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="mt-6 h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeField(field.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            {field.type === 'dropdown' && (
                                <div className="grid gap-1">
                                    <Label htmlFor={`options-${field.id}`} className="text-xs">Options (comma separated)</Label>
                                    <Input
                                        id={`options-${field.id}`}
                                        value={optionsStrings[field.id] ?? field.options?.join(', ') ?? ''}
                                        onChange={(e) => handleOptionsChange(field.id, e.target.value)}
                                        placeholder="Option 1, Option 2, Option 3"
                                        className="h-8"
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
