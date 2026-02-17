'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2, PlayCircle } from 'lucide-react'

export function Hero() {
    return (
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/10 rounded-full blur-[100px] opacity-50" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] opacity-30" />
            </div>

            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
                    <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-background/50 backdrop-blur-sm shadow-sm animate-fade-in">
                        <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                        v2.0 is now live
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground animate-slide-down">
                        The All-in-One OS for <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                            IT Retail Businesses
                        </span>
                    </h1>

                    <p className="text-xl text-muted-foreground max-w-2xl animate-fade-in delay-100">
                        Streamline your entire operation. Manage inventory, process sales, track repairs, and handle staff payroll — all from one beautiful dashboard.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center pt-4 animate-fade-in delay-200">
                        <Button asChild size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all rounded-full">
                            <Link href="/auth/sign-up">
                                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base backdrop-blur-sm bg-background/50 rounded-full">
                            <Link href="#features">
                                <PlayCircle className="ml-2 h-4 w-4" /> View Demo
                            </Link>
                        </Button>
                    </div>

                    <div className="flex gap-6 text-sm text-muted-foreground pt-4 animate-fade-in delay-300">
                        <div className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
                            <span>14-day free trial</span>
                        </div>
                        <div className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
                            <span>No credit card required</span>
                        </div>
                    </div>
                </div>

                {/* Dashboard Preview */}
                <div className="mt-16 relative mx-auto max-w-5xl rounded-xl border bg-background/50 shadow-2xl overflow-hidden animate-fade-in delay-500 group perspective-1000">
                    <div className="absolute top-0 w-full h-11 bg-muted/90 border-b flex items-center px-4 gap-2 z-10 backdrop-blur-sm">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-400/80" />
                            <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                            <div className="w-3 h-3 rounded-full bg-green-400/80" />
                        </div>
                        <div className="ml-4 w-64 h-6 bg-background/50 rounded-md border text-[10px] flex items-center px-2 text-muted-foreground overflow-hidden whitespace-nowrap">
                            https://dashboard.next-it-solution.com/shop
                        </div>
                    </div>

                    <div className="pt-11 bg-muted/10 min-h-[400px] md:min-h-[600px] relative">
                        {/* Using user provided image */}
                        <img
                            src="/landing/dashboard-hero.png"
                            alt="Next IT Solution Dashboard Preview"
                            className="w-full h-auto object-cover object-top"
                        />
                    </div>

                    {/* Subtle Reflection Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
                </div>
            </div>
        </section>
    )
}
