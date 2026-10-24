-- =====================================================
-- LogiKeep: Business-logic functions
-- These are called ONLY by the Express backend (service role).
-- =====================================================

-- ---------- 1. CREATE A BORROW REQUEST ----------
-- p_items example:
-- [{"equipment_id":"<uuid>","quantity":2}, {"facility_id":"<uuid>","quantity":1}]
create or replace function public.create_borrow_request(
  p_student_id      uuid,
  p_purpose         text,
  p_borrow_date     date,
  p_expected_return date,
  p_items           jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request_id uuid;
  v_item       jsonb;
  v_qty        integer;
  v_available  integer;
  v_active     boolean;
begin
  if p_borrow_date < current_date then
    raise exception 'Borrow date cannot be in the past.';
  end if;
  if p_expected_return < p_borrow_date then
    raise exception 'Expected return date cannot be before the borrow date.';
  end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'A request needs at least one item.';
  end if;

  if not exists (
    select 1 from profiles where id = p_student_id and is_active
  ) then
    raise exception 'Account is inactive or does not exist.';
  end if;

  insert into borrow_requests (student_id, purpose, borrow_date, expected_return)
  values (p_student_id, p_purpose, p_borrow_date, p_expected_return)
  returning id into v_request_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item ->> 'quantity')::integer;
    if v_qty is null or v_qty <= 0 then
      raise exception 'Quantity must be a positive number.';
    end if;

    if (v_item ->> 'equipment_id') is not null then
      select available_quantity, is_active into v_available, v_active
      from equipment where id = (v_item ->> 'equipment_id')::uuid;
      if not found or not v_active then
        raise exception 'Equipment is not available.';
      end if;
      if v_qty > v_available then
        raise exception 'Requested quantity exceeds available stock.';
      end if;
      insert into borrow_request_items (request_id, equipment_id, quantity)
      values (v_request_id, (v_item ->> 'equipment_id')::uuid, v_qty);

    elsif (v_item ->> 'facility_id') is not null then
      select available_quantity, is_active into v_available, v_active
      from facilities where id = (v_item ->> 'facility_id')::uuid;
      if not found or not v_active then
        raise exception 'Facility is not available.';
      end if;
      if v_qty > v_available then
        raise exception 'Requested quantity exceeds available stock.';
      end if;
      insert into borrow_request_items (request_id, facility_id, quantity)
      values (v_request_id, (v_item ->> 'facility_id')::uuid, v_qty);

    else
      raise exception 'Each item needs an equipment_id or a facility_id.';
    end if;
  end loop;

  return v_request_id;
end;
$$;

