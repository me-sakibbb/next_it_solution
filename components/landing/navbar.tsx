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
        { name: 'হোম', href: '/' },
        { name: 'ফিচারসমূহ', href: '#features' },
        { name: 'প্রাইসিং', href: '#pricing' },
        { name: 'আমাদের সম্পর্কে', href: '#about' },
    ]

    return (
        <header
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full',
                isScrolled
                    ? 'bg-background/90 backdrop-blur-md border-b border-border shadow-sm py-3'
                    : 'bg-transparent py-5'
            )}
        >
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between w-full">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
                            <ShoppingCart className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-foreground">Nex IT Solution</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden md:flex items-center gap-4">
                        <Button asChild variant="ghost" size="sm" className="font-bold">
                            <Link href="/auth/login">লগইন</Link>
                        </Button>
                        <Button asChild size="sm" className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-all px-6 font-bold rounded-lg">
                            <Link href="/auth/sign-up">ফ্রি ট্রায়াল শুরু করুন</Link>
                        </Button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-foreground hover:bg-muted rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border p-6 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
                    <nav className="flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-base font-bold p-2 hover:text-primary transition-colors border-b border-muted/50 pb-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="flex flex-col gap-3 pt-4">
                            <Button asChild variant="outline" className="w-full h-11 rounded-lg font-bold">
                                <Link href="/auth/login">লগইন</Link>
                            </Button>
                            <Button asChild className="w-full h-11 rounded-lg bg-primary font-bold">
                                <Link href="/auth/sign-up">ফ্রি ট্রায়াল শুরু করুন</Link>
                            </Button>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    )
}
