'use client'

import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertTriangle, X } from 'lucide-react'
import { useSubscriptionStatus } from '@/hooks/use-subscription-status'
import Link from 'next/link'

export function SubscriptionBanner({ userId }: { userId: string }) {
  const { status } = useSubscriptionStatus(userId)
  const [dismissed, setDismissed] = useState(false)

  if (!status || dismissed || status.isActive) return null

  const daysRemaining = status.daysRemaining || 0
  const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 7

  if (!isExpiringSoon && daysRemaining > 0) return null

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          {daysRemaining <= 0
            ? 'আপনার সাবস্ক্রিপশনের মেয়াদ শেষ হয়ে গেছে। সব ফিচার ব্যবহার অব্যহত রাখতে আপগ্রেড করুন।'
            : `আপনার সাবস্ক্রিপশনের মেয়াদ ${daysRemaining} দিনের মধ্যে শেষ হয়ে যাবে। বিচ্চিন্নতা এড়াতে এখনই রিনিউ করুন।`}
        </span>
        <div className="flex gap-2">
          <Link href="/dashboard/billing">
            <Button size="sm" variant="outline">
              এখনই আপগ্রেড করুন
            </Button>
          </Link>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
