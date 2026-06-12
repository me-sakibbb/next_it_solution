"use client";

import { useState } from "react";
import { ImageIcon, FileUser, Store, ShoppingBag, BotMessageSquare, BrainCircuit, ScanFace, FolderOpen, FileText, ScanText, Plane, Sparkles, Laptop, Globe, Wrench, FileCode, CheckSquare, Palette } from "lucide-react";
import { ServiceCard } from "@/components/dashboard/service-card";
import { RecentOrdersWidget } from "@/components/dashboard/recent-orders-widget";
import { ServiceOrder, Service, FlightTicketOrder } from "@/lib/types";
import { ServiceOrderDialog } from "@/components/services/service-order-dialog";
import { useUsageLimits } from "@/hooks/use-usage-limits";

// Dynamic Icon selector for premium services
const getServiceIcon = (name: string, category?: string) => {
  const searchStr = `${name} ${category || ''}`.toLowerCase();
  if (searchStr.includes('design') || searchStr.includes('ডিজাইন') || searchStr.includes('ফটো') || searchStr.includes('photo') || searchStr.includes('logo') || searchStr.includes('গ্রাফিক্স')) {
    return Palette;
  }
  if (searchStr.includes('web') || searchStr.includes('ওয়েব') || searchStr.includes('website') || searchStr.includes('internet') || searchStr.includes('ডোমেইন') || searchStr.includes('domain') || searchStr.includes('hosting')) {
    return Globe;
  }
  if (searchStr.includes('code') || searchStr.includes('ডেভেলপমেন্ট') || searchStr.includes('development') || searchStr.includes('software') || searchStr.includes('অ্যাপ') || searchStr.includes('app')) {
    return FileCode;
  }
  if (searchStr.includes('setup') || searchStr.includes('সেটআপ') || searchStr.includes('install') || searchStr.includes('কনফিগার') || searchStr.includes('উইন্ডোজ') || searchStr.includes('windows')) {
    return Wrench;
  }
  if (searchStr.includes('task') || searchStr.includes('কাজ') || searchStr.includes('অর্ডার') || searchStr.includes('লিস্ট') || searchStr.includes('list')) {
    return CheckSquare;
  }
  return Sparkles; // default premium icon
};

