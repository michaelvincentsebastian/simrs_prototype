# PRD — SIMRS Mini (Rawat Jalan) di atas Frappe Healthcare v15

| | |
|---|---|
| **Versi / Status** | 0.2 — Draft |
| **Tanggal** | 2026-10-05 |
| **Owner** | Vincent |
| **Stack** | Frappe Framework v15 · ERPNext v15 · Frappe Healthcare (`healthcare`, `version-15`) · app custom `simrs_mini` |
| **Dokumen terkait** | `system-hierarchy.md` · `user-role.md` · `data-model.md` · `rawat-jalan.bpmn` · `ai-agent-prompt.md` |

---

## 1. Ringkasan

SIMRS Mini adalah sistem informasi rumah sakit skala kecil untuk **alur Rawat Jalan end-to-end**: pasien mendaftar (appointment atau walk-in), check-in, antri, triase/TTV, bertemu dokter, order lab, resep, bayar, ambil obat, dan kontrol ulang.

**Prinsip utama produk:**

> **Satu sistem, banyak role.** Semua fungsi (registrasi walk-in, APM, antrian, triase/TTV, dokter, penunjang, farmasi, kasir, display) berada di **satu aplikasi dan satu database**. User berbeda hanya karena **role** berbeda: menu yang terlihat, aksi yang boleh, dan data yang boleh dibuka. **Pengecualian:** Appointment (booking pasien) adalah kanal terpisah yang memanggil API sistem inti.

Dibangun dengan prinsip **native-first**: pakai Frappe Healthcare/ERPNext bila sudah ada; bangun custom hanya untuk celah yang terbukti (antrian, orkestrasi kunjungan, triase, dispensing, billing agregat, display).

## 2. Latar belakang & masalah

- Hirarki Rawat Jalan sudah terdefinisi (8 submodul, 24 role) tetapi belum ada produk yang bisa dijalankan.
- Frappe Healthcare menyediakan fondasi klinis (Patient, Appointment, Encounter, Vital Signs, Lab, Medication) tetapi **tidak memiliki** manajemen antrian, display, triase terstruktur, status alur kunjungan per tahap, dispensing rawat jalan, dan agregasi billing per kunjungan.
- Tanpa satu model data bersama, tiap unit cenderung punya "aplikasi" sendiri → data terpecah dan alur sulit dilacak.

## 3. Tujuan, non-tujuan, metrik

### 3.1 Tujuan

| ID | Tujuan |
|---|---|
| G-1 | Satu pasien dapat menyelesaikan seluruh alur Rawat Jalan di **satu sistem** tanpa input ganda antar-unit |
| G-2 | **Role-based access:** tiap user hanya melihat & mengubah yang menjadi tugasnya (contoh: perawat hanya TTV & antrian triase) |
| G-3 | Setiap kunjungan **dapat ditelusuri** dari Patient → Appointment → Check-in → Queue → Encounter → Order → Resep → Billing → Payment |
| G-4 | Data klinis tidak dihapus; koreksi pasca-final lewat jejak audit |
| G-5 | Pondasi yang bisa dikembangkan (BPJS, SATUSEHAT, radiologi) tanpa merombak hirarki |

### 3.2 Non-tujuan (MVP)

Rawat inap/IGD, bedah, rekam medis lintas faskes, klaim BPJS/INA-CBG, integrasi SATUSEHAT, PACS/DICOM, inventori multi-gudang kompleks, akuntansi penuh di luar Sales Invoice & Payment, multi-cabang, aplikasi mobile native.

### 3.3 Metrik keberhasilan (target awal — divalidasi saat UAT)

| Metrik | Target MVP |
|---|---|
| Skenario E2E (§9) lulus tanpa workaround manual | 100% |
| Uji akses per role (`user-role.md` §11) | 100% lulus |
| Nomor antrian ganda pada uji 2 loket serentak | 0 |
| Display antrian ter-update setelah pemanggilan | ≤ 3 detik |
| Data klinis dapat diubah setelah finalisasi tanpa amendment | 0 |
| Kunjungan `CLOSED` yang tidak punya jejak lengkap (§1 G-3) | 0 |

