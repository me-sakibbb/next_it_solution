import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { resend } from '@/lib/resend';
import { getSubscriptionReminderTemplate } from '@/lib/email-templates';
import { notifyUser } from '@/actions/notifications';
import { addDays, format, isSameDay, parseISO } from 'date-fns';

export const dynamic = 'force-dynamic';

/**
 * Daily Cron Job: Subscription Expiry Reminders
 * Triggers every 24 hours via Vercel Crons
 */
export async function GET(req: NextRequest) {
  // 1. Security Check
  const authHeader = req.headers.get('authorization');
  // In production, we'll use a specific secret. For now, check if it's set.
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  try {
    // 2. Fetch all active subscriptions
    // We'll filter them in JS to handle the days exactly
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        user_id,
        plan_type,
        subscription_end_date,
        users:user_id (
          full_name,
          email
        )
      `)
      .eq('status', 'active');

    if (subError) throw subError;

    const today = new Date();
    const results = {
      sent_5: 0,
      sent_2: 0,
      sent_1: 0,
      errors: 0,
    };

    // 3. Process each subscription
    for (const sub of subscriptions as any) {
      if (!sub.subscription_end_date || !sub.users) continue;

      const endDate = parseISO(sub.subscription_end_date);
      const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // Thresholds for reminders
      const thresholds = [5, 2, 1];
      
      if (thresholds.includes(diffDays)) {
        const type = `${diffDays}_day`;
        
        // 4. Check if already notified for this stage
        const { data: existingLog } = await supabase
          .from('subscription_reminder_log')
          .select('id')
          .eq('subscription_id', sub.id)
          .eq('reminder_type', type)
          .maybeSingle();

        if (existingLog) continue;

        try {
          const userName = sub.users.full_name || 'গ্রাহক';
          const userEmail = sub.users.email;
          const planName = sub.plan_type.toUpperCase();
          const billingUrl = `${req.nextUrl.origin}/dashboard/billing`;

          // 5. Send In-App & Push Notification
          const title = `আপনার সাবস্ক্রিপশন ${diffDays} দিনের মধ্যে শেষ হবে`;
          const message = `আপনার ${planName} প্ল্যানের মেয়াদ আর মাত্র ${diffDays} দিন বাকি। নিরবচ্ছিন্ন সেবা পেতে এখনই রিনিউ করুন।`;
          
          await notifyUser(sub.user_id, title, message, '/dashboard/billing', 'billing');

          // 6. Send Email via Resend
          if (userEmail) {
            const { subject, html } = getSubscriptionReminderTemplate({
              userName,
              planName,
              daysRemaining: diffDays,
              billingUrl,
            });

            await resend.emails.send({
              from: 'Next IT Solution <notifications@resend.dev>', // Should be a verified domain in prod
              to: [userEmail],
              subject,
              html,
            });
          }

          // 7. Log the successful reminder
          await supabase.from('subscription_reminder_log').insert({
            subscription_id: sub.id,
            reminder_type: type,
          });

          if (diffDays === 5) results.sent_5++;
          if (diffDays === 2) results.sent_2++;
          if (diffDays === 1) results.sent_1++;

        } catch (err) {
          console.error(`Error processing reminder for user ${sub.user_id}:`, err);
          results.errors++;
        }
      }
    }

    return NextResponse.json({
      message: 'Cron job processed successfully',
      results,
    });

  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
