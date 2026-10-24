-- =====================================================
-- LogiKeep: Tables
-- =====================================================

create extension if not exists "pgcrypto";

-- ---------- PROFILES ----------
-- One row per user. Linked to Supabase Auth (auth.users).
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  student_id    text unique,
  full_name     text not null default '',
  username      text,
  email         text,
  program       text,                -- e.g. BSIT
  year_section  text,                -- e.g. 3B
  position      text not null default 'Student',
  phone         text,
  role          text not null default 'student'
                check (role in ('student', 'admin')),
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------- CATEGORIES ----------
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  description text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------- EQUIPMENT ----------
-- total_quantity = everything owned.
-- available_quantity = what can still be borrowed right now.
create table public.equipment (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  description         text,
  category_id         uuid references public.categories(id) on delete set null,
  image_url           text,
  total_quantity      integer not null default 0 check (total_quantity >= 0),
  available_quantity  integer not null default 0 check (available_quantity >= 0),
  is_active           boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint equipment_available_within_total
    check (available_quantity <= total_quantity)
);

-- ---------- FACILITIES ----------
-- Courts, laboratory, gymnasium. Same quantity logic as equipment.
create table public.facilities (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null unique,
  description         text,
  location            text,
  image_url           text,
  total_quantity      integer not null default 1 check (total_quantity >= 0),
  available_quantity  integer not null default 1 check (available_quantity >= 0),
  is_active           boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint facilities_available_within_total
    check (available_quantity <= total_quantity)
);

-- ---------- BORROW REQUESTS ----------
-- One request = one student asking, with dates and a purpose.
create table public.borrow_requests (
  id                 uuid primary key default gen_random_uuid(),
  student_id         uuid not null references public.profiles(id) on delete restrict,
  purpose            text,
  borrow_date        date not null,
  expected_return    date not null,
  status             text not null default 'pending'
                     check (status in (
                       'pending','approved','rejected','cancelled',
                       'borrowed','returned','overdue'
                     )),
  admin_notes        text,
  approved_by        uuid references public.profiles(id),
  approved_at        timestamptz,
  rejected_by        uuid references public.profiles(id),
  rejected_at        timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint dates_valid check (expected_return >= borrow_date)
);

-- ---------- BORROW REQUEST ITEMS ----------
-- The items in a request. Each row is EITHER equipment OR a facility.
create table public.borrow_request_items (
  id            uuid primary key default gen_random_uuid(),
  request_id    uuid not null references public.borrow_requests(id) on delete cascade,
  equipment_id  uuid references public.equipment(id) on delete restrict,
  facility_id   uuid references public.facilities(id) on delete restrict,
  quantity      integer not null check (quantity > 0),
  created_at    timestamptz not null default now(),
  constraint exactly_one_target check (
    (equipment_id is not null and facility_id is null) or
    (equipment_id is null and facility_id is not null)
  )
);

-- ---------- BORROW TRANSACTIONS ----------
-- Created when an admin hands the items over (checkout).
create table public.borrow_transactions (
  id               uuid primary key default gen_random_uuid(),
  request_id       uuid not null unique references public.borrow_requests(id) on delete restrict,
  checked_out_by   uuid not null references public.profiles(id),
  checked_out_at   timestamptz not null default now(),
  due_date         date not null,
  status           text not null default 'borrowed'
                   check (status in ('borrowed','returned','overdue')),
  created_at       timestamptz not null default now()
);

-- ---------- RETURN RECORDS ----------
-- Created when an admin records the return.
create table public.return_records (
  id               uuid primary key default gen_random_uuid(),
  transaction_id   uuid not null unique references public.borrow_transactions(id) on delete restrict,
  returned_at      timestamptz not null default now(),
  received_by      uuid not null references public.profiles(id),
  condition_notes  text,
  was_late         boolean not null default false,
  created_at       timestamptz not null default now()
);