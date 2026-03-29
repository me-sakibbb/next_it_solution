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
        .select('plan_type, status, autofill_usage, extraction_usage, subscription_end_date')
        .eq('user_id', user.id)
        .order('subscription_start_date', { ascending: false })
        .limit(1)
        .maybeSingle()

    const { data: userRecord } = await adminSupabase
        .from('users')
        .select('balance')
        .eq('id', user.id)
        .single()

    const balance = userRecord?.balance || 0

    if (subError || !subscription) {
        if (balance < 1) {
            return NextResponse.json(
                { error: 'No subscription found and insufficient balance', allowed: false, used: 0, limit: 0, remaining: 0, plan: null, balance },
                { status: 200, headers: CORS_HEADERS }
            )
        }
    }

    // Check subscription validity
    const isActive =
        subscription &&
        subscription.status === 'active' &&
        (!subscription.subscription_end_date ||
            new Date(subscription.subscription_end_date) > new Date())

    // If neither active subscription nor enough balance, they are fully restricted
    if (!isActive && balance < 1) {
        return NextResponse.json(
            { error: 'Subscription expired or inactive', allowed: false, used: 0, limit: 0, remaining: 0, plan: subscription?.plan_type || 'None', balance },
            { status: 200, headers: CORS_HEADERS }
        )
    }

    const limits = isActive ? getLimitsForPlan(subscription.plan_type as SubscriptionPlanType) : { autofill_applications: 0, profile_extractions: 0 }

    // Autofill usage
    const autofillUsed = subscription?.autofill_usage || 0
    const autofillLimit = limits.autofill_applications
    const autofillRemaining = Math.max(0, autofillLimit - autofillUsed)

    // Extraction usage
    const extractionUsed = subscription?.extraction_usage || 0
    const extractionLimit = limits.profile_extractions
    const extractionRemaining = Math.max(0, extractionLimit - extractionUsed)

    const { data: shop } = await adminSupabase
        .from('shops')
        .select('name')
        .eq('owner_id', user.id)
        .eq('is_active', true)
        .single()

    const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
    const shopName = shop?.name || 'Loading Shop...'

    return NextResponse.json(
        {
            allowed: extractionRemaining > 0 || balance >= 1,
            used: autofillUsed,
            limit: autofillLimit,
            remaining: autofillRemaining,
            autofill: {
                used: autofillUsed,
                limit: autofillLimit,
                remaining: autofillRemaining
            },
            extraction: {
                used: extractionUsed,
                limit: extractionLimit,
                remaining: extractionRemaining
            },
            plan: subscription?.plan_type || 'None',
            email: user.email,
            userName,
            shopName,
            balance
        },
        { status: 200, headers: CORS_HEADERS }
    )
}
