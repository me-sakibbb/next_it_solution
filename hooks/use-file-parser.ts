import { useState, useCallback } from 'react';
import * as mammoth from 'mammoth';

export function useFileParser() {
    const [isParsing, setIsParsing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const parseFile = useCallback(async (file: File): Promise<string | null> => {
        setIsParsing(true);
        setError(null);

        const fileType = file.type;
        const fileName = file.name.toLowerCase();

        try {
            if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
                // Dynamically import pdfjs-dist to avoid SSR issues
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
            }
            else if (
                fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                fileName.endsWith('.docx')
            ) {
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.extractRawText({ arrayBuffer });
                setIsParsing(false);
                return result.value;
            }
            else if (fileType.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(fileName)) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        setIsParsing(false);
                        resolve(reader.result as string);
                    };
                    reader.onerror = () => {
                        setIsParsing(false);
                        reject(new Error('Failed to read image file'));
                    };
                    reader.readAsDataURL(file);
                });
            }
            else {
                throw new Error('Unsupported file type. Please upload PDF, DOCX, or Image.');
            }
        } catch (err) {
            console.error('File parsing error:', err);
            setError(err instanceof Error ? err.message : 'Failed to parse file.');
            setIsParsing(false);
            return null;
        }
    }, []);

    return { parseFile, isParsing, error };
}
