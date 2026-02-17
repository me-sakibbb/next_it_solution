-- Drop the recursive policy
DROP POLICY IF EXISTS "Super admins can view admin list" ON public.super_admins;

-- Create non-recursive policy
-- This allows a user to see ONLY their own row in the super_admins table.
-- This effectively allows "auth.email() IN (SELECT email FROM super_admins)" to work 
-- because the subquery will return the user's email if they are an admin, and nothing otherwise.
CREATE POLICY "Super admins can view own entry" ON public.super_admins
    FOR SELECT
    USING (email = auth.email());
