# AI Agent Prompt — Build SIMRS Mini on Frappe Healthcare v15

> **Cara pakai**
> 1. Taruh seluruh dokumen di repo: `docs/` ← `system-hierarchy.md`, `user-role.md`, `prd.md`, `data-model.md`, `bpmn/rawat_jalan/`, file ini.
> 2. Salin **Part A** ke `AGENTS.md` / `CLAUDE.md` (agar berlaku di setiap sesi).
> 3. Jalankan **Part C** satu fase per sesi/PR (urut P0 → P1.x). Jangan minta agent membangun semuanya sekaligus.
> 4. Prompt ditulis dalam bahasa Inggris karena nama DocType/kode Frappe berbahasa Inggris; **label UI tetap Indonesia**.

---

## Part A — Master context (AGENTS.md)

```text
ROLE
You are a senior Frappe/ERPNext engineer with healthcare-domain awareness, building "SIMRS Mini":
an outpatient (Rawat Jalan) hospital information system on Frappe Framework v15 + ERPNext v15 +
Frappe Healthcare (app `healthcare`, branch version-15), delivered as ONE custom app: `simrs_mini`.

SOURCE OF TRUTH (read before coding, in this order)
1. docs/prd.md                  – scope, phases, functional requirements (FR-*), ADRs, UAT scenarios
2. docs/system-hierarchy.md     – menu tree with numbering (1.1, 3.8, …), Frappe mapping, phases
3. docs/user-role.md            – roles, workspace/menu per role, permission matrices, access tests
4. docs/data-model.md           – DocTypes, fields, state machines, hooks, API, verification checklist
5. docs/bpmn/rawat_jalan/       – end-to-end (00-end-to-end.bpmn) & modular processes; every task carries "Hirarki: x.y"
If documents conflict: prd.md (ADR) > data-model.md > system-hierarchy.md > others. Report conflicts; do not silently pick.

CORE ARCHITECTURE RULE  (PRD ADR A-00)
ONE system: one site, one app, one database, one login, one Desk.
There are NO separate apps per user type. Users differ only by ROLE, which determines:
  (a) which Workspace/menu they see, (b) which actions they may run, (c) which data they may open.
Example: a Nursing User sees only: Triage queue, Vital Signs input, Triage Assessment, Routing.
The ONLY separate application is the patient-facing "Kanal Appointment" (phase P2), which talks to
the core via the Appointment API with a service account. Hiding a menu is NOT security – every
endpoint/DocType must enforce permissions on the server.

HARD RULES
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

WORKING STYLE
- Work in small, reviewable steps; one phase per PR. Before coding a phase, post a short plan
  (files to touch, DocTypes, endpoints, tests, risks). After coding, post: summary, files changed,
  commands run, test results, deviations from docs, open questions.
- If a native DocType/field/behavior differs from the docs' assumption, STOP that item, document it in
  docs/discovery-report.md with the fallback from data-model.md §12, and continue with the fallback.
- Ask before: destructive DB operations, dropping data, changing a decision recorded as an ADR,
  adding dependencies, or exceeding the phase scope.
- Never claim something works without running it (bench, tests, or a console check) and showing output.

DEFINITION OF DONE (per phase)
[ ] Code in simrs_mini only, lint/format clean   [ ] fixtures + patches idempotent (run twice = no diff)
[ ] bench migrate succeeds on a fresh site        [ ] unit + permission + E2E tests pass
[ ] role access matrix for the phase verified (menu visible AND direct URL/API forbidden when not allowed)
[ ] docs updated (data-model/system-hierarchy/user-role if reality changed)   [ ] discovery/phase report written
```

---

## Part B — Environment bootstrap (reference commands)

Agent harus **menyesuaikan** dengan OS/versi yang terpasang; jangan menjalankan perintah destruktif tanpa konfirmasi.

```bash
# Prasyarat (versi Frappe v15): Python 3.10–3.11, Node 18, MariaDB 10.6, Redis, wkhtmltopdf, yarn, bench
bench init --frappe-branch version-15 frappe-bench && cd frappe-bench
bench get-app erpnext   --branch version-15
bench get-app healthcare --branch version-15 https://github.com/frappe/health
bench new-site simrs.localhost --admin-password <pwd>
bench --site simrs.localhost install-app erpnext
bench --site simrs.localhost install-app healthcare
bench new-app simrs_mini            # module name: "SIMRS Mini"
bench --site simrs.localhost install-app simrs_mini
bench --site simrs.localhost set-config developer_mode 1
bench start
# test:  bench --site simrs.localhost run-tests --app simrs_mini
```

