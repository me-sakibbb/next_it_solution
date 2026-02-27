'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

interface ProfileFormProps {
    profile: any
    email: string | undefined
}

export function ProfileForm({ profile, email }: ProfileFormProps) {
    const [loading, setLoading] = useState(false)
    const [fullName, setFullName] = useState(profile?.full_name || '')
    const [phone, setPhone] = useState(profile?.phone || '')
    const router = useRouter()

    const handleSave = async () => {
        setLoading(true)
        const supabase = createClient()

        // Update profile
        const { error } = await supabase
            .from('users')
            .update({ full_name: fullName, phone: phone })
            .eq('id', profile?.id)

        setLoading(false)
        if (!error) {
            toast.success('প্রোফাইল সফলভাবে আপডেট করা হয়েছে!')
            router.refresh()
        } else {
            toast.error('প্রোফাইল আপডেট করতে সমস্যা: ' + error.message)
        }
    }

    return (
        <Card className="border-muted shadow-sm">
            <CardHeader>
                <CardTitle>ব্যক্তিগত বিবরণ</CardTitle>
                <CardDescription>আপনার ব্যক্তিগত তথ্য আপডেট করুন</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="email">ইমেইল ঠিকানা</Label>
                        <Input id="email" value={email || ''} disabled className="bg-muted" />
                        <p className="text-[10px] text-muted-foreground">ইমেইল পরিবর্তন করতে সাপোর্টের সাথে যোগাযোগ করুন</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">ভূমিকা</Label>
                        <Input id="role" value={profile?.role === 'user' ? 'ব্যবহারকারী' : (profile?.role === 'superadmin' ? 'সুপার এডমিন' : profile?.role) || 'ব্যবহারকারী'} disabled className="bg-muted capitalize" />
                        <p className="text-[10px] text-muted-foreground">অ্যাকাউন্ট পারমিশন</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fullName">পুরো নাম</Label>
                        <Input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="আপনার নাম লিখুন"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">ফোন নম্বর</Label>
                        <Input
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+৮৮০ ১..."
                        />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t p-4 mt-2">
                <Button onClick={handleSave} disabled={loading} className="w-full md:w-auto">
                    {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    পরিবর্তন সংরক্ষণ করুন
                </Button>
            </CardFooter>
        </Card>
    )
}
