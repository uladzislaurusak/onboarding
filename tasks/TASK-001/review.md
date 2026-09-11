# TASK-001 Code Review

**Review surface:** Working-tree diff in `my-app/` implementing `tasks/TASK-001/implementation-plan.md` against `tasks/TASK-001/requirements.md`. Base: the unmodified Vite `react-ts` scaffold. Files reviewed: `src/api/sessionsClient.ts`, `src/mocks/{handlers,server,browser}.ts`, `src/types/session.ts`, `src/components/{SessionsList,StatusFilter,CreateSessionForm}.tsx`, `src/App.tsx`, `src/App.css`, `src/App.test.tsx`, `src/main.tsx`, `src/test/setup.ts`, `vite.config.ts`, `package.json`, `eslint.config.js`.

## Findings

### 1. (Nice-to-have) Duplicate-submit guard is state-only, not ref-backed

`src/components/CreateSessionForm.tsx:33-46` — `handleSubmit` checks `if (isSubmitting) return` against React state, then later calls `setIsSubmitting(true)`. Because state updates are not applied synchronously, two submit events dispatched before the first re-render commits could both read `isSubmitting === false` and both call `createSession`. In practice this is not reachable through normal mouse/keyboard interaction (a real double-click's two `click`/`submit` events are far enough apart for React to commit the disabled state first), so it does not block the required "prevent duplicate submission while pending" behavior today. For extra robustness against synthetic/rapid resubmission, consider backing the guard with a `useRef` boolean that is set synchronously at the top of `handleSubmit`.

**Failure scenario:** two `submit` events fired in the same microtask/task (e.g., programmatically, or a future keyboard-shortcut path) before the first `setIsSubmitting(true)` commits would both pass the guard and issue two `POST /api/sessions` calls.

### 2. (Nice-to-have) Mock module state is not reset between tests

`src/mocks/handlers.ts:5-22` — the seeded `sessions` array is module-scoped and mutated in place by the `POST` handler. `src/test/setup.ts:5-7` calls `server.resetHandlers()` in `afterEach`, which resets handler *overrides*, not this module-level array. With the current single test this causes no visible failure, but if a second test is added later in the same file/run, it will see sessions created by earlier tests (test pollution), since Vitest does not reload the module between tests in one file.

**Failure scenario:** a future test asserting the initial seeded count (e.g., "exactly 3 sessions on load") would intermittently see 4+ if it runs after the existing creation test, depending on order.

### 3. (Nice-to-have) StrictMode double-invokes the mount fetch in dev

`src/main.tsx:14-18` renders `<StrictMode>`, so `src/App.tsx:30-32`'s `useEffect` runs twice on mount in development, firing two `GET /api/sessions` calls. Both resolve to the same array and `setSessions` simply overwrites, so this is harmless for a read-only GET. Worth remembering if this effect pattern is ever reused for a mutating request.

## Requirements Coverage

Checked against `tasks/TASK-001/requirements.md` acceptance criteria:

- Loading state on mount: present (`SessionsList` `status === 'loading'`).
- List shows title/status/start date-time: present (`SessionsList.tsx:34-35`).
- `All` + one status filter, filtering behavior: present (`StatusFilter.tsx`, `App.tsx:40-41`).
- Recoverable error state: present (`role="alert"` + Retry button, `SessionsList.tsx:15-24`, wired to `App.tsx`'s `retry`).
- Create form opens/closes: present (`App.tsx:61-67`).
- Trimmed title 3-80 chars validated with a message: present (`CreateSessionForm.tsx:18-21,37`).
- Future date/time validated with a message: present (`CreateSessionForm.tsx:22-27`).
- Duplicate-submit prevented while pending: present, see Finding 1 for a non-blocking hardening note.
- Created session appears in the list without reload: present (`App.tsx:43-46`).
- Mock HTTP boundary, no backend: present (`sessionsClient.ts` is the only `fetch` call site; MSW intercepts in `src/mocks/`).
- One behavior-level test: present (`App.test.tsx`, covers the creation flow end-to-end against the mock server).

No missing required behavior found. No scope creep beyond `requirements.md`'s Non-Goals observed.

## Verification Evidence Referenced

`npm run lint`, `npm run build`, and `npm test` were reported by `coder` as clean/passing; this review did not re-run them (read-only review of the diff, not re-verification — see the `verify` role for that).

## Verdict

**PASS** — no blocking or should-fix findings. All three findings above are nice-to-have hardening/hygiene notes that do not affect the required flow, and none breaks an acceptance criterion under normal use.
