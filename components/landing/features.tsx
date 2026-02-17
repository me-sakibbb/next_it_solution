'use client'

import {
    ShoppingBag,
    Users,
    BarChart3,
    ImageIcon,
    Settings,
    ShieldCheck,
    Smartphone,
    Zap,
    MoreHorizontal,
    CheckCircle2,
    AlertCircle
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// Visual Components for each feature
const InventoryVisual = () => (
    <div className="w-full h-full p-4 flex flex-col justify-center">
        <div className="bg-background rounded-lg shadow-sm border p-3 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Product</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Status</span>
            </div>
            <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center"><ShoppingBag size={12} /></div>
                    <span className="font-medium">MacBook Pro M3</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-medium">In Stock</span>
            </div>
            <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-purple-100 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center"><Smartphone size={12} /></div>
                    <span className="font-medium">iPhone 15 Pro</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-medium flex items-center gap-1">
                    Low Stock <AlertCircle size={8} />
                </span>
            </div>
            <div className="flex justify-between items-center text-sm opacity-60">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 flex items-center justify-center"><ShoppingBag size={12} /></div>
                    <span className="font-medium">AirPods Max</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-medium">In Stock</span>
            </div>
        </div>
    </div>
)

const PayrollVisual = () => (
    <div className="w-full h-full p-4 flex flex-col justify-center">
        <div className="bg-background rounded-lg shadow-sm border p-3 space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold">Payroll Run: Feb 2026</h4>
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Processing</span>
            </div>
            <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/30">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">EM</div>
                            <div className="flex flex-col">
                                <span className="text-xs font-medium">Employee #{i}</span>
                                <span className="text-[10px] text-muted-foreground">Full-time</span>
                            </div>
                        </div>
                        <span className="text-xs font-mono font-medium">$2,400</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
)

const AnalyticsVisual = () => (
    <div className="w-full h-full p-4 flex flex-col justify-center items-center">
        <div className="bg-background rounded-lg shadow-sm border p-4 w-full max-w-[240px]">
            <div className="flex justify-between items-end h-24 gap-2">
                {[40, 70, 45, 90, 60, 80, 50].map((h, i) => (
                    <div key={i} className="w-full bg-green-500/10 rounded-t relative group">
                        <div
                            className="absolute bottom-0 left-0 right-0 bg-green-500 rounded-t transition-all duration-500"
                            style={{ height: `${h}%` }}
                        />
                    </div>
                ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                <span>Mon</span>
                <span>Sun</span>
            </div>
            <div className="mt-3 pt-3 border-t flex justify-between items-center">
                <span className="text-xs font-medium text-muted-foreground">Total Revenue</span>
                <span className="text-sm font-bold text-foreground">+$12,450</span>
            </div>
        </div>
    </div>
)

const PhotoEditorVisual = () => (
    <div className="w-full h-full p-4 flex flex-col justify-center items-center relative overflow-hidden">
        <div className="relative w-48 h-32 bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-700">
            {/* Mock image content */}
            <div className="absolute inset-0 bg-gradient-to-tr from-gray-800 to-gray-700 flex items-center justify-center">
                <Smartphone className="text-gray-500 w-12 h-12" />
            </div>

            {/* Mock Editor Overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-black/60 backdrop-blur-sm flex items-center justify-between px-3">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-white/20" />
                    <div className="w-3 h-3 rounded-full bg-white/20" />
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-glow" />
                </div>
                <span className="text-[8px] text-white/70">Adjust</span>
            </div>

            {/* Mock removing bg effect */}
            <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-blue-600 rounded text-[8px] text-white font-medium flex items-center gap-1 shadow-lg">
                <Zap size={8} /> AI Auto
            </div>
        </div>
    </div>
)

const features = [
    {
        title: "Smart Inventory Management",
        description: "Never run out of stock again. Track every item with real-time updates, low stock alerts, and automated supplier reordering.",
        icon: ShoppingBag,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        visual: InventoryVisual
    },
    {
        title: "Employee & Payroll System",
        description: "Manage your team efficiently. Track attendance, calculate commissions, and process payroll with just a few clicks.",
        icon: Users,
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
        visual: PayrollVisual
    },
    {
        title: "Advanced Analytics",
        description: "Make data-driven decisions. Visual reports on sales trends, best-performing products, and staff efficiency.",
        icon: BarChart3,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        visual: AnalyticsVisual
    },
    {
        title: "AI Product Photo Editor",
        description: "Create professional product images instantly. Remove backgrounds and apply filters directly within the dashboard.",
        icon: ImageIcon,
        color: "text-pink-500",
        bgColor: "bg-pink-500/10",
        visual: PhotoEditorVisual
    }
]

const extraFeatures = [
    {
        title: "Multi-Store Support",
        description: "Manage multiple locations from one account.",
        icon: Settings
    },
    {
        title: "Role-Based Access",
        description: "Secure detailed permissions for admins and staff.",
        icon: ShieldCheck
    },
    {
        title: "Mobile Friendly",
        description: "Access your dashboard from any device, anywhere.",
        icon: Smartphone
    },
    {
        title: "Lightning Fast",
        description: "Built on Next.js for instant page loads and updates.",
        icon: Zap
    }
]

export function Features() {
    return (
        <section id="features" className="py-24 bg-muted/30">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything You Need to Scale</h2>
                    <p className="text-lg text-muted-foreground">
                        Powerful tools designed specifically for the unique needs of IT retail businesses.
                    </p>
                </div>

                {/* Main Features Grid - 2x2 with Alternating Layout */}
                <div className="grid md:grid-cols-2 gap-8 mb-20">
                    {features.map((feature, index) => (
                        <Card key={index} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 group h-full">
                            <CardContent className="p-0 flex flex-col sm:flex-row h-full">
                                <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
                                    <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-semibold mb-3">{feature.title}</h3>
                                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{feature.description}</p>
                                </div>
                                <div className="bg-muted/30 w-full sm:w-[45%] min-h-[220px] relative overflow-hidden flex items-center justify-center border-t sm:border-t-0 sm:border-l">
                                    {/* Background blob */}
                                    <div className={`absolute -bottom-10 -right-10 w-40 h-40 rounded-full ${feature.bgColor} blur-3xl opacity-60`} />

                                    {/* Feature Visual */}
                                    <div className="relative z-10 w-full h-full">
                                        <feature.visual />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Extra Features Grid - 4x1 */}
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {extraFeatures.map((feature, index) => (
                        <div key={index} className="flex flex-col items-center text-center p-4 rounded-xl hover:bg-background transition-colors duration-200">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                <feature.icon className="h-5 w-5" />
                            </div>
                            <h4 className="font-semibold mb-2">{feature.title}</h4>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

