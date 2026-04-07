import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@supabase/supabase-js'
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

        // Static import — no dynamic import overhead
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: { persistSession: false }
        })

        // Run auth + body parse in parallel
        const [authResult, body] = await Promise.all([
            supabase.auth.getUser(token),
            req.json()
        ])

        const { data: { user }, error: userError } = authResult

        if (userError || !user) {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401, headers: CORS_HEADERS }
            )
        }

        const { document } = body;

        if (!document) {
            return NextResponse.json({ error: 'Missing document payload' }, { status: 400, headers: CORS_HEADERS });
        }

        const adminSupabase = createAdminClient()

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

        // gemini-3.1-flash-lite-preview: ultra-fast, production-proven model
        const MODEL = 'gemini-3.1-flash-lite-preview';
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

        // For thinking models, always read the last part (the actual answer, not the thought)
        const parts_out = data.candidates[0].content.parts;
        const lastPart = parts_out[parts_out.length - 1];
        let text = lastPart.text || "{}";

        // Robust JSON extraction
        let parsedProfile = {};
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const candidate = jsonMatch[0];
                try {
                    parsedProfile = JSON.parse(candidate);
                } catch (err) {
                    let lastBracePos = candidate.lastIndexOf('}');
                    let success = false;
                    while (lastBracePos !== -1) {
                        try {
                            parsedProfile = JSON.parse(candidate.substring(0, lastBracePos + 1));
                            success = true;
                            break;
                        } catch (e) {
                            lastBracePos = candidate.lastIndexOf('}', lastBracePos - 1);
                        }
                    }
                    if (!success) throw err;
                }
            } else {
                parsedProfile = JSON.parse(text);
            }
        } catch (parseError: any) {
            console.error('Failed to parse Gemini JSON (extract-profile):', text);
            throw new Error(`AI extraction error: ${parseError.message}`);
        }

        // Fire-and-forget balance deduction — don't block response
        const newBalance = balance - 1;
        Promise.all([
            adminSupabase.from('users').update({ balance: newBalance }).eq('id', user.id),
            adminSupabase.from('balance_transactions').insert({
                user_id: user.id,
                amount: 1,
                type: 'debit',
                description: 'Profile Extraction Fee'
            })
        ]).then(() => { }) // non-blocking

        return NextResponse.json(
            { profileData: parsedProfile, remainingBalance: newBalance },
            { status: 200, headers: CORS_HEADERS }
        );

    } catch (error: any) {
        console.error('Extract Profile API error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500, headers: CORS_HEADERS })
    }
}
