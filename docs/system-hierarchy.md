# System Hierarchy — SIMRS Mini (Rawat Jalan)

> **Versi:** 0.1 (draft) · **Tanggal:** 2026-10-04 · **Basis:** `hirarki-simrs.md` (dirapikan dari ChatGPT) · **Platform:** Frappe Framework v15 + ERPNext v15 + Frappe Healthcare (`healthcare`, branch `version-15`)
>
> Dokumen ini adalah **versi yang siap dibangun**: setiap menu/sub-menu pada hirarki asli dipetakan ke target implementasi di Frappe (DocType / Page / Report), diberi tipe pengerjaan, dan diberi fase rilis.
>
> Nomor menu (1.1, 3.8, dst.) **sama dengan sumber** dan dipakai juga oleh `rawat-jalan.bpmn`, `prd.md`, `user-role.md`, dan `data-model.md` sebagai kunci traceability.

---

## 0. Prinsip Arsitektur — Satu Sistem, Banyak Role

> **Keputusan produk:** selain **Appointment** (kanal booking pasien), seluruh fungsi Rawat Jalan — registrasi walk-in, APM/kiosk, antrian, triase/TTV, dokter, penunjang, farmasi, kasir, display — dibangun sebagai **satu sistem**. Tidak ada aplikasi terpisah per jenis user. Yang berbeda per user hanyalah **role**: menu apa yang terlihat, aksi apa yang boleh, dan data mana yang boleh dibuka.

```text
 Pasien ──► KANAL APPOINTMENT  (aplikasi terpisah, patient-facing: Web / Mobile / WhatsApp)
                  │  Appointment API (REST, akun layanan)
                  ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  SIMRS MINI = SATU SISTEM  (1 site · 1 app `simrs_mini` · 1 login · 1 DB) │
│                                                                          │
│  Registrasi/Walk-in · APM · Antrian · Triase/TTV · Dokter · Penunjang    │
│  Farmasi · Kasir · Penyelesaian · Display                                │
│                                                                          │
│  Satu data bersama: Patient · Appointment · Outpatient Visit ·           │
│  Queue Ticket · Encounter · Order · Resep · Invoice                      │
│                                                                          │
│  Tampilan & hak akses = ROLE  →  Workspace + DocPerm + Scope + Status    │
└──────────────────────────────────────────────────────────────────────────┘
   ▲ Akun manusia: Registration · Queue Officer · Nurse · Doctor · Lab ·
   │                Pharmacist · Cashier · Supervisor · Auditor · Admin
   ▲ Akun perangkat: Kiosk Device (APM) · Queue Display
```

| # | Prinsip | Konsekuensi desain |
|---|---|---|
| S-1 | **Satu sistem, satu login, satu data.** Tidak ada "aplikasi perawat" atau "aplikasi kasir" yang punya database sendiri | Tidak ada sinkronisasi antar-aplikasi; tiap role membaca/menulis dokumen yang sama (`Outpatient Visit`, `Queue Ticket`, …) sesuai izin |
| S-2 | **Role menentukan apa yang terlihat.** Setelah login, user diarahkan ke Workspace sesuai role; sidebar/menu hanya memuat menu role itu | Contoh: Nurse hanya melihat **Antrian Triase, Input TTV, Skrining, Routing** |
| S-3 | **Menyembunyikan menu bukan keamanan.** Izin ditegakkan di server (DocPerm, User Permission, guard method, validasi status) | Mengetik URL DocType lain tetap ditolak (403) |
| S-4 | **User multi-role** melihat gabungan menu semua role-nya | Mis. kepala poli = Physician + Outpatient Supervisor |
| S-5 | **Perangkat adalah akun role di sistem yang sama** (Kiosk Device, Queue Display) | Route khusus (`/kiosk`, `/queue-display`) dengan hak minimum |
| S-6 | **Satu-satunya batas eksternal MVP = Kanal Appointment** (dan integrasi P3: BPJS, SATUSEHAT, WhatsApp) | Appointment dibuat pasien lewat API, *source of truth* tetap `Patient Appointment` di sistem inti; staf Registrasi tetap bisa mengelola appointment di dalam sistem |

Detail role → workspace → menu ada di `user-role.md` §0. Implementasi navigasi ada di `data-model.md` §7.5.

---

## 1. Cara membaca dokumen ini

