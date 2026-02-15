import { useState, useCallback } from 'react';

export function usePdfParser() {
    const [isParsing, setIsParsing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const parsePdf = useCallback(async (file: File): Promise<string | null> => {
        setIsParsing(true);
        setError(null);

        try {
            // Dynamically import pdfjs-dist to avoid SSR issues with DOMMatrix
            const pdfjsLib = await import('pdfjs-dist');

            // Set up worker
            if (typeof window !== 'undefined' && 'Worker' in window) {
                pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
            }

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                    .map((item: any) => item.str)
                    .join(' ');
                fullText += pageText + '\n\n';
            }

            setIsParsing(false);
            return fullText;
        } catch (err) {
            console.error('PDF parsing error:', err);
            setError('Failed to parse PDF. Please ensure it is a valid PDF file.');
            setIsParsing(false);
            return null;
        }
    }, []);

    return { parsePdf, isParsing, error };
}
