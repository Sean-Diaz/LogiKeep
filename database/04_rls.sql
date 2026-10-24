-- =====================================================
-- LogiKeep: Row Level Security
-- =====================================================

-- Helper: is the current user an active admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_active
  );
$$;

-- Turn RLS on for every table
alter table public.profiles             enable row level security;
alter table public.categories           enable row level security;
alter table public.equipment            enable row level security;
alter table public.facilities           enable row level security;
alter table public.borrow_requests      enable row level security;
alter table public.borrow_request_items enable row level security;
alter table public.borrow_transactions  enable row level security;
alter table public.return_records       enable row level security;

-- ---------- PROFILES ----------
create policy "profiles_select_own_or_admin"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());

-- Students may update their own row. A trigger below blocks role changes.
create policy "profiles_update_own_or_admin"
  on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- ---------- CATEGORIES (everyone logged in can read; only admin writes) ----------
create policy "categories_select_all"
  on public.categories for select to authenticated using (true);
create policy "categories_admin_write"
  on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- EQUIPMENT ----------
create policy "equipment_select_all"
  on public.equipment for select to authenticated using (true);
create policy "equipment_admin_write"
  on public.equipment for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- FACILITIES ----------
create policy "facilities_select_all"
  on public.facilities for select to authenticated using (true);
create policy "facilities_admin_write"
  on public.facilities for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- BORROW REQUESTS ----------
-- Students can only READ their own. All writes go through the backend functions.
create policy "requests_select_own_or_admin"
  on public.borrow_requests for select to authenticated
  using (student_id = auth.uid() or public.is_admin());

-- ---------- REQUEST ITEMS ----------
create policy "items_select_own_or_admin"
  on public.borrow_request_items for select to authenticated
  using (
    public.is_admin() or exists (
      select 1 from public.borrow_requests r
      where r.id = request_id and r.student_id = auth.uid()
    )
  );

-- ---------- TRANSACTIONS ----------
create policy "transactions_select_own_or_admin"
  on public.borrow_transactions for select to authenticated
  using (
    public.is_admin() or exists (
      select 1 from public.borrow_requests r
      where r.id = request_id and r.student_id = auth.uid()
    )
  );

-- ---------- RETURN RECORDS ----------
create policy "returns_select_own_or_admin"
  on public.return_records for select to authenticated
  using (
    public.is_admin() or exists (
      select 1
      from public.borrow_transactions t
      join public.borrow_requests r on r.id = t.request_id
      where t.id = transaction_id and r.student_id = auth.uid()
    )
  );

-- ---------- BLOCK STUDENTS FROM CHANGING THEIR OWN ROLE ----------
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- auth.uid() is null when the service role (our backend) makes the change.
  if auth.uid() is not null and not public.is_admin() then
    if new.role      is distinct from old.role
    or new.is_active is distinct from old.is_active
    or new.student_id is distinct from old.student_id then
      raise exception 'You are not allowed to change role, status or student ID.';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_profiles_no_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();