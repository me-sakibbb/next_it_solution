'use client'

import React, {
    useState, useRef, useEffect, useCallback,
    useImperativeHandle, forwardRef,
} from 'react'
import { OpenCvProvider } from 'opencv-react-ts'
import jsPDF from 'jspdf'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, Download, RefreshCw, Wand2, ArrowLeft, Loader2, Printer, Camera, Image as ImageIcon } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = 'upload' | 'crop' | 'preview'
type FilterType = 'none' | 'bw' | 'color'
interface Pt { x: number; y: number }
type Quad = [Pt, Pt, Pt, Pt]  // TL, TR, BR, BL

interface PrintReadyClientInnerProps { shopId: string }

// ─── Corner ordering helper ───────────────────────────────────────────────────
function orderQuad(pts: Pt[]): Quad {
    const s = [...pts].sort((a, b) => (a.x + a.y) - (b.x + b.y))
    const tl = s[0], br = s[3]
    const mid = [s[1], s[2]]
    const [tr, bl] = (mid[0].x - mid[0].y) > (mid[1].x - mid[1].y)
        ? [mid[0], mid[1]] : [mid[1], mid[0]]
    return [tl, tr, br, bl]
}

// ─── OpenCV document detection ───────────────────────────────────────────────
function detectDocument(cv: any, canvas: HTMLCanvasElement): Quad {
    const W = canvas.width, H = canvas.height
    const scale = Math.min(1, 1000 / Math.max(W, H))
    const rW = Math.round(W * scale), rH = Math.round(H * scale)

    const src = cv.imread(canvas)
    const small = new cv.Mat(); cv.resize(src, small, new cv.Size(rW, rH))
    const gray = new cv.Mat(); cv.cvtColor(small, gray, cv.COLOR_RGBA2GRAY)

    // Use Bilateral Filter to reduce noise while preserving edges
    const filtered = new cv.Mat(); cv.bilateralFilter(gray, filtered, 9, 75, 75)

    // Multiple edge detection attempts
    const edges = new cv.Mat(); cv.Canny(filtered, edges, 75, 200)
    const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3))
    const dilated = new cv.Mat(); cv.dilate(edges, dilated, kernel, new cv.Point(-1, -1), 1)

    const contours = new cv.MatVector(); const hier = new cv.Mat()
    cv.findContours(dilated, contours, hier, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

    let bestQuad: Pt[] | null = null
    let maxScore = -1
    const totalArea = rW * rH

    for (let i = 0; i < contours.size(); i++) {
        const cnt = contours.get(i)
        const area = cv.contourArea(cnt)
        if (area < totalArea * 0.03) { cnt.delete(); continue }

        const peri = cv.arcLength(cnt, true)
        const approx = new cv.Mat()
        cv.approxPolyDP(cnt, approx, 0.02 * peri, true)

        // CamScanner looks for roughly rectangular shapes
        // We accept 4 to 10 points and try to simplify
        if (approx.rows >= 4 && approx.rows <= 10) {
            const rect = cv.minAreaRect(cnt)
            const rectArea = rect.size.width * rect.size.height
            const solidity = area / rectArea

            // Score based on area + solidity (how rectangular it is)
            const score = area * solidity

            if (score > maxScore) {
                maxScore = score
                const pts: Pt[] = []
                for (let j = 0; j < approx.rows; j++) {
                    pts.push({
                        x: approx.data32S[j * 2] / scale,
                        y: approx.data32S[j * 2 + 1] / scale,
                    })
                }

                // Simplified logic: pick points furthest towards corners
                bestQuad = findExtremePoints(pts)
            }
        }
        approx.delete()
        cnt.delete()
    }

    ;[src, small, gray, filtered, edges, kernel, dilated, contours, hier].forEach(m => m.delete?.())

    if (bestQuad && bestQuad.length === 4) return orderQuad(bestQuad)

    // Robust fallback: center rectangle
    const insetW = W * 0.1, insetH = H * 0.1
    return [{ x: insetW, y: insetH }, { x: W - insetW, y: insetH }, { x: W - insetW, y: H - insetH }, { x: insetW, y: H - insetH }]
}

