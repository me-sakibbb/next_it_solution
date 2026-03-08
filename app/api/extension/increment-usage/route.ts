import { createAdminClient } from '@/lib/supabase/admin'
import { getLimitsForPlan } from '@/lib/subscription-limits'
import { SubscriptionPlanType } from '@/lib/types'
import { NextRequest, NextResponse } from 'next/server'

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(req: NextRequest) {
    // Extract Bearer token
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '').trim()

    if (!token) {
        return NextResponse.json(
            { error: 'Missing authorization token' },
            { status: 401, headers: CORS_HEADERS }
        )
    }

    // Validate token directly via supabase-js for guaranteed types
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false }
    })

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
        return NextResponse.json(
            { error: 'Invalid or expired token' },
            { status: 401, headers: CORS_HEADERS }
        )
    }

    const adminSupabase = createAdminClient()

    // Fetch the active subscription
    const { data: subscription, error: subError } = await adminSupabase
        .from('subscriptions')
        .select('id, plan_type, status, autofill_usage, subscription_end_date')
        .eq('user_id', user.id)
        .order('subscription_start_date', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (subError || !subscription) {
        return NextResponse.json(
            { error: 'No active subscription found', success: false },
            { status: 200, headers: CORS_HEADERS }
        )
    }

    // Check expiry and status
    const isActive =
        subscription.status === 'active' &&
        (!subscription.subscription_end_date ||
            new Date(subscription.subscription_end_date) > new Date())

    if (!isActive) {
        return NextResponse.json(
            { error: 'Subscription expired or inactive', success: false },
            { status: 200, headers: CORS_HEADERS }
        )
    }

    const limits = getLimitsForPlan(subscription.plan_type as SubscriptionPlanType)
    const used = subscription.autofill_usage || 0
    const limit = limits.autofill_applications

    // Check limit before incrementing
    if (used >= limit) {
        return NextResponse.json(
            { error: 'Autofill limit reached', success: false, allowed: false, used, limit, remaining: 0 },
            { status: 200, headers: CORS_HEADERS }
        )
    }

    // Increment usage
    const newUsed = used + 1
    const { error: updateError } = await adminSupabase
        .from('subscriptions')
        .update({ autofill_usage: newUsed })
        .eq('id', subscription.id)

    if (updateError) {
        return NextResponse.json(
            { error: 'Failed to update usage', success: false },
            { status: 500, headers: CORS_HEADERS }
        )
    }

    return NextResponse.json(
        {
            success: true,
            allowed: true,
            used: newUsed,
            limit,
            remaining: Math.max(0, limit - newUsed),
        },
        { status: 200, headers: CORS_HEADERS }
    )
}
