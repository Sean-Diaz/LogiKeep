# AGENTS.md

## Layout

- Two independent npm apps: `backend/` (Express 5 API) and `frontend/` (React 19 + Vite). No root
  package.json or workspaces — run all commands inside the respective folder.
- `database/` is hand-maintained Supabase SQL applied in numbered order (01_tables → 05_seed).
  No migration tool; edit these files to change the schema. `frontend/README.md` is Vite
  boilerplate; ignore it.

## Commands

- Backend: `npm run dev` (nodemon, src/server.js, port 5000). No build/lint/test scripts exist.
- Frontend: `npm run dev` (Vite, port 5173), `npm run build`, `npm run lint`.
- No tests exist anywhere. Verification = frontend `npm run lint` + manually hitting the API
  (`GET /api/health`).

## Environment

- Both apps load env via `import 'dotenv/config'`. Backend needs `PORT`, `CLIENT_URL` (CORS expects
  the Vite origin http://localhost:5173), `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- `backend/scripts/getToken.js <email> <password>` (prints a JWT for manual API testing)
  additionally requires `SUPABASE_ANON_KEY` (present in `.env.example`; needs the publishable key).
- Frontend needs `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`
  (http://localhost:5000/api). Vite has no dev proxy — the frontend calls the API cross-origin
  directly.

## Architecture

- Auth: frontend authenticates with Supabase Auth (anon key); `frontend/src/services/api.js`
  attaches the Bearer token; `backend/src/middleware/auth.js` re-verifies it with
  `supabaseAdmin.auth.getUser()` and loads role/is_active from `profiles`. Never source a user's
  role from the token or request body.
- Backend talks to Supabase only through the service-role client (`src/config/supabase.js`,
  bypasses RLS). Direct frontend Supabase calls are governed by RLS in `database/04_rls.sql`.
- Backend layering: routes → zod validators → `validate(reqField)` middleware → controller.
  Inventory controllers are generic (`makeInventoryController('equipment' | 'facilities')`);
  allowed tables are whitelisted in `inventoryService.js` (`SELECTS` map).
- Both apps are ESM (`"type": "module"`); backend imports need explicit `.js` extensions.
- Express 5 forwards async rejections to `middleware/errorHandler.js`; raise errors via
  `httpError`/`dbError` from `src/utils/httpError.js`.
- Route order matters: `router.use(requireAuth)` first; `requireRole('admin')` before
  `validate(...)` on writes.

## Data invariants (DB-enforced — don't bypass in app code)

- `profiles.role` is only `'student' | 'admin'`; a trigger blocks role changes.
- `equipment`/`facilities`: `available_quantity ≤ total_quantity` (CHECK constraint); keep both
  in sync.
- Borrow-request/transaction/return tables exist in the schema but have no backend routes yet —
  don't assume endpoints for them.

## Gotchas

- Git is set up with remote `origin` = github.com/Sean-Diaz/LogiKeep (branch `main`, tracking
  `origin/main`). Always confirm `.env` stays untracked before committing.
- Supabase secret keys (`sb_secret_…` / service role) must never appear in the frontend, its
  `.env`, or `.env.example`. Frontend clients use only the publishable anon key.
