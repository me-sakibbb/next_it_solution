import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export const runtime = 'nodejs'

// Allow large image uploads (up to 50MB)
export const maxDuration = 30

export async function POST(request: NextRequest) {
    try {
        // Read raw body as ArrayBuffer to avoid FormData parsing issues
        const body = await request.json() as { image: string }

        if (!body.image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 })
        }

        // The image is sent as a base64 data URL: "data:image/png;base64,..."
        const base64Data = body.image.split(',')[1]
        if (!base64Data) {
            return NextResponse.json({ error: 'Invalid image data' }, { status: 400 })
        }

        const buffer = Buffer.from(base64Data, 'base64')

        // Apply professional-grade enhancement pipeline with sharp
        const enhanced = await sharp(buffer)
            // Step 1: Auto Levels — stretches histogram to use full dynamic range
            .normalize()
            // Step 2: Unsharp Mask — sharpens details
            .sharpen({ sigma: 1.2, m1: 1.0, m2: 0.5, x1: 2, y2: 10, y3: 20 })
            // Step 3: Vibrance/Saturation boost — subtle color pop
            .modulate({ saturation: 1.15, brightness: 1.02 })
            // Step 4: Gamma correction — removed (Sharp expects value >= 1.0, 0.95 invalid)
            // Step 5: Slight contrast boost via linear transform
            .linear(1.05, -6)
            // Output as PNG to preserve quality
            .png({ quality: 95 })
            .toBuffer()

        // Return as base64 data URL for easy client-side consumption
        const enhancedBase64 = `data:image/png;base64,${enhanced.toString('base64')}`

        return NextResponse.json({ image: enhancedBase64 })
    } catch (error) {
        console.error('Image enhancement error:', error)
        return NextResponse.json(
            { error: 'Failed to enhance image' },
            { status: 500 }
        )
    }
}
