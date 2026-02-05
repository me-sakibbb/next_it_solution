import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User, Bell, Shield, CreditCard, Mail, Check } from 'lucide-react'
import { getSubscription } from '@/app/actions/subscriptions'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const subscription = await getSubscription(user.id)

  const plans = [
    {
      name: 'Free',
      price: 0,
      features: ['100 Products', '1 Staff Member', 'Basic Reports', 'Email Support'],
    },
    {
      name: 'Pro',
      price: 29,
      features: ['Unlimited Products', 'Up to 10 Staff', 'Advanced Reports', 'Priority Support', 'API Access'],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 99,
      features: ['Unlimited Products', 'Unlimited Staff', 'Custom Reports', '24/7 Support', 'API Access', 'Custom Integrations'],
    },
  ]

  const settings = [
    {
      name: 'Profile',
      description: 'Manage your personal information',
      icon: User,
    },
    {
      name: 'Notifications',
      description: 'Configure notification preferences',
      icon: Bell,
    },
    {
      name: 'Security',
      description: 'Password and authentication settings',
      icon: Shield,
    },
    {
      name: 'Subscription',
      description: 'Manage your plan and billing',
      icon: CreditCard,
    },
    {
      name: 'Email Settings',
      description: 'Configure email templates and SMTP',
      icon: Mail,
    },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Email</div>
            <div className="text-foreground">{user.email}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Role</div>
            <div className="text-foreground capitalize">{profile?.role || 'User'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Account Status</div>
            <div className="text-foreground">
              {profile?.is_active ? (
                <span className="text-green-600">Active</span>
              ) : (
                <span className="text-destructive">Inactive</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {settings.map((setting) => (
          <Card key={setting.name} className="transition-shadow hover:shadow-lg cursor-pointer">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <setting.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{setting.name}</h3>
                <p className="text-sm text-muted-foreground">{setting.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
