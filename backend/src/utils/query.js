// Remove characters that have special meaning in search filters.
export function cleanSearch(text) {
  return String(text).replace(/[%_,()*\\]/g, ' ').trim();
}

// Convert page + limit into the from/to numbers Supabase expects.
export function getRange(page, limit) {
  const from = (page - 1) * limit;
  return { from, to: from + limit - 1 };
}