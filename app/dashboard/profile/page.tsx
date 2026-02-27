import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { AccountOverview } from "@/components/dashboard/account-overview";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { SubscriptionPlans } from "@/components/dashboard/subscription-plans";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const adminSupabase = createAdminClient();

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fix: use adminSupabase instead of regular client which is blocked by RLS
  const { data: subscription } = await adminSupabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order('status', { ascending: true })
    .order('subscription_start_date', { ascending: false })
    .limit(1)
    .maybeSingle();

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
