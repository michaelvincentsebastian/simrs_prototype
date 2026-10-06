# Hirarki SIMRS — Modul Rawat Jalan

> **Tujuan dokumen:** mendetailkan struktur modul **Rawat Jalan** sampai level submodul, menu, sub-menu, fungsi, mekanisme, dan relasi antarproses sehingga hirarki dapat dipakai sebagai dasar desain BPMN, sitemap/menu SIMRS, kebutuhan fungsional, dan diskusi dengan mentor/stakeholder.
>
> **Basis utama:** struktur yang diberikan pada file `SIMRS Hierarchy`, terutama area Registrasi, Triase Tanda Vital, Dokter, Kasir, dan Display Antrian.
>
> **Catatan penting:** bagian yang diberi label **[SUMBER]** mempertahankan struktur/istilah dari file Anda. Bagian **[BEST PRACTICE]** adalah elaborasi/improvisasi yang disarankan untuk membuat hirarki lebih operasional. Bagian **[BATASAN MODUL]** menjelaskan mana yang sebaiknya hanya diakses dari Rawat Jalan dan mana yang idealnya dieksekusi oleh modul rumah sakit lain.

---

# 1. Big Picture Rawat Jalan

## 1.1 Tujuan bisnis modul Rawat Jalan

Modul Rawat Jalan mengelola perjalanan pasien dari:

```text
Pasien ingin berobat
        ↓
Pendaftaran / Appointment
        ↓
Verifikasi identitas + penjamin
        ↓
Check-in / kedatangan pasien
        ↓
Encounter Rawat Jalan terbentuk
        ↓
Antrian / pemanggilan
        ↓
Triase / TTV
        ↓
Pelayanan dokter
        ↓
Order tindakan / pemeriksaan / resep / rujukan
        ↓
Pelaksanaan layanan penunjang
        ↓
Hasil pemeriksaan kembali ke rekam medis
        ↓
Penyelesaian pelayanan dokter
        ↓
Billing / verifikasi penjamin
        ↓
Pembayaran / penjaminan
        ↓
Resep → Farmasi
        ↓
Follow-up / appointment berikutnya / rujukan
        ↓
Encounter selesai
```

Secara konseptual, Rawat Jalan sebaiknya dipandang bukan sebagai satu layar “pendaftaran + dokter + kasir”, tetapi sebagai **rangkaian lifecycle kunjungan pasien**.

---

# 2. Prinsip Hirarki yang Dipakai

Agar struktur tidak terlalu dangkal atau terlalu teknis, gunakan empat level berikut:

```text
MODUL
└── Submodul
    └── Menu
        └── Sub-menu / fungsi
```

Contoh:

```text
Rawat Jalan
└── Registrasi
    └── Appointment
        ├── Buat Appointment
        ├── Ubah Appointment
        ├── Batalkan Appointment
        └── Check-in Appointment
```

### Perbedaan level

| Level | Pertanyaan yang dijawab | Contoh |
|---|---|---|
| Modul | Domain bisnis besar apa? | Rawat Jalan |
| Submodul | Tahap/proses bisnis fundamental apa? | Registrasi, Triase, Pelayanan Dokter |
| Menu | Aktivitas utama user apa? | Appointment, Billing |
| Sub-menu | Aksi/fungsi konkret apa? | Buat Appointment, Verifikasi Penjamin |

**Prinsip yang sangat penting:** pemecahan submodul sebaiknya mengikuti **kapabilitas/proses bisnis fundamental**, bukan sekadar berdasarkan tombol atau layar.

---

# 3. Hirarki Utama yang Direkomendasikan

```text
RAWAT JALAN
│
├── 1. Registrasi
│   ├── 1.1 Appointment
│   ├── 1.2 Walk-in Registration
│   ├── 1.3 Kiosk / Anjungan Pendaftaran Mandiri
│   ├── 1.4 Check-in & Konfirmasi Kehadiran
│   ├── 1.5 Verifikasi Identitas & Data Pasien
│   ├── 1.6 Verifikasi Penjamin
│   └── 1.7 Antrian Rawat Jalan
│
├── 2. Triase / Tanda Vital
│   ├── 2.1 Daftar Antrian Triase
│   ├── 2.2 Identifikasi Pasien
│   ├── 2.3 Input Tanda Vital
│   ├── 2.4 Screening / Skrining Awal
│   └── 2.5 Routing ke Poli / Dokter
│
├── 3. Pelayanan Dokter
│   ├── 3.1 Daftar Antrian Dokter
│   ├── 3.2 Pemanggilan Pasien
│   ├── 3.3 Data Pasien
│   ├── 3.4 Anamnesis
│   ├── 3.5 Pemeriksaan / Objective
│   ├── 3.6 Assessment
│   ├── 3.7 Diagnosis
│   ├── 3.8 Order / Permintaan Layanan
│   │   ├── Laboratorium
│   │   ├── Radiologi
│   │   ├── Rehabilitasi Medik
│   │   ├── Tindakan
│   │   └── Konsultasi / Rujukan
│   ├── 3.9 Resep / Medication Order
│   ├── 3.10 Plan
│   ├── 3.11 Resume Medis
│   └── 3.12 Penyelesaian Encounter
│
├── 4. Penunjang Rawat Jalan [BEST PRACTICE]
│   ├── 4.1 Order Laboratorium
│   ├── 4.2 Order Radiologi
│   ├── 4.3 Order Rehabilitasi Medik
│   ├── 4.4 Monitoring Status Order
│   └── 4.5 Hasil Pemeriksaan / Result Review
│
├── 5. Farmasi Rawat Jalan [BEST PRACTICE]
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
│   ├── 6.6 Refund / Koreksi
│   └── 6.7 Dokumen Pembayaran
│
├── 7. Penyelesaian Kunjungan [BEST PRACTICE]
│   ├── 7.1 Follow-up
│   ├── 7.2 Appointment Berikutnya
│   ├── 7.3 Surat Kontrol
│   ├── 7.4 Rujukan
│   ├── 7.5 Edukasi / Instruksi Pulang
│   └── 7.6 Finalisasi Encounter
│
└── 8. Antrian & Display
    ├── 8.1 Display Antrian Poli / Dokter
    ├── 8.2 Display Antrian Kasir
    ├── 8.3 Display Antrian Farmasi
    └── 8.4 Monitoring Antrian [BEST PRACTICE]
```

> **Catatan desain:** Penunjang, Farmasi, dan Penyelesaian Kunjungan di atas adalah pengembangan yang direkomendasikan. Dalam implementasi enterprise, Laboratorium, Radiologi, Farmasi, dan Keuangan sering menjadi modul tersendiri, tetapi Rawat Jalan tetap membutuhkan **akses/order/status integration** terhadap modul-modul tersebut.

---

# 4. Fondasi Data: Pasien, Appointment, Encounter, Order, Billing

Sebelum masuk ke setiap submodul, bedakan objek bisnis berikut.

## 4.1 Patient

Identitas pasien.

Contoh:

```text
MRN / No. Rekam Medis
Nama
Tanggal lahir
Jenis kelamin
Alamat
Kontak
Identitas kependudukan
Data penjamin
```

Patient tidak sama dengan kunjungan.

---

## 4.2 Appointment

Appointment adalah **rencana / booking kunjungan**.

Contoh:

```text
Pasien A
→ Klinik Penyakit Dalam
→ Dokter X
→ 10 Oktober 2026
→ 09.00
→ sumber: Mobile App
```

Appointment dapat:

```text
Booked
↓
Confirmed
↓
Arrived
↓
Fulfilled / dikaitkan dengan pelayanan
```

Appointment bukan rekam klinis utama dari pelayanan.

---

## 4.3 Encounter

Encounter adalah **peristiwa pelayanan pasien yang benar-benar berlangsung**.

Contoh:

```text
Appointment:
09.00 pasien dijadwalkan

Check-in:
08.45 pasien datang

Encounter:
09.35 pelayanan dokter dimulai

10.05 pelayanan selesai
```

Jadi:

```text
Appointment ≠ Encounter
```

Namun keduanya dapat saling terhubung.

Dalam model FHIR, Appointment merepresentasikan booking, sedangkan Encounter merepresentasikan kejadian pelayanan; Appointment dapat menjadi dasar terbentuknya Encounter. citeturn123676search1turn123676search7

---

## 4.4 Service Request / Order

Order adalah permintaan layanan.

Contoh:

```text
Dokter
→ Order CBC
→ Order Foto Thorax
→ Order Fisioterapi
```

Order tersebut belum berarti pemeriksaan sudah dilakukan.

Status sederhananya:

```text
Requested
↓
Accepted
↓
In Progress
↓
Completed
↓
Result Available
```

Konsep ServiceRequest digunakan untuk merepresentasikan permintaan layanan yang akan dilakukan. citeturn531954search1turn531954search3

---

## 4.5 Medication Request / Resep

Resep adalah **instruksi/permintaan obat**, bukan transaksi dispensing itu sendiri.

```text
Dokter
→ membuat resep
        ↓
Farmasi
→ verifikasi
        ↓
→ dispensing
        ↓
→ obat diserahkan
```

Konsep ini sejalan dengan pemisahan MedicationRequest sebagai order/request obat dan proses dispensing sebagai proses berikutnya. citeturn531954search0turn531954search2

---

## 4.6 Billing

Billing mengumpulkan konsekuensi finansial dari pelayanan.

```text
Encounter
  ├── Konsultasi
  ├── Tindakan
  ├── Laboratorium
  ├── Radiologi
  ├── Obat
  └── Layanan lainnya
          ↓
      Billing
          ↓
  Penjamin / pasien
          ↓
      Settlement
```

---

# 5. SUBMODUL 1 — REGISTRASI

## 5.1 Tujuan

Registrasi menangani proses administratif sebelum pasien menerima pelayanan.

Output utama registrasi:

```text
Pasien teridentifikasi
+
Tujuan layanan diketahui
+
Dokter/poli diketahui
+
Tanggal/jadwal diketahui
+
Penjamin diketahui
+
Pasien mendapatkan status siap dilayani
+
Encounter dapat dibentuk ketika pelayanan dimulai
```

---

## 5.2 Struktur Submodul

```text
Registrasi
├── Appointment
├── Walk-in Registration
├── Kiosk
├── Check-in
├── Verifikasi Pasien
├── Verifikasi Penjamin
└── Antrian
```

---

# 6. Registrasi — Appointment

### [SUMBER]

File Anda mendefinisikan channel appointment:

```text
Appointment Registration
├── Web App
├── Mobile App
└── WhatsApp Chatbot
```

### Fungsi

Menyediakan mekanisme pasien memilih dan memesan pelayanan sebelum datang.

### Menu

```text
Appointment
├── 1. Cari Jadwal
├── 2. Buat Appointment
├── 3. Lihat Appointment
├── 4. Ubah Appointment
├── 5. Batalkan Appointment
├── 6. Konfirmasi Appointment
├── 7. Reschedule
└── 8. Check-in Appointment
```

### 6.1 Cari Jadwal

Filter:

```text
Tanggal
Poli
Dokter
Jenis layanan
Penjamin
Slot tersedia
```

### 6.2 Buat Appointment

Input:

```text
Pasien
Poli
Dokter
Tanggal
Jam / slot
Jenis kunjungan
Penjamin
Alasan kunjungan
```

Output:

```text
Booking ID
QR / barcode
Nomor antrian (jika sistem menerbitkannya lebih awal)
Status = Booked
```

### 6.3 Ubah / Reschedule

Dipakai ketika:

```text
pasien tidak dapat datang
dokter berubah
jadwal dokter berubah
pasien ingin memilih slot lain
```

Sistem harus menjaga audit trail:

```text
09.00 → dibuat
09.05 → diubah menjadi 11.00
11.00 → dikonfirmasi
```

Jangan hanya overwrite nilai tanpa menyimpan histori perubahan.

---

# 7. Registrasi — Walk-in Registration

### [SUMBER]

File Anda menyebut:

