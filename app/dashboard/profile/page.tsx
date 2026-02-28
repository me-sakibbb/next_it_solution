import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { AccountOverview } from "@/components/dashboard/account-overview";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { SubscriptionPlans } from "@/components/dashboard/subscription-plans";
import { ReferralSection } from "@/components/dashboard/referral-section";
import { headers } from "next/headers";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const adminSupabase = createAdminClient();

  const [profileRes, subscriptionRes, referralsRes] = await Promise.all([
    adminSupabase.from("users").select("*").eq("id", user.id).single(),
    adminSupabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("status", { ascending: true })
      .order("subscription_start_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    adminSupabase
      .from("referrals")
      .select("id, status, bonus_amount, created_at", { count: "exact" })
      .eq("referrer_id", user.id),
  ]);

  const profile = profileRes.data;
  const subscription = subscriptionRes.data;
  const referrals = referralsRes.data ?? [];
  const referralCount = referralsRes.count ?? 0;

  const referralStats = {
    total: referralCount,
    rewarded: referrals.filter((r) => r.status === "rewarded").length,
    pending: referrals.filter((r) => r.status === "pending").length,
    totalEarned: referrals
      .filter((r) => r.status === "rewarded")
      .reduce((sum, r) => sum + parseFloat(r.bonus_amount || 0), 0),
  };

  // Build site URL for referral link
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";
  const siteUrl = `${proto}://${host}`;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">আমার প্রোফাইল</h1>
        <p className="text-muted-foreground">
          আপনার অ্যাকাউন্টের বিবরণ, ব্যালেন্স এবং সাবস্ক্রিপশন প্ল্যান দেখুন।
        </p>
      </div>

      <AccountOverview
        subscription={subscription}
        balance={profile?.balance || 0}
      />

      <div className="mt-10">
        <h2 className="text-2xl font-bold tracking-tight mb-6">
          ব্যক্তিগত বিবরণ
        </h2>
        <ProfileForm profile={profile} email={user.email} />
      </div>

      {/* Referral Section */}
      {profile?.referral_code && (
        <div className="mt-10">
          <ReferralSection
            referralCode={profile.referral_code}
            stats={referralStats}
            siteUrl={siteUrl}
          />
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-2xl font-bold tracking-tight mb-6">
          সাবস্ক্রিপশন প্ল্যানসমূহ
        </h2>
        <SubscriptionPlans
          currentPlan={subscription?.plan_type}
          userBalance={profile?.balance || 0}
        />
      </div>
    </div>
  );
}
