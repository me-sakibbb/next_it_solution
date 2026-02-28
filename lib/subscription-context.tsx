'use client'

import { createContext, useContext } from 'react'

interface SubscriptionContextValue {
    /** Call this after any action that changes the user's subscription or balance */
    refresh: () => void
}

export const SubscriptionContext = createContext<SubscriptionContextValue>({
    refresh: () => {},
})

export function useSubscriptionContext() {
    return useContext(SubscriptionContext)
}
