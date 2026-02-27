'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, ShoppingCart, UserPlus, FileText } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'

interface ActivityItem {
    id: string
    type: 'sale' | 'customer' | 'invoice' | 'system'
    title: string
    description: string
    timestamp: string | Date
    amount?: number
}

// Placeholder data - in a real app this would come from props or a query
const MOCK_ACTIVITY: ActivityItem[] = [
    {
        id: '1',
        type: 'sale',
        title: 'নতুন বিক্রয়',
        description: 'John Doe-এর কাছে iPhone 13 Pro Max বিক্রি করা হয়েছে',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        amount: 1099
    },
    {
        id: '2',
        type: 'customer',
        title: 'নতুন ক্রেতা',
        description: 'Sarah Smith লয়্যালটি প্রোগ্রামে যোগ দিয়েছেন',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
        id: '3',
        type: 'invoice',
        title: 'ইনভয়েস তৈরি',
        description: 'Invoice #INV-2024-001 Tech Corp-কে পাঠানো হয়েছে',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        amount: 2500
    },
    {
        id: '4',
        type: 'system',
        title: 'সিস্টেম আপডেট',
        description: 'ইনভেন্টরি সিঙ্ক সফলভাবে সম্পন্ন হয়েছে',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    }
]

export function RecentActivity({ activities = MOCK_ACTIVITY }: { activities?: ActivityItem[] }) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'sale': return <ShoppingCart className="w-4 h-4 text-emerald-500" />
            case 'customer': return <UserPlus className="w-4 h-4 text-blue-500" />
            case 'invoice': return <FileText className="w-4 h-4 text-orange-500" />
            default: return <Activity className="w-4 h-4 text-gray-500" />
        }
    }

    const getBgColor = (type: string) => {
        switch (type) {
            case 'sale': return 'bg-emerald-500/10'
            case 'customer': return 'bg-blue-500/10'
            case 'invoice': return 'bg-orange-500/10'
            default: return 'bg-gray-500/10'
        }
    }

    return (
        <Card className="h-full border-border/50">
            <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    সাম্প্রতিক কার্যক্রম
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {activities.map((item) => (
                        <div key={item.id} className="flex gap-4 group">
                            <div className={`mt-1 h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 ${getBgColor(item.type)}`}>
                                {getIcon(item.type)}
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium leading-none text-foreground group-hover:text-primary transition-colors">
                                        {item.title}
                                    </p>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {item.description}
                                </p>
                                {item.amount && (
                                    <p className="text-xs font-semibold text-emerald-600">
                                        +${item.amount.toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                    <div className="pt-2">
                        <button className="text-sm text-primary hover:underline w-full text-center">
                            সব কার্যক্রম দেখুন
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
