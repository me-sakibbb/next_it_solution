/**
 * bKash Tokenized Checkout API Client — SERVER SIDE ONLY
 * Docs: https://developer.bka.sh/docs/grant-token-3
 * Never import this file in client components.
 */

const BKASH_BASE_URL = process.env.BKASH_BASE_URL!
const BKASH_USERNAME = process.env.BKASH_USERNAME!
const BKASH_PASSWORD = process.env.BKASH_PASSWORD!
const BKASH_APP_KEY = process.env.BKASH_APP_KEY!
const BKASH_APP_SECRET = process.env.BKASH_APP_SECRET!

// In-memory token cache (per serverless instance lifetime)
let cachedToken: { token: string; refreshToken: string; expiresAt: number } | null = null

/**
 * Grant (or return cached) bKash id_token.
 * Ref: POST /tokenized/checkout/token/grant
 * Success response: { id_token, token_type, expires_in, refresh_token }
 * NOTE: bKash does NOT include statusCode in the success token response.
 */
export async function grantToken(): Promise<string> {
    const now = Date.now()

    // Return cached token if still valid (with 60s buffer)
    if (cachedToken && cachedToken.expiresAt > now + 60_000) {
        return cachedToken.token
    }

    const res = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/token/grant`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            username: BKASH_USERNAME,
            password: BKASH_PASSWORD,
        },
        body: JSON.stringify({
            app_key: BKASH_APP_KEY,
            app_secret: BKASH_APP_SECRET,
        }),
        cache: 'no-store',
    })

    const rawText = await res.text()

    if (!res.ok) {
        throw new Error(`bKash token grant failed (${res.status}): ${rawText}`)
    }

    let data: Record<string, any>
    try {
        data = JSON.parse(rawText)
    } catch {
        throw new Error(`bKash token: invalid JSON — ${rawText}`)
    }

    // bKash success token response only has id_token (no statusCode field)
    if (!data.id_token) {
        // If bKash returned an error object (e.g. during wrong credentials)
        const errMsg = data.statusMessage || data.msg || data.message || JSON.stringify(data)
        throw new Error(`bKash token error: ${errMsg}`)
    }

    const expiresInMs = (parseInt(data.expires_in) || 3600) * 1000
    cachedToken = {
        token: data.id_token,
        refreshToken: data.refresh_token || '',
        expiresAt: now + expiresInMs,
    }

    return cachedToken.token
}

export interface CreatePaymentParams {
    amount: number
    intent: 'add_balance' | 'subscribe'
    userId: string
    planType?: string
    callbackURL: string
    merchantInvoiceNumber: string
}

export interface CreatePaymentResult {
    paymentID: string
    bkashURL: string
}

/**
 * Create a bKash payment session.
 * Ref: POST /tokenized/checkout/create
 * mode '0011' = direct payment without prior agreement (customer enters wallet+PIN on bKash page)
 */
export async function createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult> {
    const token = await grantToken()

    const res = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            authorization: token,
            'x-app-key': BKASH_APP_KEY,
        },
        body: JSON.stringify({
            mode: '0011',
            payerReference: params.userId,
            callbackURL: params.callbackURL,
            amount: params.amount.toFixed(2),
            currency: 'BDT',
            intent: 'sale',
            merchantInvoiceNumber: params.merchantInvoiceNumber,
        }),
        cache: 'no-store',
    })

    const rawText = await res.text()

    if (!res.ok) {
        throw new Error(`bKash create payment failed (${res.status}): ${rawText}`)
    }

    let data: Record<string, any>
    try {
        data = JSON.parse(rawText)
    } catch {
        throw new Error(`bKash create payment: invalid JSON — ${rawText}`)
    }

    if (data.statusCode !== '0000') {
        throw new Error(`bKash create payment error: ${data.statusMessage || JSON.stringify(data)}`)
    }

    return {
        paymentID: data.paymentID,
        bkashURL: data.bkashURL,
    }
}

export interface ExecutePaymentResult {
    trxID: string
    amount: string
    customerMsisdn: string
    merchantInvoiceNumber: string
    paymentExecuteTime: string
}

/**
 * Execute (confirm) a bKash payment after user approval.
 * Ref: POST /tokenized/checkout/execute
 * Body: { paymentID }
 */
export async function executePayment(paymentID: string): Promise<ExecutePaymentResult> {
    const token = await grantToken()

    const res = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/execute`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            authorization: token,
            'x-app-key': BKASH_APP_KEY,
        },
        body: JSON.stringify({ paymentID }),
        cache: 'no-store',
    })

    const rawText = await res.text()

    if (!res.ok) {
        throw new Error(`bKash execute payment failed (${res.status}): ${rawText}`)
    }

    let data: Record<string, any>
    try {
        data = JSON.parse(rawText)
    } catch {
        throw new Error(`bKash execute: invalid JSON — ${rawText}`)
    }

    if (data.statusCode !== '0000') {
        throw new Error(`bKash execute error: ${data.statusMessage || JSON.stringify(data)}`)
    }

    return {
        trxID: data.trxID,
        amount: data.amount,
        customerMsisdn: data.customerMsisdn,
        merchantInvoiceNumber: data.merchantInvoiceNumber,
        paymentExecuteTime: data.paymentExecuteTime,
    }
}

/**
 * Query bKash payment status.
 * Ref: POST /tokenized/checkout/payment/status
 */
export async function queryPayment(paymentID: string) {
    const token = await grantToken()

    const res = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/payment/status`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            authorization: token,
            'x-app-key': BKASH_APP_KEY,
        },
        body: JSON.stringify({ paymentID }),
        cache: 'no-store',
    })

    const rawText = await res.text()

    if (!res.ok) {
        throw new Error(`bKash query payment failed (${res.status}): ${rawText}`)
    }

    return JSON.parse(rawText)
}
