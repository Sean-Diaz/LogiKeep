import { supabaseAdmin } from '../config/supabase.js';

export async function checkHealth(req, res) {
  // Ask Supabase Auth for 1 user. If the keys are wrong, this fails.
  const { error } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1,
  });

  if (error) {
    return res.status(500).json({
      status: 'error',
      server: 'running',
      database: 'not connected',
      message: error.message,
    });
  }

  res.json({
    status: 'ok',
    server: 'running',
    database: 'connected',
    time: new Date().toISOString(),
  });
}