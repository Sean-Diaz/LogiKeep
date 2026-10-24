-- =====================================================
-- LogiKeep: Indexes + automatic timestamps + auto-profile
-- =====================================================

-- ---------- INDEXES (make searches fast) ----------
create index idx_profiles_student_id   on public.profiles(student_id);
create index idx_profiles_role         on public.profiles(role);
create index idx_equipment_category    on public.equipment(category_id);
create index idx_equipment_name        on public.equipment(name);
create index idx_requests_student      on public.borrow_requests(student_id);
create index idx_requests_status       on public.borrow_requests(status);
create index idx_requests_dates        on public.borrow_requests(borrow_date, expected_return);
create index idx_items_request         on public.borrow_request_items(request_id);
create index idx_items_equipment       on public.borrow_request_items(equipment_id);
create index idx_items_facility        on public.borrow_request_items(facility_id);
create index idx_transactions_status   on public.borrow_transactions(status);
create index idx_transactions_due      on public.borrow_transactions(due_date);

-- ---------- AUTO-UPDATE updated_at ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_equipment_updated
  before update on public.equipment
  for each row execute function public.set_updated_at();

create trigger trg_facilities_updated
  before update on public.facilities
  for each row execute function public.set_updated_at();

create trigger trg_requests_updated
  before update on public.borrow_requests
  for each row execute function public.set_updated_at();

-- ---------- AUTO-CREATE A PROFILE ON SIGN-UP ----------
-- When someone registers in Supabase Auth, create their profile row.
-- IMPORTANT: new users are ALWAYS 'student'. Admins are promoted manually.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, username, full_name, student_id, program, year_section)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'username',
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'student_id', ''),
    new.raw_user_meta_data ->> 'program',
    new.raw_user_meta_data ->> 'year_section'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();