```text
Walk-in Registration
├── Portal Login
└── Portal Pendaftaran Pasien
```

### Pengertian

Walk-in berarti pasien datang tanpa appointment sebelumnya.

Flow:

```text
Pasien datang
↓
Cari pasien
├── Pasien lama → gunakan MRN
└── Pasien baru → registrasi identitas
↓
Pilih tujuan layanan
↓
Pilih penjamin
↓
Validasi
↓
Nomor antrian
↓
Siap menuju triase
```

### Menu

```text
Walk-in Registration
├── Registrasi Pasien Lama
├── Registrasi Pasien Baru
├── Pemilihan Poli
├── Pemilihan Dokter
├── Pemilihan Penjamin
├── Verifikasi Data
└── Cetak / Kirim Bukti Pendaftaran
```

---

# 8. Registrasi — KIOSK

### [SUMBER]

File Anda sudah menempatkan KIOSK sebagai channel tersendiri.

Struktur:

```text
Anjungan Pendaftaran Mandiri
├── Pendaftaran & Check-In
│   ├── Check-In Pasien Online
│   ├── Pendaftaran Pasien Lama
│   └── Pendaftaran Pasien Baru
│
└── Pemilihan Penjamin
    ├── BPJS
    ├── Asuransi / Korporat
    └── Umum / Mandiri
```

---

## 8.1 Pendaftaran & Check-In

### Check-In Online

Input:

```text
QR / Booking Code
```

Sistem mencari:

```text
Appointment
+
Patient
+
Poli
+
Dokter
+
Jadwal
```

Kemudian:

```text
validasi kedatangan
↓
ubah status appointment → Arrived / Checked-in
↓
buat/aktifkan antrian
↓
tandai pasien siap ke tahap berikutnya
```

### Pendaftaran Pasien Lama

Input minimal:

```text
MRN
atau
NIK / nomor identitas
atau
scan kartu
```

Sistem mengambil master pasien.

Hindari membuat patient record baru apabila pasien sebenarnya sudah memiliki MRN.

### Pendaftaran Pasien Baru

Input:

```text
Identitas
Demografi
Kontak
Alamat
Data penjamin
Kontak darurat bila diperlukan
```

Output:

```text
MRN
+
profil pasien
```

---

# 9. Registrasi — Verifikasi Identitas

### BEST PRACTICE

Verifikasi pasien harus menghindari duplicate medical record.

Minimal:

```text
Nama
Tanggal lahir
NIK / identifier
Jenis kelamin
Nomor telepon
```

Sistem dapat memberi warning:

```text
"Pasien dengan NIK ini sudah memiliki MRN 123456"
```

Tujuannya mencegah:

```text
1 pasien
→ 2 MRN
→ rekam medis terpecah
```

---

# 10. Registrasi — Verifikasi Penjamin

### [SUMBER]

Penjamin:

```text
BPJS Kesehatan
Asuransi / Korporat
Umum / Mandiri
```

### Menu

```text
Verifikasi Penjamin
├── Pilih Penjamin
├── Validasi Kepesertaan
├── Validasi Hak Layanan
├── Validasi Rujukan / Surat Kontrol
├── Generate Dokumen Penjamin
└── Status Eligibility
```

### BPJS

Secara konseptual:

```text
Patient
↓
BPJS membership verification
↓
Referral / control letter validation
↓
Eligibility
↓
SEP / dokumen yang diperlukan
↓
pelayanan
```

### Asuransi / Korporat

```text
Membership
↓
Eligibility
↓
Plafon / benefit
↓
Guarantee / authorization
↓
Pelayanan
```

### Umum

```text
Tidak membutuhkan verifikasi third-party payer
↓
pasien menjadi pihak pembayar
```

---

# 11. Registrasi — Check-in dan Konfirmasi Kehadiran

## Ini adalah titik yang sangat penting untuk desain Anda.

APM / check-in tidak sebaiknya dianggap sekadar "registrasi ulang".

Lebih tepat:

```text
Appointment
      ↓
Check-in / APM
      ↓
Patient Arrived
      ↓
Administratively Ready
      ↓
Encounter / layanan dapat dimulai
```

### Tujuan

1. Mengonfirmasi pasien benar-benar datang.
2. Mengubah status appointment.
3. Memvalidasi kembali identitas dan penjamin.
4. Membuat atau mengaktifkan antrian.
5. Menghubungkan appointment dengan pelayanan aktual.

### Status yang disarankan

```text
BOOKED
→ CONFIRMED
→ ARRIVED
→ WAITING
→ IN_SERVICE
→ COMPLETED
```

Alternatif status akhir:

```text
CANCELLED
NO_SHOW
RESCHEDULED
```

---

# 12. Apakah APM termasuk Registrasi?

### Rekomendasi

Secara hirarki bisnis:

```text
Rawat Jalan
└── Registrasi
    ├── Appointment
    ├── Walk-in
    ├── KIOSK
    ├── Check-in / APM
    └── Verifikasi Penjamin
```

**Jawaban praktis:** ya, APM/check-in dapat ditempatkan di submodul Registrasi karena fungsi utamanya administratif dan merupakan tahap transisi dari appointment/pendaftaran menuju pelayanan.

Namun secara proses bisnis APM memiliki fungsi khusus:

```text
Appointment
        ↓
APM / Check-in
        ↓
Arrival Confirmation
        ↓
Queue
        ↓
Encounter / Service
```

Jadi APM **bukan appointment**, dan **bukan pelayanan dokter**.

---

# 13. SUBMODUL 2 — TRIASE / TANDA VITAL

### [SUMBER]

File Anda saat ini:

```text
Triase Tanda Vital
└── Input Vital Signs
```

### Rekomendasi pengembangan

```text
Triase / Tanda Vital
├── Daftar Antrian Triase
├── Identifikasi Pasien
├── Input TTV
├── Screening
├── Catatan Keperawatan Awal
└── Routing
```

---

# 14. Daftar Antrian Triase

Staff melihat:

```text
Nomor antrian
Nama pasien
MRN
Poli
Dokter
Jam datang
Status
```

Status:

```text
WAITING_TRIAGE
→ CALLED
→ IN_TRIAGE
→ TRIAGE_COMPLETED
```

---

# 15. Input Vital Signs

### Data umum

```text
Tekanan darah
Nadi
Respiratory rate
Suhu
SpO2
Berat badan
Tinggi badan
BMI
```

Data tambahan sesuai kebutuhan:

```text
GCS
nyeri
lingkar kepala
gula darah
```

### Mekanisme

```text
Pilih pasien
↓
Verifikasi identitas
↓
Input TTV
↓
Validasi nilai
↓
Simpan Observation
↓
TTV tampil di chart dokter
```

Sistem sebaiknya memberi warning untuk angka tidak wajar, tetapi **warning bukan diagnosis otomatis**.

---

# 16. Screening / Skrining Awal

Ini adalah area yang dapat berkembang tergantung kebijakan RS.

Contoh:

```text
Keluhan utama
Risiko jatuh
Alergi yang diketahui
Status nyeri
Skrining infeksi
Kondisi khusus
```

Output:

```text
normal
atau
perlu perhatian
atau
perlu eskalasi
```

---

# 17. Routing ke Poli / Dokter

Setelah triase:

```text
Triase selesai
↓
Pasien masuk antrian poli
↓
Pasien menunggu dokter
```

Dalam kasus tertentu:

```text
triase
↓
eskalasi
↓
IGD / layanan lain
```

Ini merupakan **business rule**, bukan sekadar tombol.

---

# 18. SUBMODUL 3 — PELAYANAN DOKTER

### [SUMBER]

File Anda:

```text
Dokter
├── View Antrian Pasien
│   └── Pemanggil Pasien
└── View Data Pasien
    ├── TTV
    ├── Anamnesis
    ├── Rujukan Online
    │   ├── Lab
    │   ├── Dokter Spesialis
    │   ├── Radiologi
    │   ├── Rehabilitasi Medis
    │   └── Luar
    ├── SOAP
    ├── Diagnosa
    ├── Resume Medis
    └── Resep Online
```

### Struktur yang lebih fundamental

```text
Pelayanan Dokter
├── Antrian
├── Clinical Chart
├── Assessment
├── Diagnosis
├── Order
├── Medication
├── Plan
├── Resume
└── Finalisasi Encounter
```

---

# 19. Dokter — Antrian

### Menu

```text
Antrian Dokter
├── Pasien Menunggu
├── Panggil
├── Lewati
├── Panggil Ulang
├── Mulai Pelayanan
└── Selesai Pelayanan
```

### Status

```text
WAITING_DOCTOR
↓
CALLED
↓
IN_SERVICE
↓
COMPLETED
```

---

# 20. Dokter — View Data Pasien

Satu layar clinical workspace sebaiknya tidak memaksa dokter berpindah terlalu banyak menu.

```text
Patient Summary
├── Identitas
├── TTV terbaru
├── Alergi
├── Riwayat penyakit
├── Riwayat kunjungan
├── Obat aktif
├── Hasil Lab
├── Hasil Radiologi
└── Appointment / Follow-up
```

Tujuannya adalah membantu dokter memahami konteks pasien sebelum menulis clinical note.

---

# 21. Anamnesis

Isi:

```text
Keluhan utama
Riwayat penyakit sekarang
Riwayat penyakit dahulu
Riwayat obat
Riwayat alergi
Riwayat keluarga
Riwayat sosial
Anamnesis khusus berdasarkan poli
```

Output:

```text
Subjective
```

---

# 22. Pemeriksaan Fisik / Objective

Isi:

```text
TTV
Pemeriksaan fisik
Temuan klinis
Pemeriksaan khusus
```

Output:

```text
Objective
```

---

# 23. SOAP

SOAP:

```text
S = Subjective
O = Objective
A = Assessment
P = Plan
```

Contoh:

```text
S:
Demam sejak 3 hari.

O:
T 38.5 C, nadi 100 bpm.

A:
Suspek infeksi saluran pernapasan.

P:
Lab CBC + terapi simptomatik + kontrol.
```

### Prinsip desain

SOAP harus terhubung dengan:

```text
Encounter
+
Dokter
+
waktu
+
pasien
```

Jangan menyimpan SOAP sebagai blob teks tanpa metadata jika sistem membutuhkan audit, analitik, atau integrasi.

---

# 24. Diagnosis

### Menu

```text
Diagnosis
├── Diagnosis Utama
├── Diagnosis Sekunder
├── Kondisi Tambahan
└── Riwayat Diagnosis
```

Sistem idealnya menyediakan pencarian terminologi/kode diagnosis sesuai standar yang digunakan RS.

### Business rule

```text
Diagnosis utama wajib?
→ tergantung jenis pelayanan.

Apakah diagnosis bisa dihapus?
→ idealnya tidak hard delete setelah finalisasi.

Apakah koreksi boleh?
→ yes, tetapi melalui amendment/correction + audit trail.
```

---

# 25. Order / Rujukan

Daripada semua rujukan dianggap satu hal, secara konsep lebih bersih membedakan:

```text
Clinical Order
├── Pemeriksaan Lab
├── Radiologi
├── Rehabilitasi Medik
└── Tindakan

Referral
├── Konsultasi internal
└── Rujukan eksternal
```

---

# 26. Order Laboratorium

```text
Dokter memilih pemeriksaan
↓
Sistem membuat Service Request
↓
Order dikirim ke Lab
↓
Status = Ordered
↓
Lab menerima
↓
Specimen / proses pemeriksaan
↓
Result
↓
Result masuk ke rekam medis
↓
Dokter review
```

Penting:

```text
ORDER ≠ RESULT
```

---

# 27. Order Radiologi

Flow:

```text
Doctor
↓
Request Radiology
↓
Order diterima Radiologi
↓
Pemeriksaan
↓
Image / result
↓
Radiology report
↓
Masuk ke patient chart
```

---

# 28. Order Rehabilitasi Medik

