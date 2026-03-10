'use client'

import * as React from 'react'
import {
    Store,
    ImageIcon,
    FileUser,
    ScanText,
    BotMessageSquare,
    BrainCircuit,
    ScanFace,
    FolderOpen,
    FileText,
    Sparkles,
    ShieldCheck,
    Settings,
    ArrowRight
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Autoplay from 'embla-carousel-autoplay'

const services = [
    {
        title: "শপ ম্যানেজমেন্ট",
        description: "দোকান চালানো এখন আরও স্মার্ট। ইনভেন্টরি, সেলস, প্রতিদিনের খরচ, লাভ এবং বিস্তারিত রিপোর্ট দেখুন এক ক্লিকে।",
        icon: Store,
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
    },
    {
        title: "এআই ফটো এডিটর",
        description: "সাধারণ ছবিকে বানান স্টুডিও কোয়ালিটির প্রফেশনাল ফটো। ব্যাকগ্রাউন্ড রিমুভ, লাইটিং এনহ্যান্স এবং স্মার্ট এআই এডিটিং—সবকিছু এক ক্লিকেই।",
        icon: ImageIcon,
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
    },
    {
        title: "এআই সিভি বিল্ডার",
        description: "স্মার্ট এআই দিয়ে বানান পারফেক্ট সিভি। মিনিটেই পেয়ে যান আধুনিক ডিজাইন ও পেশাদার কনটেন্ট।",
        icon: FileUser,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
    },
    {
        title: "প্রিন্ট রেডি",
        description: "মোবাইলে তোলা ছবিকে মুহূর্তেই অপ্টিমাইজ করে স্ক্যান করা ডকুমেন্টের মতো করুন এবং প্রিন্ট-রেডি PDF তৈরি করুন।",
        icon: ScanText,
        color: "text-pink-500",
        bgColor: "bg-pink-500/10",
    },
    {
        title: "জন্ম নিবন্ধনের ফর্ম অটোমেশন এআই",
        description: "সহজে এবং নির্ভুলভাবে জন্ম নিবন্ধনের ফর্ম পূরণ করুন।",
        icon: BotMessageSquare,
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
    },
    {
        title: "টেলিটক জব ফর্ম অটোমেশন এআই",
        description: "টেলিটক জব অ্যাপ্লিকেশনের ফর্ম স্বয়ংক্রিয়ভাবে পূরণ করুন।",
        icon: BrainCircuit,
        color: "text-sky-500",
        bgColor: "bg-sky-500/10",
    },
    {
        title: "ইন্ডিয়ান ভিসা ফর্ম অটোমেশন এআই",
        description: "ইন্ডিয়ান ভিসার জন্য দ্রুত এবং নির্ভুল ফর্ম ফিলিং সার্ভিস।",
        icon: ScanFace,
        color: "text-indigo-500",
        bgColor: "bg-indigo-500/10",
    },
    {
        title: "প্রয়োজনীয় গ্রাফিক্স ফাইল",
        description: "ব্যবসায়িক কাজে প্রয়োজনীয় গ্রাফিক্স টেমপ্লেট ও রেডিমেড ফাইল—দ্রুত ব্যবহার করুন এবং আপনার কাজকে দিন প্রফেশনাল লুক।",
        icon: FolderOpen,
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
    },
    {
        title: "গুরুত্বপূর্ণ সনদ ফরমেট",
        description: "স্মার্টভাবে ডিজাইন করা অফিসিয়াল টেমপ্লেটের সমাহার—যা সময় বাঁচায় এবং কাজের মান বাড়ায়।",
        icon: FileText,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
    },
    {
        title: "কাস্টম প্রিমিয়াম সলিউশন",
        description: "আপনার ব্যবসার সুনির্দিষ্ট প্রয়োজনে আমাদের বিশেষজ্ঞ টিমের মাধ্যমে কাস্টম সফটওয়্যার বা ডিজিটাল সলিউশন তৈরি করে নিন।",
        icon: Sparkles,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
        isPremium: true
    },
]

const extraFeatures = [
    {
        title: "নিরাপদ ডাটাবেস",
        description: "আপনার ব্যবসার সকল তথ্য থাকবে ১০০% নিরাপদ ও এনক্রিপ্টেড।",
        icon: ShieldCheck
    },
    {
        title: "২৪/৭ সাপোর্ট",
        description: "যেকোনো সমস্যায় আমাদের টিম আছে আপনার পাশে সব সময়।",
        icon: Settings
    }
]

export function Features() {
    const plugin = React.useRef(
        Autoplay({ delay: 3000, stopOnInteraction: true })
    )

    return (
        <section id="features" className="py-24 bg-muted/30 overflow-hidden">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">আমাদের বিশেষ সার্ভিসসমূহ</h2>
                    <p className="text-lg text-muted-foreground">
                        আইটি সার্ভিস ব্যবসার উন্নতির জন্য আধুনিক এআই টুলস এবং ম্যানেজমেন্ট সিস্টেম যা আপনার কাজকে করবে সহজ ও লাভজনক।
                    </p>
                </div>

                {/* Services Carousel */}
                <div className="relative mb-24 px-12">
                    <Carousel
                        plugins={[plugin.current as any]}
                        opts={{
                            align: "start",
                            loop: true,
                        }}
                        className="w-full"
                        onMouseEnter={() => plugin.current.stop()}
                        onMouseLeave={() => plugin.current.play()}
                    >
                        <CarouselContent className="py-4">
                            {services.map((service, index) => (
                                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                                    <Card className={cn(
                                        "h-full border-none shadow-md hover:shadow-xl transition-all duration-300 group overflow-hidden relative",
                                        service.isPremium && "bg-gradient-to-br from-background to-amber-500/5 border-2 border-amber-500/20"
                                    )}>
                                        {service.isPremium && (
                                            <div className="absolute top-0 right-0 p-3">
                                                <Badge className="bg-amber-500 text-white border-none text-[10px]">PREMIUM</Badge>
                                            </div>
                                        )}
                                        <CardContent className="p-8 flex flex-col h-full">
                                            <div className={cn(
                                                "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm",
                                                service.bgColor
                                            )}>
                                                <service.icon className={cn("h-7 w-7", service.color)} />
                                            </div>
                                            <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{service.title}</h3>
                                            <p className="text-muted-foreground leading-relaxed flex-1 italic">
                                                {service.description}
                                            </p>
                                            {service.isPremium && (
                                                <div className="mt-6">
                                                    <Button size="sm" className="w-full rounded-full" asChild>
                                                        <Link href="/auth/sign-up">বিস্তারিত জানুন</Link>
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="-left-12 h-12 w-12 border-primary/20 hover:bg-primary hover:text-white transition-all shadow-lg hidden md:flex" />
                        <CarouselNext className="-right-12 h-12 w-12 border-primary/20 hover:bg-primary hover:text-white transition-all shadow-lg hidden md:flex" />
                    </Carousel>
                </div>

                {/* Extra Features - 2x1 */}
                <div className="grid sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
                    {extraFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center gap-6 p-6 rounded-3xl bg-background shadow-sm hover:shadow-md transition-all duration-300 border border-transparent hover:border-primary/10">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <feature.icon className="h-7 w-7" />
                            </div>
                            <div className="text-left">
                                <h4 className="font-bold text-lg mb-1">{feature.title}</h4>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