### 1.1 Empat level hirarki

```text
MODUL            → domain bisnis besar          (Rawat Jalan)
└── Submodul     → kapabilitas / tahap proses   (Registrasi, Triase, Pelayanan Dokter, …)
    └── Menu     → aktivitas utama user          (Appointment, Check-in, Order, …)
        └── Sub-menu / fungsi → aksi konkret    (Buat Appointment, Panggil Pasien, …)
```

Aturan emas (dari sumber): **Input TTV, SOAP, Cetak SEP, Pemanggil Pasien, Cetak Kwitansi adalah fungsi, bukan submodul.** Submodul mengikuti proses bisnis fundamental, bukan tombol/layar.

### 1.2 Legenda kolom "Tipe"

| Kode | Arti | Contoh |
|---|---|---|
| **N** | **Native** — pakai fitur/DocType bawaan Healthcare/ERPNext apa adanya (cukup konfigurasi master data) | Patient, Vital Signs |
| **C** | **Config/Custom Field** — native + Custom Field, Property Setter, Client Script, Print Format, hook ringan | field SOAP pada Patient Encounter |
| **X** | **Custom** — DocType / Page / Report baru di app `simrs_mini` | Queue Ticket, Outpatient Visit |
| **—** | Tidak dibangun pada fase tsb | |

### 1.3 Legenda kolom "Fase"

| Fase | Isi | Keterangan |
|---|---|---|
| **P1** | **MVP "SIMRS Mini"** | Alur lengkap 1 pasien dari daftar sampai bayar, dengan lab & resep sederhana |
| **P2** | Perluasan | Kiosk, portal pasien, radiologi/rehab, rujukan, surat kontrol, refund, amendment, break-glass |
| **P3** | Integrasi eksternal | BPJS/SATUSEHAT, WhatsApp, klaim |

> ⚠️ **Catatan verifikasi:** nama DocType Healthcare v15 pada kolom "Target Frappe" adalah **asumsi kerja** berdasarkan struktur app `healthcare`. Semuanya wajib dikonfirmasi pada **Fase 0 (Discovery)** di instalasi nyata (lihat `ai-agent-prompt.md` §Phase 0). Bila berbeda, dokumen ini diperbarui — bukan dipaksa.

---

## 2. Pohon hirarki final

```text
RAWAT JALAN
│
├── 1. Registrasi
│   ├── 1.1 Appointment
│   ├── 1.2 Walk-in Registration
│   ├── 1.3 Kiosk / Anjungan Pendaftaran Mandiri        (P2)
│   ├── 1.4 Check-in & Konfirmasi Kehadiran
│   ├── 1.5 Verifikasi Identitas & Data Pasien
│   ├── 1.6 Verifikasi Penjamin
│   └── 1.7 Antrian Rawat Jalan
│
├── 2. Triase / Tanda Vital
│   ├── 2.1 Daftar Antrian Triase
│   ├── 2.2 Identifikasi Pasien
│   ├── 2.3 Input Tanda Vital (TTV)
│   ├── 2.4 Screening / Skrining Awal
│   └── 2.5 Routing ke Poli / Dokter
│
├── 3. Pelayanan Dokter
│   ├── 3.1 Daftar Antrian Dokter
│   ├── 3.2 Pemanggilan Pasien
│   ├── 3.3 Data Pasien (Patient Chart)
│   ├── 3.4 Anamnesis
│   ├── 3.5 Pemeriksaan / Objective
│   ├── 3.6 Assessment
│   ├── 3.7 Diagnosis
│   ├── 3.8 Order / Permintaan Layanan
│   │   ├── Laboratorium
│   │   ├── Radiologi                                   (P2)
│   │   ├── Rehabilitasi Medik                          (P2)
│   │   ├── Tindakan
│   │   └── Konsultasi / Rujukan                        (P2)
│   ├── 3.9 Resep / Medication Order
│   ├── 3.10 Plan
│   ├── 3.11 Resume Medis
│   └── 3.12 Penyelesaian Encounter (Finalisasi klinis)
│
├── 4. Penunjang Rawat Jalan
│   ├── 4.1 Order Laboratorium
│   ├── 4.2 Order Radiologi                             (P2)
│   ├── 4.3 Order Rehabilitasi Medik                    (P2)
│   ├── 4.4 Monitoring Status Order
│   └── 4.5 Hasil Pemeriksaan / Result Review
│
├── 5. Farmasi Rawat Jalan
│   ├── 5.1 Daftar Resep Masuk
│   ├── 5.2 Verifikasi Resep
│   ├── 5.3 Dispensing
│   ├── 5.4 Penyiapan & Penyerahan Obat
│   └── 5.5 Status Resep
│
├── 6. Kasir / Billing
│   ├── 6.1 Billing Pasien
│   ├── 6.2 Detail Pelayanan / Tindakan
│   ├── 6.3 Tarif
│   ├── 6.4 Verifikasi Penjamin
│   ├── 6.5 Pembayaran
│   ├── 6.6 Refund / Koreksi                            (P2)
│   └── 6.7 Dokumen Pembayaran (Kwitansi)
│
├── 7. Penyelesaian Kunjungan
│   ├── 7.1 Follow-up
│   ├── 7.2 Appointment Berikutnya
│   ├── 7.3 Surat Kontrol                               (P2)
│   ├── 7.4 Rujukan                                     (P2)
│   ├── 7.5 Edukasi / Instruksi Pulang
│   └── 7.6 Finalisasi / Penutupan Kunjungan
│
├── 8. Antrian & Display
│   ├── 8.1 Display Antrian Poli / Dokter
│   ├── 8.2 Display Antrian Kasir
│   ├── 8.3 Display Antrian Farmasi
│   └── 8.4 Monitoring Antrian
│
└── 9. Cross-cutting (bukan submodul klinis)
    ├── X1 Hak Akses (RBAC)           → lihat user-role.md
    ├── X2 Audit Trail
    ├── X3 Notification
    └── X4 Integration                                  (P3)
```