```text
Dokter
↓
Assessment kebutuhan rehab
↓
Request
↓
Penjadwalan
↓
Pelayanan rehab
↓
Catatan hasil
```

Jika modul Rehabilitasi Medik berdiri sendiri, Rawat Jalan cukup mengelola:

```text
request
+
status
+
hasil/catatan yang relevan
```

---

# 29. Rujukan Dokter Spesialis / Internal

Contoh:

```text
Poli Umum
↓
Rujuk
↓
Poli Jantung
↓
Appointment / queue baru
↓
Encounter berikutnya
```

Jangan membuat semua rujukan menjadi encounter baru otomatis.

Rujukan adalah:

```text
intent / request
```

sedangkan pelayanan spesialis adalah:

```text
actual encounter
```

---

# 30. Rujukan Eksternal

Contoh:

```text
RS A
↓
Rujuk ke RS B
```

Dokumen dapat memuat:

```text
identitas pasien
alasan rujukan
diagnosis
temuan
terapi
hasil penunjang
dokter pengirim
tujuan rujukan
```

---

# 31. Resep Online / Medication

### [SUMBER]

File Anda sudah memiliki:

```text
Resep Online
```

### Best practice

Jadikan sebagai:

```text
Medication
├── Pilih obat
├── Dosis
├── Frekuensi
├── Rute
├── Durasi
├── Instruksi
├── Jumlah
└── Catatan
```

Flow:

```text
Dokter
↓
Buat resep
↓
Validasi
↓
Sign
↓
Kirim Farmasi
↓
Pharmacy Queue
↓
Dispensing
```

Resep sebaiknya memiliki status:

```text
DRAFT
→ SIGNED
→ SENT
→ VERIFIED
→ DISPENSING
→ DISPENSED
→ COMPLETED
```

Status aktual dapat disederhanakan sesuai kebutuhan.

---

# 32. Plan

Plan berisi rencana tindak lanjut.

```text
Terapi
Pemeriksaan lanjutan
Kontrol
Rujukan
Edukasi
Modifikasi obat
```

---

# 33. Resume Medis

Resume merupakan ringkasan hasil kunjungan.

Minimal:

```text
Identitas
Tanggal kunjungan
Dokter
Keluhan
Diagnosis
Tindakan
Terapi
Hasil pemeriksaan penting
Kondisi pasien
Rencana
Follow-up
```

Resume sebaiknya tersedia setelah clinical note memenuhi aturan finalisasi.

---

# 34. Finalisasi Encounter

Dokter/admin tidak boleh sekadar menekan:

```text
"Selesai"
```

tanpa validasi.

Contoh checklist:

```text
[✓] Anamnesis
[✓] Pemeriksaan
[✓] Diagnosis
[✓] Order
[✓] Resep
[✓] Plan
[✓] Resume
```

Kemudian:

```text
Finalize Encounter
```

Setelah final:

```text
data dikunci dari edit biasa
```

Koreksi harus memakai mekanisme amendment / correction dan audit trail.

---

# 35. SUBMODUL 4 — PENUNJANG RAWAT JALAN

## Mengapa perlu ada?

Dalam file Anda, dokter dapat membuat:

```text
Rujukan Lab
Rujukan Radiologi
Rujukan Rehabilitasi Medis
```

Tetapi rujukan/order tersebut membutuhkan lifecycle setelah dokter menekan submit.

Maka perlu ada minimal **integration surface**.

### Hirarki

```text
Penunjang
├── Laboratory
├── Radiology
├── Rehabilitation
└── Order Monitoring
```

---

# 36. Order Monitoring

Menu:

```text
Order Penunjang
├── Semua Order
├── Menunggu
├── Diproses
├── Selesai
├── Hasil tersedia
└── Dibatalkan
```

Contoh:

```text
CBC
Status: RESULT_AVAILABLE
```

Dokter dapat membuka hasil.

---

# 37. Result Review

Dokter melihat:

```text
Order
↓
Result
↓
Interpretation / Report
↓
Review
```

Hasil tetap harus ditautkan dengan:

```text
Patient
Encounter
Order
Performer
Waktu
```

---

# 38. SUBMODUL 5 — FARMASI RAWAT JALAN

## Kenapa farmasi saya tambahkan?

Di file sumber, dokter menghasilkan `Resep Online` dan kasir memiliki proses billing. Tetapi lifecycle resep membutuhkan proses setelah resep dibuat.

Secara enterprise, farmasi dapat menjadi modul mandiri, tetapi Rawat Jalan harus mempunyai integrasi.

### Hirarki

```text
Farmasi Rawat Jalan
├── Resep Masuk
├── Verifikasi Resep
├── Dispensing
├── Penyerahan
└── Status Resep
```

---

# 39. Verifikasi Resep

Farmasi memeriksa:

```text
Pasien
Obat
Dosis
Frekuensi
Jumlah
Alergi
Interaksi / duplicate therapy
Ketersediaan
Aturan formularium
```

Jika ada masalah:

```text
Pharmacist
↓
Clarification
↓
Dokter
↓
Revisi resep
```

Hindari mengubah resep dokter diam-diam.

---

# 40. Dispensing

Flow:

```text
Prescription
↓
Pharmacy Verification
↓
Pick Medication
↓
Prepare
↓
Label
↓
Final check
↓
Dispense
```

Status:

```text
VERIFIED
→ PREPARING
→ READY
→ DISPENSED
```

---

# 41. SUBMODUL 6 — KASIR / BILLING

### [SUMBER]

File Anda:

```text
Kasir
├── Billing Pasien
│   ├── Tambah Pelayanan/Tindakan
│   └── Pembayaran
│       ├── Tunai
│       ├── Debit/Kredit
│       ├── Online
│       ├── Jaminan Asuransi
│       └── Jaminan Perusahaan
└── Cetak Kwitansi
```

### Best practice

Kasir sebaiknya tidak menjadi tempat utama untuk "mengarang" pelayanan.

Lebih baik:

```text
Pelayanan klinis
↓
Service / procedure recorded
↓
Tarif engine
↓
Billing
↓
Payer
↓
Settlement
```

Kasir boleh melakukan koreksi administratif sesuai hak akses, tetapi bukan menggantikan clinical source.

---

# 42. Billing Pasien

Billing harus mengumpulkan:

```text
Consultation
Tindakan
Lab
Radiology
Rehab
Obat
Administrasi
Layanan lain
```

Contoh:

```text
Konsultasi           Rp 100.000
CBC                  Rp  50.000
Obat                 Rp  75.000
------------------------------
Total                Rp 225.000
```

Namun sumber biaya sebaiknya berasal dari service transaction masing-masing.

---

# 43. Tarif

### BEST PRACTICE

Pisahkan:

```text
Service Master
+
Tariff Master
```

Contoh:

```text
Service:
Konsultasi Spesialis

Tarif:
Umum       Rp X
Asuransi   Rp Y
BPJS       sesuai skema penjamin
```

Jangan hard-code tarif di layar kasir.

---

# 44. Verifikasi Penjamin di Billing

Walaupun eligibility sudah dilakukan saat registrasi, billing bisa memerlukan validasi ulang.

Alasan:

```text
pelayanan aktual berbeda dari rencana
ada tindakan tambahan
benefit tidak menanggung item tertentu
pre-authorization diperlukan
```

Maka:

```text
Registration eligibility
≠
Final billing adjudication
```

---

# 45. Pembayaran

```text
Pembayaran
├── Cash
├── Debit
├── Credit
├── QRIS
├── Transfer / Virtual Account
├── Insurance
└── Corporate Guarantee
```

Payment menghasilkan:

```text
Payment ID
Tanggal
Jam
Metode
Amount
Cashier
Reference
Status
```

---

# 46. Refund / Koreksi

### BEST PRACTICE

Jangan menghapus transaksi pembayaran.

Gunakan:

```text
Payment
↓
Refund / reversal
```

dengan:

```text
reason
approver
timestamp
operator
reference transaction
```

---

# 47. Kwitansi

Isi minimal:

```text
Nomor transaksi
Pasien
MRN
Tanggal
Item
Total
Penjamin
Metode pembayaran
Kasir
```

Output:

```text
Print
PDF
Email / digital receipt
```

---

# 48. SUBMODUL 7 — PENYELESAIAN KUNJUNGAN

Ini merupakan bagian yang belum eksplisit pada file Anda tetapi secara proses sangat penting.

Setelah dokter selesai:

```text
Apa yang terjadi pada pasien?
```

Jawabannya mungkin:

```text
Pulang
Kontrol
Rujuk
Farmasi
Pemeriksaan lanjutan
Rawat inap
IGD
```

### Hirarki

```text
Penyelesaian Kunjungan
├── Follow-up
├── Appointment Berikutnya
├── Surat Kontrol
├── Rujukan
├── Edukasi
└── Finalisasi Encounter
```

---

# 49. Follow-up

Dokter menentukan:

```text
Kontrol 7 hari
Kontrol 1 bulan
Kontrol bila ada keluhan
Tidak perlu kontrol
```

Sistem dapat membuat appointment berikutnya.

Flow:

```text
Plan:
Kontrol 1 bulan
↓
Generate appointment
↓
Patient receives schedule
```

---

# 50. Surat Kontrol

Untuk payer tertentu, surat kontrol dapat menjadi dokumen proses administratif.

Data:

```text
Pasien
Dokter
Poli
Tanggal kontrol
Diagnosis / alasan
Instruksi
```

Dokumen harus terhubung dengan encounter asal.

---

# 51. Edukasi / Instruksi Pasien

Contoh:

```text
Cara minum obat
Pantangan
Tanda bahaya
Kapan harus kembali
Kapan harus ke IGD
```

Pasien dapat menerima:

```text
Print
Portal
Mobile App
WhatsApp
```

---

# 52. SUBMODUL 8 — ANTRIAN & DISPLAY

### [SUMBER]

File Anda:

```text
Display Antrian
├── Display Antrian Poli/Dokter
└── Display Antrian Kasir & Farmasi
```

### Rekomendasi

Pertahankan sebagai submodul/kapabilitas terpisah karena merupakan cross-cutting function.

```text
Antrian & Display
├── Queue Management
├── Display
├── Voice Caller
└── Monitoring
```

---

# 53. Queue Management

Antrian bukan sekadar nomor.

Data queue:

```text
Queue ID
Patient
Encounter
Location
Service
Priority
Queue Number
Created Time
Called Time
Start Service
Completed Time
Status
```

Status:

```text
WAITING
CALLED
IN_SERVICE
SKIPPED
RECALLED
COMPLETED
CANCELLED
```

---

# 54. Display Antrian Poli / Dokter

Menampilkan:

```text
Nomor
Poli
Dokter
Status
Loket / ruangan
```

Contoh:

```text
A-023 → Poli Mata → Silakan masuk Ruang 2
A-024 → Poli Mata → Menunggu
```

---

# 55. Display Kasir & Farmasi

Flow:

```text
Patient completed doctor
↓
Billing / Pharmacy queue
↓
called
↓
service
↓
completed
```

---

# 56. Cross-Cutting Module: Hak Akses

Walaupun bukan submodul klinis, hak akses sangat penting.

Contoh role:

```text
Registrar
Nurse
Doctor
Pharmacist
Cashier
Supervisor
Admin
```

### Registrar

Boleh:

```text
create registration
update demographic data
check-in
verify payer
```

Tidak boleh:

```text
edit diagnosis dokter
edit resep setelah signed
```

### Nurse

Boleh:

```text
TTV
screening
triage notes
```

Tidak boleh:

```text
finalize physician diagnosis
```

### Doctor

Boleh:

```text
SOAP
diagnosis
orders
prescription
plan
finalize clinical note
```

### Pharmacist

Boleh:

```text
verify prescription
dispensing
```

Tidak boleh:

```text
mengubah diagnosis dokter
```

### Cashier

Boleh:

```text
billing
payment
receipt
```

Tidak boleh:

```text
mengubah SOAP
```

---

# 57. Cross-Cutting Module: Audit Trail

