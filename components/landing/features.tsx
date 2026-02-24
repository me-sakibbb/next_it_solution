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
const ShopVisual = () => (
    <div className="w-full h-full p-4 flex flex-col justify-center">
        <div className="bg-background rounded-lg shadow-xl border overflow-hidden flex h-48">
            <div className="w-14 bg-slate-900 border-r hidden sm:block p-2 space-y-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold border border-primary/30">NEX</div>
                <div className="space-y-3 pt-2">
                    <div className="flex flex-col gap-1 items-center">
                        <ShoppingBag size={14} className="text-slate-400" />
                        <div className="w-6 h-0.5 bg-primary/40 rounded" />
                    </div>
                    <Users size={14} className="text-slate-600" />
                    <BarChart3 size={14} className="text-slate-600" />
                </div>
            </div>
            <div className="flex-1 p-3 space-y-3 overflow-hidden bg-white">
                <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">আজকের বিক্রয়</span>
                    <span className="text-[10px] font-bold text-green-600">৳১২,৪০০</span>
                </div>
                <div className="space-y-2">
                    {[
                        { name: "আইফোন ১৫ প্রো", price: "৳১,২০,০০০", stock: "৫টি" },
                        { name: "ম্যাকবুক এয়ার", price: "৳১,১০,০০০", stock: "৩টি" },
                        { name: "এয়ারপড প্রো", price: "৳২৬,০০০", stock: "১০টি" }
                    ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center p-2 rounded-md bg-muted/30 border border-muted-foreground/10">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold">{item.name}</span>
                                <span className="text-[8px] text-muted-foreground">{item.price}</span>
                            </div>
                            <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">{item.stock}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
)

const CVVisual = () => (
    <div className="w-full h-full p-4 flex flex-col justify-center">
        <div className="bg-background rounded-lg shadow-xl border p-4 space-y-4 relative overflow-hidden h-48 bg-white">
            <div className="flex gap-3 items-start border-b pb-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-primary border border-primary/10 overflow-hidden shadow-inner">
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
                        <Users size={24} className="text-primary" />
                    </div>
                </div>
                <div className="flex-1">
                    <h4 className="text-xs font-bold text-slate-800">সাকিব আহমেদ</h4>
                    <p className="text-[10px] text-slate-500">সফটওয়্যার ইঞ্জিনিয়ার</p>
                    <div className="flex gap-1 mt-1">
                        <span className="text-[7px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">React</span>
                        <span className="text-[7px] px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full">Node.js</span>
                    </div>
                </div>
            </div>
            <div className="space-y-2 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-slate-700">অভিজ্ঞতা</span>
                    <span className="text-[8px] text-slate-400">২০২১ - বর্তমান</span>
                </div>
                <p className="text-[8px] text-slate-500 leading-tight">আইটি সলিউশন এবং এআই ইন্টিগ্রেশনে বিশেষজ্ঞ...</p>
            </div>
            <div className="absolute top-2 right-2 bg-primary/10 text-primary text-[8px] font-bold px-2 py-0.5 rounded-full border border-primary/20">
                AI OPTIMIZED
            </div>
        </div>
    </div>
)

const AutofillVisual = () => (
    <div className="w-full h-full p-4 flex flex-col justify-center">
        <div className="bg-background rounded-lg shadow-xl border overflow-hidden h-48 bg-white">
            <div className="bg-muted px-3 py-1.5 border-b flex items-center gap-2">
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                </div>
                <div className="h-2.5 flex-1 bg-background rounded-sm border text-[6px] flex items-center px-2 text-muted-foreground font-mono">
                    admission.university.edu.bd
                </div>
            </div>
            <div className="p-4 space-y-4">
                {[
                    { label: "পুরো নাম", value: "সাকিব আহমেদ" },
                    { label: "পিতার নাম", value: "করিম আহমেদ" }
                ].map((field, i) => (
                    <div key={i} className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <span className="text-[8px] font-bold text-slate-600">{field.label}</span>
                            {i === 0 && <span className="text-[7px] text-primary flex items-center gap-0.5"><Zap size={6} /> এআই অটোফিল</span>}
                        </div>
                        <div className="h-6 w-full bg-blue-50/50 border border-blue-200 rounded flex items-center px-2 relative transition-all">
                            <span className="text-[9px] text-slate-800 animate-in fade-in slide-in-from-left duration-1000 fill-mode-forwards">{field.value}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
)

const PhotoEditorVisual = () => (
    <div className="w-full h-full p-4 flex flex-col justify-center items-center relative overflow-hidden">
        <div className="relative w-full h-40 bg-white rounded-lg shadow-xl overflow-hidden border flex">
            <div className="flex-1 bg-slate-200 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100 via-slate-200 to-slate-300" />
                <ImageIcon className="text-slate-400 w-12 h-12" />
                <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-full text-[6px] text-white flex items-center gap-1">
                    <CheckCircle2 size={6} /> Enhance Active
                </div>
            </div>
            <div className="w-24 bg-background border-l p-2.5 space-y-3">
                {[
                    { label: "ব্রাইটনেস", value: 80 },
                    { label: "কন্ট্রাস্ট", value: 65 },
                    { label: "শার্পনেস", value: 90 }
                ].map((ctrl, i) => (
                    <div key={i} className="space-y-1.5">
                        <div className="flex justify-between text-[7px] font-bold text-slate-600">
                            <span>{ctrl.label}</span>
                            <span>{ctrl.value}%</span>
                        </div>
                        <div className="h-1 w-full bg-slate-100 rounded-full relative overflow-hidden">
                            <div className="absolute left-0 top-0 h-full bg-primary/60 rounded-full" style={{ width: `${ctrl.value}%` }} />
                        </div>
                    </div>
                ))}
                <div className="pt-1">
                    <div className="h-5 w-full bg-primary text-white rounded flex items-center justify-center gap-1 shadow-sm">
                        <Zap size={8} /> <span className="text-[7px] font-bold">এআই রিমুভ</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
)

const FeatureVisual = ({ component: Component }: { component: React.ComponentType }) => {
    return (
        <div className="w-full h-full flex items-center justify-center relative z-10 scale-95 sm:scale-100 transition-transform group-hover:scale-105 duration-500">
            <Component />
        </div>
    )
}

const features = [
    {
        title: "শপ ম্যানেজমেন্ট",
        description: "ইনভেন্টরি ট্র্যাকিং, সেলস ম্যানেজমেন্ট এবং সাপ্লায়ার অর্ডার এক জায়গায়। আপনার দোকানের প্রতিটি লেনদেনের হিসাব রাখুন নিখুঁতভাবে।",
        icon: ShoppingBag,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        visual: ShopVisual
    },
    {
        title: "এআই সিভি বিল্ডার",
        description: "আধুনিক এবং পেশাদার সিভি তৈরি করুন মাত্র কয়েক মিনিটে। আমাদের স্মার্ট এআই টুল আপনার অভিজ্ঞতা অনুযায়ী সেরা টেমপ্লেট সাজিয়ে দিবে।",
        icon: Users,
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
        visual: CVVisual
    },
    {
        title: "এআই ফটো এডিটর",
        description: "পেশাদার প্রোডাক্ট ফটো তৈরি করুন মুহূর্তেই। ব্যাকগ্রাউন্ড রিমুভ, ফিল্টার এবং এআই এনহ্যান্সমেন্ট সুবিধা সরাসরি আপনার ড্যাশবোর্ডে।",
        icon: ImageIcon,
        color: "text-pink-500",
        bgColor: "bg-pink-500/10",
        visual: PhotoEditorVisual
    },
    {
        title: "ফর্ম অটোফিল এক্সটেনশন",
        description: "যেকোনো অনলাইন অ্যাপ্লিকেশন ফর্ম অটো-ফিলাপ করে আপনার সময় বাঁচান। বারবার একই তথ্য টাইপ করার ঝামেলা থেকে মুক্তি পান।",
        icon: Smartphone,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        visual: AutofillVisual
    }
]

const extraFeatures = [
    {
        title: "আরও প্রিমিয়াম সার্ভিস",
        description: "আপনার ব্যবসার প্রয়োজনে অর্ডার করুন কাস্টম প্রিমিয়াম সার্ভিসসমূহ।",
        icon: Zap
    },
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
    return (
        <section id="features" className="py-24 bg-muted/30">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">আপনার ব্যবসার জন্য যা কিছু প্রয়োজন</h2>
                    <p className="text-lg text-muted-foreground">
                        আইটি সার্ভিস ব্যবসার উন্নতির জন্য বিশেষ কিছু টুলস যা আপনার কাজকে করবে আরও সহজ ও লাভজনক।
                    </p>
                </div>

                {/* Main Features Grid - 2x2 with Alternating Layout */}
                <div className="grid md:grid-cols-2 gap-8 mb-20">
                    {features.map((feature, index) => (
                        <Card key={index} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 group h-full">
                            <CardContent className="p-0 flex flex-col lg:flex-row h-full">
                                <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
                                    <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-semibold mb-3">{feature.title}</h3>
                                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{feature.description}</p>
                                </div>
                                <div className="bg-muted/10 w-full lg:w-[50%] min-h-[240px] relative overflow-hidden flex items-center justify-center border-t lg:border-t-0 lg:border-l">
                                    {/* Background blob */}
                                    <div className={`absolute -bottom-10 -right-10 w-40 h-40 rounded-full ${feature.bgColor} blur-3xl opacity-40`} />

                                    {/* Feature Visual */}
                                    <div className="relative z-10 w-full h-full">
                                        <FeatureVisual
                                            component={feature.visual}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Extra Features Grid - 3x1 */}
                <div className="grid sm:grid-cols-3 gap-8">
                    {extraFeatures.map((feature, index) => (
                        <div key={index} className="flex flex-col items-center text-center p-6 rounded-2xl bg-background shadow-sm hover:shadow-md transition-all duration-200 border border-transparent hover:border-primary/10">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                <feature.icon className="h-6 w-6" />
                            </div>
                            <h4 className="font-bold mb-2 text-lg">{feature.title}</h4>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