> Angka waktu tunggu rata-rata **sengaja tidak ditetapkan** sebelum ada data baseline.

## 4. Persona & role

Rinci di `user-role.md`. Ringkas (MVP):

| Persona | Role Frappe | Workspace | Tugas inti |
|---|---|---|---|
| Petugas pendaftaran | Registration Staff, Queue Officer | Registrasi | Walk-in, check-in, verifikasi, antrian |
| **Perawat** | Nursing User | **Triase** | Antrian triase, TTV, skrining, routing |
| Dokter | Physician | Dokter | Konsultasi, SOAP, diagnosis, order, resep, finalisasi |
| Petugas lab | Laboratory User | Penunjang | Terima order, hasil |
| Apoteker | Pharmacist | Farmasi | Verifikasi, dispensing |
| Kasir | Cashier | Kasir | Billing, pembayaran |
| Kepala poli | Outpatient Supervisor | Monitoring | Monitoring & override |
| Auditor | Clinical Auditor | Audit | Read-only audit |
| Admin | System Manager | Admin | User, master, konfigurasi |
| Pasien | `Patient` / `Appointment Channel Service` | — (Kanal Appointment) | Booking, lihat jadwal |
| Perangkat | Kiosk Device, Queue Display | `/kiosk`, `/queue-display` | Check-in mandiri, tampilan antrian |

## 5. Ruang lingkup & fase

| Fase | Isi | Kriteria selesai (exit) |
|---|---|---|
| **P0 Discovery** | Instal bench, verifikasi daftar V-01…V-13 (`data-model.md` §12), `discovery-report.md` | Semua V-xx terjawab; keputusan native vs custom tercatat |
| **P1 MVP** | Appointment oleh staf, Walk-in, Check-in, Antrian + Display, Triase/TTV, Dokter (SOAP, diagnosis, order lab, resep, finalisasi), Lab, Farmasi dasar, Kasir (tunai/debit/QRIS/transfer; penjamin sebagai *guaranteed*), Follow-up, role & workspace per role, audit trail dasar, dashboard dasar | Skenario A–D (§9) lulus di staging + uji akses lulus |
| **P2 Perluasan** | Kanal Appointment (patient-facing), Kiosk/APM, Radiologi & Rehab, Rujukan, Surat Kontrol, Refund, Amendment, Break-glass & log akses chart, suara pemanggil | Skenario E–F lulus |
| **P3 Integrasi** | BPJS/asuransi, SATUSEHAT, WhatsApp, klaim | Sesuai kontrak integrasi |

### Prioritas (MoSCoW) P1

- **Must:** FR registrasi/check-in/antrian/triase/dokter/farmasi/kasir, RBAC & workspace per role, finalisasi encounter terkunci, audit trail dasar.
- **Should:** dashboard waktu tunggu, notifikasi email, report monitor order.
- **Could:** print format tambahan, prioritas antrian.
- **Won't (P1):** semua item P2/P3.

## 6. Keputusan arsitektur (ADR)

