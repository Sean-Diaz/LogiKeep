import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const [, , email, password] = process.argv;
if (!email || !password) {
  console.error('Usage: node scripts/getToken.js <email> <password>');
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const { data, error } = await supabase.auth.signInWithPassword({ email, password });

if (error) {
  console.error('Login failed:', error.message);
  process.exit(1);
}
console.log(data.session.access_token);