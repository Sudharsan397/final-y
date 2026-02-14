
-- 1. Drop the old tables to start fresh
drop table if exists public.transactions cascade;
drop table if exists public.inventory cascade;
drop table if exists public.users cascade;

-- 2. Create the profiles table correctly
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  name text not null,
  email text not null,
  role text not null,
  enabled boolean default true
);

-- 3. Create a function to handle new user signups
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, name, email, role, enabled)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'name', 'New User'), 
    new.email, 
    coalesce(new.raw_user_meta_data->>'role', 'IMPORTER'),
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- 4. Create the trigger
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Create Inventory Table
create table public.inventory (
  id text primary key,
  name text not null,
  price numeric not null,
  quantity integer not null,
  updated_at timestamp with time zone default now()
);

-- 6. Create Transactions Table (Standardized column names)
create table public.transactions (
  id text primary key,
  type text not null,
  product_id text not null,
  product_name text not null,
  quantity integer not null,
  price numeric not null,
  user_id uuid references public.users(id) on delete set null,
  user_name text not null,
  timestamp timestamp with time zone default now()
);

-- 7. Disable RLS for ease of use
alter table public.users disable row level security;
alter table public.inventory disable row level security;
alter table public.transactions disable row level security;
