import { createAdminClient } from '@/lib/supabase/admin'
import { getLimitsForPlan } from '@/lib/subscription-limits'
import { SubscriptionPlanType } from '@/lib/types'
import { NextRequest, NextResponse } from 'next/server'

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function GET(req: NextRequest) {
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
        .select('plan_type, status, autofill_usage, subscription_end_date')
        .eq('user_id', user.id)
        .order('subscription_start_date', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (subError || !subscription) {
        return NextResponse.json(
            { error: 'No subscription found', allowed: false, used: 0, limit: 0, remaining: 0, plan: null },
            { status: 200, headers: CORS_HEADERS }
        )
    }

    // Check subscription validity
    const isActive =
        subscription.status === 'active' &&
        (!subscription.subscription_end_date ||
            new Date(subscription.subscription_end_date) > new Date())

    if (!isActive) {
        return NextResponse.json(
            { error: 'Subscription expired or inactive', allowed: false, used: 0, limit: 0, remaining: 0, plan: subscription.plan_type },
            { status: 200, headers: CORS_HEADERS }
        )
    }

    const limits = getLimitsForPlan(subscription.plan_type as SubscriptionPlanType)
    const used = subscription.autofill_usage || 0
    const limit = limits.autofill_applications
    const remaining = Math.max(0, limit - used)

    return NextResponse.json(
        {
            allowed: remaining > 0,
            used,
            limit,
            remaining,
            plan: subscription.plan_type,
            email: user.email,
        },
        { status: 200, headers: CORS_HEADERS }
    )
}
