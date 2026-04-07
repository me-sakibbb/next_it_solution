import { createAdminClient } from '@/lib/supabase/admin'
import { getLimitsForPlan } from '@/lib/subscription-limits'
import { SubscriptionPlanType } from '@/lib/types'
import { createClient } from '@supabase/supabase-js'
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

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

        // Validate token — static import, no dynamic import overhead
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

        // Parse body immediately so we can overlap with DB queries
        const { parts } = await req.json()

        if (!parts || !Array.isArray(parts)) {
            return NextResponse.json({ error: 'Invalid payload parts' }, { status: 400, headers: CORS_HEADERS })
        }

        const adminSupabase = createAdminClient()

        // Fetch subscription and balance IN PARALLEL — saves ~300-500ms
        const [subscriptionResult, userRecord] = await Promise.all([
            adminSupabase
                .from('subscriptions')
                .select('id, plan_type, status, autofill_usage, extraction_usage, subscription_end_date')
                .eq('user_id', user.id)
                .order('subscription_start_date', { ascending: false })
                .limit(1)
                .maybeSingle(),
            adminSupabase
                .from('users')
                .select('balance')
                .eq('id', user.id)
                .single()
        ])

        const { data: subscription, error: subError } = subscriptionResult
        const balance = userRecord.data?.balance || 0;

        if (subError || !subscription) {
            if (balance < 1) {
                return NextResponse.json(
                    { error: 'No active subscription found and insufficient balance' },
                    { status: 403, headers: CORS_HEADERS }
                )
            }
        }

        // Check expiry and status
        let isActive = false;
        let limits = { profile_extractions: 0 };
        let used = 0;
        let limit = 0;

        if (subscription) {
            isActive =
                subscription.status === 'active' &&
                (!subscription.subscription_end_date ||
                    new Date(subscription.subscription_end_date) > new Date())

            if (isActive) {
                limits = getLimitsForPlan(subscription.plan_type as SubscriptionPlanType)
                used = subscription.extraction_usage || 0
                limit = limits.profile_extractions
            }
        }

        // Check limit
        let chargingType: 'subscription' | 'balance' = 'subscription';

        if (!isActive || used >= limit) {
            if (balance < 1) {
                return NextResponse.json(
                    { error: 'Extraction limit reached. Please upgrade subscription or add balance.' },
                    { status: 403, headers: CORS_HEADERS }
                )
            }
            chargingType = 'balance';
        }

        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Gemini API Key missing on server' }, { status: 500, headers: CORS_HEADERS })
        }

        // gemini-3.1-flash-lite-preview: ultra-fast, production-proven model
        const MODEL = 'gemini-3.1-flash-lite-preview';
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

        // Fire-and-forget usage update — don't block the response
        let remainingLimits = 0;
        if (chargingType === 'subscription' && subscription) {
            const newUsed = used + 1
            remainingLimits = limit - newUsed;
            adminSupabase
                .from('subscriptions')
                .update({ extraction_usage: newUsed })
                .eq('id', subscription.id)
                .then(() => { }) // non-blocking
        } else {
            const newBalance = balance - 1;
            remainingLimits = 0;
            Promise.all([
                adminSupabase.from('users').update({ balance: newBalance }).eq('id', user.id),
                adminSupabase.from('balance_transactions').insert({
                    user_id: user.id,
                    amount: 1,
                    type: 'debit',
                    description: 'Extension extra document extraction fee'
                })
            ]).then(() => { }) // non-blocking
        }

        // For thinking models (e.g. gemini-3.1-flash-lite-preview), the response has multiple parts:
        // parts[0] = internal thought (thought: true), parts[last] = actual JSON answer.
        // Always use the last part to get the actual response.
        const parts_out = data.candidates[0].content.parts;
        const lastPart = parts_out[parts_out.length - 1];
        let text = lastPart.text || "{}";

        // Robust JSON extraction
        let parsedData = {};
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const candidate = jsonMatch[0];
                try {
                    parsedData = JSON.parse(candidate);
                } catch (err) {
                    let lastBracePos = candidate.lastIndexOf('}');
                    let success = false;
                    while (lastBracePos !== -1) {
                        try {
                            parsedData = JSON.parse(candidate.substring(0, lastBracePos + 1));
                            success = true;
                            break;
                        } catch (e) {
                            lastBracePos = candidate.lastIndexOf('}', lastBracePos - 1);
                        }
                    }
                    if (!success) throw err;
                }
            } else {
                parsedData = JSON.parse(text);
            }
        } catch (parseError: any) {
            console.error('Failed to parse Gemini JSON:', text);
            throw new Error(`Cloud AI returned invalid data: ${parseError.message}`);
        }

        return NextResponse.json(
            { parsed: parsedData, usage: data.usageMetadata, remainingLimits },
            { status: 200, headers: CORS_HEADERS }
        );

    } catch (error: any) {
        console.error('Gemini extension API error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500, headers: CORS_HEADERS })
    }
}
