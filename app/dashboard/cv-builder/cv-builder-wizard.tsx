'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useFileParser } from '@/hooks/use-file-parser'
import { useCVAI } from '@/hooks/use-cv-ai'
import { checkFeatureLimit, incrementFeatureUsage } from '@/actions/limits'

import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Upload, FileText, Check, Download, ArrowLeft, RefreshCw, Edit, Pencil, Sparkles } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { CVData, DesignSettings, DEFAULT_DESIGN_SETTINGS } from './types'
import { DesignControls } from './components/DesignControls'
import { ModernTemplate } from './templates/ModernTemplate'
import { ProfessionalTemplate } from './templates/ProfessionalTemplate'
import { CreativeTemplate } from './templates/CreativeTemplate'
import { MinimalistTemplate } from './templates/MinimalistTemplate'
import { AcademicTemplate } from './templates/AcademicTemplate'
import { useReactToPrint } from 'react-to-print'

import Cropper from 'react-easy-crop'
import { Point, Area } from 'react-easy-crop'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'

const TEMPLATES = [
    { id: 'modern', name: 'Modern', description: 'Clean and contemporary design', component: ModernTemplate },
    { id: 'professional', name: 'Professional', description: 'Traditional and authoritative', component: ProfessionalTemplate },
    { id: 'creative', name: 'Creative', description: 'Stand out with a unique layout', component: CreativeTemplate },
    { id: 'minimalist', name: 'Minimalist', description: 'Simple and elegant', component: MinimalistTemplate },
    { id: 'academic', name: 'Academic', description: 'Detailed and scholarly', component: AcademicTemplate },
]

