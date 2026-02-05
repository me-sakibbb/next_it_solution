'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileUser, FileText, Plus, Download } from 'lucide-react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

interface CVBuilderClientProps {
    user: User
    shop: any
}

export function CVBuilderClient({ user, shop }: CVBuilderClientProps) {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight text-foreground">
                    AI CV Builder
                </h1>
                <p className="text-lg text-muted-foreground">
                    Create professional resumes with AI-powered assistance
                </p>
            </div>

            {/* Main Actions */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Create New CV */}
                <Link href="/dashboard/cv-builder/builder">
                    <Card className="group cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 h-full">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="rounded-xl p-3 bg-gradient-to-br from-pink-500/20 to-red-500/20">
                                    <Plus className="h-8 w-8 text-pink-600 dark:text-pink-400" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl mt-4 group-hover:text-primary transition-colors">
                                Create New CV
                            </CardTitle>
                            <CardDescription className="text-base">
                                Start building a professional resume from scratch with our AI-powered wizard
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <FileText className="h-4 w-4" />
                                    <span>Multi-step form wizard</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <FileText className="h-4 w-4" />
                                    <span>AI content suggestions</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Download className="h-4 w-4" />
                                    <span>Export to PDF</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* Browse Templates */}
                <Link href="/dashboard/cv-builder/templates">
                    <Card className="group cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 h-full">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="rounded-xl p-3 bg-gradient-to-br from-purple-500/20 to-indigo-500/20">
                                    <FileUser className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl mt-4 group-hover:text-primary transition-colors">
                                Browse Templates
                            </CardTitle>
                            <CardDescription className="text-base">
                                Choose from our collection of professional CV templates
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <FileText className="h-4 w-4" />
                                    <span>15+ professional templates</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <FileText className="h-4 w-4" />
                                    <span>Modern and classic designs</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <FileText className="h-4 w-4" />
                                    <span>Industry-specific layouts</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Features Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>Why Use Our AI CV Builder?</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg p-2 bg-primary/10">
                                    <FileUser className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="font-semibold">AI-Powered</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Get intelligent content suggestions and improvements for every section of your CV
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg p-2 bg-primary/10">
                                    <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="font-semibold">Professional Templates</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Choose from a variety of professionally designed templates that stand out
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg p-2 bg-primary/10">
                                    <Download className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="font-semibold">Easy Export</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Download your CV as a PDF with a single click, ready to send to employers
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Coming Soon Badge */}
            <div className="rounded-xl border border-border bg-gradient-to-br from-blue-500/5 to-cyan-500/10 p-6">
                <div className="flex items-start gap-4">
                    <div className="rounded-lg p-3 bg-blue-500/20">
                        <FileUser className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">Your Saved CVs</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Once you create a CV, it will be saved here for easy access and editing. You can create multiple CVs for different job applications.
                        </p>
                        <Button variant="outline" disabled>
                            View Saved CVs (Coming Soon)
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
