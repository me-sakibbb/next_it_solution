"use client";

import { useState } from "react";
import { ImageIcon, FileUser, Store, ShoppingBag, Landmark, Briefcase, Globe } from "lucide-react";
import { ServiceCard } from "@/components/dashboard/service-card";
import { RecentOrdersWidget } from "@/components/dashboard/recent-orders-widget";
import { ServiceOrder, Service } from "@/lib/types";
import { ServiceOrderDialog } from "@/components/services/service-order-dialog";

interface DashboardClientProps {
  totalRevenue: number;
  activeProducts: number;
  activeStaff: number;
  salesCount: number;
  shopName: string;
  productsTotal: number;
  staffTotal: number;
  userEmail: string | undefined;
  user: any;
  profile: any;
  orders?: ServiceOrder[];
  premiumServices?: Service[];
  userBalance?: number;
  onRefresh?: () => void;
}

export function DashboardClient({
  totalRevenue,
  activeProducts,
  activeStaff,
  salesCount,
  shopName,
  productsTotal,
  staffTotal,
  userEmail,
  user,
  profile,
  orders = [],
  premiumServices = [],
  userBalance = 0,
  onRefresh,
}: DashboardClientProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);

  const handleServiceClick = (serviceName: string) => {
    const service = premiumServices.find(s => s.name === serviceName);
    if (service) {
      setSelectedService(service);
      setIsOrderDialogOpen(true);
    } else {
      alert("Service not found. Please contact admin.");
    }
  };

  const handleDirectServiceClick = (service: Service) => {
    setSelectedService(service);
    setIsOrderDialogOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-12 animate-fade-in">
      {/* Header Section */}
      <section>
        <div className="mb-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            ড্যাশবোর্ড
          </h1>
          <p className="text-muted-foreground text-lg">
            আপনার অ্যাকাউন্ট, সার্ভিস এবং কার্যক্রম পরিচালনা করুন।
          </p>
        </div>
      </section>

      {/* Basic Services - Full Width */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-1 bg-primary rounded-full" />
          <h2 className="text-2xl font-bold tracking-tight">
            আপনার সার্ভিসসমূহ
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ServiceCard
            title="ফটো অপ্টিমাইজার"
            description="AI-চালিত ইমেজ এনহান্সমেন্ট। লাইটিং সমন্বয় করুন, ব্যাকগ্রাউন্ড সরান এবং আরও অনেক কিছু।"
            icon={ImageIcon}
            href="/dashboard/photo-enhancer"
            colorClass="bg-purple-500/10 text-purple-600"
            iconColorClass="text-purple-600"
          />
          <ServiceCard
            title="AI সিভি বিল্ডার"
            description="AI সহায়তা এবং টেমপ্লেট ব্যবহার করে প্রফেশনাল রেজুমে তৈরি করুন।"
            icon={FileUser}
            href="/dashboard/cv-builder"
            colorClass="bg-blue-500/10 text-blue-600"
            iconColorClass="text-blue-600"
          />
          <ServiceCard
            title="শপ ম্যানেজমেন্ট"
            description="সম্পূর্ণ ব্যবসা পরিচালনা: বিক্রয়, ইনভেন্টরি, কর্মচারী এবং রিপোর্ট।"
            icon={Store}
            href="/dashboard/shop"
            colorClass="bg-emerald-500/10 text-emerald-600"
            iconColorClass="text-emerald-600"
          />
          <ServiceCard
            title="জন্ম নিবন্ধনের ফর্ম অটোমেশন এআই"
            description="সহজে এবং নির্ভুলভাবে জন্ম নিবন্ধনের ফর্ম পূরণ করুন।"
            icon={Landmark}
            href="#"
            onClick={() => handleServiceClick("জন্ম নিবন্ধনের ফর্ম অটোমেশন এআই")}
            colorClass="bg-orange-500/10 text-orange-600"
            iconColorClass="text-orange-600"
          />
          <ServiceCard
            title="টেলিটক জব ফর্ম অটোমেশন এআই"
            description="টেলিটক জব অ্যাপ্লিকেশনের ফর্ম স্বয়ংক্রিয়ভাবে পূরণ করুন।"
            icon={Briefcase}
            href="#"
            onClick={() => handleServiceClick("টেলিটক জব ফর্ম অটোমেশন এআই")}
            colorClass="bg-sky-500/10 text-sky-600"
            iconColorClass="text-sky-600"
          />
          <ServiceCard
            title="ইন্ডিয়ান ভিসা ফর্ম অটোমেশন এআই"
            description="ইন্ডিয়ান ভিসার জন্য দ্রুত এবং নির্ভুল ফর্ম ফিলিং সার্ভিস।"
            icon={Globe}
            href="#"
            onClick={() => handleServiceClick("ইন্ডিয়ান ভিসা ফর্ম অটোমেশন এআই")}
            colorClass="bg-indigo-500/10 text-indigo-600"
            iconColorClass="text-indigo-600"
          />
        </div>
      </section>

      {/* Lower Section: Premium Services & Orders side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Premium Services (Left 2/3) */}
        <div className="lg:col-span-2">
          {premiumServices && premiumServices.length > 0 && (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 p-8 border border-amber-500/10 h-full">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-amber-500/10 rounded-xl">
                  <ShoppingBag className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-amber-900 dark:text-amber-100">
                    প্রিমিয়াম সার্ভিসসমূহ
                  </h2>
                  <p className="text-amber-700/70 dark:text-amber-400/70">
                    আপনার ব্যবসার সমৃদ্ধির জন্য বিশেষভাবে সংগৃহীত
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {premiumServices.slice(0, 4).map((service) => (
                  <ServiceCard
                    key={service.id}
                    title={service.name}
                    description={service.description || ""}
                    icon={ShoppingBag}
                    href="#"
                    onClick={() => handleDirectServiceClick(service)}
                    colorClass="bg-amber-500/10 text-amber-600"
                    iconColorClass="text-amber-600"
                    price={service.price}
                  />
                ))}
              </div>

              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
            </div>
          )}
        </div>

        {/* Your Orders (Right 1/3) */}
        <div className="lg:sticky lg:top-24">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">
              আপনার অর্ডারসমূহ
            </h2>
            <p className="text-muted-foreground">
              আপনার সার্ভিসের অনুরোধগুলো ট্র্যাক করুন।
            </p>
          </div>
          <RecentOrdersWidget orders={orders || []} />
        </div>
      </div>

      <ServiceOrderDialog
        service={selectedService}
        isOpen={isOrderDialogOpen}
        onOpenChange={setIsOrderDialogOpen}
        userBalance={userBalance}
        onOrderSuccess={onRefresh}
      />
    </div>
  );
}
