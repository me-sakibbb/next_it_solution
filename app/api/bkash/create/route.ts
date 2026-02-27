import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createPayment } from '@/lib/bkash'

export async function POST(request: NextRequest) {
    try {
        // Authenticate user
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'অনুমোদিত নয়' }, { status: 401 })
        }

        const body = await request.json()
        const { amount, intent, planType } = body

        // Validate amount
        const amountNum = parseFloat(amount)
        if (isNaN(amountNum) || amountNum < 10) {
            return NextResponse.json(
                { error: 'সর্বনিম্ন পেমেন্ট পরিমাণ ৳১০' },
                { status: 400 }
            )
        }

        // Validate intent
        if (!['add_balance', 'subscribe'].includes(intent)) {
            return NextResponse.json({ error: 'অবৈধ পেমেন্ট উদ্দেশ্য' }, { status: 400 })
        }

        // Validate plan if subscribing
        const validPlans = ['basic_bit', 'advance_plus', 'premium_power']
        if (intent === 'subscribe' && (!planType || !validPlans.includes(planType))) {
            return NextResponse.json({ error: 'অবৈধ প্ল্যান' }, { status: 400 })
        }

        // Build the callback URL
        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
        const callbackURL = `${origin}/api/bkash/execute`

        // Generate a unique merchant invoice number
        const merchantInvoiceNumber = `NIT-${user.id.slice(0, 8)}-${Date.now()}`

        // Create bKash payment session
        const { paymentID, bkashURL } = await createPayment({
            amount: amountNum,
            intent,
            userId: user.id,
            planType,
            callbackURL,
            merchantInvoiceNumber,
        })

        // Record the payment session in DB using admin client (bypasses RLS for insert)
        const adminSupabase = createAdminClient()
        const { error: dbError } = await adminSupabase
            .from('bkash_payments')
            .insert({
                user_id: user.id,
                payment_id: paymentID,
                intent,
                plan_type: planType || null,
                amount: amountNum,
                status: 'created',
            })

        if (dbError) {
            console.error('Failed to record bkash payment:', dbError)
            // Don't fail the request; payment can still proceed, we just log the issue
        }

        return NextResponse.json({ paymentID, bkashURL })
    } catch (error) {
        console.error('bKash create payment error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'পেমেন্ট শুরু করতে ব্যর্থ হয়েছে' },
            { status: 500 }
        )
    }
}