`simrs_mini/hooks.py` harus berisi `required_apps = ["frappe", "erpnext", "healthcare"]`.

---

## Part C — Phase prompts

Gunakan satu blok per sesi. Setiap blok mengasumsikan Part A sudah dimuat.

### P0 — Discovery (tanpa kode fitur)

```text
Goal: verify every assumption in docs/data-model.md §12 (V-01…V-13) against the INSTALLED site and
produce docs/discovery-report.md.

Tasks
1. Install the stack (Part B). Record exact versions of frappe, erpnext, healthcare.
2. List all DocTypes of the `healthcare` module with their key fields, is_submittable, naming, statuses.
   Inspect patient_appointment, patient_encounter, vital_signs, lab_test, medication_request,
   service_request (if any), clinical_procedure, healthcare_settings.
3. Answer V-01…V-13 with evidence (file path + snippet or console output). Specifically:
   - Patient Appointment statuses & Check-In behaviour (V-03)
   - Is Patient Encounter submittable? On which event are Lab Test / Service Request / Medication Request
     created: save or submit? Consequence for "doctor reviews lab result before finalizing" (V-04)
   - Native invoicing flow and Healthcare Settings switches that may conflict with our billing aggregator (V-05)
   - Which roles exist; which DocPerm does System Manager hold on PHI DocTypes (V-07)
   - Workspace "Roles" restriction + role_home_page behaviour incl. multi-role users (V-13)
4. For each assumption: Confirmed / Different (+ fallback chosen from §12) / Unknown.
5. Produce a native-vs-custom decision table per menu in docs/system-hierarchy.md (update Tipe column if needed).

Acceptance: report committed; no feature code; list of doc changes proposed (not silently applied).
```

### P1.1 — Scaffold, settings, roles, Workspaces (the "one system, many roles" foundation)

```text
Goal: skeleton of `simrs_mini` + role model + per-role navigation. This is the foundation of ADR A-00.
Refs: user-role.md §0, §3, §6; data-model.md §7.5, §10; FR-ACC-001..006.

Tasks
1. hooks.py (required_apps, fixtures, doc_events placeholders, role_home_page), module SIMRS Mini,
   SIMRS Mini Settings (Single) with fields from data-model §3.5.
2. System defaults via patch: time zone Asia/Jakarta, country Indonesia, language id, currency IDR.
3. Fixtures: Roles (Registration Staff, Queue Officer, Pharmacist, Cashier, Outpatient Supervisor,
   Clinical Auditor, Queue Display, + any missing native ones), Role Profiles ("RJ – Registrasi",
   "RJ – Perawat", "RJ – Dokter", "RJ – Farmasi", "RJ – Kasir", "RJ – Supervisor", "RJ – Audit",
   "RJ – Display"), Module Profiles that hide unused ERPNext modules.
4. Workspaces (one per role-group, each restricted by Roles): Registrasi, Triase, Dokter, Penunjang,
   Farmasi, Kasir, Monitoring, Audit. Shortcuts only to pages/DocTypes that will exist; stub Pages ok.
5. role_home_page mapping per role (user-role.md §0.1). Document how multi-role landing is resolved.
6. DocPerm baseline from user-role.md §6 via Custom DocPerm fixtures. Trim System Manager's access to
   PHI DocTypes if V-07 confirmed it is present (document exactly what was trimmed).
7. Seed users (one per role) via patch for non-production sites only (flag in Settings).
8. Tests: user-role.md §11 items 1, 8, 9, 11, 12, 13 (menu visibility AND direct access denied).

Acceptance: logging in as each seeded user lands on the right Workspace; Nursing User sees ONLY
Triase menu items; direct GET/API on Patient Encounter / Sales Invoice / Medication Request returns 403.
```

### P1.2 — Registration, check-in, Outpatient Visit, Queue

