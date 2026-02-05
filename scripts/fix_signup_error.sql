-- SQL Fix for Signup Error
-- Run this in your Supabase SQL Editor

-- 1. Ensure the function captures and handles errors more gracefully
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_shop_id UUID;
BEGIN
    -- Insert user profile
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 
        COALESCE(NEW.raw_user_meta_data->>'role', 'staff')
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        updated_at = NOW();

    -- If the user is a shop owner, create their shop and trial subscription automatically
    IF (NEW.raw_user_meta_data->>'role' = 'shop_owner') THEN
        -- Create Shop
        INSERT INTO public.shops (owner_id, name)
        VALUES (
            NEW.id, 
            COALESCE(NEW.raw_user_meta_data->>'shop_name', 'My Shop')
        )
        RETURNING id INTO v_shop_id;

        -- Add to shop_members (as owner)
        INSERT INTO public.shop_members (shop_id, user_id, role)
        VALUES (v_shop_id, NEW.id, 'owner')
        ON CONFLICT (shop_id, user_id) DO NOTHING;

        -- Create 14-day trial subscription
        INSERT INTO public.subscriptions (user_id, plan_type, status, trial_start_date, trial_end_date)
        VALUES (
            NEW.id, 
            'trial', 
            'active', 
            NOW(), 
            NOW() + INTERVAL '14 days'
        )
        ON CONFLICT (user_id) DO NOTHING;
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log the error (visible in Supabase logs)
    RAISE LOG 'Error in handle_new_user trigger for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Ensure trigger is attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. (Optional) Fix index if missing
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
