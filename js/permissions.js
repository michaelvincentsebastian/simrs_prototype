/**
 * SIMRS Mini - Role & Permission Engine & Authentication Service
 * Strictly adhering to docs/user-role.md §0.2, §0.3, §3, §6 & PRD ADR A-00
 * "ONE system, many roles - menu hiding is not security, permissions enforced server-side"
 */

// 1. User Database with Unique Passwords & Assigned Roles
const SIMRS_USERS = {
  "dokter.hendra": {
    username: "dokter.hendra",
    password: "dokter123",
    name: "dr. Hendra Pratama, Sp.PD",
    roleKey: "PHYSICIAN",
    department: "Poli Penyakit Dalam",
    title: "Dokter Spesialis Penyakit Dalam",
    initials: "HP",
    avatarBg: "bg-indigo-600",
    idNumber: "SIP.503/102/DS/2022"
  },
  "perawat.siti": {
    username: "perawat.siti",
    password: "perawat123",
    name: "Ns. Siti Rahma, S.Kep",
    roleKey: "NURSING_USER",
    department: "Triase Rawat Jalan",
    title: "Perawat Triase & Pengukuran TTV",
    initials: "SR",
    avatarBg: "bg-emerald-600",
    idNumber: "STR.31.02.5.2.19.123456"
  },
  "staf.budi": {
    username: "staf.budi",
    password: "registrasi123",
    name: "Budi Santoso",
    roleKey: "REGISTRATION_STAFF",
    department: "Loket Admisi 01",
    title: "Staf Admisi & Pendaftaran Walk-in",
    initials: "BS",
    avatarBg: "bg-blue-600",
    idNumber: "NIP.198804122019031002"
  },
  "antrian.rian": {
    username: "antrian.rian",
    password: "antrian123",
    name: "Rian Pratama",
    roleKey: "QUEUE_OFFICER",
    department: "Front Desk & Antrian",
    title: "Petugas Antrian Loket",
    initials: "RP",
    avatarBg: "bg-cyan-600",
    idNumber: "NIP.199408252020121004"
  },
  "apoteker.dewi": {
    username: "apoteker.dewi",
    password: "farmasi123",
    name: "apt. Dewi Lestari, S.Farm",
    roleKey: "PHARMACIST",
    department: "Instalasi Farmasi Rawat Jalan",
    title: "Apoteker Rawat Jalan",
    initials: "DL",
    avatarBg: "bg-teal-600",
    idNumber: "SIPA.446/089/APT/2021"
  },
  "kasir.linda": {
    username: "kasir.linda",
    password: "kasir123",
    name: "Linda Wijaya, S.E.",
    roleKey: "CASHIER",
    department: "Loket Kasir & Pembayaran",
    title: "Kasir Rawat Jalan & Billing",
    initials: "LW",
    avatarBg: "bg-emerald-700",
    idNumber: "NIP.199105172018022003"
  },
  "lab.fauzi": {
    username: "lab.fauzi",
    password: "lab123",
    name: "Ahmad Fauzi, A.Md.AK",
    roleKey: "LABORATORY_USER",
    department: "Laboratorium Patologi Klinik",
    title: "Analis Laboratorium",
    initials: "AF",
    avatarBg: "bg-amber-600",
    idNumber: "STR.LAB.2020.9981"
  },
  "spv.rina": {
    username: "spv.rina",
    password: "spv123",
    name: "dr. Rina Marlina, MMRS",
    roleKey: "SUPERVISOR",
    department: "Manajemen Pelayanan Medis",
    title: "Supervisor Pelayanan Rawat Jalan",
    initials: "RM",
    avatarBg: "bg-purple-600",
    idNumber: "NIP.197806142005012001"
  },
  "auditor.taufik": {
    username: "auditor.taufik",
    password: "audit123",
    name: "dr. Taufik Hidayat, Sp.PK",
    roleKey: "AUDITOR",
    department: "Komite Mutu & Akreditasi",
    title: "Auditor Mutu & Rekam Medis",
    initials: "TH",
    avatarBg: "bg-slate-700",
    idNumber: "NIP.198203092008121001"
  },
  "display.tv": {
    username: "display.tv",
    password: "display123",
    name: "Display Antrian TV",
    roleKey: "QUEUE_DISPLAY",
    department: "Ruang Tunggu Pasien",
    title: "Layar TV Publik (Zero PHI)",
    initials: "TV",
    avatarBg: "bg-rose-600",
    idNumber: "DEVICE-TV-01"
  },
  "kiosk.apm": {
    username: "kiosk.apm",
    password: "kiosk123",
    name: "Kiosk Mandiri (APM)",
    roleKey: "KIOSK_DEVICE",
    department: "Lobi RS Utama",
    title: "Anjungan Pasien Mandiri",
    initials: "KM",
    avatarBg: "bg-orange-600",
    idNumber: "DEVICE-KIOSK-01"
  }
};

