import { CVBuilderWizard } from './cv-builder-wizard'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function CVBuilderPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    Create New CV
                </h1>
                <p className="text-lg text-muted-foreground">
                    Upload your resume and let AI handle the formatting and optimization
                </p>
                <div className="h-1 w-20 bg-primary/20 rounded-full mt-2" />
            </div>

            <div className="bg-card/50 rounded-2xl border shadow-sm p-1">
                <CVBuilderWizard />
            </div>
        </div>
    )
}
