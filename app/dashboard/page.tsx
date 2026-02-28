"use client";

import { useShop } from "@/hooks/use-shop";
import { useSales } from "@/hooks/use-sales";
import { useProducts } from "@/hooks/use-products";
import { useStaff } from "@/hooks/use-staff";
import { DashboardClient } from "./dashboard-client";
import { useServices } from "@/hooks/use-services";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getResourceLinks } from "@/actions/settings";


export default function DashboardPage() {
  const { user, shop, loading: shopLoading } = useShop();
  const { sales, isLoading: salesLoading } = useSales(shop?.id || "");
  const { products, loading: productsLoading } = useProducts(shop?.id || "");
  const { staff, loading: staffLoading } = useStaff(shop?.id || "");
  const { services: premiumServices, orders, balance, refresh, loading: servicesLoading } = useServices();
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [resourceLinks, setResourceLinks] = useState({ graphics_files_drive_url: '', certificate_formats_drive_url: '' });

  useEffect(() => {
    getResourceLinks()
      .then(setResourceLinks)
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function fetchUserData() {
      if (user) {
        const supabase = createClient();
        const [profileRes, subRes] = await Promise.all([
          supabase.from("users").select("*").eq("id", user.id).single(),
          supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", user.id)
            .order("subscription_start_date", { ascending: false })
            .limit(1)
            .maybeSingle()
        ]);
        setProfile(profileRes.data);
        // Only mark subscription as active if status='active' AND end_date in the future
        const sub = subRes.data;
        if (
          sub &&
          sub.status === "active" &&
          sub.subscription_end_date &&
          new Date(sub.subscription_end_date) > new Date()
        ) {
          setSubscription(sub);
        } else {
          setSubscription(null);
        }
      }
    }
    fetchUserData();
  }, [user]);

  // Show loading state while fetching initial data
  if (shopLoading || salesLoading || productsLoading || staffLoading || servicesLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">ড্যাশবোর্ড লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!shop || !user) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center space-y-4">
          <p className="text-destructive">শপ ডেটা লোড করতে ব্যর্থ হয়েছে</p>
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
      premiumServices={premiumServices}
      orders={orders}
      userBalance={balance}
      subscription={subscription}
      onRefresh={refresh}
      graphicsFilesUrl={resourceLinks.graphics_files_drive_url}
      certificateFormatsUrl={resourceLinks.certificate_formats_drive_url}
    />
  );
}
