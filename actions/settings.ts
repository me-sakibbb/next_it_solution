'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function getAppSettings(): Promise<Record<string, string>> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
        .from('app_settings')
        .select('key, value')
    if (error) throw new Error(error.message)
    return Object.fromEntries((data ?? []).map((row: any) => [row.key, row.value ?? '']))
}

export async function updateAppSetting(key: string, value: string): Promise<void> {
    const supabase = createAdminClient()
    const { error } = await supabase
        .from('app_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    if (error) throw new Error(error.message)
}

export async function getResourceLinks(): Promise<{ graphics_files_drive_url: string; certificate_formats_drive_url: string }> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', ['graphics_files_drive_url', 'certificate_formats_drive_url'])
    if (error) throw new Error(error.message)
    const map = Object.fromEntries((data ?? []).map((row: any) => [row.key, row.value ?? '']))
    return {
        graphics_files_drive_url: map['graphics_files_drive_url'] ?? '',
        certificate_formats_drive_url: map['certificate_formats_drive_url'] ?? '',
    }
}
