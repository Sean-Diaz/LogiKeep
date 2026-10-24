// A small helper to throw errors that carry an HTTP status code.
export function httpError(status, message, details) {
  const err = new Error(message);
  err.status = status;
  err.details = details;
  return err;
}

// Turn a Supabase/Postgres error into a friendly HTTP error.
export function dbError(error) {
  if (error.code === '23505') return httpError(409, 'That value already exists.');
  if (error.code === '23503') return httpError(409, 'This record is linked to other records.');
  if (error.code === '23514') return httpError(400, 'A value broke a database rule.');
  if (error.code === 'PGRST116') return httpError(404, 'Record not found.');
  console.error(error);
  return httpError(500, 'Database error.');
}