| ID | Keputusan | Alternatif | Konsekuensi |
|---|---|---|---|
| **A-00** | **Satu sistem (1 site, 1 app, 1 DB, 1 login), tampilan per role via Workspace + RBAC** | Aplikasi terpisah per unit | Tidak ada sinkronisasi; keamanan wajib di server (menu tersembunyi ≠ aman) |
| A-01 | `Outpatient Visit` (custom) sebagai orkestrator status alur | Menambah status ke Appointment/Encounter | Lifecycle sumber (CHECKED_IN … CLOSED) tidak bentrok dengan status native |
| A-02 | Walk-in = `Patient Appointment` otomatis (`registration_source = Walk-in`) | Encounter tanpa Appointment | Selaras dengan model Healthcare (Appointment = pintu masuk); Encounter baru lahir saat dokter mulai |
| A-03 | Appointment = **kanal terpisah** → Appointment API; `Patient Appointment` tetap source of truth | Portal pada site yang sama | Kanal bisa dikembangkan terpisah; API harus stabil & aman |
| A-04 | Native-first; custom DocType hanya untuk Queue, Visit, Triage, Dispense, (P2: Referral, Control Letter, Amendment) | Bangun semua custom | Mengikuti upgrade Healthcare; Discovery menentukan |
| A-05 | Finalisasi klinis = **Submit** `Patient Encounter`; koreksi = amendment (P2) | Flag "final" custom | Memakai mekanisme native cancel/amend + audit |
| A-06 | Billing lewat **aggregator** (charge dari transaksi layanan, bukan input kasir) | Kasir input manual | Traceability & anti-fraud; kasir tidak "mengarang" layanan |
| A-07 | Display/Kiosk = akun perangkat dengan hak minimum pada sistem yang sama | Aplikasi display terpisah | Satu codebase; endpoint display tanpa PHI |
| A-08 | Scope dokter via User Permission + **Patient Summary read-through** | Dokter bisa baca semua encounter | Riwayat lintas dokter tetap terlihat sebagai ringkasan terkurasi |

## 7. Alur bisnis (ringkas)

Lengkap: `rawat-jalan.bpmn` (lane = role; tiap task memuat nomor menu hirarki).

```text
PLAN      Appointment (Kanal Appointment / staf)   atau   Walk-in
ARRIVAL   Check-in → verifikasi identitas & penjamin → Visit CHECKED_IN → tiket Triase
ASSESS    Triase: TTV + skrining → (eskalasi IGD) | routing ke antrian Dokter
CARE      Dokter: chart → S/O → A + diagnosis → plan
ORDER     (opsional) order lab → hasil → review → resep
CLOSE-MED Resume + finalisasi (Submit Encounter)
FULFILL   paralel: Farmasi (verifikasi → dispensing → serah)  ||  Kasir (billing → bayar → kwitansi)
FOLLOW-UP kontrol ulang / edukasi → Visit CLOSED
```

## 8. Kebutuhan fungsional

Notasi: **FR-<MODUL>-nnn** · kolom *Menu* mengacu ke `system-hierarchy.md` · *Role* = aktor utama · prioritas Must/Should/Could.

### 8.1 Akses & navigasi (lintas modul)

| ID | Kebutuhan | Menu | Prioritas | Fase |
|---|---|---|---|---|
| FR-ACC-001 | Satu halaman login untuk semua user; setelah login diarahkan ke Workspace sesuai role | X1 | Must | P1 |
| FR-ACC-002 | Sidebar hanya memuat Workspace/menu yang diizinkan role user; user multi-role melihat gabungan | X1 | Must | P1 |
| FR-ACC-003 | Setiap aksi & data dicek di server; akses langsung URL/API tanpa izin → 403 | X1 | Must | P1 |
| FR-ACC-004 | Scope: dokter hanya Appointment/Encounter miliknya; staf poli sesuai Medical Department | X1 | Must | P1 |
| FR-ACC-005 | Perubahan data kritis tercatat (siapa, kapan, sebelum/sesudah); koreksi pasca-final wajib alasan | X2 | Must | P1 / P2 |
| FR-ACC-006 | Akun perangkat (Kiosk, Display) hanya mengakses endpoint minimum, tanpa PHI | X1 | Must | P1 |

### 8.2 Registrasi (1.x)