// Helper to find 4 corners from a set of points (simplified)
function findExtremePoints(pts: Pt[]): Pt[] {
    // Pick pts that maximize/minimize (x+y) and (x-y)
    let tl = pts[0], tr = pts[0], br = pts[0], bl = pts[0]
    let minSum = Infinity, maxSum = -Infinity, minDiff = Infinity, maxDiff = -Infinity

    pts.forEach(p => {
        const sum = p.x + p.y
        const diff = p.x - p.y
        if (sum < minSum) { minSum = sum; tl = p }
        if (sum > maxSum) { maxSum = sum; br = p }
        if (diff > maxDiff) { maxDiff = diff; tr = p }
        if (diff < minDiff) { minDiff = diff; bl = p }
    })
    return [tl, tr, br, bl]
}

// ─── Coordinate helpers ───────────────────────────────────────────────────────
function getImgRenderArea(imgEl: HTMLImageElement, natW: number, natH: number) {
    const r = imgEl.getBoundingClientRect()
    const natAr = natW / natH, dispAr = r.width / r.height
    let rW: number, rH: number, ox: number, oy: number
    if (natAr > dispAr) { rW = r.width; rH = rW / natAr; ox = 0; oy = (r.height - rH) / 2 }
    else { rH = r.height; rW = rH * natAr; ox = (r.width - rW) / 2; oy = 0 }
    return { rW, rH, ox, oy, left: r.left, top: r.top }
}

// ─── Custom Document Cropper ──────────────────────────────────────────────────
export interface CropperHandle { process(filter: FilterType, options?: { bwThreshold?: number; colorContrast?: number }): Promise<string> }

