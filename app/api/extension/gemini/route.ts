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
    try {
        // Extract Bearer token
        const authHeader = req.headers.get('Authorization')
        const token = authHeader?.replace('Bearer ', '').trim()

        if (!token) {
            return NextResponse.json(
                { error: 'Missing authorization token' },
                { status: 401, headers: CORS_HEADERS }
            )
        }

        // Validate token directly via supabase-js
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
                { error: 'No active subscription found' },
                { status: 403, headers: CORS_HEADERS }
            )
        }

        // Check expiry and status
        const isActive =
            subscription.status === 'active' &&
            (!subscription.subscription_end_date ||
                new Date(subscription.subscription_end_date) > new Date())

        if (!isActive) {
            return NextResponse.json(
                { error: 'Subscription expired or inactive' },
                { status: 403, headers: CORS_HEADERS }
            )
        }

        const limits = getLimitsForPlan(subscription.plan_type as SubscriptionPlanType)
        const used = subscription.autofill_usage || 0
        const limit = limits.autofill_applications

        // Check limit
        if (used >= limit) {
            return NextResponse.json(
                { error: 'Autofill limit reached' },
                { status: 403, headers: CORS_HEADERS }
            )
        }

        // Parse request body for Gemini payload
        const { parts } = await req.json()

        if (!parts || !Array.isArray(parts)) {
            return NextResponse.json({ error: 'Invalid payload parts' }, { status: 400, headers: CORS_HEADERS })
        }

        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Gemini API Key missing on server' }, { status: 500, headers: CORS_HEADERS })
        }

        const MODEL = 'gemini-2.5-flash-lite';
        const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

        const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts }],
                generationConfig: {
                    response_mime_type: 'application/json',
                    temperature: 0,
                },
            }),
        });

        const data = await res.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        // Only increment usage on successful AI call
        const newUsed = used + 1
        await adminSupabase
            .from('subscriptions')
            .update({ autofill_usage: newUsed })
            .eq('id', subscription.id)

        let text = data.candidates[0].content.parts[0].text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) text = jsonMatch[0];

        return NextResponse.json(
            { parsed: JSON.parse(text), usage: data.usageMetadata, remainingLimits: limit - newUsed },
            { status: 200, headers: CORS_HEADERS }
        );

    } catch (error: any) {
        console.error('Gemini extension API error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500, headers: CORS_HEADERS })
    }
}
