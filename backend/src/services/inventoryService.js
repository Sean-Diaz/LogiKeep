import { supabaseAdmin } from '../config/supabase.js';
import { httpError, dbError } from '../utils/httpError.js';
import { cleanSearch, getRange } from '../utils/query.js';

// Only these two tables can ever be used here.
const SELECTS = {
  equipment: '*, category:categories(id, name)',
  facilities: '*',
};

function selectFor(table) {
  if (!SELECTS[table]) throw new Error(`Unknown inventory table: ${table}`);
  return SELECTS[table];
}

export async function listItems(table, f) {
  let query = supabaseAdmin.from(table).select(selectFor(table), { count: 'exact' });

  if (!f.includeInactive) query = query.eq('is_active', true);
  if (f.search) query = query.ilike('name', `%${cleanSearch(f.search)}%`);
  if (f.categoryId && table === 'equipment') query = query.eq('category_id', f.categoryId);
  if (f.availableOnly) query = query.gt('available_quantity', 0);

  const { from, to } = getRange(f.page, f.limit);
  const { data, count, error } = await query.order('name').range(from, to);
  if (error) throw dbError(error);

  return { data, page: f.page, limit: f.limit, total: count };
}

export async function getItem(table, id, includeInactive = false) {
  let query = supabaseAdmin.from(table).select(selectFor(table)).eq('id', id);
  if (!includeInactive) query = query.eq('is_active', true);

  const { data, error } = await query.single();
  if (error) throw dbError(error);
  return data;
}

export async function createItem(table, input) {
  const total = input.total_quantity ?? (table === 'facilities' ? 1 : 0);
  const row = { ...input, total_quantity: total, available_quantity: total };

  const { data, error } = await supabaseAdmin
    .from(table)
    .insert(row)
    .select(selectFor(table))
    .single();
  if (error) throw dbError(error);
  return data;
}

export async function updateItem(table, id, input) {
  const current = await getItem(table, id, true);
  const changes = { ...input };

  // If the total changes, keep the "currently borrowed" amount the same.
  if (input.total_quantity !== undefined) {
    const borrowed = current.total_quantity - current.available_quantity;
    const newAvailable = input.total_quantity - borrowed;
    if (newAvailable < 0) {
      throw httpError(409, `${borrowed} are currently out. Total cannot be less than ${borrowed}.`);
    }
    changes.available_quantity = newAvailable;
  }

  const { data, error } = await supabaseAdmin
    .from(table)
    .update(changes)
    .eq('id', id)
    .select(selectFor(table))
    .single();
  if (error) throw dbError(error);
  return data;
}

// "Delete" = deactivate, so history stays intact.
export async function deactivateItem(table, id) {
  const current = await getItem(table, id, true);
  if (current.total_quantity !== current.available_quantity) {
    throw httpError(409, 'This item is borrowed or reserved. It cannot be deactivated yet.');
  }
  return updateItem(table, id, { is_active: false });
}