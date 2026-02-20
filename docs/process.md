# School Management App — Process Documentation

## Architecture Overview

```
school-app/
├── app/                      # Next.js App Router
│   ├── (auth)/login/         # Public auth pages (no layout)
│   ├── (dashboard)/          # Protected layout + pages
│   │   ├── layout.tsx        # Auth-gate + sidebar/header wrapper
│   │   └── dashboard/        # Dashboard main page
│   ├── api/auth/             # REST API routes
│   │   ├── login/route.ts
│   │   ├── register/route.ts
│   │   └── logout/route.ts
│   ├── components/           # App-specific components (NavBar, Hero, etc.)
│   ├── data/                 # Static data (school name, etc.)
│   ├── layout.tsx            # Root HTML layout
│   └── page.tsx              # Public home page
├── components/               # Shared auth/dashboard components
│   ├── sidebar.tsx           # Role-filtered navigation
│   └── header.tsx            # Top bar with logout
├── lib/                      # Server-side utilities
│   ├── auth.ts               # JWT + bcrypt helpers, Role type
│   ├── permissions.ts        # Role → allowed routes map
│   └── prisma.ts             # Prisma client singleton
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── dev.db                # SQLite database (gitignored in production)
├── proxy.ts                  # Next.js 16 middleware (route protection)
├── setup-db.mjs              # One-time DB seed script
├── .env                      # Environment variables (never commit)
└── .env.example              # Safe template for .env
```

---

## File-by-File Reference

### `prisma/schema.prisma`
Defines the database schema using Prisma ORM.

- **`User` model**: Stores all system users (admins, teachers, etc.)
  - `id`: UUID string (primary key — compatible with PostgreSQL migration)
  - `email`: Unique constraint
  - `role`: Stored as `String` (SQLite doesn't support enums; validated in app layer)
- **Note**: When migrating to PostgreSQL, add `enum Role { ... }` and change the field type.

### `lib/prisma.ts`
Singleton Prisma client to prevent multiple connections during Next.js hot reload in development.

```ts
// Pattern: reuse existing global instance in dev, create fresh in prod
const prisma = globalThis.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
```

### `lib/auth.ts`
Core authentication utilities. **Server-side only** — never imported in client components.

| Export | Description |
|--------|-------------|
| `Role` | TypeScript union type: `'SUPER_ADMIN' \| 'ADMIN' \| 'TEACHER' \| 'ACCOUNTANT'` |
| `TokenPayload` | JWT payload shape: `{ userId, role }` |
| `signToken(payload)` | Signs a JWT with 7-day expiry using `JWT_SECRET` |
| `verifyToken(token)` | Returns `TokenPayload` or `null` if invalid/expired |
| `hashPassword(pwd)` | Hashes with bcryptjs (salt rounds: 10) |
| `comparePassword(pwd, hash)` | Compares plain password against stored hash |

### `lib/permissions.ts`
Role-based access control map.

```
SUPER_ADMIN  → full access (*)
ADMIN        → dashboard, students, teachers, subjects, exams
TEACHER      → dashboard, students, attendance, exams
ACCOUNTANT   → dashboard, fees, students
```

`hasAccess(role, pathname)` returns `true` if the role can access the given path.

### `proxy.ts` (Next.js Middleware)
Runs on **every request** at the edge before the page renders. Acts as the auth gate.

**Flow:**
1. If path is public (`/`, `/login`, `/api/auth/*`) → allow through
2. Read `token` cookie
3. If no token → redirect to `/login`
4. Verify JWT via `verifyToken`; if invalid → clear cookie + redirect
5. If accessing a restricted sub-route without permission → redirect to `/dashboard`
6. Forward `x-user-id` and `x-user-role` headers to server components

### `app/api/auth/register/route.ts`
**POST** `/api/auth/register`

Creates a new user. Input validated with Zod. Password hashed with bcryptjs. Checks for duplicate email before insertion. Returns user object (without password).

### `app/api/auth/login/route.ts`
**POST** `/api/auth/login`

Authenticates a user. On success: signs a JWT and sets it as an **HTTP-only cookie** (`httpOnly`, `sameSite: lax`, 7-day maxAge). Returns user info (without password).

### `app/api/auth/logout/route.ts`
**POST** `/api/auth/logout`

Deletes the `token` cookie. Client should then redirect to `/login`.

### `app/(auth)/login/page.tsx`
Client-side login form. Uses **React Hook Form** + **Zod** for validation. Calls `/api/auth/login` and redirects to `/dashboard` on success.

### `app/(dashboard)/layout.tsx`
Server component. Reads the `token` cookie, verifies it, and fetches the current user from DB. If unauthenticated → redirects to `/login`. Wraps children with `<Sidebar>` and `<Header>`.

### `components/sidebar.tsx`
Client component. Receives `role` prop and filters navigation items to only show routes the role can access. Active link highlighted with `bg-indigo-50`.

### `components/header.tsx`
Client component. Displays logged-in user name and role. Logout button calls `/api/auth/logout` then redirects.

### `setup-db.mjs`
One-time Node.js script to initialize the SQLite database tables and seed the super admin user. Uses `better-sqlite3` directly (bypasses Prisma CLI).

```bash
npm run db:seed
```

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite file path (relative to project root) | `file:./prisma/dev.db` |
| `JWT_SECRET` | Secret key for signing JWTs. **Must be long and random in production.** | `my-very-long-secret` |

---

## Auth Flow Diagram

```
User visits /dashboard
      │
      ▼
proxy.ts (edge middleware)
      │
      ├── No token? ──────────────► Redirect /login
      │
      ├── Invalid token? ─────────► Delete cookie + Redirect /login
      │
      └── Valid token
              │
              ├── Role has access? ─► Allow + forward x-user headers
              │
              └── No access? ──────► Redirect /dashboard (root)

User visits /login
      │
      ▼
login/page.tsx (React Hook Form + Zod validation)
      │
      ▼
POST /api/auth/login
      │
      ├── Invalid input ──────────► 400 Bad Request
      ├── User not found ─────────► 401 Unauthorized
      ├── Wrong password ─────────► 401 Unauthorized
      └── Success ───────────────► Set HTTP-only cookie + 200 OK
                                         │
                                         ▼
                                   Redirect /dashboard
```

---

## Role Reference

| Role | Dashboard | Students | Teachers | Subjects | Fees | Settings |
|------|-----------|----------|----------|----------|------|----------|
| SUPER_ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ADMIN | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| TEACHER | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| ACCOUNTANT | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |

---

## PostgreSQL Migration Notes

When migrating from SQLite to PostgreSQL:

1. Change `schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }

   enum Role {
     SUPER_ADMIN
     ADMIN
     TEACHER
     ACCOUNTANT
   }

   model User {
     role Role  // Change from String to Role enum
   }
   ```
2. Update `DATABASE_URL` in `.env` to your PostgreSQL connection string
3. Run `npx prisma migrate dev --name init`
4. The `Role` type in `lib/auth.ts` can then re-import from `@prisma/client`

---

## npm Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `next dev` | Start development server |
| `npm run build` | `next build` | Build for production |
| `npm run start` | `next start` | Start production server |
| `npm run db:push` | `prisma db push` | Push schema changes to DB |
| `npm run db:generate` | `prisma generate` | Regenerate Prisma client |
| `npm run db:seed` | `node setup-db.mjs` | Seed super admin user |
