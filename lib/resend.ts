import { Resend } from 'resend';

const apiKey = process.env.NEXT_RESEND_API_KEY || 're_dummy';

if (apiKey === 're_dummy' && process.env.NODE_ENV !== 'production') {
  console.warn('Warning: NEXT_RESEND_API_KEY environment variable is not set. Emails will fail to send in development.');
}

export const resend = new Resend(apiKey);
