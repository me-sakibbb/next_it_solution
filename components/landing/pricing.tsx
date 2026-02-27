'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import Link from "next/link"

const plans = [
    {
        name: "Basic Bit",
        price: "৳199",
        description: "ব্যক্তিগত ব্যবহারের জন্য উপযুক্ত প্যাকেজ।",
        features: [
            "শপ ম্যানেজমেন্ট একসেস",
            "১০টি AI CV মেইক",
            "২০টি অটোফিল আবেদন",
            "সকল অনলাইন টুলস",
            "প্রয়োজনীয় গ্রাফিক্স ফাইল",
            "গুরুত্বপূর্ণ সনদ ফরমেট"
        ],
        cta: "Start Now",
        popular: false
    },
    {
        name: "Advance Plus",
        price: "৳299",
        description: "উন্নত ফিচার সহ জনপ্রিয় চয়েস।",
        features: [
            "শপ ম্যানেজমেন্ট একসেস",
            "২০টি AI CV মেইক",
            "৪০টি অটোফিল আবেদন",
            "সকল অনলাইন টুলস",
            "প্রয়োজনীয় গ্রাফিক্স ফাইল",
            "গুরুত্বপূর্ণ সনদ ফরমেট"
        ],
        cta: "Start Now",
        popular: true
    },
    {
        name: "Premium Power",
        price: "৳399",
        description: "সকল টুলের আনলিমিটেড অ্যাক্সেস।",
        features: [
            "শপ ম্যানেজমেন্ট একসেস",
            "৪০টি AI CV মেইক",
            "৮০টি অটোফিল আবেদন",
            "সকল অনলাইন টুলস",
            "প্রয়োজনীয় গ্রাফিক্স ফাইল",
            "গুরুত্বপূর্ণ সনদ ফরমেট"
        ],
        cta: "Start Now",
        popular: false
    }
]

export function Pricing() {
    return (
        <section id="pricing" className="py-24 bg-muted/30">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center md:max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
                    <p className="text-lg text-muted-foreground">
                        Choose the plan that fits your business needs. No hidden fees.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <Card
                            key={index}
                            className={`flex flex-col ${plan.popular ? 'border-primary shadow-lg scale-105 z-10' : 'border-border'} transition-all hover:scale-[1.02]`}
                        >
                            {plan.popular && (
                                <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                                    Most Popular
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold">{plan.price}</span>
                                    <span className="text-muted-foreground">/মাস</span>
                                </div>
                                <CardDescription className="mt-2">{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <ul className="space-y-3">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-primary shrink-0" />
                                            <span className="text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" variant={plan.popular ? "default" : "outline"} asChild>
                                    <Link href="/auth/sign-up">{plan.cta}</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
