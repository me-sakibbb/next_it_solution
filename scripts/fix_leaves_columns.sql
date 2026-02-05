-- Migration: Add more leave types to leaves table
-- The from_date and to_date columns already exist

-- Drop the old constraint and add new one with more leave types
ALTER TABLE public.leaves DROP CONSTRAINT IF EXISTS leaves_leave_type_check;

-- Add the new constraint with more types including 'annual' and 'other'
ALTER TABLE public.leaves ADD CONSTRAINT leaves_leave_type_check 
CHECK (leave_type IN ('sick', 'casual', 'earned', 'annual', 'maternity', 'paternity', 'unpaid', 'other'));