| ID | Kebutuhan | Menu | Role | Prioritas | Fase |
|---|---|---|---|---|---|
| FR-REG-001 | Staf membuat/mengubah/membatalkan Appointment (alasan wajib saat batal) | 1.1.2–4, 1.1.7 | Registration | Must | P1 |
| FR-REG-002 | Cari jadwal praktisi (poli, dokter, tanggal, slot) | 1.1.1 | Registration | Must | P1 |
| FR-REG-003 | Walk-in dalam **satu layar**: cari pasien (MRN/NIK/nama) → pasien baru bila belum ada → poli/dokter/penjamin → appointment walk-in → check-in → tiket | 1.2 | Registration | Must | P1 |
| FR-REG-004 | Cegah duplikat MRN: peringatan jika NIK sama / nama+tanggal lahir sama | 1.5 | Registration | Must | P1 |
| FR-REG-005 | Pilih penjamin (Umum / Asuransi / BPJS); eligibility manual pada P1 | 1.6 | Registration | Must | P1 |
| FR-REG-006 | Check-in idempoten: membuat `Outpatient Visit` + tiket Triase; tidak bisa check-in dua kali | 1.4 | Registration | Must | P1 |
| FR-REG-007 | Cetak/kirim bukti pendaftaran (booking ID/QR, nomor antrian) | 1.2.4 | Registration | Should | P1 |
| FR-REG-008 | **Kanal Appointment**: pasien mencari slot, booking, reschedule, cancel via Appointment API | 1.1.6 | Patient | Must | P2 |
| FR-REG-009 | **APM/Kiosk**: check-in via kode booking/QR; walk-in pasien lama | 1.3 | Kiosk Device | Should | P2 |
| FR-REG-010 | Konfirmasi/reminder appointment (email P1, WhatsApp P3) | 1.1.5, X3 | Sistem | Could | P2 |

### 8.3 Antrian & Display (1.7, 8.x)

| ID | Kebutuhan | Prioritas | Fase |
|---|---|---|---|
| FR-QUE-001 | Nomor antrian harian unik per (jenis antrian, prefix); aman terhadap penerbitan serentak | Must | P1 |
| FR-QUE-002 | Status tiket WAITING → CALLED → IN_SERVICE → COMPLETED / SKIPPED / CANCELLED; recall menambah `call_count`; otomatis skip setelah batas | Must | P1 |
| FR-QUE-003 | Antrian terpisah per tahap: Registrasi, Triase, Dokter (per poli), Farmasi, Kasir | Must | P1 |
| FR-QUE-004 | Display `/queue-display` per board (poli/kasir/farmasi): nomor, ruang, status — **tanpa nama pasien** | Must | P1 |
| FR-QUE-005 | Display realtime dengan fallback polling | Must | P1 |
| FR-QUE-006 | Monitoring antrian: waktu tunggu, jumlah menunggu, no-show | Should | P1 |
| FR-QUE-007 | Suara pemanggil (id-ID) | Could | P2 |

### 8.4 Triase (2.x)

| ID | Kebutuhan | Role | Prioritas | Fase |
|---|---|---|---|---|
| FR-TRI-001 | Nurse melihat **antrian triase** dan memanggil pasien | Nursing | Must | P1 |
| FR-TRI-002 | Identifikasi pasien (tiket/MRN) sebelum input | Nursing | Must | P1 |
| FR-TRI-003 | Input TTV (TD, nadi, RR, suhu, SpO2, BB, TB; BMI otomatis; opsional GCS, nyeri); peringatan nilai tak wajar **bukan diagnosis** | Nursing | Must | P1 |
| FR-TRI-004 | Skrining awal: keluhan utama, risiko jatuh, alergi, nyeri, infeksi → hasil Normal / Perlu Perhatian / Perlu Eskalasi | Nursing | Must | P1 |
| FR-TRI-005 | Routing: selesai → antrian dokter; eskalasi → Visit `ESCALATED` (alihkan IGD) | Nursing | Must | P1 |
| FR-TRI-006 | Nurse **tidak** dapat melihat/ubah Appointment, Encounter, Resep, Billing | Sistem | Must | P1 |

### 8.5 Pelayanan Dokter (3.x)

