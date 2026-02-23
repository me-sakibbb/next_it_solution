'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'

interface UseServerPaginationOptions<T, F> {
    fetchAction: (params: any) => Promise<{ data: T[]; total: number }>
    initialFilters?: F
    initialLimit?: number
    shopId: string
    refreshInterval?: number // ms
}

export function useServerPagination<T, F = Record<string, any>>({
    fetchAction,
    initialFilters = {} as F,
    initialLimit = 10,
    shopId,
    refreshInterval,
}: UseServerPaginationOptions<T, F>) {
    const [data, setData] = useState<T[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(initialLimit)
    const [search, setSearch] = useState('')
    const [filters, setFilters] = useState<F>(initialFilters)
    const [sortBy, setSortBy] = useState<string>('created_at')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    const fetchData = useCallback(async () => {
        if (!shopId) return

        setLoading(true)
        try {
            const response = await fetchAction({
                page,
                limit,
                search,
                shopId,
                filters,
                sortBy,
                sortOrder,
            })

            setData(response.data)
            setTotal(response.total)
            setError(null)
        } catch (err: any) {
            console.error('Pagination fetch error:', err)
            setError(err)
        } finally {
            setLoading(false)
        }
    }, [fetchAction, page, limit, search, shopId, filters, sortBy, sortOrder])

    // Initial fetch and dependency-based fetch
    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Auto-refresh if interval is provided
    useEffect(() => {
        if (!refreshInterval || !shopId) return

        const interval = setInterval(fetchData, refreshInterval)
        return () => clearInterval(interval)
    }, [fetchData, refreshInterval, shopId])

    const searchTimeoutRef = useRef<NodeJS.Timeout>(null)

    const handleSearchChange = useCallback((value: string) => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)

        searchTimeoutRef.current = setTimeout(() => {
            setSearch(value)
            setPage(1)
        }, 500)
    }, [])

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
        }
    }, [])

    const handleFilterChange = useCallback((newFilters: Partial<F>) => {
        setFilters(prev => ({ ...prev, ...newFilters }))
        setPage(1)
    }, [])

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage)
    }, [])

    const handleLimitChange = useCallback((newLimit: number) => {
        setLimit(newLimit)
        setPage(1)
    }, [])

    const totalPages = Math.ceil(total / limit)

    return {
        data,
        total,
        loading,
        error,
        page,
        limit,
        search,
        filters,
        totalPages,
        setPage: handlePageChange,
        setLimit: handleLimitChange,
        setSearch: handleSearchChange, // Use this for Input onChange
        setFilters: handleFilterChange,
        setSort: (field: string, order: 'asc' | 'desc') => {
            setSortBy(field)
            setSortOrder(order)
        },
        refresh: fetchData,
    }
}
