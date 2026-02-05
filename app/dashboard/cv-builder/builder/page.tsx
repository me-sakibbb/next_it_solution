import { getUserShop } from '@/lib/get-user-shop'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default async function CVBuilderBuilderPage() {
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
                    <h1 className="text-3xl font-bold tracking-tight">CV Builder</h1>
                    <p className="text-muted-foreground">
                        Create your professional resume step by step
                    </p>
                </div>
            </div>

            <Card className="border-2 border-dashed">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Sparkles className="h- w-6 text-primary" />
                        <CardTitle>CV Builder - Coming Soon</CardTitle>
                    </div>
                    <CardDescription>
                        This feature is currently under development
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        The interactive CV builder with the following features will be available soon:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                        <li>Multi-step form wizard for easy CV creation</li>
                        <li>AI-powered content suggestions for each section</li>
                        <li>Real-time preview as you type</li>
                        <li>Multiple professional templates to choose from</li>
                        <li>Export to PDF functionality</li>
                        <li>Save and edit your CV drafts</li>
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
