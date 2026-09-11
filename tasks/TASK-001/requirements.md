# TASK-001: Training Sessions Workspace

## Goal

Give a trainer a small workspace to view, filter, and create training sessions against a mock API, as the onboarding exercise for the accelerator's manual workflow.

## Users And Outcome

- User: a trainer managing their own training sessions.
- Outcome: the trainer can see existing sessions, narrow the list to one status, and add a new session that then appears in the list — all without a real backend.

## Acceptance Criteria

- [ ] On load, the workspace requests sessions from a mock API and shows a loading state until the response resolves.
- [ ] Once loaded, each session in the list shows its title, status, and start date/time.
- [ ] A status filter offers `All` plus exactly one other status value; selecting a value shows only matching sessions, and `All` shows every session.
- [ ] If the sessions request fails, the list shows one understandable error state with a way to recover (e.g., retry) instead of a blank or broken screen.
- [ ] A control opens a create-session form.
- [ ] The create form has a title field and a date/time field.
- [ ] Submitting a title shorter than 3 characters or longer than 80 characters (after trimming) is rejected with a visible, useful validation message; the title is trimmed before the length check and before submission.
- [ ] Submitting a date/time that is not in the future is rejected with a visible, useful validation message.
- [ ] While a create submission is pending, repeated submits are prevented (e.g., the submit control is disabled or ignores re-entry) so a duplicate session cannot be created by resubmitting.
- [ ] On successful creation, the new session appears in the visible sessions list without a full page reload.
- [ ] At least one behavior-level automated test exists covering either the filter-by-status flow or the successful-creation flow, using the project's test stack.
- [ ] Mock data access goes through an HTTP client or an equivalent request boundary that could be swapped for a real backend later; no backend service is implemented.

## Constraints

- Use `my-app/` (the only frontend candidate in this repository) and its existing framework (React + TypeScript + Vite), package manager (npm, per the committed lockfile), and scripts. No test framework or HTTP mock library is currently installed in `my-app/`; a later role must choose and add one used conventionally (MSW or an equivalent is acceptable per TASK.md).
- Do not implement a real backend service; the mock boundary stands in for one.
- Do not rewrite unrelated scaffold code or configuration beyond what the required flow needs.
- Do not add product scope beyond this task (see Non-Goals) until this required flow is complete and passing.

## Non-Goals

- Session detail views, drawers, or deep links.
- Search or multiple simultaneous filters.
- Pagination.
- A complete/multi-scenario API contract.
- Desktop/mobile screenshot sets or a full responsive/accessibility audit.
- Full test coverage beyond the one required behavior-level test.
- CI, deployment, or a public URL.
- Strict TypeScript migration or unrelated refactoring.

## Facts

- `my-app/` is an unmodified `npm create vite -- --template react-ts` scaffold: React 19, TypeScript ~6, Vite 8, ESLint configured, no router, no state-management library, no test runner, no HTTP mock library.
- `my-app/package.json` scripts are `dev`, `build`, `tsc -b && vite build`, `lint` (`eslint .`), and `preview`. There is no `test` script yet.
- The accelerator's own definition of the required flow, states, and constraints lives in `training/frontend-accelerator-onboarding/TASK.md` in the toolset checkout; this requirements document restates and operationalizes it for `TASK-001` and does not change its scope.

## Assumptions

- "One status filter" means the UI needs exactly one status dropdown/selector (in addition to `All`), not one filter per status; the specific status values are a data-shape decision the mock/API-integration step can define using conventional session states (e.g., `scheduled`, `cancelled`, `completed`) unless the developer prefers to fix them now.
- "Recoverable" error state means the trainer can retry the sessions request from the UI (e.g., a retry action) without reloading the page; it does not require distinguishing error causes.
- A newly created session may be assigned a default status (e.g., `scheduled`) since the create form only collects title and date/time.
- Given no test framework exists yet, choosing and installing one (e.g., Vitest + Testing Library, matching the existing Vite toolchain) is in scope for implementation, not a separate architectural decision requiring sign-off before coding.

## Open Questions

- Which specific status values should the filter offer? (Assumption above proposes a small conventional set; can be finalized during implementation if not answered here.)
- Should the create form live inline on the page or in a modal/overlay? This is a UI-structure decision left to `ui-designer`/`coder` judgment since TASK.md does not require a specific pattern.

## Readiness

Ready for `writing-plans`. No unresolved question blocks planning; the two open questions above are non-blocking defaults that implementation may finalize. No architecture, API-contract, or visual-direction gap requires a specialist role before planning — the mock boundary, component structure, and interaction details are ordinary implementation decisions bounded by the acceptance criteria and constraints above.
