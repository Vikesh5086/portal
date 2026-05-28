# Thapar Student Portal

An exact visual clone of the Thapar Institute of Engineering & Technology student portal (campus.thapar.edu). Students can log in, view enrolled courses, check assignment grades, and admins can manage students, courses, enrollments, and marks.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/thapar-portal run dev` — run the frontend (port 18672)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 + express-session
- DB: SQLite via better-sqlite3 (thapar.db at workspace root)
- Frontend: React + Vite + Tailwind CSS + Wouter routing
- Validation: Zod (zod/v4), drizzle-zod
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth)
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod schemas used by server
- `artifacts/api-server/src/` — Express server (app.ts, routes/)
- `artifacts/api-server/src/db/sqlite.ts` — SQLite setup, schema init, seed data
- `artifacts/thapar-portal/src/` — React frontend
- `artifacts/thapar-portal/src/pages/` — login, homepage, assignments, grades, admin
- `artifacts/thapar-portal/src/contexts/AuthContext.tsx` — auth state
- `artifacts/thapar-portal/public/campus.jpg` — campus building image used in login

## Architecture decisions

- SQLite (better-sqlite3) used instead of PostgreSQL — simpler for a single-server portal clone
- Session-based auth via express-session with SESSION_SECRET env var
- Campus image served as a static file from the public folder, referenced as /campus.jpg
- All CSS variables set to exact Thapar colors (maroon #8B1A1A, dark nav #2d2d2d, etc.)
- Font is Arial throughout to match original portal

## Product

- **Login page**: Exact clone with split campus image background and white login card
- **Student Homepage**: Dark nav, colorful mosaic banner, 13-tile grid
- **View Assignments & Grades**: Course list table with blue link rows, breadcrumb nav
- **Class Grades Detail**: Assignment table with mark calculation (midterm + overall %)
- **Admin Panel**: Manage students, courses, enrollments, assignments, marks

## Default credentials

- Student: `102203001` / `student123` (VIKESH KUMAR)
- Admin: `ADMIN001` / `admin123`

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Run `pnpm install` first if better-sqlite3 native build is missing
- `thapar.db` is created automatically on first API server start with seeded data
- After OpenAPI spec changes, always run codegen before editing routes or frontend
- Cookies require `credentials: 'include'` — already set in custom-fetch.ts

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
