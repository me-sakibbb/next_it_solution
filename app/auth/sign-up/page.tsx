'use client'

import React, { Suspense } from "react"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Gift, Eye, EyeOff } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { checkEmailExists } from '@/actions/auth'
import { OTPVerificationModal } from '@/components/auth/otp-verification-modal'

function SignUpForm() {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [shopName, setShopName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [referralCode, setReferralCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  // Auto-fill referral code from URL if present (e.g., /auth/sign-up?ref=ABC12345)
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      setReferralCode(ref.toUpperCase().trim())
    }
  }, [searchParams])

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return 'পাসওয়ার্ডটি কমপক্ষে ৮ অক্ষরের হতে হবে'
    if (!/[A-Z]/.test(pass)) return 'পাসওয়ার্ডে অন্তত একটি বড় হাতের অক্ষর (A-Z) থাকতে হবে'
    if (!/[0-9]/.test(pass)) return 'পাসওয়ার্ডে অন্তত একটি সংখ্যা (0-9) থাকতে হবে'
    if (!/[!@#$%^&*]/.test(pass)) return 'পাসওয়ার্ডে অন্তত একটি বিশেষ অক্ষর (!@#$%^&*) থাকতে হবে'
    return null
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      setLoading(false)
      return
    }

    try {
      // Check if email already exists
      const emailExists = await checkEmailExists(email)
      if (emailExists) {
        setError('এই ইমেইল দিয়ে ইতঃপূর্বেই অ্যাকাউন্ট তৈরি করা হয়েছে। অনুগ্রহ করে লগ ইন করুন।')
        setLoading(false)
        return
      }

      const supabase = createClient()
      const cleanEmail = email.trim().toLowerCase()
      const { error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
            phone: phone,
            shop_name: shopName,
            role: 'shop_owner',
            referred_by: referralCode || undefined,
          },
        },
      })

      if (signUpError) {
        if (signUpError.message === 'User already registered') {
          setError('এই ইমেইল দিয়ে ইতঃপূর্বেই অ্যাকাউন্ট তৈরি করা হয়েছে। অনুগ্রহ করে লগ ইন করুন।')
        } else {
          setError(signUpError.message)
        }
        return
      }

      setRegisteredEmail(cleanEmail)
      setIsOtpModalOpen(true)
      // We don't redirect yet, let the OTP modal handle verification
      // router.push('/auth/sign-up-success')
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
          <CardTitle className="text-2xl font-bold text-center">{'নতুন অ্যাকাউন্ট তৈরি করুন'}</CardTitle>
          <CardDescription className="text-center">
            {'Nex IT Solution -এ স্বাগতম'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">পুরো নাম</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="রহিম মিয়া"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">মোবাইল নম্বর</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shopName">দোকানের নাম</Label>
              <Input
                id="shopName"
                type="text"
                placeholder="আমার দোকান"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

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
              <Label htmlFor="password">পাসওয়ার্ড</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
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
              <p className="text-xs text-muted-foreground">
                {'অক্ষর, সংখ্যা এবং চিহ্ন সহ কমপক্ষে ৮ ক্যারেক্টার হতে হবে'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="referralCode" className="flex items-center gap-1.5">
                <Gift className="h-3.5 w-3.5 text-primary" />
                রেফারেল কোড (ঐচ্ছিক)
              </Label>
              <Input
                id="referralCode"
                type="text"
                placeholder="যেমন: ABC12345"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                disabled={loading}
                maxLength={10}
                className="uppercase"
              />
              <p className="text-xs text-muted-foreground">
                {'রেফারেল কোড থাকলে লিখুন — বোনাস পাওয়ার সুযোগ!'}
              </p>
            </div>

            <Button type="submit" className="w-full h-11 text-lg font-bold" disabled={loading}>
              {loading ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'অ্যাকাউন্ট তৈরি করুন'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-muted-foreground text-center">
            {'আগে থেকেই অ্যাকাউন্ট আছে? '}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              প্রবেশ করুন
            </Link>
          </div>
        </CardFooter>
      </Card>

      <OTPVerificationModal
        email={registeredEmail}
        isOpen={isOtpModalOpen}
        onOpenChange={setIsOtpModalOpen}
        onSuccess={() => {
          // Redirect is handled inside the modal for better session synchronization
        }}
      />
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    }>
      <SignUpForm />
    </Suspense>
  )
}
