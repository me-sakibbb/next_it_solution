import { SubscriptionPlanType } from "./types"

export interface PlanLimits {
    cv_makes: number
    autofill_applications: number
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionPlanType, PlanLimits> = {
    trial: {
        cv_makes: 0,
        autofill_applications: 0
    },
    basic: { // Legacy or fallback
        cv_makes: 5,
        autofill_applications: 10
    },
    premium: { // Legacy or fallback
        cv_makes: 20,
        autofill_applications: 40
    },
    enterprise: { // Legacy or fallback
        cv_makes: 100,
        autofill_applications: 200
    },
    basic_bit: {
        cv_makes: 10,
        autofill_applications: 20
    },
    advance_plus: {
        cv_makes: 20,
        autofill_applications: 40
    },
    premium_power: {
        cv_makes: 40,
        autofill_applications: 80
    }
}

export function getLimitsForPlan(plan: SubscriptionPlanType): PlanLimits {
    return SUBSCRIPTION_LIMITS[plan] || SUBSCRIPTION_LIMITS.trial
}