**Perubahan terhadap sumber (disengaja):**

1. Seluruh isi sumber dipertahankan; yang ditambahkan hanya kolom Frappe/tipe/fase.
2. Label **P2/P3** menandai apa yang *belum* masuk MVP agar "mini" tetap realistis. Nomor menu tidak berubah, sehingga menu P2 bisa diaktifkan kemudian tanpa merombak hirarki.
3. Modul **9 Cross-cutting** ditambahkan sebagai pengelompokan dari §56–59 sumber (Hak Akses, Audit Trail, Notification, Integration).

---

## 3. Peta Submodul → Frappe

### 3.1 Prinsip pemetaan

| Konsep di sumber | Padanan Frappe Healthcare | Catatan |
|---|---|---|
| Patient | `Patient` | Pasien ↔ `Customer` otomatis (untuk billing) |
| Appointment | `Patient Appointment` | Booking **dan** (untuk walk-in) "surat tugas kunjungan" — lihat ADR A-02 di `prd.md` |
| Encounter | `Patient Encounter` | Submit = finalisasi klinis |
| Alur kunjungan (status operasional) | **`Outpatient Visit` (custom)** | Orkestrator lifecycle: lihat `data-model.md` |
| Antrian | **`Queue Ticket` (custom)** | Tidak ada di Healthcare |
| TTV | `Vital Signs` | |
| Service Request / Order | `Lab Test` / `Service Request` / `Clinical Procedure` / `Therapy Plan` | Pilih yang aktif di v15 saat Discovery |
| Medication Request / Resep | `Patient Encounter` (resep) → `Medication Request` | Verifikasi di Discovery |
| Dispensing | **`Pharmacy Dispense` (custom)** + ERPNext Stock | |
| Billing | `Sales Invoice` | Charge dihimpun per kunjungan |
| Payment | `Payment Entry` | |
| Tarif | `Item` + `Item Price` + `Price List` per penjamin | |
| Audit trail | `Version` (track changes) + `Activity Log` + `Access Log` | |

### 3.1A Workspace per role (tampilan di dalam satu sistem)

Setiap "Page" pada tabel di bawah bukan aplikasi terpisah — ia adalah **halaman di dalam Desk yang sama**, dikelompokkan dalam Workspace yang hanya terlihat oleh role tertentu.

