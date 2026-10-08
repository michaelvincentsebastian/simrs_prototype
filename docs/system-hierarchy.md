# System Hierarchy — SIMRS Mini (Rawat Jalan)

> **Versi:** 0.2 (Synchronized with Interactive Mockup) · **Tanggal:** 2026-10-08 · **Basis:** `hirarki-simrs.md` & `SIMRS-0.1.hirarki` · **Platform:** Frappe Framework v15 + ERPNext v15 + Frappe Healthcare (`version-15`)
>
> Dokumen ini adalah **arsitektur operasional yang sinkron dengan prototipe web app interaktif (`index.html`)**: setiap menu, sub-menu, workstation, dan alur layanan dipetakan ke komponen antarmuka pengguna saat ini serta target implementasi backend di Frappe (DocType / Page / Report / Service API).
>
> Nomor menu (1.1, 2.3, 3.8, dst.) adalah kunci konsistensi di seluruh repositori (`docs/bpmn/rawat_jalan/`, `docs/prd.md`, `docs/user-role.md`, `docs/data-model.md`, dan `user-role.csv`).

---

## 0. Prinsip Arsitektur — Satu Sistem, Banyak Role

> **Keputusan produk:** seluruh fungsi Rawat Jalan — registrasi walk-in, BPJS/SEP, APM/kiosk, manajemen antrian audio-visual, triase/TTV, dokter RME SOAP, penunjang lab, farmasi, kasir POS, audit trail, monitoring SLA, dan TV display — dibangun sebagai **satu sistem terintegrasi**. Tidak ada aplikasi terpisah per jenis user. Yang membedakan antar-pengguna hanyalah **Role**: menu apa yang terlihat, workstation mana yang aktif, aksi apa yang diizinkan, dan batasan data scope yang berlaku.

```text
 Pasien ──► KANAL APPOINTMENT  (aplikasi booking eksternal / Mobile / Web)
                  │  Appointment API (REST, akun layanan)
                  ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  SIMRS MINI = SATU SISTEM  (1 site · 1 app `simrs_mini` · 1 login · 1 DB) │
│                                                                          │
│  Registrasi/Walk-in/BPJS · APM Kiosk · Antrian Audio · Triase/TTV        │
│  Dokter RME SOAP · Penunjang Lab · Farmasi 7-Benar · Kasir POS           │
│  Monitoring SLA Kemenkes · Audit Trail · TV Display Publik Zero-PHI      │
│                                                                          │
│  Satu data bersama: Patient · Appointment · Outpatient Visit ·           │
│  Queue Ticket · Vital Signs · Encounter · Lab Order · Resep · Invoice    │
│                                                                          │
│  Tampilan & hak akses = ROLE  →  Workspace + DocPerm + Scope + Status    │
└──────────────────────────────────────────────────────────────────────────┘
   ▲ Akun manusia: Petugas Pendaftaran · Perawat Triase · Dokter Spesialis ·
   │                Analis Lab · Apoteker · Kasir RJ · Supervisor · Auditor
   ▲ Akun perangkat: Kiosk Device (APM) · Queue Display (TV Ruang Tunggu)
```

| # | Prinsip | Konsekuensi Desain & Implementasi Mockup |
|---|---|---|
| S-1 | **Satu sistem, satu login, satu database.** | Seluruh data disimpan dan diakses bersama (`SIMRS_VISITS`, `SIMRS_PATIENTS`, `SIMRS_AUDIT_LOGS`). Tidak ada silo data antar-stasiun. |
| S-2 | **Role menentukan apa yang terlihat.** | Setelah login, antarmuka langsung merender landing workspace dan sidebar navigasi yang hanya memuat menu peran terkait. |
| S-3 | **Menyembunyikan menu bukan keamanan.** | Hak akses ditegakkan di level service (`permissionEngine.assertPermission()`), menolak akses liar dengan error 403. |
| S-4 | **Akun perangkat mandiri (Zero-PHI).** | Layar TV Display publik (`/queue-display`) dan Kiosk APM (`/kiosk`) beroperasi tanpa menampilkan privasi data medis pasien. |
| S-5 | **Audio Bell & Voice Calling lokal.** | Menggunakan Web Audio Synthesizer (chime dua nada D5-A5) dan Web Speech API `id-ID` tanpa dependensi berkas suara statis. |

---

## 1. Empat Level Hirarki

