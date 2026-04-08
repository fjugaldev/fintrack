-- ============================================================
-- FinTrack — Setup SQL para Supabase
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Trigger: crear profile automáticamente al registrarse un usuario
-- La función usa security definer con search_path explícito para evitar
-- ataques de search_path hijacking (Supabase best practice).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, user_id, full_name, avatar_url)
  values (
    new.id,
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing; -- idempotente: no falla si el profile ya existe
  return new;
end;
$$;

-- Registrar el trigger en auth.users (tabla de Supabase Auth)
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 2. Índices
-- ============================================================

-- Índice en user_id — necesario para Fase 3 (multi-perfil familiar)
-- y para evitar seq scan en consultas por user_id
create index if not exists profiles_user_id_idx
  on public.profiles(user_id);

-- ============================================================
-- 3. Row Level Security (RLS)
-- ============================================================

alter table public.profiles enable row level security;

-- El propietario puede leer y actualizar su propio perfil.
-- En MVP: id = auth.uid() (relación 1:1 con auth.users)
create policy "profiles: el propietario puede leer y actualizar su perfil"
  on public.profiles
  for all
  using (id = auth.uid())
  with check (id = auth.uid());

-- ============================================================
-- 4. RLS para tablas de dominio
-- ============================================================

-- financial_accounts
alter table public.financial_accounts enable row level security;

create policy "financial_accounts: propietario"
  on public.financial_accounts for all
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- categories
alter table public.categories enable row level security;

create policy "categories: propietario"
  on public.categories for all
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- transactions
alter table public.transactions enable row level security;

create policy "transactions: propietario"
  on public.transactions for all
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- transaction_tags (sin profile_id directa: join a transactions)
alter table public.transaction_tags enable row level security;

create policy "transaction_tags: propietario"
  on public.transaction_tags for all
  using (
    (select profile_id from public.transactions where id = transaction_id) = auth.uid()
  )
  with check (
    (select profile_id from public.transactions where id = transaction_id) = auth.uid()
  );

-- budgets
alter table public.budgets enable row level security;

create policy "budgets: propietario"
  on public.budgets for all
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- recurring_transactions
alter table public.recurring_transactions enable row level security;

create policy "recurring_transactions: propietario"
  on public.recurring_transactions for all
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- savings_goals
alter table public.savings_goals enable row level security;

create policy "savings_goals: propietario"
  on public.savings_goals for all
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- products
alter table public.products enable row level security;

create policy "products: propietario"
  on public.products for all
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- price_history
alter table public.price_history enable row level security;

create policy "price_history: propietario"
  on public.price_history for all
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());
