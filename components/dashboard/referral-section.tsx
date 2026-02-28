'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Gift, Copy, Users, Tag, Link2, BadgePercent } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export interface ReferralStats {
    total: number
    rewarded: number
    pending: number
    totalEarned: number
}

interface ReferralSectionProps {
    referralCode: string
    stats: ReferralStats
    siteUrl: string
}

export function ReferralSection({ referralCode, stats, siteUrl }: ReferralSectionProps) {
    const { toast } = useToast()
    const referralLink = `${siteUrl}/auth/sign-up?ref=${referralCode}`

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
        toast({
            title: 'কপি হয়েছে!',
            description: `${label} ক্লিপবোর্ডে কপি করা হয়েছে।`,
        })
    }

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Gift className="w-5 h-5 text-primary" />
                    রেফারেল প্রোগ্রাম
                </h2>
                <p className="text-sm text-muted-foreground">
                    বন্ধুদের আমন্ত্রণ করুন — প্রতি সফল রেফারেলে ৳৪৯ বোনাস পান!
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Referral Code & Link Card */}
                <Card className="border-primary/20">
                    <CardContent className="p-5 space-y-4">
                        {/* Referral Code */}
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5" />
                                আপনার রেফারেল কোড
                            </p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 bg-muted px-3 py-2 rounded-md text-lg font-bold tracking-widest text-center">
                                    {referralCode}
                                </code>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(referralCode, 'রেফারেল কোড')}
                                    className="shrink-0"
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Referral Link */}
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <Link2 className="w-3.5 h-3.5" />
                                আপনার রেফারেল লিংক
                            </p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 bg-muted px-3 py-2 rounded-md text-xs truncate">
                                    {referralLink}
                                </code>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(referralLink, 'রেফারেল লিংক')}
                                    className="shrink-0"
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Info box */}
                        <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 flex items-start gap-2">
                            <BadgePercent className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                আপনার লিংক দিয়ে কেউ অ্যাকাউন্ট তৈরি করে ৳২০০+ টপআপ বা সাবস্ক্রিপশন কিনলে আপনি <span className="font-bold text-primary">৳৪৯</span> বোনাস পাবেন!
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Referral Stats Card */}
                <Card>
                    <CardContent className="p-5 space-y-4">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            রেফারেল পরিসংখ্যান
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-muted/50 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold">{stats.total}</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">মোট রেফারেল</div>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-amber-500">{stats.pending}</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">অপেক্ষমান</div>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-emerald-600">{stats.rewarded}</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">সফল রেফারেল</div>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-emerald-600">৳{stats.totalEarned}</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">মোট আয়</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
