-- Migration: Create standalone staff table (staff don't need user accounts)
-- Run this in your Supabase SQL Editor

-- Create standalone staff table
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  employee_id TEXT,
  department TEXT,
  designation TEXT,
  employment_type TEXT NOT NULL CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'intern')),
  date_of_joining DATE NOT NULL,
  base_salary DECIMAL(10,2) NOT NULL,
  bank_account_number TEXT,
  bank_name TEXT,
  bank_ifsc TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_staff_shop_id ON public.staff(shop_id);
CREATE INDEX IF NOT EXISTS idx_staff_employee_id ON public.staff(employee_id);

-- Add staff_id to attendance table
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_attendance_staff_id ON public.attendance(staff_id);

-- Add staff_id to leaves table  
ALTER TABLE public.leaves ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_leaves_staff_id ON public.leaves(staff_id);
ALTER TABLE public.leaves ADD COLUMN IF NOT EXISTS days INTEGER;

-- Add staff_id to payroll table
ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_payroll_staff_id ON public.payroll(staff_id);
ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS gross_salary DECIMAL(10,2);
ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS overtime_hours DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

