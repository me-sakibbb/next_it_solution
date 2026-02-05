import { getUserShop } from '@/lib/get-user-shop'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText } from 'lucide-react'
import Link from 'next/link'

export default async function CVTemplatesPage() {
    const { user, shop } = await getUserShop()

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/cv-builder">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">CV Templates</h1>
                    <p className="text-muted-foreground">
                        Browse our collection of professional CV templates
                    </p>
                </div>
            </div>

            <Card className="border-2 border-dashed">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <FileText className="h-6 w-6 text-primary" />
                        <CardTitle>Template Gallery - Coming Soon</CardTitle>
                    </div>
                    <CardDescription>
                        Professional CV templates will be available here
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Choose from a variety of professionally designed templates:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                        <li>Modern and minimalist designs</li>
                        <li>Classic and traditional layouts</li>
                        <li>Creative and colorful templates</li>
                        <li>Industry-specific formats (Tech, Business, Creative, etc.)</li>
                        <li>ATS-friendly templates</li>
                        <li>One-page and multi-page options</li>
                    </ul>
                    <div className="pt-4">
                        <Link href="/dashboard/cv-builder">
                            <Button>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Return to CV Builder Home
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