Setiap data kritis sebaiknya memiliki:

```text
Who
What
When
Before
After
Reason
```

Contoh:

```text
Doctor A
03-10-2026 10:01
Diagnosis berubah
J06.9 → J02.9
Reason: correction after review
```

---

# 58. Cross-Cutting Module: Notification

Notification dapat digunakan untuk:

```text
Appointment reminder
Check-in
Queue
Doctor calling
Lab result available
Prescription ready
Payment successful
Follow-up reminder
```

Channel:

```text
Mobile App
WhatsApp
SMS
Email
Display
```

---

# 59. Cross-Cutting Module: Integration

Minimal integrasi:

```text
Mobile App
      ↓
Appointment API
      ↓
SIMRS

KIOSK
      ↓
Registration API
      ↓
SIMRS

BPJS / Payer
      ↓
Eligibility / claims

Lab
      ↕
Order / Result

Radiology
      ↕
Order / Report / Image

Pharmacy
      ↕
Prescription / Dispense

Finance
      ↕
Billing / Payment

SATUSEHAT / external exchange
      ↕
Clinical / administrative data
```

---

# 60. End-to-End Business Process

## Skenario A — Pasien Appointment

```text
1. Pasien memilih jadwal
       ↓
2. Appointment dibuat
       ↓
3. Pasien menerima booking ID / QR
       ↓
4. Pasien datang
       ↓
5. APM / counter melakukan check-in
       ↓
6. Identitas + penjamin diverifikasi
       ↓
7. Queue dibuat
       ↓
8. Pasien dipanggil ke triase
       ↓
9. TTV diinput
       ↓
10. Pasien masuk queue dokter
       ↓
11. Dokter memanggil pasien
       ↓
12. Encounter berlangsung
       ↓
13. SOAP + diagnosis
       ↓
14. Dokter membuat order / resep
       ↓
15. Penunjang / farmasi menjalankan order
       ↓
16. Billing mengumpulkan charge
       ↓
17. Pasien membayar / penjamin diproses
       ↓
18. Follow-up
       ↓
19. Encounter selesai
```

---

# 61. End-to-End Business Process — Walk-in

```text
Pasien datang
↓
Cari MRN
├── ditemukan → pasien lama
└── tidak ditemukan → pasien baru
↓
Pilih poli
↓
Pilih penjamin
↓
Eligibility
↓
Nomor antrian
↓
Triase
↓
Dokter
↓
Order / Resep
↓
Billing
↓
Farmasi / Penunjang
↓
Follow-up
↓
Selesai
```

---

# 62. End-to-End Business Process — Kasus Ada Lab

```text
Appointment / Walk-in
↓
Registration
↓
Check-in
↓
Triage
↓
Doctor
↓
Diagnosis sementara / assessment
↓
Lab Order
↓
Lab menerima order
↓
Specimen
↓
Testing
↓
Result
↓
Doctor reviews result
↓
Assessment diperbarui
↓
Prescription / Plan
↓
Billing
↓
Follow-up
```

Hal penting:

```text
Order dibuat di dokter
tetapi
eksekusi order dilakukan oleh Lab.
```

Jangan membuat dokter seolah-olah "menjalankan" laboratorium.

---

# 63. End-to-End Business Process — Kasus Resep

```text
Doctor
↓
Prescription
↓
Signed
↓
Pharmacy Queue
↓
Pharmacist Verification
↓
Picking
↓
Preparation
↓
Final Check
↓
Dispense
↓
Patient receives medicine
```

---

# 64. End-to-End Business Process — Kasus Rujukan Internal

```text
Doctor A
↓
Create referral
↓
Referral status = Requested
↓
Poli tujuan menerima
↓
Scheduling
↓
Appointment
↓
Patient arrives
↓
Encounter Poli B
```

Jangan otomatis membuat pelayanan Poli B ketika rujukan baru dibuat.

---

# 65. Status Lifecycle yang Disarankan

## Appointment

```text
PROPOSED
BOOKED
CONFIRMED
ARRIVED
FULFILLED
CANCELLED
NO_SHOW
RESCHEDULED
```

## Encounter

```text
PLANNED
ARRIVED
IN_PROGRESS
ON_HOLD
COMPLETED
CANCELLED
```

## Service Order

```text
DRAFT
ORDERED
ACCEPTED
IN_PROGRESS
COMPLETED
CANCELLED
```

## Prescription

```text
DRAFT
SIGNED
SENT
VERIFIED
PREPARING
READY
DISPENSED
CANCELLED
```

## Payment

```text
UNPAID
PENDING
PAID
FAILED
REVERSED
REFUNDED
```

---

# 66. Relasi Objek Bisnis

Gambaran data:

```text
PATIENT
   │
   ├───────────────┐
   │               │
   ↓               ↓
APPOINTMENT      ENCOUNTER
   │               │
   └──────┬────────┘
          │
          ├── OBSERVATION / TTV
          ├── CLINICAL NOTE / SOAP
          ├── DIAGNOSIS
          ├── SERVICE REQUEST
          │      ├── LAB
          │      ├── RADIOLOGY
          │      ├── REHAB
          │      └── OTHER SERVICE
          │
          ├── MEDICATION REQUEST
          │      ↓
          │   PHARMACY
          │
          ├── REFERRAL
          │
          └── BILLING / ACCOUNT
                    ↓
                 PAYMENT
```

---

# 67. Boundary: Apa yang Harus Masuk Rawat Jalan?

Gunakan prinsip berikut.

## Masuk langsung ke Rawat Jalan

```text
Appointment
Registration
Check-in
Queue
Triage
Doctor consultation
Clinical documentation
Order initiation
Referral
Follow-up
Encounter closure
```

## Idealnya modul tersendiri tetapi terintegrasi

```text
Laboratory
Radiology
Pharmacy
Finance
Insurance / Claim
Master Patient
Master Doctor / Staff
Master Tariff
Inventory
Document Management
Integration Engine
```

## Mengapa tidak semuanya dimasukkan ke Rawat Jalan?

Karena misalnya:

```text
Lab
```

tidak hanya menerima pasien rawat jalan.

Lab juga menerima:

```text
Rawat Inap
IGD
Medical Check Up
External
```

Maka Lab lebih tepat sebagai domain/service tersendiri.

Begitu pula:

```text
Pharmacy
Radiology
Finance
```

---

# 68. Cara Berpikir Saat Menentukan Submodul

Saat diberi proses baru, tanyakan:

### Pertanyaan 1
Apakah aktivitas ini mempunyai tujuan bisnis yang berbeda?

### Pertanyaan 2
Apakah aktor/user-nya berbeda?

### Pertanyaan 3
Apakah lifecycle datanya berbeda?

### Pertanyaan 4
Apakah modul tersebut dapat digunakan oleh lebih dari satu layanan?

Jika jawabannya banyak "ya", pertimbangkan menjadikannya **submodul/domain terpisah**.

---

# 69. Contoh: "Cetak SEP" Harus Jadi Submodul?

Tidak.

Lebih tepat:

```text
Registrasi
└── Verifikasi Penjamin
    └── BPJS
        └── Generate / Cetak SEP
```

Karena:

```text
SEP
```

adalah output dari proses verifikasi/eligibility, bukan domain bisnis yang berdiri sendiri.

---

# 70. Contoh: "Pemanggil Pasien" Harus Jadi Submodul?

Tidak.

Lebih tepat:

```text
Pelayanan Dokter
└── Antrian
    └── Pemanggilan Pasien
```

atau, bila queue menjadi domain terpusat:

```text
Antrian & Display
└── Pemanggilan
```

Jangan naikkan setiap fitur kecil menjadi submodul.

---

# 71. Contoh: "Input TTV" Harus Jadi Submodul?

Tidak.

Lebih baik:

```text
Rawat Jalan
└── Triase / Tanda Vital
    └── Input TTV
```

Karena input TTV adalah fungsi di dalam proses triase.

---

# 72. Contoh: "Appointment" dan "Registrasi" Apakah Sama?

Tidak sepenuhnya.

```text
Appointment
= merencanakan kunjungan
```

sedangkan:

```text
Registration
= mendaftarkan pasien untuk memperoleh layanan
```

Hubungannya:

```text
Appointment
     ↓
Check-in
     ↓
Registration confirmation
     ↓
Encounter
```

Pasien juga dapat langsung melakukan:

```text
Walk-in
     ↓
Registration
     ↓
Encounter
```

tanpa Appointment.

---

# 73. Recommended Sitemap UI

Untuk aplikasi internal SIMRS:

```text
Rawat Jalan
│
├── Dashboard
│
├── Registrasi
│   ├── Appointment
│   ├── Walk-in
│   ├── Check-in / APM
│   ├── Verifikasi Pasien
│   ├── Verifikasi Penjamin
│   └── Antrian Registrasi
│
├── Triase
│   ├── Antrian
│   ├── Vital Signs
│   ├── Screening
│   └── Routing
│
├── Pelayanan Dokter
│   ├── Antrian
│   ├── Patient Chart
│   ├── SOAP
│   ├── Diagnosis
│   ├── Order
│   ├── Prescription
│   ├── Referral
│   ├── Resume
│   └── Finalisasi
│
├── Penunjang
│   ├── Order Lab
│   ├── Order Radiologi
│   ├── Order Rehab
│   ├── Status Order
│   └── Hasil
│
├── Farmasi
│   ├── Resep Masuk
│   ├── Verifikasi
│   ├── Dispensing
│   └── Penyerahan
│
├── Billing & Kasir
│   ├── Billing
│   ├── Penjamin
│   ├── Pembayaran
│   ├── Refund
│   └── Kwitansi
│
├── Penyelesaian Kunjungan
│   ├── Follow-up
│   ├── Appointment Berikutnya
│   ├── Surat Kontrol
│   ├── Rujukan
│   └── Finalisasi Encounter
│
└── Antrian & Display
    ├── Monitoring
    ├── Display
    └── Pemanggilan
```

---

# 74. Recommended Sitemap — Pasien / Portal

Untuk patient-facing application:

```text
Layanan Rawat Jalan
├── Cari Dokter
├── Cari Poli
├── Lihat Jadwal
├── Buat Appointment
├── Appointment Saya
├── Check-in
├── Nomor Antrian
├── Status Antrian
├── Hasil Pemeriksaan
├── Resep
├── Tagihan
├── Pembayaran
├── Dokumen
└── Riwayat Kunjungan
```

---

# 75. Recommended Master Data yang Harus Mendukung Rawat Jalan

Walaupun master data bukan bagian langsung dari "clinical flow", modul Rawat Jalan akan sulit berjalan tanpa master berikut.

```text
Master Patient
Master Practitioner / Doctor
Master Poli
Master Service
Master Schedule
Master Slot
Master Room
Master Tariff
Master Payer
Master Insurance
Master Medication
Master Diagnosis
Master Procedure
Master Queue
Master Referral Destination
```

---

# 76. Dasar Scheduler

Appointment membutuhkan:

```text
Doctor schedule
+
Clinic schedule
+
Slot duration
+
Capacity
```

Contoh:

```text
Dokter A
09.00–12.00
15 menit/slot
```

Maka sistem dapat menghasilkan:

```text
09.00
09.15
09.30
09.45
10.00
...
```

Namun appointment slot tidak selalu sama dengan nomor antrian.

```text
Appointment time = waktu yang direncanakan

Queue number = urutan operasional
```

Keduanya dapat berbeda.

---

# 77. Perbedaan Appointment Time vs Queue Time

Contoh:

```text
Appointment pasien:
09.00

Pasien check-in:
08.45

Nomor antrian:
A-015

Dipanggil:
09.40
```

Tidak berarti sistem gagal.

Appointment adalah:

```text
planned time
```

sedangkan queue adalah:

```text
operational sequence
```

---

# 78. Data Flow Ringkas