| Workspace | Role utama | Isi (menu) | Page / DocType |
|---|---|---|---|
| **Registrasi** | Registration Staff, Queue Officer | Walk-in, Check-in, Verifikasi Pasien/Penjamin, Daftar Appointment, Antrian Registrasi | `registration-desk`, `Patient`, `Patient Appointment` |
| **Triase** | Nursing User | Antrian Triase, Input TTV, Skrining, Routing | `triage-station`, `Vital Signs`, `Triage Assessment` |
| **Dokter** | Physician | My Queue, Patient Chart, Encounter (SOAP, diagnosis, order, resep), Resume, Finalisasi | `doctor-workspace`, `Patient Encounter` |
| **Penunjang** | Laboratory User (P2: Radiologi, Rehab) | Order masuk, Spesimen, Input/validasi hasil, Monitor order | `Lab Test`, `Service Order Monitor` |
| **Farmasi** | Pharmacist | Resep Masuk, Verifikasi, Dispensing, Penyerahan | `pharmacy-station`, `Pharmacy Dispense` |
| **Kasir** | Cashier | Antrian Kasir, Billing, Pembayaran, Kwitansi | `cashier-station`, `Sales Invoice`, `Payment Entry` |
| **Monitoring** | Outpatient Supervisor | Dashboard waktu tunggu, antrian unit, override operasional | Dashboard, Report |
| **Audit** | Clinical Auditor | Audit trail, timeline encounter (read-only) | `Version`, Report |
| **Admin** | System Manager | User, Role Profile, master data, konfigurasi | Setup |
| *(tanpa Workspace)* | Kiosk Device, Queue Display | Route perangkat | `/kiosk`, `/queue-display` |

Matriks lengkap role × menu: `user-role.md` §0.2.

### 3.2 Submodul 1 — Registrasi

**Tujuan:** pasien teridentifikasi, tujuan layanan jelas, penjamin diketahui, dan pasien siap dilayani. **Output:** Appointment berstatus siap + Outpatient Visit + Queue Ticket Triase.

| Kode | Menu / Sub-menu | Target Frappe | Tipe | Fase |
|---|---|---|---|---|
| 1.1 | **Appointment** — *kanal booking pasien adalah aplikasi terpisah; data & aturan tetap di sistem inti (lihat §0)* | | | |
| 1.1.1 | Cari Jadwal | Schedule practitioner + dialog cek slot di `Patient Appointment` | N | P1 |
| 1.1.2 | Buat Appointment | `Patient Appointment` (+ field `registration_source`, `payer_type`) | C | P1 |
| 1.1.3 | Lihat / Ubah / Reschedule | `Patient Appointment` (reschedule native) + `Version` | N | P1 |
| 1.1.4 | Batalkan | Status `Cancelled` + alasan (field wajib) | C | P1 |
| 1.1.5 | Konfirmasi Appointment | Field `confirmation_status` + `Notification` pengingat | C | P2 |
| 1.1.6 | **Kanal Appointment** (Web / Mobile / WhatsApp) — aplikasi terpisah, patient-facing | Memanggil **Appointment API** (`slots`, `book`, `my_appointments`, `reschedule`, `cancel`) pada akun layanan `Appointment Channel Service`; tidak punya database sendiri | X | P2 (Web) / P3 (WhatsApp) |
| 1.1.7 | Kelola Appointment oleh staf (telepon/loket) | Workspace **Registrasi** → `Patient Appointment` | N/C | P1 |
| 1.2 | **Walk-in Registration** | Page **`registration-desk`** (satu layar: cari/buat Patient → pilih poli/dokter/penjamin → buat Appointment walk-in → check-in → tiket) | X | P1 |
| 1.2.1 | Registrasi Pasien Lama (cari MRN/NIK) | `Patient` search (+ custom field `nik`) | C | P1 |
| 1.2.2 | Registrasi Pasien Baru | `Patient` create dari Page registration-desk | C | P1 |
| 1.2.3 | Pemilihan Poli / Dokter / Penjamin | `Medical Department`, `Healthcare Practitioner`, `payer_type` | C | P1 |
| 1.2.4 | Cetak / Kirim Bukti Pendaftaran | Print Format "Bukti Pendaftaran" | C | P1 |
| 1.3 | **Kiosk / APM** — bagian dari sistem yang sama | Route `/kiosk` di site yang sama, login sebagai akun perangkat `Kiosk Device` (hak minimum: lookup appointment/QR, check-in, walk-in pasien lama, cetak tiket) | X | P2 |
| 1.4 | **Check-in & Konfirmasi Kehadiran** | Aksi check-in pada `Patient Appointment` → buat/aktifkan `Outpatient Visit` + `Queue Ticket` (service function idempoten) | X | P1 |
| 1.5 | **Verifikasi Identitas** | Validasi duplikat (NIK/nama+tgl lahir) pada `Patient` + peringatan "NIK sudah punya MRN …" | C | P1 |
| 1.6 | **Verifikasi Penjamin** | Field `payer_type` (Umum/Asuransi/BPJS) + `eligibility_status` manual | C | P1 |
| 1.6.1 | Validasi kepesertaan / hak layanan / rujukan | Integrasi BPJS / asuransi | X | P3 |
| 1.6.2 | Generate dokumen penjamin (SEP) | Output proses verifikasi, bukan submodul | X | P3 |
| 1.7 | **Antrian Rawat Jalan** | `Queue Ticket` (queue_type = Registrasi/Triase/Dokter/Kasir/Farmasi) | X | P1 |