| ID | Kebutuhan | Menu | Prioritas | Fase |
|---|---|---|---|---|
| FR-DOC-001 | "My Queue" difilter ke dokter login; panggil, lewati, panggil ulang, mulai | 3.1–3.2 | Must | P1 |
| FR-DOC-002 | Patient Chart satu layar: identitas, TTV terbaru, alergi, riwayat kunjungan (ringkasan), obat aktif, hasil lab | 3.3 | Must | P1 |
| FR-DOC-003 | Dokumentasi SOAP terstruktur terkait Encounter + dokter + waktu (bukan blob tanpa metadata) | 3.4–3.6, 3.10 | Must | P1 |
| FR-DOC-004 | Diagnosis (utama/sekunder) dengan pencarian kode ICD-10; tidak hard-delete setelah final | 3.7 | Must | P1 |
| FR-DOC-005 | Order lab & tindakan; **order ≠ hasil**; status order terlihat dokter | 3.8, 4.4 | Must | P1 |
| FR-DOC-006 | Resep (draft → signed → sent) → antrian Farmasi | 3.9 | Must | P1 |
| FR-DOC-007 | Review hasil lab dan perbarui assessment | 4.5 | Must | P1 |
| FR-DOC-008 | Resume medis (11 elemen minimum) dapat dicetak | 3.11 | Must | P1 |
| FR-DOC-009 | **Finalisasi** hanya bila checklist lengkap (anamnesis, pemeriksaan, ≥1 diagnosis, plan, follow-up diputuskan); setelah itu terkunci | 3.12 | Must | P1 |
| FR-DOC-010 | Order radiologi/rehab; rujukan internal/eksternal (**intent**, bukan encounter baru) | 3.8 | Should | P2 |

### 8.6 Penunjang (4.x)

| ID | Kebutuhan | Prioritas | Fase |
|---|---|---|---|
| FR-LAB-001 | Lab melihat order masuk ke unitnya, menerima, mencatat spesimen | Must | P1 |
| FR-LAB-002 | Input hasil → validasi (`LabTest Approver`) → publikasi ke chart dokter | Must | P1 |
| FR-LAB-003 | Report monitor order per status | Should | P1 |
| FR-LAB-004 | Lab tidak mengubah order klinis dokter atau billing langsung | Must | P1 |

### 8.7 Farmasi (5.x)

| ID | Kebutuhan | Prioritas | Fase |
|---|---|---|---|
| FR-PHA-001 | Daftar resep masuk (Signed/Sent) | Must | P1 |
| FR-PHA-002 | Verifikasi (alergi, duplikasi/interaksi, stok); masalah → **klarifikasi ke dokter**, resep tidak diubah diam-diam | Must | P1 |
| FR-PHA-003 | Dispensing: persiapan → label → final check → submit (stok keluar) | Must | P1 |
| FR-PHA-004 | Penyerahan + konseling; status DISPENSED; tiket Farmasi selesai | Must | P1 |

### 8.8 Kasir / Billing (6.x)

| ID | Kebutuhan | Prioritas | Fase |
|---|---|---|---|
| FR-BIL-001 | Billing per kunjungan dari **transaksi layanan** (konsultasi, tindakan, lab, obat); idempoten | Must | P1 |
| FR-BIL-002 | Tarif dari `Item Price` per Price List penjamin (tidak hard-code) | Must | P1 |
| FR-BIL-003 | Pembayaran: tunai, debit/kredit, QRIS, transfer; pembayaran parsial opsional | Must | P1 |
| FR-BIL-004 | Penjamin asuransi/korporat: invoice ke Customer penjamin, status *Guaranteed* | Must | P1 |
| FR-BIL-005 | Kwitansi (print/PDF) | Must | P1 |
| FR-BIL-006 | Tidak ada penghapusan pembayaran; refund/koreksi lewat reversal + approval | Must | P2 |
| FR-BIL-007 | Kasir tidak dapat mengubah data klinis | Must | P1 |

### 8.9 Penyelesaian Kunjungan (7.x)

| ID | Kebutuhan | Prioritas | Fase |
|---|---|---|---|
| FR-CLS-001 | Follow-up: kontrol N hari / bila ada keluhan / tidak perlu | Must | P1 |
| FR-CLS-002 | Buat appointment kontrol dari Encounter | Must | P1 |
| FR-CLS-003 | Instruksi pulang / edukasi (cetak) | Should | P1 |
| FR-CLS-004 | Visit `CLOSED` otomatis bila billing Paid/Guaranteed, farmasi Dispensed/NA, follow-up diputuskan; override Supervisor wajib alasan | Must | P1 |
| FR-CLS-005 | Surat kontrol, rujukan | Should | P2 |

