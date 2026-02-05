import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BarChart3, Box, DollarSign, ImageIcon, ShoppingCart, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="w-full max-w-[1400px] mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">Next IT Solution</span>
          </div>
          <nav className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-background to-muted/30 py-20">
        <div className="w-full max-w-[1400px] mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              {'Complete IT Retail Management'}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              {'Manage inventory, process sales, track staff, and edit product photos - all in one powerful platform designed for IT retail businesses.'}
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/auth/sign-up">Start Free Trial</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="w-full max-w-[1400px] mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold">{'Everything You Need'}</h2>
            <p className="mt-4 text-muted-foreground">
              {'Comprehensive tools designed specifically for IT retail businesses'}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="flex flex-col items-start gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Box className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{'Inventory Management'}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {'Track stock levels, manage suppliers, and automate reordering with real-time inventory updates.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col items-start gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{'Point of Sale'}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {'Fast and efficient POS system with multiple payment methods, invoicing, and sales tracking.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col items-start gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{'Staff Management'}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {'Manage employees, track attendance, process payroll, and handle leave requests efficiently.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col items-start gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <ImageIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{'Photo Editor'}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {'Edit product photos with background removal, filters, and presets right in the platform.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col items-start gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{'Analytics & Reports'}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {'Comprehensive reports on sales, inventory, staff performance, and business insights.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col items-start gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{'Multi-Shop Support'}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {'Manage multiple shop locations from a single dashboard with centralized control.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30 py-20">
        <div className="w-full max-w-[1400px] mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold">{'Ready to Get Started?'}</h2>
            <p className="mt-4 text-muted-foreground">
              {'Join IT retailers who trust Next IT Solution for their business operations'}
            </p>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link href="/auth/sign-up">Start Your Free Trial</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-auto">
        <div className="w-full max-w-[1400px] mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 Next IT Solution. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
