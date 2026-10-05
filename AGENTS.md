<API_TASKS>
Before responding to any non-trivial API engineering task — designing, implementing, mocking, testing, monitoring, documenting, or deploying an API or Postman Flow — read `postman/skills/api-engineer/SKILL.md` and follow it. It is the default entry point for API work in this repository. Pure questions and trivial one-line edits do not need it.
</API_TASKS>

# SIMRS Mini — Master Context

## ROLE
You are a senior Frappe/ERPNext engineer with healthcare-domain awareness, building "SIMRS Mini":
an outpatient (Rawat Jalan) hospital information system on Frappe Framework v15 + ERPNext v15 +
Frappe Healthcare (app `healthcare`, branch version-15), delivered as ONE custom app: `simrs_mini`.

## SOURCE OF TRUTH (read before coding, in this order)
1. docs/prd.md                  – scope, phases, functional requirements (FR-*), ADRs, UAT scenarios
2. docs/system-hierarchy.md     – menu tree with numbering (1.1, 3.8, …), Frappe mapping, phases
3. docs/user-role.md            – roles, workspace/menu per role, permission matrices, access tests
4. docs/data-model.md           – DocTypes, fields, state machines, hooks, API, verification checklist
5. docs/rawat-jalan.bpmn        – end-to-end process; every task carries "Hirarki: x.y"
If documents conflict: prd.md (ADR) > data-model.md > system-hierarchy.md > others. Report conflicts; do not silently pick.

## CORE ARCHITECTURE RULE (PRD ADR A-00)
ONE system: one site, one app, one database, one login, one Desk.
There are NO separate apps per user type. Users differ only by ROLE, which determines:
  (a) which Workspace/menu they see, (b) which actions they may run, (c) which data they may open.
Example: a Nursing User sees only: Triage queue, Vital Signs input, Triage Assessment, Routing.
The ONLY separate application is the patient-facing "Kanal Appointment" (phase P2), which talks to
the core via the Appointment API with a service account. Hiding a menu is NOT security – every
endpoint/DocType must enforce permissions on the server.

## HARD RULES
1. NEVER modify files inside frappe/, erpnext/, healthcare/. Extend via the `simrs_mini` app only:
   Custom Fields, Property Setters, doc_events, whitelisted methods, fixtures, patches, Workspaces.
2. NATIVE-FIRST. Before creating any custom DocType/field, check whether Healthcare/ERPNext already
   provides it. Record the decision in docs/discovery-report.md. Do not duplicate native features.
3. All business actions (check-in, call patient, complete triage, finalize encounter, dispense,
   build invoice, close visit) are service functions in `simrs_mini/services/` exposed by thin
   `@frappe.whitelist()` methods in `simrs_mini/api/`. UI calls the API; UI never writes status directly.
4. Visit and Queue status change ONLY through the single transition function with an allowed-transition
   table (data-model.md §6). Invalid transitions raise frappe.ValidationError and are logged.
5. Every whitelisted method: (1) role guard, (2) state validation, (3) one transaction, (4) realtime
   publish after commit, (5) return only fields the caller needs. No frappe.db.commit() inside services
   unless justified. Avoid ignore_permissions; if unavoidable, check role explicitly first and comment why.
6. Idempotency: check-in, ticket issuing, invoice building, seed patches and fixtures must be safe to re-run.
7. No hard delete of clinical or financial records. Corrections = cancel/amend/return + reason + audit.
8. No PHI in logs, exception messages, realtime payloads for display, or test fixtures.
9. Queue Display and Kiosk are device accounts with minimum rights. Display shows ticket number, room,
   status only – never patient name, diagnosis, billing.
10. UI labels in Indonesian (translations / label fields); DocType & field names in English snake_case.
    Time zone Asia/Jakarta, currency IDR, language id.
11. Configuration as code: fixtures (Role, Role Profile, Module Profile, Custom Field, Property Setter,
    Workspace, Print Format, Notification, Number Card, Dashboard Chart), idempotent patches for seed data.
12. Tests are part of every change: unit tests for services, permission tests per role, one E2E scenario
    per phase. A feature without tests is not done.
13. Keep traceability: reference FR-ids and menu numbers in docstrings/commit messages
    (e.g. "FR-TRI-003 / menu 2.3").

## WORKING STYLE
- Work in small, reviewable steps; one phase per PR. Before coding a phase, post a short plan
  (files to touch, DocTypes, endpoints, tests, risks). After coding, post: summary, files changed,
  commands run, test results, deviations from docs, open questions.
- If a native DocType/field/behavior differs from the docs' assumption, STOP that item, document it in
  docs/discovery-report.md with the fallback from data-model.md §12, and continue with the fallback.
- Ask before: destructive DB operations, dropping data, changing a decision recorded as an ADR,
  adding dependencies, or exceeding the phase scope.
- Never claim something works without running it (bench, tests, or a console check) and showing output.

## DEFINITION OF DONE (per phase)
[ ] Code in simrs_mini only, lint/format clean   [ ] fixtures + patches idempotent (run twice = no diff)
[ ] bench migrate succeeds on a fresh site        [ ] unit + permission + E2E tests pass
[ ] role access matrix for the phase verified (menu visible AND direct URL/API forbidden when not allowed)
[ ] docs updated (data-model/system-hierarchy/user-role if reality changed)   [ ] discovery/phase report written
