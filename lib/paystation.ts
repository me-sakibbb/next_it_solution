/**
 * Paystation Payment Gateway API Client — SERVER SIDE ONLY
 * Docs: https://www.paystation.com.bd/documentation
 * Never import this file in client components.
 *
 * Security:
 * - merchantId and password are never exposed to the client
 * - All payment verifications use server-side Transaction Status API
 * - Callback query params are never trusted without server-side verification
 */

const PAYSTATION_API_URL = 'https://api.paystation.com.bd'
const PAYSTATION_MERCHANT_ID = process.env.PAYSTATION_MERCHANT_ID!.trim()
const PAYSTATION_PASSWORD = process.env.PAYSTATION_PASSWORD!.trim()

/* ─── Types ─────────────────────────────────────────── */

export interface InitiatePaymentParams {
    invoiceNumber: string
    amount: number
    custName: string
    custPhone: string
    custEmail: string
    custAddress: string
    callbackUrl: string
    reference?: string
    checkoutItems?: string
    optA?: string   // custom field — we store userId here
    optB?: string   // custom field — we store intent here
    optC?: string   // custom field — we store planType here
}

export interface InitiatePaymentResult {
    paymentUrl: string
    invoiceNumber: string
    paymentAmount: string
}

export interface TransactionStatusResult {
    statusCode: string
    status: string
    message: string
    data: {
        invoice_number: string
        trx_status: string
        trx_id: string
        payment_amount: string
        order_date_time: string
        payer_mobile_no: string
        payment_method: string
        reference: string
        checkout_items: string
        opt_a?: string
        opt_b?: string
        opt_c?: string
    }
}

/* ─── Initiate Payment ──────────────────────────────── */

/**
 * Creates a Paystation payment session.
 * Uses form data (application/x-www-form-urlencoded) as per docs.
 * Returns the payment URL to redirect the user to.
 */
export async function initiatePayment(params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
    const payload: Record<string, any> = {
        merchantId: PAYSTATION_MERCHANT_ID,
        password: PAYSTATION_PASSWORD,
        invoice_number: params.invoiceNumber,
        currency: 'BDT',
        payment_amount: params.amount,
        cust_name: params.custName,
        cust_phone: params.custPhone,
        cust_email: params.custEmail,
        cust_address: params.custAddress,
        callback_url: params.callbackUrl,
    }

    if (params.reference) payload.reference = params.reference
    if (params.checkoutItems) payload.checkout_items = params.checkoutItems
    if (params.optA) payload.opt_a = params.optA
    if (params.optB) payload.opt_b = params.optB
    if (params.optC) payload.opt_c = params.optC

    const res = await fetch(`${PAYSTATION_API_URL}/initiate-payment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
    })

    const rawText = await res.text()

    if (!res.ok) {
        console.error(`Paystation initiate-payment failed (${res.status}):`, rawText)
        throw new Error(`Paystation initiate payment failed (${res.status}): ${rawText}`)
    }

    let data: Record<string, any>
    try {
        data = JSON.parse(rawText)
    } catch {
        throw new Error(`Paystation initiate payment: invalid JSON — ${rawText}`)
    }

    if (data.status_code !== '200' || data.status !== 'success') {
        throw new Error(`Paystation initiate payment error: ${data.message || JSON.stringify(data)}`)
    }

    return {
        paymentUrl: data.payment_url,
        invoiceNumber: data.invoice_number,
        paymentAmount: data.payment_amount,
    }
}

/* ─── Transaction Status (Verification) ─────────────── */

/**
 * Verify a payment using Paystation Transaction Status API.
 *
 * CRITICAL: Always call this server-side after callback redirect
 * to prevent forged payment confirmations.
 */
export async function verifyTransaction(invoiceNumber: string): Promise<TransactionStatusResult> {
    const payload = {
        invoice_number: invoiceNumber
    }

    const res = await fetch(`${PAYSTATION_API_URL}/transaction-status`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'merchantId': PAYSTATION_MERCHANT_ID,
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
    })

    const rawText = await res.text()

    if (!res.ok) {
        console.error(`Paystation transaction-status failed (${res.status}):`, rawText)
        throw new Error(`Paystation verify transaction failed (${res.status}): ${rawText}`)
    }

    let data: Record<string, any>
    try {
        data = JSON.parse(rawText)
    } catch {
        throw new Error(`Paystation verify transaction: invalid JSON — ${rawText}`)
    }

    if (data.status_code !== '200' || data.status !== 'success') {
        throw new Error(`Paystation verify error: ${data.message || JSON.stringify(data)}`)
    }

    return data as TransactionStatusResult
}
