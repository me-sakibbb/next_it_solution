import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">{'আপনার ইমেইল চেক করুন'}</CardTitle>
          <CardDescription>
            {'আমরা আপনাকে একটি নিশ্চিতকরণ ইমেইল পাঠিয়েছি। আপনার অ্যাকাউন্ট ভেরিফাই করতে ইমেইলের লিঙ্কে ক্লিক করুন।'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium mb-2">{'এর পরে কী করবেন?'}</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>{'১. আপনার ইমেইল ইনবক্স চেক করুন'}</li>
              <li>{'২. নিশ্চিতকরণ লিঙ্কে ক্লিক করুন'}</li>
              <li>{'৩. আপনার অ্যাকাউন্টে লগ ইন করুন'}</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/auth/login">{'লগ ইন পেজে যান'}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
