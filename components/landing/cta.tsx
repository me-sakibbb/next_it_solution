'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function CTA() {
    return (
        <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-overlay blur-3xl" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay blur-3xl" />
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                        আপনার আইটি ব্যবসার রূপান্তর করতে প্রস্তুত?
                    </h2>
                    <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
                        আজই যুক্ত হন Nex IT Solution-এর সাথে এবং আপনার ব্যবসাকে নিয়ে যান এক নতুন উচ্চতায়।
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Button asChild size="lg" variant="secondary" className="h-14 px-8 text-lg w-full sm:w-auto rounded-xl shadow-lg">
                            <Link href="/auth/sign-up">
                                ফ্রি ট্রায়াল শুরু করুন <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary w-full sm:w-auto rounded-xl">
                            <Link href="/contact">
                                আমাদের সাথে যোগাযোগ করুন
                            </Link>
                        </Button>
                    </div>
                    <p className="text-sm text-primary-foreground/60 pt-4">
                        কোনো ক্রেডিট কার্ডের প্রয়োজন নেই • ১৪ দিনের ফ্রি ট্রায়াল • যেকোনো সময় বাতিল করুন
                    </p>
                </div>
            </div>
        </section>
    )
}