### 3.3 Submodul 2 — Triase / Tanda Vital

| Kode | Menu / Sub-menu | Target Frappe | Tipe | Fase |
|---|---|---|---|---|
| 2.1 | Daftar Antrian Triase | Page **`triage-station`** (daftar `Queue Ticket` Triase: Waiting → Called → In Triage → Completed) | X | P1 |
| 2.2 | Identifikasi Pasien | Scan QR/ketik nomor tiket di `triage-station`, tampilkan identitas minimum | X | P1 |
| 2.3 | Input TTV (TD, nadi, RR, suhu, SpO2, BB, TB, BMI; opsional GCS, nyeri) | `Vital Signs` (BMI otomatis native); warning nilai tidak wajar = **peringatan, bukan diagnosis** | N/C | P1 |
| 2.4 | Screening / Skrining Awal (keluhan utama, risiko jatuh, alergi, nyeri, infeksi) | `Triage Assessment` (hasil: Normal / Perlu Perhatian / Perlu Eskalasi) | X | P1 |
| 2.5 | Routing ke Poli / Dokter | Aksi "Selesai Triase": Visit → `WAITING_DOCTOR`, buat `Queue Ticket` Dokter; bila eskalasi → Visit `ESCALATED` (alihkan ke IGD, di luar modul ini) | X | P1 |

### 3.4 Submodul 3 — Pelayanan Dokter

| Kode | Menu / Sub-menu | Target Frappe | Tipe | Fase |
|---|---|---|---|---|
| 3.1 | Daftar Antrian Dokter | Page **`doctor-workspace`** › "My Queue" (difilter ke practitioner login) | X | P1 |
| 3.2 | Pemanggilan Pasien (Panggil, Lewati, Panggil Ulang, Mulai, Selesai) | Aksi pada `Queue Ticket`; "Mulai" membuat/membuka `Patient Encounter` & Visit → `IN_SERVICE` | X | P1 |
| 3.3 | Data Pasien (identitas, TTV terbaru, alergi, riwayat, obat aktif, hasil lab, follow-up) | Panel **Patient Summary** di `doctor-workspace` + timeline `Patient Medical Record` | X/N | P1 |
| 3.4 | Anamnesis (keluhan utama, RPS, RPD, obat, alergi, keluarga, sosial) → **S** | `Patient Encounter` (symptoms + custom field `subjective`) | C | P1 |
| 3.5 | Pemeriksaan / Objective → **O** | Custom field `objective` + TTV tertaut | C | P1 |
| 3.6 | Assessment → **A** | Custom field `assessment` | C | P1 |
| 3.7 | Diagnosis (utama, sekunder, kondisi tambahan, riwayat) | Tabel diagnosis `Patient Encounter` → `Diagnosis`/kode ICD-10; aturan koreksi lewat amendment | N/C | P1 |
| 3.8 | Order / Permintaan Layanan | | | |
| 3.8.1 | Laboratorium | Tabel order lab di `Patient Encounter` → `Lab Test` (atau `Service Request`, lihat Discovery) | N | P1 |
| 3.8.2 | Tindakan | `Clinical Procedure` / tabel prosedur di Encounter | N | P1 |
| 3.8.3 | Radiologi | `Service Request` + laporan sederhana | N/X | P2 |
| 3.8.4 | Rehabilitasi Medik | `Therapy Plan` / `Therapy Session` | N | P2 |
| 3.8.5 | Konsultasi / Rujukan (internal & eksternal) | `Visit Referral` (**intent/request**, bukan encounter baru) | X | P2 |
| 3.9 | Resep / Medication Order (draft → signed → sent) | Tabel resep Encounter → `Medication Request` | N/C | P1 |
| 3.10 | Plan (terapi, penunjang lanjutan, kontrol, rujukan, edukasi) → **P** | Custom field `plan` + `follow_up_*` | C | P1 |
| 3.11 | Resume Medis | Print Format "Resume Medis" (11 elemen minimum dari sumber §33) | C | P1 |
| 3.12 | Penyelesaian Encounter (checklist → **Finalize**) | Validasi `before_submit` (anamnesis, pemeriksaan, diagnosis, resume lengkap) lalu **Submit**; setelahnya terkunci, koreksi via amendment | C | P1 |

