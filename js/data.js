/**
 * SIMRS Mini - Master Data & Seed Data (In-Memory / LocalStorage)
 * Conforming to docs/data-model.md & docs/system-hierarchy.md
 * Platform: Frappe Healthcare v15 + SIMRS Mini Custom Model
 */

const SIMRS_MASTER_DATA = {
  departments: [
    { id: "POLI-INT", name: "Poli Penyakit Dalam", code: "INT", prefix: "A", room: "Ruang 101", floor: "Lantai 1" },
    { id: "POLI-ANAK", name: "Poli Anak", code: "PED", prefix: "B", room: "Ruang 102", floor: "Lantai 1" },
    { id: "POLI-GIGI", name: "Poli Gigi & Mulut", code: "DEN", prefix: "C", room: "Ruang 103", floor: "Lantai 1" },
    { id: "POLI-BEDAH", name: "Poli Bedah Umum", code: "SUR", prefix: "D", room: "Ruang 104", floor: "Lantai 1" },
    { id: "POLI-SARAF", name: "Poli Saraf", code: "NEU", prefix: "E", room: "Ruang 105", floor: "Lantai 1" },
    { id: "POLI-MATA", name: "Poli Mata", code: "OPH", prefix: "F", room: "Ruang 106", floor: "Lantai 1" }
  ],

  practitioners: [
    { id: "DOC-HENDRA", name: "dr. Hendra Pratama, Sp.PD", department: "POLI-INT", sip: "503/SIP/DINKES/2022", schedule: "Senin - Jumat (08:00 - 14:00)" },
    { id: "DOC-ANISA", name: "dr. Anisa Putri, Sp.A", department: "POLI-ANAK", sip: "503/SIP/DINKES/2021", schedule: "Senin - Kamis (09:00 - 13:00)" },
    { id: "DOC-BAMBANG", name: "dr. Bambang Irawan, Sp.B", department: "POLI-BEDAH", sip: "503/SIP/DINKES/2020", schedule: "Senin - Jumat (08:30 - 15:00)" },
    { id: "DOC-MAYA", name: "drg. Maya Safitri", department: "POLI-GIGI", sip: "503/SIP/DINKES/2023", schedule: "Senin - Sabtu (08:00 - 13:00)" },
    { id: "DOC-CYNTHIA", name: "dr. Cynthia Dewi, Sp.S", department: "POLI-SARAF", sip: "503/SIP/DINKES/2022", schedule: "Selasa & Kamis (10:00 - 15:00)" }
  ],

  icd10: [
    { code: "I10", name: "Essential (primary) hypertension", category: "Kardiovaskular" },
    { code: "E11.9", name: "Type 2 diabetes mellitus without complications", category: "Endokrin" },
    { code: "J06.9", name: "Acute upper respiratory infection, unspecified (ISPA)", category: "Respirasi" },
    { code: "K29.7", name: "Gastritis, unspecified", category: "Gastrointestinal" },
    { code: "E78.5", name: "Hyperlipidemia, unspecified", category: "Metabolik" },
    { code: "M54.5", name: "Low back pain", category: "Muskuloskeletal" },
    { code: "J45.909", name: "Unspecified asthma, uncomplicated", category: "Respirasi" },
    { code: "A09", name: "Infectious gastroenteritis and colitis, unspecified (Diare Akut)", category: "Infeksi" },
    { code: "K30", name: "Functional dyspepsia", category: "Gastrointestinal" },
    { code: "N39.0", name: "Urinary tract infection, site not specified (ISK)", category: "Urologi" },
    { code: "K02.9", name: "Dental caries, unspecified", category: "Gigi" },
    { code: "K04.0", name: "Pulpitis", category: "Gigi" },
    { code: "H10.9", name: "Conjunctivitis, unspecified", category: "Mata" },
    { code: "R50.9", name: "Fever, unspecified (Demam Akut)", category: "Gejala Umum" }
  ],

  medicines: [
    { id: "MED-001", name: "Amlodipine 5 mg", form: "Tablet", stock: 450, unitPrice: 850, category: "Antihipertensi" },
    { id: "MED-002", name: "Amlodipine 10 mg", form: "Tablet", stock: 320, unitPrice: 1200, category: "Antihipertensi" },
    { id: "MED-003", name: "Candesartan 8 mg", form: "Tablet", stock: 210, unitPrice: 2800, category: "Antihipertensi" },
    { id: "MED-004", name: "Metformin 500 mg", form: "Tablet", stock: 600, unitPrice: 700, category: "Antidiabetes" },
    { id: "MED-005", name: "Glimepiride 2 mg", form: "Tablet", stock: 180, unitPrice: 1500, category: "Antidiabetes" },
    { id: "MED-006", name: "Paracetamol 500 mg", form: "Tablet", stock: 800, unitPrice: 500, category: "Analgesik/Antipiretik" },
    { id: "MED-007", name: "Amoxicillin 500 mg", form: "Kapsul", stock: 350, unitPrice: 1100, category: "Antibiotik" },
    { id: "MED-008", name: "Cefixime 100 mg", form: "Kapsul", stock: 120, unitPrice: 4500, category: "Antibiotik" },
    { id: "MED-009", name: "Omeprazole 20 mg", form: "Kapsul", stock: 500, unitPrice: 1800, category: "Gastroprotektor" },
    { id: "MED-010", name: "Antasida DOEN", form: "Tablet Kunyah", stock: 420, unitPrice: 400, category: "Gastrointestinal" },
    { id: "MED-011", name: "Simvastatin 10 mg", form: "Tablet", stock: 290, unitPrice: 1300, category: "Antihiperlipidemia" },
    { id: "MED-012", name: "Cetirizine 10 mg", form: "Tablet", stock: 380, unitPrice: 900, category: "Antihistamin" },
    { id: "MED-013", name: "Asam Mefenamat 500 mg", form: "Kaplet", stock: 260, unitPrice: 1000, category: "Analgesik / NSAID" },
    { id: "MED-014", name: "Salbutamol Inhaler 100 mcg", form: "Inhaler", stock: 45, unitPrice: 65000, category: "Bronkodilator" }
  ],

  labTests: [
    { id: "LAB-CBC", name: "Darah Lengkap / Rutin (CBC)", price: 95000, parameters: [
      { name: "Hemoglobin", unit: "g/dL", normalMale: "13.2 - 17.3", normalFemale: "11.7 - 15.5" },
      { name: "Leukosit", unit: "/uL", normal: "4.500 - 11.000" },
      { name: "Trombosit", unit: "/uL", normal: "150.000 - 450.000" },
      { name: "Hematokrit", unit: "%", normalMale: "40 - 52", normalFemale: "35 - 47" }
    ]},
    { id: "LAB-LIPID", name: "Profil Lipid (Lemak Darah)", price: 180000, parameters: [
      { name: "Kolesterol Total", unit: "mg/dL", normal: "< 200" },
      { name: "Trigliserida", unit: "mg/dL", normal: "< 150" },
      { name: "HDL Kolesterol", unit: "mg/dL", normal: "> 40" },
      { name: "LDL Kolesterol", unit: "mg/dL", normal: "< 100" }
    ]},
    { id: "LAB-GDS", name: "Gula Darah Sewaktu (GDS)", price: 45000, parameters: [
      { name: "Glukosa Sewaktu", unit: "mg/dL", normal: "< 140 (Normal) / 140-199 (Pre-DM) / >=200 (DM)" }
    ]},
    { id: "LAB-GDP", name: "Gula Darah Puasa (GDP)", price: 50000, parameters: [
      { name: "Glukosa Puasa", unit: "mg/dL", normal: "70 - 100" }
    ]},
    { id: "LAB-URIC", name: "Asam Urat Darah", price: 50000, parameters: [
      { name: "Asam Urat", unit: "mg/dL", normalMale: "3.5 - 7.2", normalFemale: "2.6 - 6.0" }
    ]},
    { id: "LAB-RENAL", name: "Fungsi Ginjal (Ureum / Kreatinin)", price: 110000, parameters: [
      { name: "Ureum", unit: "mg/dL", normal: "15 - 45" },
      { name: "Kreatinin", unit: "mg/dL", normalMale: "0.7 - 1.3", normalFemale: "0.6 - 1.1" }
    ]}
  ],

  services: [
    { id: "SRV-REG", name: "Administrasi & Pendaftaran Pasien", price: 20000, category: "Administrasi" },
    { id: "SRV-CONS-SP", name: "Konsultasi Dokter Spesialis", price: 150000, category: "Jasa Medis" },
    { id: "SRV-CONS-GP", name: "Konsultasi Dokter Umum / Gigi", price: 80000, category: "Jasa Medis" },
    { id: "SRV-NURS", name: "Asuhan Keperawatan & Triase", price: 25000, category: "Jasa Keperawatan" },
    { id: "SRV-EKG", name: "Pemeriksaan EKG 12-Lead", price: 75000, category: "Tindakan" },
    { id: "SRV-NEBU", name: "Terapi Nebulisasi", price: 65000, category: "Tindakan" },
    { id: "SRV-WOUND", name: "Perawatan Luka Ringan / Ganti Verban", price: 55000, category: "Tindakan" },
    { id: "SRV-SCALING", name: "Pembersihan Karang Gigi (Scaling)", price: 200000, category: "Tindakan Gigi" }
  ],

  initialPatients: [
    {
      id: "PAT-001",
      mrNo: "RM-2026-0042",
      nik: "3171012304850002",
      name: "Bambang Sutrisno",
      gender: "Laki-laki",
      birthDate: "1985-04-23",
      age: 41,
      phone: "081234567890",
      address: "Jl. Margonda Raya No. 45, Depok",
      payerType: "Umum",
      payerMemberNo: "-",
      bloodType: "O+",
      allergies: "Tidak ada riwayat alergi"
    },
    {
      id: "PAT-002",
      mrNo: "RM-2026-0089",
      nik: "3172025608920001",
      name: "Siti Rahayu Ningrum",
      gender: "Perempuan",
      birthDate: "1992-08-16",
      age: 34,
      phone: "085678901234",
      address: "Komplek Pesona Cinere Blok B2/14",
      payerType: "BPJS",
      payerMemberNo: "0001892837461",
      bloodType: "B+",
      allergies: "Amoxicillin (gatal & kemerahan)"
    },
    {
      id: "PAT-003",
      mrNo: "RM-2026-0105",
      nik: "3275031102780004",
      name: "Drs. Hendro Wibowo",
      gender: "Laki-laki",
      birthDate: "1978-02-11",
      age: 48,
      phone: "087789012345",
      address: "Jl. Kejayaan No. 12, Sukmajaya",
      payerType: "BPJS",
      payerMemberNo: "0002478912340",
      bloodType: "A+",
      allergies: "Tidak ada riwayat alergi"
    },
    {
      id: "PAT-004",
      mrNo: "RM-2026-0158",
      nik: "3174044512990003",
      name: "Alifia Zahra Khairunnisa",
      gender: "Perempuan",
      birthDate: "1999-12-05",
      age: 26,
      phone: "089612345678",
      address: "Jl. Kemang Timur No. 8A, Jakarta Selatan",
      payerType: "Asuransi",
      payerMemberNo: "PRU-8891204",
      bloodType: "AB+",
      allergies: "Debu dingin, Seafood"
    },
    {
      id: "PAT-005",
      mrNo: "RM-2026-0210",
      nik: "3276012010190001",
      name: "Muhammad Rayhan (Anak)",
      gender: "Laki-laki",
      birthDate: "2019-10-20",
      age: 6,
      phone: "081399887766",
      address: "Cluster Melati Indah No. 5, Sawangan",
      payerType: "BPJS",
      payerMemberNo: "0003112233445",
      bloodType: "O+",
      allergies: "Tidak ada riwayat alergi"
    },
    {
      id: "PAT-006",
      mrNo: "RM-2026-0124",
      nik: "3201234567890002",
      name: "Budi Santoso",
      gender: "Laki-laki",
      birthDate: "1984-06-15",
      age: 42,
      phone: "0813-1122-3344",
      address: "Jl. Dahlia No. 45, Kebayoran, Jakarta Selatan",
      payerType: "Umum",
      payerMemberNo: "-",
      bloodType: "B+",
      allergies: "Tidak ada riwayat alergi"
    },
    {
      id: "PAT-007",
      mrNo: "RM-2026-0312",
      nik: "3171052203970005",
      name: "Budi Setiawan",
      gender: "Laki-laki",
      birthDate: "1997-03-22",
      age: 29,
      phone: "0812-8877-6655",
      address: "Jl. Tebet Barat Dalam No. 14, Tebet, Jakarta Selatan",
      payerType: "BPJS",
      payerMemberNo: "0001928374821",
      bloodType: "O+",
      allergies: "Alergi Debu Dingin"
    },
    {
      id: "PAT-008",
      mrNo: "RM-2026-0405",
      nik: "3276011011680007",
      name: "Budi Gunawan",
      gender: "Laki-laki",
      birthDate: "1968-11-10",
      age: 58,
      phone: "0856-4433-2211",
      address: "Jl. Margonda Raya No. 88, Depok",
      payerType: "Asuransi",
      payerMemberNo: "ALLIANZ-77821",
      bloodType: "A+",
      allergies: "Tidak ada riwayat alergi"
    },
    {
      id: "PAT-009",
      mrNo: "RM-2026-0123",
      nik: "3201234567890001",
      name: "Siti Rahmawati",
      gender: "Perempuan",
      birthDate: "1972-05-18",
      age: 54,
      phone: "0812-9876-5432",
      address: "Jl. Sukamaju No. 12, Kel. Menteng, Jakarta Pusat",
      payerType: "BPJS",
      payerMemberNo: "0001882910291",
      bloodType: "A+",
      allergies: "Tidak ada riwayat alergi"
    },
    {
      id: "PAT-010",
      mrNo: "RM-2026-0288",
      nik: "3174092509880004",
      name: "Siti Aminah",
      gender: "Perempuan",
      birthDate: "1988-09-25",
      age: 38,
      phone: "0878-1122-3344",
      address: "Jl. Ragunan No. 25, Pasar Minggu, Jakarta Selatan",
      payerType: "Umum",
      payerMemberNo: "-",
      bloodType: "B+",
      allergies: "Tidak ada riwayat alergi"
    },
    {
      id: "PAT-011",
      mrNo: "RM-2026-0312",
      nik: "3171051210870003",
      name: "Agus Prasetyo",
      gender: "Laki-laki",
      birthDate: "1987-10-12",
      age: 39,
      phone: "0812-9988-7766",
      address: "Jl. Kramat Kwitang No. 18, Jakarta Pusat",
      payerType: "Perusahaan",
      payerMemberNo: "CORP-PERT-2026-081",
      companyName: "PT Pertamina (Persero)",
      guarantorCode: "CORP-PERT-2026-081",
      bloodType: "O+",
      allergies: "Tidak ada riwayat alergi"
    }
  ],

  appointments: [
    {
      id: "APT-2026-0101",
      patientType: "Lama",
      patientName: "Bambang Sutrisno",
      mrNo: "RM-2026-0042",
      phone: "081234567890",
      departmentId: "POLI-INT",
      departmentName: "Poli Penyakit Dalam",
      practitionerId: "DOC-HENDRA",
      practitionerName: "dr. Hendra Pratama, Sp.PD",
      source: "Telepon (Loket)",
      bookingDate: "2026-10-06",
      slotTime: "08:30 - 09:00",
      status: "Checked-in",
      qrCode: "QR-APT-0101"
    },
    {
      id: "APT-2026-0102",
      patientType: "Lama",
      patientName: "Siti Rahayu Ningrum",
      mrNo: "RM-2026-0089",
      phone: "081398765432",
      departmentId: "POLI-INT",
      departmentName: "Poli Penyakit Dalam",
      practitionerId: "DOC-HENDRA",
      practitionerName: "dr. Hendra Pratama, Sp.PD",
      source: "Telepon (Loket)",
      bookingDate: "2026-10-06",
      slotTime: "09:30 - 10:00",
      status: "Booked",
      qrCode: "QR-APT-0102"
    },
    {
      id: "APT-2026-0103",
      patientType: "Baru",
      patientName: "Dedi Kurniawan",
      mrNo: "-",
      phone: "081755443322",
      departmentId: "POLI-ANAK",
      departmentName: "Poli Anak",
      practitionerId: "DOC-ANISA",
      practitionerName: "dr. Anisa Putri, Sp.A",
      source: "Telepon (Loket)",
      bookingDate: "2026-10-06",
      slotTime: "10:00 - 10:30",
      status: "Booked",
      qrCode: "QR-APT-0103"
    }
  ],

  bpjsReferrals: [
    {
      rujukanNo: "0114R0010926P000123",
      bpjsCard: "0001234567890",
      patientName: "Siti Rahayu Ningrum",
      nik: "3172025608920001",
      faskesAsal: "Puskesmas Menteng (0114B001)",
      departmentName: "Poli Penyakit Dalam",
      diagnosaRujukan: "E11.9 - Type 2 diabetes mellitus",
      tglRujukan: "2026-09-28",
      masaBerlaku: "2026-10-28",
      statusRujukan: "Aktif",
      sepNo: "SEP-2026-0091"
    },
    {
      rujukanNo: "0114R0010926P000456",
      bpjsCard: "0009876543210",
      patientName: "Ahmad Dahlan",
      nik: "3173031205780003",
      faskesAsal: "Klinik Pratama Sehat Sejahtera",
      departmentName: "Poli Jantung & Pembuluh Darah",
      diagnosaRujukan: "I10 - Essential (primary) hypertension",
      tglRujukan: "2026-10-01",
      masaBerlaku: "2026-10-31",
      statusRujukan: "Aktif",
      sepNo: null
    }
  ],

  initialVisits: [
    {
      id: "REG-WALK-B8K21",
      patientId: "PAT-001",
      patientName: "Bambang Sutrisno",
      mrNo: "RM-2026-0042",
      departmentId: "POLI-INT",
      departmentName: "Poli Penyakit Dalam",
      practitionerId: "DOC-HENDRA",
      practitionerName: "dr. Hendra Pratama, Sp.PD",
      registrationSource: "Walk-in",
      payerType: "Umum",
      payerMemberNo: "-",
      eligibilityStatus: "Valid",
      visitStatus: "IN_SERVICE",
      pharmacyStatus: "Not Required",
      billingStatus: "Pending",
      registeredAt: "2026-10-05T08:15:00",
      checkedInAt: "2026-10-05T08:15:00",
      triageStartedAt: "2026-10-05T08:22:00",
      triageCompletedAt: "2026-10-05T08:30:00",
      serviceStartedAt: "2026-10-05T08:45:00",
      ticketNo: "A-001",
      queueType: "Dokter",
      vitals: {
        systolic: 145,
        diastolic: 92,
        pulse: 84,
        temperature: 36.6,
        respiratoryRate: 18,
        spo2: 98,
        height: 170,
        weight: 78,
        bmi: 27.0,
        bmiStatus: "Overweight"
      },
      triage: {
        chiefComplaint: "Pusing berputar, tengkuk terasa berat sejak 3 hari lalu",
        fallRisk: "Rendah",
        allergies: "Tidak ada",
        painScore: 3,
        infectionScreening: "Tidak ada",
        outcome: "Normal",
        notes: "Pasien sadar penuh, keluhan tensi tinggi rutin belum minum obat seminggu ini"
      },
      encounter: {
        subjective: "Pasien mengeluh kepala pusing seperti berputar terutama saat bangun tidur. Tengkuk terasa kaku dan berat sejak 3 hari. Pasien mengaku memiliki riwayat darah tinggi 2 tahun lalu namun sempat berhenti minum obat sebulan terakhir karena merasa sehat.",
        objective: "Keadaan umum: Sedang, Compos Mentis (GCS 15).\nTD: 145/92 mmHg, HR: 84x/m reguler, RR: 18x/m, Suhu: 36.6 C, SpO2: 98% room air.\nKepala/Leher: Anemis (-), Ikterik (-), JVP normal, kaku kuduk (-).\nThorax: Cor S1-S2 normal reguler, Pulmo vesikuler (+/+), Ronkhi (-/-), Wheezing (-/-).\nAbdomen: Supel, bising usus normal, nyeri tekan (-).\nEkstremitas: Akral hangat, CRT < 2s, Edema pretibial (-/-).",
        primaryDiagnosis: { code: "I10", name: "Essential (primary) hypertension" },
        secondaryDiagnoses: [
          { code: "E78.5", name: "Hyperlipidemia, unspecified" }
        ],
        plan: "1. Edukasi modifikasi gaya hidup (diet rendah garam, olahraga ringan rutin).\n2. Terapi farmakologis kombinasi antihipertensi & statin.\n3. Cek profil lipid darah di laboratorium untuk evaluasi dislipidemia.\n4. Kontrol kembali 2 minggu lagi atau jika keluhan memberat.",
        procedures: [
          { id: "SRV-CONS-SP", name: "Konsultasi Dokter Spesialis", price: 150000 },
          { id: "SRV-EKG", name: "Pemeriksaan EKG 12-Lead", price: 75000 }
        ],
        prescriptions: [
          { medicineId: "MED-001", medicineName: "Amlodipine 5 mg", dosage: "1 x 1 tablet", timing: "Pagi hari sesudah makan", qty: 30, unitPrice: 850, totalPrice: 25500 },
          { medicineId: "MED-011", medicineName: "Simvastatin 10 mg", dosage: "1 x 1 tablet", timing: "Malam hari sebelum tidur", qty: 30, unitPrice: 1300, totalPrice: 39000 }
        ],
        labOrders: [
          { testId: "LAB-LIPID", testName: "Profil Lipid (Lemak Darah)", price: 180000, status: "Pending" }
        ],
        followUpDays: 14,
        isFinalized: false
      }
    },
    {
      id: "OPV-2026-0002",
      patientId: "PAT-002",
      patientName: "Siti Rahayu Ningrum",
      mrNo: "RM-2026-0089",
      departmentId: "POLI-INT",
      departmentName: "Poli Penyakit Dalam",
      practitionerId: "DOC-HENDRA",
      practitionerName: "dr. Hendra Pratama, Sp.PD",
      registrationSource: "Appointment",
      payerType: "BPJS",
      payerMemberNo: "0001892837461",
      eligibilityStatus: "Valid",
      visitStatus: "WAITING_DOCTOR",
      pharmacyStatus: "Not Required",
      billingStatus: "Pending",
      registeredAt: "2026-10-05T08:35:00",
      checkedInAt: "2026-10-05T08:35:00",
      triageStartedAt: "2026-10-05T08:42:00",
      triageCompletedAt: "2026-10-05T08:50:00",
      ticketNo: "A-002",
      queueType: "Dokter",
      vitals: {
        systolic: 118,
        diastolic: 76,
        pulse: 78,
        temperature: 37.1,
        respiratoryRate: 19,
        spo2: 99,
        height: 158,
        weight: 54,
        bmi: 21.6,
        bmiStatus: "Normal"
      },
      triage: {
        chiefComplaint: "Perut kembung, nyeri ulu hati tembus ke punggung sudah 4 hari",
        fallRisk: "Rendah",
        allergies: "Amoxicillin (alergi kulit)",
        painScore: 4,
        infectionScreening: "Tidak ada",
        outcome: "Normal",
        notes: "Mual (+), muntah (-). Riwayat konsumsi kopi dan telat makan sering."
      }
    },
    {
      id: "REG-WALK-D9M47",
      patientId: "PAT-003",
      patientName: "Drs. Hendro Wibowo",
      mrNo: "RM-2026-0105",
      departmentId: "POLI-INT",
      departmentName: "Poli Penyakit Dalam",
      practitionerId: "DOC-HENDRA",
      practitionerName: "dr. Hendra Pratama, Sp.PD",
      registrationSource: "Walk-in",
      payerType: "BPJS",
      payerMemberNo: "0002478912340",
      eligibilityStatus: "Valid",
      visitStatus: "WAITING_TRIAGE",
      pharmacyStatus: "Not Required",
      billingStatus: "Pending",
      registeredAt: "2026-10-05T09:05:00",
      checkedInAt: "2026-10-05T09:05:00",
      ticketNo: "T-003",
      queueType: "Triase"
    },
    {
      id: "OPV-2026-0004",
      patientId: "PAT-004",
      patientName: "Alifia Zahra Khairunnisa",
      mrNo: "RM-2026-0158",
      departmentId: "POLI-GIGI",
      departmentName: "Poli Gigi & Mulut",
      practitionerId: "DOC-MAYA",
      practitionerName: "drg. Maya Safitri",
      registrationSource: "Appointment",
      payerType: "Asuransi",
      payerMemberNo: "PRU-8891204",
      eligibilityStatus: "Valid",
      visitStatus: "SERVICE_COMPLETED",
      pharmacyStatus: "Preparing",
      billingStatus: "Pending",
      registeredAt: "2026-10-05T08:00:00",
      checkedInAt: "2026-10-05T08:00:00",
      triageCompletedAt: "2026-10-05T08:18:00",
      serviceStartedAt: "2026-10-05T08:25:00",
      serviceCompletedAt: "2026-10-05T08:55:00",
      ticketNo: "F-001",
      queueType: "Farmasi",
      vitals: {
        systolic: 110,
        diastolic: 70,
        pulse: 74,
        temperature: 36.5,
        respiratoryRate: 16,
        spo2: 100,
        height: 164,
        weight: 52,
        bmi: 19.3,
        bmiStatus: "Normal"
      },
      triage: {
        chiefComplaint: "Gigi geraham bawah kanan berdenyut dan ngilu saat minum dingin",
        fallRisk: "Rendah",
        allergies: "Debu dingin",
        painScore: 5,
        infectionScreening: "Tidak ada",
        outcome: "Normal"
      },
      encounter: {
        subjective: "Pasien mengeluh gigi geraham bawah kanan berlubang dan berdenyut sejak kemarin malam.",
        objective: "Gigi 46 karies profunda perforasi pulpa, perkusi (+), palpasi (-).",
        primaryDiagnosis: { code: "K04.0", name: "Pulpitis" },
        secondaryDiagnoses: [],
        plan: "Tumpatan sementara dan medikasi antibiotik & analgetik, rencana root canal treatment pertemuan berikutnya.",
        procedures: [
          { id: "SRV-CONS-GP", name: "Konsultasi Dokter Umum / Gigi", price: 80000 },
          { id: "SRV-SCALING", name: "Pembersihan Karang Gigi (Scaling)", price: 200000 }
        ],
        prescriptions: [
          { medicineId: "MED-007", medicineName: "Amoxicillin 500 mg", dosage: "3 x 1 kapsul", timing: "Sesudah makan (Habiskan)", qty: 15, unitPrice: 1100, totalPrice: 16500 },
          { medicineId: "MED-013", medicineName: "Asam Mefenamat 500 mg", dosage: "3 x 1 kaplet", timing: "Sesudah makan (Bila nyeri)", qty: 10, unitPrice: 1000, totalPrice: 10000 }
        ],
        labOrders: [],
        isFinalized: true
      }
    },
    {
      id: "REG-WALK-F2N83",
      patientId: "PAT-005",
      patientName: "Muhammad Rayhan (Anak)",
      mrNo: "RM-2026-0210",
      departmentId: "POLI-ANAK",
      departmentName: "Poli Anak",
      practitionerId: "DOC-ANISA",
      practitionerName: "dr. Anisa Putri, Sp.A",
      registrationSource: "Walk-in",
      payerType: "BPJS",
      payerMemberNo: "0003112233445",
      eligibilityStatus: "Valid",
      visitStatus: "WAITING_TRIAGE",
      pharmacyStatus: "Not Required",
      billingStatus: "Pending",
      registeredAt: "2026-10-05T09:12:00",
      checkedInAt: "2026-10-05T09:12:00",
      ticketNo: "T-004",
      queueType: "Triase"
    },
    {
      id: "OPV-2026-0006",
      patientId: "PAT-001",
      patientName: "Aditya Pratama (Balita)",
      mrNo: "RM-2026-0215",
      departmentId: "POLI-ANAK",
      departmentName: "Poli Anak",
      practitionerId: "DOC-ANISA",
      practitionerName: "dr. Anisa Putri, Sp.A",
      registrationSource: "Appointment",
      payerType: "Umum",
      payerMemberNo: "-",
      eligibilityStatus: "Valid",
      visitStatus: "WAITING_DOCTOR",
      pharmacyStatus: "Not Required",
      billingStatus: "Pending",
      registeredAt: "2026-10-05T08:50:00",
      checkedInAt: "2026-10-05T08:50:00",
      triageCompletedAt: "2026-10-05T09:05:00",
      ticketNo: "B-001",
      queueType: "Dokter",
      vitals: {
        systolic: 95,
        diastolic: 60,
        pulse: 105,
        temperature: 38.4,
        respiratoryRate: 24,
        spo2: 99,
        height: 102,
        weight: 16,
        bmi: 15.4,
        bmiStatus: "Normal"
      },
      triage: {
        chiefComplaint: "Demam naik turun 3 hari disertai batuk pilek dan nafsu makan menurun",
        fallRisk: "Rendah",
        allergies: "Tidak ada riwayat alergi",
        painScore: 2,
        infectionScreening: "Demam & ISPA",
        outcome: "Normal"
      }
    },
    {
      id: "REG-WALK-H5P19",
      patientId: "PAT-003",
      patientName: "Agus Setiawan",
      mrNo: "RM-2026-0220",
      departmentId: "POLI-BEDAH",
      departmentName: "Poli Bedah Umum",
      practitionerId: "DOC-BAMBANG",
      practitionerName: "dr. Bambang Irawan, Sp.B",
      registrationSource: "Walk-in",
      payerType: "BPJS",
      payerMemberNo: "0002981726354",
      eligibilityStatus: "Valid",
      visitStatus: "WAITING_TRIAGE",
      pharmacyStatus: "Not Required",
      billingStatus: "Pending",
      registeredAt: "2026-10-05T09:20:00",
      checkedInAt: "2026-10-05T09:20:00",
      ticketNo: "T-005",
      queueType: "Triase"
    },
    {
      id: "OPV-2026-0008",
      patientId: "PAT-004",
      patientName: "Ratna Sari Dewi",
      mrNo: "RM-2026-0225",
      departmentId: "POLI-SARAF",
      departmentName: "Poli Saraf",
      practitionerId: "DOC-CYNTHIA",
      practitionerName: "dr. Cynthia Dewi, Sp.S",
      registrationSource: "Appointment",
      payerType: "Asuransi",
      payerMemberNo: "ASU-119920",
      eligibilityStatus: "Valid",
      visitStatus: "WAITING_DOCTOR",
      pharmacyStatus: "Not Required",
      billingStatus: "Pending",
      registeredAt: "2026-10-05T08:40:00",
      checkedInAt: "2026-10-05T08:40:00",
      triageCompletedAt: "2026-10-05T09:00:00",
      ticketNo: "E-001",
      queueType: "Dokter",
      vitals: {
        systolic: 130,
        diastolic: 85,
        pulse: 80,
        temperature: 36.7,
        respiratoryRate: 18,
        spo2: 98,
        height: 160,
        weight: 60,
        bmi: 23.4,
        bmiStatus: "Normal"
      },
      triage: {
        chiefComplaint: "Kesemutan dan kebas pada kedua telapak tangan dan kaki sejak 2 minggu",
        fallRisk: "Rendah",
        allergies: "Tidak ada",
        painScore: 3,
        infectionScreening: "Tidak ada",
        outcome: "Normal"
      }
    },
    {
      id: "REG-WALK-K3T64",
      patientId: "PAT-002",
      patientName: "Hj. Maryam",
      mrNo: "RM-2026-0230",
      departmentId: "POLI-INT",
      departmentName: "Poli Penyakit Dalam",
      practitionerId: "DOC-HENDRA",
      practitionerName: "dr. Hendra Pratama, Sp.PD",
      registrationSource: "Walk-in",
      payerType: "BPJS",
      payerMemberNo: "0001928374650",
      eligibilityStatus: "Valid",
      visitStatus: "WAITING_TRIAGE",
      pharmacyStatus: "Not Required",
      billingStatus: "Pending",
      registeredAt: "2026-10-05T09:30:00",
      checkedInAt: "2026-10-05T09:30:00",
      ticketNo: "T-006",
      queueType: "Triase"
    }
  ]
};