```text
Goal: Walk-in + staff-managed appointments + check-in + queue + display.
Refs: data-model §3.1, §3.2, §4, §6.1, §6.2, §7.2–7.3, §8; FR-REG-001..007, FR-QUE-001..006; BPMN lanes
Registrasi/Sistem.

Tasks
1. Custom Fields on Patient (nik), Patient Appointment (registration_source, payer_type,
   payer_member_no, cancel_reason, outpatient_visit) — via fixtures. NIK validation + duplicate warning.
2. DocTypes: Outpatient Visit (+ Visit Status Log), Queue Ticket, Queue Counter.
3. services/visit_state.py (TRANSITIONS table + transition()), services/queue.py (issue_ticket with row
   lock, call/recall/skip/start/complete/requeue, auto-skip after N recalls).
4. API: registration.search_patient / create_patient / register_walk_in / check_in (idempotent);
   queue.call/recall/skip/start/complete; queue.board (whitelist fields only).
5. Page `registration-desk` inside Workspace Registrasi: one-screen walk-in flow (FR-REG-003).
6. www/queue-display: board=poli|kasir|farmasi, realtime + polling fallback, no patient names.
   Display runs under the Queue Display device account.
7. Print Format: Bukti Pendaftaran (booking/ticket number).
8. Tests: check-in twice → one Visit; two concurrent ticket requests → distinct numbers; invalid
   transitions rejected; display payload contains no PHI; Registration Staff cannot touch Encounter/Vital Signs.

Acceptance: BPMN path Walk-in → Check-in → ticket Triase works end-to-end; display updates ≤ 3 s.
```

### P1.3 — Triage / TTV (the nurse's view)

```text
Goal: nurse works entirely inside Workspace Triase.
Refs: system-hierarchy §3.3; data-model §3.3, §6.1; FR-TRI-001..006.

Tasks
1. DocType Triage Assessment (fields per data-model §3.3).
2. Page `triage-station`: triage queue (WAITING_TRIAGE), call, identify, open Vital Signs form
   (native) + Triage Assessment, complete → routing (WAITING_DOCTOR) or ESCALATED.
3. API triage.complete(visit, outcome, escalated_to) with completeness validation; out-of-range vitals
   show a WARNING only (no auto-diagnosis).
4. Link Vital Signs → Outpatient Visit (custom field/hook).
5. Permissions: Nursing User can create/update Vital Signs & Triage Assessment only in states
   WAITING_TRIAGE/IN_TRIAGE; read-only identity; nothing else visible.
6. Tests: FR-TRI-006 (no access to Appointment/Encounter/Resep/Billing), escalation path, state guards.

Acceptance: Nurse can run scenario D-escalation and the normal path using only the Triase workspace.
```

### P1.4 — Doctor workspace & Encounter

```text
Goal: doctor consultation, ordering, prescribing, finalization.
Refs: system-hierarchy §3.4; data-model §4, §6.1; FR-DOC-001..009; discovery V-04 outcome decides
the order/finalize sequencing (Option A or B) — follow the discovery report.

Tasks
1. Custom Fields on Patient Encounter: subjective, objective, assessment, plan, follow_up_type,
   follow_up_days, patient_instructions, outpatient_visit.
2. Page `doctor-workspace`: My Queue (server-filtered to the logged-in practitioner), call/skip/recall/start,
   Patient Summary read-through panel (doctor.patient_summary), results panel.
3. API doctor.start_service (create/open Encounter, Visit → IN_SERVICE), hold/resume,
   finalize_encounter with checklist (before_submit), Visit → SERVICE_COMPLETED, create Farmasi/Kasir tickets.
4. Order lab/procedure and prescription via native Encounter tables; ensure statuses surface in Visit.pending_orders.
5. Print Format: Resume Medis (11 minimum elements, system-hierarchy 3.11).
6. Scope: User Permission on Healthcare Practitioner + Patient Summary exception.
7. Tests: doctor A cannot open doctor B's encounter; no edit after submit; checklist blocks finalize;
   Pharmacist/Cashier cannot see Encounter.
```

### P1.5 — Laboratory

```text
Goal: lab receives orders and publishes results. Refs: system-hierarchy §3.5; FR-LAB-001..004.
Tasks: Workspace Penunjang for Laboratory User; Sample Collection + Lab Test flow (native); validation by
LabTest Approver; Service Order Monitor report; hook updating Visit.pending_orders and realtime notice to
the doctor when result is available. Tests incl. Lab cannot edit doctor orders or billing.
```

### P1.6 — Pharmacy

```text
Goal: verify → dispense → hand over. Refs: system-hierarchy §3.6; data-model §3.4; FR-PHA-001..004.
Tasks: DocType Pharmacy Dispense (+ item child, submittable) generating Stock Entry/Delivery Note on submit;
Page `pharmacy-station` (incoming prescriptions, verification, clarification request to doctor,
preparation, handover); Visit.pharmacy_status updates; Farmasi queue ticket. Pharmacist cannot edit
Medication Request content (status/verification only). Tests: stock decrement, clarification loop.
```

### P1.7 — Billing & Cashier

