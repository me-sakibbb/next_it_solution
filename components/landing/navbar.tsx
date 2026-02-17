'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navLinks = [
        { name: 'Features', href: '#features' },
        { name: 'Testimonials', href: '#testimonials' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'FAQ', href: '#faq' },
    ]

    return (
        <header
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                isScrolled
                    ? 'bg-background/80 backdrop-blur-md border-b shadow-sm py-2'
                    : 'bg-transparent py-4'
            )}
        >
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                            <ShoppingCart className="h-6 w-6" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">Next IT Solution</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden md:flex items-center gap-4">
                        <Button asChild variant="ghost" size="sm">
                            <Link href="/auth/login">Log In</Link>
                        </Button>
                        <Button asChild size="sm" className="shadow-lg hover:shadow-xl transition-all">
                            <Link href="/auth/sign-up">Get Started</Link>
                        </Button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-foreground"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b p-4 shadow-lg animate-in slide-in-from-top-5">
                    <nav className="flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-base font-medium p-2 hover:bg-muted rounded-md"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                            <Button asChild variant="outline" className="w-full justify-start">
                                <Link href="/auth/login">Log In</Link>
                            </Button>
                            <Button asChild className="w-full justify-start">
                                <Link href="/auth/sign-up">Get Started</Link>
                            </Button>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    )
}
