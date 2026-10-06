/**
 * SIMRS Mini - Role & Permission Engine & Authentication Service
 * Strictly adhering to stakeholder hierarchy: SIMRS-0.1.hirarki
 * Modul: 1. Modul Rawat Jalan (5 Submodul Eksklusif):
 * 1. Registrasi Pasien (Petugas Pendaftaran RJ)
 * 2. TTV (Perawat)
 * 3. Dokter Rawat Jalan (Dokter)
 * 4. Kasir Rawat Jalan (Kasir RJ)
 * 5. Display Antrian Dokter (Display Antrian)
 */

// 1. User Database with Unique Passwords & Assigned Roles (Rawat Jalan Scope)
const SIMRS_USERS = {
  "staf.budi": {
    username: "staf.budi",
    password: "registrasi123",
    name: "Budi Santoso",
    roleKey: "REGISTRATION_STAFF",
    department: "Loket Registrasi Rawat Jalan",
    title: "Petugas Pendaftaran Rawat Jalan",
    initials: "BS",
    avatarBg: "bg-blue-600",
    idNumber: "NIP.198804122019031002"
  },
  "perawat.siti": {
    username: "perawat.siti",
    password: "perawat123",
    name: "Ns. Siti Rahma, S.Kep",
    roleKey: "NURSING_USER",
    department: "Ruang TTV Rawat Jalan",
    title: "Perawat Rawat Jalan",
    initials: "SR",
    avatarBg: "bg-emerald-600",
    idNumber: "STR.31.02.5.2.19.123456"
  },
  "dokter.hendra": {
    username: "dokter.hendra",
    password: "dokter123",
    name: "dr. Hendra Pratama, Sp.PD",
    roleKey: "PHYSICIAN",
    department: "Poli Penyakit Dalam",
    title: "Dokter Rawat Jalan",
    initials: "HP",
    avatarBg: "bg-indigo-600",
    idNumber: "SIP.503/102/DS/2022"
  },
  "kasir.linda": {
    username: "kasir.linda",
    password: "kasir123",
    name: "Linda Wijaya, S.E.",
    roleKey: "CASHIER",
    department: "Loket Kasir Rawat Jalan",
    title: "Kasir Rawat Jalan",
    initials: "LW",
    avatarBg: "bg-emerald-700",
    idNumber: "NIP.199105172018022003"
  },
  "display.tv": {
    username: "display.tv",
    password: "display123",
    name: "Display Antrian Dokter",
    roleKey: "QUEUE_DISPLAY",
    department: "Ruang Tunggu Rawat Jalan",
    title: "Layar Display Antrian Publik (Zero PHI)",
    initials: "TV",
    avatarBg: "bg-slate-800",
    idNumber: "DEVICE-TV-01"
  }
};

