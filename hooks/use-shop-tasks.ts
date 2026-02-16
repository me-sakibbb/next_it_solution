'use client'

import { useState, useEffect, useCallback } from 'react'
import { ShopTask, TaskStatus } from '@/lib/types'
import { getShopTasks, createShopTask, updateShopTaskStatus, deleteShopTask } from '@/actions/shop/tasks'
import { toast } from 'sonner'

export function useShopTasks(shopId?: string) {
    const [tasks, setTasks] = useState<ShopTask[]>([])
    const [loading, setLoading] = useState(true)

    const fetchTasks = useCallback(async () => {
        if (!shopId) return
        try {
            const data = await getShopTasks(shopId)
            setTasks(data)
        } catch (error) {
            console.error('Error fetching tasks:', error)
            toast.error('Failed to load tasks')
        } finally {
            setLoading(false)
        }
    }, [shopId])

    useEffect(() => {
        fetchTasks()
    }, [fetchTasks])

    const loadTasks = async () => {
        await fetchTasks()
    }

    const createTask = async (data: Partial<ShopTask>) => {
        if (!shopId) return
        try {
            await createShopTask(shopId, data)
            toast.success('Task created successfully')
            fetchTasks()
        } catch (error) {
            console.error('Error creating task:', error)
            toast.error('Failed to create task')
            throw error
        }
    }

    const updateStatus = async (taskId: string, status: TaskStatus) => {
        try {
            await updateShopTaskStatus(taskId, status)
            toast.success('Task status updated')
            fetchTasks()
        } catch (error) {
            console.error('Error updating task status:', error)
            toast.error('Failed to update task status')
            throw error
        }
    }

    const deleteTask = async (taskId: string) => {
        try {
            await deleteShopTask(taskId)
            toast.success('Task deleted successfully')
            fetchTasks()
        } catch (error) {
            console.error('Error deleting task:', error)
            toast.error('Failed to delete task')
            throw error
        }
    }

    return {
        tasks,
        loading,
        refreshTasks: loadTasks,
        createTask,
        updateStatus,
        deleteTask,
    }
}