## 9. Skenario UAT (diturunkan dari BPMN)

| ID | Skenario | Fase |
|---|---|---|
| **A** | **Walk-in pasien baru**: registrasi → triase → dokter → resep → bayar → ambil obat → selesai | P1 |
| **B** | **Appointment (dibuat staf)**: check-in → alur sama; pasien lama (tanpa MRN baru) | P1 |
| **C** | **Dengan lab**: order → hasil → review → resep → bayar | P1 |
| **D** | **Eskalasi triase** ke IGD; **no-show/skip**; **penjamin asuransi** (guaranteed) | P1 |
| E | Appointment lewat Kanal Appointment + Kiosk check-in | P2 |
| F | Rujukan internal, amendment pasca-final, refund | P2 |
| **R** | **Akses per role**: tiap role login → hanya menu sendiri; akses langsung ke menu lain → 403 (`user-role.md` §11) | P1 |

Kriteria lulus tiap skenario: seluruh status berubah sesuai `data-model.md` §6, jejak lengkap (G-3), tidak ada input ganda.

## 10. Kebutuhan non-fungsional

| Area | Kebutuhan |
|---|---|
| **Keamanan & privasi** | RBAC di server; scope per dokter/poli; field sensitif (NIK) permlevel; tidak ada PHI di log/exception; akun perangkat hak minimum; password policy & sesi timeout via System Settings. Kepatuhan regulasi data kesehatan/rekam medis Indonesia (mis. UU PDP, aturan rekam medis elektronik) **dikonfirmasi dengan pihak legal/compliance** sebelum penggunaan nyata |
| **Audit** | `track_changes` pada DocType klinis & keuangan; koreksi butuh alasan; (P2) log akses chart & break-glass |
| **Integritas data** | Tidak ada delete klinis/keuangan; unique constraint tiket & Visit–Appointment; transaksi tunggal per aksi |
| **Kinerja (target awal)** | Halaman utama p95 ≤ 2 dtk pada ≥ 25 user bersamaan; display ≤ 3 dtk — divalidasi pada staging |
| **Ketersediaan & backup** | Backup harian DB + file (`bench backup`); uji restore sebelum go-live |
| **Lokalisasi** | Bahasa UI Indonesia, zona waktu Asia/Jakarta, mata uang IDR, format tanggal lokal |
| **Kegunaan** | Satu layar per tugas; tombol aksi selaras role; display terbaca dari jarak jauh |
| **Pemeliharaan** | Tanpa modifikasi core; semua via app `simrs_mini` + fixtures + patches idempoten; test otomatis di CI |
| **Observabilitas** | Error log Frappe, report waktu tunggu, health-check endpoint |

## 11. Data & integrasi

- **Data master (seed):** Medical Department, Practitioner & jadwal, Service Unit/ruang, Appointment Type, Item & Item Price (konsultasi, lab, obat dasar), Price List per penjamin, Mode of Payment, ICD-10 sampel, Role Profile & user demo.
- **Integrasi P1:** hanya internal (ERPNext Stock/Accounts, email).
- **Integrasi P2:** Appointment API untuk Kanal Appointment.
- **Integrasi P3:** BPJS/asuransi, SATUSEHAT, WhatsApp, payment gateway.

## 12. Laporan & dashboard (P1)

Visit Timeline, Waiting Time per Poli, Service Order Monitor, Kunjungan Harian (per poli & sumber), No-show Rate, Pendapatan per Kunjungan per penjamin (`data-model.md` §11).

## 13. Risiko & mitigasi

