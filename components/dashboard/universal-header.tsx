'use client'

import { LogOut, Store, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { NotificationsDropdown } from './notifications'
import Link from 'next/link'

interface UniversalHeaderProps {
    user: User
    profile: any
}

export function UniversalHeader({ user, profile }: UniversalHeaderProps) {
    const router = useRouter()

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/auth/login')
    }

    return (
        <header className="flex h-16 items-center gap-4 border-b bg-card px-6 sticky top-0 z-50">
            <div className="flex flex-1 items-center gap-6">
                <Link href="/dashboard" className="flex items-center gap-2 group mr-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all group-hover:scale-110 group-active:scale-95">
                        <Store className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-lg leading-none tracking-tight text-foreground transition-colors group-hover:text-primary">
                            Next IT
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                            Solution
                        </span>
                    </div>
                </Link>
            </div>

            <div className="flex items-center gap-3">
                <NotificationsDropdown userId={user.id} />

                <div className="h-6 w-px bg-border mx-1" />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-muted ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-sm font-semibold text-primary border border-primary/20 shadow-sm">
                                {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 mt-2 animate-in fade-in-0 zoom-in-95">
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{profile?.full_name || 'User'}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => router.push('/dashboard')}
                            className="cursor-pointer"
                        >
                            Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => router.push('/dashboard/settings')}
                            className="cursor-pointer"
                        >
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleSignOut}
                            className="text-destructive focus:bg-destructive/10 cursor-pointer"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
