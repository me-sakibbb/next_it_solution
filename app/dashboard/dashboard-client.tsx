"use client";

import { useState } from "react";
import { ImageIcon, FileUser, Store, ShoppingBag, BotMessageSquare, BrainCircuit, ScanFace, FolderOpen, FileText, ScanText, Plane } from "lucide-react";
import { ServiceCard } from "@/components/dashboard/service-card";
import { RecentOrdersWidget } from "@/components/dashboard/recent-orders-widget";
import { ServiceOrder, Service, FlightTicketOrder } from "@/lib/types";
import { ServiceOrderDialog } from "@/components/services/service-order-dialog";
import { useUsageLimits } from "@/hooks/use-usage-limits";

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
          />
          <ServiceCard
            title="এআই ফটো এডিটর"
            description="এআই দিয়ে প্রফেশনাল ফটো এডিটিং।"
            icon={ImageIcon}
            href="/dashboard/photo-enhancer"
            colorClass="bg-purple-500/10 text-purple-600"
            iconColorClass="text-purple-600"
          />
          <ServiceCard
            title="এআই সিভি বিল্ডার"
            description="এআই দিয়ে স্মার্ট সিভি তৈরি।"
            icon={FileUser}
            href="/dashboard/cv-builder"
            colorClass="bg-blue-500/10 text-blue-600"
            iconColorClass="text-blue-600"
            usageLimit={cvLimit}
          />
          <ServiceCard
            title="প্রিন্ট রেডি"
            description="ছবিকে স্ক্যান করা ডকুমেন্টে রূপান্তর।"
            icon={ScanText}
            href="/dashboard/print-ready"
            colorClass="bg-pink-500/10 text-pink-600"
            iconColorClass="text-pink-600"
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
          />
          <ServiceCard
            title="ফ্লাইট টিকেট বুকিং"
            description="বেস্ট প্রাইসে এয়ার টিকেট সংগ্রহ করুন।"
            icon={Plane}
            href="/dashboard/flight-tickets"
            colorClass="bg-blue-600/10 text-blue-700 font-bold"
            iconColorClass="text-blue-700"
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
          />
        </div>
      </section>

      {/* Recent Activity */}
      <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <RecentOrdersWidget
          orders={orders}
          flightTickets={flightTickets}
          shopName={shopName}
        />
      </section>

      {/* Service Order Dialog */}
      <ServiceOrderDialog
        isOpen={isOrderDialogOpen}
        onOpenChange={setIsOrderDialogOpen}
        service={selectedService!}
        userBalance={userBalance}
        onSuccess={() => {
          setIsOrderDialogOpen(false);
          if (onRefresh) onRefresh();
        }}
        shopName={shopName}
      />
    </div>
  );
}