const DocCropper = forwardRef<CropperHandle, { imageFile: File; cvLoaded: boolean }>(
    ({ imageFile, cvLoaded }, ref) => {
        const wrapRef = useRef<HTMLDivElement>(null)
        const canvasRef = useRef<HTMLCanvasElement>(null)   // full-res image data
        const imgRef = useRef<HTMLImageElement>(null)
        const [quad, setQuad] = useState<Quad | null>(null)
        const [svgPts, setSvgPts] = useState<Quad | null>(null)
        const [objUrl, setObjUrl] = useState('')
        const [natSize, setNatSize] = useState({ w: 0, h: 0 })
        const dragIdx = useRef(-1)

        // Create blob URL
        useEffect(() => {
            const url = URL.createObjectURL(imageFile)
            setObjUrl(url)
            return () => URL.revokeObjectURL(url)
        }, [imageFile])

        // Load into canvas & detect
        useEffect(() => {
            if (!cvLoaded || !objUrl) return
            const img = new Image()
            img.onload = () => {
                const canvas = canvasRef.current!
                canvas.width = img.naturalWidth; canvas.height = img.naturalHeight
                canvas.getContext('2d')!.drawImage(img, 0, 0)
                setNatSize({ w: img.naturalWidth, h: img.naturalHeight })
                setQuad(detectDocument((window as any).cv, canvas))
            }
            img.src = objUrl
        }, [cvLoaded, objUrl])

        // Convert quad → SVG overlay coordinates
        const recomputeSvg = useCallback(() => {
            if (!quad || !imgRef.current || !wrapRef.current || natSize.w === 0) return
            const wRect = wrapRef.current.getBoundingClientRect()
            const { rW, rH, ox, oy, left, top } = getImgRenderArea(imgRef.current, natSize.w, natSize.h)
            const rel = { left: left - wRect.left, top: top - wRect.top }
            setSvgPts(quad.map(pt => ({
                x: rel.left + ox + (pt.x / natSize.w) * rW,
                y: rel.top + oy + (pt.y / natSize.h) * rH,
            })) as Quad)
        }, [quad, natSize])

        useEffect(() => {
            recomputeSvg()
            const ro = new ResizeObserver(recomputeSvg)
            if (wrapRef.current) ro.observe(wrapRef.current)
            return () => ro.disconnect()
        }, [recomputeSvg])

        // Pointer dragging
        const onPointerDown = (e: React.PointerEvent, idx: number) => {
            e.preventDefault(); dragIdx.current = idx
                ; (e.target as HTMLElement).setPointerCapture(e.pointerId)
        }
        const onPointerMove = useCallback((e: React.PointerEvent) => {
            if (dragIdx.current < 0 || !quad || !imgRef.current || natSize.w === 0) return
            const { rW, rH, ox, oy, left, top } = getImgRenderArea(imgRef.current, natSize.w, natSize.h)
            const nx = Math.max(0, Math.min(natSize.w, (e.clientX - left - ox) / rW * natSize.w))
            const ny = Math.max(0, Math.min(natSize.h, (e.clientY - top - oy) / rH * natSize.h))
            const updated = [...quad] as Quad
            updated[dragIdx.current] = { x: nx, y: ny }
            setQuad(updated)
        }, [quad, natSize])
        const onPointerUp = () => { dragIdx.current = -1 }

        // Expose process() via ref
        useImperativeHandle(ref, () => ({
            async process(filter: FilterType, options?: { bwThreshold?: number; colorContrast?: number }): Promise<string> {
                if (!quad || !canvasRef.current) throw new Error('Not ready')
                const bwThreshold = options?.bwThreshold ?? 10
                const colorContrast = options?.colorContrast ?? 1.3
                const cv = (window as any).cv
                const [tl, tr, br, bl] = quad
                const canvas = canvasRef.current

                // Calculate realistic output dimensions (Straighten by calculating max lengths)
                const widthTop = Math.hypot(tr.x - tl.x, tr.y - tl.y)
                const widthBottom = Math.hypot(br.x - bl.x, br.y - bl.y)
                const outW = Math.round(Math.max(widthTop, widthBottom))

                const heightLeft = Math.hypot(bl.x - tl.x, bl.y - tl.y)
                const heightRight = Math.hypot(br.x - tr.x, br.y - tr.y)
                const outH = Math.round(Math.max(heightLeft, heightRight))

                // Optional: Snap to common aspect ratios (A4 is ~1.41)
                // if (Math.abs((outH/outW) - 1.41) < 0.1) ... 

                const src = cv.imread(canvas)
                const srcPts = cv.matFromArray(4, 1, cv.CV_32FC2, [tl.x, tl.y, tr.x, tr.y, br.x, br.y, bl.x, bl.y])
                const dstPts = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, outW, 0, outW, outH, 0, outH])
                const M = cv.getPerspectiveTransform(srcPts, dstPts)
                const warped = new cv.Mat()
                cv.warpPerspective(src, warped, M, new cv.Size(outW, outH), cv.INTER_LANCZOS4)

                if (filter === 'bw') {
                    cv.cvtColor(warped, warped, cv.COLOR_RGBA2GRAY)
                    cv.adaptiveThreshold(warped, warped, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 15, bwThreshold)
                } else if (filter === 'color') {
                    // Magic Color effect: Sharpen + Contrast
                    const sharpened = new cv.Mat()
                    const kernel = cv.matFromArray(3, 3, cv.CV_32F, [
                        0, -1, 0,
                        -1, 5, -1,
                        0, -1, 0
                    ])
                    cv.filter2D(warped, sharpened, -1, kernel)

                    const out = document.createElement('canvas')
                    cv.imshow(out, sharpened)

                    const ctx = out.getContext('2d')!
                    const id = ctx.getImageData(0, 0, out.width, out.height)
                    const d = id.data
                    for (let i = 0; i < d.length; i += 4) {
                        // Apply contrast enhancement
                        d[i] = Math.min(255, (d[i] - 100) * colorContrast + 100 + 10)
                        d[i + 1] = Math.min(255, (d[i + 1] - 100) * colorContrast + 100 + 10)
                        d[i + 2] = Math.min(255, (d[i + 2] - 100) * colorContrast + 100 + 10)
                    }
                    ctx.putImageData(id, 0, 0)

                    kernel.delete(); sharpened.delete(); warped.delete();
                    [src, srcPts, dstPts, M].forEach(m => m.delete())

                    return out.toDataURL('image/png')
                }

                const out = document.createElement('canvas')
                cv.imshow(out, warped)
                const dataUrl = out.toDataURL('image/png')
                    ;[src, srcPts, dstPts, M, warped].forEach(m => m.delete())
                return dataUrl
            }
        }), [quad])

        return (
            <div
                ref={wrapRef}
                className="relative w-full h-full flex items-center justify-center"
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
            >
                <canvas ref={canvasRef} className="hidden" />
                {objUrl && (
                    <img
                        ref={imgRef}
                        src={objUrl}
                        alt="Document"
                        draggable={false}
                        onLoad={recomputeSvg}
                        className="max-w-full object-contain block pointer-events-none"
                        style={{ maxHeight: '58vh', userSelect: 'none' }}
                    />
                )}
                {svgPts && (
                    <svg
                        className="absolute inset-0 w-full h-full overflow-visible"
                        style={{ pointerEvents: 'none' }}
                    >
                        {/* Edge lines */}
                        <polygon
                            points={svgPts.map(p => `${p.x},${p.y}`).join(' ')}
                            fill="rgba(59,130,246,0.10)"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            strokeDasharray="8 4"
                        />
                        {/* Corner handles */}
                        {svgPts.map((pt, idx) => (
                            <g key={idx} style={{ pointerEvents: 'all', cursor: 'grab' }}>
                                {/* Large invisible hit-target */}
                                <circle cx={pt.x} cy={pt.y} r={22} fill="transparent"
                                    onPointerDown={e => onPointerDown(e as any, idx)} />
                                {/* Visible handle */}
                                <circle cx={pt.x} cy={pt.y} r={10}
                                    fill="#3b82f6" stroke="white" strokeWidth="2.5"
                                    onPointerDown={e => onPointerDown(e as any, idx)} />
                                {/* Corner index label for debugging  */}
                                {/* <text x={pt.x} y={pt.y} fontSize="10" fill="white" textAnchor="middle" dominantBaseline="middle">{idx}</text> */}
                            </g>
                        ))}
                    </svg>
                )}
                {!svgPts && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">ডকুমেন্ট শনাক্ত করা হচ্ছে...</p>
                        </div>
                    </div>
                )}
            </div>
        )
    }
)
DocCropper.displayName = 'DocCropper'