### 3.5 Submodul 4 — Penunjang Rawat Jalan

> Rawat Jalan hanya memegang **order + status + hasil**; eksekusi pemeriksaan adalah domain unit penunjang (Lab/Radiologi/Rehab).

| Kode | Menu | Target Frappe | Tipe | Fase |
|---|---|---|---|---|
| 4.1 | Order Laboratorium (Ordered → Accepted → In Progress → Completed → Result Available) | `Lab Test` + `Sample Collection` (native) | N | P1 |
| 4.2 | Order Radiologi | `Service Request` + hasil/laporan | N/X | P2 |
| 4.3 | Order Rehabilitasi Medik | `Therapy Plan` / `Therapy Session` | N | P2 |
| 4.4 | Monitoring Status Order (Semua / Menunggu / Diproses / Selesai / Hasil tersedia / Dibatalkan) | Script Report **`Service Order Monitor`** | X | P1 |
| 4.5 | Hasil Pemeriksaan / Result Review (ditautkan ke Patient, Encounter, Order, Performer, Waktu) | Panel hasil di `doctor-workspace` + `Lab Test` | X/N | P1 |

### 3.6 Submodul 5 — Farmasi Rawat Jalan

| Kode | Menu | Target Frappe | Tipe | Fase |
|---|---|---|---|---|
| 5.1 | Daftar Resep Masuk | Page **`pharmacy-station`** (daftar `Medication Request` status Signed/Sent) | X | P1 |
| 5.2 | Verifikasi Resep (alergi, interaksi/duplikasi, stok, formularium; klarifikasi ke dokter — **tidak mengubah resep diam-diam**) | Aksi verifikasi + `Pharmacy Dispense` draft; komentar klarifikasi | X | P1 |
| 5.3 | Dispensing (pick → prepare → label → final check) | `Pharmacy Dispense` (submit → `Stock Entry`/`Delivery Note` ERPNext) | X | P1 |
| 5.4 | Penyiapan & Penyerahan Obat (+konseling) | Status `READY` → `DISPENSED` + tiket Farmasi | X | P1 |
| 5.5 | Status Resep | Field status + filter list/report | C | P1 |

### 3.7 Submodul 6 — Kasir / Billing

| Kode | Menu | Target Frappe | Tipe | Fase |
|---|---|---|---|---|
| 6.1 | Billing Pasien (agregasi per kunjungan: konsultasi, tindakan, lab, radiologi, rehab, obat, administrasi) | `Sales Invoice` dibuat oleh **billing aggregator** (`simrs_mini.billing.build_invoice(visit)`) | X | P1 |
| 6.2 | Detail Pelayanan / Tindakan (sumber charge = service transaction; kasir **tidak mengarang** tindakan klinis) | Item invoice bertaut ke dokumen sumber | X | P1 |
| 6.3 | Tarif (Service Master ≠ Tariff Master; jangan hard-code) | `Item` + `Item Price` per `Price List` (Umum / Asuransi / BPJS) | N | P1 |
| 6.4 | Verifikasi Penjamin di Billing (eligibility registrasi ≠ adjudikasi final) | Field `guarantee_status` + invoice ke `Customer` penjamin | C | P1 (dasar) / P3 |
| 6.5 | Pembayaran (Tunai, Debit, Kredit, QRIS, Transfer/VA, Asuransi, Jaminan Perusahaan) | `Payment Entry` + `Mode of Payment` | N | P1 |
| 6.6 | Refund / Koreksi (**tidak menghapus** transaksi; reversal + reason + approver) | `Sales Invoice` return (credit note) + `Payment Entry` + approval | C/X | P2 |
| 6.7 | Dokumen Pembayaran (Kwitansi: print/PDF/email) | Print Format "Kwitansi" | C | P1 |

