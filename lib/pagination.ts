export interface PaginationParams {
    page: number
    limit: number
    search?: string
    shopId: string
    filters?: Record<string, any>
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    limit: number
    totalPages: number
}

/**
 * Calculates Supabase range for pagination
 */
export function getPaginationRange(page: number, limit: number) {
    const from = (page - 1) * limit
    const to = from + limit - 1
    return { from, to }
}
