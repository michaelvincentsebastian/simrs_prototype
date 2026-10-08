# User & Role — SIMRS Mini (Rawat Jalan)

> **Versi:** 0.2 (Synchronized with Interactive Mockup) · **Tanggal:** 2026-10-08 · **Basis:** `hirarki-simrs.md` §88–123 & `SIMRS-0.1.hirarki` · **Platform:** Frappe v15 + Healthcare + Mockup Web App
>
> Dokumen ini menjawab **siapa boleh melakukan apa, di mana, dan pada status apa**, lalu menerjemahkannya ke mekanisme permission yang aktif pada prototipe interaktif ([`js/permissions.js`](file:///home/vincent/Projects/prototype_simrs/js/permissions.js)) dan implementasi Frappe v15.

---

## 0. Model akses: satu sistem, banyak role

SIMRS Mini **bukan kumpulan aplikasi per jenis user**. Semua staf dan perangkat masuk ke **sistem yang sama** (1 site, 1 login), lalu **Role** menentukan:

1. **Menu yang terlihat** — landing workspace + sidebar navigasi adaptif (§0.2, §0.3),
2. **Aksi yang boleh** — penegakan izin fungsi (`permissionEngine.assertPermission()`), DocPerm, dan method whitelist (§2, §6),
3. **Data yang boleh dibuka** — data scope (departemen poli, dokter DPJP, transaksi aktif) + status kunjungan (§7, §8).

Satu-satunya aplikasi terpisah adalah **Kanal Appointment** (patient-facing, Web/Mobile/WhatsApp) yang berkomunikasi lewat Appointment API dengan akun layanan `Appointment Channel Service`.

> **Aturan emas:** Menyembunyikan menu hanyalah kenyamanan UI. Keamanan sejati ditegakkan di server/service layer. Role tanpa kewenangan wajib ditolak (403 Forbidden) saat memanggil method atau dokumen yang dilarang.

### 0.1 Kredensial Akun Demo Interaktif (Mockup Login Screen)

Pada layar login prototipe interaktif ([`index.html`](file:///home/vincent/Projects/prototype_simrs/index.html)), tersedia 5 kartu 1-klik akun demo yang merepresentasikan submodul operasional rawat jalan:

| Username | Password | Nama Pegawai | Peran / Role Key | Submodul Utama | Landing Workspace | Allowed Workspaces |
|---|---|---|---|---|---|---|
| `staf.budi` | `registrasi123` | Budi Santoso | Petugas Pendaftaran RJ (`REGISTRATION_STAFF`) | 1. Registrasi Pasien | `registrasi` | `registrasi`, `reg-bpjs`, `reg-dashboard`, `reg-booking`, `reg-patients` |
| `perawat.siti` | `perawat123` | Ns. Siti Rahma, S.Kep | Perawat Triase (`NURSING_USER`) | 2. Modul TTV | `ttv-queue` | `ttv-queue`, `ttv-input`, `ttv-history`, `triase`, `ttv`, `nurse-dashboard` |
| `dokter.hendra` | `dokter123` | dr. Hendra Pratama, Sp.PD | Dokter RJ (`PHYSICIAN`) | 3. Dokter Rawat Jalan | `doctor-queue` | `doctor-dashboard`, `doctor-queue`, `doctor-consultation`, `doctor-patients`, `doctor-documents`, `dokter` |
| `kasir.linda` | `kasir123` | Linda Wijaya, S.E. | Kasir RJ (`CASHIER`) | 4. Kasir Rawat Jalan | `cashier-queue` | `cashier-dashboard`, `cashier-queue`, `cashier-payment`, `cashier-history`, `kasir` |
| `display.tv` | `display123` | Display TV Publik | Display Antrian TV (`QUEUE_DISPLAY`) | 5. Display Antrian | `display` | `display` (Tab Poli/Dokter & Tab Kasir/Farmasi) |

*Workstation pendukung tambahan di mockup:*
- **Laboratorium** (`lab`): Diakses untuk pemrosesan uji spesimen lab patologi klinik.
- **Farmasi** (`farmasi`): Diakses untuk telaah resep 7-benar, potong stok obat, dan serah obat.
- **Monitoring SLA** (`monitoring`): Diakses untuk pengawasan SLA waktu tunggu Kemenkes RI (<60 menit) & override.
- **Audit Trail** (`audit`): Diakses untuk inspeksi log riwayat akses dan perubahan sistem.
- **Kiosk APM** (`kiosk`): Layar sentuh pendaftaran dan check-in mandiri pasien.

---

### 0.2 Matriks Role × Workspace/Menu

Legenda: **●** bisa melihat & bekerja · **○** hanya baca (konteks) · **—** tidak terlihat dan dilarang diakses.

| Role | Landing | Registrasi | Triase | Dokter | Lab | Farmasi | Kasir | Monitoring | Audit | Display TV | Kiosk APM |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Registration Staff** | `registrasi` | **●** | — | — | — | — | — | — | — | — | ○ |
| **Nursing User** | `ttv-queue` | — | **●** | ○ (TTV/Alergi) | — | — | — | — | — | — | — |
| **Physician** | `doctor-queue` | — | ○ (TTV) | **●** | ○ (Order/Hasil) | ○ (Resep) | — | — | — | — | — |
| **Cashier** | `cashier-queue` | — | — | — | — | — | **●** | — | — | — | — |
| **Queue Display** | `display` | — | — | — | — | — | — | — | — | **● (Zero-PHI)** | — |
| **Laboratory User** | `lab` | — | — | — | **●** | — | — | — | — | — | — |
| **Pharmacist** | `farmasi` | — | — | ○ (Resep) | — | **●** | — | — | — | — | — |
| **Outpatient Supervisor** | `monitoring` | ○ | ○ | ○ | ○ | ○ | ○ | **● (+Override)** | ○ | — | — |
| **Clinical Auditor** | `audit` | — | — | — | — | — | — | — | **● (Read-Only)** | — | — |
| **Kiosk Device** | `kiosk` | ○ (Walk-in lama) | — | — | — | — | — | — | — | — | **●** |

---

### 0.3 Konfigurasi Navigasi Sidebar & Batasan Kewenangan (Denied Notes)

Sesuai dengan [`js/permissions.js`](file:///home/vincent/Projects/prototype_simrs/js/permissions.js):

#### 1. Registration Staff (`staf.budi`):
- **Navigasi Utama:** `Pendaftaran Walk-in` (`registrasi`), `Rujukan BPJS & SEP` (`reg-bpjs`).
- **Izin DocType:** `Patient` [read, write, create], `Patient Appointment` [read, write, create], `Outpatient Visit` [read, create], `Queue Ticket` [read, write, create].
- **Dilarang Keras:** `Vital Signs` (Dilarang), `Patient Encounter` (Dilarang), `Medication Request` (Dilarang), `Sales Invoice` (Dilarang).
- **Catatan Kewenangan:** Hanya berwenang mengelola registrasi & encounter pendaftaran. Dilarang membuka rekam medis dokter (SOAP), TTV, atau memproses transaksi kasir pembayaran.

#### 2. Nursing User (`perawat.siti`):
- **Navigasi Utama:** `Antrian Triase` (`ttv-queue`), `Pengukuran TTV` (`ttv-input`), `Riwayat Triase` (`ttv-history`).
- **Izin DocType:** `Vital Signs` [read, write, create], `Triage Assessment` [read, write, create], `Outpatient Visit` [read], `Queue Ticket` [read, write], `Patient` [read].
- **Dilarang Keras:** `Patient Encounter` (Dilarang nulis SOAP), `Medication Request` (Dilarang), `Sales Invoice` (Dilarang).
- **Catatan Kewenangan:** Berwenang memanggil antrian, menginput TTV & skrining ESI, serta merutekan pasien. Dilarang meresepkan obat, mengisi SOAP dokter, atau memproses kasir.

#### 3. Physician (`dokter.hendra`):
- **Navigasi Utama:** `Dashboard` (`doctor-dashboard`), `Antrian Pasien` (`doctor-queue`), `Pemeriksaan RME` (`doctor-consultation`), `Data Pasien` (`doctor-patients`), `Dokumen & Resume` (`doctor-documents`).
- **Izin DocType:** `Patient Encounter` [read, write, create, submit], `Medication Request` [read, write, create], `Lab Test` [read, create], `Clinical Procedure` [read, write, create], `Vital Signs` [read], `Triage Assessment` [read], `Outpatient Visit` [read, write], `Patient` [read].
- **Dilarang Keras:** `Sales Invoice` (Dilarang), `Pharmacy Dispense` (Dilarang).
- **Catatan Kewenangan:** Berwenang mengelola rekam medis SOAP, diagnosa ICD-10, order rujukan & penunjang, peresepan formularium, dan finalisasi encounter. Dilarang mengakses kasir keuangan atau dispensing obat fisik.

#### 4. Cashier (`kasir.linda`):
- **Navigasi Utama:** `Dashboard` (`cashier-dashboard`), `Antrian Billing` (`cashier-queue`), `Pembayaran Kasir` (`cashier-payment`), `Riwayat Transaksi` (`cashier-history`).
- **Izin DocType:** `Sales Invoice` [read, write, create, submit], `Payment Entry` [read, write, create, submit], `Outpatient Visit` [read], `Patient` [read].
- **Dilarang Keras:** `Patient Encounter` (Dilarang), `Vital Signs` (Dilarang).
- **Catatan Kewenangan:** Berwenang memproses billing dan penerimaan pembayaran (tunai, debit, kartu kredit, QRIS, penjamin). Dilarang membaca catatan medis SOAP dokter atau memodifikasi resep obat.

#### 5. Queue Display (`display.tv`):
- **Navigasi Utama:** `Display Antrian TV` (`display`).
- **Izin DocType:** `Queue Ticket` [read].
- **Dilarang Keras:** Seluruh data rekam medis, demografi NIK lengkap, atau billing keuangan.
- **Catatan Kewenangan:** Perangkat monitor publik ruang tunggu (Zero-PHI). Menampilkan nomor tiket & kode ruangan poli saja.

---

### 0.4 Matriks Granular RBAC, Data Scope & Workflow Authority (70 Item Analisis Mockup)

Berdasarkan analisis komprehensif seluruh antarmuka, form, modal, dan workflow action pada prototipe SIMRS Mini, telah disusun matriks hak akses detail yang terdokumentasi lengkap pada file [`user-role.csv`](file:///home/vincent/Projects/prototype_simrs/user-role.csv) dan diinspeksi interaktif pada modal login **"Matriks Hak Akses & Arsitektur"**:

#### Ringkasan Distribusi 70 Aksi per Peran:
1. **Staf Pendaftaran (Antrian)** — **14 Aksi**:
   - *Pencarian & Registrasi:* Search Patient (NIK/MRN), Verifikasi Duplikasi NIK, Registrasi Pasien Baru Walk-in, Routing Poli & Dokter, Verifikasi Skema Penjamin (BPJS/Umum/Asuransi), Walk-in Registration, Check-in Reservasi Booking Janji Temu.
   - *Pencetakan & Antrian:* Cetak Tiket Antrian Termal Triase, Cetak Slip Bukti Pendaftaran Resmi, Monitoring Antrian Rawat Jalan Terkini, Panggil Antrian Suara (Web Speech), Recall Antrian, Skip Antrian, Reset Filter Loket.
2. **Perawat** — **15 Aksi**:
   - *Antrian & Identifikasi:* Filter Stasiun & Dokter, Pemantauan Antrian Triase, Panggil Antrian ke Meja Triase, Mulai Sesi Triase (`IN_TRIAGE`).
   - *Tanda Vital & Skrining:* Pengukuran Tekanan Darah Sistolik/Diastolik, Nadi, Suhu Tubuh, Laju Napas & SpO2, Antropometri & Kalkulasi BMI Otomatis, Dokumentasi Keluhan Utama, Asesmen Risiko Jatuh, Skala Nyeri (VAS 0-10), Identifikasi Alergi Obat/Makanan.
   - *Klasifikasi & Routing:* Penetapan Kategori Triase ESI (Normal/Perhatian/Eskalasi), Submit Triase & Routing ke Antrian Dokter (`WAITING_DOCTOR` / `ESCALATED`).
3. **Dokter** — **16 Aksi**:
   - *Antrian & Konsultasi:* Filter Antrian Dokter DPJP (My Queue), Pemantauan Antrian Siap Periksa, Panggil Pasien ke Ruang Periksa, Mulai Pelayanan (`IN_SERVICE`), Review Ringkasan Pasien & TTV Perawat.
   - *Dokumentasi SOAP & Medis:* Anamnesis Subjektif (S), Pemeriksaan Fisik Objektif (O), Penegakan Diagnosis ICD-10 Utama (A), Formulasi Terapi & Edukasi Plan (P).
   - *Order & Penunjang:* Permintaan Uji Laboratorium Patologi Klinik, Review Hasil Validasi Lab Terintegrasi, Permintaan Prosedur/Tindakan Medis Rawat Jalan, Peresepan E-Resep Obat Formularium.
   - *Penyelesaian & Resume:* Simpan Draft SOAP, Finalisasi Encounter Medis (Submit & kunci rekam medis, otomatis memicu antrian Farmasi & Kasir), Cetak Resume Medis Resmi 11 Elemen Permenkes RI.
4. **Apoteker** — **6 Aksi**:
   - *Verifikasi & Dispensing:* Filter Resep per Poliklinik/Dokter, Pemantauan Inbox Resep Masuk Dokter, Panggil Antrian Pengambilan Obat (F-xxx), Telaah Resep 7-Benar (Administratif & Klinis), Dispensing & Pemotongan Stok Farmasi Otomatis, Penyerahan Obat & Konseling Edukasi (KIE) ke Pasien.
5. **Kasir Farmasi** — **7 Aksi**:
   - *Agregasi & Pembayaran:* Filter Tagihan per Poliklinik & Penjamin, Pemantauan Antrian Siap Bayar (`SERVICE_COMPLETED`), Panggil Antrian Kasir (K-xxx), Agregasi Tagihan Otomatis (Registrasi, Tindakan, Lab, Obat), Verifikasi Klaim Penjamin & Porsi Bayar Mandiri (Co-payment), Pemrosesan Pembayaran Kas/QRIS, Cetak Kwitansi Pembayaran Resmi Bernomor.
6. **Analis Lab** — **5 Aksi**:
   - *Pemeriksaan Penunjang:* Pemantauan Worklist Order Lab Masuk, Konfirmasi Pengambilan Sampel & Spesimen, Input Hasil Parameter Pemeriksaan Patologi Klinik, Validasi & Rilis Hasil Lab ke Rekam Medis, Cetak Sertifikat Hasil Uji Laboratorium.
7. **Supervisor Rawat Jalan** — **4 Aksi**:
   - *Monitoring & Tata Kelola:* Monitoring Dashboard SLA & Waktu Tunggu Kemenkes RI (< 60 menit), Penelusuran Timeline Flow Kunjungan Pasien, Override Administratif Status Kunjungan Tertahan (Audit Justified), Ekspor Rekapitulasi Laporan Kinerja Poliklinik.
8. **Auditor Medis** — **3 Aksi**:
   - *Audit Independen (Strictly Read-Only):* Inspeksi Jejak Log Audit Trail Sistem SIMRS Mini, Review Kelengkapan Dokumentasi Klinis (SOAP, ICD-10, Resume Medis), Monitoring Log Riwayat Akses Rekam Medis Pasien.

#### Dasar Pemisahan Apoteker dan Kasir Farmasi:
Pada mockup prototipe, fungsi Apoteker dan Kasir Farmasi dipisahkan menjadi dua peran mandiri dengan alasan kuat:
1. **Workstation Terpisah:** Mockup menyediakan workstation dan route mandiri (`farmasi` vs `kasir`).
2. **Akun Petugas Terpisah:** Demo persona login terpisah (`apoteker.dewi` vs `kasir.linda`).
3. **Data Scope & Permissions Berbeda:** Apoteker menangani aspek klinis farmasi (telaah resep, pemotongan stok obat, KIE), sedangkan Kasir menangani aspek finansial (agregasi invoice, klaim asuransi, penerimaan kas/QRIS, cetak kwitansi).
4. **Separation of Duties (Fraud Prevention):** Mencegah benturan kepentingan di mana petugas yang meracik obat tidak mengelola transaksi penerimaan uang kasir.


---

## 1. Prinsip

1. **Least privilege.** Role = fungsi pekerjaan; User = akun orang. Satu user boleh memegang beberapa role, tetapi hak sensitif tidak ikut otomatis.
2. **Tiga dimensi akses** (sumber §123):

```text
WHO?    Role / profesi          → Frappe Role
WHAT?   Permission / aksi       → DocPerm (read/write/create/submit) + method whitelist
WHERE?  Scope / unit / poli     → User Permission + permission_query_conditions
        + STATUS data/encounter → docstatus, state Visit, validasi server
```

3. **Data klinis tidak dihapus.** Setelah finalisasi, perubahan hanya lewat amendment (+ alasan + audit).
4. **Pemisahan tugas:** klinis (menghasilkan service event) ≠ billing (menghasilkan charge) ≠ kasir (menghasilkan payment).
5. **Akun sistem (kiosk, display, integrasi) bukan manusia** → akun perangkat/API dengan role sempit.
6. **Satu sistem, banyak role.** Tidak ada aplikasi terpisah per user; perbedaan hanya pada role (menu, aksi, data). Pengecualian: Kanal Appointment untuk pasien (§0).

---

## 2. Padanan konsep ke Frappe

| Konsep sumber | Mekanisme Frappe | Catatan implementasi |
|---|---|---|
| Role | `Role` | Pakai role native Healthcare bila ada; tambah role custom via **fixtures** |
| `VIEW` | DocPerm `read` | |
| `CREATE` | DocPerm `create` | |
| `UPDATE` | DocPerm `write` (+ `if_owner` bila perlu) | Draft milik sendiri |
| `EXECUTE` (check-in, panggil pasien, dispensing) | **Method whitelist** dengan guard role (`frappe.only_for([...])`) | Aksi bisnis tidak memakai `write` mentah |
| `FINALIZE/APPROVE` | DocPerm `submit` pada Encounter; role approver custom untuk amendment/refund | |
| Scope poli / dokter | **User Permission** (`Healthcare Practitioner`, `Medical Department`, `Healthcare Service Unit`, `Company`) + hook `permission_query_conditions` / `has_permission` | |
| Field sensitif | `permlevel` (mis. NIK, alamat) | permlevel 1 hanya untuk Registration/MR |
| Status-based rule | Validasi pada `validate`/`before_save` + state machine `Outpatient Visit` | Bukan hanya UI |
| Audit trail | `Version` (*track_changes*), `Activity Log`, `Access Log` | |
| Paket role per jabatan | **Role Profile** (+ `Module Profile` untuk menyembunyikan modul) | Assign Role Profile, bukan role satu-satu |
| Menu per role | `Workspace` (+ *Roles*), hook `role_home_page`, `Module Profile` | Lihat §0.4 |
| Pasien (via Kanal Appointment) | Role `Patient` **tanpa Desk access** + link `Patient.user_id`, atau akun layanan `Appointment Channel Service` bila pasien tidak login ke Frappe | P2 |

---

## 3. Katalog role

Dari 24 role di sumber, MVP memakai **11 role aktif**. Role lain tetap terdokumentasi agar bisa diaktifkan tanpa desain ulang. Nama role Frappe pada kolom 3 adalah usulan; role native diverifikasi saat Discovery.

| # | Role (ID sumber) | Role Frappe | Asal | Fase |
|---|---|---|---|---|
| 01 | Patient | `Patient` (tanpa Desk access; dipakai via Kanal Appointment) | Native | P2 |
| 02 | Registration Staff (`REGISTRATION_STAFF`) | `Registration Staff` | Custom | **P1** |
| 03 | Queue / Front Desk Officer (`QUEUE_OFFICER`) | `Queue Officer` | Custom | **P1** (boleh digabung ke Registration Staff di klinik kecil, permission tetap dipisah) |
| 04 | Nurse / Triage Officer (`NURSE`) | `Nursing User` | Native | **P1** |
| 05 | Doctor (`DOCTOR`) | `Physician` | Native | **P1** |
| 06 | Medical / Clinic Assistant | `Clinic Assistant` | Custom | P2 |
| 07 | Laboratory Officer (`LAB_OFFICER`) | `Laboratory User` (+ `LabTest Approver` untuk validasi) | Native | **P1** |
| 08 | Radiology Officer | `Radiology Officer` | Custom | P2 |
| 09 | Radiologist | `Radiologist` | Custom | P2 |
| 10 | Rehabilitation / Physiotherapy Officer | `Rehabilitation Officer` | Custom | P2 |
| 11 | Pharmacist (`PHARMACIST`) | `Pharmacist` | Custom | **P1** |
| 12 | Pharmacy Assistant | `Pharmacy Assistant` | Custom | P2 |
| 13 | Cashier (`CASHIER`) | `Cashier` | Custom | **P1** |
| 14 | Billing / Finance Officer | `Billing Officer` | Custom | P2 |
| 15 | Insurance / Payer Officer (`INSURANCE_OFFICER`) | `Insurance Officer` | Custom | P2 |
| 16 | Medical Record Officer (`MEDICAL_RECORD_OFFICER`) | `Medical Record Officer` | Custom | P2 |
| 17 | Outpatient Supervisor / Head of Clinic | `Outpatient Supervisor` | Custom | **P1** |
| 18 | Quality / Clinical Auditor | `Clinical Auditor` | Custom | P2 |
| 19 | System Administrator | `System Manager` (MVP) → `SIMRS Admin` (P2) | Native/Custom | **P1** |
| 20 | IT Support | `IT Support` | Custom | P2 |
| 21 | Audit / Compliance Officer | `Compliance Auditor` | Custom | P2 |
| 22 | Kiosk Device Account [SYSTEM] | `Kiosk Device` | Custom | P2 |
| 23 | Queue Display Account [SYSTEM] | `Queue Display` | Custom | **P1** |
| 24 | Integration Service Account [SYSTEM] | `Integration Service` | Custom | P3 |
| 25 | Appointment Channel Service [SYSTEM] | `Appointment Channel Service` | Custom | P2 (hanya Appointment API: slot, book, reschedule, cancel, lihat appointment pasien; tanpa akses rekam medis) |

Untuk MVP, peran audit dijalankan oleh satu role read-only **`Clinical Auditor`** (gabungan 18 + 21) agar uji akses audit trail tetap bisa dilakukan.

**Role "sensitive permission"** (dipisah, tidak ikut role harian — sumber §118):

| Role Frappe | Hak yang dibawa | Fase |
|---|---|---|
| `Patient Merger` | Merge pasien duplikat | P2 |
| `Amendment Approver` | Menyetujui koreksi diagnosis/SOAP/hasil setelah finalisasi, reopen encounter | P2 |
| `Billing Approver` | Menyetujui void/refund/koreksi billing | P2 |
| `Break Glass` | Akses darurat ke data di luar scope (wajib alasan + log) | P2 |
| `Audit Log Viewer` | Melihat audit log lintas user | P2 (MVP: `Clinical Auditor`) |

---

## 4. Ringkasan per role (boleh / tidak boleh)

> Aturan "tidak boleh" ditegakkan **di server** (DocPerm + validasi), bukan hanya dengan menyembunyikan tombol.

### 4.1 Registration Staff (P1)
- **Boleh:** cari/buat Patient, ubah demografi tertentu, buat/ubah/batal Appointment (alasan wajib), walk-in, check-in, verifikasi penjamin, tambah ke antrian.
- **Tidak boleh:** mengubah diagnosis/SOAP, mengubah resep setelah signed, input hasil klinis, mengubah tarif, membatalkan pembayaran settled, **merge pasien** (hak MR Officer).

### 4.2 Queue Officer (P1)
- **Boleh:** lihat antrian, panggil, panggil ulang, skip/no-show, pause/resume, transfer antrian (sesuai SOP), monitor waktu tunggu.
- **Tidak boleh:** melihat rekam medis klinis, mengubah diagnosis/SOAP/billing.

### 4.3 Nurse / Triage (P1)
- **Boleh:** lihat identitas, alergi, riwayat kunjungan relevan; **create/update TTV, Triage Assessment**; flag risiko; routing ke antrian dokter.
- **Tidak boleh:** finalisasi diagnosis/SOAP dokter, membuat resep atas nama dokter, mengubah hasil lab/radiologi.

### 4.4 Doctor (P1)
- **Boleh:** lihat chart (sesuai scope), create/update anamnesis/pemeriksaan/SOAP/diagnosis/plan **selama draft**, buat order (lab, tindakan), resep, follow-up, resume, **submit (finalize) encounter**.
- **Tidak boleh:** mengubah pembayaran/transaksi kasir, mengubah hasil unit lain, menghapus rekam medis. **Koreksi setelah finalize → amendment** (tidak edit langsung).

### 4.5 Laboratory Officer (P1)
- **Boleh:** lihat order yang ditujukan ke unitnya, terima order, catat spesimen, input hasil (draft), kirim untuk validasi; finalisasi hanya bila memegang `LabTest Approver`.
- **Tidak boleh:** mengubah diagnosis/order klinis dokter, mengubah billing langsung.

### 4.6 Pharmacist (P1)
- **Boleh:** lihat resep, **verifikasi**, dispensing, catat substitusi sesuai SOP, penyerahan obat, update status resep.
- **Tidak boleh:** mengubah diagnosis/SOAP, **mengedit resep dokter diam-diam**. Masalah resep → klarifikasi → dokter merevisi → farmasi proses ulang.

### 4.7 Cashier (P1)
- **Boleh:** lihat billing & charge, lihat tarif, buat transaksi pembayaran (tunai, debit/kredit, QRIS/e-payment, jaminan), cetak kwitansi.
- **Tidak boleh:** mengubah diagnosis/SOAP/TTV/order klinis, menghapus transaksi settled. Refund/koreksi besar → butuh `Billing Approver`.

### 4.8 Outpatient Supervisor (P1)
- **Boleh:** monitor antrian unit, workload, waktu tunggu, dashboard operasional; **operational override** (transfer pasien, re-route antrian, reassign dokter, buka kembali proses administratif yang salah, setujui koreksi tertentu).
- **Tidak boleh:** otomatis mengubah catatan klinis dokter. Bila supervisor juga dokter → role `Physician` + `Outpatient Supervisor` (hak klinis & administratif tetap terpisah).

### 4.9 Clinical Auditor (P1, read-only)
- **Boleh:** baca timeline encounter, audit trail, diagnosis & terapi pada kasus yang diaudit; buat catatan temuan.
- **Tidak boleh:** mengubah catatan klinis apa pun.

### 4.10 System Administrator (P1)
- **Boleh:** kelola user, role, Role Profile, master (poli, service unit, tarif, parameter), konfigurasi antrian.
- **Tidak boleh (prinsip):** menjadi *clinical user* otomatis. ⚠️ **Perhatian Frappe:** `System Manager` terdaftar pada banyak DocPerm bawaan. Discovery wajib mengaudit DocPerm PHI untuk `System Manager` dan memangkasnya (Custom DocPerm), karena prinsip "admin ≠ clinical user" tidak otomatis berlaku. Akses teknis ke data pasien memakai prosedur terkontrol/break-glass (P2).

### 4.11 Queue Display (P1, akun sistem)
- **Boleh:** baca-saja nomor tiket, poli/ruang, status. **Tidak boleh:** nama lengkap pasien, rekam medis, diagnosis, billing.

### 4.12 Role P2/P3 (ringkas)
| Role | Boleh | Tidak boleh |
|---|---|---|
| Patient | Data & appointment sendiri, check-in online, antrian, tagihan sendiri, hasil/resep yang dirilis | Data pasien lain, ubah SOAP/diagnosis/hasil/billing |
| Radiology Officer / Radiologist | Terima order, jadwalkan, input teknis; Radiologist membuat & finalize laporan | Diagnosis dokter, billing |
| Rehabilitation Officer | Referral/order rehab, jadwal, catat sesi | Diagnosis, resep |
| Billing Officer | Verifikasi charge, rekonsiliasi, koreksi administratif via workflow, proses refund (dengan approval) | Data klinis |
| Insurance Officer | Eligibility, coverage, otorisasi, dokumen klaim | Mengubah diagnosis untuk menyesuaikan klaim |
| Medical Record Officer | Duplikat/merge pasien, kelengkapan dokumen, amendment request, release dokumen | Menulis diagnosis atas nama dokter |
| IT Support | Status perangkat/integrasi, log teknis tanpa PHI, troubleshooting printer/kiosk/display | Membuka rekam medis, ubah billing/klinis |
| Kiosk Device | Lookup appointment, validasi QR, check-in, walk-in flow, cetak tiket | Akses bebas Patient Master/rekam medis |
| Integration Service | Hanya API yang dibutuhkan (mis. verify eligibility) | `UPDATE SOAP`, `DELETE PATIENT`, `CHANGE DIAGNOSIS` |

---

## 5. Matriks Role × Submodul (MVP)

Legenda: **F** full operasional domain · **C** create/execute · **U** update · **V** view · **A** approve/finalize · **—** tidak ada.

| Role | Registrasi | Triase | Dokter | Penunjang | Farmasi | Billing/Kasir | Antrian | Rekam Medis |
|---|---|---|---|---|---|---|---|---|
| Registration Staff | **F** | V terbatas | V terbatas | — | — | V terbatas | C/U | C/U demografi |
| Queue Officer | V | V | V antrian | — | — | V antrian | **F** | — |
| Nurse | V | **F** | V klinis | V relevan | V alergi/obat | — | C/U | C/U keperawatan |
| Doctor | V | V | **F** | C/U order + V hasil | C/U resep | V terbatas | V/C | **F** klinis |
| Lab Officer | V order | — | — | **F** lab | — | V order/charge | — | V relevan |
| Pharmacist | V | — | V resep | — | **F** | V charge farmasi | C/U antrian farmasi | V obat relevan |
| Cashier | V identitas billing | — | — | V charge | V charge | **F** | V | — |
| Outpatient Supervisor | F unit | F monitoring | V | V | V | F monitoring | F unit | V |
| Clinical Auditor | V (scope audit) | V | V read-only | V | V | V | V | V read-only |
| System Manager | Config | Config | Config | Config | Config | Config | Config | — (default) |
| Queue Display | — | — | — | — | — | — | V | — |

---

## 6. Matriks DocType × Role (untuk implementasi DocPerm)

Legenda: **R** read · **W** write · **C** create · **S** submit · **X** cancel/amend · **API** hanya lewat method whitelist · **—** tanpa akses. Tidak ada role (selain admin teknis) yang mendapat **delete** pada data klinis/keuangan.

| DocType | Reg | Queue | Nurse | Physician | Lab | Pharm | Cashier | Supv | Auditor |
|---|---|---|---|---|---|---|---|---|---|
| `Patient` | R W C | — | R | R | R | R | R | R | R |
| `Patient Appointment` | R W C | R | R | R | — | — | R | R W | R |
| `Outpatient Visit` | R | R | R | R | R | R | R | R + API override | R |
| `Queue Ticket` | R C | R W C | R W | R W | — | R W | R W | R W | R |
| `Vital Signs` | — | — | R W C | R W C | — | — | — | R | R |
| `Triage Assessment` | — | — | R W C | R | — | — | — | R | R |
| `Patient Encounter` | — | — | R (terbatas) | R W C **S** | — | — | — | R | R |
| `Lab Test` / `Service Request` | — | — | R | R C | R W S* | — | R (charge) | R | R |
| `Medication Request` | — | — | R | R W C | — | R + API status | — | R | R |
| `Pharmacy Dispense` | — | — | — | R | — | R W C **S** | R (charge) | R | R |
| `Sales Invoice` | — | — | — | — | — | — | R W C S | R | R |
| `Payment Entry` | — | — | — | — | — | — | R C S | R | R |
| `Item Price` / `Price List` | — | — | — | — | — | — | R | R | R |
| `Version` / `Access Log` | — | — | — | — | — | — | — | — | R |

`*` S pada Lab Test hanya untuk pemegang `LabTest Approver`.

Catatan:
- **Dokter dan scope poli:** `Physician` hanya melihat Appointment/Encounter miliknya (User Permission → `Healthcare Practitioner`). Konsekuensinya, riwayat kunjungan pasien dari dokter lain ikut tersaring. Solusi: **Patient Summary read-through** — method whitelist yang mengembalikan payload read-only terkurasi (TTV terakhir, alergi, diagnosis terdahulu, obat aktif, hasil terbaru) tanpa membuka dokumen mentah dokter lain.
- **Queue Officer** tidak diberi akses `Patient`; nama pasien tidak perlu pada daftar antrian (gunakan nomor tiket + inisial bila SOP mengizinkan).
- **Outpatient Visit** bersifat sistem-dikelola: write hanya lewat method yang memvalidasi transisi dan peran (lihat `data-model.md` §6).

---

## 7. Scope (WHERE)

| Aturan | Implementasi |
|---|---|
| Dokter hanya melihat pasien/encounter miliknya | `User Permission` allow=`Healthcare Practitioner`, apply to all doctypes |
| Staf poli hanya melihat unit sendiri | `User Permission` allow=`Medical Department` / `Healthcare Service Unit` |
| Multi-cabang (bila ada) | `User Permission` allow=`Company` |
| Pasien hanya data sendiri (P2) | `has_permission` + `permission_query_conditions` berbasis `Patient.user_id` |
| Antrian dokter = "My Queue" | Filter server-side di method `doctor_queue()`, bukan filter UI |
| Display hanya data minimum | Endpoint display mengembalikan field whitelist saja |

---

## 8. Status-based access (Encounter lifecycle)

| State Visit / Encounter | Nurse | Doctor | Registration | Lainnya |
|---|---|---|---|---|
| `WAITING_TRIAGE` / `IN_TRIAGE` | **Create/Update TTV & triase** | View TTV | — | |
| `WAITING_DOCTOR` | View | View | — | |
| `IN_SERVICE` / `ON_HOLD` | View | **Update SOAP, diagnosis, order, resep** (draft) | — | Lab/Farmasi memproses order yang sudah dikirim |
| `SERVICE_COMPLETED` (Encounter *submitted*) | — | **Read-only**; koreksi via amendment | — | Kasir & Farmasi bekerja |
| `CLOSED` | — | Read-only | — | Data terkunci; hanya audit/MR |

Untuk koreksi pasca-finalisasi:

```text
Request Amendment (Doctor)  →  Approval (Amendment Approver)  →  Correction (Cancel & Amend)  →  Audit Trail (alasan wajib)
```

---

## 9. Permission sensitif & Separation of Duties

Aturan SoD yang harus diuji otomatis:

| Aturan | Cara enforce |
|---|---|
| Pembuat refund ≠ penyetuju refund | Validasi server: `approved_by != owner` |
| Dokter tidak membuat/menyentuh transaksi kasir | DocPerm Sales/Payment tidak diberikan |
| Pharmacist tidak mengubah isi resep dokter | `Medication Request` read-only untuk Pharmacist; perubahan hanya via status |
| Registrasi tidak mengisi TTV | `Vital Signs` tanpa akses Registration |
| Admin sistem tidak membaca rekam medis | Pangkas DocPerm `System Manager` pada DocType PHI (lihat §4.10) |
| Role sensitif (merge, void, amend, break-glass) harus eksplisit | Role terpisah (§3) + approval + audit |

---

## 10. Contoh penugasan user (Role Profile)

| User | Role Profile | Role | Scope |
|---|---|---|---|
| Petugas pendaftaran | `RJ – Registrasi` | Registration Staff, Queue Officer | Semua poli |
| Perawat poli | `RJ – Perawat` | Nursing User | Medical Department = Penyakit Dalam |
| Dr. A | `RJ – Dokter` | Physician | Practitioner = Dr. A; Dept = Penyakit Dalam |
| Apoteker | `RJ – Farmasi` | Pharmacist | Warehouse farmasi |
| Kasir | `RJ – Kasir` | Cashier | — |
| Kepala poli (juga dokter) | `RJ – Dokter` + `RJ – Supervisor` | Physician, Outpatient Supervisor | Dept = Penyakit Dalam |
| Layar antrian | `RJ – Display` | Queue Display | board tertentu |

---

## 11. Rencana pengujian akses (wajib otomatis)

Setiap baris = 1 test pada `bench run-tests --app simrs_mini`:

1. Registration **tidak bisa** membuat/mengubah `Patient Encounter`, `Vital Signs`, `Sales Invoice`.
2. Nurse bisa membuat `Vital Signs` saat state `WAITING_TRIAGE`/`IN_TRIAGE`, **tidak** bisa submit `Patient Encounter`.
3. Dokter A tidak dapat membuka Encounter dokter B (scope), tetapi Patient Summary tetap menampilkan ringkasan riwayat.
4. Dokter tidak dapat mengubah Encounter yang sudah *submitted* tanpa amendment.
5. Pharmacist tidak dapat mengubah isi `Medication Request`; hanya status/verifikasi.
6. Cashier tidak dapat membaca `Patient Encounter`; tidak dapat men-*delete* Payment Entry.
7. Queue Display hanya menerima field whitelist (tanpa nama/diagnosis).
8. Auditor read-only pada seluruh DocType klinis.
9. `System Manager` tidak memiliki akses baca DocType klinis (setelah pemangkasan).
10. Transisi state Visit yang tidak valid ditolak untuk setiap role.
11. **Nursing User** login → landing Workspace *Triase*; sidebar hanya memuat menu pada §0.3; Workspace Registrasi/Dokter/Farmasi/Kasir tidak terlihat.
12. Nursing User yang membuka langsung URL/API `Patient Encounter`, `Sales Invoice`, `Medication Request` mendapat **403** (menu tersembunyi ≠ aman).
13. User multi-role (Physician + Outpatient Supervisor) melihat gabungan Workspace dan tetap tidak mendapat hak klinis dari role supervisor.
14. Akun `Appointment Channel Service` hanya dapat memanggil Appointment API; semua endpoint lain ditolak.

---

## 12. Pertanyaan terbuka

1. Apakah satu orang boleh merangkap Registration + Queue Officer pada MVP (digabung role, permission tetap terpisah)?
2. Apakah **Cashier** boleh *submit* Sales Invoice, atau invoice di-submit otomatis oleh billing aggregator?
3. Apakah perlu pemisahan Doctor ↔ Clinic Assistant pada MVP (asisten menyiapkan draft)?
4. Apakah akses pasien (portal) wajib sebelum demo? Bila ya, P2 naik ke P1 dengan konsekuensi scope.
5. Kanal Appointment: apakah pasien login ke Frappe (role `Patient`) atau aplikasi kanal memakai satu akun layanan dan memverifikasi pasien sendiri (mis. NIK + tanggal lahir / OTP)?