```text
MODUL            → Domain bisnis besar          (Rawat Jalan)
└── Submodul     → Kapabilitas / Tahap proses   (Registrasi, Triase, Pelayanan Dokter, dll.)
    └── Menu     → Aktivitas utama user          (Walk-in, Pengukuran TTV, RME SOAP, Billing, dll.)
        └── Sub-menu / Fungsi → Aksi konkret    (Cetak SEP, Hitung BMI, Panggil Antrian, Finalisasi)
```

---

## 2. Pohon Hirarki Final (Terintegrasi Mockup & Stakeholder)

Struktur ini mengintegrasikan **5 submodul inti stakeholder (`SIMRS-0.1.hirarki`)** dengan **unit penunjang & workstation operasional** yang telah terimplementasi di mockup:

```text
RAWAT JALAN
│
├── 1. Submodul Registrasi Pasien (Petugas Pendaftaran RJ)
│   ├── 1.1 Pendaftaran Walk-in (Pasien Baru & Lama, Kuota Poli, DPJP, Payer)
│   ├── 1.2 Rujukan BPJS & Penerbitan SEP (Surat Eligibilitas Berobat)
│   ├── 1.3 Live Queue & Monitoring Loket Pendaftaran
│   ├── 1.4 Pemanggilan & Cetak Tiket Antrian Termal (58/80mm)
│   ├── 1.5 Cetak Slip Bukti Pendaftaran Resmi
│   ├── 1.6 Cek Duplikasi NIK 16 Digit & Validasi Rekam Medis
│   └── 1.7 Anjungan Pendaftaran Mandiri (APM Kiosk)
│
├── 2. Submodul TTV & Triase (Perawat)
│   ├── 2.1 Antrian Triase Pasien per Stasiun & Poliklinik
│   ├── 2.2 Pemanggilan Antrian Suara ke Meja Triase
│   ├── 2.3 Pengukuran Tanda Vital (TD, Nadi, Suhu, RR, SpO2, TB, BB)
│   ├── 2.4 Kalkulasi Otomatis Indeks Massa Tubuh (BMI) & Kategori
│   ├── 2.5 Skrining Klinis: Keluhan Utama, Risiko Jatuh, Skala Nyeri VAS (0-10), Alergi
│   ├── 2.6 Klasifikasi Triase Emergency Severity Index (ESI: Normal, Perhatian, Eskalasi)
│   └── 2.7 Routing Pasien (ke Antrian Dokter Poli atau Eskalasi IGD)
│
├── 3. Submodul Pelayanan Dokter (Dokter Rawat Jalan)
│   ├── 3.1 Dashboard Metrik Harian Dokter DPJP
│   ├── 3.2 Antrian Pasien Poliklinik (My Queue) & Pemanggilan Pasien
│   ├── 3.3 Patient Summary Banner (TTV Terkini, Alergi, Riwayat Kunjungan)
│   ├── 3.4 Catatan Rekam Medis Elektronik SOAP (Subjektif S, Objektif O, Edukasi P)
│   ├── 3.5 Penegakan Diagnosis & Selector Standar ICD-10
│   ├── 3.6 Permintaan Tindakan Medis / Prosedur Rawat Jalan
│   ├── 3.7 Permintaan Uji Laboratorium Patologi Klinik & Review Hasil
│   ├── 3.8 E-Resep Obat Formularium Rumah Sakit dengan Cek Stok Real-Time
│   ├── 3.9 Modal Rujukan Online (Spesialis Internal, Lab, Radiologi, Rehab, Eksternal)
│   ├── 3.10 Simpan Draft SOAP vs Finalisasi Encounter (Penguncian Permanen RME)
│   └── 3.11 Cetak Resume Medis Resmi Rawat Jalan (Standar 11 Elemen Permenkes RI)
│
├── 4. Submodul Kasir Rawat Jalan (Kasir RJ)
│   ├── 4.1 Dashboard Transaksi Kasir & Rekap Penerimaan
│   ├── 4.2 Antrian Pasien Siap Bayar (Filter Poli & Penjamin)
│   ├── 4.3 Kasir Pembayaran POS (Agregasi Biaya Registrasi, Jasa Medis, Tindakan, Lab, Obat)
│   ├── 4.4 Penambahan Tindakan Susulan di Kasir
│   ├── 4.5 Multi-Metode Pembayaran (Tunai + Hitung Kembalian, Kartu Debit, Kredit, QRIS)
│   ├── 4.6 Penjaminan Asuransi & Perusahaan (Settlement Status Guaranteed)
│   └── 4.7 Penerbitan & Cetak Kwitansi Pembayaran Resmi Bernomor
│
├── 5. Submodul Display Antrian (Display Antrian Publik)
│   ├── 5.1 Layar TV Display Antrian Poliklinik & Dokter DPJP
│   ├── 5.2 Layar TV Display Antrian Kasir & Farmasi
│   ├── 5.3 Pemanggil Audio Bell Synthesizer (Chime D5-A5) & Web Speech API (id-ID)
│   └── 5.4 Kebijakan Privasi Ketat Zero-PHI (Hanya Nomor Tiket & Ruangan)
│
├── 6. Penunjang Laboratorium (Analis Lab)
│   ├── 6.1 Worklist Permintaan Pemeriksaan Lab Masuk dari Dokter
│   ├── 6.2 Konfirmasi Pengambilan & Penerimaan Spesimen Sampel
│   ├── 6.3 Penginputan Hasil Parameter Patologi Klinik (CBC, Lipid, GDS, Ginjal, dll.)
│   ├── 6.4 Validasi Nilai Normal Pria/Wanita & Rilis Hasil ke RME Dokter
│   └── 6.5 Cetak Sertifikat Resmi Hasil Pemeriksaan Laboratorium
│
├── 7. Farmasi Rawat Jalan (Apoteker)
│   ├── 7.1 Inbox Resep Elektronik Dokter Poliklinik
│   ├── 7.2 Verifikasi & Telaah Resep 7-Benar (Administratif & Klinis)
│   ├── 7.3 Dispensing Obat dengan Pemotongan Stok Persediaan Otomatis
│   ├── 7.4 Pemanggilan Antrian Loket Pengambilan Obat (F-xxx)
│   └── 7.5 Penyerahan Obat & Checklist Edukasi Pasien (KIE)
│
└── 8. Tata Kelola, Audit & Integrasi
    ├── 8.1 Monitoring Kepatuhan SLA Waktu Tunggu Kemenkes RI (< 60 Menit)
    ├── 8.2 Visualisasi Timeline Lifecycle Perjalanan Pasien
    ├── 8.3 Override Administratif Kunjungan Tertahan dengan Alasan Wajib
    ├── 8.4 Audit Trail Log Sistem (Perekaman Aksi, User, Role, & Timestamp)
    ├── 8.5 Modal Inspeksi Matriks Hak Akses RBAC 70 Aksi Terperinci
    └── 8.6 Dual-Mode REST API Client (Offline LocalStorage vs Live Frappe & SatuSehat)
```

