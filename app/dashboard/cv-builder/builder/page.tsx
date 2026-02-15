import { getUserShop } from '@/lib/get-user-shop'
import { CVBuilderWizard } from './cv-builder-wizard'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function CVBuilderBuilderPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/cv-builder">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Home
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create New CV</h1>
                    <p className="text-muted-foreground">
                        Upload your resume and let AI handle the rest
                    </p>
                </div>
            </div>

            <CVBuilderWizard />
        </div>
    )
}
