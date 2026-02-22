'use client'

import { useMemo } from 'react'
import { useShop } from '@/hooks/use-shop'
import { useSales } from '@/hooks/use-sales'
import { useProducts } from '@/hooks/use-products'
import { useStaff } from '@/hooks/use-staff'
import { useShopTasks } from '@/hooks/use-shop-tasks'
import { useExpenses } from '@/hooks/use-expenses'
import { isToday } from 'date-fns'

export function useDashboardStats() {
    const { user, shop, loading: shopLoading } = useShop()
    const shopId = shop?.id || ''

    const { sales, loading: salesLoading } = useSales(shopId)
    const { products, loading: productsLoading } = useProducts(shopId)
    const { staff, loading: staffLoading } = useStaff(shopId)
    const { tasks, loading: tasksLoading } = useShopTasks(shopId)
    const { expenses, loading: expensesLoading } = useExpenses(shopId)

    const loading = shopLoading || salesLoading || productsLoading || staffLoading || tasksLoading || expensesLoading

    const stats = useMemo(() => {
        // Sales revenue
        let salesRevenue = 0
        let todaySalesRevenue = 0
        let totalDue = 0

        sales.forEach((sale) => {
            salesRevenue += Number(sale.total_amount || 0)
            totalDue += Number(sale.balance_amount || 0)
            if (sale.created_at && isToday(new Date(sale.created_at))) {
                todaySalesRevenue += Number(sale.total_amount || 0)
            }
        })

        // Tasks revenue
        let tasksRevenue = 0
        let todayTasksRevenue = 0

        tasks.forEach((task) => {
            if (task.status === 'completed') {
                tasksRevenue += Number(task.price || 0)
                const taskDateStr = task.completed_at || task.updated_at
                if (taskDateStr && isToday(new Date(taskDateStr))) {
                    todayTasksRevenue += Number(task.price || 0)
                }
            }
        })

        const totalRevenue = salesRevenue + tasksRevenue
        const todayRevenue = todaySalesRevenue + todayTasksRevenue

        // Expenses
        let totalExpenses = 0
        let todayExpenses = 0

        expenses.forEach((exp) => {
            totalExpenses += Number(exp.amount || 0)
            const expDateStr = exp.expense_date || exp.created_at
            if (expDateStr && isToday(new Date(expDateStr))) {
                todayExpenses += Number(exp.amount || 0)
            }
        })

        const netProfit = totalRevenue - totalExpenses
        const todayProfit = todayRevenue - todayExpenses

        // Products
        const activeProducts = products.filter((p) => p.is_active).length
        const lowStockProductsList = products
            .filter((p) => p.available_quantity <= p.min_stock_level)
            .sort((a, b) => a.available_quantity - b.available_quantity)
        const lowStockProducts = lowStockProductsList.length

        // Staff
        const activeStaff = staff?.filter((s) => s.is_active).length || 0

        // Tasks
        const activeTasksCount = tasks.filter((t) => t.status === 'pending').length

        // Lists for dashboard
        const recentSales = sales.slice(0, 5)
        const recentExpenses = expenses.slice(0, 5)
        const topLowStock = lowStockProductsList.slice(0, 5)
        const pendingTasks = tasks
            .filter((t) => t.status === 'pending')
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            .slice(0, 5)

        return {
            totalRevenue,
            todayRevenue,
            salesRevenue,
            tasksRevenue,
            totalExpenses,
            todayExpenses,
            netProfit,
            todayProfit,
            totalDue,
            activeProducts,
            lowStockProducts,
            activeStaff,
            salesCount: sales.length,
            activeTasksCount,
            productsTotal: products.length,
            staffTotal: staff?.length || 0,
            recentSales,
            pendingTasks,
            recentExpenses,
            lowStockProductsList: topLowStock,
        }
    }, [sales, tasks, expenses, products, staff])

    return {
        ...stats,
        user,
        shop,
        loading,
    }
}