-- ---------- 2. APPROVE A REQUEST ----------
-- Locks every item row, re-checks stock, then RESERVES it (subtracts available).
create or replace function public.approve_borrow_request(
  p_request_id uuid,
  p_admin_id   uuid,
  p_notes      text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status    text;
  v_item      record;
  v_available integer;
begin
  select status into v_status
  from borrow_requests where id = p_request_id for update;

  if not found then
    raise exception 'Request not found.';
  end if;
  if v_status <> 'pending' then
    raise exception 'Only pending requests can be approved.';
  end if;

  if not exists (
    select 1 from profiles where id = p_admin_id and role = 'admin' and is_active
  ) then
    raise exception 'Only an active administrator can approve requests.';
  end if;

  for v_item in
    select * from borrow_request_items
    where request_id = p_request_id
    order by coalesce(equipment_id, facility_id)   -- consistent lock order
  loop
    if v_item.equipment_id is not null then
      select available_quantity into v_available
      from equipment where id = v_item.equipment_id for update;
      if v_available < v_item.quantity then
        raise exception 'Not enough stock to approve this request.';
      end if;
      update equipment
         set available_quantity = available_quantity - v_item.quantity
       where id = v_item.equipment_id;
    else
      select available_quantity into v_available
      from facilities where id = v_item.facility_id for update;
      if v_available < v_item.quantity then
        raise exception 'Not enough stock to approve this request.';
      end if;
      update facilities
         set available_quantity = available_quantity - v_item.quantity
       where id = v_item.facility_id;
    end if;
  end loop;

  update borrow_requests
     set status = 'approved',
         approved_by = p_admin_id,
         approved_at = now(),
         admin_notes = coalesce(p_notes, admin_notes)
   where id = p_request_id;
end;
$$;

-- ---------- 3. REJECT A REQUEST ----------
create or replace function public.reject_borrow_request(
  p_request_id uuid,
  p_admin_id   uuid,
  p_notes      text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
begin
  select status into v_status
  from borrow_requests where id = p_request_id for update;

  if not found then
    raise exception 'Request not found.';
  end if;
  if v_status <> 'pending' then
    raise exception 'Only pending requests can be rejected.';
  end if;
  if not exists (
    select 1 from profiles where id = p_admin_id and role = 'admin' and is_active
  ) then
    raise exception 'Only an active administrator can reject requests.';
  end if;

  update borrow_requests
     set status = 'rejected',
         rejected_by = p_admin_id,
         rejected_at = now(),
         admin_notes = coalesce(p_notes, admin_notes)
   where id = p_request_id;
end;
$$;

-- ---------- 4. CANCEL A REQUEST (student, pending only) ----------
create or replace function public.cancel_borrow_request(
  p_request_id uuid,
  p_student_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status  text;
  v_owner   uuid;
begin
  select status, student_id into v_status, v_owner
  from borrow_requests where id = p_request_id for update;

  if not found then
    raise exception 'Request not found.';
  end if;
  if v_owner <> p_student_id then
    raise exception 'You can only cancel your own requests.';
  end if;
  if v_status <> 'pending' then
    raise exception 'Only pending requests can be cancelled.';
  end if;

  update borrow_requests set status = 'cancelled' where id = p_request_id;
end;
$$;

-- ---------- 5. CHECK OUT (hand items over) ----------
-- Stock was already reserved at approval, so we only record the handover.
create or replace function public.checkout_borrow_request(
  p_request_id uuid,
  p_admin_id   uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status   text;
  v_due      date;
  v_tx_id    uuid;
begin
  select status, expected_return into v_status, v_due
  from borrow_requests where id = p_request_id for update;

  if not found then
    raise exception 'Request not found.';
  end if;
  if v_status <> 'approved' then
    raise exception 'Only approved requests can be checked out.';
  end if;
  if not exists (
    select 1 from profiles where id = p_admin_id and role = 'admin' and is_active
  ) then
    raise exception 'Only an active administrator can check out items.';
  end if;

  insert into borrow_transactions (request_id, checked_out_by, due_date)
  values (p_request_id, p_admin_id, v_due)
  returning id into v_tx_id;

  update borrow_requests set status = 'borrowed' where id = p_request_id;

  return v_tx_id;
end;
$$;

-- ---------- 6. RETURN ITEMS ----------
-- Puts the reserved quantities back into available stock.
create or replace function public.return_borrow_request(
  p_transaction_id uuid,
  p_admin_id       uuid,
  p_condition      text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tx      borrow_transactions%rowtype;
  v_item    record;
  v_late    boolean;
begin
  select * into v_tx
  from borrow_transactions where id = p_transaction_id for update;

  if not found then
    raise exception 'Transaction not found.';
  end if;
  if v_tx.status = 'returned' then
    raise exception 'These items were already returned.';
  end if;
  if not exists (
    select 1 from profiles where id = p_admin_id and role = 'admin' and is_active
  ) then
    raise exception 'Only an active administrator can record returns.';
  end if;

  for v_item in
    select * from borrow_request_items
    where request_id = v_tx.request_id
    order by coalesce(equipment_id, facility_id)
  loop
    if v_item.equipment_id is not null then
      update equipment
         set available_quantity = least(total_quantity, available_quantity + v_item.quantity)
       where id = v_item.equipment_id;
    else
      update facilities
         set available_quantity = least(total_quantity, available_quantity + v_item.quantity)
       where id = v_item.facility_id;
    end if;
  end loop;

  v_late := current_date > v_tx.due_date;

  insert into return_records (transaction_id, received_by, condition_notes, was_late)
  values (p_transaction_id, p_admin_id, p_condition, v_late);

  update borrow_transactions set status = 'returned' where id = p_transaction_id;
  update borrow_requests     set status = 'returned' where id = v_tx.request_id;
end;
$$;

-- ---------- 7. MARK OVERDUE ----------
-- Run this before listing overdue items. Safe to call many times.
create or replace function public.mark_overdue_requests()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  update borrow_transactions
     set status = 'overdue'
   where status = 'borrowed' and due_date < current_date;
  get diagnostics v_count = row_count;

  update borrow_requests r
     set status = 'overdue'
    from borrow_transactions t
   where t.request_id = r.id and t.status = 'overdue' and r.status = 'borrowed';

  return v_count;
end;
$$;

-- ---------- 8. CANCEL AN APPROVED-BUT-NOT-COLLECTED REQUEST ----------
-- Gives the reserved stock back if an admin cancels before checkout.
create or replace function public.release_approved_request(
  p_request_id uuid,
  p_admin_id   uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_item   record;
begin
  select status into v_status
  from borrow_requests where id = p_request_id for update;

  if not found then
    raise exception 'Request not found.';
  end if;
  if v_status <> 'approved' then
    raise exception 'Only approved (not yet checked out) requests can be released.';
  end if;
  if not exists (
    select 1 from profiles where id = p_admin_id and role = 'admin' and is_active
  ) then
    raise exception 'Only an active administrator can release requests.';
  end if;

  for v_item in
    select * from borrow_request_items
    where request_id = p_request_id
    order by coalesce(equipment_id, facility_id)
  loop
    if v_item.equipment_id is not null then
      update equipment
         set available_quantity = least(total_quantity, available_quantity + v_item.quantity)
       where id = v_item.equipment_id;
    else
      update facilities
         set available_quantity = least(total_quantity, available_quantity + v_item.quantity)
       where id = v_item.facility_id;
    end if;
  end loop;

  update borrow_requests set status = 'cancelled' where id = p_request_id;
end;
$$;

-- ---------- LOCK DOWN WHO CAN CALL THESE ----------
-- Browsers (anon / authenticated roles) must NOT call these directly.
revoke execute on function public.create_borrow_request(uuid,text,date,date,jsonb) from public, anon, authenticated;
revoke execute on function public.approve_borrow_request(uuid,uuid,text)           from public, anon, authenticated;
revoke execute on function public.reject_borrow_request(uuid,uuid,text)            from public, anon, authenticated;
revoke execute on function public.cancel_borrow_request(uuid,uuid)                 from public, anon, authenticated;
revoke execute on function public.checkout_borrow_request(uuid,uuid)               from public, anon, authenticated;
revoke execute on function public.return_borrow_request(uuid,uuid,text)            from public, anon, authenticated;
revoke execute on function public.mark_overdue_requests()                          from public, anon, authenticated;
revoke execute on function public.release_approved_request(uuid,uuid)              from public, anon, authenticated;