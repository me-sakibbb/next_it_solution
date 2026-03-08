import { SubscriptionPlanType } from "./types"

export interface PlanLimits {
    cv_makes: number
    autofill_applications: number
    profile_extractions: number
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionPlanType, PlanLimits> = {
    trial: {
        cv_makes: 0,
        autofill_applications: 0,
        profile_extractions: 0
    },
    basic_bit: {
        cv_makes: 10,
        autofill_applications: 20,
        profile_extractions: 20
    },
    advance_plus: {
        cv_makes: 20,
        autofill_applications: 40,
        profile_extractions: 40
    },
    premium_power: {
        cv_makes: 40,
        autofill_applications: 80,
        profile_extractions: 80
    }
}

export function getLimitsForPlan(plan: SubscriptionPlanType): PlanLimits {
    return SUBSCRIPTION_LIMITS[plan] || SUBSCRIPTION_LIMITS.trial
}
