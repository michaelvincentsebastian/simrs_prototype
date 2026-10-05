# SIMRS Mini — Dokumentasi Rawat Jalan (Frappe Healthcare v15)

**Prinsip utama:** *satu sistem, banyak role.* Semua fungsi (registrasi walk-in, APM, antrian, triase/TTV, dokter, penunjang, farmasi, kasir, display) ada di **satu aplikasi**; user berbeda hanya karena role berbeda (menu, aksi, data). Pengecualian: **Appointment** adalah kanal booking pasien yang terpisah dan memanggil Appointment API.

## Urutan baca

| # | File | Isi |
|---|---|---|
| 1 | `prd.md` | Tujuan, ruang lingkup & fase, ADR, kebutuhan fungsional (FR-*), UAT, risiko |
| 2 | `system-hierarchy.md` | Pohon hirarki bernomor + pemetaan ke Frappe + Workspace per role |
| 3 | `user-role.md` | Role, matriks role × menu, permission, scope, uji akses |
| 4 | `data-model.md` | DocType custom, field, state machine, hook, API, checklist verifikasi |
| 5 | `rawat-jalan.bpmn` | BPMN 2.0 (buka di bpmn.io / Camunda Modeler); lane = role, task memuat nomor hirarki |
| 6 | `ai-agent-prompt.md` | Prompt master (AGENTS.md) + prompt per fase untuk AI agent |

## Struktur repo yang disarankan

```text
simrs-mini/
├── AGENTS.md                 ← salin Part A dari docs/ai-agent-prompt.md
├── docs/
│   ├── README.md  prd.md  system-hierarchy.md  user-role.md  data-model.md
│   ├── bpmn/rawat-jalan.bpmn
│   ├── ai-agent-prompt.md
│   └── discovery-report.md   ← dibuat agent pada Fase 0
└── frappe-bench/apps/simrs_mini/   ← app custom (satu-satunya yang boleh diubah)
```

## Aturan menjaga konsistensi

Nomor menu (1.1, 3.8, …) adalah kunci yang sama di hirarki, BPMN, PRD, dan data model. Ubah satu → perbarui keempat lainnya pada commit yang sama.