// 2. Role Specifications & Contextual Top Service Menus
const ROLES = {
  REGISTRATION_STAFF: {
    id: "Registration Staff",
    name: "Budi Santoso",
    title: "Staf Admisi & Pendaftaran",
    badge: "bg-blue-100 text-blue-800 border border-blue-200",
    landingWorkspace: "registrasi",
    allowedWorkspaces: ["registrasi"],
    searchPlaceholder: "Cari NIK / No. RM / Nama Pasien...",
    searchScope: "patients",
    serviceTabs: [
      { id: "tab-reg-walkin", label: "1.2 Walk-in Reg", icon: "how_to_reg", target: "registrasi" },
      { id: "tab-reg-new", label: "1.2 Pasien Baru", icon: "person_add", action: "openNewPatientModal" },
      { id: "tab-reg-checkin", label: "1.4 Check-in Booking", icon: "event_available", target: "registrasi" },
      { id: "tab-reg-queue", label: "1.7 Antrian Loket", icon: "confirmation_number", target: "registrasi" }
    ],
    permissions: {
      "Patient": ["read", "write", "create"],
      "Patient Appointment": ["read", "write", "create"],
      "Outpatient Visit": ["read", "create"],
      "Queue Ticket": ["read", "write", "create"],
      "Vital Signs": [], // DILARANG
      "Patient Encounter": [], // DILARANG
      "Medication Request": [], // DILARANG
      "Sales Invoice": [] // DILARANG
    },
    allowedMenus: [
      "1.1 Appointment", "1.2 Walk-in Registration", "1.4 Check-in & Konfirmasi", 
      "1.5 Verifikasi Pasien", "1.6 Verifikasi Penjamin", "1.7 Antrian Rawat Jalan"
    ],
    deniedNotes: "Dilarang membuka TTV, Rekam Medis (Encounter), E-Resep, atau Billing Kasir."
  },

  QUEUE_OFFICER: {
    id: "Queue Officer",
    name: "Rian Pratama",
    title: "Petugas Antrian & Front Desk",
    badge: "bg-cyan-100 text-cyan-800 border border-cyan-200",
    landingWorkspace: "registrasi",
    allowedWorkspaces: ["registrasi"],
    searchPlaceholder: "Cari No. Tiket Antrian Loket...",
    searchScope: "queue",
    serviceTabs: [
      { id: "tab-qo-panggil", label: "Panggil Antrian", icon: "campaign", action: "callTicketDemo" },
      { id: "tab-qo-recall", label: "Panggil Ulang", icon: "replay", action: "recallTicketDemo" },
      { id: "tab-qo-skip", label: "Lewati / Skip", icon: "skip_next", action: "skipTicketDemo" }
    ],
    permissions: {
      "Queue Ticket": ["read", "write"],
      "Outpatient Visit": ["read"],
      "Patient": ["read"]
    },
    allowedMenus: ["1.7 Antrian Rawat Jalan", "Panggil Tiket", "Recall Tiket", "Skip Tiket"],
    deniedNotes: "Hanya mengelola panggil/recall/skip antrian. Tidak bisa mengubah data rekam medis atau kasir."
  },

  NURSING_USER: {
    id: "Nursing User",
    name: "Ns. Siti Rahma, S.Kep",
    title: "Perawat Rawat Jalan (Triase / TTV)",
    badge: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    landingWorkspace: "triase",
    allowedWorkspaces: ["triase"],
    searchPlaceholder: "Cari Antrian Pasien Triase / No. Tiket...",
    searchScope: "triase",
    serviceTabs: [
      { id: "tab-tri-queue", label: "2.1 Antrian Triase", icon: "checklist", target: "triase" },
      { id: "tab-tri-ttv", label: "2.3 Input Tanda Vital", icon: "vital_signs", target: "triase" },
      { id: "tab-tri-screen", label: "2.4 Skrining Awal & Nyeri", icon: "health_and_safety", target: "triase" },
      { id: "tab-tri-route", label: "2.5 Routing ke Poli", icon: "forward", target: "triase" }
    ],
    permissions: {
      "Vital Signs": ["read", "write", "create"],
      "Triage Assessment": ["read", "write", "create"],
      "Outpatient Visit": ["read"],
      "Queue Ticket": ["read", "write"],
      "Patient": ["read"],
      "Patient Encounter": [], // DILARANG WRITE SOAP DOKTER
      "Medication Request": [], // DILARANG
      "Sales Invoice": [] // DILARANG
    },
    allowedMenus: [
      "2.1 Antrian Triase", "2.2 Identifikasi Pasien", "2.3 Input Tanda Vital (TTV)",
      "2.4 Skrining Awal", "2.5 Routing ke Poli Dokter"
    ],
    deniedNotes: "Hanya berhak mencatat TTV, Asesmen Triase, dan routing ke poli. Dilarang mengakses SOAP dokter, resep, atau billing."
  },

  PHYSICIAN: {
    id: "Physician",
    name: "dr. Hendra Pratama, Sp.PD",
    title: "Dokter Spesialis Penyakit Dalam",
    badge: "bg-indigo-100 text-indigo-800 border border-indigo-200",
    landingWorkspace: "dokter",
    allowedWorkspaces: ["dokter"],
    searchPlaceholder: "Cari Pasien Antrian Poli / No. RM...",
    searchScope: "doctor",
    serviceTabs: [
      { id: "tab-doc-queue", label: "3.1 My Queue", icon: "queue", target: "dokter" },
      { id: "tab-doc-soap", label: "3.4 SOAP Anamnesis", icon: "history_edu", target: "dokter" },
      { id: "tab-doc-diag", label: "3.7 Diagnosa ICD-10", icon: "assignment", target: "dokter" },
      { id: "tab-doc-lab", label: "3.8 Order Penunjang", icon: "biotech", action: "openDocLabOrder" },
      { id: "tab-doc-rx", label: "3.9 E-Resep Obat", icon: "prescriptions", target: "dokter" },
      { id: "tab-doc-fin", label: "3.12 Finalisasi", icon: "task_alt", action: "focusFinalizeSection" }
    ],
    permissions: {
      "Patient Encounter": ["read", "write", "create", "submit"],
      "Medication Request": ["read", "write", "create"],
      "Lab Test": ["read", "create"],
      "Clinical Procedure": ["read", "write", "create"],
      "Vital Signs": ["read"],
      "Triage Assessment": ["read"],
      "Outpatient Visit": ["read", "write"],
      "Patient": ["read"],
      "Sales Invoice": [], // DILARANG
      "Pharmacy Dispense": [] // DILARANG
    },
    allowedMenus: [
      "3.1 My Queue Dokter", "3.2 Pemanggilan Pasien", "3.3 Patient Chart / Ringkasan",
      "3.4 Anamnesis (S)", "3.5 Pemeriksaan Fisik (O)", "3.6 Assessment (A)", "3.7 Diagnosa ICD-10",
      "3.8 Order Lab & Prosedur", "3.9 E-Resep Obat", "3.10 Plan & Edukasi", "3.11 Resume Medis", "3.12 Finalisasi Encounter"
    ],
    deniedNotes: "Berhak mengelola rekam medis SOAP, order lab, dan e-resep. Dilarang mengakses kasir pembayaran atau dispensing obat."
  },

  LABORATORY_USER: {
    id: "Laboratory User",
    name: "Ahmad Fauzi, A.Md.AK",
    title: "Analis Laboratorium",
    badge: "bg-amber-100 text-amber-800 border border-amber-200",
    landingWorkspace: "lab",
    allowedWorkspaces: ["lab"],
    searchPlaceholder: "Cari No. Order Lab / No. Sampel...",
    searchScope: "lab",
    serviceTabs: [
      { id: "tab-lab-order", label: "4.1 Order Laboratorium", icon: "science", target: "lab" },
      { id: "tab-lab-sample", label: "4.2 Pengambilan Sampel", icon: "colorize", target: "lab" },
      { id: "tab-lab-result", label: "4.5 Input & Validasi Hasil", icon: "check_circle", target: "lab" }
    ],
    permissions: {
      "Lab Test": ["read", "write", "submit"],
      "Sample Collection": ["read", "write", "create"],
      "Patient": ["read"],
      "Outpatient Visit": ["read"],
      "Patient Encounter": [], // DILARANG
      "Sales Invoice": [] // DILARANG
    },
    allowedMenus: [
      "4.1 Order Laboratorium", "4.2 Pengambilan Sampel", "4.4 Monitoring Status Order", "4.5 Input & Validasi Hasil Lab"
    ],
    deniedNotes: "Hanya berwenang memproses spesimen dan memvalidasi hasil uji laboratorium. Dilarang mengedit rekam medis dokter."
  },

  PHARMACIST: {
    id: "Pharmacist",
    name: "apt. Dewi Lestari, S.Farm",
    title: "Apoteker Rawat Jalan",
    badge: "bg-teal-100 text-teal-800 border border-teal-200",
    landingWorkspace: "farmasi",
    allowedWorkspaces: ["farmasi"],
    searchPlaceholder: "Cari No. Resep / No. Tiket Farmasi (F-...)...",
    searchScope: "pharmacy",
    serviceTabs: [
      { id: "tab-ph-inbox", label: "5.1 Resep Masuk", icon: "inbox", target: "farmasi" },
      { id: "tab-ph-review", label: "5.2 Telaah 7 Benar", icon: "verified", target: "farmasi" },
      { id: "tab-ph-dispense", label: "5.3 Dispensing Obat", icon: "medication", target: "farmasi" },
      { id: "tab-ph-handover", label: "5.4 Penyerahan & KIE", icon: "front_hand", target: "farmasi" }
    ],
    permissions: {
      "Pharmacy Dispense": ["read", "write", "create", "submit"],
      "Medication Request": ["read"],
      "Item": ["read"],
      "Outpatient Visit": ["read"],
      "Patient Encounter": [], // DILARANG
      "Sales Invoice": [] // DILARANG
    },
    allowedMenus: [
      "5.1 Daftar Resep Masuk", "5.2 Telaah 7 Benar Resep", "5.3 Dispensing Obat",
      "5.4 Penyerahan Obat & KIE", "5.5 Status Resep"
    ],
    deniedNotes: "Berhak menelaah dan menyerahkan obat. Tidak boleh mengubah resep dokter secara sepihak & dilarang membuka tagihan."
  },

  CASHIER: {
    id: "Cashier",
    name: "Linda Wijaya, S.E.",
    title: "Kasir Rawat Jalan & Billing",
    badge: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    landingWorkspace: "kasir",
    allowedWorkspaces: ["kasir"],
    searchPlaceholder: "Cari No. Tagihan / No. Tiket Kasir (K-...)...",
    searchScope: "cashier",
    serviceTabs: [
      { id: "tab-cs-queue", label: "6.1 Billing Pasien", icon: "receipt_long", target: "kasir" },
      { id: "tab-cs-items", label: "6.2 Rincian Jasa & Obat", icon: "calculate", target: "kasir" },
      { id: "tab-cs-pay", label: "6.5 Pembayaran & Kwitansi", icon: "payments", target: "kasir" }
    ],
    permissions: {
      "Sales Invoice": ["read", "write", "create", "submit"],
      "Payment Entry": ["read", "write", "create", "submit"],
      "Outpatient Visit": ["read"],
      "Patient": ["read"],
      "Patient Encounter": [], // DILARANG BUKA REKAM MEDIS
      "Vital Signs": [] // DILARANG
    },
    allowedMenus: [
      "6.1 Billing Pasien", "6.2 Rincian Jasa & Obat", "6.3 Tarif",
      "6.4 Verifikasi Penjamin", "6.5 Pembayaran & Kwitansi"
    ],
    deniedNotes: "Berhak mengagregasi tagihan dan memproses pembayaran. Dilarang keras membaca catatan rekam medis (SOAP) dokter."
  },

  SUPERVISOR: {
    id: "Outpatient Supervisor",
    name: "dr. Rina Marlina, MMRS",
    title: "Supervisor Pelayanan Rawat Jalan",
    badge: "bg-purple-100 text-purple-800 border border-purple-200",
    landingWorkspace: "monitoring",
    allowedWorkspaces: ["monitoring", "registrasi", "triase", "dokter", "lab", "farmasi", "kasir"],
    searchPlaceholder: "Cari Pasien / Dokter / Status SLA...",
    searchScope: "monitoring",
    serviceTabs: [
      { id: "tab-spv-sla", label: "7.1 Dashboard SLA", icon: "speed", target: "monitoring" },
      { id: "tab-spv-visits", label: "7.2 Monitoring Kunjungan", icon: "groups", target: "monitoring" },
      { id: "tab-spv-report", label: "7.5 Laporan Kinerja", icon: "analytics", target: "monitoring" }
    ],
    permissions: {
      "Outpatient Visit": ["read", "write"], // can override
      "Patient": ["read"],
      "Queue Ticket": ["read"],
      "Sales Invoice": ["read"]
    },
    allowedMenus: [
      "7.1 Waktu Tunggu (SLA)", "7.2 Kunjungan Harian", "7.3 Monitoring Pasien Aktif",
      "7.4 Override / Batal Kunjungan", "7.5 Laporan Kinerja Rawat Jalan"
    ],
    deniedNotes: "Memantau SLA operasional dan memiliki hak override kunjungan dengan alasan audit."
  },

  AUDITOR: {
    id: "Clinical Auditor",
    name: "dr. Taufik Hidayat, Sp.PK",
    title: "Auditor Mutu & Rekam Medis",
    badge: "bg-slate-100 text-slate-800 border border-slate-300",
    landingWorkspace: "audit",
    allowedWorkspaces: ["audit"],
    searchPlaceholder: "Cari No. Kunjungan / Audit Log...",
    searchScope: "audit",
    serviceTabs: [
      { id: "tab-aud-trail", label: "Audit Trail Kunjungan", icon: "history", target: "audit" },
      { id: "tab-aud-chart", label: "Evaluasi Resume Medis", icon: "assignment_turned_in", target: "audit" },
      { id: "tab-aud-access", label: "Log Akses Rekam Medis", icon: "security", target: "audit" }
    ],
    permissions: {
      "Outpatient Visit": ["read"],
      "Patient Encounter": ["read"],
      "Vital Signs": ["read"],
      "Activity Log": ["read"],
      "Version": ["read"]
    },
    allowedMenus: [
      "Audit Trail Kunjungan", "Evaluasi Kelengkapan Resume Medis", "Log Akses Rekam Medis"
    ],
    deniedNotes: "Akses strictly READ-ONLY untuk keperluan akreditasi, audit medis, dan kepatuhan hukum."
  },

  QUEUE_DISPLAY: {
    id: "Queue Display",
    name: "Layar Antrian Publik (TV)",
    title: "Display Ruang Tunggu Pasien",
    badge: "bg-rose-100 text-rose-800 border border-rose-200",
    landingWorkspace: "display",
    allowedWorkspaces: ["display"],
    searchPlaceholder: "",
    searchScope: "none",
    serviceTabs: [
      { id: "tab-disp-tv", label: "Layar TV Poli, Farmasi, Kasir", icon: "tv", target: "display" }
    ],
    permissions: {
      "Queue Ticket": ["read"]
    },
    allowedMenus: ["Layar TV Antrian Poli, Farmasi & Kasir"],
    deniedNotes: "Akun perangkat publik. PRIVASI KETAT: TIDAK MENAMPILKAN Nama Pasien, NIK, Diagnosa, atau Rincian Medis (Zero PHI)."
  },

  KIOSK_DEVICE: {
    id: "Kiosk Device",
    name: "Anjungan Pasien Mandiri (APM)",
    title: "Touchscreen Kiosk Mandiri",
    badge: "bg-orange-100 text-orange-800 border border-orange-200",
    landingWorkspace: "kiosk",
    allowedWorkspaces: ["kiosk"],
    searchPlaceholder: "",
    searchScope: "none",
    serviceTabs: [
      { id: "tab-kiosk-checkin", label: "Check-in Booking Pasien", icon: "touch_app", target: "kiosk" }
    ],
    permissions: {
      "Patient Appointment": ["read", "write"],
      "Patient": ["read", "create"],
      "Queue Ticket": ["create"]
    },
    allowedMenus: ["Check-in Mandiri", "Cetak Tiket Mandiri"],
    deniedNotes: "Akun perangkat kiosk pasien. Hanya melayani check-in kode booking & penerbitan tiket antrian."
  }
};

