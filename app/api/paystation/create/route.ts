import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { initiatePayment } from '@/lib/paystation'

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

        // Fetch user profile for customer details
        const adminSupabase = createAdminClient()
        const { data: profile } = await adminSupabase
            .from('users')
            .select('full_name, email, phone, shop_address')
            .eq('id', user.id)
            .single()

        // Build the callback URL (Paystation redirects here after payment)
        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
        const callbackURL = `${origin}/api/paystation/callback`

        // Generate a unique invoice number
        const invoiceNumber = `NIT-${user.id.slice(0, 8)}-${Date.now()}`

        // Initiate Paystation payment session
        const { paymentUrl, invoiceNumber: confirmedInvoice } = await initiatePayment({
            invoiceNumber,
            amount: amountNum,
            custName: profile?.full_name || user.email?.split('@')[0] || 'Customer',
            custPhone: profile?.phone || '01700000000',
            custEmail: user.email || 'customer@nexitsolution.com',
            custAddress: profile?.shop_address || 'Dhaka, Bangladesh',
            callbackUrl: callbackURL,
            reference: `${intent}:${planType || 'none'}`,
            // Store metadata in opt fields for retrieval during callback verification
            optA: user.id,         // userId
            optB: intent,          // intent (add_balance or subscribe)
            optC: planType || '',  // plan type
        })

        // Record the payment session in DB (using bkash_payments table)
        const { error: dbError } = await adminSupabase
            .from('bkash_payments')
            .insert({
                user_id: user.id,
                payment_id: confirmedInvoice,
                invoice_number: confirmedInvoice,
                intent,
                plan_type: planType || null,
                amount: amountNum,
                status: 'created',
                payment_method: 'paystation',
            })

        if (dbError) {
            console.error('Failed to record payment:', dbError)
            // Don't fail the request; payment can still proceed
        }

        return NextResponse.json({ paymentUrl, invoiceNumber: confirmedInvoice })
    } catch (error) {
        console.error('Paystation create payment error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'পেমেন্ট শুরু করতে ব্যর্থ হয়েছে' },
            { status: 500 }
        )
    }
}
