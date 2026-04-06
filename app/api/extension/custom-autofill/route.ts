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

        const body = await req.json();
        const { document, profileData, targetFields, context } = body;
        
        let cost = 1;
        if (document && !profileData) {
            cost = 2; // Instant Extraction + Fill
        } else if (profileData) {
            cost = 1; // Fill only
        }

        if (balance < cost) {
            return NextResponse.json(
                { error: `Insufficient balance. You need at least ${cost} taka to continue.` },
                { status: 403, headers: CORS_HEADERS }
            )
        }

        if (!document && !profileData) {
            return NextResponse.json({ error: 'Missing document or profile payload' }, { status: 400, headers: CORS_HEADERS });
        }

        // Build the core instruction
        let prompt = `You are an expert form filling assistant. Your job is to take user data and map it to a specific web form with maximum accuracy.\n\n`;
        
        if (context) {
            prompt += `PAGE CONTEXT:\n`;
            if (context.url) prompt += `- URL: ${context.url}\n`;
            if (context.title) prompt += `- Title: ${context.title}\n\n`;
        }

        if (profileData) {
            prompt += `USER PROFILE DATA (Source of truth):\n`;
            prompt += JSON.stringify(profileData, null, 2) + '\n\n';
        }

        if (targetFields && Object.keys(targetFields).length > 0) {
            prompt += `TARGET FORM FIELDS:\n`;
            prompt += `Below is an array of form fields extracted from the page. Each field has an 'id', 'name', 'type', 'label', etc.\n`;
            prompt += JSON.stringify(targetFields, null, 2) + '\n\n';

            prompt += `MAPPING RULES & INTELLIGENCE:\n`;
            prompt += `1. Return ONLY a valid JSON object mapping the exact field ID/NAME to the value.\n`;
            prompt += `2. CROSS-LANGUAGE TRANSLATION: If the source data is in English but the form requires Bengali (Bangla), TRANSLATE the value accurately (e.g., source="Dhaka" -> form="ঢাকা"). Vice versa applies.\n`;
            prompt += `3. DEEP REASONING & INFERENCE: Do not be rigid. If a form asks for something not explicitly labeled but clearly available inside another field (e.g., extracting "Village/গ্রাম" from a full address string), extract it intelligently.\n`;
            prompt += `4. DATA MANIPULATION: Feel free to format, split, or merge data to satisfy the form. (e.g., Splitting "Full Name" into "First Name" & "Last Name").\n`;
            prompt += `5. For 'select', 'radio', or 'checkbox' fields, analyze all options and match with the exact value that logically represents the source data.\n`;
            prompt += `6. Format dates strictly as YYYY-MM-DD.\n`;
            prompt += `7. BE AGGRESSIVE BUT ACCURATE: Connect all the logical dots to fill as many fields as humanly possible based on the source context. Only output null if the data is completely impossible to infer.\n`;
        } else {
            prompt += `Map the source data to a flat JSON object with descriptive keys.\n`;
        }

        prompt += `\nReturn ONLY the JSON object, no explanation, no markdown.`;

        const parts: any[] = [];
        parts.push({ text: prompt });

        if (document) {
            if (document.type === 'text') {
                parts.push({ text: `DOCUMENT CONTENT:\n${document.data}` });
            } else if (document.type === 'image' || document.type === 'pdf') {
                parts.push({ inline_data: { mime_type: document.mimeType, data: document.data } });
            }
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

        // Deduct balance
        const newBalance = balance - cost;
        await adminSupabase
            .from('users')
            .update({ balance: newBalance })
            .eq('id', user.id)
            
        await adminSupabase
            .from('balance_transactions')
            .insert({
                user_id: user.id,
                amount: cost,
                type: 'debit',
                description: cost === 2 ? 'Instant Form Extraction & Autofill' : 'Profile-Based Form Autofill'
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

