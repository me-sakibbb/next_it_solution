-- Fix subscriptions table: add missing columns and update constraints

-- Add balance column to users if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS balance DECIMAL(10, 2) DEFAULT 0.00;

-- Add cv_usage and autofill_usage columns to subscriptions
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS cv_usage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS autofill_usage INTEGER DEFAULT 0;

-- Drop the old plan_type CHECK constraint and add updated one with all plan types
ALTER TABLE public.subscriptions
DROP CONSTRAINT IF EXISTS subscriptions_plan_type_check;

ALTER TABLE public.subscriptions
ADD CONSTRAINT subscriptions_plan_type_check
CHECK (plan_type IN ('trial', 'basic', 'premium', 'enterprise', 'basic_bit', 'advance_plus', 'premium_power'));

-- Ensure updated_at column exists
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Remove the UNIQUE(user_id) constraint if it exists (we manage single-record per user in application logic)
-- This allows us to handle cases where it was inserted as unique safely
-- Keep the unique constraint but handle it properly in the app
-- ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_key;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON public.subscriptions(subscription_end_date);

-- RLS policies for subscriptions: users can read their own
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscriptions' AND policyname = 'Users can view their own subscriptions'
  ) THEN
    CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create bkash_payments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.bkash_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    payment_id TEXT UNIQUE NOT NULL,
    intent TEXT NOT NULL CHECK (intent IN ('add_balance', 'subscribe')),
    plan_type TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'executed', 'failed', 'cancelled')),
    trx_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on bkash_payments
ALTER TABLE public.bkash_payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for bkash_payments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bkash_payments' AND policyname = 'Users can view their own payments'
  ) THEN
    CREATE POLICY "Users can view their own payments" ON public.bkash_payments
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create index
CREATE INDEX IF NOT EXISTS idx_bkash_payments_user_id ON public.bkash_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_bkash_payments_payment_id ON public.bkash_payments(payment_id);

-- Create notifications table if it doesn't exist (for subscription notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    action_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' AND policyname = 'Users can view their own notifications'
  ) THEN
    CREATE POLICY "Users can view their own notifications" ON public.notifications
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' AND policyname = 'Users can update their own notifications'
  ) THEN
    CREATE POLICY "Users can update their own notifications" ON public.notifications
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create index
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