// Seed or retrieve from LocalStorage
function initDatabase() {
  if (!localStorage.getItem("SIMRS_DB_VERSION") || localStorage.getItem("SIMRS_DB_VERSION") !== "3.4") {
    localStorage.setItem("SIMRS_PATIENTS", JSON.stringify(SIMRS_MASTER_DATA.initialPatients));
    localStorage.setItem("SIMRS_VISITS", JSON.stringify(SIMRS_MASTER_DATA.initialVisits));
    localStorage.setItem("SIMRS_APPOINTMENTS", JSON.stringify(SIMRS_MASTER_DATA.appointments));
    localStorage.setItem("SIMRS_BPJS_REFERRALS", JSON.stringify(SIMRS_MASTER_DATA.bpjsReferrals));
    localStorage.setItem("SIMRS_TICKETS_SEQ", JSON.stringify({ A: 3, B: 2, C: 1, D: 1, E: 2, F: 2, K: 1, T: 7 }));
    localStorage.setItem("SIMRS_AUDIT_LOGS", JSON.stringify([
      { timestamp: "2026-10-05 08:15:22", user: "Budi Santoso", role: "Petugas Pendaftaran RJ", action: "Registrasi Pasien Walk-in: Bambang Sutrisno (ID: REG-WALK-B8K21)" },
      { timestamp: "2026-10-05 08:30:10", user: "Ns. Siti Rahma", role: "Perawat", action: "Selesai Triase & Input TTV: Bambang Sutrisno -> Routing ke dr. Hendra" },
      { timestamp: "2026-10-05 08:45:04", user: "dr. Hendra Pratama", role: "Dokter", action: "Mulai Pelayanan Medis / Buka Rekam Medis Pasien: Bambang Sutrisno" }
    ]));
    localStorage.setItem("SIMRS_DB_VERSION", "3.4");
  }
}

initDatabase();