### 3.8 Submodul 7 — Penyelesaian Kunjungan

| Kode | Menu | Target Frappe | Tipe | Fase |
|---|---|---|---|---|
| 7.1 | Follow-up (kontrol 7 hari / 1 bulan / bila ada keluhan / tidak perlu) | Field `follow_up_type`, `follow_up_days` pada Encounter | C | P1 |
| 7.2 | Appointment Berikutnya | Tombol "Buat Appointment Kontrol" → `Patient Appointment` baru | C | P1 |
| 7.3 | Surat Kontrol | `Control Letter` / Print Format, tertaut Encounter asal | X | P2 |
| 7.4 | Rujukan (internal/eksternal) | `Visit Referral` | X | P2 |
| 7.5 | Edukasi / Instruksi Pulang | Field `patient_instructions` + print | C | P1 |
| 7.6 | Finalisasi / Penutupan Kunjungan | Visit → `CLOSED` bila: encounter submitted, billing selesai, farmasi selesai/NA, follow-up ditentukan | X | P1 |

### 3.9 Submodul 8 — Antrian & Display

| Kode | Menu | Target Frappe | Tipe | Fase |
|---|---|---|---|---|
| 8.1 | Display Antrian Poli / Dokter (nomor, poli, dokter, status, ruang) | Halaman **`/queue-display`** pada sistem yang sama, login akun perangkat `Queue Display`; realtime + polling | X | P1 |
| 8.2 | Display Antrian Kasir | Parameter `board=kasir` | X | P1 |
| 8.3 | Display Antrian Farmasi | Parameter `board=farmasi` | X | P1 |
| 8.4 | Monitoring Antrian (waktu tunggu, panggilan, no-show) | Dashboard (`Number Card`/`Dashboard Chart`) + report | X | P1 (dasar) |
| — | Voice Caller (suara pemanggil) | Web Speech API `id-ID` di halaman display | X | P2 |

> **Privasi display:** hanya nomor tiket, poli/ruang, status. **Tanpa nama pasien**, diagnosis, atau data billing.

### 3.10 Modul 9 — Cross-cutting

| Kode | Fungsi | Target Frappe | Tipe | Fase |
|---|---|---|---|---|
| X1 | Hak akses: Role + Permission + Scope + Status | Role, DocPerm, User Permission, `permission_query_conditions`, Role Profile → **lihat `user-role.md`** | C/X | P1 |
| X2 | Audit trail (who/what/when/before/after/reason) | `Version` (aktifkan *track changes*), `Activity Log`, `Access Log`; amendment wajib alasan | C | P1 (dasar) / P2 |
| X2b | Log akses chart pasien & break-glass | `Patient Chart Access Log`, `Break Glass Log` | X | P2 |
| X3 | Notification (reminder appointment, antrian, hasil, resep siap, bayar sukses, kontrol) | `Notification` (email P1) → WhatsApp/SMS | C | P1 (email) / P3 |
| X4 | Integration (BPJS/payer, Lab/PACS, Payment gateway, Mobile app, SATUSEHAT) | REST API + webhook + Integration Service role | X | P3 |

---

## 4. Boundary: apa yang masuk Rawat Jalan

| Masuk langsung ke app `simrs_mini` / konfigurasi Rawat Jalan | Memakai modul lain (terintegrasi, tidak dibangun ulang) |
|---|---|
| Appointment, Registrasi, Check-in, Queue | **Lab, Farmasi/Inventory, Keuangan** → modul bawaan Healthcare + ERPNext (Stock, Accounts) |
| Triase, Konsultasi dokter, Dokumentasi klinis | **Master Patient, Practitioner, Tarif, Obat, Diagnosis** → master Healthcare/ERPNext |
| Inisiasi order, Rujukan, Follow-up, Penutupan encounter | **BPJS/Klaim, SATUSEHAT, Payment Gateway** → integrasi fase P3 |

Alasan (sumber §67): Lab/Farmasi/Radiologi/Keuangan juga melayani Rawat Inap, IGD, MCU, dan eksternal, sehingga domain-nya tidak boleh "dimiliki" Rawat Jalan.

