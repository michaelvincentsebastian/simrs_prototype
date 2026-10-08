# PRD — SIMRS Mini (Rawat Jalan) di atas Frappe Healthcare v15

| | |
|---|---|
| **Versi / Status** | 0.3 — Synchronized with Interactive Mockup (Current) |
| **Tanggal** | 2026-10-08 |
| **Owner** | Vincent |
| **Stack** | Prototype Web App (Vanilla JS + Tailwind CSS + Web Speech/Audio API) · Target Frappe v15 (ERPNext v15 + Frappe Healthcare `version-15`) · App custom `simrs_mini` |
| **Dokumen terkait** | `system-hierarchy.md` · `user-role.md` · `data-model.md` · `bpmn/rawat_jalan/` · `api/simrs-update-v2.json` · `user-role.csv` |

---

## 1. Ringkasan

SIMRS Mini adalah sistem informasi rumah sakit untuk **alur Rawat Jalan end-to-end**: pasien mendaftar (appointment atau walk-in), check-in mandiri/loket, antrian multi-prefix dengan audio bell, triase/TTV terstruktur, konsultasi dokter RME SOAP, order lab patologi klinik, resep formularium, telaah & dispensing farmasi 7-benar, kasir billing agregat (multi-metode: tunai, debit, kartu kredit, QRIS, penjamin), penyerahan obat, dan penutupan kunjungan.

**Prinsip utama produk:**

> **Satu sistem, banyak role.** Semua fungsi (registrasi walk-in, BPJS/SEP, APM kiosk, antrian, triase/TTV, dokter, penunjang lab, farmasi, kasir, audit, monitoring SLA, dan TV display) berada di **satu aplikasi dan satu database**. User berbeda hanya karena **role** berbeda: menu yang terlihat, aksi yang boleh, dan data yang boleh dibuka. **Pengecualian:** Appointment (booking pasien) adalah kanal terpisah yang memanggil API sistem inti.

Dibangun dengan prinsip **native-first**: pakai Frappe Healthcare/ERPNext bila sudah ada; bangun custom hanya untuk celah yang terbukti (antrian audio-visual, orkestrasi kunjungan, triase terstruktur, dispensing farmasi, billing agregat, resume medis Permenkes RI).

## 2. Latar belakang & masalah

- Hirarki Rawat Jalan telah didefinisikan (5 submodul inti stakeholder `SIMRS-0.1.hirarki` + 3 unit pendukung), dan kini telah dibuktikan melalui **prototipe aplikasi web interaktif** yang berfungsi penuh (`index.html`).
- Frappe Healthcare menyediakan fondasi klinis (Patient, Appointment, Encounter, Vital Signs, Lab, Medication) tetapi **tidak memiliki** manajemen antrian berjenjang, TV display zero-PHI, triase terstruktur ESI, status alur kunjungan per tahap, dispensing rawat jalan dengan telaah 7-benar, agregasi billing otomatis lintas departemen, dan template cetak standar regulasi Indonesia (SEP BPJS, Resume Medis Permenkes RI).
- Melalui prototipe saat ini, seluruh interaksi antarmuka pengguna, format cetak resmi, alur audio antrian, dan matriks 70 kewenangan RBAC telah divalidasi sebelum dipatenkan ke dalam backend Frappe Framework v15.

## 3. Tujuan, non-tujuan, metrik

### 3.1 Tujuan

| ID | Tujuan |
|---|---|
| G-1 | Satu pasien dapat menyelesaikan seluruh alur Rawat Jalan di **satu sistem** tanpa input ganda antar-unit |
| G-2 | **Role-based access:** tiap user hanya melihat & mengubah yang menjadi tugasnya (contoh: perawat hanya TTV & antrian triase) |
| G-3 | Setiap kunjungan **dapat ditelusuri** dari Patient → Appointment → Check-in → Queue → Encounter → Order → Resep → Billing → Payment → Closed |
| G-4 | Data klinis tidak dihapus; koreksi pasca-final lewat jejak audit (`AuditService`) |
| G-5 | Pondasi yang siap terintegrasi (BPJS V-Claim/SEP, SATUSEHAT encounter/vitals via `FrappeApiClient`) |

### 3.2 Non-tujuan (MVP Rawat Jalan)