```text
[Patient]
   │
   ▼
[Appointment / Walk-in]
   │
   ▼
[Registration]
   │
   ├── Patient Identity
   ├── Payer Eligibility
   └── Check-in
   │
   ▼
[Queue]
   │
   ▼
[Triage]
   │
   ├── Vital Signs
   └── Screening
   │
   ▼
[Encounter]
   │
   ▼
[Doctor]
   │
   ├── SOAP
   ├── Diagnosis
   ├── Orders
   ├── Prescription
   └── Referral
   │
   ├───────────────┬───────────────┐
   ▼               ▼               ▼
[Lab]         [Radiology]      [Pharmacy]
   │               │               │
   └───────────────┴───────┬───────┘
                           ▼
                     [Billing]
                           │
                    ┌──────┴──────┐
                    ▼             ▼
                [Patient]     [Payer]
                    │
                    ▼
               [Follow-up]
                    │
                    ▼
             [Encounter Closed]
```

---

# 79. Titik Kontrol Penting

Sistem sebaiknya memiliki business rule di titik-titik ini:

## Registration

```text
Apakah pasien valid?
Apakah MRN sudah ada?
Apakah penjamin valid?
Apakah appointment valid?
```

## Check-in

```text
Apakah jadwal sesuai?
Apakah pasien benar?
Apakah pasien sudah check-in?
```

## Triage

```text
Apakah TTV lengkap?
Apakah pasien benar?
```

## Doctor

```text
Apakah encounter aktif?
Apakah diagnosis sudah ada?
Apakah prescription sudah signed?
```

## Order

```text
Apakah order terkait encounter?
Apakah service tersedia?
```

## Pharmacy

```text
Apakah resep valid?
Apakah resep sudah signed?
```

## Billing

```text
Apakah semua service sudah ter-charge?
Apakah payer valid?
Apakah ada outstanding?
```

## Closure

```text
Apakah kewajiban clinical documentation selesai?
Apakah follow-up sudah ditentukan?
```

---

# 80. Audit & Traceability yang Diinginkan

Idealnya dari satu transaksi dapat ditelusuri:

```text
Patient
  ↓
Appointment
  ↓
Check-in
  ↓
Queue
  ↓
Encounter
  ↓
Doctor
  ↓
Order
  ↓
Result
  ↓
Prescription
  ↓
Dispensing
  ↓
Billing
  ↓
Payment
```

Ini akan sangat membantu:

```text
audit
billing dispute
clinical review
complaint handling
analytics
integrasi
```

---

# 81. Penentuan "Source of Truth"

Gunakan prinsip:

| Data | Source of truth yang disarankan |
|---|---|
| Identitas pasien | Patient Master |
| Appointment | Appointment Management |
| Kedatangan | Registration / Check-in |
| TTV | Clinical/Triage |
| SOAP | Doctor / Clinical Record |
| Diagnosis | Doctor / Clinical Record |
| Order Lab | Ordering Doctor / Order Service |
| Result Lab | Laboratory |
| Result Radiology | Radiology |
| Prescription | Doctor / Medication Order |
| Dispensing | Pharmacy |
| Tarif | Tariff Master |
| Billing | Billing / Finance |
| Payment | Payment/Finance |
| Queue | Queue Management |

Kasus yang perlu dihindari:

```text
Kasir menjadi source of truth untuk tindakan klinis.
```

atau:

```text
Farmasi mengubah isi diagnosis dokter.
```

---

# 82. Rekomendasi Struktur Final untuk Presentasi ke Mentor

Jika mentor Anda meminta **submodul fundamental**, saya akan menggunakan struktur berikut:

```text
RAWAT JALAN
│
├── 1. Registrasi
│   ├── Appointment
│   ├── Walk-in
│   ├── KIOSK
│   ├── Check-in
│   ├── Verifikasi Pasien
│   ├── Verifikasi Penjamin
│   └── Antrian
│
├── 2. Triase
│   ├── Antrian Triase
│   ├── Vital Signs
│   ├── Screening
│   └── Routing
│
├── 3. Pelayanan Dokter
│   ├── Antrian Dokter
│   ├── Clinical Chart
│   ├── Anamnesis
│   ├── Pemeriksaan
│   ├── SOAP
│   ├── Diagnosis
│   ├── Order
│   ├── Prescription
│   ├── Referral
│   ├── Resume
│   └── Finalisasi
│
├── 4. Penunjang
│   ├── Laboratorium
│   ├── Radiologi
│   ├── Rehabilitasi
│   ├── Order Monitoring
│   └── Result Review
│
├── 5. Farmasi
│   ├── Prescription Queue
│   ├── Verification
│   ├── Dispensing
│   └── Handover
│
├── 6. Billing & Kasir
│   ├── Billing
│   ├── Tarif
│   ├── Penjamin
│   ├── Payment
│   ├── Refund
│   └── Receipt
│
├── 7. Penyelesaian Kunjungan
│   ├── Follow-up
│   ├── Appointment Berikutnya
│   ├── Surat Kontrol
│   ├── Rujukan
│   ├── Edukasi
│   └── Encounter Closure
│
└── 8. Antrian & Display
    ├── Queue Monitoring
    ├── Display Poli/Dokter
    ├── Display Kasir
    └── Display Farmasi
```

---

# 83. Bagian yang Jangan Dipecah Menjadi Submodul Terpisah

Hindari struktur seperti ini:

```text
Rawat Jalan
├── Input TTV
├── Anamnesis
├── SOAP
├── Diagnosis
├── Resep
├── Cetak SEP
├── Cetak Kwitansi
├── Pemanggil Pasien
└── ...
```

Masalahnya adalah levelnya bercampur:

```text
Input TTV      = fungsi
SOAP           = clinical activity
Cetak SEP      = output/document
Pemanggil      = queue function
```

Sedangkan yang Anda butuhkan di level submodul adalah:

```text
Registrasi
Triase
Pelayanan Dokter
Penunjang
Farmasi
Billing
Penyelesaian Kunjungan
```

Baru di bawahnya fungsi-fungsi tadi berada.

---

# 84. Decision Rule Sederhana untuk BPMN

Saat membuat BPMN, gunakan:

```text
Submodul = swimlane/domain capability
Menu     = activity group
Sub-menu = operational function
Task     = langkah BPMN
```

Contoh:

```text
Submodul:
Registrasi

Menu:
Check-in

Sub-menu:
Check-in Appointment

Task BPMN:
Scan QR
→ retrieve appointment
→ verify identity
→ verify eligibility
→ create queue
```

Ini membuat hubungan antara:

```text
HIRARKI SISTEM
        ↕
BPMN
        ↕
USER STORY / REQUIREMENT
        ↕
DATABASE / API
```

menjadi konsisten.

---

# 85. Kesimpulan Big Picture

Inti dari sistem Rawat Jalan sebenarnya dapat dipadatkan menjadi tujuh pertanyaan bisnis:

```text
1. SIAPA pasiennya?
   → Registrasi / Patient

2. PASIEN mau datang kapan dan untuk apa?
   → Appointment

3. APAKAH pasien benar-benar datang dan eligible?
   → Check-in / Eligibility

4. SEJAUH MANA kondisi pasien saat datang?
   → Triase / TTV

5. APA yang dilakukan dokter?
   → Encounter / Clinical care

6. LAYANAN lanjutan apa yang harus dikerjakan?
   → Order / Pharmacy / Referral / Penunjang

7. BAGAIMANA pelayanan ditutup dan dibayar?
   → Billing / Payment / Follow-up / Encounter closure
```

Dengan pola ini:

```text
PLAN
  ↓
ARRIVAL
  ↓
ASSESS
  ↓
CARE
  ↓
ORDER
  ↓
FULFILL
  ↓
BILL
  ↓
FOLLOW-UP
  ↓
CLOSE
```

adalah mental model paling sederhana untuk memahami Rawat Jalan.

---

# 86. Referensi Konseptual Eksternal

Dokumen ini tidak dimaksudkan sebagai pemetaan 1:1 ke FHIR, tetapi beberapa konsepnya selaras dengan model interoperabilitas kesehatan:

- HL7 FHIR R4 — Appointment: booking kegiatan layanan kesehatan yang dapat menghasilkan Encounter.
- HL7 FHIR R4 — Encounter: representasi kejadian pelayanan aktual dan dapat dikaitkan dengan Appointment.
- HL7 FHIR R4 — ServiceRequest: permintaan layanan yang perlu dilakukan.
- HL7 FHIR R4 — MedicationRequest: permintaan/order obat untuk pasien.

Sumber:
- https://hl7.org/fhir/R4/appointment.html
- https://hl7.org/fhir/R4/encounter.html
- https://hl7.org/fhir/R4/servicerequest.html
- https://hl7.org/fhir/R4/medicationrequest.html

---

# 87. Ringkasan Struktur Final

```text
RAWAT JALAN
│
├── REGISTRASI
│   ├── Appointment
│   ├── Walk-in
│   ├── KIOSK
│   ├── Check-in / APM
│   ├── Patient Verification
│   ├── Payer Verification
│   └── Registration Queue
│
├── TRIASE
│   ├── Queue
│   ├── Vital Signs
│   ├── Screening
│   └── Routing
│
├── PELAYANAN DOKTER
│   ├── Queue
│   ├── Patient Chart
│   ├── Anamnesis
│   ├── Examination
│   ├── SOAP
│   ├── Diagnosis
│   ├── Order
│   ├── Prescription
│   ├── Referral
│   ├── Resume
│   └── Finalize Encounter
│
├── PENUNJANG
│   ├── Laboratory
│   ├── Radiology
│   ├── Rehabilitation
│   ├── Order Tracking
│   └── Results
│
├── FARMASI
│   ├── Prescription Queue
│   ├── Verification
│   ├── Dispensing
│   └── Handover
│
├── BILLING & KASIR
│   ├── Billing
│   ├── Tariff
│   ├── Payer
│   ├── Payment
│   ├── Refund
│   └── Receipt
│
├── PENYELESAIAN KUNJUNGAN
│   ├── Follow-up
│   ├── Next Appointment
│   ├── Control Letter
│   ├── Referral
│   ├── Education
│   └── Encounter Closure
│
└── ANTRIAN & DISPLAY
    ├── Monitoring
    ├── Display
    └── Calling
```

> **Prinsip paling penting untuk menjaga hirarki Anda tetap rapi:** jangan menempatkan `Input TTV`, `SOAP`, `Cetak SEP`, `Pemanggil Pasien`, atau `Cetak Kwitansi` sejajar dengan `Registrasi`, `Triase`, dan `Pelayanan Dokter`. Yang pertama adalah fungsi/fitur di dalam domain; yang kedua adalah domain/submodul fundamental.

---

# 88. Role & Hak Akses User — Rawat Jalan

Bagian ini memetakan **siapa yang boleh melakukan apa** di dalam modul Rawat Jalan.

> **Penting:** `Role` adalah fungsi pekerjaan di dalam sistem, sedangkan `User` adalah akun orang tertentu. Satu user dapat memiliki lebih dari satu role bila memang diperlukan, tetapi hak akses sebaiknya tetap mengikuti **least privilege**.
>
> Contoh: seorang dokter yang sekaligus menjadi kepala poli dapat memiliki role `Doctor` + `Outpatient Supervisor`, tetapi hak administratif supervisor tidak otomatis diberikan kepada semua dokter.

## 88.1 Prinsip RBAC yang digunakan

Gunakan 5 jenis permission dasar:

| Permission | Arti |
|---|---|
| `VIEW` | Melihat data |
| `CREATE` | Membuat data/transaksi |
| `UPDATE` | Mengubah data yang masih editable |
| `EXECUTE` | Menjalankan proses bisnis, misalnya check-in, panggil pasien, dispensing |
| `FINALIZE/APPROVE` | Mengunci/finalisasi atau memberikan persetujuan |

Tambahkan kontrol berikut di level implementasi:

