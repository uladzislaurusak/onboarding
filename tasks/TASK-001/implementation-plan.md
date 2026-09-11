# TASK-001: Implementation Plan

## Current Behavior

`my-app/` is the unmodified Vite `react-ts` scaffold (`src/App.tsx` renders a demo counter and links). There is no data fetching, no routing/state library, no test runner, and no HTTP mock library.

## Intended Behavior

Loading the app requests training sessions from a mocked HTTP boundary and shows a loading state, then a list (title, status, start date/time) filterable by `All` or one status. A create form validates a trimmed 3-80 char title and a future date/time, disables itself while submitting, and appends the created session to the visible list on success. A failed sessions request shows a recoverable error state with a retry action. One behavior-level test covers filtering or creation.

## Preconditions And Confirmed Decisions

- `tasks/TASK-001/requirements.md` is accepted and ready (see its Assumptions/Open Questions — status values and form placement are implementation judgment calls, not blockers).
- Test framework: **Vitest** + **React Testing Library** + **@testing-library/user-event**, run in `jsdom`. Vitest is chosen because it shares Vite's config/transform pipeline already present in `my-app/`, avoiding a second build toolchain.
- Mock boundary: **MSW** (`msw`), per TASK.md's explicit fallback ("If none exists, MSW or another conventional HTTP mock is acceptable"). Application code calls a plain `fetch`-based client; MSW intercepts at the network layer for both the running app (dev-only mock start) and tests, so the client itself contains no mock branching.
- Status values (implementation judgment, per requirements Assumption): `scheduled`, `completed`, `cancelled`. Filter offers `All` + these three, satisfying "one status filter" (one filter control) with a small conventional set.
- Newly created sessions default to `scheduled`.
- Form placement (implementation judgment): inline toggle on the same page (an "Add session" button reveals the form; no routing or modal library needed) — simplest option consistent with no router/modal library being installed.

## Ordered File Changes

1. **`my-app/package.json`** — add devDependencies (`vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `msw`) and one `"test": "vitest run"` script. No changes to existing scripts.
2. **`my-app/vite.config.ts`** — add a `test` block (`environment: 'jsdom'`, `setupFiles: './src/test/setup.ts'`, `globals: true`) alongside the existing plugin config. No unrelated config changes.
3. **`my-app/src/test/setup.ts`** *(new)* — imports `@testing-library/jest-dom`; starts/resets/stops the MSW test server around the test run.
4. **`my-app/src/types/session.ts`** *(new)* — `SessionStatus` union (`'scheduled' | 'completed' | 'cancelled'`) and `Session` (`id`, `title`, `status`, `startsAt: string` ISO datetime).
5. **`my-app/src/api/sessionsClient.ts`** *(new)* — the replaceable HTTP boundary: `fetchSessions(): Promise<Session[]>` and `createSession(input: { title: string; startsAt: string }): Promise<Session>`, both plain `fetch` calls against `/api/sessions`. No mock logic lives here.
6. **`my-app/src/mocks/handlers.ts`** *(new)* — MSW request handlers for `GET /api/sessions` and `POST /api/sessions` backed by an in-memory array seeded with 2-3 sample sessions.
7. **`my-app/src/mocks/server.ts`** *(new)* — `setupServer(...handlers)` for tests (imported by `src/test/setup.ts`).
8. **`my-app/src/mocks/browser.ts`** *(new)* — `setupWorker(...handlers)` for the running dev app.
9. **`my-app/src/main.tsx`** *(modify)* — in `import.meta.env.DEV`, dynamically import and start `./mocks/browser` before rendering, so the real app also runs against the mock boundary (constraint: no backend service).
10. **`my-app/src/components/SessionsList.tsx`** *(new)* — renders the loading, error+retry, empty, and populated states for a given sessions array/status.
11. **`my-app/src/components/StatusFilter.tsx`** *(new)* — controlled `All | scheduled | completed | cancelled` selector.
12. **`my-app/src/components/CreateSessionForm.tsx`** *(new)* — controlled title/date-time inputs, trims and validates title length and future date/time client-side before calling `createSession`, disables submit while pending, surfaces validation and submit errors.
13. **`my-app/src/App.tsx`** *(modify — replace scaffold content)* — owns sessions state (`idle/loading/error/loaded`), fetches on mount via `fetchSessions`, derives the filtered list from `StatusFilter`, toggles `CreateSessionForm` visibility, and appends a successfully created session to state.
14. **`my-app/src/App.css`** *(modify, minimal)* — remove/replace only the scaffold-specific styles no longer referenced by the new markup; do not restyle unrelated global rules.
15. **`my-app/src/App.test.tsx`** *(new)* — the essential behavior-level test (see below).

Steps 1-3 (tooling) can proceed independently of and in parallel with steps 4-9 (mock/data layer); steps 10-12 (components) depend on step 4-5's types/client shape; step 13 depends on 10-12; step 15 depends on everything above it.

## Contracts And Dependencies

- `sessionsClient.ts` is the only module that calls `fetch`; components and `App.tsx` depend on its typed return values, never on `fetch` or MSW directly, so the boundary is swappable later.
- `Session.startsAt` is an ISO 8601 string end-to-end (API boundary, form submission, and display formatting all agree on this shape); display formatting (e.g., `toLocaleString`) happens only in `SessionsList`.
- MSW handlers are the single source of "current" sessions during dev/test; `createSession` must return the created record (including a generated `id`) so `App.tsx` never has to guess the new id.

## Essential Tests

- `my-app/src/App.test.tsx`: render `<App />` against the MSW test server, wait for the seeded sessions to appear (covers loading -> loaded), then either (a) select a status filter and assert only matching sessions render, or (b) fill and submit the create form and assert the new session appears in the list. Pick whichever the coder implements first; only one is required by TASK.md.

## Additional Risk-Based Tests

Not required for onboarding completion; may be added if time remains:

- Sessions-request failure renders the error state and a working retry.
- Title length and past-date/time validation messages render and block submission.
- Duplicate submission is prevented while a create request is pending.

## Verification Commands

Discovered from `my-app/package.json` (no new commands invented):

- `npm run lint` — existing ESLint script.
- `npm run build` — existing `tsc -b && vite build` (type-checks the new code).
- `npm test` — new Vitest script added by this plan (step 1); runs the essential test.
- `npm run dev` — existing Vite dev server, for the required manual browser check.

## Risks And Rollback

Low risk, additive-only change to an otherwise-empty scaffold. All new files are isolated under `src/` plus two edited entry points (`main.tsx`, `App.tsx`/`App.css`) and two config/manifest edits (`vite.config.ts`, `package.json`); reverting this task means reverting those files, no data migration or feature flag is warranted at this scale.
