-- Add balance to users table if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS balance DECIMAL(10, 2) DEFAULT 0.00;

-- Create super_admins table
CREATE TABLE IF NOT EXISTS public.super_admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on super_admins
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- Policy: Super admins can view the list (to check their own access)
CREATE POLICY "Super admins can view admin list" ON public.super_admins
    FOR SELECT
    USING (auth.email() IN (SELECT email FROM public.super_admins));

-- Policy: Only service_role can insert/update/delete (for now, or manual DB insert)
-- We can add a policy later if super admins need to manage other admins

-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category TEXT NOT NULL, -- e.g., 'Development', 'Design', 'Marketing'
    is_active BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view active services
CREATE POLICY "Everyone can view active services" ON public.services
    FOR SELECT
    USING (is_active = TRUE OR auth.email() IN (SELECT email FROM public.super_admins));

-- Policy: Super admins can manage services
CREATE POLICY "Super admins can manage services" ON public.services
    FOR ALL
    USING (auth.email() IN (SELECT email FROM public.super_admins));

-- Create service_orders table
CREATE TABLE IF NOT EXISTS public.service_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id),
    service_id UUID NOT NULL REFERENCES public.services(id),
    status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, cancelled
    requirements TEXT,
    deliverables TEXT,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on service_orders
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own orders
CREATE POLICY "Users can view their own orders" ON public.service_orders
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can create orders
CREATE POLICY "Users can create orders" ON public.service_orders
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Super admins can view all orders
CREATE POLICY "Super admins can view all orders" ON public.service_orders
    FOR SELECT
    USING (auth.email() IN (SELECT email FROM public.super_admins));

-- Policy: Super admins can update orders (status, deliverables)
CREATE POLICY "Super admins can update orders" ON public.service_orders
    FOR UPDATE
    USING (auth.email() IN (SELECT email FROM public.super_admins));
