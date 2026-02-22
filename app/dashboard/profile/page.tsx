import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Bell, Shield, CreditCard, Mail, Check } from "lucide-react";
import { getSubscription } from "@/app/actions/subscriptions";
import { AccountOverview } from "@/components/dashboard/account-overview";
import { ProfileForm } from "@/components/dashboard/profile-form";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const subscription = await getSubscription(user.id);

  const plans = [
    {
      name: "Free",
      price: 0,
      features: [
        "100 Products",
        "1 Staff Member",
        "Basic Reports",
        "Email Support",
      ],
    },
    {
      name: "Pro",
      price: 29,
      features: [
        "Unlimited Products",
        "Up to 10 Staff",
        "Advanced Reports",
        "Priority Support",
        "API Access",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: 99,
      features: [
        "Unlimited Products",
        "Unlimited Staff",
        "Custom Reports",
        "24/7 Support",
        "API Access",
        "Custom Integrations",
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">
          View your account details, balance, and subscription plans.
        </p>
      </div>

      <AccountOverview user={user} profile={profile} />

      <div className="mt-10">
        <h2 className="text-2xl font-bold tracking-tight mb-6">
          Personal details
        </h2>
        <ProfileForm profile={profile} email={user.email} />
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold tracking-tight mb-6">
          Subscription Plans
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`flex flex-col relative overflow-hidden ${plan.popular ? "border-primary shadow-md" : ""}`}
            >
              {plan.popular && (
                <div className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium text-center relative z-10 w-full">
                  Most Popular
                </div>
              )}
              <CardHeader className={plan.popular ? "pt-4" : ""}>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-foreground">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground">/month</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant={plan.popular ? "default" : "outline"}
                  className="w-full"
                  disabled={
                    subscription?.plan_type === plan.name.toLowerCase() ||
                    (plan.name === "Free" && !subscription)
                  }
                >
                  {subscription?.plan_type === plan.name.toLowerCase() ||
                  (plan.name === "Free" && !subscription)
                    ? "Current Plan"
                    : `Upgrade to ${plan.name}`}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
