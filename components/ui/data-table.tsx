'use client'

import React from "react"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'

interface Column<T> {
  key: string
  label: string
  render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchPlaceholder?: string
  onRowClick?: (item: T) => void
  actions?: (item: T) => React.ReactNode
  hideSearch?: boolean

  // Server-side pagination props
  total?: number
  page?: number
  limit?: number
  onPageChange?: (page: number) => void
  onSearchChange?: (search: string) => void
  onLimitChange?: (limit: number) => void
  loading?: boolean
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = 'Search...',
  onRowClick,
  actions,
  hideSearch = false,
  total,
  page,
  limit,
  onPageChange,
  onSearchChange,
  onLimitChange,
  loading = false,
}: DataTableProps<T>) {
  const [internalSearch, setInternalSearch] = useState('')
  const [internalCurrentPage, setInternalCurrentPage] = useState(1)
  const [internalItemsPerPage, setInternalItemsPerPage] = useState(10)

  const isServerSide = total !== undefined

  const search = isServerSide ? undefined : internalSearch
  const currentPage = isServerSide ? page! : internalCurrentPage
  const itemsPerPage = isServerSide ? limit! : internalItemsPerPage

  const filteredData = isServerSide
    ? data
    : data.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(internalSearch.toLowerCase())
      )
    )

  const totalItems = isServerSide ? total : filteredData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = isServerSide ? data : filteredData.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="space-y-4">
      {!hideSearch && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              onChange={(e) => {
                if (isServerSide) {
                  onSearchChange?.(e.target.value)
                } else {
                  setInternalSearch(e.target.value)
                  setInternalCurrentPage(1)
                }
              }}
              defaultValue={isServerSide ? undefined : internalSearch}
              className="pl-9"
            />
          </div>
        </div>
      )}

      <div className="rounded-lg border bg-card relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
              {actions && <TableHead className="text-right">অ্যাকশন</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="h-24 text-center text-muted-foreground">
                  {loading ? 'লোড হচ্ছে...' : 'কোনো তথ্য পাওয়া যায়নি'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, index) => (
                <TableRow
                  key={item.id || index}
                  className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} className="py-3">
                      {column.render ? column.render(item) : item[column.key]}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      {actions(item)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {totalItems > 0 ? (
              <>Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} results</>
            ) : (
              <>0 results</>
            )}
          </p>
          {onLimitChange && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Show</span>
              <select
                className="h-8 w-16 rounded-md border border-input bg-transparent px-1 text-sm outline-none focus:ring-1 focus:ring-ring"
                value={itemsPerPage}
                onChange={(e) => onLimitChange(Number(e.target.value))}
              >
                {[10, 20, 50, 100].map(val => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => isServerSide ? onPageChange?.(currentPage - 1) : setInternalCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              পূর্ববর্তী
            </Button>
            <span className="text-sm font-medium">
              পৃষ্ঠা {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => isServerSide ? onPageChange?.(currentPage + 1) : setInternalCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || loading}
            >
              পরবর্তী
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
