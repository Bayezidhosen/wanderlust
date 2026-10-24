<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Wanderlust

Next.js 16 App Router + React 19 + TypeScript + Tailwind v4. All source is under `src/` (the README's `app/page.tsx` references are stale). The app itself is still near-blank (`src/app/page.tsx` is empty); a full shadcn UI kit is pre-installed for building pages.

## Commands

- Dev: `npm run dev` (Turbopack). Build: `npm run build`. No test script or test framework exists.
- Typecheck: `npx tsc --noEmit`. On a fresh clone, run `next dev` or `next build` first — route/layout prop types like `LayoutProps<"/">` are generated into `.next/dev/types`, which `tsconfig.json` includes.
- Lint: `npm run lint` (bare `eslint`, lints the whole repo). It currently **exits 1** with two pre-existing `react-hooks/set-state-in-effect` errors in `src/components/ui/carousel.tsx` and `src/hooks/use-mobile.ts`. Treat these as the baseline: don't assume lint was clean, and don't leave additional new errors behind.

## Framework quirks (verified in `next.config.ts`)

- `reactCompiler: true` — don't defensively add `useMemo`/`useCallback`/`React.memo`; React Compiler lint rules are active in eslint-config-next.
- `cacheComponents: true` + `partialPrefetching: true` — caching/prefetch behavior differs from plain App Router defaults; consult `node_modules/next/dist/docs/` (01-app) before relying on default caching assumptions.

## UI stack

- shadcn components use the **base-nova style built on Base UI (`@base-ui/react`), not Radix** — don't import Radix primitives. ~70 components already exist in `src/components/ui/`; check there before hand-rolling one. Add new components via the shadcn CLI — `components.json` defines style, base color, icon library (lucide), and aliases (`@/components`, `@/lib/utils`, `@/hooks`).
- Tailwind v4 is CSS-first: there is no `tailwind.config`. Theme tokens and variants live in `src/app/globals.css`; Tailwind loads through a Turbopack rule in `next.config.ts`.
- Path alias: `@/*` → `src/*`.