```text
Goal: consolidated invoice per visit and payment. Refs: system-hierarchy §3.7; data-model §9; FR-BIL-*.
Tasks: Price Lists (Umum/Asuransi/BPJS) + Item Prices (seed); services/billing.build_invoice(visit)
(idempotent, charges linked to source docs); Page `cashier-station` (Kasir queue, billing review,
payment via Payment Entry, receipt); guaranteed flow for Asuransi/Korporat; Print Format Kwitansi;
Visit.billing_status updates; disable conflicting native auto-invoicing per V-05.
Tests: rebuilding invoice adds no duplicates; payment → billing_status Paid; Cashier cannot read Encounter.
```

### P1.8 — Closure, follow-up, dashboards, hardening

```text
Goal: close visits and finish MVP. Refs: system-hierarchy §3.8–3.10; FR-CLS-*, FR-QUE-006; PRD §9, §12.
Tasks: closure.create_followup + close_visit (auto when billing & pharmacy done, supervisor override with
reason); Workspace Monitoring (Waiting Time chart, Kunjungan Harian, No-show, Visit Timeline report);
No-show scheduler; track_changes Property Setters on clinical/financial DocTypes; Audit workspace
(read-only); full E2E tests for PRD scenarios A–D and R; seed demo data patch; README for deployment.
Acceptance: PRD §9 scenarios A, B, C, D, R pass on a fresh site created from scratch with one command
sequence documented in README.
```

### P2 (setelah MVP stabil — satu prompt per butir)

```text
Kanal Appointment: implement appointment_api.* (slots, book, my_appointments, reschedule, cancel) with the
`Appointment Channel Service` account and rate limiting; build a minimal separate web client as a SEPARATE
project that only calls this API. Core remains the source of truth (ADR A-03).
Kiosk/APM: www/kiosk under the `Kiosk Device` account (check-in by code/QR, walk-in for existing patients).
Radiology/Rehab via Service Request / Therapy Plan; Visit Referral; Control Letter; Amendment Request with
approval; Refund via credit note + approval (SoD: creator ≠ approver); Break Glass Log & Patient Chart Access Log;
voice caller (Web Speech API id-ID).
```

---

## Part D — Prompt utilitas

**Review PR terhadap dokumen**

```text
Review this PR against docs/prd.md, docs/data-model.md and docs/user-role.md. Check: (1) FR-ids covered,
(2) one-system rule (no separate app/db), (3) permission enforced server-side AND tests prove direct
access is denied, (4) status changes only via transition(), (5) idempotency, (6) no PHI in logs/display,
(7) fixtures/patches rerunnable, (8) docs updated. Output: blocking issues, non-blocking, missing tests.
```

**Tambah role/menu baru**

```text
Add role <NAME> with workspace <WS>. Update, in the same PR: user-role.md (§3, §0.2, §6), system-hierarchy.md
(§3.1A), fixtures (Role, Role Profile, Workspace with Roles, Module Profile, role_home_page, Custom DocPerm),
and add tests: menu visible; direct DocType/API access to non-permitted objects returns 403.
```

**Debug permission**

```text
User <U> with role(s) <R> reports <problem>. Reproduce on a test site. Inspect: Role Permission Manager /
Custom DocPerm, User Permissions, permission_query_conditions, has_permission hooks, Workspace roles,
docstatus/Visit state. Fix in simrs_mini only; add a regression test; explain root cause.
```

---

## Part E — Jebakan umum Frappe (ingatkan agent)

- **Fixtures:** filter ketat (`module`/nama) agar tidak mengekspor seluruh Custom Field; commit hasil `bench export-fixtures`; verifikasi idempoten.
- **docstatus:** Submit/Cancel/Amend ≠ status bisnis; jangan menimpa field `status` native tanpa memahami controllernya.
- **`db_set` / `ignore_permissions` / `frappe.db.commit`:** hindari; bila perlu, jelaskan di komentar.
- **Realtime:** kirim `after_commit=True`; payload display tanpa PHI; ada fallback polling.
- **Nomor antrian:** gunakan row lock (`for_update=True`) pada counter; uji konkurensi.
- **Workspace tanpa role = terlihat semua** — selalu isi *Roles*.
- **Patches:** tulis idempoten dan daftarkan di `patches.txt`; jangan bergantung pada data produksi.
- **Client script:** simpan di app (`doctype_js`/Page JS), bukan di UI Client Script, agar versioned.
- **Test:** buat user per role di `setUpClass`; uji **negatif** (akses harus gagal), bukan hanya positif.
- **Upgrade:** jangan monkey-patch core; override terbatas lewat hooks yang didukung.
