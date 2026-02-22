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
            toast.success('Profile updated successfully!')
            router.refresh()
        } else {
            toast.error('Error updating profile: ' + error.message)
        }
    }

    return (
        <Card className="border-muted shadow-sm">
            <CardHeader>
                <CardTitle>Personal Details</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" value={email || ''} disabled className="bg-muted" />
                        <p className="text-[10px] text-muted-foreground">Contact support to change email</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Input id="role" value={profile?.role || 'User'} disabled className="bg-muted capitalize" />
                        <p className="text-[10px] text-muted-foreground">Account permissions</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Doe"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+880 1..."
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
                    Save Changes
                </Button>
            </CardFooter>
        </Card>
    )
}
