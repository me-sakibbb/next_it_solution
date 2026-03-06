"use client";

import { useState } from "react";
import { ImageIcon, FileUser, Store, ShoppingBag, BotMessageSquare, BrainCircuit, ScanFace, FolderOpen, FileText, ScanText } from "lucide-react";
import { ServiceCard } from "@/components/dashboard/service-card";
import { RecentOrdersWidget } from "@/components/dashboard/recent-orders-widget";
import { ServiceOrder, Service } from "@/lib/types";
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
            title="এআই ফটো এডিটর"
            description="সাধারণ ছবিকে বানান স্টুডিও কোয়ালিটির প্রফেশনাল ফটো। ব্যাকগ্রাউন্ড রিমুভ, লাইটিং এনহ্যান্স এবং স্মার্ট এআই এডিটিং—সবকিছু এক ক্লিকেই।"
            icon={ImageIcon}
            href="/dashboard/photo-enhancer"
            colorClass="bg-purple-500/10 text-purple-600"
            iconColorClass="text-purple-600"
          />
          <ServiceCard
            title="এআই সিভি বিল্ডার"
            description="স্মার্ট এআই দিয়ে বানান পারফেক্ট সিভি। মিনিটেই পেয়ে যান আধুনিক ডিজাইন ও পেশাদার কনটেন্ট।"
            icon={FileUser}
            href="/dashboard/cv-builder"
            colorClass="bg-blue-500/10 text-blue-600"
            iconColorClass="text-blue-600"
            usageLimit={cvLimit}
          />
          <ServiceCard
            title="প্রিন্ট রেডি"
            description="মোবাইলে তোলা ছবিকে মুহূর্তেই অপ্টিমাইজ করে স্ক্যান করা ডকুমেন্টের মতো করুন এবং প্রিন্ট-রেডি PDF তৈরি করুন।"
            icon={ScanText}
            href="/dashboard/print-ready"
            colorClass="bg-pink-500/10 text-pink-600"
            iconColorClass="text-pink-600"
          />
          <ServiceCard
            title="শপ ম্যানেজমেন্ট"
            description="দোকান চালানো এখন আরও স্মার্ট। ইনভেন্টরি, সেলস, প্রতিদিনের খরচ, লাভ এবং বিস্তারিত রিপোর্ট দেখুন এক ক্লিকে।"
            icon={Store}
            href="/dashboard/shop"
            colorClass="bg-emerald-500/10 text-emerald-600"
            iconColorClass="text-emerald-600"
          />
          <ServiceCard
            title="জন্ম নিবন্ধনের ফর্ম অটোমেশন এআই"
            description="সহজে এবং নির্ভুলভাবে জন্ম নিবন্ধনের ফর্ম পূরণ করুন।"
            icon={BotMessageSquare}
            href="#"
            onClick={() => handleServiceClick("জন্ম নিবন্ধনের ফর্ম অটোমেশন এআই")}
            colorClass="bg-orange-500/10 text-orange-600"
            iconColorClass="text-orange-600"
            usageLimit={autofillLimit}
          />
          <ServiceCard
            title="টেলিটক জব ফর্ম অটোমেশন এআই"
            description="টেলিটক জব অ্যাপ্লিকেশনের ফর্ম স্বয়ংক্রিয়ভাবে পূরণ করুন।"
            icon={BrainCircuit}
            href="#"
            onClick={() => handleServiceClick("টেলিটক জব ফর্ম অটোমেশন এআই")}
            colorClass="bg-sky-500/10 text-sky-600"
            iconColorClass="text-sky-600"
            usageLimit={autofillLimit}
          />
          <ServiceCard
            title="ইন্ডিয়ান ভিসা ফর্ম অটোমেশন এআই"
            description="ইন্ডিয়ান ভিসার জন্য দ্রুত এবং নির্ভুল ফর্ম ফিলিং সার্ভিস।"
            icon={ScanFace}
            href="#"
            onClick={() => handleServiceClick("ইন্ডিয়ান ভিসা ফর্ম অটোমেশন এআই")}
            colorClass="bg-indigo-500/10 text-indigo-600"
            iconColorClass="text-indigo-600"
            usageLimit={autofillLimit}
          />
          <ServiceCard
            title="প্রয়োজনীয় গ্রাফিক্স ফাইল"
            description="ব্যবসায়িক কাজে প্রয়োজনীয় গ্রাফিক্স টেমপ্লেট ও রেডিমেড ফাইল—দ্রুত ব্যবহার করুন এবং আপনার কাজকে দিন প্রফেশনাল লুক।"
            icon={FolderOpen}
            href="#"
            externalHref={graphicsFilesUrl || undefined}
            disabled={!graphicsFilesUrl}
            colorClass="bg-purple-500/10 text-purple-600"
            iconColorClass="text-purple-600"
          />
          <ServiceCard
            title="গুরুত্বপূর্ণ সনদ ফরমেট"
            description="স্মার্টভাবে ডিজাইন করা অফিসিয়াল টেমপ্লেটের সমাহার—যা সময় বাঁচায় এবং কাজের মান বাড়ায়।"
            icon={FileText}
            href="#"
            externalHref={certificateFormatsUrl || undefined}
            disabled={!certificateFormatsUrl}
            colorClass="bg-green-500/10 text-green-600"
            iconColorClass="text-green-600"
          />
        </div>
      </section>

      {/* Lower Section: Premium Services & Orders side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Premium Services (Left 2/3) */}
        <div className="lg:col-span-2">
          {premiumServices && premiumServices.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="h-8 w-1 bg-primary rounded-full" />
                <h2 className="text-2xl font-bold tracking-tight">
                  প্রিমিয়াম সার্ভিসসমূহ
                </h2>
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
                    colorClass="bg-primary/5 hover:bg-primary/10"
                    iconColorClass="text-primary"
                    price={service.price}
                  />
                ))}
              </div>
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
