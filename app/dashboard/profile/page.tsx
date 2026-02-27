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

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const plans = [
    {
      name: "Free",
      price: 0,
      features: [
        "১০০টি পণ্য",
        "১জন কর্মচারী",
        "বেসিক রিপোর্ট",
        "ইমেইল সাপোর্ট",
      ],
    },
    {
      name: "Pro",
      price: 29,
      features: [
        "আনলিমিটেড পণ্য",
        "১০জন পর্যন্ত কর্মচারী",
        "উন্নত রিপোর্ট",
        "অগ্রাধিকার সাপোর্ট",
        "এপিআই অ্যাক্সেস",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: 99,
      features: [
        "আনলিমিটেড পণ্য",
        "আনলিমিটেড কর্মচারী",
        "কাস্টম রিপোর্ট",
        "২৪/৭ সাপোর্ট",
        "এপিআই অ্যাক্সেস",
        "কাস্টম ইন্টিগ্রেশন",
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">আমার প্রোফাইল</h1>
        <p className="text-muted-foreground">
          আপনার অ্যাকাউন্টের বিবরণ, ব্যালেন্স এবং সাবস্ক্রিপশন প্ল্যান দেখুন।
        </p>
      </div>

      <AccountOverview user={user} profile={profile} />

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
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`flex flex-col relative overflow-hidden ${plan.popular ? "border-primary shadow-md" : ""}`}
            >
              {plan.popular && (
                <div className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium text-center relative z-10 w-full">
                  সবচেয়ে জনপ্রিয়
                </div>
              )}
              <CardHeader className={plan.popular ? "pt-4" : ""}>
                <CardTitle className="text-xl">{plan.name === "Free" ? "ফ্রি" : plan.name === "Pro" ? "প্রো" : "এন্টারপ্রাইজ"}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-foreground">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground">/মাস</span>
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
                    ? "বর্তমান প্ল্যান"
                    : `${plan.name}-এ আপগ্রেড করুন`}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
