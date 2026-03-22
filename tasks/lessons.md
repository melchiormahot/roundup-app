# Lessons Learned

## Format
Each lesson follows: **Rule** > **Why** > **How to apply**

_(This file is updated after every correction or mistake. Review at session start.)_

## Drizzle ORM with better-sqlite3: use .sync()
**Rule:** Always call `.sync()` on relational queries (`db.query.*.findFirst()`, `db.query.*.findMany()`).
**Why:** Drizzle 0.45+ with the synchronous better-sqlite3 driver returns `SQLiteSyncRelationalQuery` objects, not raw results. Without `.sync()`, TypeScript cannot access properties on the result.
**How to apply:** Every `db.query.tableName.findFirst(...)` must end with `.sync()`. Core query builder methods (`.select().from()...all()`) already return results directly.

## Next.js 16: proxy.ts not middleware.ts
**Rule:** Use `proxy.ts` with `export function proxy()` instead of `middleware.ts`.
**Why:** Next.js 16 renamed the middleware convention to proxy. The old `middleware` export is deprecated and does not work.
**How to apply:** Place `proxy.ts` in `src/` root, export a named `proxy` function, and use the same `config.matcher` pattern as before.

## Next.js 16: await params in route handlers
**Rule:** Dynamic route params must be awaited: `const { id } = await params`.
**Why:** In Next.js 16, `params` is a Promise in route handlers and page components.
**How to apply:** Use `{ params }: { params: Promise<{ id: string }> }` type and `await params` before accessing properties.

## JavaScript Date: use UTC methods for date-only strings
**Rule:** When manipulating date-only strings (YYYY-MM-DD), always use UTC methods (getUTCDate, setUTCDate, getUTCMonth) and append 'T12:00:00Z' when constructing Date objects.
**Why:** `new Date('2026-03-29')` creates a UTC midnight Date, but `getDate()`/`setDate()` use local time. During DST spring-forward (e.g., March 29 in CET), `addDays` can return the same date, creating infinite loops in simulation code.
**How to apply:** Use `new Date(dateStr + 'T12:00:00Z')` and `d.getUTCDate()` / `d.setUTCDate()` for all date arithmetic on date-only strings.