Rawat inap/ranap, IGD bedah intensif, rekam medis lintas institusi faskes eksternal, bridging klaim otomatis BPJS INA-CBG (hanya format verifikasi & SEP internal), PACS/DICOM server, akuntansi multi-gudang kompleks.

### 3.3 Metrik keberhasilan

| Metrik | Target Prototipe & MVP | Status Current Mockup |
|---|---|---|
| Skenario E2E (§9) lulus tanpa workaround manual | 100% | ✅ Tervalidasi pada Web App |
| Uji akses per role (`user-role.md` & `user-role.csv`) | 100% (70/70 aksi) | ✅ Tervalidasi di Role Inspector |
| Nomor antrian ganda pada penerbitan serentak | 0 | ✅ Sequence per prefix terisolasi |
| Latensi panggilan antrian display & audio suara | ≤ 1 detik | ✅ Web Speech + Web Audio Synthesizer |
| Data klinis dapat diubah setelah finalisasi | 0 (terkunci otomatis) | ✅ Finalisasi me-lock status & form |
| Waktu tunggu total terpantau terhadap SLA Kemenkes RI (< 60 mnt) | 100% kunjungan terlacak | ✅ Dashboard SLA Live Monitoring |

## 4. Persona & role

Daftar peran operasional yang aktif pada prototipe web app interaktif:

### 4.1 Lima Akun Demo Inti (1-Klik Login):
| Persona | Role Key | Akun / Password | Workspace Landing | Tugas & Kewenangan Inti |
|---|---|---|---|---|
| **Petugas Pendaftaran RJ** | `REGISTRATION_STAFF` | `staf.budi` / `registrasi123` | `registrasi` | Walk-in registration (pasien baru/lama) dengan ID format `REG-WALK-[random char]`, jam registrasi (`registeredAt`), cek duplikasi NIK, verifikasi penjamin, rujukan BPJS & cetak SEP, cetak tiket triase & slip bukti pendaftaran resmi (tanpa antrian/pemanggilan loket). |
| **Perawat Triase** | `NURSING_USER` | `perawat.siti` / `perawat123` | `ttv-queue` | Pemantauan antrian triase stasiun, pemanggilan audio, pengukuran TTV lengkap (TD, Nadi, Suhu, RR, SpO2), kalkulasi BMI otomatis, keluhan utama, risiko jatuh, skala nyeri VAS 0-10, riwayat alergi, penetapan ESI, routing dokter. |
| **Dokter Rawat Jalan** | `PHYSICIAN` | `dokter.hendra` / `dokter123` | `doctor-queue` | My Queue antrian dokter spesialis, telaah ringkasan TTV & alergi, pengisian rekam medis SOAP, penetapan diagnosis ICD-10 utama, order uji lab patologi klinik, tindakan medis berbayar, resep formularium online, rujukan online lintas spesialis/lab/radiologi/rehab, simpan draft vs finalisasi encounter, cetak resume medis resmi 11 elemen Permenkes RI. |
| **Kasir Rawat Jalan** | `CASHIER` | `kasir.linda` / `kasir123` | `cashier-queue` | Pemantauan tagihan siap bayar (`SERVICE_COMPLETED`), rekapitulasi agregasi biaya otomatis (pendaftaran, konsultasi dokter, asuhan keperawatan, tindakan, lab, obat), penambahan tindakan susulan, pemrosesan multi-metode pembayaran (Tunai, Debit, Kartu Kredit, QRIS, Jaminan Asuransi, Jaminan Perusahaan), penerbitan & cetak kwitansi resmi bernomor. |
| **Display Antrian TV** | `QUEUE_DISPLAY` | `display.tv` / `display123` | `display` | Layar TV publik ruang tunggu dengan kebijakan ketat **Zero-PHI** (hanya menampilkan nomor tiket & ruang poli, tanpa nama pasien/diagnosis/biaya). Dilengkapi pemanggil audio bell berbasis Web Audio Synthesizer & Web Speech API bahasa Indonesia. Mendukung tab Poli/Dokter dan Kasir/Farmasi. |

