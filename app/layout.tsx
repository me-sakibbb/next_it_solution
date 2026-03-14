import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono, Hind_Siliguri } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from "@/components/ui/toaster"
import { BackgroundPreloader } from "@/components/background-preloader"
import './globals.css'

const _geist = Geist({
  subsets: ["latin"],
  variable: '--font-geist'
});

const _geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: '--font-geist-mono'
});

const _hindSiliguri = Hind_Siliguri({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['bengali', 'latin'],
  variable: '--font-hind-siliguri',
})

export const metadata: Metadata = {
  title: 'Nex IT Solution - IT Retail Management',
  description: 'Comprehensive IT retail management platform with inventory, POS, staff management, and photo editing capabilities',
  generator: 'Nex IT Solution',
  icons: {
    icon: [
      {
        url: '/logo.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/logo.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/logo.png',
        type: 'image/svg+xml',
      },
    ],
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${_geist.variable} ${_geistMono.variable} ${_hindSiliguri.variable} font-sans antialiased`}>
        {children}
        <Analytics />
        <Toaster />
        <BackgroundPreloader />
      </body>
    </html>
  )
}
