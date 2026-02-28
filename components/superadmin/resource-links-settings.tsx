'use client'

import { useState } from 'react'
import { updateAppSetting } from '@/actions/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderOpen, FileText, Save, ExternalLink } from 'lucide-react'

interface ResourceLinksSettingsProps {
    initialGraphicsUrl: string
    initialCertificateUrl: string
}

export function ResourceLinksSettings({ initialGraphicsUrl, initialCertificateUrl }: ResourceLinksSettingsProps) {
    const [graphicsUrl, setGraphicsUrl] = useState(initialGraphicsUrl)
    const [certificateUrl, setCertificateUrl] = useState(initialCertificateUrl)
    const [savingGraphics, setSavingGraphics] = useState(false)
    const [savingCertificate, setSavingCertificate] = useState(false)
    const [savedGraphics, setSavedGraphics] = useState(false)
    const [savedCertificate, setSavedCertificate] = useState(false)

    const handleSaveGraphics = async () => {
        setSavingGraphics(true)
        setSavedGraphics(false)
        try {
            await updateAppSetting('graphics_files_drive_url', graphicsUrl)
            setSavedGraphics(true)
            setTimeout(() => setSavedGraphics(false), 2000)
        } catch (error) {
            console.error('Failed to save graphics URL', error)
            alert('Failed to save URL')
        } finally {
            setSavingGraphics(false)
        }
    }

    const handleSaveCertificate = async () => {
        setSavingCertificate(true)
        setSavedCertificate(false)
        try {
            await updateAppSetting('certificate_formats_drive_url', certificateUrl)
            setSavedCertificate(true)
            setTimeout(() => setSavedCertificate(false), 2000)
        } catch (error) {
            console.error('Failed to save certificate URL', error)
            alert('Failed to save URL')
        } finally {
            setSavingCertificate(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-blue-600" />
                    রিসোর্স লিংক সেটিংস
                </CardTitle>
                <CardDescription>
                    ড্যাশবোর্ডে দেখানো Google Drive রিসোর্স লিংকগুলো পরিচালনা করুন
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Graphics Files */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                        <FolderOpen className="w-4 h-4 text-purple-500" />
                        প্রয়োজনীয় গ্রাফিক্স ফাইল – Google Drive লিংক
                    </Label>
                    <div className="flex gap-2">
                        <Input
                            value={graphicsUrl}
                            onChange={(e) => setGraphicsUrl(e.target.value)}
                            placeholder="https://drive.google.com/drive/folders/..."
                            className="flex-1"
                        />
                        {graphicsUrl && (
                            <Button
                                variant="outline"
                                size="icon"
                                asChild
                            >
                                <a href={graphicsUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </Button>
                        )}
                        <Button
                            onClick={handleSaveGraphics}
                            disabled={savingGraphics}
                            className="shrink-0"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {savingGraphics ? 'সেভ হচ্ছে...' : savedGraphics ? 'সেভ হয়েছে ✓' : 'সেভ করুন'}
                        </Button>
                    </div>
                </div>

                {/* Certificate Formats */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                        <FileText className="w-4 h-4 text-green-500" />
                        গুরুত্বপূর্ণ সনদ ফরমেট – Google Drive লিংক
                    </Label>
                    <div className="flex gap-2">
                        <Input
                            value={certificateUrl}
                            onChange={(e) => setCertificateUrl(e.target.value)}
                            placeholder="https://drive.google.com/drive/folders/..."
                            className="flex-1"
                        />
                        {certificateUrl && (
                            <Button
                                variant="outline"
                                size="icon"
                                asChild
                            >
                                <a href={certificateUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </Button>
                        )}
                        <Button
                            onClick={handleSaveCertificate}
                            disabled={savingCertificate}
                            className="shrink-0"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {savingCertificate ? 'সেভ হচ্ছে...' : savedCertificate ? 'সেভ হয়েছে ✓' : 'সেভ করুন'}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
