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

    // Fetch user details (balance, name)
    const { data: userDetails } = await adminSupabase
        .from('users')
        .select('full_name, balance')
        .eq('id', user.id)
        .maybeSingle()

    // Fetch shop name (either as owner or member)
    const { data: shopMembership } = await adminSupabase
        .from('shop_members')
        .select('shop_id, shops(name)')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle()

    const shopName = (shopMembership?.shops as any)?.name || 'My Shop'

    // Autofill usage
    const autofillUsed = subscription.autofill_usage || 0
    const autofillLimit = limits.autofill_applications
    const autofillRemaining = Math.max(0, autofillLimit - autofillUsed)

    // Extraction usage
    const extractionUsed = subscription.extraction_usage || 0
    const extractionLimit = limits.profile_extractions
    const extractionRemaining = Math.max(0, extractionLimit - extractionUsed)

    return NextResponse.json(
        {
            allowed: autofillRemaining > 0 || (userDetails?.balance || 0) >= 1,
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
            plan: subscription.plan_type,
            email: user.email,
            userName: userDetails?.full_name || user.email?.split('@')[0],
            shopName: shopName,
            balance: userDetails?.balance || 0
        },
        { status: 200, headers: CORS_HEADERS }
    )
}