| ID | Risiko | Dampak | Mitigasi |
|---|---|---|---|
| R-1 | Nama/perilaku DocType Healthcare v15 berbeda dari asumsi | Rework | **Fase 0 Discovery** + native-first |
| R-2 | Order lab/resep baru terbentuk saat **Submit** Encounter → dokter tak bisa review hasil sebelum finalisasi | Alur klinis tidak natural | Opsi B: submit setelah order, review hasil sebagai *result review* + addendum (V-04) |
| R-3 | Healthcare Invoicing native bentrok dengan billing aggregator | Tagihan ganda | Matikan invoicing otomatis native (V-05) |
| R-4 | `System Manager` punya akses PHI luas | Melanggar "admin ≠ clinical user" | Audit & pangkas DocPerm (V-07) |
| R-5 | Scope dokter menyembunyikan riwayat dokter lain | Dokter kurang konteks | Patient Summary read-through (A-08) |
| R-6 | Menu disembunyikan tapi endpoint terbuka | Kebocoran data | Guard server + test akses (FR-ACC-003) |
| R-7 | Tidak ada akses ke rumah sakit/mentor klinis untuk validasi alur | Alur tidak realistis | Review rutin dengan pakar domain; tandai asumsi |
| R-8 | Scope creep (kiosk, radiologi, BPJS) | MVP molor | Fase P2/P3 dikunci; perubahan lewat ADR |
| R-9 | Display publik membocorkan PHI | Privasi | Hanya nomor tiket + ruang; akun perangkat read-only |

## 14. Asumsi

1. Satu rumah sakit/klinik, satu site Frappe (tanpa multi-company).
2. Bahasa pengguna Indonesia; label UI dalam Indonesia, nama teknis Inggris.
3. Kanal Appointment dibangun terpisah (P2) dan berkomunikasi lewat Appointment API.
4. Penjamin BPJS pada P1 hanya label + eligibility manual.
5. Perangkat: PC loket/ruang, printer tiket/kwitansi, 1–2 layar display.

## 15. Pertanyaan terbuka

1. Kanal Appointment: aplikasi terpisah (asumsi saat ini) atau portal pada site yang sama?
2. APM/Kiosk versi minimal dinaikkan ke P1?
3. Cashier boleh Submit invoice atau otomatis oleh aggregator?
4. Satu orang merangkap Registration + Queue Officer pada MVP?
5. Pembayaran BPJS (paket) seperti apa pada tahap lanjut?
6. Siapa pakar domain yang mereview alur sebelum UAT?

## 16. Traceability

| Hirarki (`system-hierarchy.md`) | BPMN | FR | DocType / API (`data-model.md`) |
|---|---|---|---|
| 1.1–1.7 Registrasi | Lane Pasien, Kanal Appointment, Registrasi, Sistem | FR-REG-* | `Patient`, `Patient Appointment`, `Outpatient Visit`, `registration.*`, `appointment_api.*` |
| 2.x Triase | Lane Perawat | FR-TRI-* | `Vital Signs`, `Triage Assessment`, `triage.*` |
| 3.x Dokter | Lane Dokter | FR-DOC-* | `Patient Encounter`, `doctor.*` |
| 4.x Penunjang | Lane Penunjang | FR-LAB-* | `Lab Test` |
| 5.x Farmasi | Lane Farmasi | FR-PHA-* | `Medication Request`, `Pharmacy Dispense`, `pharmacy.*` |
| 6.x Kasir | Lane Kasir | FR-BIL-* | `Sales Invoice`, `Payment Entry`, `billing.*` |
| 7.x Penyelesaian | Sistem, Registrasi | FR-CLS-* | `closure.*` |
| 8.x Antrian & Display | Sistem | FR-QUE-* | `Queue Ticket`, `queue.*` |
| X1–X4 Cross-cutting | — | FR-ACC-* | Role, Workspace, `Version` |

## 17. Glosarium

**Appointment** rencana kunjungan · **Encounter** peristiwa pelayanan aktual · **Visit** orkestrator status kunjungan (custom) · **TTV** tanda tanda vital · **SOAP** Subjective-Objective-Assessment-Plan · **APM** Anjungan Pendaftaran Mandiri · **MRN** nomor rekam medis · **Workspace** halaman beranda per role pada Frappe Desk · **Role Profile** paket role · **RBAC** role-based access control.