---

## 5. Source of Truth

| Data | Source of truth | DocType Frappe |
|---|---|---|
| Identitas pasien | Patient Master | `Patient` |
| Appointment | Appointment Management | `Patient Appointment` |
| Kedatangan & status alur | Registration / Check-in | `Outpatient Visit` |
| Queue | Queue Management | `Queue Ticket` |
| TTV | Triase | `Vital Signs` |
| SOAP, Diagnosis | Dokter / Clinical Record | `Patient Encounter` |
| Order lab & hasil | Dokter (order) / Laboratorium (hasil) | `Lab Test` (`Service Request`) |
| Resep | Dokter | `Medication Request` |
| Dispensing | Farmasi | `Pharmacy Dispense` |
| Tarif | Tariff Master | `Item Price` |
| Billing / Payment | Billing / Finance | `Sales Invoice` / `Payment Entry` |

Anti-pola: kasir menjadi sumber kebenaran tindakan klinis; farmasi mengubah isi diagnosis dokter.

---

## 6. Konsistensi Hirarki ↔ BPMN ↔ PRD ↔ DB

```text
HIRARKI SISTEM   (system-hierarchy.md)   Submodul = swimlane/domain, Menu = activity group
      ↕
BPMN             (rawat-jalan.bpmn)       Sub-menu = task; tiap task memuat "Hirarki: x.y"
      ↕
USER STORY / FR  (prd.md)                 FR-<MODUL>-nnn mengacu ke nomor menu
      ↕
DATABASE / API   (data-model.md)          DocType + endpoint dengan kolom "Menu"
```

Aturan perubahan: bila menu ditambah/diubah di sini, **empat dokumen lain** diperbarui pada commit yang sama.

---

## 7. Status Lifecycle (ringkas)

Rinci + aturan transisi ada di `data-model.md` §6.

```text
Appointment (native)   : Scheduled → Confirmed* → Checked In → Closed | Cancelled | No Show
Outpatient Visit (X)   : CHECKED_IN → WAITING_TRIAGE → IN_TRIAGE → WAITING_DOCTOR → IN_SERVICE ⇄ ON_HOLD
                         → SERVICE_COMPLETED → CLOSED     (cabang: ESCALATED, CANCELLED)
Queue Ticket (X)       : WAITING → CALLED → IN_SERVICE → COMPLETED | SKIPPED | CANCELLED
Service Order          : DRAFT → ORDERED → ACCEPTED → IN_PROGRESS → COMPLETED → RESULT_AVAILABLE | CANCELLED
Medication Request/Rx  : DRAFT → SIGNED → SENT → VERIFIED → PREPARING → READY → DISPENSED | CANCELLED
Payment                : UNPAID → PENDING → PAID | FAILED | REVERSED | REFUNDED
```

`*` Confirmed hanya bila fitur konfirmasi (1.1.5, P2) aktif. Nama status native diverifikasi saat Discovery.

---

## 8. Keputusan terbuka (perlu konfirmasi pemilik produk)

1. **Appointment sebagai kanal terpisah:** diasumsikan *patient-facing app* yang memanggil Appointment API; sistem inti tetap pemilik data. Bila yang dimaksud hanya portal pada site yang sama, cukup ubah baris 1.1.6 (tidak mengubah desain lain).
2. **Walk-in vs Appointment:** di Frappe Health, `Patient Appointment` adalah "pintu masuk" encounter. Walk-in saya modelkan sebagai appointment yang dibuat otomatis (`registration_source = Walk-in`). Konsep "Appointment ≠ Encounter" tetap terjaga karena Encounter baru lahir saat dokter memulai pelayanan.
3. **Outpatient Visit sebagai orkestrator** (DocType custom) alih-alih menumpuk status di Appointment — lihat ADR A-01 di `prd.md`.
4. **Radiologi & Rehab** ditunda ke P2. Apakah demo/mentor mengharuskan ada di MVP?
5. **BPJS:** MVP hanya label penjamin + eligibility manual. Billing BPJS (paket INA-CBG, bukan itemized) tidak dimodelkan di P1.
6. **APM/Kiosk** saat ini P2. Karena APM termasuk contoh fungsi inti yang dipikirkan, apakah versi minimal (check-in via kode booking/QR + ambil tiket walk-in pasien lama) dinaikkan ke P1?
