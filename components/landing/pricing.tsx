'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import Link from "next/link"

const plans = [
    {
        name: "Starter",
        price: "$29",
        description: "Perfect for small shops just getting started.",
        features: [
            "1 Shop Location",
            "Basic Inventory Management",
            "Point of Sale (POS)",
            "Daily Sales Reports",
            "Email Support"
        ],
        cta: "Start Free Trial",
        popular: false
    },
    {
        name: "Pro",
        price: "$79",
        description: "Ideal for growing businesses with more needs.",
        features: [
            "Up to 3 Shop Locations",
            "Advanced Inventory & Alerts",
            "Employee Management & Payroll",
            "AI Photo Editor (50/mo)",
            "Priority Support",
            "Customer Loyalty Program"
        ],
        cta: "Start Free Trial",
        popular: true
    },
    {
        name: "Enterprise",
        price: "Custom",
        description: "For large chains and franchises.",
        features: [
            "Unlimited Locations",
            "Custom Reporting",
            "Dedicated Account Manager",
            "API Access",
            "Unlimited AI Photo Edits",
            "White Label Options"
        ],
        cta: "Contact Sales",
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
                                    {plan.price !== "Custom" && <span className="text-muted-foreground">/month</span>}
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
