import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NotificationsDropdown } from '@/components/dashboard/notifications'
import {
    LayoutDashboard,
    Users,
    ShoppingCart,
    Settings,
    LogOut,
    Briefcase
} from 'lucide-react'

export default async function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
        redirect('/auth/login')
    }

    // Verify Super Admin
    const { data: admin } = await supabase
        .from('super_admins')
        .select('email')
        .eq('email', user.email)
        .single()

    if (!admin) {
        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col sticky top-0 h-screen">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Super Admin
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <Link href="/superadmin" className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary transition-all rounded-lg group">
                        <LayoutDashboard className="w-4 h-4 mr-3 text-gray-400 group-hover:text-primary transition-colors" />
                        Overview
                    </Link>
                    <Link href="/superadmin/users" className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary transition-all rounded-lg group">
                        <Users className="w-4 h-4 mr-3 text-gray-400 group-hover:text-primary transition-colors" />
                        Users
                    </Link>
                    <Link href="/superadmin/services" className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary transition-all rounded-lg group">
                        <Briefcase className="w-4 h-4 mr-3 text-gray-400 group-hover:text-primary transition-colors" />
                        Services
                    </Link>
                    <Link href="/superadmin/orders" className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary transition-all rounded-lg group">
                        <ShoppingCart className="w-4 h-4 mr-3 text-gray-400 group-hover:text-primary transition-colors" />
                        Orders
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <Link href="/dashboard" className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 transition-colors">
                        <LogOut className="w-4 h-4 mr-3" />
                        Exit to App
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-8 sticky top-0 z-40">
                    <div className="flex items-center">
                        <span className="text-sm font-medium text-muted-foreground mr-2">Admin Dashboard /</span>
                        <span className="text-sm font-semibold capitalize text-foreground">Overview</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <NotificationsDropdown userId={user.id} />
                        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2" />
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end text-xs">
                                <span className="font-semibold">{user.email?.split('@')[0]}</span>
                                <span className="text-muted-foreground">Super Admin</span>
                            </div>
                            <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-sm">
                                {user.email?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