// 2. Role Specifications & Contextual Top Service Menus
const ROLES = {
  REGISTRATION_STAFF: {
    id: "Petugas Pendaftaran RJ",
    name: "Budi Santoso",
    title: "Petugas Pendaftaran Rawat Jalan",
    badge: "bg-blue-100 text-blue-800 border border-blue-200",
    submoduleName: "Modul Registrasi Pasien",
    landingWorkspace: "registrasi",
    allowedWorkspaces: ["registrasi", "reg-queue", "reg-bpjs"],
    primaryNav: [
      { id: "registrasi", label: "Pendaftaran Walk-in", icon: "person_add" },
      { id: "reg-queue", label: "Antrian Loket", icon: "confirmation_number" },
      { id: "reg-bpjs", label: "Rujukan BPJS & SEP", icon: "verified_user" }
    ],
    searchPlaceholder: "Cari NIK / No. RM / Nama Pasien...",
    searchScope: "patients",
    serviceTabs: [
      { id: "tab-reg-enc", label: "Daftar Encounter", icon: "view_list", target: "registrasi", action: "switchRegView('encounter')" },
      { id: "tab-reg-bpjs", label: "Rujukan BPJS & SEP", icon: "verified_user", target: "registrasi", action: "switchRegView('bpjs')" },
      { id: "tab-reg-walkin", label: "Form Registrasi Pasien", icon: "person_add", target: "registrasi", action: "switchRegView('form')" }
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
      "Penerimaan Pasien Rujukan BPJS",
      "Cetak Surat Eligibilitas Berobat (SEP)",
      "View Daftar Encounter",
      "Buat Encounter Pasien Lama",
      "Buat Encounter Pasien Baru",
      "Pilih Poli Spesialis & Jadwal Dokter",
      "Lihat Slot Antrian Dokter"
    ],
    deniedNotes: "Hanya berwenang mengelola registrasi & encounter pendaftaran. Dilarang membuka rekam medis dokter (SOAP), TTV, atau kasir pembayaran."
  },

  NURSING_USER: {
    id: "Perawat",
    name: "Ns. Siti Rahma, S.Kep",
    title: "Perawat Rawat Jalan",
    badge: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    submoduleName: "Modul TTV",
    landingWorkspace: "ttv-queue",
    allowedWorkspaces: ["ttv-queue", "ttv-input", "ttv-history", "ttv", "triase"],
    primaryNav: [
      { id: "ttv-queue", label: "Antrian Triase", icon: "checklist" },
      { id: "ttv-input", label: "Pengukuran TTV", icon: "vital_signs" },
      { id: "ttv-history", label: "Riwayat Triase", icon: "history" }
    ],
    searchPlaceholder: "Cari Antrian Pasien TTV / No. Tiket...",
    searchScope: "ttv",
    serviceTabs: [
      { id: "tab-ttv-queue", label: "Antrian Poli & Dokter", icon: "checklist", target: "ttv-queue", action: "focusTtvQueue()" },
      { id: "tab-ttv-call", label: "Panggil Pasien", icon: "campaign", action: "callCurrentTriagePatient" },
      { id: "tab-ttv-input", label: "Input TTV", icon: "vital_signs", target: "ttv-input", action: "focusTtvInput()" }
    ],
    permissions: {
      "Vital Signs": ["read", "write", "create"],
      "Triage Assessment": ["read", "write", "create"],
      "Outpatient Visit": ["read"],
      "Queue Ticket": ["read", "write"],
      "Patient": ["read"],
      "Patient Encounter": [], // DILARANG WRITE SOAP
      "Medication Request": [], // DILARANG
      "Sales Invoice": [] // DILARANG
    },
    allowedMenus: [
      "View Antrian Poli dan Dokter",
      "Pemanggil Pasien (Panggil / Recall)",
      "Input TTV (TD, Nadi, Suhu, RR, SpO2, BB, TB, BMI)"
    ],
    deniedNotes: "Berwenang memanggil antrian dan menginput TTV. Dilarang meresepkan obat, mengisi SOAP dokter, atau memproses pembayaran."
  },

  PHYSICIAN: {
    id: "Dokter",
    name: "dr. Hendra Pratama, Sp.PD",
    title: "Dokter Rawat Jalan",
    badge: "bg-indigo-100 text-indigo-800 border border-indigo-200",
    submoduleName: "Modul Dokter Rawat Jalan",
    landingWorkspace: "doctor-queue",
    allowedWorkspaces: ["doctor-dashboard", "doctor-queue", "doctor-consultation", "doctor-patients", "doctor-documents", "dokter"],
    primaryNav: [
      { id: "doctor-dashboard", label: "Dashboard", icon: "dashboard" },
      { id: "doctor-queue", label: "Antrian Pasien", icon: "format_list_bulleted" },
      { id: "doctor-consultation", label: "Pemeriksaan (RME)", icon: "stethoscope" },
      { id: "doctor-patients", label: "Data Pasien", icon: "person_search" },
      { id: "doctor-documents", label: "Dokumen & Resume", icon: "description" }
    ],
    searchPlaceholder: "Cari Pasien Antrian Poli / No. RM...",
    searchScope: "doctor",
    serviceTabs: [
      { id: "tab-doc-queue", label: "Antrian Pasien", icon: "queue", target: "doctor-queue", action: "focusDoctorQueue()" },
      { id: "tab-doc-call", label: "Panggil Pasien", icon: "campaign", action: "callCurrentDoctorPatient" },
      { id: "tab-doc-data", label: "Data Pasien & SOAP", icon: "history_edu", target: "doctor-consultation", action: "focusDoctorSoap()" },
      { id: "tab-doc-referral", label: "Rujukan Online", icon: "forward", action: "openOnlineReferralModal" },
      { id: "tab-doc-rx", label: "Resep Online", icon: "prescriptions", action: "focusDoctorPrescriptions()" },
      { id: "tab-doc-resume", label: "Resume Medis", icon: "print", action: "printResumeMedisCurrent" }
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
      "View Antrian Pasien",
      "Pemanggil Pasien",
      "View Data Pasien (Profile, TTV, Anamnesis)",
      "Rujukan Online (Dokter Spesialis, Lab, Radiologi, Rehab Medis, Luar)",
      "SOAP",
      "Diagnosa (ICD-10)",
      "Resume Medis",
      "Resep Online",
      "Layanan & Tindakan Dokter"
    ],
    deniedNotes: "Berwenang mengelola rekam medis SOAP, diagnosa, rujukan order online, dan resep online. Dilarang mengakses kasir atau dispensing obat."
  },

  CASHIER: {
    id: "Kasir RJ",
    name: "Linda Wijaya, S.E.",
    title: "Kasir Rawat Jalan",
    badge: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    submoduleName: "Modul Kasir Rawat Jalan",
    landingWorkspace: "cashier-queue",
    allowedWorkspaces: ["cashier-dashboard", "cashier-queue", "cashier-payment", "cashier-history", "kasir"],
    primaryNav: [
      { id: "cashier-dashboard", label: "Dashboard", icon: "dashboard" },
      { id: "cashier-queue", label: "Antrian Billing", icon: "receipt_long" },
      { id: "cashier-payment", label: "Pembayaran Kasir", icon: "point_of_sale" },
      { id: "cashier-history", label: "Riwayat Transaksi", icon: "history_edu" }
    ],
    searchPlaceholder: "Cari No. Tagihan / Pasien Kasir...",
    searchScope: "cashier",
    serviceTabs: [
      { id: "tab-cs-queue", label: "Billing Pasien", icon: "receipt_long", target: "cashier-queue" },
      { id: "tab-cs-add", label: "Tambah Tindakan", icon: "add_circle", action: "openAddServiceModal" },
      { id: "tab-cs-print", label: "Cetak Billing", icon: "print", action: "printBillingCurrent" },
      { id: "tab-cs-pay", label: "Pembayaran & Kwitansi", icon: "payments", target: "cashier-payment" }
    ],
    permissions: {
      "Sales Invoice": ["read", "write", "create", "submit"],
      "Payment Entry": ["read", "write", "create", "submit"],
      "Outpatient Visit": ["read"],
      "Patient": ["read"],
      "Patient Encounter": [], // DILARANG
      "Vital Signs": [] // DILARANG
    },
    allowedMenus: [
      "Billing Pasien",
      "Tambah Pelayanan / Tindakan",
      "Cetak Billing Pasien",
      "Pembayaran (Tunai, Debit/Kredit, Online/QRIS, Asuransi, Perusahaan)",
      "Cetak Kwitansi Pembayaran"
    ],
    deniedNotes: "Berwenang memproses billing dan penerimaan pembayaran. Dilarang membaca isi catatan medis SOAP dokter atau mengubah resep."
  },

  QUEUE_DISPLAY: {
    id: "Display Antrian",
    name: "Display Antrian Dokter",
    title: "Layar Antrian Publik",
    badge: "bg-slate-100 text-slate-800 border border-slate-300",
    submoduleName: "Modul Display Antrian Dokter",
    landingWorkspace: "display",
    allowedWorkspaces: ["display"],
    primaryNav: [
      { id: "display", label: "Display Antrian TV", icon: "tv" }
    ],
    searchPlaceholder: "",
    searchScope: "none",
    serviceTabs: [
      { id: "tab-disp-poli", label: "Display Antrian Poli/Dokter", icon: "tv", target: "display", action: "switchDisplayTab('poli')" },
      { id: "tab-disp-kasir-farmasi", label: "Display Antrian Kasir & Farmasi", icon: "tv_gen", target: "display", action: "switchDisplayTab('kasir_farmasi')" }
    ],
    permissions: {
      "Queue Ticket": ["read"]
    },
    allowedMenus: [
      "Display Antrian Poli/Dokter",
      "Display Antrian Kasir & Farmasi"
    ],
    deniedNotes: "Perangkat monitor publik. PRIVASI KETAT: Menampilkan nomor tiket & ruangan saja. Bebas data medis atau identitas pribadi (Zero PHI)."
  }
};

// 3. Permission Manager Class (Enforces ADR A-00 & 5 Submodul Stakeholder)
class PermissionManager {
  constructor() {
    this.currentRoleKey = "REGISTRATION_STAFF"; // default fallback
  }

  getCurrentRole() {
    return ROLES[this.currentRoleKey] || ROLES["REGISTRATION_STAFF"];
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
    if (role.allowedWorkspaces && role.allowedWorkspaces.includes(workspaceId)) return true;
    // Map backwards-compatible aliases
    if ((workspaceId === "triase" || workspaceId === "ttv") && role.allowedWorkspaces.includes("ttv-queue")) return true;
    if (workspaceId === "dokter" && role.allowedWorkspaces.includes("doctor-queue")) return true;
    if (workspaceId === "kasir" && role.allowedWorkspaces.includes("cashier-queue")) return true;
    return false;
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
