import { supabaseAdmin } from '../config/supabase.js';
import { dbError } from '../utils/httpError.js';

export async function list(req, res) {
  let query = supabaseAdmin.from('categories').select('*').order('name');
  const admin = req.user.role === 'admin' && req.query.include_inactive === 'true';
  if (!admin) query = query.eq('is_active', true);

  const { data, error } = await query;
  if (error) throw dbError(error);
  res.json({ data });
}

export async function create(req, res) {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .insert(req.valid.body)
    .select('*')
    .single();
  if (error) throw dbError(error);
  res.status(201).json(data);
}

export async function update(req, res) {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .update(req.valid.body)
    .eq('id', req.valid.params.id)
    .select('*')
    .single();
  if (error) throw dbError(error);
  res.json(data);
}

export async function remove(req, res) {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .update({ is_active: false })
    .eq('id', req.valid.params.id)
    .select('*')
    .single();
  if (error) throw dbError(error);
  res.json({ message: 'Deactivated.', category: data });
}