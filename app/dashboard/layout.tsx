import React from "react"
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayoutClient } from './dashboard-layout-client'

export default async function DashboardLayout({
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
    <DashboardLayoutClient user={user} profile={profile}>
      {children}
    </DashboardLayoutClient>
  )
}