// 3. Permission Manager Class (Enforces ADR A-00)
class PermissionManager {
  constructor() {
    this.currentRoleKey = "NURSING_USER"; // default fallback
  }

  getCurrentRole() {
    return ROLES[this.currentRoleKey] || ROLES["NURSING_USER"];
  }

  setRole(roleKey) {
    if (!ROLES[roleKey]) {
      console.error("Unknown role:", roleKey);
      return false;
    }
    this.currentRoleKey = roleKey;
    localStorage.setItem("SIMRS_ACTIVE_ROLE", roleKey);
    return true;
  }

  canAccessWorkspace(workspaceId) {
    const role = this.getCurrentRole();
    if (!role) return false;
    return role.allowedWorkspaces.includes(workspaceId);
  }

  canPerform(doctype, action = "read") {
    const role = this.getCurrentRole();
    if (!role || !role.permissions) return false;
    const allowedActions = role.permissions[doctype] || [];
    return allowedActions.includes(action);
  }

  assertPermission(doctype, action = "read") {
    if (!this.canPerform(doctype, action)) {
      const role = this.getCurrentRole();
      const error = new Error(`403 Forbidden: User '${role.name}' dengan Role [${role.id}] TIDAK memiliki hak akses '${action}' pada DocType '${doctype}'.`);
      error.status = 403;
      error.doctype = doctype;
      error.action = action;
      error.role = role.id;
      throw error;
    }
    return true;
  }
}