- **Scope:** data sendiri, poli sendiri, unit sendiri, atau seluruh rumah sakit.
- **Ownership:** misalnya dokter dapat mengubah draft SOAP miliknya sendiri.
- **Status:** data yang sudah finalized tidak dapat diedit bebas.
- **Audit trail:** perubahan sensitif harus tercatat siapa, kapan, apa yang diubah, dan alasan.
- **Break-glass:** akses darurat ke data sensitif hanya untuk role tertentu dan wajib tercatat.

---

# 89. Daftar Role Utama Rawat Jalan

Role yang direkomendasikan untuk modul Rawat Jalan:

```text
01. Patient
02. Registration / Admission Staff
03. Queue / Front Desk Officer
04. Nurse / Triage Officer
05. Doctor
06. Medical Assistant / Clinic Assistant
07. Laboratory Officer
08. Radiology Officer
09. Radiologist
10. Rehabilitation / Physiotherapy Officer
11. Pharmacist
12. Pharmacy Assistant / Dispensing Staff
13. Cashier
14. Billing / Finance Officer
15. Insurance / Payer Officer
16. Medical Record Officer
17. Outpatient Supervisor / Head of Clinic
18. Quality / Clinical Auditor
19. System Administrator
20. IT Support
21. Audit / Compliance Officer
22. Kiosk Device Account [SYSTEM]
23. Queue Display Account [SYSTEM]
24. Integration Service Account [SYSTEM]
```

Tidak semua role harus dibuat sebagai role terpisah pada versi pertama aplikasi. Beberapa dapat digabung secara operasional, tetapi **permission-nya sebaiknya tetap dipisahkan**.

---

# 90. Role 01 — Patient

## Tujuan

Pasien melakukan pendaftaran, melihat status kunjungan, melakukan check-in, dan mengakses informasi yang memang diperbolehkan untuk dirinya sendiri.

## Hak akses

### Registrasi

| Fungsi | Akses |
|---|---|
| Melihat profil sendiri | VIEW |
| Melengkapi/mengubah data profil tertentu | UPDATE |
| Mencari jadwal dokter/poli | VIEW |
| Membuat appointment | CREATE |
| Mengubah appointment | UPDATE |
| Membatalkan appointment | EXECUTE |
| Melihat status appointment | VIEW |
| Check-in online | EXECUTE |
| Melihat kode booking/QR | VIEW |

### Kunjungan

| Fungsi | Akses |
|---|---|
| Melihat status check-in | VIEW |
| Melihat nomor antrian sendiri | VIEW |
| Melihat estimasi/status antrean | VIEW |
| Melihat poli/dokter tujuan | VIEW |
| Melihat instruksi kunjungan | VIEW |

### Billing

| Fungsi | Akses |
|---|---|
| Melihat tagihan sendiri | VIEW |
| Melakukan pembayaran online | EXECUTE |
| Melihat status pembayaran | VIEW |
| Mengunduh/cetak bukti pembayaran | VIEW |

### Klinis

| Fungsi | Akses |
|---|---|
| Melihat hasil pemeriksaan yang dipublikasikan | VIEW |
| Melihat resep/status obat | VIEW |
| Melihat resume/instruksi yang memang dirilis kepada pasien | VIEW |

### Tidak boleh

- Melihat data pasien lain.
- Mengubah SOAP dokter.
- Mengubah diagnosis.
- Mengubah hasil laboratorium/radiologi.
- Mengubah billing.
- Mengubah status encounter secara administratif.

---

# 91. Role 02 — Registration / Admission Staff

> **Catatan terminologi:** untuk Rawat Jalan, nama yang lebih jelas biasanya **Registration Staff / Front Office**. Istilah `Admission` sering diasosiasikan dengan penerimaan pasien rawat inap.

## Tujuan

Menjalankan registrasi pasien, verifikasi identitas, registrasi walk-in, appointment check-in, dan administrasi awal kunjungan.

## Menu utama

```text
Registrasi
├── Patient Search
├── Patient Registration
├── Appointment Registration
├── Walk-in Registration
├── Check-in / APM Processing
├── Patient Verification
├── Payer Verification
└── Registration Queue
```

## Hak akses

### Patient Master

- `VIEW` pasien yang diperlukan untuk pelayanan.
- `CREATE` pasien baru.
- `UPDATE` data demografi tertentu.
- `MERGE` tidak boleh; merge/duplikasi ditangani Medical Record Officer.

### Appointment

- `VIEW` appointment.
- `CREATE` appointment atas permintaan pasien.
- `UPDATE` jadwal jika kebijakan mengizinkan.
- `CANCEL` appointment dengan alasan.
- `CHECK-IN` appointment.

### Walk-in

- Membuat kunjungan walk-in.
- Menentukan poli/dokter/jenis layanan.
- Memilih/menetapkan penjamin sesuai hasil verifikasi.
- Membentuk registration record.

### Penjamin

- Verifikasi kepesertaan.
- Input nomor kepesertaan.
- Verifikasi rujukan/surat kontrol bila diperlukan.
- Memulai proses SEP bila terintegrasi dan role memang diberi kewenangan.

### Antrian

- Menambahkan pasien ke antrean.
- Mengubah tujuan antrean sebelum pelayanan dimulai.
- Menandai pasien `Arrived` / `Checked-in`.

## Tidak boleh

- Mengubah diagnosis.
- Mengubah SOAP.
- Menginput hasil klinis atas nama tenaga kesehatan.
- Mengubah tarif tanpa permission khusus.
- Membatalkan pembayaran yang telah settled tanpa approval.

---

# 92. Role 03 — Queue / Front Desk Officer

## Tujuan

Mengelola pergerakan pasien di area pelayanan dan sistem antrean.

## Hak akses

```text
Antrian
├── View Queue
├── Call Patient
├── Recall Patient
├── Skip / No Show
├── Pause Queue
├── Resume Queue
├── Transfer Queue
└── Monitor Waiting Time
```

### Akses data

- `VIEW` identitas minimum pasien.
- `VIEW` nomor antrean.
- `VIEW` poli/dokter tujuan.
- `EXECUTE` pemanggilan.
- `EXECUTE` skip/no-show sesuai SOP.
- `EXECUTE` transfer antrean bila diizinkan.

### Tidak boleh

- Melihat seluruh rekam medis klinis.
- Mengubah diagnosis.
- Mengubah SOAP.
- Mengubah billing.

---

# 93. Role 04 — Nurse / Triage Officer

## Tujuan

Melakukan triase awal sebelum pelayanan dokter.

## Menu

```text
Triase
├── Waiting List
├── Patient Identification
├── Vital Signs
├── Nursing Assessment / Screening
├── Allergy / Risk Alert
└── Route to Clinic / Doctor Queue
```

## Hak akses

### Patient Chart

`VIEW`:

- Identitas pasien.
- Riwayat kunjungan yang relevan.
- Alergi yang tersedia.
- Appointment.
- Data penjamin yang relevan.

### Triage

- `CREATE/UPDATE` TTV.
- `CREATE/UPDATE` catatan triase.
- `CREATE/UPDATE` screening awal.
- Menambahkan flag risiko sesuai kewenangan.
- `EXECUTE` routing ke antrean dokter.

### Tidak boleh

- Finalisasi diagnosis dokter.
- Mengubah diagnosis dokter tanpa workflow koreksi resmi.
- Membuat resep atas nama dokter.
- Finalisasi SOAP dokter.
- Mengubah hasil laboratorium/radiologi.

---

# 94. Role 05 — Doctor

Ini adalah role klinis utama pada Rawat Jalan.

## Menu

```text
Pelayanan Dokter
├── My Queue
├── Patient Chart
├── Anamnesis
├── Examination
├── SOAP
├── Diagnosis
├── Order
│   ├── Laboratory
│   ├── Radiology
│   ├── Rehabilitation
│   ├── Procedure
│   └── Referral
├── Prescription
├── Follow-up
├── Medical Resume
└── Finalize Encounter
```

## Hak akses utama

### Patient Chart

- `VIEW` rekam medis yang dibutuhkan untuk pelayanan.
- `VIEW` alergi.
- `VIEW` riwayat diagnosis.
- `VIEW` riwayat obat.
- `VIEW` hasil pemeriksaan.

### Clinical Documentation

- `CREATE` anamnesis.
- `CREATE/UPDATE` examination/objective.
- `CREATE` assessment.
- `CREATE/UPDATE` diagnosis sebelum finalisasi.
- `CREATE/UPDATE` SOAP.
- `CREATE` medical plan.

### Order

- Membuat order laboratorium.
- Membuat order radiologi.
- Membuat order rehabilitasi medis.
- Membuat order tindakan.
- Membuat referral/konsultasi.

### Prescription

- `CREATE` resep.
- `UPDATE` resep selama masih draft.
- `CANCEL` resep sebelum diproses sesuai kebijakan.
- Melihat status dispensing.

### Finalisasi

- `FINALIZE` encounter.
- Mengunci catatan klinis setelah pelayanan selesai.

### Tidak boleh

- Mengubah pembayaran.
- Mengubah transaksi kasir.
- Mengubah hasil pemeriksaan penunjang yang dibuat unit lain.
- Menghapus rekam medis secara fisik.

> Koreksi setelah `FINALIZE` harus menggunakan workflow amendment/correction, bukan edit langsung.

---

# 95. Role 06 — Medical Assistant / Clinic Assistant

Role ini bersifat opsional tergantung struktur poli.

## Tujuan

Membantu dokter secara administratif/operasional tanpa mengambil alih kewenangan klinis dokter.

## Hak akses

- `VIEW` daftar pasien dokter.
- `VIEW` data identitas.
- `VIEW` TTV.
- Mengelola persiapan ruangan/antrean.
- Membantu input data non-klinis atau draft yang memang diperbolehkan SOP.
- Menyiapkan formulir/tugas administrasi.

## Tidak boleh

- Menetapkan diagnosis sebagai keputusan klinis.
- Menandatangani/finalisasi SOAP dokter.
- Membuat resep atas nama dokter.
- Mengubah hasil pemeriksaan.

---

# 96. Role 07 — Laboratory Officer

> Role ini berinteraksi dengan Rawat Jalan melalui order dan hasil; modul Laboratorium dapat tetap berdiri sebagai modul terpisah.

## Hak akses

### Order

- `VIEW` order laboratorium yang ditujukan ke unitnya.
- `ACCEPT` order.
- `COLLECT` / mencatat specimen sesuai proses.
- `UPDATE` status pemeriksaan.

### Result

- Input hasil pemeriksaan sesuai kewenangan.
- Menyimpan draft result.
- Mengirim result untuk validasi.
- `FINALIZE` hanya bila role tersebut memang menjadi validator hasil.

## Tidak boleh

- Mengubah diagnosis dokter.
- Mengubah order dokter secara klinis tanpa workflow.
- Mengubah billing secara langsung.

---

# 97. Role 08 — Radiology Officer

## Hak akses

- Melihat order radiologi.
- Menjadwalkan pemeriksaan radiologi.
- Mengubah status pemeriksaan menjadi performed.
- Menginput data teknis pemeriksaan.
- Melampirkan hasil/gambar melalui sistem yang terintegrasi.
- Mengirim hasil ke Radiologist untuk interpretasi.

## Tidak boleh

- Menetapkan diagnosis radiologi final bila bukan Radiologist.
- Mengubah diagnosis dokter.

---

# 98. Role 09 — Radiologist

## Hak akses

- `VIEW` order radiologi.
- `VIEW` clinical indication yang relevan.
- `VIEW` image/study.
- Membuat laporan radiologi.
- `UPDATE` laporan selama masih draft.
- `FINALIZE` laporan radiologi.

## Tidak boleh

- Mengubah SOAP dokter.
- Mengubah billing pasien.

---

# 99. Role 10 — Rehabilitation / Physiotherapy Officer

## Hak akses

- Melihat referral/order rehabilitasi.
- Menjadwalkan layanan.
- Membuat assessment rehabilitasi sesuai profesi.
- Mencatat treatment/session.
- Menyelesaikan layanan rehabilitasi.
- Melihat instruksi klinis yang diperlukan.

## Tidak boleh

