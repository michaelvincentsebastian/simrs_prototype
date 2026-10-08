# SIMRS Mini — Dokumentasi & Prototipe Rawat Jalan (Frappe Healthcare v15)

**Prinsip utama:** *Satu sistem, banyak role.* Semua fungsi pelayanan Rawat Jalan (registrasi walk-in & BPJS, APM kiosk, manajemen antrian audio-visual, triase & TTV, workstation dokter RME SOAP, laboratorium, farmasi e-resep & dispensing, kasir & billing multi-payment, serta TV display publik) berada di **satu aplikasi dan satu database**. Pengguna hanya dibedakan berdasarkan **Role** yang menentukan hak akses, menu navigasi, dan data scope. Pengecualian: **Kanal Appointment** adalah kanal booking pasien yang terpisah dan memanggil Appointment API.

---

## 🚀 Status Prototipe Interaktif (Current Mockup)

Repository ini telah dilengkapi dengan prototipe aplikasi web interaktif yang siap dijalankan secara lokal:
- **Web App Entrypoint:** [`index.html`](file:///home/vincent/Projects/prototype_simrs/index.html)
- **Core Scripts:** [`js/app.js`](file:///home/vincent/Projects/prototype_simrs/js/app.js), [`js/services.js`](file:///home/vincent/Projects/prototype_simrs/js/services.js), [`js/data.js`](file:///home/vincent/Projects/prototype_simrs/js/data.js), [`js/permissions.js`](file:///home/vincent/Projects/prototype_simrs/js/permissions.js), [`js/role-matrix-data.js`](file:///home/vincent/Projects/prototype_simrs/js/role-matrix-data.js), [`js/api-client.js`](file:///home/vincent/Projects/prototype_simrs/js/api-client.js)
- **Menjalankan Prototipe:**
  ```bash
  ./start.sh
  # atau
  python3 -m http.server 8000
  ```
  Akses aplikasi di: `http://localhost:8000`

### 🔑 Akun Demo Interaktif (1-Klik Login):
| Username | Password | Nama & Role | Modul / Kewenangan Utama |
|---|---|---|---|
| `staf.budi` | `registrasi123` | Budi Santoso (`REGISTRATION_STAFF`) | 1. Registrasi Pasien (Walk-in, Rujukan BPJS & SEP, Cetak Tiket/Slip) |
| `perawat.siti` | `perawat123` | Ns. Siti Rahma, S.Kep (`NURSING_USER`) | 2. Modul TTV (Antrian Triase, Pengukuran TTV & BMI Otomatis, Skrining ESI) |
| `dokter.hendra` | `dokter123` | dr. Hendra Pratama, Sp.PD (`PHYSICIAN`) | 3. Dokter RJ (My Queue, RME SOAP, ICD-10, E-Resep, Lab Order, Rujukan, Resume Medis 11-Elemen) |
| `kasir.linda` | `kasir123` | Linda Wijaya, S.E. (`CASHIER`) | 4. Kasir RJ (Antrian Billing, POS Kasir Tunai/Debit/QRIS/Penjamin, Cetak Kwitansi) |
| `display.tv` | `display123` | Display TV Publik (`QUEUE_DISPLAY`) | 5. Display Antrian TV (Layar Publik Zero-PHI Poli & Kasir/Farmasi + Audio Bell) |

*Workstation pendukung lainnya:* Laboratorium (`lab`), Farmasi (`farmasi`), Monitoring SLA Kemenkes (`monitoring`), Audit Trail (`audit`), Kiosk APM (`kiosk`).

---

## 📚 Urutan Baca Dokumentasi

| # | File | Isi |
|---|---|---|
| 1 | [`prd.md`](file:///home/vincent/Projects/prototype_simrs/docs/prd.md) | Tujuan bisnis, persona & role, ruang lingkup & fase, ADR, kebutuhan fungsional (FR-*), UAT |
| 2 | [`system-hierarchy.md`](file:///home/vincent/Projects/prototype_simrs/docs/system-hierarchy.md) | Pohon hirarki bernomor (1.1, 3.8, …), pemetaan ke Frappe Healthcare v15 & Workspace per role |
| 3 | [`user-role.md`](file:///home/vincent/Projects/prototype_simrs/docs/user-role.md) | Role, matriks role × workspace, katalog RBAC 70 aksi ([`user-role.csv`](file:///home/vincent/Projects/prototype_simrs/user-role.csv)), uji akses & keamanan |
| 4 | [`data-model.md`](file:///home/vincent/Projects/prototype_simrs/docs/data-model.md) | DocType (native vs custom), field spesifik, state machine kunjungan & antrian, service layer, API & integrasi SatuSehat |
| 5 | [`bpmn/rawat_jalan/`](file:///home/vincent/Projects/prototype_simrs/docs/bpmn/rawat_jalan/) | Diagram proses bisnis BPMN 2.0 modular (End-to-End, Registrasi, Antrian, TTV, Dokter, Farmasi, Kasir) |
| 6 | [`api/simrs-update-v2.json`](file:///home/vincent/Projects/prototype_simrs/docs/api/simrs-update-v2.json) | Postman Collection API untuk endpoint Frappe & SatuSehat |
| 7 | [`ai-agent-prompt.md`](file:///home/vincent/Projects/prototype_simrs/docs/ai-agent-prompt.md) | Prompt master (`AGENTS.md`) + panduan implementasi per fase untuk AI coding agent |

---

## 🗂️ Struktur Direktori Proyek

```text
prototype_simrs/
├── AGENTS.md                          ← Context master untuk AI agent
├── index.html                         ← Workstation klinis SPA interaktif
├── start.sh                           ← Script runner server lokal & ngrok tunnel
├── user-role.csv                      ← Matriks lengkap 70 aksi RBAC & data scope
├── css/                               ← Stylesheet custom & token desain
├── js/
│   ├── app.js                         ← Controller workspace, UI renderer, & workflow view
│   ├── services.js                    ← Business logic layer (State Machine, Triage, Doctor, Billing, dll.)
│   ├── data.js                        ← Master data & seed data (Departemen, ICD-10, Obat, Lab, Tarif)
│   ├── permissions.js                 ← Authentication engine, role specification, & RBAC guard
│   ├── role-matrix-data.js            ← Dataset matriks hak akses untuk modal inspector
│   └── api-client.js                  ← Dual-mode Frappe & SatuSehat REST API client
└── docs/
    ├── README.md                      ← Dokumentasi indeks dan pengantar sistem
    ├── prd.md                         ← Product Requirement Document
    ├── system-hierarchy.md            ← Hirarki sistem & pemetaan Frappe v15
    ├── user-role.md                   ← Spesifikasi hak akses & user role
    ├── data-model.md                  ← Spesifikasi data model, DocType, & API
    ├── hirarki-simrs.md               ← Detail komprehensif hirarki modul rawat jalan
    ├── SIMRS-0.1.hirarki              ← Format mentah hirarki sistem (JSON)
    ├── ai-agent-prompt.md             ← Panduan prompt AI agent per fase
    ├── api/
    │   └── simrs-update-v2.json       ← Postman Collection API
    └── bpmn/rawat_jalan/              ← Diagram BPMN 2.0 modular
        ├── 00-end-to-end.bpmn
        ├── antrian/ (01, 02, 03)
        ├── registrasi/ (01, 02, 03)
        ├── ttv/ (01)
        ├── dokter/ (01)
        ├── farmasi/ (01)
        └── kasir/ (01)
```

---

## 🎯 Aturan Menjaga Konsistensi

Nomor hirarki menu (1.1, 2.3, 3.8, …) adalah kunci konsisten di seluruh dokumentasi (`hirarki-simrs.md`, `system-hierarchy.md`, `prd.md`, `data-model.md`), diagram BPMN, hingga kode implementasi. Perubahan pada satu aspek wajib disinkronkan secara menyeluruh.