// Dynamic Color selector for premium services
const getServiceColors = (name: string, category?: string) => {
  const searchStr = `${name} ${category || ''}`.toLowerCase();
  if (searchStr.includes('design') || searchStr.includes('ডিজাইন') || searchStr.includes('ফটো') || searchStr.includes('photo') || searchStr.includes('logo') || searchStr.includes('গ্রাফিক্স')) {
    return {
      colorClass: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
      iconColorClass: "text-purple-500"
    };
  }
  if (searchStr.includes('web') || searchStr.includes('ওয়েব') || searchStr.includes('website') || searchStr.includes('domain') || searchStr.includes('hosting')) {
    return {
      colorClass: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
      iconColorClass: "text-blue-500"
    };
  }
  if (searchStr.includes('code') || searchStr.includes('ডেভেলপমেন্ট') || searchStr.includes('development') || searchStr.includes('software') || searchStr.includes('app')) {
    return {
      colorClass: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
      iconColorClass: "text-emerald-500"
    };
  }
  if (searchStr.includes('setup') || searchStr.includes('সেটআপ') || searchStr.includes('install') || searchStr.includes('windows')) {
    return {
      colorClass: "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
      iconColorClass: "text-orange-500"
    };
  }
  return {
    colorClass: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
    iconColorClass: "text-amber-500"
  };
};

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
  flightTickets?: FlightTicketOrder[];
  premiumServices?: Service[];
  userBalance?: number;
  subscription?: any;
  onRefresh?: () => void;
  graphicsFilesUrl?: string;
  certificateFormatsUrl?: string;
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
  flightTickets = [],
  premiumServices = [],
  userBalance = 0,
  subscription = null,
  onRefresh,
  graphicsFilesUrl = '',
  certificateFormatsUrl = '',
}: DashboardClientProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);

  const { usage, limits } = useUsageLimits();

  const cvLimit = limits && usage !== null
    ? { used: usage.cv_usage, total: limits.cv_makes, label: 'CV তৈরি' }
    : undefined;

  const autofillLimit = limits && usage !== null
    ? { used: usage.autofill_usage, total: limits.autofill_applications, label: 'অটোফিল ব্যবহার' }
    : undefined;

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
              title="শপ ম্যানেজমেন্ট"
              description="দোকানের ইনভেন্টরি ও সেলস ম্যানেজমেন্ট।"
              icon={Store}
              href="/dashboard/shop"
              colorClass="bg-emerald-500/10 text-emerald-600"
              iconColorClass="text-emerald-600"
              adminRestricted={profile?.disabled_features?.includes('shop')}
            />
            <ServiceCard
              title="এআই ফটো এডিটর"
              description="এআই দিয়ে প্রফেশনাল ফটো এডিটিং।"
              icon={ImageIcon}
              href="/dashboard/photo-enhancer"
              colorClass="bg-purple-500/10 text-purple-600"
              iconColorClass="text-purple-600"
              adminRestricted={profile?.disabled_features?.includes('photo-enhancer')}
            />
            <ServiceCard
              title="এআই সিভি বিল্ডার"
              description="এআই দিয়ে স্মার্ট সিভি তৈরি।"
              icon={FileUser}
              href="/dashboard/cv-builder"
              colorClass="bg-blue-500/10 text-blue-600"
              iconColorClass="text-blue-600"
              usageLimit={cvLimit}
              adminRestricted={profile?.disabled_features?.includes('cv-builder')}
            />
            <ServiceCard
              title="প্রিন্ট রেডি"
              description="ছবিকে স্ক্যান করা ডকুমেন্টে রূপান্তর।"
              icon={ScanText}
              href="/dashboard/print-ready"
              colorClass="bg-pink-500/10 text-pink-600"
              iconColorClass="text-pink-600"
              adminRestricted={profile?.disabled_features?.includes('print-ready')}
            />
            <ServiceCard
              title="Autofill Genius AI"
              description="BDRIS, Teletalk, Indian Visa সহ বিভিন্ন সাইটে অটোমেটিক ফর্ম পূরণ।"
              icon={BotMessageSquare}
              href="#"
              externalHref="https://chromewebstore.google.com/detail/ehnlobnglcpkfhmcabgmdinehoamnijh?utm_source=item-share-cb"
              colorClass="bg-orange-500/10 text-orange-600"
              iconColorClass="text-orange-600"
              usageLimit={autofillLimit}
              adminRestricted={profile?.disabled_features?.includes('autofill-genius')}
            />
            <ServiceCard
              title="Instant Autofill Engine"
              description="একটি এক্সটেনশন দিয়েই যেকোনো সাইটে দ্রুত অটোমেটিক ফর্ম পূরণ।"
              icon={BrainCircuit}
              href="#"
              externalHref="https://chromewebstore.google.com/detail/oglepcaekdpgdhgbemfjmkmmihbjokdg?utm_source=item-share-cb"
              colorClass="bg-sky-500/10 text-sky-600"
              iconColorClass="text-sky-600"
              usageLimit={autofillLimit}
              adminRestricted={profile?.disabled_features?.includes('instant-autofill')}
            />
            <ServiceCard
              title="ফ্লাইট টিকেট বুকিং"
              description="বেস্ট প্রাইসে এয়ার টিকেট সংগ্রহ করুন।"
              icon={Plane}
              href="/dashboard/flight-tickets"
              colorClass="bg-blue-600/10 text-blue-700 font-bold"
              iconColorClass="text-blue-700"
              adminRestricted={profile?.disabled_features?.includes('flight-tickets')}
            />
            <ServiceCard
              title="প্রয়োজনীয় গ্রাফিক্স ফাইল"
              description="রেডিমেড গ্রাফিক্স টেমপ্লেট সংগ্রহ।"
              icon={FolderOpen}
              href="#"
              externalHref={graphicsFilesUrl || undefined}
              disabled={!graphicsFilesUrl}
              colorClass="bg-purple-500/10 text-purple-600"
              iconColorClass="text-purple-600"
              adminRestricted={profile?.disabled_features?.includes('graphics-files')}
            />
            <ServiceCard
              title="গুরুত্বপূর্ণ সনদ ফরমেট"
              description="অফিসিয়াল ডকুমেন্ট ও সনদ ফরমেট।"
              icon={FileText}
              href="#"
              externalHref={certificateFormatsUrl || undefined}
              disabled={!certificateFormatsUrl}
              colorClass="bg-green-500/10 text-green-600"
              iconColorClass="text-green-600"
              adminRestricted={profile?.disabled_features?.includes('certificate-formats')}
            />
        </div>
      </section>

      {/* Premium Services - Dynamic Section */}
      {premiumServices.length > 0 && (
        <section className="space-y-6 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 bg-amber-500 rounded-full" />
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              প্রিমিয়াম সার্ভিসসমূহ
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {premiumServices.map((service) => {
              const IconComponent = getServiceIcon(service.name, service.category);
              const colors = getServiceColors(service.name, service.category);
              return (
                <ServiceCard
                  key={service.id}
                  title={service.name}
                  description={service.description || ""}
                  icon={IconComponent}
                  href="#"
                  price={service.price}
                  onClick={() => handleDirectServiceClick(service)}
                  colorClass={colors.colorClass}
                  iconColorClass={colors.iconColorClass}
                  adminRestricted={profile?.disabled_features?.includes(service.id) || profile?.disabled_features?.includes(service.name)}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Recent Activity */}
      <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <RecentOrdersWidget
          orders={orders}
          flightTickets={flightTickets}
        />
      </section>

      {/* Service Order Dialog */}
      <ServiceOrderDialog
        isOpen={isOrderDialogOpen}
        onOpenChange={setIsOrderDialogOpen}
        service={selectedService!}
        userBalance={userBalance}
        onOrderSuccess={() => {
          setIsOrderDialogOpen(false);
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
}
