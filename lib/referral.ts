import { createAdminClient } from '@/lib/supabase/admin'

const REFERRAL_BONUS = 49 // Taka
const QUALIFYING_AMOUNT = 200 // Minimum spend to qualify

/**
 * Check if a user was referred and if the referrer should receive a bonus.
 * The referrer gets ৳49 bonus when the referred user:
 * - Tops up at least ৳200, OR
 * - Buys a subscription worth at least ৳200
 * 
 * The bonus is only awarded once per referral.
 */
export async function checkAndRewardReferral(
    userId: string,
    amount: number,
    type: 'topup' | 'subscription'
) {
    if (amount < QUALIFYING_AMOUNT) return

    try {
        const adminSupabase = createAdminClient()

        // Check if this user was referred (has a pending referral record)
        const { data: referral, error: refError } = await adminSupabase
            .from('referrals')
            .select('id, referrer_id, status')
            .eq('referred_id', userId)
            .eq('status', 'pending')
            .maybeSingle()

        if (refError || !referral) return // No pending referral found

        // Mark as qualified first
        await adminSupabase
            .from('referrals')
            .update({
                status: 'qualified',
                qualified_at: new Date().toISOString(),
            })
            .eq('id', referral.id)

        // Award bonus to referrer
        const { data: referrer, error: referrerErr } = await adminSupabase
            .from('users')
            .select('balance, full_name')
            .eq('id', referral.referrer_id)
            .single()

        if (referrerErr || !referrer) {
            console.error('Failed to fetch referrer for bonus:', referrerErr)
            return
        }

        const newBalance = parseFloat(referrer.balance || 0) + REFERRAL_BONUS

        // Update referrer's balance
        await adminSupabase
            .from('users')
            .update({ balance: newBalance })
            .eq('id', referral.referrer_id)

        // Log the bonus in balance_transactions
        await adminSupabase.from('balance_transactions').insert({
            user_id: referral.referrer_id,
            amount: REFERRAL_BONUS,
            type: 'credit',
            description: `রেফারেল বোনাস (নতুন ব্যবহারকারী ${type === 'topup' ? 'টপআপ' : 'সাবস্ক্রিপশন'} করেছেন)`,
            reference_id: referral.id,
            reference_type: 'referral_bonus',
        })

        // Mark referral as rewarded
        await adminSupabase
            .from('referrals')
            .update({
                status: 'rewarded',
                rewarded_at: new Date().toISOString(),
            })
            .eq('id', referral.id)

        // Notify the referrer
        await adminSupabase.from('notifications').insert({
            user_id: referral.referrer_id,
            title: 'রেফারেল বোনাস পেয়েছেন! 🎁',
            message: `আপনার রেফারেল থেকে ৳${REFERRAL_BONUS} বোনাস আপনার ওয়ালেটে যোগ হয়েছে!`,
            type: 'payment',
            action_url: '/dashboard/billing',
        })
    } catch (error) {
        // Don't throw — referral bonus failure should not break the main transaction
        console.error('Referral reward error:', error)
    }
}

/**
 * Create a referral record when a new user signs up with a referral code.
 * Called from the server-side signup handling.
 */
export async function createReferralRecord(referredUserId: string, referralCode: string) {
    try {
        const adminSupabase = createAdminClient()

        // Find the referrer by referral code
        const { data: referrer, error: findErr } = await adminSupabase
            .from('users')
            .select('id')
            .eq('referral_code', referralCode.toUpperCase().trim())
            .single()

        if (findErr || !referrer) {
            console.error('Referral code not found:', referralCode)
            return false
        }

        // Don't allow self-referral
        if (referrer.id === referredUserId) {
            return false
        }

        // Check if referral already exists
        const { data: existing } = await adminSupabase
            .from('referrals')
            .select('id')
            .eq('referrer_id', referrer.id)
            .eq('referred_id', referredUserId)
            .maybeSingle()

        if (existing) {
            return false // Already exists
        }

        // Create the referral record
        const { error: insertErr } = await adminSupabase
            .from('referrals')
            .insert({
                referrer_id: referrer.id,
                referred_id: referredUserId,
                status: 'pending',
            })

        if (insertErr) {
            console.error('Failed to create referral record:', insertErr)
            return false
        }

        // Update the referred user's referred_by field
        await adminSupabase
            .from('users')
            .update({ referred_by: referralCode.toUpperCase().trim() })
            .eq('id', referredUserId)

        return true
    } catch (error) {
        console.error('Create referral record error:', error)
        return false
    }
}
