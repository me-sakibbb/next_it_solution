import { Resend } from 'resend';

if (!process.env.NEXT_RESEND_API_KEY) {
  throw new Error('Missing NEXT_RESEND_API_KEY environment variable');
}

export const resend = new Resend(process.env.NEXT_RESEND_API_KEY);