### 4.2 Workstation Pendukung Lainnya yang Tersedia di Prototipe:
| Workstation | Role Terkait | Route / Workspace | Deskripsi Fungsi |
|---|---|---|---|
| **Laboratorium** | `Laboratory User` | `lab` | Worklist permintaan lab patologi klinik (CBC, Lipid, GDS, Ginjal, Asam Urat), penerimaan spesimen, input hasil parameter dengan batas normal pria/wanita, rilis hasil ke RME dokter, cetak sertifikat hasil lab. |
| **Farmasi Rawat Jalan** | `Pharmacist` | `farmasi` | Inbox resep elektronik dokter, telaah resep 7-benar administratif & klinis, penyiapan/dispensing dengan pemotongan stok otomatis, pemanggilan nomor tiket farmasi F-xxx, penyerahan obat & edukasi KIE. |
| **Monitoring Rawat Jalan** | `Outpatient Supervisor` | `monitoring` | Pemantauan kepatuhan standar waktu tunggu Kemenkes RI (< 60 menit), timeline lifecycle pasien, audit waktu per tahap, override status administratif bila kunjungan tertahan. |
| **Audit Trail** | `Clinical Auditor` | `audit` | Inspeksi jejak audit log sistem yang tidak dapat diubah (immutable), penelusuran status transitions, kepatuhan pengisian rekam medis. |
| **Kiosk / APM** | `Kiosk Device` | `kiosk` | Anjungan Pendaftaran Mandiri layar sentuh untuk pasien: check-in mandiri dengan QR/kode booking, walk-in mandiri pasien lama dengan NIK/MRN, dan cetak tiket antrian termal. |

## 5. Ruang lingkup & fase

| Fase | Isi Pekerjaan | Status | Kriteria Selesai |
|---|---|---|---|
| **Fase Mockup Interaktif (Current)** | Membangun UI/UX workstation klinis berdensitas tinggi, state machine kunjungan lengkap, audio synthesizer pemanggil, master data, format cetak resmi (Tiket termal, Slip, SEP, Kwitansi, Resume Permenkes, Hasil Lab), RBAC 70 aksi, dan API client. | **SELESAI (Current)** | Seluruh alur end-to-end teruji lancar di browser (`./start.sh`). |
| **P0 Discovery Frappe** | Audit DocType native Frappe Healthcare v15, verifikasi checklist V-01..V-13 (`data-model.md` §12), finalisasi `discovery-report.md`. | Next Backend | Semua keputusan native vs custom tercatat di bench nyata. |
| **P1 Backend Core (`simrs_mini`)** | Implementasi DocType custom (`Outpatient Visit`, `Queue Ticket`, `Triage Assessment`, `Pharmacy Dispense`), services layer di Python, thin `@frappe.whitelist()` API, RBAC fixtures, dan migrasi state machine dari prototype. | To Do | Skenario A–D lulus di Frappe staging + permission tests pass. |
| **P2 Perluasan & Bridging** | Kanal Appointment mandiri pasien (Web/WhatsApp), aktivasi penuh rujukan internal/eksternal, surat kontrol, integrasi SATUSEHAT live (bridging via `js/api-client.js`). | To Do | Transmisi encounter SatuSehat & BPJS V-Claim sukses. |

## 6. Keputusan arsitektur (ADR)

