import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
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
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Super Admin</h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <Link href="/superadmin" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <LayoutDashboard className="w-5 h-5 mr-3" />
                        Overview
                    </Link>
                    <Link href="/superadmin/users" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <Users className="w-5 h-5 mr-3" />
                        Users
                    </Link>
                    <Link href="/superadmin/services" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <Briefcase className="w-5 h-5 mr-3" />
                        Services
                    </Link>
                    <Link href="/superadmin/orders" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <ShoppingCart className="w-5 h-5 mr-3" />
                        Orders
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <Link href="/dashboard" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <LogOut className="w-5 h-5 mr-3" />
                        Exit to App
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