- Mengubah diagnosis dokter.
- Membuat resep dokter.
- Mengubah hasil unit lain.

---

# 100. Role 11 — Pharmacist

## Tujuan

Memproses resep dari dokter sampai obat siap/terserah kepada pasien.

## Hak akses

```text
Farmasi
├── Prescription Queue
├── Prescription Verification
├── Dispensing
├── Medication Preparation
├── Patient Counseling
├── Handover
└── Prescription Status
```

### Akses

- `VIEW` resep.
- `VERIFY` resep sesuai kewenangan farmasi.
- Melakukan dispensing.
- Mencatat substitusi/penyesuaian sesuai SOP dan kebijakan.
- Mencatat penyerahan obat.
- `UPDATE` status resep.

### Tidak boleh

- Mengubah diagnosis dokter.
- Mengubah SOAP.
- Mengedit resep dokter secara diam-diam.

Bila ada masalah resep:

```text
Pharmacist menemukan masalah
        ↓
Intervensi farmasi / komunikasi
        ↓
Dokter mengoreksi order bila diperlukan
        ↓
Pharmacist memproses ulang
```

---

# 101. Role 12 — Pharmacy Assistant / Dispensing Staff

Jika organisasi memisahkan Apoteker dan tenaga dispensing:

- `VIEW` resep yang sudah diverifikasi.
- Menyiapkan obat.
- Mengubah status preparation.
- Menyerahkan obat sesuai prosedur.
- Tidak melakukan clinical verification final bila kewenangannya bukan pharmacist.

---

# 102. Role 13 — Cashier

## Menu

```text
Kasir
├── Billing Queue
├── Patient Bill
├── Service / Charge
├── Payment
├── Receipt
└── Payment Status
```

## Hak akses

### Billing

- `VIEW` billing pasien.
- `VIEW` daftar layanan yang sudah menghasilkan charge.
- `ADD` charge hanya bila kebijakan mengizinkan input manual tertentu.
- Melihat tarif yang berlaku.

### Payment

- `CREATE` transaksi pembayaran.
- Cash.
- Debit/kredit.
- QRIS/e-payment.
- Penjamin/asuransi.
- Mencatat pembayaran parsial bila sistem mendukung.

### Dokumen

- Cetak kwitansi.
- Cetak bukti pembayaran.
- Melihat status transaksi.

### Tidak boleh

- Mengubah diagnosis.
- Mengubah SOAP.
- Mengubah TTV.
- Mengubah order klinis.
- Menghapus transaksi settled.

Refund/koreksi besar harus membutuhkan approval role yang lebih tinggi.

---

# 103. Role 14 — Billing / Finance Officer

Role ini lebih tinggi/lebih luas daripada Cashier.

## Hak akses

- Melihat seluruh billing Rawat Jalan sesuai unit.
- Verifikasi charge.
- Melakukan billing reconciliation.
- Koreksi administratif billing melalui workflow.
- Memproses refund sesuai approval.
- Melihat laporan transaksi.
- Monitoring outstanding payment.
- Rekonsiliasi payment gateway.

## Tidak boleh

- Mengubah data klinis.
- Mengubah diagnosis dokter.
- Mengubah hasil laboratorium/radiologi.

---

# 104. Role 15 — Insurance / Payer Officer

## Tujuan

Mengelola proses penjaminan yang tidak seharusnya menjadi tanggung jawab dokter atau kasir biasa.

## Hak akses

- Verifikasi eligibility.
- Melihat coverage.
- Verifikasi referral.
- Verifikasi authorization.
- Mengelola data penjamin pada encounter.
- Memproses/monitor SEP bila integrasi dan kewenangan tersedia.
- Menyiapkan dokumen klaim.
- Monitoring status klaim.

## Tidak boleh

- Mengubah diagnosis klinis hanya untuk menyesuaikan klaim.
- Mengubah SOAP.
- Mengubah hasil pemeriksaan.

---

# 105. Role 16 — Medical Record Officer

## Tujuan

Menjaga integritas dan kelengkapan rekam medis, bukan menggantikan tenaga klinis dalam membuat isi klinis.

## Hak akses

### Medical Record Management

- Mencari pasien.
- Melihat identitas.
- Melakukan verifikasi duplikasi.
- Mengelola duplicate/merge patient sesuai SOP.
- Mengelola metadata rekam medis.
- Memastikan kelengkapan dokumen.
- Mengelola amendment request.
- Mengelola permintaan release/akses dokumen sesuai kebijakan.

### Audit administratif

- Melihat siapa yang membuat/mengubah/finalize record.
- Melihat status kelengkapan dokumen.

## Tidak boleh

- Menulis diagnosis klinis atas nama dokter.
- Mengubah hasil klinis tanpa amendment workflow.
- Menghapus data klinis secara langsung.

---

# 106. Role 17 — Outpatient Supervisor / Head of Clinic

Role supervisi untuk kepala poli/unit.

## Hak akses

### Monitoring

- Melihat seluruh antrean unit.
- Melihat workload dokter/nurse.
- Melihat waiting time.
- Melihat jumlah pasien.
- Melihat status pelayanan.
- Melihat operational dashboard.

### Operational override

Boleh melakukan override tertentu, misalnya:

- Transfer pasien.
- Re-route antrean.
- Reassign dokter bila kondisi operasional mengharuskan.
- Membuka kembali proses administratif tertentu yang salah.
- Menyetujui koreksi tertentu.

### Batasan

Supervisor **tidak otomatis boleh mengubah catatan klinis dokter** hanya karena mempunyai akses supervisor.

Bila supervisor juga seorang dokter:

```text
Role = Doctor
+
Role = Outpatient Supervisor
```

Hak klinis dan administratif tetap dipisahkan.

---

# 107. Role 18 — Quality / Clinical Auditor

## Tujuan

Review kualitas dan kepatuhan pelayanan.

## Hak akses

- `VIEW` rekam medis untuk kasus yang memang menjadi objek audit.
- `VIEW` timeline encounter.
- `VIEW` audit trail.
- `VIEW` hasil pemeriksaan.
- `VIEW` diagnosis dan treatment.
- Membuat catatan audit.
- Membuat finding/recommendation.

## Default

`READ ONLY` terhadap clinical record.

Tidak boleh mengubah catatan dokter/nurse secara langsung.

---

# 108. Role 19 — System Administrator

## Tujuan

Mengelola konfigurasi sistem, bukan mengelola isi klinis sehari-hari.

## Hak akses

### User Management

- Create user.
- Disable/enable user.
- Reset credential melalui mekanisme aman.
- Assign role.
- Mengelola unit/organization mapping.

### Access Control

- Mengelola RBAC.
- Mengelola permission.
- Mengelola session/security policy.

### Master Data

- Konfigurasi poli.
- Konfigurasi service.
- Konfigurasi role.
- Konfigurasi queue.
- Konfigurasi parameter sistem.

## Prinsip keamanan

System Administrator **sebaiknya tidak diberikan akses klinis otomatis**.

```text
System Admin
    ≠
Clinical User
```

Untuk troubleshooting terhadap data sensitif, gunakan akses terkontrol/break-glass yang menghasilkan audit log.

---

# 109. Role 20 — IT Support

## Tujuan

Menangani masalah teknis pengguna.

## Hak akses

- Melihat status perangkat/integrasi.
- Melihat error teknis.
- Membantu reset akses sesuai SOP.
- Melihat log aplikasi yang tidak mengandung data sensitif bila memungkinkan.
- Troubleshooting printer/kiosk/display/queue.

## Tidak boleh secara default

- Membuka seluruh rekam medis pasien.
- Mengubah diagnosis.
- Mengubah billing.
- Mengubah data klinis.

---

# 110. Role 21 — Audit / Compliance Officer

## Tujuan

Mengawasi aktivitas sistem dan kepatuhan akses.

## Hak akses

- `VIEW` audit log.
- Mencari aktivitas user.
- Melihat siapa mengakses data pasien.
- Melihat perubahan data sensitif.
- Melihat login/failure/privilege escalation.
- Membuat laporan audit.

### Default

`READ ONLY`.

---

# 111. Role 22 — Kiosk Device Account [SYSTEM ROLE]

Kiosk bukan manusia, sehingga sebaiknya diperlakukan sebagai **service/device identity**.

## Hak akses

```text
Patient Identification
Appointment Lookup
QR/Booking Validation
Walk-in Registration Flow
Check-in
Queue Ticket Generation
Receipt/Document Printing
```

## Constraint

- Tidak boleh memiliki akses bebas ke seluruh Patient Master.
- Tidak boleh mengakses seluruh rekam medis.
- Hanya boleh memanggil API yang memang dibutuhkan oleh flow kiosk.

---

# 112. Role 23 — Queue Display Account [SYSTEM ROLE]

Digunakan oleh layar antrean.

## Hak akses

- Read-only queue.
- Nomor antrean.
- Status panggilan.
- Poli/dokter.
- Status kasir/farmasi bila memang ditampilkan.

## Tidak boleh

- Melihat nama lengkap pasien jika tidak diperlukan.
- Melihat rekam medis.
- Melihat diagnosis.
- Melihat billing detail.

---

# 113. Role 24 — Integration Service Account [SYSTEM ROLE]

Digunakan untuk integrasi antar-sistem.

Contoh:

```text
SIMRS
 ├── BPJS / Payer
 ├── Laboratory System
 ├── Radiology / PACS
 ├── Pharmacy
 ├── Payment Gateway
 └── Mobile App
```

## Prinsip

Setiap integrasi memiliki credential/service account terpisah.

Jangan menggunakan akun administrator umum untuk integrasi.

Contoh permission:

```text
BPJS Integration
 ├── Verify Eligibility
 ├── Verify Referral
 └── SEP Transaction
```

Tidak otomatis memiliki:

```text
UPDATE SOAP
DELETE PATIENT
CHANGE DIAGNOSIS
```

---

# 114. Role–Submodul Access Matrix

Legenda:

- **F** = Full operational access sesuai domain role.
- **C** = Create/execute.
- **U** = Update.
- **V** = View/read.
- **A** = Approve/finalize.
- **—** = Tidak diberikan.

| Role | Registrasi | Triase | Dokter | Penunjang | Farmasi | Billing/Kasir | Antrian | Rekam Medis |
|---|---|---|---|---|---|---|---|---|
| Patient | C/U own | V own | V released | V released | V status | V/payment | V own | V limited |
| Registration Staff | F | V limited | V limited | — | — | V limited | C/U | C/U demografi |
| Queue Officer | V | V | V queue | — | — | V queue | F | — |
| Nurse | V | F | V clinical | V relevant | V allergy/medication | — | C/U | C/U nursing |
| Doctor | V | V | F | C/U order + V result | C/U prescription | V limited | V/C | F clinical |
| Medical Assistant | V | V | V/C limited | — | V limited | — | C/U | C/U limited |
| Lab Officer | V order | — | — | F lab | — | V order/charge | — | V relevant |
| Radiology Officer | V order | — | — | F technical | — | V order/charge | — | V relevant |
| Radiologist | V | — | V relevant | F reporting | — | V | — | C/A radiology |
| Rehab Officer | V referral | — | V relevant | F rehab | — | V | C/U service | C/U rehab |
| Pharmacist | V | — | V prescription | — | F | V pharmacy charge | C/U pharmacy queue | V medication relevant |
| Pharmacy Assistant | V | — | V prescription | — | F dispensing limited | V | C/U pharmacy queue | V limited |
| Cashier | V billing identity | — | — | V charges | V charges | F | V | — |
| Billing/Finance | V | — | — | V charges | V charges | F + approve | V | — |
| Insurance Officer | F payer-related | — | V required | V required | V required | F payer | V | V required |
| Medical Record Officer | F MR admin | V | V | V | V | V | V | F MR admin |
| Outpatient Supervisor | F unit | F monitoring | V | V | V | F monitoring | F unit | V |
| Clinical Auditor | V audit scope | V audit scope | V read-only | V read-only | V read-only | V read-only | V | V read-only |
| System Administrator | Config only | Config only | Config only | Config only | Config only | Config only | Config | — by default |
| IT Support | Technical | Technical | Technical | Technical | Technical | Technical | Technical | — by default |
| Audit/Compliance | V logs | V logs | V logs | V logs | V logs | V logs | V logs | V logs |
| Kiosk Device | C limited | — | — | — | — | — | C ticket | — |
| Queue Display | — | — | — | — | — | — | V | — |
| Integration Account | API-specific | API-specific | API-specific | API-specific | API-specific | API-specific | API-specific | API-specific |

