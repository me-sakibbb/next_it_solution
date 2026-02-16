create table if not exists shop_tasks (
  id uuid default gen_random_uuid() primary key,
  shop_id uuid references shops(id) on delete cascade not null,
  title text not null,
  description text,
  price numeric not null default 0,
  status text not null check (status in ('pending', 'completed')) default 'pending',
  customer_name text,
  due_date timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  completed_at timestamptz
);

-- Add RLS policies
alter table shop_tasks enable row level security;

create policy "Users can view their shop's tasks"
  on shop_tasks for select
  using (
    exists (
      select 1 from shop_members
      where shop_members.shop_id = shop_tasks.shop_id
      and shop_members.user_id = auth.uid()
    )
  );

create policy "Users can insert tasks for their shop"
  on shop_tasks for insert
  with check (
    exists (
      select 1 from shop_members
      where shop_members.shop_id = shop_tasks.shop_id
      and shop_members.user_id = auth.uid()
    )
  );

create policy "Users can update their shop's tasks"
  on shop_tasks for update
  using (
    exists (
      select 1 from shop_members
      where shop_members.shop_id = shop_tasks.shop_id
      and shop_members.user_id = auth.uid()
    )
  );

create policy "Users can delete their shop's tasks"
  on shop_tasks for delete
  using (
    exists (
      select 1 from shop_members
      where shop_members.shop_id = shop_tasks.shop_id
      and shop_members.user_id = auth.uid()
    )
  );

-- Add indexes
create index shop_tasks_shop_id_idx on shop_tasks(shop_id);
create index shop_tasks_status_idx on shop_tasks(status);