// 4. Authentication Service
const authService = {
  login(username, password) {
    const user = SIMRS_USERS[username];
    if (!user) {
      return { success: false, message: "Username petugas tidak terdaftar." };
    }
    if (user.password !== password) {
      return { success: false, message: "Kata sandi salah. Silakan coba kembali." };
    }

    localStorage.setItem("SIMRS_AUTH_USER", username);
    permissionEngine.setRole(user.roleKey);
    return { success: true, user: user };
  },

  logout() {
    localStorage.removeItem("SIMRS_AUTH_USER");
  },

  getCurrentUser() {
    const username = localStorage.getItem("SIMRS_AUTH_USER");
    if (username && SIMRS_USERS[username]) {
      return SIMRS_USERS[username];
    }
    return null;
  },

  getAllUsers() {
    return Object.values(SIMRS_USERS);
  },

  getUserByUsername(username) {
    return SIMRS_USERS[username] || null;
  }
};

const permissionEngine = new PermissionManager();

// Synchronize initial state
const currentUser = authService.getCurrentUser();
if (currentUser && ROLES[currentUser.roleKey]) {
  permissionEngine.currentRoleKey = currentUser.roleKey;
} else {
  const savedRole = localStorage.getItem("SIMRS_ACTIVE_ROLE");
  if (savedRole && ROLES[savedRole]) {
    permissionEngine.currentRoleKey = savedRole;
  }
}

if (typeof window !== "undefined") {
  window.SIMRS_USERS = SIMRS_USERS;
  window.ROLES = ROLES;
  window.authService = authService;
  window.permissionEngine = permissionEngine;
}
if (typeof globalThis !== "undefined") {
  globalThis.SIMRS_USERS = SIMRS_USERS;
  globalThis.ROLES = ROLES;
  globalThis.authService = authService;
  globalThis.permissionEngine = permissionEngine;
}