export function CVBuilderWizard() {
    const [step, setStep] = useState(1)
    const [file, setFile] = useState<File | null>(null)
    const { parseFile, isParsing, error: parseError } = useFileParser()
    const [parsedText, setParsedText] = useState<string>('')
    const [selectedTemplate, setSelectedTemplate] = useState<string>('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [cvData, setCvData] = useState<CVData | null>(null)
    const [photo, setPhoto] = useState<string | undefined>(undefined)
    const [cropPhoto, setCropPhoto] = useState<string | null>(null)
    const [isCropping, setIsCropping] = useState(false)
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
    const printRef = useRef<HTMLDivElement>(null)

    // New state for Edit Mode
    const [isEditing, setIsEditing] = useState(false)
    const [isStrictA4, setIsStrictA4] = useState(false); // Default: Auto-height

    const [isCondensing, setIsCondensing] = useState(false);
    const { toast } = useToast();
    const { generateCV, condenseCV } = useCVAI();

    // Design Settings
    const [designSettings, setDesignSettings] = useState<DesignSettings>(DEFAULT_DESIGN_SETTINGS);

    const updateDesignSetting = (field: keyof DesignSettings, value: number | string) => {
        setDesignSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCondense = async () => {
        if (!cvData) return;
        setIsCondensing(true);
        console.log("Starting CV condensation...");
        try {
            const condensedData = await condenseCV(cvData);
            console.log("Condensation successful", condensedData);
            setCvData(condensedData);
            toast({
                title: "Content Condensed",
                description: "Your CV has been shortened to fit better.",
            });
        } catch (error) {
            console.error("Condensation error:", error);
            // Temporary alert to ensure user sees error
            alert("Failed to condense content: " + (error instanceof Error ? error.message : String(error)));
            toast({
                title: "Error",
                description: "Failed to condense content.",
                variant: "destructive"
            });
        } finally {
            setIsCondensing(false);
        }
    };

    // Helper to scale thumbnails
    // We'll use a simple callback ref to measure width and set scale
    const ThumbnailWrapper = ({ children }: { children: React.ReactNode }) => {
        const [scale, setScale] = useState(0.2)
        const containerRef = useRef<HTMLDivElement>(null)

        useEffect(() => {
            const updateScale = () => {
                if (containerRef.current) {
                    const width = containerRef.current.offsetWidth
                    // A4 width is 210mm approx 794px at 96DPI (standard web)
                    // But we are rendering the component at 210mm width via CSS
                    // So we scale: containerWidth / 794
                    const standardA4WidthPx = 794 // 210mm * 3.78
                    setScale(width / standardA4WidthPx)
                }
            }

            updateScale()
            window.addEventListener('resize', updateScale)
            return () => window.removeEventListener('resize', updateScale)
        }, [])

        return (
            <div ref={containerRef} className="w-full relative overflow-hidden bg-slate-50 border-b aspect-[210/297]">
                <div
                    className="absolute top-0 left-0 origin-top-left"
                    style={{ transform: `scale(${scale})`, width: '210mm', minHeight: '297mm' }}
                >
                    {children}
                </div>
            </div>
        )
    }

    // Dummy data for thumbnails - Rich content
    const dummyData: CVData = {
        personalInfo: {
            fullName: 'Alex Morgan',
            email: 'alex.morgan@example.com',
            phone: '+1 (555) 123-4567',
            location: 'San Francisco, CA',
            linkedin: 'linkedin.com/in/alexmorgan',
            summary: 'Results-driven software engineer with 5+ years of experience in full-stack development. Proven track record of delivering scalable web applications and leading cross-functional teams. Passionate about clean code and user-centric design.',
            photo: photo // Use uploaded photo if available for preview
        },
        education: [
            {
                institution: 'Stanford University',
                degree: 'Master of Science in Computer Science',
                startDate: '2016',
                endDate: '2018',
                description: 'Specialized in Artificial Intelligence and Human-Computer Interaction.'
            },
            {
                institution: 'University of California, Berkeley',
                degree: 'Bachelor of Science in Electrical Engineering',
                startDate: '2012',
                endDate: '2016'
            }
        ],
        experience: [
            {
                company: 'Tech Solutions Inc.',
                position: 'Senior Software Engineer',
                startDate: '2020',
                endDate: 'Present',
                description: [
                    'Led migration of legacy monolith to microservices architecture, improving scalability by 40%.',
                    'Mentored junior developers and established code quality standards.',
                    'Implemented CI/CD pipelines reducing deployment time by 60%.'
                ]
            },
            {
                company: 'Innovate Corp',
                position: 'Software Developer',
                startDate: '2018',
                endDate: '2020',
                description: [
                    'Developed and maintained client-facing web applications using React and Node.js.',
                    'Collaborated with product teams to define feature requirements and roadmaps.'
                ]
            }
        ],
        skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker', 'GraphQL', 'Python', 'System Design'],
        projects: [
            {
                name: 'E-commerce Platform',
                description: 'Built a full-featured e-commerce platform serving 10k+ daily users.',
                technologies: ['Next.js', 'Stripe', 'PostgreSQL']
            }
        ]
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const uploadedFile = e.target.files[0]
            setFile(uploadedFile)

            const result = await parseFile(uploadedFile)
            if (result) {
                setParsedText(result)
            }
        }
    }

    // Effect to show parse error
    // (In a real app, use useEffect to show toast on error change)

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            const reader = new FileReader()
            reader.onloadend = () => {
                setCropPhoto(reader.result as string)
                setIsCropping(true)
            }
            reader.readAsDataURL(file)
        }
    }

    const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }

    const createCroppedImage = async () => {
        if (!cropPhoto || !croppedAreaPixels) return

        const image = new Image()
        image.src = cropPhoto

        // Wait for image to load logic is handled by creating the image element?
        // Actually, since it's a data URL, we need to ensure it's loaded.
        await new Promise((resolve) => { image.onload = resolve })

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) return

        canvas.width = croppedAreaPixels.width
        canvas.height = croppedAreaPixels.height

        ctx.drawImage(
            image,
            croppedAreaPixels.x,
            croppedAreaPixels.y,
            croppedAreaPixels.width,
            croppedAreaPixels.height,
            0,
            0,
            croppedAreaPixels.width,
            croppedAreaPixels.height
        )

        const base64Image = canvas.toDataURL('image/jpeg')
        setPhoto(base64Image)
        setIsCropping(false)
        setCropPhoto(null)
    }

    const handleTemplateSelect = async (templateId: string) => {
        setSelectedTemplate(templateId)
        setIsGenerating(true)

        try {
            // Check limit
            const limitCheck = await checkFeatureLimit('cv')
            if (!limitCheck.allowed) {
                toast({
                    title: "লিমিট শেষ",
                    description: "আপনার এই মাসের সিভি তৈরির লিমিট শেষ হয়ে গেছে। দয়া করে আপনার প্ল্যানটি আপগ্রেড করুন।",
                    variant: "destructive"
                })
                return
            }

            // Include photo in the final data
            const result = await generateCV(parsedText, templateId)

            if (result.success && result.data) {
                // Increment usage
                await incrementFeatureUsage('cv')

                setCvData({
                    ...result.data,
                    personalInfo: {
                        ...result.data.personalInfo,
                        photo: photo
                    }
                })
                setStep(3)
            } else {
                toast({
                    title: "Error Generating CV",
                    description: result.error || 'Failed to generate CV. Please try again.',
                    variant: "destructive"
                })
            }

        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: 'An unexpected error occurred while generating your CV.',
                variant: "destructive"
            })
        } finally {
            setIsGenerating(false)
        }
    }

    const handleDownload = useReactToPrint({
        contentRef: printRef,
        documentTitle: cvData?.personalInfo.fullName ? `${cvData.personalInfo.fullName.replace(/\s+/g, '_')}_CV` : 'CV',
        pageStyle: `
            @page {
                size: auto;
                margin: 0mm;
            }
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                }
            }
        `
    })

    const renderCurrentTemplate = () => {
        if (!cvData) return null

        const Template = TEMPLATES.find(t => t.id === selectedTemplate)?.component
        if (!Template) return null

        return <Template
            data={cvData}
            isEditing={isEditing}
            designSettings={designSettings}
            onUpdate={(newData) => setCvData(newData)}
        />
    }

    const [previewScale, setPreviewScale] = useState(1)

    useEffect(() => {
        const handleResize = () => {
            const containerWidth = window.innerWidth - 64 // Subtract padding
            const standardA4WidthPx = 794 // 210mm at 96 DPI
            const scale = Math.min(1, containerWidth / standardA4WidthPx)
            setPreviewScale(scale)
        }

        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <div className="max-w-6xl mx-auto pb-12">
            {/* Stepper */}
            <div className="flex items-center justify-center mb-8">
                <div className={`flex flex-col items-center mx-4 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 border-2 ${step >= 1 ? 'border-primary bg-primary/10' : 'border-current'}`}>
                        {step > 1 ? <Check className="w-4 h-4" /> : '1'}
                    </div>
                    <span className="text-sm font-medium">Upload</span>
                </div>
                <div className="w-16 h-0.5 bg-border mb-6"></div>
                <div className={`flex flex-col items-center mx-4 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 border-2 ${step >= 2 ? 'border-primary bg-primary/10' : 'border-current'}`}>
                        {step > 2 ? <Check className="w-4 h-4" /> : '2'}
                    </div>
                    <span className="text-sm font-medium">Template</span>
                </div>
                <div className="w-16 h-0.5 bg-border mb-6"></div>
                <div className={`flex flex-col items-center mx-4 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 border-2 ${step >= 3 ? 'border-primary bg-primary/10' : 'border-current'}`}>
                        3
                    </div>
                    <span className="text-sm font-medium">Download</span>
                </div>
            </div>

            {/* Step 1: Upload */}
            {step === 1 && (
                <div className="grid gap-8 max-w-2xl mx-auto">
                    <Card className="border-2 border-dashed border-muted-foreground/25">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <div className="bg-muted p-6 rounded-full mb-6 relative">
                                {isParsing ? <Loader2 className="w-8 h-8 animate-spin text-primary" /> : <Upload className="w-8 h-8 text-primary" />}
                                {file && <div className="absolute top-0 right-0 bg-green-500 rounded-full p-1"><Check className="w-3 h-3 text-white" /></div>}
                            </div>
                            <h2 className="text-2xl font-bold mb-2">1. Upload Resume (PDF, DOCX, Image)</h2>
                            <p className="text-muted-foreground mb-6 text-center max-w-md">
                                Upload your existing CV in PDF, DOCX or Image format.
                            </p>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".pdf,.docx,image/*"
                                    onChange={handleFileUpload}
                                    disabled={isParsing}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <Button disabled={isParsing} variant={file ? "outline" : "default"}>
                                    {file ? 'Change File' : 'Select Resume File'}
                                </Button>
                            </div>
                            {file && <p className="mt-2 text-sm text-green-600 font-medium">{file.name} uploaded</p>}
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-dashed border-muted-foreground/25">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <div className="bg-muted p-6 rounded-full mb-6 relative">
                                <Upload className="w-8 h-8 text-primary" />
                                {photo && <div className="absolute top-0 right-0 bg-green-500 rounded-full p-1"><Check className="w-3 h-3 text-white" /></div>}
                            </div>
                            <h2 className="text-2xl font-bold mb-2">2. Upload Photo (Optional)</h2>
                            <p className="text-muted-foreground mb-6 text-center max-w-md">
                                Add a professional photo to appear on your CV.
                            </p>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <Button variant={photo ? "outline" : "secondary"}>
                                    {photo ? 'Change Photo' : 'Select Photo'}
                                </Button>
                            </div>
                            {photo && (
                                <div className="mt-4 flex flex-col items-center gap-2">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary">
                                        <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => { setCropPhoto(photo); setIsCropping(true); }}>
                                        Adjust / Crop
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button
                            size="lg"
                            disabled={!file || isParsing}
                            onClick={() => setStep(2)}
                            className="w-full sm:w-auto"
                        >
                            Next: Select Template
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 2: Template Selection */}
            {step === 2 && (
                <div className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold">Choose a Template</h2>
                        <p className="text-muted-foreground">Select a design. Your content will be formatted automatically.</p>
                    </div>

                    {isGenerating ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                            <h3 className="text-xl font-medium">Generating your CV...</h3>
                            <p className="text-muted-foreground">Our AI is reformatting and optimizing your content</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {TEMPLATES.map((template) => (
                                <div
                                    key={template.id}
                                    className="group relative border rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all hover:scale-[1.02] shadow-sm hover:shadow-md bg-white flex flex-col h-full"
                                    onClick={() => handleTemplateSelect(template.id)}
                                >
                                    {/* Thumbnail */}
                                    <ThumbnailWrapper>
                                        <template.component data={dummyData} />
                                    </ThumbnailWrapper>

                                    <div className="p-4 bg-background border-t">
                                        <h3 className="font-semibold">{template.name}</h3>
                                        <p className="text-sm text-muted-foreground">{template.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex justify-center mt-8">
                        <Button variant="outline" onClick={() => setStep(1)}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Upload
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 3: Preview */}
            {step === 3 && cvData && (
                <div className="flex flex-col gap-6">
                    {/* Design Controls - Visible when editing */}
                    {isEditing && (
                        <div className="mb-4">
                            <DesignControls
                                settings={designSettings}
                                onUpdate={updateDesignSetting}
                            />
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <Button variant="outline" onClick={() => setStep(2)}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Change Template
                        </Button>
                        <div className="flex gap-2 items-center">
                            <div className="flex items-center gap-2 mr-4 bg-white px-3 py-1.5 rounded-full border shadow-sm">
                                <Switch
                                    id="strict-mode"
                                    checked={isStrictA4}
                                    onCheckedChange={setIsStrictA4}
                                />
                                <Label htmlFor="strict-mode" className="text-sm cursor-pointer whitespace-nowrap">
                                    Strict A4 Mode
                                </Label>
                            </div>

                            <div className="text-sm text-slate-500 mr-2 hidden sm:block">
                                {isEditing ? "Editing & Design Mode" : "Preview Mode"}
                            </div>
                            <Button
                                variant={isEditing ? "default" : "secondary"}
                                onClick={() => setIsEditing(!isEditing)}
                                size="sm"
                            >
                                <Pencil className="w-4 h-4 mr-2" />
                                {isEditing ? "Done" : "Edit Design"}
                            </Button>

                            {isStrictA4 && (
                                <Button
                                    variant="outline"
                                    onClick={handleCondense}
                                    disabled={isCondensing}
                                    size="sm"
                                >
                                    {isCondensing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                    Auto-Condense
                                </Button>
                            )}

                            <Button onClick={handleDownload} size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                PDF
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center bg-slate-200/50 p-8 rounded-xl overflow-auto shadow-inner min-h-[calc(100vh-200px)]">
                        {/* Visual Preview (Scaled) */}
                        <div
                            className="relative bg-white shadow-2xl transition-all duration-300 ease-in-out origin-top"
                            style={{
                                width: '210mm',
                                minHeight: '297mm',
                                height: isStrictA4 ? '297mm' : 'auto',
                                overflow: isStrictA4 ? 'hidden' : 'visible',
                                transform: `scale(${previewScale})`,
                                transformOrigin: 'top center',
                                marginBottom: `-${(1 - previewScale) * 297}mm`
                            }}
                        >
                            <div className="h-full w-full">
                                {renderCurrentTemplate()}
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-muted-foreground text-center max-w-lg">
                            {isStrictA4 ? (
                                <span>Strict A4 Mode Active. Content exceeding one page will be cut off. Use Auto-Condense if needed.</span>
                            ) : (
                                <span>Preview expands to show full content. Enable "Strict A4 Mode" to enforce single-page constraint.</span>
                            )}
                        </div>
                    </div>

                    {/* Hidden Print Container (1:1 Scale for reliable PDF generation) */}
                    <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
                        <div
                            ref={printRef}
                            style={{
                                width: '210mm',
                                minHeight: '297mm',
                                backgroundColor: 'white',
                            }}
                        >
                            {renderCurrentTemplate()}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Content Dialog - REMOVED for Inline Editing */}
            {/* The editing is now handled directly within the template components */}

            {/* Image Cropper Dialog */}
            <Dialog open={isCropping} onOpenChange={setIsCropping}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Adjust Photo</DialogTitle>
                    </DialogHeader>
                    <div className="relative w-full h-64 bg-slate-900 mt-4 rounded-md overflow-hidden">
                        {cropPhoto && (
                            <Cropper
                                image={cropPhoto}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        )}
                    </div>
                    <div className="py-4">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium">Zoom</span>
                            <Slider
                                defaultValue={[1]}
                                min={1}
                                max={3}
                                step={0.1}
                                value={[zoom]}
                                onValueChange={(vals) => setZoom(vals[0])}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCropping(false)}>Cancel</Button>
                        <Button onClick={createCroppedImage}>Save Photo</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}
