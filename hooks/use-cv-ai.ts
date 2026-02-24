import { useState, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CVData } from '@/app/dashboard/cv-builder/types';

export function useCVAI() {
    // Initialize Gemini with the public key
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

    const generateCV = useCallback(async (input: string, templateId: string): Promise<{ success: boolean; data?: CVData; error?: string }> => {
        if (!genAI) {
            return { success: false, error: 'Gemini API key not configured (NEXT_PUBLIC_GEMINI_API_KEY missing)' };
        }

        if (!input) {
            return { success: false, error: 'No input provided' };
        }

        const isImage = input.startsWith('data:image/');

        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            const basePrompt = `
            You are an expert CV writer and ATS (Applicant Tracking System) optimization specialist. 
            Extract information from the provided ${isImage ? 'image' : 'text'} and structure it into a JSON format for a professional CV.
            
            CRITICAL INSTRUCTIONS:
            1.  **Format**: The output MUST be a valid JSON object.
            2.  **Conciseness**: The content MUST fit on a single A4 page. 
            3.  **Summary**: Write a powerful 3-4 line professional summary (approx 40-50 words) highlighting key achievements and skills.
            4.  **Experience**: 
                -   **Format**: Write a SINGLE, CONDENSED PARAGRAPH per role (1-3 lines). DO NOT use bullet points.
                -   **Content**: Focus on achievements, metrics, and impact. Use strong action verbs (e.g., "Led", "Developed", "Optimized").
            5.  **ATS Optimization**: Include relevant keywords from the experience text naturally within the descriptions and skills section.
            6.  **Clean-up**: Remove placeholders like "Refer to plain text". If data is missing, omit the field.
            7.  **Tone**: Professional, active voice, and result-oriented.
            
            Structure the response EXACTLY as this JSON object:
            {
                "personalInfo": {
                    "fullName": "",
                    "email": "",
                    "phone": "",
                    "linkedin": "",
                    "location": "",
                    "summary": "" 
                },
                "experience": [
                    {
                        "company": "",
                        "position": "",
                        "startDate": "",
                        "endDate": "",
                        "description": "Single paragraph description of the role, achievements, and impact."
                    }
                ],
                "education": [
                    {
                        "institution": "",
                        "degree": "",
                        "startDate": "",
                        "endDate": ""
                    }
                ],
                "skills": ["skill1", "skill2"],
                "projects": [
                    {
                        "name": "",
                        "description": "Short description (max 2 lines)",
                        "technologies": ["tech1"]
                    }
                ],
                "languages": [] // Array of strings
            }
            `;

            let result;
            if (isImage) {
                const base64Data = input.split(',')[1];
                const mimeType = input.split(';')[0].split(':')[1];
                result = await model.generateContent([
                    basePrompt + "\n\nReturn ONLY the JSON. Do not include markdown formatting like ```json.",
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType: mimeType
                        }
                    }
                ]);
            } else {
                result = await model.generateContent(basePrompt + `\n\nResume Text:\n${input}\n\nReturn ONLY the JSON. Do not include markdown formatting like \`\`\`json.`);
            }

            const response = await result.response;
            const textResponse = response.text();

            console.log('Raw Gemini response for generation:', textResponse);

            const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON object found in response');
            }

            const cleanedText = jsonMatch[0];
            const data = JSON.parse(cleanedText);

            return { success: true, data };

        } catch (error) {
            console.error('Error generating CV:', error);
            return { success: false, error: 'Failed to generate CV: ' + (error instanceof Error ? error.message : String(error)) };
        }
    }, [genAI]);

    const condenseCV = useCallback(async (data: CVData): Promise<CVData> => {
        if (!genAI) {
            throw new Error('Gemini API key not configured (NEXT_PUBLIC_GEMINI_API_KEY missing)');
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `
        You are an expert CV editor specializing in concise, impactful communication.
        The user's CV is currently too long to fit on a single A4 page. 
        Your task is to REWRITE and CONDENSE the content while preserving the core achievements and skills.

        CRITICAL INSTRUCTIONS:
        1.  **Reduce Total Length**: Cut word count by 30-40%.
        2.  **Summaries**: Rewrite the professional summary to be a maximum of 2-3 lines (approx 30-40 words).
        3.  **Experience**: 
            -   **Format**: Rewrite as a SINGLE, CONDENSED PARAGRAPH per role. DO NOT use bullet points.
            -   **Content**: Focus on key metrics and achievements.
        4.  **Education**: Remove description details unless absolutely unique (e.g., specific awards).
        5.  **Skills**: format as a compact array of string.
        6.  **Projects**: Shorten descriptions to 1 line maximum.

        Input Data:
        ${JSON.stringify(data, null, 2)}

        Output strictly valid JSON matching the exact structure of the input data.
        DO NOT use Markdown code blocks (like \`\`\`json). Just return the raw JSON string.
        `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            console.log('Raw Gemini response for condensation:', text);

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON object found in response');
            }

            const cleanedText = jsonMatch[0];
            const condensedData: CVData = JSON.parse(cleanedText);

            return condensedData;
        } catch (error) {
            console.error('Error condensing CV:', error);
            throw new Error('Failed to condense CV content: ' + (error instanceof Error ? error.message : String(error)));
        }
    }, [genAI]);

    return { generateCV, condenseCV };
}
