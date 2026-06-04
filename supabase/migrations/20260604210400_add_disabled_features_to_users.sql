-- Add disabled_features array to users to control which dashboard cards they can see/use
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS disabled_features TEXT[] DEFAULT '{}';