| ID | Keputusan | Alternatif | Konsekuensi & Rationale |
|---|---|---|---|
| **A-00** | **Satu sistem (1 site, 1 app, 1 DB, 1 login), tampilan per role via Workspace + RBAC** | Aplikasi terpisah per unit | Tidak ada sinkronisasi; keamanan wajib di server (menu tersembunyi ≠ aman). |
| A-01 | `Outpatient Visit` (custom) sebagai orkestrator status alur kunjungan | Menambah status ke Appointment/Encounter | Siklus hidup kunjungan (`REGISTERED` … `CLOSED`) tidak mengotori status dokumen native. |
| A-02 | Walk-in = `Patient Appointment` otomatis (`registration_source = Walk-in`) | Encounter tanpa Appointment | Selaras dengan filosofi Frappe Healthcare (Appointment sebagai pintu masuk admisi). |
| A-03 | Appointment booking pasien = **kanal terpisah** via API; `Patient Appointment` tetap *source of truth* | Portal pasien di Desk internal | Keamanan Desk terjaga; pasien tidak memiliki akses ke lingkungan kerja staf. |
| A-04 | Native-first; custom DocType hanya untuk Queue, Visit, Triage, Dispense, dan agregator billing | Bangun semua custom dari nol | Memanfaatkan maintenance & update resmi dari Frappe Healthcare v15. |
| A-05 | Finalisasi klinis = **Submit** `Patient Encounter`; koreksi pasca-final = amendment request | Flag draft boolean biasa | Menjamin kepatuhan standar hukum rekam medis (tidak dapat diubah diam-diam). |
| A-06 | Billing lewat **aggregator** otomatis (menghimpun charge layanan, lab, tindakan, obat) | Input manual item oleh kasir | Mencegah kebocoran pendapatan (*fraud prevention*) dan kesalahan penagihan. |
| A-07 | Display TV & Kiosk = akun perangkat dengan hak minimum tanpa Desk | Aplikasi terpisah di server lain | Satu basis kode terintegrasi; endpoint display dibatasi ketat tanpa data PHI. |
| A-08 | Scope dokter via DPJP assignment + **Patient Summary read-through** | Dokter bebas buka rekam medis pasien lain | Privasi data rekam medis terjaga sesuai regulasi kerahasiaan medis. |
| **A-09** | **Audio Synthesizer & Web Speech API untuk Panggilan Antrian** | File MP3 rekaman statis | Pemanggilan antrian bersifat dinamis (menyebutkan nomor tiket & poli secara natural bahasa Indonesia tanpa dependensi file audio eksternal yang lambat). Dilengkapi lonceng D5-A5 chime via Web Audio Context. |
| **A-10** | **Separation of Duties: Pemisahan Apoteker dan Kasir** | Penggabungan peran kasir & farmasi | Apoteker fokus pada telaah klinis 7-benar dan dispensing stok; kasir fokus pada verifikasi pembayaran dan penagihan penjamin. Menghilangkan celah kecurangan. |
| **A-11** | **In-Browser Standardized Document Generators** | Server-side PDF template kaku | Prototipe menyediakan generator dokumen cetak instan berstandar resmi (Slip Pendaftaran, Tiket Termal 58/80mm, SEP BPJS, Kwitansi Kasir, Resume Medis Permenkes RI 11-elemen, dan Sertifikat Lab). |
| **A-12** | **Dual-Mode Architecture (Simulated vs Live API)** | Hanya frontend statis | Prototipe dapat berjalan mandiri 100% offline (LocalStorage) atau dialihkan ke mode live (`js/api-client.js`) yang terhubung ke server Frappe & endpoint SatuSehat. |

## 7. Alur bisnis (ringkas)

