import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">{'Authentication Error'}</CardTitle>
          <CardDescription>
            {'There was a problem with your authentication. Please try again.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>{'If this problem persists, please contact support.'}</p>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button asChild variant="outline" className="flex-1 bg-transparent">
            <Link href="/auth/login">{'Back to Login'}</Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href="/auth/sign-up">{'Sign Up'}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