// ─── Main Component ───────────────────────────────────────────────────────────
function PrintReadyClientInner({ shopId }: PrintReadyClientInnerProps) {
    const [step, setStep] = useState<Step>('upload')
    const [imgFile, setImgFile] = useState<File | null>(null)
    const [processedUrl, setProcessedUrl] = useState('')
    const [filter, setFilter] = useState<FilterType>('bw')
    const [bwThreshold, setBwThreshold] = useState(10)
    const [colorContrast, setColorContrast] = useState(1.3)
    const [isProcessing, setIsProcessing] = useState(false)
    const processingRef = useRef(false)
    const [cvLoaded, setCvLoaded] = useState(false)
    const cropperRef = useRef<CropperHandle>(null)

    // Poll for OpenCV
    useEffect(() => {
        const id = setInterval(() => {
            if ((window as any).cv) { setCvLoaded(true); clearInterval(id) }
        }, 300)
        return () => clearInterval(id)
    }, [])

    function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files?.[0]) {
            setImgFile(e.target.files[0])
            setStep('crop')
        }
    }

    async function handleScan() {
        if (!cropperRef.current || processingRef.current) return
        processingRef.current = true
        setIsProcessing(true)
        try {
            const url = await cropperRef.current.process(filter, { bwThreshold, colorContrast })
            if (processedUrl && processedUrl.startsWith('blob:')) URL.revokeObjectURL(processedUrl)
            setProcessedUrl(url)
            setStep('preview')
        } catch (err) {
            console.error('Processing failed', err)
        } finally {
            setIsProcessing(false)
            processingRef.current = false
        }
    }

    // Re-scan when settings change while on preview
    useEffect(() => {
        if (step === 'preview') {
            const timer = setTimeout(() => {
                handleScan()
            }, 300)
            return () => clearTimeout(timer)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, filter, bwThreshold, colorContrast])

    const handleDownloadPDF = async () => {
        if (!processedUrl) return
        try {
            let dataUrl = processedUrl
            if (processedUrl.startsWith('blob:')) {
                const blob = await (await fetch(processedUrl)).blob()
                dataUrl = await new Promise<string>((res, rej) => {
                    const fr = new FileReader()
                    fr.onloadend = () => res(fr.result as string)
                    fr.onerror = rej
                    fr.readAsDataURL(blob)
                })
            }
            const img = new Image()
            img.src = dataUrl
            await new Promise<void>(r => { img.onload = () => r() })
            const orientation = img.width > img.height ? 'landscape' : 'portrait'
            const doc = new jsPDF(orientation, 'mm', 'a4')
            const pw = doc.internal.pageSize.getWidth(), ph = doc.internal.pageSize.getHeight()
            const ar = img.width / img.height, pr = pw / ph
            let fw = pw, fh = ph
            if (ar > pr) fh = pw / ar; else fw = ph * ar
            doc.addImage(dataUrl, dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG',
                (pw - fw) / 2, (ph - fh) / 2, fw, fh)
            doc.save('scanned-document.pdf')
        } catch (e) { console.error('PDF failed', e) }
    }

    const handleDirectPrint = () => {
        if (!processedUrl) return
        const printWindow = window.open('', '_blank')
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Print Document</title>
                        <style>
                            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: white; }
                            img { max-width: 100%; max-height: 100vh; object-contain: contain; }
                            @page { margin: 0; size: auto; }
                            @media print {
                                body { margin: 0; }
                                img { width: 100vw; height: auto; max-height: none; }
                            }
                        </style>
                    </head>
                    <body>
                        <img src="${processedUrl}" onload="window.print(); window.onafterprint = () => window.close();" />
                    </body>
                </html>
            `)
            printWindow.document.close()
        }
    }

    const resetAll = () => {
        if (processedUrl.startsWith('blob:')) URL.revokeObjectURL(processedUrl)
        setStep('upload'); setImgFile(null); setProcessedUrl('')
    }

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">প্রিন্ট রেডি (Print Ready)</h1>
                    <p className="text-muted-foreground">ক্যামেরায় তোলা ছবিকে স্ক্যান করা ডকুমেন্টের মতো পরিষ্কার করুন এবং PDF তৈরি করুন।</p>
                </div>
                {step !== 'upload' && (
                    <Button variant="outline" onClick={resetAll} size="sm">
                        <RefreshCw className="mr-2 h-4 w-4" /> নতুন ট্রাই করুন
                    </Button>
                )}
            </div>

            <Card className="flex-1 flex flex-col p-6 min-h-[500px]">
                {/* Upload */}
                {step === 'upload' && (
                    <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 text-center bg-muted/20">
                        <div className="flex gap-4 mb-6">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                <Camera className="w-8 h-8 text-primary" />
                            </div>
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-primary" />
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">আপনার ডকুমেন্টের ছবি দিন</h3>
                        <p className="text-muted-foreground mb-8 max-w-sm">সরাসরি ক্যামেরা দিয়ে ছবি তুলুন অথবা গ্যালারি থেকে আপলোড করুন</p>

                        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                            <Label htmlFor="camera-input" className="flex-1 cursor-pointer">
                                <div className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-6 rounded-xl flex items-center justify-center gap-3 font-bold text-lg shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
                                    <Camera className="w-6 h-6" />
                                    ক্যামেরা (Camera)
                                </div>
                                <input id="camera-input" type="file" accept="image/*" capture="environment"
                                    className="hidden" onChange={onSelectFile} />
                            </Label>

                            <Label htmlFor="gallery-input" className="flex-1 cursor-pointer">
                                <div className="bg-background text-foreground border-2 border-primary/20 hover:bg-muted h-14 px-6 rounded-xl flex items-center justify-center gap-3 font-bold text-lg transition-all hover:scale-[1.02]">
                                    <ImageIcon className="w-6 h-6 text-primary" />
                                    গ্যালারি (Gallery)
                                </div>
                                <input id="gallery-input" type="file" accept="image/*"
                                    className="hidden" onChange={onSelectFile} />
                            </Label>
                        </div>
                    </div>
                )}

                {/* Crop & Main Processing Context */}
                {imgFile && (
                    <div className={step === 'crop' ? 'flex-1 flex flex-col space-y-4' : 'hidden'}>
                        <p className="text-sm font-medium text-center">
                            ডকুমেন্টের কোণাগুলো স্বয়ংক্রিয়ভাবে শনাক্ত করা হয়েছে — প্রয়োজনে নীল বিন্দু টেনে ঠিক করুন
                        </p>
                        <div className="flex-1 min-h-[350px] bg-black/5 rounded-lg border overflow-hidden">
                            {!cvLoaded ? (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    <p className="text-sm text-muted-foreground">Image Processing AI লোড হচ্ছে...</p>
                                </div>
                            ) : (
                                <DocCropper ref={cropperRef} imageFile={imgFile} cvLoaded={cvLoaded} />
                            )}
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            <Button variant="ghost" onClick={() => setStep('upload')}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> ফিরে যান
                            </Button>
                            <Button onClick={handleScan} disabled={!cvLoaded || isProcessing} size="lg">
                                {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> প্রসেসিং...</> : (
                                    <><Wand2 className="mr-2 h-5 w-5" /> স্ক্যান করুন</>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Preview */}
                {step === 'preview' && (
                    <div className="flex-1 flex flex-col md:flex-row gap-8 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex-1 flex flex-col space-y-4">
                            <div className="flex-1 min-h-[400px] border rounded-lg bg-black/5 flex items-center justify-center p-4 overflow-hidden relative">
                                {processedUrl && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={processedUrl} alt="Processed result"
                                        className={`max-w-full max-h-[60vh] object-contain shadow-lg transition-opacity duration-200 ${isProcessing ? 'opacity-50' : 'opacity-100'}`} />
                                )}

                                {isProcessing && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/20 backdrop-blur-[1px]">
                                        <div className="bg-background/80 p-4 rounded-full shadow-lg flex items-center gap-3 border">
                                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                            <span className="text-sm font-medium">প্রসেসিং হচ্ছে...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="w-full md:w-80 flex flex-col space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-3">ফিল্টার নির্বাচন করুন</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant={filter === 'bw' ? 'default' : 'outline'}
                                        onClick={() => setFilter('bw')} className="h-20 flex-col gap-2">
                                        <div className="w-6 h-6 rounded-full bg-black border border-white/20" />
                                        সাদাকালো (B&W)
                                    </Button>
                                    <Button variant={filter === 'color' ? 'default' : 'outline'}
                                        onClick={() => setFilter('color')} className="h-20 flex-col gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-red-500" />
                                        রঙিন (Color)
                                    </Button>
                                    <Button variant={filter === 'none' ? 'default' : 'outline'}
                                        onClick={() => setFilter('none')} className="h-10 col-span-2 mt-2">
                                        অরিজিনাল (Original)
                                    </Button>
                                </div>
                            </div>

                            {filter !== 'none' && (
                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium">
                                            {filter === 'bw' ? 'সাদাকালো ঘনত্ব (Threshold)' : 'রঙিন উজ্জ্বলতা (Contrast)'}
                                        </Label>
                                        <span className="text-xs text-muted-foreground">
                                            {filter === 'bw' ? bwThreshold : colorContrast.toFixed(1)}
                                        </span>
                                    </div>
                                    <Slider
                                        value={filter === 'bw' ? [bwThreshold] : [colorContrast * 10]}
                                        min={filter === 'bw' ? 0 : 10}
                                        max={filter === 'bw' ? 40 : 30}
                                        step={filter === 'bw' ? 1 : 1}
                                        onValueChange={(val) => {
                                            if (filter === 'bw') setBwThreshold(val[0])
                                            else setColorContrast(val[0] / 10)
                                        }}
                                    />
                                    <p className="text-[10px] text-muted-foreground italic">
                                        {filter === 'bw'
                                            ? '* ঘনত্ব বাড়ালে ব্যাকগ্রাউন্ড আরও পরিষ্কার হবে।'
                                            : '* ব্রাইটনেস বাড়ালে কালার আরও উজ্জ্বল হবে।'}
                                    </p>
                                </div>
                            )}

                            <div className="flex-1 border-t pt-6 flex flex-col justify-end">
                                <Button onClick={handleDownloadPDF} size="lg" className="w-full gap-2 text-lg h-14">
                                    <Download className="w-5 h-5" /> PDF ডাউনলোড করুন
                                </Button>
                                <Button onClick={handleDirectPrint} variant="outline" size="lg" className="w-full gap-2 text-lg h-14 mt-3">
                                    <Printer className="w-5 h-5" /> সরাসরি প্রিন্ট করুন
                                </Button>
                            </div>
                            <div className="pt-4 flex justify-between">
                                <Button variant="ghost" onClick={() => setStep('crop')} size="sm">
                                    <ArrowLeft className="mr-2 h-4 w-4" /> আবার ক্রপ করুন
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    )
}

export function PrintReadyClient({ shopId }: { shopId: string }) {
    return (
        <OpenCvProvider openCvPath="https://docs.opencv.org/4.5.1/opencv.js">
            <PrintReadyClientInner shopId={shopId} />
        </OpenCvProvider>
    )
}