---

## 3. Peta Submodul → Frappe & Workstation Mockup

### 3.1A Workspace per Role pada Prototipe Mockup

Setiap peran memiliki workstation, izin akses (`allowedWorkspaces`), dan navigasi utama (`primaryNav`) yang terkonfigurasi pada [`js/permissions.js`](file:///home/vincent/Projects/prototype_simrs/js/permissions.js) dan dirender oleh [`js/app.js`](file:///home/vincent/Projects/prototype_simrs/js/app.js):

| Role ID & Nama | Landing Workspace | Allowed Workspaces | Navigasi Utama (Sidebar) | Target Desk Frappe v15 |
|---|---|---|---|---|
| **Petugas Pendaftaran RJ** (`REGISTRATION_STAFF`) | `registrasi` | `registrasi`, `reg-bpjs`, `reg-dashboard`, `reg-booking`, `reg-patients` | • Pendaftaran Walk-in (`registrasi`)<br>• Rujukan BPJS & SEP (`reg-bpjs`) | Workspace `Registrasi` + Page `registration-desk` |
| **Perawat Triase** (`NURSING_USER`) | `ttv-queue` | `ttv-queue`, `ttv-input`, `ttv-history`, `triase`, `ttv`, `nurse-dashboard` | • Antrian Triase (`ttv-queue`)<br>• Pengukuran TTV (`ttv-input`)<br>• Riwayat Triase (`ttv-history`) | Workspace `Triase` + Page `triage-station` |
| **Dokter Rawat Jalan** (`PHYSICIAN`) | `doctor-queue` | `doctor-dashboard`, `doctor-queue`, `doctor-consultation`, `doctor-patients`, `doctor-documents`, `dokter` | • Dashboard Dokter (`doctor-dashboard`)<br>• Antrian Pasien (`doctor-queue`)<br>• Pemeriksaan RME (`doctor-consultation`)<br>• Data Pasien (`doctor-patients`)<br>• Dokumen & Resume (`doctor-documents`) | Workspace `Dokter` + Page `doctor-workspace` |
| **Kasir Rawat Jalan** (`CASHIER`) | `cashier-queue` | `cashier-dashboard`, `cashier-queue`, `cashier-payment`, `cashier-history`, `kasir` | • Dashboard Kasir (`cashier-dashboard`)<br>• Antrian Billing (`cashier-queue`)<br>• Pembayaran Kasir (`cashier-payment`)<br>• Riwayat Transaksi (`cashier-history`) | Workspace `Kasir` + Page `cashier-station` |
| **Display Antrian TV** (`QUEUE_DISPLAY`) | `display` | `display` | • Display Antrian TV (`display` - Tab Poli & Kasir/Farmasi) | Route Khusus `/queue-display` (Akun Perangkat) |

*Workstation Sekunder / Tambahan di Mockup:*
- `lab` → Laboratorium Patologi Klinik (`Laboratory User`)
- `farmasi` → Farmasi E-Resep & Dispensing (`Pharmacist`)
- `monitoring` → Monitoring SLA Kemenkes & Override (`Outpatient Supervisor`)
- `audit` → Audit Trail Log Viewer (`Clinical Auditor`)
- `kiosk` → Layar Sentuh Anjungan Pendaftaran Mandiri (`Kiosk Device`)

---

### 3.2 Pemetaan Fitur & Status Implementasi ke Frappe

| Kode | Menu / Fitur | Target Frappe Healthcare v15 | Tipe | Status Prototipe Mockup |
|---|---|---|---|---|
| **1.1** | **Pendaftaran Walk-in** | Page `registration-desk` + `Patient Appointment` | X/N | ✅ **Selesai & Berfungsi** (`renderRegistrasiWorkspace`) |
| 1.1.1 | Cari Pasien & Duplikasi NIK | Custom Field `nik` pada `Patient` + validation hook | C | ✅ **Selesai** (Cari NIK/MRN/Nama + Alert Duplikasi) |
| 1.1.2 | Form Pasien Baru Walk-in | Dialog buat `Patient` baru | N/C | ✅ **Selesai** (Modal form Pasien Baru) |
| 1.1.3 | Kuota Poli & Dokter DPJP | `Healthcare Practitioner Schedule` | N | ✅ **Selesai** (6 Poli, 5 Dokter, jadwal & kuota) |
| 1.1.4 | Tiket Termal & Slip Bukti | Print Format thermal & slip pendaftaran | C | ✅ **Selesai** (Preview Tiket & Slip Pendaftaran) |
| **1.2** | **Rujukan BPJS & SEP** | Integrasi BPJS / custom doctype `BPJS Referral` | X | ✅ **Selesai** (Verifikasi rujukan & Cetak SEP resmi) |
| **1.3** | **Kiosk / APM Mandiri** | Route `/kiosk` (Akun `Kiosk Device`) | X | ✅ **Selesai** (Layar sentuh APM QR & Walk-in lama) |
| **1.4** | **Check-in Kunjungan** | Service `VisitStateService` → `Outpatient Visit` | X | ✅ **Selesai** (Inisiasi kunjungan `WAITING_TRIAGE`) |
| **2.1** | **Antrian Triase** | Page `triage-station` + filter unit perawat | X | ✅ **Selesai** (Stream antrian triase + audio call) |
| **2.2** | **Input TTV & BMI** | `Vital Signs` (kalkulasi BMI otomatis) | N/C | ✅ **Selesai** (TD, Nadi, Suhu, RR, SpO2, TB, BB, BMI) |
| **2.3** | **Skrining Klinis & ESI** | `Triage Assessment` (custom doctype) | X | ✅ **Selesai** (Keluhan, Risiko Jatuh, VAS 0-10, Alergi, ESI) |
| **2.4** | **Routing Triase** | Service `TriageService.saveTriageAndVitals()` | X | ✅ **Selesai** (Transisi ke `WAITING_DOCTOR` atau `ESCALATED`) |
| **3.1** | **My Queue Dokter** | Filter `doctor-workspace` DPJP + Ruangan | X | ✅ **Selesai** (Antrian pasien khusus dokter login) |
| **3.2** | **RME SOAP** | `Patient Encounter` (Subjective, Objective, Plan) | C | ✅ **Selesai** (Form tab SOAP + Sticky Patient Banner) |
| **3.3** | **Diagnosis ICD-10** | Tabel Diagnosis `Patient Encounter` | N | ✅ **Selesai** (Selector 14 kode ICD-10 umum & pencarian) |
| **3.4** | **Order Tindakan Medis** | `Clinical Procedure` tertaut tarif | N | ✅ **Selesai** (EKG, Nebulisasi, Perawatan luka, dll.) |
| **3.5** | **Order Lab & Review** | `Lab Test` tertaut RME dokter | N | ✅ **Selesai** (Order lab CBC, Lipid, GDS, dll. + status) |
| **3.6** | **E-Resep Formularium** | `Medication Request` dengan cek stok | N/C | ✅ **Selesai** (Pilihan obat formularium + aturan pakai) |
| **3.7** | **Rujukan Online** | Modal `Visit Referral` (Spesialis, Lab, Radio, Rehab) | X | ✅ **Selesai** (Modal rujukan terpadu) |
| **3.8** | **Resume Medis 11-Elemen**| Print Format "Resume Medis" Permenkes RI | C | ✅ **Selesai** (Generator cetak resume 11-elemen) |
| **3.9** | **Finalisasi Encounter** | Validasi checklist + Submit `Patient Encounter` | C | ✅ **Selesai** (Locking RME, picu antrian kasir/farmasi) |
| **4.1** | **Worklist Lab & Hasil** | DocType `Lab Test` + validasi nilai rujukan | N | ✅ **Selesai** (Input hasil CBC, Lipid, GDS + rilis RME) |
| **5.1** | **Farmasi 7-Benar & Dispense**| Custom DocType `Pharmacy Dispense` + ERPNext Stock | X | ✅ **Selesai** (Telaah 7-benar, potong stok, panggil F-xxx) |
| **6.1** | **Kasir Billing Agregat** | `Sales Invoice` otomatis dihimpun dari transaksi | X | ✅ **Selesai** (Agregasi regis, dokter, tindakan, lab, obat) |
| **6.2** | **Multi-Metode Bayar** | `Payment Entry` (Tunai, Debit, Kartu Kredit, QRIS) | N | ✅ **Selesai** (Kalkulasi kembalian tunai, QRIS, dll.) |
| **6.3** | **Kwitansi Pembayaran** | Print Format "Kwitansi Resmi" bernomor seri | C | ✅ **Selesai** (Generator cetak kwitansi lunas) |
| **7.1** | **Display TV Zero-PHI** | Page `/queue-display` dengan audio bell synthesizer | X | ✅ **Selesai** (Layar TV Poli & Kasir/Farmasi + suara) |
| **8.1** | **Monitoring SLA Kemenkes**| Dashboard waktu tunggu (< 60 menit) & timeline | X | ✅ **Selesai** (Live compliance SLA & override status) |
| **8.2** | **Audit Trail Log** | `Version` & `Activity Log` Frappe | N/X | ✅ **Selesai** (Viewer log aktivitas immutable) |

---

## 4. Konsistensi Hirarki ↔ BPMN ↔ PRD ↔ API

Repositori menjaga sinkronisasi 4 pilar arsitektur:
1. **Hirarki Sistem:** Dokumen ini ([`system-hierarchy.md`](file:///home/vincent/Projects/prototype_simrs/docs/system-hierarchy.md)) dan [`hirarki-simrs.md`](file:///home/vincent/Projects/prototype_simrs/docs/hirarki-simrs.md).
2. **BPMN 2.0:** Diagram alur modular di folder [`docs/bpmn/rawat_jalan/`](file:///home/vincent/Projects/prototype_simrs/docs/bpmn/rawat_jalan/).
3. **Kebutuhan Fungsional & RBAC:** [`docs/prd.md`](file:///home/vincent/Projects/prototype_simrs/docs/prd.md) dan [`user-role.csv`](file:///home/vincent/Projects/prototype_simrs/user-role.csv).
4. **Data Model & API:** [`docs/data-model.md`](file:///home/vincent/Projects/prototype_simrs/docs/data-model.md), [`js/api-client.js`](file:///home/vincent/Projects/prototype_simrs/js/api-client.js), dan [`docs/api/simrs-update-v2.json`](file:///home/vincent/Projects/prototype_simrs/docs/api/simrs-update-v2.json).

