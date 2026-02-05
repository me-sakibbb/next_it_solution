import React from "react"
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ShopSidebar } from '@/components/dashboard/shop-sidebar'
import { DashboardHeader } from '@/components/dashboard/header'

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ShopSidebar user={user} profile={profile} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader user={user} profile={profile} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
