import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization')
        const token = authHeader?.replace('Bearer ', '').trim()

        if (!token) {
            return NextResponse.json(
                { error: 'Missing authorization token' },
                { status: 401, headers: CORS_HEADERS }
            )
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: { persistSession: false }
        })

        const { data: { user }, error: userError } = await supabase.auth.getUser(token)

        if (userError || !user) {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401, headers: CORS_HEADERS }
            )
        }

        const adminSupabase = createAdminClient()

        // Fetch the user's balance
        const { data: userRecord } = await adminSupabase
            .from('users')
            .select('balance')
            .eq('id', user.id)
            .single()
            
        const balance = userRecord?.balance || 0;

        if (balance < 1) {
            return NextResponse.json(
                { error: 'Insufficient balance. You need at least 1 taka to extract a profile.' },
                { status: 403, headers: CORS_HEADERS }
            )
        }

        const body = await req.json();
        const { document } = body;

        if (!document) {
            return NextResponse.json({ error: 'Missing document payload' }, { status: 400, headers: CORS_HEADERS });
        }

        // Prompt prioritized for maximum extraction accuracy
        let prompt = `You are an expert at extracting structured data from documents.
Your task is to extract ALL personal and identification information from the provided document.

EXTRACTION RULES:
1. Extract every labeled piece of information (e.g., "নাম/Name", "পিতার নাম/Father's Name", "NID No", "Date of Birth").
2. Use the exact labels from the document as JSON keys. If a label is in both Bangla and English, prefer a descriptive English key.
3. If the value is a date, ensure it is in YYYY-MM-DD format.
4. If a value is from a list or checkbox in the document, extract the selected value.
5. Return a flat JSON object mapping labels to extracted values.
6. Do NOT include any explanations or markdown. Return ONLY valid JSON.

Return a JSON object: { "Label name": "Extracted Value" }
`;

        const parts: any[] = [];
        parts.push({ text: prompt });

        if (document.type === 'text') {
            parts.push({ text: `DOCUMENT CONTENT:\n${document.data}` });
        } else if (document.type === 'image' || document.type === 'pdf') {
            parts.push({ inline_data: { mime_type: document.mimeType, data: document.data } });
        } else {
            return NextResponse.json({ error: 'Unsupported document format' }, { status: 400, headers: CORS_HEADERS });
        }

        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Gemini API Key missing on server' }, { status: 500, headers: CORS_HEADERS })
        }

        const MODEL = 'gemini-3-flash-preview';
        const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

        const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts }],
                generationConfig: {
                    response_mime_type: 'application/json',
                    temperature: 0,
                },
            }),
        });

        const data = await res.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        let text = data.candidates[0].content.parts[0].text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) text = jsonMatch[0];

        // Success - deduct 1 balance
        const newBalance = balance - 1;
        await adminSupabase
            .from('users')
            .update({ balance: newBalance })
            .eq('id', user.id)
            
        await adminSupabase
            .from('balance_transactions')
            .insert({
                user_id: user.id,
                amount: 1,
                type: 'debit',
                description: 'Profile Extraction Fee'
            });

        return NextResponse.json(
            { profileData: JSON.parse(text), remainingBalance: newBalance },
            { status: 200, headers: CORS_HEADERS }
        );

    } catch (error: any) {
        console.error('Extract Profile API error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500, headers: CORS_HEADERS })
    }
}
