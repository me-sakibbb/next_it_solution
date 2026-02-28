'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SuperAdminTransactionsPage() {
    const router = useRouter()

    useEffect(() => {
        router.replace('/superadmin/transactions/bkash')
    }, [router])

    return null
}
