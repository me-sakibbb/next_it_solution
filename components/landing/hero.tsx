'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, PlayCircle, Sparkles } from 'lucide-react'

export function Hero() {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-background to-background" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] -z-10" />

            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <Sparkles className="h-4 w-4" />
                        <span>বাংলাদেশের ১ নম্বর অটোমেশন প্ল্যাটফর্ম</span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-600 to-indigo-600 pb-2 animate-text-shimmer">
                            স্বাগতম Nex IT Solution-এ
                        </span>
                    </h1>

                    {/* Description Sections */}
                    <div className="space-y-6 max-w-3xl mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
                        <h2 className="text-2xl md:text-3xl font-semibold text-foreground leading-tight">
                            আইটি সার্ভিস ব্যবসার জন্য তৈরি <br className="hidden md:block" />
                            বাংলাদেশের স্মার্ট অটোমেশন প্ল্যাটফর্ম।
                        </h2>

                        <p className="text-lg md:text-xl text-muted-foreground">
                            আজই আপনার দোকানকে রূপান্তর করুন <br className="hidden md:block" />
                            একটি AI-চালিত ডিজিটাল সার্ভিস সেন্টারে।
                        </p>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
                        <Button asChild size="lg" className="h-14 px-10 text-lg shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all rounded-2xl group">
                            <Link href="/auth/sign-up">
                                এখনই শুরু করুন <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="h-14 px-10 text-lg rounded-2xl border-2 hover:bg-muted/50 transition-all">
                            <Link href="#features" className="flex items-center">
                                <PlayCircle className="mr-2 h-5 w-5" /> ডেমো দেখুন
                            </Link>
                        </Button>
                    </div>

                    {/* Stats or Trust Elements - Simpler version */}
                    <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 animate-in fade-in duration-1000 delay-500">
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold text-primary">৫০০+</span>
                            <span className="text-sm text-muted-foreground">সক্রিয় দোকান</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold text-primary">৯৯%</span>
                            <span className="text-sm text-muted-foreground">সন্তুষ্ট গ্রাহক</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold text-primary">২৪/৭</span>
                            <span className="text-sm text-muted-foreground">সাপোর্ট সুবিধা</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold text-primary">১০০%</span>
                            <span className="text-sm text-muted-foreground">নিরাপদ ড্যাশবোর্ড</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subtle Gradient Blobs for Simplification/Depth */}
            <div className="absolute bottom-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-blue-400/5 rounded-full blur-[100px] -z-10" />
            <div className="absolute top-1/2 left-0 -translate-x-1/2 w-[400px] h-[400px] bg-indigo-400/5 rounded-full blur-[80px] -z-10" />
        </section>
    )
}

