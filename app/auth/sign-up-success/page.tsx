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
          <CardTitle className="text-2xl font-bold">{'Check Your Email'}</CardTitle>
          <CardDescription>
            {'We\'ve sent you a confirmation email. Please click the link in the email to verify your account.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium mb-2">{'What\'s next?'}</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>{'1. Check your email inbox'}</li>
              <li>{'2. Click the confirmation link'}</li>
              <li>{'3. Sign in to your account'}</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/auth/login">{'Go to Sign In'}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