---

# 115. Detail Permission Matrix per Fungsi

Untuk implementasi RBAC yang lebih teknis, gunakan permission granular seperti berikut.

## 115.1 Registrasi

| Permission | Patient | Registration | Nurse | Doctor | Insurance | MR Officer |
|---|---|---|---|---|---|---|
| `PATIENT_VIEW` | Own | Yes | Yes | Yes | Limited | Yes |
| `PATIENT_CREATE` | — | Yes | — | — | — | Yes/controlled |
| `PATIENT_UPDATE` | Own | Yes/limited | — | — | Payer data only | Yes |
| `APPOINTMENT_CREATE` | Yes | Yes | — | Optional | — | — |
| `APPOINTMENT_UPDATE` | Own | Yes | — | Optional | — | — |
| `APPOINTMENT_CANCEL` | Own | Yes | — | Optional | — | — |
| `CHECKIN_EXECUTE` | Own | Yes | — | — | — | — |
| `PAYER_VERIFY` | — | Yes | — | — | Yes | — |
| `REGISTRATION_QUEUE_UPDATE` | — | Yes | Optional | — | — | — |

## 115.2 Triase

| Permission | Nurse | Doctor | Registration | Supervisor |
|---|---|---|---|---|
| `TRIAGE_VIEW_QUEUE` | Yes | Yes | Limited | Yes |
| `VITAL_CREATE` | Yes | Yes | — | — |
| `VITAL_UPDATE` | Yes | Yes | — | Controlled |
| `TRIAGE_NOTE_CREATE` | Yes | Optional | — | — |
| `TRIAGE_FINALIZE` | Yes | Optional | — | Controlled |
| `TRIAGE_ROUTE` | Yes | Yes | — | Yes |

## 115.3 Pelayanan Dokter

| Permission | Doctor | Nurse | Assistant | Supervisor | Auditor |
|---|---|---|---|---|---|
| `ENCOUNTER_VIEW` | Yes | Relevant | Relevant | Yes | Audit scope |
| `ANAMNESIS_CREATE` | Yes | Nursing scope | Limited | — | — |
| `EXAM_CREATE` | Yes | Nursing scope | — | — | — |
| `SOAP_CREATE` | Yes | — | Draft/support only | — | — |
| `DIAGNOSIS_CREATE` | Yes | — | — | — | Read |
| `ORDER_CREATE` | Yes | — | — | — | Read |
| `PRESCRIPTION_CREATE` | Yes | — | — | — | Read |
| `REFERRAL_CREATE` | Yes | — | — | — | Read |
| `ENCOUNTER_FINALIZE` | Yes | — | — | Approval/exception only | — |

## 115.4 Billing

| Permission | Cashier | Finance | Doctor | Registration | Supervisor |
|---|---|---|---|---|---|
| `BILL_VIEW` | Yes | Yes | Limited | Limited | Yes |
| `CHARGE_CREATE` | Controlled | Yes | Service event only | Controlled | Approval |
| `PAYMENT_CREATE` | Yes | Yes | — | — | — |
| `PAYMENT_VOID` | Limited | Yes/approval | — | — | Approval |
| `REFUND_CREATE` | — | Yes | — | — | Approval |
| `RECEIPT_PRINT` | Yes | Yes | — | — | Yes |

---

# 116. Boundary Penting Antar-Role

## 116.1 Registration Staff vs Nurse

```text
Registration Staff
    ↓
Pasien terdaftar + check-in
    ↓
Nurse
    ↓
TTV + triase
```

Registration Staff tidak seharusnya mengisi TTV hanya karena mempunyai akses ke data pasien.

---

## 116.2 Nurse vs Doctor

```text
Nurse
    → Triage
    → TTV
    → Nursing assessment

Doctor
    → Anamnesis klinis
    → Examination
    → Diagnosis
    → Order
    → Prescription
    → Plan
    → Finalize encounter
```

Data Nurse dapat menjadi input bagi dokter, tetapi bukan berarti Nurse dapat melakukan finalisasi domain Doctor.

---

## 116.3 Doctor vs Laboratory/Radiology

```text
Doctor
    ↓
Create Order
    ↓
Laboratory/Radiology
    ↓
Perform examination
    ↓
Result
    ↓
Doctor reviews result
```

Doctor **meminta** pemeriksaan, unit penunjang **melakukan dan menghasilkan result**.

---

## 116.4 Doctor vs Pharmacist

```text
Doctor
    ↓
Prescription / Medication Order
    ↓
Pharmacist
    ↓
Verify
    ↓
Dispense
    ↓
Handover
```

Pharmacist tidak mengubah keputusan klinis dokter secara diam-diam.

---

## 116.5 Cashier vs Clinical User

```text
Clinical users
    → menghasilkan service event / order

Billing
    → menghasilkan charge

Cashier
    → menghasilkan payment
```

Tiga hal ini sebaiknya tidak digabung menjadi satu hak akses.

---

# 117. Lifecycle Hak Akses terhadap Encounter

Access control idealnya tidak hanya berdasarkan **role**, tetapi juga **status encounter**.

Contoh:

```text
REGISTERED
   ↓
CHECKED-IN
   ↓
WAITING_TRIAGE
   ↓
TRIAGED
   ↓
WAITING_DOCTOR
   ↓
IN_PROGRESS
   ↓
ORDERED
   ↓
RESULT_AVAILABLE
   ↓
COMPLETED
   ↓
FINALIZED
```

Contoh aturan:

### Saat `WAITING_TRIAGE`

Nurse:

```text
CREATE TTV = YES
```

Doctor:

```text
VIEW TTV = YES
```

### Saat `IN_PROGRESS`

Doctor:

```text
UPDATE SOAP = YES
```

### Saat `FINALIZED`

Doctor:

```text
UPDATE SOAP = NO
```

Kecuali melalui:

```text
Request Amendment
      ↓
Approval / workflow
      ↓
Correction
      ↓
Audit Trail
```

---

# 118. Sensitive Permission yang Sebaiknya Dipisahkan

Ada beberapa permission yang jangan pernah otomatis ikut ketika role diberikan.

```text
PATIENT_MERGE
DIAGNOSIS_CORRECT
SOAP_AMEND
ENCOUNTER_REOPEN
PAYMENT_VOID
PAYMENT_REFUND
BILLING_CORRECTION
PRESCRIPTION_CANCEL_AFTER_ACCEPT
RESULT_AMEND
ROLE_ASSIGN
AUDIT_LOG_VIEW
BREAK_GLASS_ACCESS
```

Permission tersebut sebaiknya menjadi **explicit permission** dan/atau membutuhkan approval.

---

# 119. Contoh Role Assignment di Rumah Sakit

## User A — Petugas Pendaftaran

```text
Role:
Registration Staff

Permission utama:
PATIENT_VIEW
PATIENT_CREATE
PATIENT_UPDATE_LIMITED
APPOINTMENT_CREATE
APPOINTMENT_UPDATE
CHECKIN_EXECUTE
PAYER_VERIFY
QUEUE_CREATE
```

## User B — Perawat Poli

```text
Role:
Nurse

Permission utama:
PATIENT_VIEW
ENCOUNTER_VIEW
VITAL_CREATE
VITAL_UPDATE
TRIAGE_CREATE
TRIAGE_FINALIZE
QUEUE_UPDATE
```

## User C — Dokter Poli

```text
Role:
Doctor

Scope:
Clinic = Poli Penyakit Dalam

Permission utama:
ENCOUNTER_VIEW
SOAP_CREATE
SOAP_UPDATE
DIAGNOSIS_CREATE
ORDER_CREATE
PRESCRIPTION_CREATE
REFERRAL_CREATE
ENCOUNTER_FINALIZE
```

## User D — Kasir

```text
Role:
Cashier

Permission utama:
BILL_VIEW
PAYMENT_CREATE
RECEIPT_PRINT
```

## User E — Kepala Poli

```text
Role:
Outpatient Supervisor

Scope:
Unit = Poli Penyakit Dalam

Permission:
QUEUE_MONITOR
PATIENT_FLOW_MONITOR
OPERATIONAL_OVERRIDE
REPORT_VIEW
```

---

# 120. Cara Menentukan Apakah Sebuah Permission Masuk Role

Gunakan pertanyaan sederhana:

```text
Apakah user ini melakukan aktivitas tersebut
sebagai bagian dari pekerjaan resminya?
            ↓
           YES
            ↓
Apakah aktivitas tersebut memerlukan
keputusan klinis / finansial / administratif khusus?
            ↓
      Pisahkan permission
            ↓
Apakah aktivitas mengubah data permanen?
            ↓
Tambahkan approval + audit trail
```

Contoh:

`View Patient` boleh cukup luas.

Tetapi:

`Change Diagnosis` harus jauh lebih terbatas.

Dan:

`Change Diagnosis After Finalization` harus menjadi permission khusus + workflow amendment.

---

# 121. Rekomendasi Struktur Role untuk MVP

Untuk versi awal SIMRS Rawat Jalan, tidak perlu langsung membuat 24 role aktif. Struktur minimal yang cukup kuat:

```text
PATIENT
REGISTRATION_STAFF
QUEUE_OFFICER
NURSE
DOCTOR
LAB_OFFICER
RADIOLOGY_OFFICER
PHARMACIST
CASHIER
INSURANCE_OFFICER
MEDICAL_RECORD_OFFICER
OUTPATIENT_SUPERVISOR
SYSTEM_ADMIN
AUDITOR
```

Role lain seperti Medical Assistant, Pharmacy Assistant, Radiologist, Rehab Officer, Finance Officer, dan IT Support dapat ditambahkan sesuai organisasi rumah sakit.

---

# 122. Model Role yang Lebih Tepat untuk SIMRS Enterprise

Untuk sistem enterprise, jangan hanya membuat:

```text
ROLE = DOCTOR
```

Gunakan kombinasi:

```text
USER
 ↓
ROLE
 ↓
PERMISSION
 ↓
SCOPE
 ↓
ORGANIZATION / UNIT / POLI
```

Contoh:

```text
Dr. A
│
├── Role: Doctor
│
├── Permission:
│   ├── SOAP_CREATE
│   ├── DIAGNOSIS_CREATE
│   ├── ORDER_CREATE
│   └── PRESCRIPTION_CREATE
│
└── Scope:
    ├── Unit: Rawat Jalan
    └── Poli: Penyakit Dalam
```

Dengan model ini, dokter A tidak otomatis bisa membuka seluruh data dokter B di poli lain.

---

# 123. Kesimpulan Role Architecture

Arsitektur akses Rawat Jalan sebaiknya mengikuti tiga dimensi:

```text
WHO?
Role / Profession

WHAT?
Permission / Action

WHERE?
Scope / Unit / Poli / Patient / Encounter
```

Sehingga rule akses bukan hanya:

```text
Doctor → boleh edit data pasien
```

tetapi lebih spesifik:

```text
Doctor
+ Poli Penyakit Dalam
+ Patient yang sedang dilayani
+ Encounter aktif
+ SOAP belum finalized
→ boleh CREATE/UPDATE SOAP
```

Sedangkan setelah finalisasi:

```text
Doctor
+ Encounter finalized
→ READ
→ Amendment workflow bila perlu
```

Ini akan membuat desain RBAC Anda jauh lebih aman, mudah diaudit, dan lebih realistis untuk SIMRS dibanding hanya membuat daftar role dan menu secara satu dimensi.
