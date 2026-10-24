import { supabaseAdmin } from '../config/supabase.js';
import { dbError } from '../utils/httpError.js';
import { cleanSearch, getRange } from '../utils/query.js';

export async function listProfiles({ search, role, page, limit }) {
  let query = supabaseAdmin.from('profiles').select('*', { count: 'exact' });

  if (role) query = query.eq('role', role);
  if (search) {
    const s = cleanSearch(search);
    query = query.or(
      `full_name.ilike.%${s}%,student_id.ilike.%${s}%,email.ilike.%${s}%,program.ilike.%${s}%`
    );
  }

  const { from, to } = getRange(page, limit);
  const { data, count, error } = await query.order('full_name').range(from, to);
  if (error) throw dbError(error);
  return { data, page, limit, total: count };
}

export async function getProfile(id) {
  const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('id', id).single();
  if (error) throw dbError(error);
  return data;
}

export async function updateProfile(id, fields) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(fields)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw dbError(error);
  return data;
}