"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus, Search, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface Customer {
    id: string
    name: string
    phone?: string
    email?: string
}

interface CustomerSelectorProps {
    customers: Customer[]
    value?: string | null
    onChange: (value: string) => void
    onSelectCustomer?: (customer: Customer | null) => void
    placeholder?: string
}

export function CustomerSelector({
    customers,
    value,
    onChange,
    onSelectCustomer,
    placeholder = "কাস্টমার নির্বাচন করুন...",
}: CustomerSelectorProps) {
    const [open, setOpen] = React.useState(false)

    const selectedCustomer = customers.find((customer) => customer.id === value)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {selectedCustomer ? (
                        <span className="flex items-center gap-2 truncate">
                            <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="font-medium">{selectedCustomer.name}</span>
                            {selectedCustomer.phone && (
                                <span className="text-muted-foreground text-xs">
                                    ({selectedCustomer.phone})
                                </span>
                            )}
                        </span>
                    ) : (
                        <span className="text-muted-foreground">{placeholder}</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="নাম বা মোবাইল নম্বর দিয়ে খুঁজুন..." />
                    <CommandList>
                        <CommandEmpty>কোনো কাস্টমার পাওয়া যায়নি।</CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                value="walk-in"
                                onSelect={() => {
                                    onChange("")
                                    onSelectCustomer?.(null)
                                    setOpen(false)
                                }}
                                className="cursor-pointer"
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        !value ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                ওয়াক-ইন কাস্টমার (Walk-in)
                            </CommandItem>
                            {customers.map((customer) => (
                                <CommandItem
                                    key={customer.id}
                                    value={`${customer.name} ${customer.phone || ""}`}
                                    onSelect={() => {
                                        onChange(customer.id)
                                        onSelectCustomer?.(customer)
                                        setOpen(false)
                                    }}
                                    className="cursor-pointer"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === customer.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span>{customer.name}</span>
                                        {customer.phone && (
                                            <span className="text-xs text-muted-foreground">
                                                {customer.phone}
                                            </span>
                                        )}
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
