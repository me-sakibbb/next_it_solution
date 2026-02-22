-- Create suppliers table
create table public.suppliers (
  id uuid default gen_random_uuid() primary key,
  shop_id uuid references public.shops(id) on delete cascade not null,
  name text not null,
  contact_person text,
  email text,
  phone text,
  address text,
  city text,
  state text,
  zip_code text,
  country text default 'Bangladesh',
  tax_id text,
  payment_terms text,
  credit_limit decimal(10,2),
  due decimal(15,2) default 0.00 not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create supplier_transactions table
create table public.supplier_transactions (
  id uuid default gen_random_uuid() primary key,
  shop_id uuid references public.shops(id) on delete cascade not null,
  supplier_id uuid references public.suppliers(id) on delete cascade not null,
  transaction_type text not null check (transaction_type in ('payment', 'due_added', 'adjustment')),
  amount decimal(15,2) not null,
  notes text,
  reference_number text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add supplier_id to products
alter table public.products add column supplier_id uuid references public.suppliers(id) on delete set null;

-- Enable RLS
alter table public.suppliers enable row level security;
alter table public.supplier_transactions enable row level security;

-- Policies for suppliers
create policy "Users can view their shop's suppliers"
  on public.suppliers for select
  using (
    shop_id in (
      select shop_id from public.shop_members
      where user_id = auth.uid()
      and is_active = true
    )
  );

create policy "Users can insert their shop's suppliers"
  on public.suppliers for insert
  with check (
    shop_id in (
      select shop_id from public.shop_members
      where user_id = auth.uid()
      and is_active = true
      and role in ('owner', 'manager', 'staff')
    )
  );

create policy "Users can update their shop's suppliers"
  on public.suppliers for update
  using (
    shop_id in (
      select shop_id from public.shop_members
      where user_id = auth.uid()
      and is_active = true
      and role in ('owner', 'manager', 'staff')
    )
  );

create policy "Users can delete their shop's suppliers"
  on public.suppliers for delete
  using (
    shop_id in (
      select shop_id from public.shop_members
      where user_id = auth.uid()
      and is_active = true
      and role in ('owner', 'manager')
    )
  );

-- Policies for supplier_transactions
create policy "Users can view their shop's supplier transactions"
  on public.supplier_transactions for select
  using (
    shop_id in (
      select shop_id from public.shop_members
      where user_id = auth.uid()
      and is_active = true
    )
  );

create policy "Users can insert their shop's supplier transactions"
  on public.supplier_transactions for insert
  with check (
    shop_id in (
      select shop_id from public.shop_members
      where user_id = auth.uid()
      and is_active = true
      and role in ('owner', 'manager', 'staff')
    )
  );
