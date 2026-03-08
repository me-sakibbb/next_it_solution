"use client";

import { LogOut, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { NotificationsDropdown } from "./notifications";
import { AddBalanceModal } from "./add-balance-modal";
import Link from "next/link";
import { Wallet, Crown } from "lucide-react";
import { useSubscriptionStatus } from "@/hooks/use-subscription-status";
import { SubscriptionContext } from "@/lib/subscription-context";
import { useState, useEffect } from "react";

interface UniversalHeaderProps {
  user: User;
  profile: any;
}

export function UniversalHeader({ user, profile }: UniversalHeaderProps) {
  const router = useRouter();
  const { status, loading, refresh } = useSubscriptionStatus(user.id);
  const [balance, setBalance] = useState<number>(parseFloat(profile?.balance ?? 0));

  // Keep balance in sync with real-time updates to the users table
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`user-balance-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const newBalance = parseFloat(payload.new?.balance ?? 0);
          setBalance(newBalance);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id]);

  const formatCurrency = (amount: number) => {
    return `৳${new Intl.NumberFormat("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  const planMap: Record<string, string> = {
    'free': 'ফ্রি প্ল্যান',
    'trial': 'ফ্রি প্ল্যান',
    'basic_bit': 'বেসিক বিট',
    'advance_plus': 'এডভান্স প্লাস',
    'premium_power': 'প্রিমিয়াম পাওয়ার',
    'Free': 'ফ্রি প্ল্যান'
  }

  const planName = planMap[status?.subscription?.plan_type || "Free"] || (status?.subscription?.plan_type || "ফ্রি");
  const isActive = status?.isActive || false;

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <SubscriptionContext.Provider value={{ refresh }}>
      <header className="flex h-16 items-center gap-4 border-b bg-card px-6 sticky top-0 z-50">
        <div className="flex flex-1 items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 group mr-4">
            <img src="/logo.png" alt="Nex IT Solution" className="h-10 w-auto transition-all group-hover:scale-110 group-active:scale-95" />
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none tracking-tight text-foreground transition-colors group-hover:text-primary">
                Nex IT
              </span>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Solution
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Balance and Subscription Info */}
          <div className="hidden md:flex items-center gap-3 mr-2 bg-muted/50 rounded-full px-3 py-1.5 border">
            <div className="flex items-center gap-2 text-sm font-medium pr-2 border-r">
              <div className="flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-blue-500" />
                <span>{formatCurrency(balance)}</span>
              </div>
              <AddBalanceModal />
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <Crown
                className={`w-4 h-4 ${isActive ? "text-amber-500" : "text-muted-foreground"}`}
              />
              <span className="capitalize">{planName}</span>
            </div>
          </div>

          <NotificationsDropdown userId={user.id} />

          <div className="h-6 w-px bg-border mx-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full p-0 hover:bg-muted ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-sm font-semibold text-primary border border-primary/20 shadow-sm">
                  {profile?.full_name?.charAt(0).toUpperCase() ||
                    user.email?.charAt(0).toUpperCase() ||
                    "U"}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 mt-2 animate-in fade-in-0 zoom-in-95"
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {profile?.full_name || "ব্যবহারকারী"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push("/dashboard")}
                className="cursor-pointer"
              >
                ড্যাশবোর্ড
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/dashboard/profile")}
                className="cursor-pointer"
              >
                প্রোফাইল
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-destructive focus:bg-destructive/10 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                লগ আউট
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </SubscriptionContext.Provider>
  );
}
