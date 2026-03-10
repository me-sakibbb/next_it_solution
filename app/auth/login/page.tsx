'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Lock, Eye, EyeOff } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { OTPVerificationModal } from '@/components/auth/otp-verification-modal'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)
  const [unconfirmedEmail, setUnconfirmedEmail] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Store remember me preference in a cookie for the middleware/server to see
      // We use document.cookie for simplicity in the client-side
      document.cookie = `remember-me=${rememberMe}; path=/; max-age=${60 * 60 * 24 * 365}`

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        if (signInError.message === 'Email not confirmed') {
          setUnconfirmedEmail(email)
          setError('আপনার ইমেইল ভেরিফাই করা হয়নি। অনুগ্রহ করে ইমেইল ভেরিফাই করুন।')
        } else if (signInError.message === 'Invalid login credentials') {
          setError('ভুল ইমেইল অথবা পাসওয়ার্ড।')
        } else {
          setError(signInError.message)
        }
        return
      }

      window.location.href = '/dashboard'
    } catch (err) {
      setError('একটি অপ্রত্যাশিত ত্রুটি ঘটেছে')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="Nex IT Solution" className="h-12 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">{'স্বাগতম ফিরে এসেছেন'}</CardTitle>
          <CardDescription className="text-center">
            {'আপনার Nex IT Solution অ্যাকাউন্টে সাইন ইন করুন'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between gap-4">
                  <span>{error}</span>
                  {unconfirmedEmail && (
                    <Button
                      variant="link"
                      className="p-0 h-auto text-destructive underline font-bold"
                      onClick={() => setIsOtpModalOpen(true)}
                    >
                      ভেরিফাই করুন
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">ইমেইল</Label>
              <Input
                id="email"
                type="email"
                placeholder="আপনার ইমেইল"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">পাসওয়ার্ড</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:underline font-medium"
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 py-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(!!checked)}
                disabled={loading}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                আমাকে মনে রাখুন
              </Label>
            </div>

            <Button type="submit" className="w-full h-11 text-lg font-bold" disabled={loading}>
              {loading ? 'প্রবেশ করা হচ্ছে...' : 'প্রবেশ করুন'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-muted-foreground text-center">
            {'অ্যাকাউন্ট নেই? '}
            <Link href="/auth/sign-up" className="text-primary hover:underline font-medium">
              অ্যাকাউন্ট তৈরি করুন
            </Link>
          </div>
        </CardFooter>
      </Card>

      <OTPVerificationModal
        email={unconfirmedEmail}
        isOpen={isOtpModalOpen}
        onOpenChange={setIsOtpModalOpen}
        onSuccess={() => {
          // Redirect is handled inside the modal
        }}
      />
    </div>
  )
}
