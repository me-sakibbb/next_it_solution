"use client";

import { useShop } from "@/hooks/use-shop";
import { useSales } from "@/hooks/use-sales";
import { useProducts } from "@/hooks/use-products";
import { useStaff } from "@/hooks/use-staff";
import { DashboardClient } from "./dashboard-client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";


export default function DashboardPage() {
  const { user, shop, loading: shopLoading } = useShop();
  const { sales, isLoading: salesLoading } = useSales(shop?.id || "");
  const { products, loading: productsLoading } = useProducts(shop?.id || "");
  const { staff, loading: staffLoading } = useStaff(shop?.id || "");
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        const supabase = createClient();
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(data);
      }
    }
    fetchProfile();
  }, [user]);

  // Show loading state while fetching initial data
  if (shopLoading || salesLoading || productsLoading || staffLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!shop || !user) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center space-y-4">
          <p className="text-destructive">Failed to load shop data</p>
        </div>
      </div>
    );
  }

  const totalRevenue = sales.reduce(
    (sum, sale) => sum + Number(sale.total_amount),
    0,
  );
  const activeProducts = products.filter((p) => p.is_active).length;
  const activeStaff = staff?.filter((s) => s.is_active).length || 0;

  return (
    <DashboardClient
      totalRevenue={totalRevenue}
      activeProducts={activeProducts}
      activeStaff={activeStaff}
      salesCount={sales.length}
      shopName={shop.name}
      productsTotal={products.length}
      staffTotal={staff?.length || 0}
      userEmail={user.email}
      user={user}
      profile={profile}
    />
  );
}
