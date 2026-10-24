-- =====================================================
-- LogiKeep: Starter data (matches your mockups)
-- =====================================================

insert into public.categories (name, description) values
  ('Furniture',      'Chairs, tables and similar items'),
  ('Sports Gear',    'Nets, balls and sports equipment'),
  ('Lab Equipment',  'Laboratory tools and devices'),
  ('Audio Visual',   'Projectors, speakers, microphones');

insert into public.equipment (name, description, category_id, total_quantity, available_quantity)
select 'Chair', 'Plastic monobloc chair', id, 156, 112 from public.categories where name = 'Furniture';

insert into public.equipment (name, description, category_id, total_quantity, available_quantity)
select 'Table', 'Folding table', id, 67, 34 from public.categories where name = 'Furniture';

insert into public.equipment (name, description, category_id, total_quantity, available_quantity)
select 'Volleyball Net', 'Standard volleyball net', id, 1, 1 from public.categories where name = 'Sports Gear';

insert into public.facilities (name, description, location, total_quantity, available_quantity) values
  ('Basketball Court', 'Covered outdoor court',     'Campus grounds', 1, 1),
  ('Laboratory',       'Computer laboratory',       'IT Building',    1, 0),
  ('Volleyball Court', 'Outdoor volleyball court',  'Campus grounds', 1, 1),
  ('Badminton Court',  'Indoor badminton courts',   'Gymnasium',      2, 1),
  ('Gymnasium',        'Main school gymnasium',     'Main building',  1, 1);