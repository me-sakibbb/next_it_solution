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
        // Extract Bearer token
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
                { error: 'Insufficient balance. You need at least 1 taka to fill a form.' },
                { status: 403, headers: CORS_HEADERS }
            )
        }

        const body = await req.json();
        const { document, targetFields } = body;

        if (!document) {
            return NextResponse.json({ error: 'Missing document payload' }, { status: 400, headers: CORS_HEADERS });
        }

        // Build the core instruction
        let prompt = `You are an expert data extraction assistant. Your job is to extract personal information from a document and map it to a specific web form.\n\n`;

        if (targetFields && Object.keys(targetFields).length > 0) {
            prompt += `TARGET FORM FIELDS:\n`;
            prompt += `Below is an array of form fields extracted from the page. Each field has an 'id', 'name', 'type', 'label', etc.\n`;
            prompt += `You must exact data from the document and return a valid JSON object where the keys are the field 'id' (or 'name' if 'id' is empty), and the values are the extracted values.\n`;
            prompt += JSON.stringify(targetFields, null, 2) + '\n\n';

            prompt += `EXTRACTION RULES:\n`;
            prompt += `1. Return ONLY a valid JSON object mapping the field ID/NAME to the extracted value.\n`;
            prompt += `2. Perform DEEP SEMANTIC MATCHING - use the provided labels/placeholders to understand what each field means.\n`;
            prompt += `   - "নাম" or "Name" or "Full Name" → match to keys related to name.\n`;
            prompt += `   - "জন্ম তারিখ" or "DOB" or "Date of Birth" → find the DOB.\n`;
            prompt += `   - "জাতীয় পরিচয়পত্র নং" or "NID" or "National ID" → NID.\n`;
            prompt += `3. If a field has both Bangla and English variants:\n`;
            prompt += `   - Transliterate to English or translate to Bangla if required by the label context.\n`;
            prompt += `4. Format dates appropriately. If you see "15-07-1990", convert to "1990-07-15" standard format for date inputs.\n`;
            prompt += `5. If an input type is "radio" or "checkbox", or a "select" field has options provided, use the EXACT value of the option that matches semantically.\n`;
            prompt += `6. For fields NOT found in the document, ignore them or set them to null. Do NOT guess or hallucinate details.\n`;
            prompt += `7. Be aggressive about filling form fields. Use derivations (e.g. calculate age from DOB if an age field exists).\n`;
        } else {
            prompt += `Extract ALL personal data from the document as a flat JSON object with descriptive English snake_case keys.\n`;
        }

        prompt += `\nReturn ONLY the JSON object, no explanation, no markdown.`;

        const parts: any[] = [];

        if (document.type === 'text') {
            parts.push({ text: prompt + `\n\nDOCUMENT CONTENT:\n${document.data}` });
        } else if (document.type === 'image' || document.type === 'pdf') {
            parts.push({ text: prompt });
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

        // Deduct balance and register transaction only upon successful AI execution
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
                description: 'Custom Form Autofill Fee'
            });

        return NextResponse.json(
            { fields: JSON.parse(text), usage: data.usageMetadata, remainingBalance: newBalance },
            { status: 200, headers: CORS_HEADERS }
        );

    } catch (error: any) {
        console.error('Custom Autofill API error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500, headers: CORS_HEADERS })
    }
}