Sesuai BPMN pada [`docs/bpmn/rawat_jalan/00-end-to-end.bpmn`](file:///home/vincent/Projects/prototype_simrs/docs/bpmn/rawat_jalan/00-end-to-end.bpmn):

```text
1. REGISTRASI   Pasien datang (Walk-in / Booking APM) → Cek duplikasi NIK → Pilih Poli & Dokter DPJP
                → Verifikasi Penjamin (Umum/BPJS/Asuransi) → Terbit Tiket Triase (T-xxx) & Slip Pendaftaran
2. TRIASE       Perawat panggil antrian (audio bell) → Mulai triase (IN_TRIAGE) → Pengukuran TTV
                → Hitung BMI otomatis → Skrining keluhan, risiko jatuh, nyeri VAS, alergi
                → Klasifikasi ESI (Normal/Perhatian/Eskalasi) → Routing ke Dokter (WAITING_DOCTOR) / Eskalasi IGD
3. DOKTER       Dokter panggil My Queue → Buka RME (IN_SERVICE) → Review TTV & Alergi
                → Anamnesis S, Fisik O, Diagnosis A (ICD-10), Edukasi P → Order Lab & Tindakan
                → E-Resep Formularium → (Opsional) Rujukan Online → Finalisasi Encounter (kunci rekam medis)
                → Cetak Resume Medis Permenkes RI → Visit berstatus SERVICE_COMPLETED
4. PENUNJANG    (Jika ada order lab) Analis terima sampel → Input hasil parameter → Rilis ke RME dokter
5. PARALEL:
   - FARMASI    Apoteker terima e-resep → Telaah 7-benar → Dispensing & potong stok → Panggil tiket F-xxx
                → Serahkan obat + edukasi KIE
   - KASIR      Kasir terima rekap billing otomatis → Verifikasi penjamin / diskon → Bayar Tunai/Debit/QRIS
                → Terbitkan & cetak Kwitansi bernomor
6. PENYELESAIAN Follow-up / kontrol ulang ditentukan → Visit CLOSED otomatis.
```

## 8. Kebutuhan fungsional (Tervalidasi di Mockup)

Notasi: **FR-<MODUL>-nnn** · *Role* = aktor utama · Prioritas Must/Should/Could.

### 8.1 Akses & navigasi (lintas modul)

| ID | Kebutuhan | Fitur Mockup Terkait | Role | Status Mockup |
|---|---|---|---|---|
| FR-ACC-001 | Halaman login tunggal dengan kartu 1-klik akun demo dan password cheat sheet | `#login-view`, `quickLogin()` | Semua | ✅ Selesai |
| FR-ACC-002 | Sidebar adaptif yang hanya memuat menu relevan sesuai peran yang login | `#sidebar-nav-list`, `renderSidebar()` | Semua | ✅ Selesai |
| FR-ACC-003 | Penegakan izin RBAC berlapis di setiap aksi service dengan error 403 Forbidden | `permissionEngine.assertPermission()` | Semua | ✅ Selesai |
| FR-ACC-004 | Modal inspeksi matriks hak akses interaktif 70 aksi RBAC dan data scope | `#modal-role-inspector`, `openRoleInspector()` | Semua | ✅ Selesai |
| FR-ACC-005 | Perekaman jejak audit log otomatis setiap terjadi perubahan status atau aksi klinis | `AuditService.log()`, `#audit` workspace | Semua | ✅ Selesai |
| FR-ACC-006 | Akun perangkat display publik dibatasi hanya data nomor tiket dan ruangan (Zero-PHI) | `#view-display`, `renderDisplayWorkspace()` | Queue Display | ✅ Selesai |

### 8.2 Registrasi (1.x)

| ID | Kebutuhan | Fitur Mockup Terkait | Role | Status Mockup |
|---|---|---|---|---|
| FR-REG-001 | Pencarian cepat pasien berdasarkan NIK 16 digit, No. RM, atau Nama Pasien | Input `#patient-search-input`, `RegistrationService.searchPatients()` | Registration | ✅ Selesai |
| FR-REG-002 | Peringatan dini jika NIK yang diinput sudah terdaftar atas nama pasien lain | Banner `#duplicate-nik-alert`, `checkDuplicateNik()` | Registration | ✅ Selesai |
| FR-REG-003 | Form registrasi pasien baru walk-in dengan input demografi lengkap | Modal `#modal-new-patient`, `submitNewPatient()` | Registration | ✅ Selesai |
| FR-REG-004 | Pilihan poliklinik dan dokter praktik dengan kuota antrian dinamis | Select `#poli-select`, `#dokter-select` | Registration | ✅ Selesai |
| FR-REG-005 | Verifikasi penjamin (Umum, BPJS Kesehatan, Asuransi Swasta, Perusahaan) | Radio penjamin, modal BPJS SEP | Registration | ✅ Selesai |
| FR-REG-006 | Cetak tiket antrian termal triase (58/80mm) dan slip bukti pendaftaran resmi ber-ID registrasi | Modal preview `#modal-thermal-ticket`, `#modal-print-preview` | Registration | ✅ Selesai |
| FR-REG-007 | Pemantauan registrasi pasien rawat jalan hari ini mencakup ID registrasi, Jam Registrasi, filter status, dan tujuan (tanpa antrian loket / audio bell loket) | Table `#registration-visits-table-container` | Registration | ✅ Selesai |
| FR-REG-008 | Penerimaan rujukan online BPJS dan penerbitan formulir Surat Eligibilitas Berobat (SEP) | Workspace `reg-bpjs`, fungsi `printSEP()` | Registration | ✅ Selesai |
| FR-REG-009 | Anjungan Pendaftaran Mandiri (APM Kiosk) untuk check-in QR & walk-in pasien lama | Workspace `kiosk`, `renderKioskWorkspace()` | Kiosk Device | ✅ Selesai |

### 8.3 Antrian & Display (1.7, 8.x)

| ID | Kebutuhan | Fitur Mockup Terkait | Role | Status Mockup |
|---|---|---|---|---|
| FR-QUE-001 | Penerbitan nomor tiket unik per prefix (A..F Poli, T Triase, K Kasir, F Farmasi) | `QueueService.getNextSequence(prefix)` | Sistem | ✅ Selesai |
| FR-QUE-002 | State lifecycle tiket (WAITING → CALLED → IN_SERVICE → COMPLETED / SKIPPED) | Service method pada `QueueService` | Semua | ✅ Selesai |
| FR-QUE-003 | Panggilan antrian suara otomatis (Web Speech API) + Web Audio Bell (D5-A5 chime) | `QueueService.announceTicket(ticketNo, destination)` | Semua | ✅ Selesai |
| FR-QUE-004 | Layar TV Display publik ruang tunggu poli & dokter serta kasir & farmasi tanpa data PHI | Workspace `display`, `#display-viewport` | Queue Display | ✅ Selesai |
| FR-QUE-005 | Fitur panggil ulang (Recall dengan kenaikan call_count) dan lewati (Skip tiket) | Tombol panggil/recall di tabel antrian | Semua | ✅ Selesai |

### 8.4 Triase & TTV (2.x)

| ID | Kebutuhan | Fitur Mockup Terkait | Role | Status Mockup |
|---|---|---|---|---|
| FR-TRI-001 | Filter stasiun triase per poliklinik dan dokter tujuan | Dropdown `#handleTriageDeptChange`, `#handleTriageDoctorChange` | Nursing | ✅ Selesai |
| FR-TRI-002 | Antrian triase pasien siap periksa dengan tombol panggil audio langsung | Card stream `#triageQueue`, `selectTriagePatient()` | Nursing | ✅ Selesai |
| FR-TRI-003 | Input tanda vital (TD sistolik/diastolik, nadi, suhu, RR, SpO2, TB, BB) | Form `#triage-vitals-form`, `input#vitals-*` | Nursing | ✅ Selesai |
| FR-TRI-004 | Kalkulasi indeks massa tubuh (BMI) otomatis beserta klasifikasi berat badan | Output `#vitals-bmi-display`, `TriageService.calculateBmi()` | Nursing | ✅ Selesai |
| FR-TRI-005 | Skrining klinis awal: keluhan utama, asesmen risiko jatuh, skala nyeri VAS 0-10, alergi | Field `#triage-complaint`, `#triage-fall-risk`, `#triage-pain`, `#triage-allergies` | Nursing | ✅ Selesai |
| FR-TRI-006 | Penetapan klasifikasi triase ESI (Normal, Perhatian, Eskalasi) dan routing tujuan | Dropdown `#triage-outcome`, transisi `WAITING_DOCTOR` atau `ESCALATED` | Nursing | ✅ Selesai |

### 8.5 Pelayanan Dokter & Rekam Medis (3.x)

| ID | Kebutuhan | Fitur Mockup Terkait | Role | Status Mockup |
|---|---|---|---|---|
| FR-DOC-001 | Dashboard ringkasan harian dokter (pasien menunggu, selesai, rata-rata waktu periksa) | Workspace `doctor-dashboard` | Physician | ✅ Selesai |
| FR-DOC-002 | Antrian pasien DPJP spesialis (My Queue) dengan status TTV tertera jelas | Workspace `doctor-queue`, `#doctorQueue` stream | Physician | ✅ Selesai |
| FR-DOC-003 | Banner ringkasan pasien terpilih: TTV terkini perawat dan riwayat alergi mencolok | Sticky banner `#doctor-patient-banner` | Physician | ✅ Selesai |
| FR-DOC-004 | Pengisian catatan rekam medis SOAP terstruktur (Subjektif S, Objektif O, Edukasi P) | Textarea `#doctor-soap-s`, `#doctor-soap-o`, `#doctor-soap-p` | Physician | ✅ Selesai |
| FR-DOC-005 | Penegakan diagnosis penyakit dengan pencarian dan pemilihan kode resmi ICD-10 | Dropdown & search `#doctor-icd10` | Physician | ✅ Selesai |
| FR-DOC-006 | Order tindakan medis berbayar (misal: EKG 12-lead, Nebulisasi, Perawatan luka) | Section tindakan medis dokter, `SIMRS_MASTER_DATA.services` | Physician | ✅ Selesai |
| FR-DOC-007 | Order pemeriksaan laboratorium patologi klinik dengan pemantauan status terintegrasi | Panel order lab dokter, `DoctorService.orderLabTest()` | Physician | ✅ Selesai |
| FR-DOC-008 | Peresepan obat online formularium rumah sakit dengan pengecekan stok otomatis | Panel e-resep dokter, `DoctorService.addPrescriptionItem()` | Physician | ✅ Selesai |
| FR-DOC-009 | Modal rujukan online lengkap (Dokter Spesialis Internal, Lab, Radiologi, Rehab, Luar) | Modal `#modal-online-referral`, `openOnlineReferralModal()` | Physician | ✅ Selesai |
| FR-DOC-010 | Simpan draft encounter vs finalisasi encounter (penguncian rekam medis permanen) | Tombol `#btn-save-draft` & `#btn-finalize-encounter` | Physician | ✅ Selesai |
| FR-DOC-011 | Cetak resume medis resmi rawat jalan 11-elemen standar Permenkes RI | Preview `#modal-print-preview`, fungsi `printResumeMedis()` | Physician | ✅ Selesai |

### 8.6 Penunjang Laboratorium (4.x)

| ID | Kebutuhan | Fitur Mockup Terkait | Role | Status Mockup |
|---|---|---|---|---|
| FR-LAB-001 | Worklist order masuk laboratorium dari dokter poliklinik dengan detail pengirim | Workspace `lab`, table order masuk | Laboratory | ✅ Selesai |
| FR-LAB-002 | Konfirmasi penerimaan spesimen / sampel darah | Aksi `LabService.collectSample()` | Laboratory | ✅ Selesai |
| FR-LAB-003 | Form pengisian hasil uji parameter patologi klinik dengan nilai rujukan pria/wanita | Modal `#modal-lab-result-input`, `LabService.submitResults()` | Laboratory | ✅ Selesai |
| FR-LAB-004 | Validasi dan rilis hasil uji laboratorium langsung ke rekam medis dokter | Aksi `LabService.verifyResults()` | Laboratory | ✅ Selesai |
| FR-LAB-005 | Cetak sertifikat resmi hasil pemeriksaan laboratorium dengan rentang normal | Fungsi `printLabResult(labOrderId)` | Laboratory | ✅ Selesai |

### 8.7 Farmasi Rawat Jalan (5.x)

| ID | Kebutuhan | Fitur Mockup Terkait | Role | Status Mockup |
|---|---|---|---|---|
| FR-PHA-001 | Inbox resep elektronik dokter rawat jalan dengan filter poliklinik dan dokter | Workspace `farmasi`, `#allPharmacyVisits` | Pharmacist | ✅ Selesai |
| FR-PHA-002 | Verifikasi dan telaah resep 7-benar (administratif dan klinis) | Modal telaah 7-benar, kolom status telaah | Pharmacist | ✅ Selesai |
| FR-PHA-003 | Dispensing obat dengan pemotongan stok persediaan farmasi otomatis | Aksi `PharmacyService.dispense()` | Pharmacist | ✅ Selesai |
| FR-PHA-004 | Pemanggilan nomor antrian pengambilan obat farmasi (F-xxx) dengan audio bell | Tombol panggil tiket farmasi | Pharmacist | ✅ Selesai |
| FR-PHA-005 | Penyerahan obat ke pasien disertai checklist edukasi KIE (Komunikasi, Informasi, Edukasi) | Aksi serahkan obat & tutup tiket farmasi | Pharmacist | ✅ Selesai |

### 8.8 Kasir & Billing (6.x)

| ID | Kebutuhan | Fitur Mockup Terkait | Role | Status Mockup |
|---|---|---|---|---|
| FR-BIL-001 | Antrian pasien siap bayar dengan filter poliklinik dan jenis penjamin | Workspace `cashier-queue`, filter bar | Cashier | ✅ Selesai |
| FR-BIL-002 | Rekapitulasi agregasi biaya otomatis (biaya pendaftaran, jasa dokter, tindakan, lab, obat) | Workstation `cashier-payment`, kalkulasi invoice | Cashier | ✅ Selesai |
| FR-BIL-003 | Penambahan tindakan atau pelayanan susulan langsung di kasir | Modal `#modal-add-service`, `BillingService.addServiceItem()` | Cashier | ✅ Selesai |
| FR-BIL-004 | Multi-metode pembayaran: Tunai (dengan hitung kembalian), Kartu Debit, Kartu Kredit, QRIS | Form POS Kasir, input metode bayar | Cashier | ✅ Selesai |
| FR-BIL-005 | Penjaminan asuransi swasta atau korporat perusahaan (skema guaranteed settlement) | Pilihan penjamin asuransi/perusahaan | Cashier | ✅ Selesai |
| FR-BIL-006 | Penerbitan dan pencetakan kwitansi pembayaran resmi rumah sakit bernomor seri | Fungsi `printKwitansiCurrent()`, invoice modal preview | Cashier | ✅ Selesai |
| FR-BIL-007 | Riwayat transaksi penerimaan kasir dan riwayat cetak ulang kwitansi | Workspace `cashier-history` | Cashier | ✅ Selesai |

### 8.9 Monitoring SLA, Audit Trail & API Bridging (7.x, 8.x, 9.x)

| ID | Kebutuhan | Fitur Mockup Terkait | Role | Status Mockup |
|---|---|---|---|---|
| FR-MON-001 | Dashboard live kepatuhan SLA waktu tunggu Kemenkes RI (< 60 menit) per poliklinik | Workspace `monitoring`, indikator SLA | Supervisor | ✅ Selesai |
| FR-MON-002 | Penelusuran visual timeline alur lifecycle pasien dari check-in hingga bayar | Timeline stream di monitoring workspace | Supervisor | ✅ Selesai |
| FR-MON-003 | Override administratif status kunjungan tertahan dengan pencatatan alasan wajib | Modal override status di monitoring | Supervisor | ✅ Selesai |
| FR-AUD-001 | Tampilan log audit trail lengkap (waktu, user, role, tindakan yang dilakukan) | Workspace `audit`, `AuditService.getLogs()` | Auditor | ✅ Selesai |
| FR-API-001 | Client REST API dual-mode (simulasi offline vs live Frappe & SatuSehat server) | [`js/api-client.js`](file:///home/vincent/Projects/prototype_simrs/js/api-client.js), modal tester `#modal-api-tester` | Developer / Admin | ✅ Selesai |

## 9. Skenario UAT (Tervalidasi pada Mockup)

| ID | Skenario Alur Pengujian | Hasil Pengujian Mockup |
|---|---|---|
| **A** | **Walk-in Pasien Baru:** Pendaftaran baru → Terbit tiket Triase & Slip → Panggil triase → Input TTV & BMI → Skrining keluhan/nyeri/alergi → Routing dokter → Dokter panggil → SOAP + ICD-10 + E-Resep → Finalisasi encounter → Cetak Resume Permenkes → Resep diproses Farmasi → Pembayaran Kasir (QRIS/Tunai) → Cetak Kwitansi → Selesai (`CLOSED`). | ✅ Lulus 100% |
| **B** | **Pasien Lama & Rujukan BPJS:** Cari pasien via NIK → Validasi duplikasi → Verifikasi rujukan BPJS → Cetak SEP → Alur poliklinik hingga selesai dengan status billing *Guaranteed*. | ✅ Lulus 100% |
| **C** | **Dengan Pemeriksaan Lab:** Dokter terbitkan order lab → Analis lab proses & input hasil → Rilis ke rekam medis → Dokter review hasil lab → Finalisasi rekam medis. | ✅ Lulus 100% |
| **D** | **Eskalasi Triase:** Pasien gawat darurat ditriase → ESI Merah (Perlu Eskalasi) → Sistem mentransisikan status ke `ESCALATED` dan merutekan langsung ke IGD. | ✅ Lulus 100% |
| **E** | **Kiosk APM Mandiri:** Pasien check-in mandiri dengan QR / kode booking di layar APM → Tiket antrian tercetak otomatis → Pasien langsung menuju ruang tunggu. | ✅ Lulus 100% |
| **R** | **Uji Akses Hak Peran (RBAC):** Setiap akun demo masuk hanya melihat menu perannya; aksi terlarang menolak eksekusi dengan pesan 403 Forbidden. | ✅ Lulus 100% |


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
