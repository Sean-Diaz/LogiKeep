import { supabaseAdmin } from '../config/supabase.js';
import { httpError } from '../utils/httpError.js';

// Runs before protected routes. Verifies the token and loads the user's profile.
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw httpError(401, 'You must be logged in.');
  }

  // Ask Supabase Auth whether this token is real and not expired.
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) {
    throw httpError(401, 'Your session is invalid or has expired.');
  }

  // Load the role from OUR database, never from the token or the request body.
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile) throw httpError(403, 'Profile not found.');
  if (!profile.is_active) throw httpError(403, 'This account has been deactivated.');

  req.user = { id: profile.id, email: profile.email, role: profile.role, profile };
  next();
}

// Use after requireAuth. Example: requireRole('admin')
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw httpError(403, 'You do not have permission to do this.');
    }
    next();
  };
}