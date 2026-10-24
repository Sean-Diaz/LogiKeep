# LogiKeep 🔐📦

LogiKeep is a web-based **equipment borrowing and tracking system for schools**.
Students browse equipment and facilities, submit borrow requests, and view their
history. Admins manage inventory, approve or reject requests, check out items,
record returns, and view overdue items, history, and reports.

## Tech Stack

- **Frontend:** React 19 + Vite (JavaScript), React Router, Axios, lucide-react
- **Backend:** Express.js (Node, ES modules), zod validation
- **Database & Auth:** Supabase (PostgreSQL + Supabase Auth)
- **Extras:** dotenv, nodemon, npm

## Security Model

- The Supabase **secret key** (`sb_secret_…`) lives **only** in `backend/.env`.
  The backend talks to the database with the service-role client and re-verifies
  every request's token against Supabase Auth.
- The frontend only receives the **publishable** key (`sb_publishable_…`), used
  for Supabase Auth (sign in / sign up / password reset).
- A user's role is always read from the `profiles` table by the backend —
  never from the token or any frontend check.

## Project Structure

```
logikeep/
├── backend/        Express API (http://localhost:5000, under /api)
│   ├── scripts/getToken.js   Prints a JWT for manual API testing
│   └── src/        app, routes → validators → controllers → services
├── frontend/       React + Vite app (http://localhost:5173)
│   └── src/        components, context, hooks, pages, services, styles
├── database/       Hand-maintained Supabase SQL, run in numbered order
│   ├── 01_tables.sql
│   ├── 02_indexes_triggers.sql
│   ├── 03_functions.sql
│   ├── 04_rls.sql
│   └── 05_seed.sql
└── docs/
```

## Getting Started

### Prerequisites

- Node.js v22+ (project built on v24)
- npm
- A Supabase project (URL + publishable key + secret key)

### 1. Set up the database

In the Supabase SQL Editor, run the files in `database/` in numbered order
(01 → 05). There is no migration tool — the scripts are the schema.

### 2. Configure environment variables

Copy each example file to `.env` (both are git-ignored) and fill in your keys:

- `backend/.env` — `PORT`, `CLIENT_URL=http://localhost:5173`,
  `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (secret key),
  and `SUPABASE_ANON_KEY` (publishable key, used by `scripts/getToken.js`).
- `frontend/.env` — `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
  (publishable key), `VITE_API_URL=http://localhost:5000/api`.

> ⚠️ Never put the secret key in the frontend or in any `.env.example`.

### 3. Run the apps

```bash
# Terminal 1 — API (http://localhost:5000)
cd backend
npm install
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend
npm install
npm run dev
```

`GET /api/health` should return OK.

### Testing

No automated test suites exist. Verify with:

```bash
cd frontend
npm run lint
```

and by hitting the API manually. To get a bearer token for manual requests:

```bash
cd backend
node scripts/getToken.js <email> <password>
```

## Development Roadmap

| Stage | Scope | Status |
|---|---|---|
| 1–2 | Database schema, seed data | ✅ Done |
| 3 | Backend API (auth, profiles, categories, equipment, facilities) | ✅ Done |
| 4 | Frontend layouts, dashboards, public pages (sample data) | ✅ Done |
| 5 | Authentication (guards, profile page, password reset) | ✅ Done |
| 6 | Inventory UI (student browsing + admin management) | ⬜ Next |
| 7 | Student borrow requests | ⬜ |
| 8 | Admin approvals, checkout, returns, overdue detection | ⬜ |
| 9 | History, statistics, reports, user management | ⬜ |
| 10 | Security review + end-to-end testing | ⬜ |
