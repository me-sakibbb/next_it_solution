import { Navbar } from '@/components/landing/navbar'
import { Hero } from '@/components/landing/hero'
import { Features } from '@/components/landing/features'
import { Testimonials } from '@/components/landing/testimonials'
import { Pricing } from '@/components/landing/pricing'
import { FAQ } from '@/components/landing/faq'
import { CTA } from '@/components/landing/cta'
import { Footer } from '@/components/landing/footer'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
