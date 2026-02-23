import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const image = formData.get('image') as File | null

        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 })
        }

        const apiKey = process.env.REMOVE_BG_API_KEY
        if (!apiKey) {
            return NextResponse.json(
                { error: 'REMOVE_BG_API_KEY is not configured in .env.local' },
                { status: 500 }
            )
        }

        const removeBgFormData = new FormData()
        removeBgFormData.append('image_file', image)
        removeBgFormData.append('size', 'auto')

        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': apiKey,
            },
            body: removeBgFormData,
        })

        if (!response.ok) {
            const errorData = await response.json()
            console.error('Remove.bg API Error:', errorData)
            return NextResponse.json(
                { error: errorData.errors?.[0]?.title || 'Failed to remove background via Remove.bg' },
                { status: response.status }
            )
        }

        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'image/png',
                'Content-Length': buffer.length.toString(),
            },
        })
    } catch (error) {
        console.error('Background removal server error:', error)
        return NextResponse.json(
            { error: 'Internal server error while removing background' },
            { status: 500 }
        )
    }
}
