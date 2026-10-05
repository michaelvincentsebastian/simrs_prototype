/**
 * SIMRS Mini - Minimalist Clinical Worksheet Application
 * Adhering strictly to instructions/stitch_design_system_generator/DESIGN.md
 * Platform: Atkinson Hyperlegible Next + Material Symbols Outlined + Tailwind CSS
 */

let activeWorkspaceId = "triase";
let activeDoctorConsultationVisitId = "OPV-2026-0001";
let isAudioEnabled = true;
let searchQuery = "";

// 1. Initialization
document.addEventListener("DOMContentLoaded", () => {
  initApp();
  startClock();
});

function initApp() {
  const user = authService.getCurrentUser();

  if (!user) {
    showLoginView();
    return;
  }

  hideLoginView();
  permissionEngine.setRole(user.roleKey);
  const currentRole = permissionEngine.getCurrentRole();

  updateRoleHeaderUI(user, currentRole);
  renderSidebar();
  renderContextualTopBar();

  activeWorkspaceId = currentRole.landingWorkspace;
  renderWorkspace(activeWorkspaceId);
}

function showLoginView() {
  const loginView = document.getElementById("login-view");
  if (loginView) {
    loginView.classList.remove("hidden");
    loginView.style.display = "flex";
  }
}

function hideLoginView() {
  const loginView = document.getElementById("login-view");
  if (loginView) {
    loginView.classList.add("hidden");
    loginView.style.display = "none";
  }
}

// 2. Real-time Clock (WIB)
function startClock() {
  const clockEl = document.getElementById("clock-wib");
  const update = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour12: false });
    if (clockEl) clockEl.textContent = `${timeStr} WIB`;
  };
  update();
  setInterval(update, 1000);
}

// 3. Audio Voice Announcement Toggle
function toggleAudio() {
  isAudioEnabled = !isAudioEnabled;
  const icon = document.getElementById("audio-icon");
  if (isAudioEnabled) {
    if (icon) {
      icon.textContent = "volume_up";
      icon.className = "material-symbols-outlined text-[20px] text-brand";
    }
    showToast("Panggilan suara antrian diaktifkan (Web Speech API).", "success");
  } else {
    if (icon) {
      icon.textContent = "volume_off";
      icon.className = "material-symbols-outlined text-[20px] text-ink-soft";
    }
    showToast("Panggilan suara dinonaktifkan.", "neutral");
  }
}

// 4. Authentication Handlers & Quick Demo Logins
function handleLoginFormSubmit(event) {
  if (event) event.preventDefault();
  const usernameInput = document.getElementById("login-username");
  const passwordInput = document.getElementById("login-password");
  const errorBox = document.getElementById("login-error-msg");
  const errorText = document.getElementById("login-error-text");

  const username = usernameInput ? usernameInput.value.trim() : "";
  const password = passwordInput ? passwordInput.value.trim() : "";

  const result = authService.login(username, password);
  if (!result.success) {
    if (errorBox) {
      errorBox.classList.remove("hidden");
      if (errorText) errorText.textContent = result.message;
    }
    return;
  }

  if (errorBox) errorBox.classList.add("hidden");
  hideLoginView();

  const user = result.user;
  const currentRole = permissionEngine.getCurrentRole();
  updateRoleHeaderUI(user, currentRole);
  renderSidebar();
  renderContextualTopBar();

  activeWorkspaceId = currentRole.landingWorkspace;
  renderWorkspace(activeWorkspaceId);

  showToast(`Selamat datang, ${user.name} (${user.title})`, "success");
}

function quickLogin(username) {
  const user = authService.getUserByUsername(username);
  if (!user) return;

  const usernameInput = document.getElementById("login-username");
  const passwordInput = document.getElementById("login-password");
  if (usernameInput) usernameInput.value = user.username;
  if (passwordInput) passwordInput.value = user.password;

  authService.login(user.username, user.password);
  const errorBox = document.getElementById("login-error-msg");
  if (errorBox) errorBox.classList.add("hidden");

  hideLoginView();

  const currentRole = permissionEngine.getCurrentRole();
  updateRoleHeaderUI(user, currentRole);
  renderSidebar();
  renderContextualTopBar();

  activeWorkspaceId = currentRole.landingWorkspace;
  renderWorkspace(activeWorkspaceId);

  showToast(`Login aktif: ${user.name} (${user.title})`, "success");
}

function handleLogout() {
  authService.logout();
  showLoginView();
  const pwd = document.getElementById("login-password");
  if (pwd) pwd.value = "";
  showToast("Anda telah keluar dari workstation SIMRS Mini.", "neutral");
}

function togglePasswordVisibility() {
  const pwd = document.getElementById("login-password");
  const icon = document.getElementById("password-toggle-icon");
  if (!pwd) return;
  if (pwd.type === "password") {
    pwd.type = "text";
    if (icon) icon.textContent = "visibility_off";
  } else {
    pwd.type = "password";
    if (icon) icon.textContent = "visibility";
  }
}

function toggleCredentialsCheatSheet() {
  const sheet = document.getElementById("credentials-cheat-sheet");
  if (sheet) sheet.classList.toggle("hidden");
}

// 5. Update Header User & Role Badge
function updateRoleHeaderUI(user, role) {
  const headerAvatar = document.getElementById("header-avatar");
  const headerUserName = document.getElementById("header-user-name");
  const headerUserDept = document.getElementById("header-user-dept");
  const headerRoleBadge = document.getElementById("header-role-badge");

  const sidebarAvatar = document.getElementById("sidebar-avatar");
  const sidebarUserName = document.getElementById("sidebar-user-name");
  const sidebarRolePill = document.getElementById("sidebar-role-pill");

  if (headerAvatar) headerAvatar.textContent = user.initials || "RS";
  if (headerUserName) headerUserName.textContent = user.name;
  if (headerUserDept) headerUserDept.textContent = user.department;
  if (headerRoleBadge) {
    headerRoleBadge.textContent = role.id;
    headerRoleBadge.className = `px-2 py-0.5 rounded text-[10px] font-bold ${role.badge || 'bg-brand-tint text-brand-strong'} shrink-0 uppercase tracking-wider`;
  }

  if (sidebarAvatar) sidebarAvatar.textContent = user.initials || "RS";
  if (sidebarUserName) sidebarUserName.textContent = user.name;
  if (sidebarRolePill) sidebarRolePill.textContent = `${role.id}`;

  // Role-Tailored Search Bar
  const searchInput = document.getElementById("global-search");
  const searchBox = document.getElementById("header-search-box");
  if (searchInput) {
    searchInput.placeholder = role.searchPlaceholder || "Cari data...";
    searchInput.value = "";
    searchQuery = "";
  }
  if (searchBox) {
    if (role.searchScope === "none") {
      searchBox.classList.add("hidden");
    } else {
      searchBox.classList.remove("hidden");
    }
  }
}

// 6. Contextual Top Service Navigation Bar (Pindah Layanan ke Atas)
function renderContextualTopBar() {
  const role = permissionEngine.getCurrentRole();
  const tabsList = document.getElementById("contextual-tabs-list");
  const noteEl = document.getElementById("role-contextual-note");

  if (noteEl) {
    noteEl.textContent = `${role.id} · ${role.allowedWorkspaces.length} Ruang Kerja`;
  }

  if (!tabsList) return;
  tabsList.innerHTML = "";

  const tabs = role.serviceTabs || [];
  tabs.forEach(tab => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "flex items-center gap-1.5 px-3 py-1 bg-surface-container-low hover:bg-brand-tint text-ink hover:text-brand-strong rounded-xl text-caption font-semibold transition-all border border-line/40 shrink-0 shadow-sm active:scale-95";
    btn.innerHTML = `
      <span class="material-symbols-outlined text-[16px] text-brand">${tab.icon || 'arrow_right'}</span>
      <span>${tab.label}</span>
    `;

    btn.onclick = () => {
      handleContextualTabClick(tab);
    };

    tabsList.appendChild(btn);
  });
}

function handleContextualTabClick(tab) {
  if (tab.target && tab.target !== activeWorkspaceId) {
    activeWorkspaceId = tab.target;
    renderSidebar();
    renderWorkspace(activeWorkspaceId);
  }

  if (tab.action && typeof window[tab.action] === "function") {
    window[tab.action]();
  } else {
    showToast(`Membuka: ${tab.label}`, "info");
  }
}

// Contextual Tab Action Helpers
function callTicketDemo() {
  callTicket("A-001", "Loket Pendaftaran 01");
}

function recallTicketDemo() {
  showToast("Memanggil ulang tiket antrian aktif...", "info");
  if (isAudioEnabled && window.speechSynthesis) {
    const utter = new SpeechSynthesisUtterance("Panggilan ulang nomor antrian A-001, silakan menuju Loket Pendaftaran 01.");
    utter.lang = "id-ID";
    window.speechSynthesis.speak(utter);
  }
}

function skipTicketDemo() {
  showToast("Tiket antrian dilewati (Skip) dan dimasukkan ke daftar tunda.", "neutral");
}

function openDocLabOrder() {
  openOrderLabModal();
}

function focusFinalizeSection() {
  const el = document.getElementById("consultation-actions-container") || document.querySelector("button[onclick*='finalizeDoctorConsultation']");
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("ring-4", "ring-brand");
    setTimeout(() => el.classList.remove("ring-4", "ring-brand"), 2000);
  } else {
    showToast("Bagian Finalisasi Rekam Medis (Encounter)", "info");
  }
}

// 7. Dynamic Sidebar Builder (NO LOCKED MENUS - ONLY ALLOWED ONES)
function renderSidebar() {
  const role = permissionEngine.getCurrentRole();
  const allWorkspaces = [
    { id: "registrasi", label: "Pendaftaran Walk-in", icon: "person_add" },
    { id: "triase", label: "Triase & TTV Perawat", icon: "vital_signs" },
    { id: "dokter", label: "Pelayanan Dokter (SOAP)", icon: "stethoscope" },
    { id: "lab", label: "Laboratorium Penunjang", icon: "science" },
    { id: "farmasi", label: "Farmasi & Dispensing", icon: "prescriptions" },
    { id: "kasir", label: "Kasir & Billing", icon: "payments" },
    { id: "monitoring", label: "Monitoring Kinerja", icon: "monitoring" },
    { id: "audit", label: "Audit Kepatuhan", icon: "fact_check" },
    { id: "display", label: "Display Antrian TV", icon: "tv" },
    { id: "kiosk", label: "Kiosk Mandiri (APM)", icon: "touch_app" }
  ];

  // STRICT FILTER: Only show workspaces allowed for this role. Zero locked menus!
  const visibleWorkspaces = allWorkspaces.filter(ws => permissionEngine.canAccessWorkspace(ws.id));

  const navList = document.getElementById("sidebar-nav-list");
  if (!navList) return;
  navList.innerHTML = "";

  visibleWorkspaces.forEach(ws => {
    const isActive = activeWorkspaceId === ws.id;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `flex items-center justify-between w-full px-space-md py-2.5 rounded-xl transition-all text-left font-body-default text-body-default ${
      isActive 
        ? "bg-brand-tint text-brand-strong font-body-strong shadow-sm border border-brand/20" 
        : "text-ink hover:bg-surface-container-low hover:text-ink"
    }`;

    btn.onclick = () => {
      activeWorkspaceId = ws.id;
      renderSidebar();
      renderWorkspace(ws.id);
    };

    btn.innerHTML = `
      <div class="flex items-center gap-space-sm">
        <span class="material-symbols-outlined text-[20px] ${isActive ? 'text-brand-strong' : 'text-brand'}">${ws.icon}</span>
        <span class="truncate">${ws.label}</span>
      </div>
      <span class="material-symbols-outlined text-[16px] ${isActive ? 'text-brand-strong' : 'text-ink-soft'}">chevron_right</span>
    `;

    navList.appendChild(btn);
  });

  // Render Sub-Navigation Features for this role
  const subNavContainer = document.getElementById("sidebar-sub-nav-container");
  if (subNavContainer) {
    subNavContainer.innerHTML = `
      <div class="px-space-sm mb-1 text-[11px] font-bold text-ink-soft uppercase tracking-wider flex items-center gap-1">
        <span class="material-symbols-outlined text-[14px]">checklist</span>
        <span>Akses Modul:</span>
      </div>
    `;

    const menus = role.allowedMenus || [];
    menus.forEach(menuTitle => {
      const item = document.createElement("div");
      item.className = "flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] text-ink-soft hover:bg-surface-container-low hover:text-ink transition cursor-pointer";
      item.innerHTML = `
        <span class="w-1.5 h-1.5 rounded-full bg-brand/60 shrink-0"></span>
        <span class="truncate">${menuTitle}</span>
      `;
      item.onclick = () => {
        showToast(`Navigasi: ${menuTitle}`, "info");
      };
      subNavContainer.appendChild(item);
    });
  }
}

// 8. Global Search Filter (Role-Tailored)
function handleGlobalSearch(query) {
  searchQuery = (query || "").trim().toLowerCase();
  renderWorkspace(activeWorkspaceId);
}

// State for Live Registration Workstation Form
let regFormState = {
  patientId: "siti_rahmawati",
  patientName: "Siti Rahmawati",
  mrNo: "MRN-000123",
  genderAge: "P, 54 th",
  nik: "3201234567890001",
  address: "Jl. Sukamaju No. 12, Kel. Menteng",
  phone: "0812-9876-5432",
  poli: "penyakit_dalam",
  poliName: "Penyakit Dalam",
  poliRoom: "Ruang Praktik 2",
  doctor: "andika",
  doctorName: "dr. Andika Pratama, Sp.PD",
  guarantorType: "umum",
  guarantorLabel: "Umum / Bayar Mandiri",
  guarantorNumber: "-",
  nextTicketNo: "T-014"
};

const SAMPLE_PATIENTS_DATABASE = [
  {
    id: "siti_rahmawati",
    name: "Siti Rahmawati",
    mrNo: "MRN-000123",
    genderAge: "P, 54 th",
    nik: "3201234567890001",
    address: "Jl. Sukamaju No. 12, Kel. Menteng",
    phone: "0812-9876-5432",
    statusBadge: "Data Lengkap"
  },
  {
    id: "budi_santoso",
    name: "Budi Santoso",
    mrNo: "MRN-000124",
    genderAge: "L, 42 th",
    nik: "3201234567890002",
    address: "Jl. Dahlia No. 45, Kebayoran",
    phone: "0813-1122-3344",
    statusBadge: "Data Lengkap"
  },
  {
    id: "dewi_lestari",
    name: "Dewi Lestari",
    mrNo: "MRN-000125",
    genderAge: "P, 28 th",
    nik: "3201234567890003",
    address: "Jl. Melati No. 18, Tebet",
    phone: "0817-5566-7788",
    statusBadge: "Data Lengkap"
  }
];

function selectRegPatient(patientId) {
  if (patientId === "new_patient") {
    openNewPatientModal();
    return;
  }
  const found = SAMPLE_PATIENTS_DATABASE.find(p => p.id === patientId);
  if (found) {
    regFormState.patientId = found.id;
    regFormState.patientName = found.name;
    regFormState.mrNo = found.mrNo;
    regFormState.genderAge = found.genderAge;
    regFormState.nik = found.nik;
    regFormState.address = found.address;
    regFormState.phone = found.phone;
    updateRegistrationSummaryUI();
  }
}

function handlePoliChange(value) {
  regFormState.poli = value;
  const poliMap = {
    penyakit_dalam: { name: "Penyakit Dalam", room: "Ruang Praktik 2" },
    jantung: { name: "Jantung & Pembuluh Darah", room: "Ruang Praktik 4" },
    saraf: { name: "Neurologi / Saraf", room: "Ruang Praktik 1" },
    mata: { name: "Klinik Mata", room: "Ruang Praktik 3" },
    umum: { name: "Poli Umum", room: "Ruang Praktik 5" }
  };
  if (poliMap[value]) {
    regFormState.poliName = poliMap[value].name;
    regFormState.poliRoom = poliMap[value].room;
  }
  updateRegistrationSummaryUI();
}

function handleDoctorChange(value) {
  regFormState.doctor = value;
  const docMap = {
    andika: "dr. Andika Pratama, Sp.PD",
    citra: "dr. Citra Lestari, Sp.PD",
    fauzi: "dr. Fauzi Rahman, Sp.PD",
    hendra: "dr. Hendra Pratama, Sp.PD"
  };
  regFormState.doctorName = docMap[value] || value;
  updateRegistrationSummaryUI();
}

function handleGuarantorChange(value) {
  regFormState.guarantorType = value;
  const gMap = {
    umum: "Umum / Bayar Mandiri",
    asuransi: "Asuransi Swasta",
    bpjs: "BPJS Kesehatan"
  };
  regFormState.guarantorLabel = gMap[value] || value;
  const claimBadge = document.getElementById("reg-claim-status");
  if (claimBadge) {
    claimBadge.innerHTML = value === 'bpjs' 
      ? '<span class="material-symbols-outlined text-[14px]">check_circle</span><span>SEP Terbit</span>'
      : '<span class="material-symbols-outlined text-[14px]">info</span><span>Belum diverifikasi</span>';
  }
  updateRegistrationSummaryUI();
}

function handleGuarantorNumberChange(value) {
  regFormState.guarantorNumber = value || "-";
  updateRegistrationSummaryUI();
}

function updateRegistrationSummaryUI() {
  const pName = document.getElementById("summary-patient-name");
  const pMeta = document.getElementById("summary-patient-meta");
  const pMrn = document.getElementById("summary-patient-mrn");
  const pPoli = document.getElementById("summary-poli-name");
  const pDoc = document.getElementById("summary-doctor-name");
  const pDocRoom = document.getElementById("summary-doctor-room");
  const pGuar = document.getElementById("summary-guarantor-name");
  const pTicket = document.getElementById("summary-ticket-preview");

  if (pName) pName.textContent = regFormState.patientName;
  if (pMeta) pMeta.textContent = `${regFormState.genderAge} · ${regFormState.phone}`;
  if (pMrn) pMrn.textContent = regFormState.mrNo;
  if (pPoli) pPoli.textContent = regFormState.poliName;
  if (pDoc) pDoc.textContent = regFormState.doctorName;
  if (pDocRoom) pDocRoom.textContent = regFormState.poliRoom;
  if (pGuar) pGuar.textContent = regFormState.guarantorLabel;
  if (pTicket) pTicket.textContent = regFormState.nextTicketNo;
}

function confirmRegistration() {
  const ticketNo = regFormState.nextTicketNo;
  
  // Register in visit service
  try {
    const newVisit = {
      id: `OPV-2026-${String(VisitStateService.getVisits().length + 1).padStart(4, "0")}`,
      ticketNo: ticketNo,
      patientName: regFormState.patientName,
      mrNo: regFormState.mrNo,
      departmentName: regFormState.poliName,
      practitionerName: regFormState.doctorName,
      payerType: regFormState.guarantorType.toUpperCase() === 'BPJS' ? 'BPJS' : regFormState.guarantorType === 'asuransi' ? 'Asuransi' : 'Umum',
      visitStatus: "WAITING_TRIAGE"
    };
    VisitStateService.getVisits().unshift(newVisit);
  } catch (err) {
    console.error("Visit registration error:", err);
  }

  // Populate modal
  const mNumber = document.getElementById("ticket-modal-number");
  const mName = document.getElementById("ticket-modal-name");
  const mMrn = document.getElementById("ticket-modal-mrn");
  const mPoli = document.getElementById("ticket-modal-poli");
  const mDoc = document.getElementById("ticket-modal-doctor");
  const mTime = document.getElementById("ticket-modal-time");

  if (mNumber) mNumber.textContent = ticketNo;
  if (mName) mName.textContent = regFormState.patientName;
  if (mMrn) mMrn.textContent = regFormState.mrNo;
  if (mPoli) mPoli.textContent = `${regFormState.poliName} (${regFormState.poliRoom})`;
  if (mDoc) mDoc.textContent = regFormState.doctorName;
  if (mTime) {
    const now = new Date();
    mTime.textContent = `${now.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}, ${now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`;
  }

  // Show modal
  const modal = document.getElementById("success-modal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

  showToast(`Pendaftaran selesai · Tiket ${ticketNo} dicetak`, "success");

  // Web Speech audio call if enabled
  if (isAudioEnabled && window.speechSynthesis) {
    const textToSpeak = `Nomor antrian ${ticketNo}, atas nama ${regFormState.patientName}, silakan menuju ruang triase perawat.`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "id-ID";
    window.speechSynthesis.speak(utterance);
  }

  // Increment next ticket number
  const nextNum = parseInt(regFormState.nextTicketNo.replace("T-", "")) + 1;
  regFormState.nextTicketNo = `T-${String(nextNum).padStart(3, "0")}`;
  updateRegistrationSummaryUI();

  // Re-render recent visits table
  const tblContainer = document.getElementById("registration-visits-table-container");
  if (tblContainer) {
    tblContainer.innerHTML = renderRecentVisitsTableHtml();
  }
}

function closeSuccessModal() {
  const modal = document.getElementById("success-modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

function printThermalTicket() {
  showToast("Mengirim perintah cetak ke EPSON TM-T82...", "info");
}

function resetRegistrationForm() {
  const input = document.getElementById("patient-search-input");
  if (input) input.value = "";
  showToast("Formulir siap untuk pendaftaran pasien berikutnya.", "info");
}

// Keyboard accessibility: Alt + S focus search
window.addEventListener("keydown", function(e) {
  if (e.altKey && (e.key === "s" || e.key === "S")) {
    e.preventDefault();
    const input = document.getElementById("patient-search-input");
    if (input) input.focus();
  }
});

// 7. Workspace Renderer
function renderWorkspace(workspaceId) {
  const container = document.getElementById("main-viewport");
  if (!container) return;

  switch (workspaceId) {
    case "registrasi":
      renderRegistrasiWorkspace(container);
      break;
    case "triase":
      renderTriaseWorkspace(container);
      break;
    case "dokter":
      renderDokterWorkspace(container);
      break;
    case "lab":
      renderLabWorkspace(container);
      break;
    case "farmasi":
      renderFarmasiWorkspace(container);
      break;
    case "kasir":
      renderKasirWorkspace(container);
      break;
    case "monitoring":
      renderMonitoringWorkspace(container);
      break;
    case "audit":
      renderAuditWorkspace(container);
      break;
    case "display":
      renderDisplayWorkspace(container);
      break;
    case "kiosk":
      renderKioskWorkspace(container);
      break;
    default:
      container.innerHTML = `<div class="p-8 text-center text-ink-soft">Ruang kerja tidak ditemukan.</div>`;
  }
}

// ========================================================
// WORKSPACE 1: REGISTRASI WALK-IN (Clean 2-Column Workstation)
// ========================================================
function renderRegistrasiWorkspace(container) {
  container.innerHTML = `
    <div class="flex flex-col w-full">
      <!-- Top Context Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-lg">
        <div class="flex flex-col">
          <div class="flex items-center gap-2 text-ink-soft text-caption font-caption mb-1">
            <span>Registrasi</span>
            <span class="material-symbols-outlined text-[14px]">chevron_right</span>
            <span class="text-ink font-body-strong">Pendaftaran walk-in</span>
          </div>
          <div class="flex items-center gap-space-sm">
            <h1 class="font-headline-lg text-headline-lg text-ink font-bold tracking-tight">Pendaftaran Walk-in</h1>
            <div class="flex items-center gap-1.5 px-2.5 py-1 bg-brand-tint rounded-full text-brand-strong font-caption text-caption">
              <span class="w-1.5 h-1.5 rounded-full bg-brand"></span>
              <span>Loket 01 Aktif</span>
            </div>
          </div>
        </div>

        <!-- Quick Shortcuts & Info Indicator -->
        <div class="flex items-center gap-space-md">
          <div class="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-xl">
            <span class="material-symbols-outlined text-[16px] text-ink-soft">access_time</span>
            <span class="font-caption text-caption text-ink font-medium">08:24 WIB · Senin, 05 Okt 2026</span>
          </div>
          <div class="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-xl">
            <span class="font-caption text-caption text-ink-soft">Shortcut:</span>
            <kbd class="px-1.5 py-0.5 bg-surface rounded text-[11px] font-mono text-ink shadow-sm">Alt + S</kbd>
            <span class="font-caption text-caption text-ink-soft">Cari</span>
          </div>
        </div>
      </div>

      <!-- Two-Column Workstation Layout (1440px baseline) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        
        <!-- LEFT COLUMN: Registration Desk (3 Stacked Sections) -->
        <div class="lg:col-span-8 flex flex-col gap-space-lg">
          
          <!-- SECTION 1: PASIEN -->
          <section class="bg-surface rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md border border-line/30">
            <div class="flex items-center justify-between pb-space-sm">
              <div class="flex items-center gap-space-sm">
                <span class="w-6 h-6 rounded bg-brand-tint text-brand font-body-strong text-caption flex items-center justify-center font-bold">1</span>
                <h2 class="font-headline-md text-headline-md text-ink font-bold uppercase tracking-wider text-[15px]">Pasien</h2>
              </div>
              <span class="font-caption text-caption text-ink-soft">Langkah verifikasi identitas pasien rawat jalan</span>
            </div>

            <!-- Search Bar Row -->
            <div class="flex items-center gap-space-sm">
              <div class="relative flex-1">
                <span class="material-symbols-outlined absolute left-3 top-2.5 text-[20px] text-ink-soft pointer-events-none">badge</span>
                <input 
                  type="text" 
                  id="patient-search-input" 
                  value="3201234567890001"
                  class="w-full h-10 pl-10 pr-space-md bg-canvas rounded-xl font-body-default text-body-default text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 transition-all shadow-inner" 
                  placeholder="Cari MRN / NIK (16 digit) / nama pasien..."
                />
              </div>
              <button 
                type="button" 
                onclick="showToast('Pencarian database pasien aktif...')"
                class="h-10 px-space-lg rounded-xl font-body-strong text-body-strong text-brand bg-surface hover:bg-brand-tint flex items-center gap-1.5 transition-colors shadow-sm border border-line/40"
              >
                <span class="material-symbols-outlined text-[18px]">search</span>
                <span>Cari</span>
              </button>
            </div>

            <!-- Search Results Radio Cards -->
            <div class="flex flex-col gap-space-xs mt-1">
              <span class="font-caption text-caption text-ink-soft font-semibold uppercase tracking-wider mb-1">Hasil Pencarian Terkait</span>
              
              <!-- Patient Option 1 (Selected) -->
              <label class="group relative flex items-start justify-between p-space-md bg-brand-tint/60 rounded-xl cursor-pointer hover:bg-brand-tint transition-colors">
                <div class="flex items-start gap-space-md min-w-0">
                  <input 
                    type="radio" 
                    name="selected_patient" 
                    value="siti_rahmawati" 
                    checked 
                    onchange="selectRegPatient('siti_rahmawati')"
                    class="mt-1 h-4 w-4 text-brand focus:ring-brand cursor-pointer"
                  />
                  <div class="flex flex-col min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-body-strong text-body-strong text-ink">Siti Rahmawati</span>
                      <span class="text-ink-soft">·</span>
                      <span class="font-caption text-caption text-ink-soft">P, 54 th</span>
                      <span class="text-ink-soft">·</span>
                      <span class="font-mono text-caption text-brand-strong font-bold bg-surface px-1.5 py-0.5 rounded shadow-sm">MRN-000123</span>
                    </div>
                    <div class="flex items-center gap-space-md text-caption font-caption text-ink-soft mt-1 flex-wrap">
                      <span>NIK: <strong class="text-ink font-mono">3201234567890001</strong></span>
                      <span>Alamat: Jl. Sukamaju No. 12, Kel. Menteng</span>
                      <span>Telp: 0812-9876-5432</span>
                    </div>
                  </div>
                </div>
                <div class="shrink-0 flex items-center">
                  <span class="px-2 py-0.5 bg-success-tint text-success rounded text-[12px] font-semibold flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">check_circle</span>
                    Data Lengkap
                  </span>
                </div>
              </label>

              <!-- Patient Option 2 -->
              <label class="group relative flex items-start justify-between p-space-md bg-surface-container-low/70 rounded-xl cursor-pointer hover:bg-surface-container-low transition-colors">
                <div class="flex items-start gap-space-md min-w-0">
                  <input 
                    type="radio" 
                    name="selected_patient" 
                    value="budi_santoso" 
                    onchange="selectRegPatient('budi_santoso')"
                    class="mt-1 h-4 w-4 text-brand focus:ring-brand cursor-pointer"
                  />
                  <div class="flex flex-col min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-body-strong text-body-strong text-ink">Budi Santoso</span>
                      <span class="text-ink-soft">·</span>
                      <span class="font-caption text-caption text-ink-soft">L, 42 th</span>
                      <span class="text-ink-soft">·</span>
                      <span class="font-mono text-caption text-brand-strong font-bold bg-surface px-1.5 py-0.5 rounded shadow-sm">MRN-000124</span>
                    </div>
                    <div class="flex items-center gap-space-md text-caption font-caption text-ink-soft mt-1 flex-wrap">
                      <span>NIK: <strong class="text-ink font-mono">3201234567890002</strong></span>
                      <span>Alamat: Jl. Dahlia No. 45, Kebayoran</span>
                    </div>
                  </div>
                </div>
                <div class="shrink-0 flex items-center">
                  <span class="px-2 py-0.5 bg-success-tint text-success rounded text-[12px] font-semibold flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">check_circle</span>
                    Data Lengkap
                  </span>
                </div>
              </label>

              <!-- Patient Option 3: Pasien Baru -->
              <label class="group relative flex items-center justify-between p-space-md bg-surface-container-low/70 rounded-xl cursor-pointer hover:bg-surface-container-low transition-colors">
                <div class="flex items-center gap-space-md">
                  <input 
                    type="radio" 
                    name="selected_patient" 
                    value="new_patient" 
                    onchange="selectRegPatient('new_patient')"
                    class="h-4 w-4 text-brand focus:ring-brand cursor-pointer"
                  />
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-[20px] text-brand">person_add</span>
                    <span class="font-body-strong text-body-strong text-ink">+ Pasien Baru</span>
                    <span class="font-caption text-caption text-ink-soft">(Registrasi formulir identitas baru)</span>
                  </div>
                </div>
                <span class="font-caption text-caption text-ink-soft">Buat rekam medis baru</span>
              </label>
            </div>

            <!-- Warning Panel (Duplicate Warning - Rule 6.2) -->
            <div class="p-space-md bg-warning-tint text-warning rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-space-md mt-1">
              <div class="flex items-start gap-space-sm min-w-0">
                <span class="material-symbols-outlined text-[22px] text-warning shrink-0 mt-0.5">warning</span>
                <div class="flex flex-col">
                  <span class="font-body-strong text-body-strong text-ink leading-snug">
                    Peringatan: NIK ini sudah terdaftar atas nama pasien ini
                  </span>
                  <p class="font-caption text-caption text-ink-soft mt-0.5">
                    NIK <span class="font-mono font-semibold text-ink">3201234567890001</span> telah memiliki nomor rekam medis aktif <span class="font-mono font-semibold text-ink">MRN-000123</span>. Hindari pembuatan rekam medis ganda.
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-space-sm shrink-0 self-end sm:self-center">
                <button 
                  type="button" 
                  onclick="showToast('Pasien Siti Rahmawati siap diproses')"
                  class="h-8 px-3 rounded-lg font-caption text-caption font-semibold bg-brand text-on-primary hover:bg-brand-strong transition-colors flex items-center gap-1 shadow-sm"
                >
                  <span class="material-symbols-outlined text-[16px]">verified</span>
                  <span>Pakai pasien ini</span>
                </button>
                <button 
                  type="button" 
                  onclick="openNewPatientModal()"
                  class="h-8 px-3 rounded-lg font-caption text-caption font-semibold bg-surface text-ink hover:bg-surface-container-high transition-colors shadow-sm"
                >
                  Tetap buat baru
                </button>
              </div>
            </div>
          </section>

          <!-- SECTION 2: POLI & DOKTER -->
          <section class="bg-surface rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md border border-line/30">
            <div class="flex items-center justify-between pb-space-sm">
              <div class="flex items-center gap-space-sm">
                <span class="w-6 h-6 rounded bg-brand-tint text-brand font-body-strong text-caption flex items-center justify-center font-bold">2</span>
                <h2 class="font-headline-md text-headline-md text-ink font-bold uppercase tracking-wider text-[15px]">Poli & Dokter</h2>
              </div>
              <span class="font-caption text-caption text-ink-soft">Tujuan konsultasi rawat jalan hari ini</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <!-- Poli Selector -->
              <div class="flex flex-col gap-1.5">
                <label class="font-body-strong text-body-strong text-ink flex items-center gap-1" for="poli-select">
                  <span>Poli Tujuan</span>
                  <span class="text-danger">*</span>
                </label>
                <div class="relative">
                  <select 
                    id="poli-select" 
                    onchange="handlePoliChange(this.value)"
                    class="w-full h-10 px-3 pr-8 bg-surface rounded-xl font-body-default text-body-default text-ink focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 transition-all appearance-none cursor-pointer shadow-sm border border-line/40"
                  >
                    <option value="penyakit_dalam" selected>Penyakit Dalam (Gedung B, Lt. 2)</option>
                    <option value="jantung">Jantung & Pembuluh Darah</option>
                    <option value="saraf">Neurologi / Saraf</option>
                    <option value="mata">Klinik Mata</option>
                    <option value="umum">Poli Umum</option>
                  </select>
                  <span class="material-symbols-outlined absolute right-2.5 top-2.5 text-[20px] text-ink-soft pointer-events-none">arrow_drop_down</span>
                </div>
                <span class="font-caption text-caption text-ink-soft">Lokasi antrian ruang tunggu zona 2</span>
              </div>

              <!-- Dokter Selector -->
              <div class="flex flex-col gap-1.5">
                <label class="font-body-strong text-body-strong text-ink flex items-center gap-1" for="dokter-select">
                  <span>Dokter Praktik</span>
                  <span class="text-danger">*</span>
                </label>
                <div class="relative">
                  <select 
                    id="dokter-select" 
                    onchange="handleDoctorChange(this.value)"
                    class="w-full h-10 px-3 pr-8 bg-surface rounded-xl font-body-default text-body-default text-ink focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 transition-all appearance-none cursor-pointer shadow-sm border border-line/40"
                  >
                    <option value="andika" selected>dr. Andika Pratama, Sp.PD (Ruang 2)</option>
                    <option value="citra">dr. Citra Lestari, Sp.PD (Ruang 3)</option>
                    <option value="fauzi">dr. Fauzi Rahman, Sp.PD (Ruang 1)</option>
                    <option value="hendra">dr. Hendra Pratama, Sp.PD (Ruang 4)</option>
                  </select>
                  <span class="material-symbols-outlined absolute right-2.5 top-2.5 text-[20px] text-ink-soft pointer-events-none">arrow_drop_down</span>
                </div>
                <span class="font-caption text-caption text-ink-soft">SIP: 503/449/DINKES/2023</span>
              </div>
            </div>

            <!-- Schedule & Quota Notification Indicator -->
            <div class="flex items-center justify-between p-space-md bg-surface-container-low rounded-xl">
              <div class="flex items-center gap-space-sm">
                <span class="material-symbols-outlined text-[20px] text-brand">calendar_clock</span>
                <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-space-sm text-caption font-caption">
                  <span class="text-ink font-body-strong">Jadwal hari ini: <span class="font-mono">08:00 – 14:00 WIB</span></span>
                  <span class="hidden sm:inline text-ink-soft">·</span>
                  <span class="text-ink-soft">Estimasi waktu tunggu saat ini: ± 15 menit</span>
                </div>
              </div>
              <div class="flex items-center gap-1.5 px-2.5 py-1 bg-success-tint text-success rounded-lg font-caption text-caption font-semibold">
                <span class="material-symbols-outlined text-[16px]">event_available</span>
                <span>Sisa kuota: 6 slot</span>
              </div>
            </div>
          </section>

          <!-- SECTION 3: PENJAMIN -->
          <section class="bg-surface rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md border border-line/30">
            <div class="flex items-center justify-between pb-space-sm">
              <div class="flex items-center gap-space-sm">
                <span class="w-6 h-6 rounded bg-brand-tint text-brand font-body-strong text-caption flex items-center justify-center font-bold">3</span>
                <h2 class="font-headline-md text-headline-md text-ink font-bold uppercase tracking-wider text-[15px]">Penjamin</h2>
              </div>
              <span class="font-caption text-caption text-ink-soft">Klasifikasi skema pembiayaan pasien</span>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="font-body-strong text-body-strong text-ink">Skema Penjaminan</label>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                <!-- Umum -->
                <label class="flex items-center gap-space-sm p-3 bg-brand-tint/60 rounded-xl cursor-pointer hover:bg-brand-tint transition-all">
                  <input 
                    type="radio" 
                    name="guarantor_type" 
                    value="umum" 
                    checked 
                    onchange="handleGuarantorChange('umum')"
                    class="h-4 w-4 text-brand focus:ring-brand cursor-pointer"
                  />
                  <div class="flex flex-col">
                    <span class="font-body-strong text-body-strong text-ink">Umum</span>
                    <span class="font-caption text-caption text-ink-soft">Bayar mandiri di kasir</span>
                  </div>
                </label>
                <!-- Asuransi Swasta -->
                <label class="flex items-center gap-space-sm p-3 bg-surface-container-low/70 rounded-xl cursor-pointer hover:bg-surface-container-low transition-all">
                  <input 
                    type="radio" 
                    name="guarantor_type" 
                    value="asuransi" 
                    onchange="handleGuarantorChange('asuransi')"
                    class="h-4 w-4 text-brand focus:ring-brand cursor-pointer"
                  />
                  <div class="flex flex-col">
                    <span class="font-body-strong text-body-strong text-ink">Asuransi Swasta</span>
                    <span class="font-caption text-caption text-ink-soft">Prudential, Allianz, dsb.</span>
                  </div>
                </label>
                <!-- BPJS Kesehatan -->
                <label class="flex items-center gap-space-sm p-3 bg-surface-container-low/70 rounded-xl cursor-pointer hover:bg-surface-container-low transition-all">
                  <input 
                    type="radio" 
                    name="guarantor_type" 
                    value="bpjs" 
                    onchange="handleGuarantorChange('bpjs')"
                    class="h-4 w-4 text-brand focus:ring-brand cursor-pointer"
                  />
                  <div class="flex flex-col">
                    <span class="font-body-strong text-body-strong text-ink">BPJS Kesehatan</span>
                    <span class="font-caption text-caption text-ink-soft">JKN / KIS Rujukan Faskes</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Card Number Row -->
            <div class="grid grid-cols-1 md:grid-cols-12 gap-space-md items-end pt-1">
              <div class="md:col-span-8 flex flex-col gap-1.5">
                <label class="font-body-strong text-body-strong text-ink flex items-center justify-between" for="guarantor-number">
                  <span>No. Peserta / Kartu Asuransi</span>
                  <span class="font-caption text-caption text-ink-soft">(Opsional untuk Umum)</span>
                </label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-2.5 text-[20px] text-ink-soft pointer-events-none">credit_card</span>
                  <input 
                    type="text" 
                    id="guarantor-number" 
                    value="-" 
                    oninput="handleGuarantorNumberChange(this.value)"
                    placeholder="Masukkan no. kartu / polis penjamin..."
                    class="w-full h-10 pl-10 pr-space-md bg-surface-container-low/50 rounded-xl font-body-default text-body-default text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 transition-all shadow-sm border border-line/30"
                  />
                </div>
              </div>
              <div class="md:col-span-4 flex items-center h-10">
                <div class="w-full h-10 px-3 bg-surface-container-low rounded-xl flex items-center justify-between">
                  <span class="font-caption text-caption text-ink-soft">Status Klaim:</span>
                  <span id="reg-claim-status" class="px-2 py-0.5 bg-info-tint text-info rounded font-caption text-caption font-semibold flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">info</span>
                    <span>Belum diverifikasi</span>
                  </span>
                </div>
              </div>
            </div>
          </section>

          <!-- SECTION 4: LIVE OUTPATIENT VISITS TABLE -->
          <section class="bg-surface rounded-xl shadow-sm border border-line/30 overflow-hidden flex flex-col">
            <div class="px-space-lg py-space-md border-b border-line flex items-center justify-between bg-surface">
              <span class="font-headline-md text-headline-md text-ink font-bold flex items-center gap-2">
                <span class="material-symbols-outlined text-[20px] text-brand">list_alt</span>
                <span>Daftar Kunjungan Hari Ini (docs/data-model.md §3.1)</span>
              </span>
              <span class="font-caption text-caption text-ink-soft font-mono">Live Sync Frappe</span>
            </div>

            <div id="registration-visits-table-container">
              ${renderRecentVisitsTableHtml()}
            </div>
          </section>

        </div>

        <!-- RIGHT COLUMN: Sticky Registration Summary Card (360px) -->
        <div class="lg:col-span-4 sticky top-16 flex flex-col gap-space-md">
          
          <!-- Summary Card Container -->
          <div class="bg-surface rounded-xl shadow-sm p-space-lg flex flex-col border border-line/30">
            <div class="flex items-center justify-between pb-space-sm">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[20px] text-brand">receipt_long</span>
                <h3 class="font-headline-md text-headline-md text-ink font-bold">Ringkasan pendaftaran</h3>
              </div>
              <span class="px-2 py-0.5 bg-brand-tint text-brand-strong rounded text-[11px] font-bold uppercase tracking-wider">
                Loket Walk-in
              </span>
            </div>

            <!-- Detail Attributes List -->
            <div class="py-space-md flex flex-col gap-3 font-body-default text-body-default border-t border-line/30">
              <div class="flex items-start justify-between gap-2">
                <span class="text-ink-soft text-caption font-caption">Pasien</span>
                <div class="text-right flex flex-col">
                  <span id="summary-patient-name" class="text-ink font-body-strong">${regFormState.patientName}</span>
                  <span id="summary-patient-meta" class="text-caption font-caption text-ink-soft">${regFormState.genderAge}</span>
                </div>
              </div>

              <div class="flex items-center justify-between gap-2">
                <span class="text-ink-soft text-caption font-caption">No. Rekam Medis</span>
                <span id="summary-patient-mrn" class="font-mono text-ink font-bold bg-surface-container-low px-2 py-0.5 rounded text-[13px]">
                  ${regFormState.mrNo}
                </span>
              </div>

              <div class="flex items-center justify-between gap-2">
                <span class="text-ink-soft text-caption font-caption">Poli Tujuan</span>
                <span id="summary-poli-name" class="text-ink font-body-strong">${regFormState.poliName}</span>
              </div>

              <div class="flex items-start justify-between gap-2">
                <span class="text-ink-soft text-caption font-caption">Dokter</span>
                <div class="text-right flex flex-col">
                  <span id="summary-doctor-name" class="text-ink font-body-strong">${regFormState.doctorName}</span>
                  <span id="summary-doctor-room" class="text-caption font-caption text-ink-soft">${regFormState.poliRoom}</span>
                </div>
              </div>

              <div class="flex items-center justify-between gap-2">
                <span class="text-ink-soft text-caption font-caption">Penjamin</span>
                <span id="summary-guarantor-name" class="px-2 py-0.5 bg-surface-container-high rounded text-ink font-medium text-caption font-caption">
                  ${regFormState.guarantorLabel}
                </span>
              </div>

              <div class="flex items-center justify-between gap-2">
                <span class="text-ink-soft text-caption font-caption">Sumber</span>
                <div class="flex items-center gap-1 text-ink">
                  <span class="material-symbols-outlined text-[16px] text-brand">storefront</span>
                  <span class="font-medium text-caption font-caption">Walk-in Loket</span>
                </div>
              </div>
            </div>

            <!-- Subtle Separator -->
            <div class="h-px bg-surface-container-high w-full my-space-xs"></div>

            <!-- Checklist of Auto-Created Items -->
            <div class="py-space-md flex flex-col gap-space-sm bg-surface-container-low/60 p-space-md rounded-xl mt-space-sm">
              <span class="font-caption text-caption text-ink-soft font-semibold uppercase tracking-wider">
                Setelah Dikonfirmasi
              </span>
              <div class="flex flex-col gap-2 font-body-default text-body-default text-[13px]">
                <div class="flex items-center gap-2 text-ink">
                  <span class="w-4 h-4 rounded-full bg-success-tint text-success flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-[13px]">check</span>
                  </span>
                  <span>Appointment walk-in dibuat otomatis</span>
                </div>
                <div class="flex items-center gap-2 text-ink">
                  <span class="w-4 h-4 rounded-full bg-success-tint text-success flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-[13px]">check</span>
                  </span>
                  <span>Status Check-in langsung tercatat</span>
                </div>
                <div class="flex items-center justify-between text-ink">
                  <div class="flex items-center gap-2">
                    <span class="w-4 h-4 rounded-full bg-success-tint text-success flex items-center justify-center shrink-0">
                      <span class="material-symbols-outlined text-[13px]">check</span>
                    </span>
                    <span>Tiket Triase dicetak:</span>
                  </div>
                  <span id="summary-ticket-preview" class="font-mono font-bold text-brand bg-brand-tint px-2 py-0.5 rounded text-[13px]">
                    ${regFormState.nextTicketNo}
                  </span>
                </div>
              </div>
            </div>

            <!-- Action Footer Buttons -->
            <div class="flex flex-col gap-space-sm pt-space-md mt-space-xs">
              <button 
                type="button" 
                id="btn-register" 
                onclick="confirmRegistration()"
                class="w-full h-10 px-space-lg rounded-xl font-body-strong text-body-strong bg-brand hover:bg-brand-strong text-on-primary flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span class="material-symbols-outlined text-[20px]">print</span>
                <span>Daftarkan &amp; cetak tiket</span>
              </button>
              <button 
                type="button" 
                onclick="resetRegistrationForm()"
                class="w-full h-10 px-space-lg rounded-xl font-body-default text-body-default text-ink-soft hover:bg-surface-container-low hover:text-ink transition-colors"
              >
                Batal
              </button>
            </div>
          </div>

          <!-- Quick Desk Metrics / Status Card -->
          <div class="p-space-md bg-surface rounded-xl shadow-sm flex items-center justify-between border border-line/30">
            <div class="flex items-center gap-space-sm">
              <div class="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-brand">
                <span class="material-symbols-outlined text-[18px]">print_connect</span>
              </div>
              <div class="flex flex-col">
                <span class="font-caption text-caption text-ink font-semibold">Thermal Printer EPSON TM-T82</span>
                <span class="font-caption text-caption text-success flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-success"></span>
                  Siap mencetak tiket
                </span>
              </div>
            </div>
            <span class="font-mono text-caption text-ink-soft font-medium">LOKET-01</span>
          </div>

        </div>

      </div>
    </div>
  `;
}

function renderRecentVisitsTableHtml() {
  let visits = VisitStateService.getVisits();
  if (searchQuery) {
    visits = visits.filter(v => 
      v.patientName.toLowerCase().includes(searchQuery) || 
      v.mrNo.toLowerCase().includes(searchQuery) || 
      v.ticketNo.toLowerCase().includes(searchQuery)
    );
  }

  return `
    <div class="overflow-x-auto">
      <table class="w-full text-left font-table-cell text-table-cell border-collapse">
        <thead>
          <tr class="bg-surface-container-low border-b border-line text-ink-soft font-semibold text-caption">
            <th class="p-space-sm">Tiket / ID Visit</th>
            <th class="p-space-sm">Pasien &amp; No. RM</th>
            <th class="p-space-sm">Poli Tujuan</th>
            <th class="p-space-sm">Dokter Pemeriksa</th>
            <th class="p-space-sm">Penjamin</th>
            <th class="p-space-sm">Status Kunjungan</th>
            <th class="p-space-sm text-right">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-line">
          ${visits.map(v => `
            <tr class="hover:bg-surface-container-low/50 transition">
              <td class="p-space-sm">
                <span class="font-mono font-bold text-brand text-caption px-2 py-0.5 bg-brand-tint rounded">${v.ticketNo}</span>
                <span class="block font-mono text-[10px] text-ink-soft mt-0.5">${v.id}</span>
              </td>
              <td class="p-space-sm">
                <span class="font-body-strong text-ink block">${v.patientName}</span>
                <span class="font-mono text-caption text-ink-soft">${v.mrNo}</span>
              </td>
              <td class="p-space-sm font-medium text-ink">${v.departmentName}</td>
              <td class="p-space-sm text-ink-soft">${v.practitionerName}</td>
              <td class="p-space-sm">
                <span class="px-2 py-0.5 rounded font-caption text-caption font-medium ${
                  v.payerType === 'BPJS' ? 'bg-info-tint text-info' : 'bg-surface-container-low text-ink-soft border border-line/40'
                }">${v.payerType}</span>
              </td>
              <td class="p-space-sm">${renderStatusChip(v.visitStatus)}</td>
              <td class="p-space-sm text-right space-x-1">
                <button onclick="callTicket('${v.ticketNo}', '${v.departmentName}')" class="h-8 px-2 bg-surface hover:bg-brand-tint border border-line text-brand rounded-lg font-caption text-caption transition shadow-sm" title="Panggil Antrian">
                  <span class="material-symbols-outlined text-[16px]">volume_up</span>
                </button>
                <button onclick="printBuktiPendaftaran('${v.id}')" class="h-8 px-2.5 bg-surface hover:bg-surface-container-low border border-line text-ink rounded-lg font-caption text-caption transition shadow-sm">
                  <span class="material-symbols-outlined text-[16px]">print</span>
                  <span>Tiket</span>
                </button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

// ========================================================
// WORKSPACE 2: TRIASE & TTV (Nursing Worksheet)
// ========================================================
function renderTriaseWorkspace(container) {
  let visits = VisitStateService.getVisits();
  if (searchQuery) {
    visits = visits.filter(v => 
      (v.patientName && v.patientName.toLowerCase().includes(searchQuery)) ||
      (v.mrNo && v.mrNo.toLowerCase().includes(searchQuery)) ||
      (v.ticketNo && v.ticketNo.toLowerCase().includes(searchQuery)) ||
      (v.departmentName && v.departmentName.toLowerCase().includes(searchQuery))
    );
  }
  const triageQueue = visits.filter(v => v.visitStatus === "WAITING_TRIAGE" || v.visitStatus === "IN_TRIAGE");
  const selectedVisit = triageQueue[0] || visits[0];

  container.innerHTML = `
    <div class="flex flex-col gap-space-lg w-full">
      <!-- Breadcrumb & Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
        <div class="flex flex-col">
          <div class="flex items-center gap-2 text-ink-soft text-caption font-caption mb-1">
            <span>Rawat Jalan</span>
            <span class="material-symbols-outlined text-[14px]">chevron_right</span>
            <span class="text-ink font-body-strong">Triase &amp; TTV</span>
          </div>
          <div class="flex items-center gap-space-sm">
            <h1 class="font-headline-lg text-headline-lg text-ink font-bold tracking-tight">Triase &amp; Pengukuran Tanda Vital (TTV)</h1>
            <div class="flex items-center gap-1.5 px-2.5 py-1 bg-brand-tint rounded-full text-brand-strong font-caption text-caption font-semibold">
              <span class="w-1.5 h-1.5 rounded-full bg-brand"></span>
              <span>Perawat Rawat Jalan</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-xl text-caption font-caption">
          <span class="text-ink-soft">Antrian Triase:</span>
          <strong class="text-warning font-mono font-bold text-body-strong">${triageQueue.length}</strong>
          <span class="text-ink-soft">pasien</span>
        </div>
      </div>

      <!-- 2-Column Clinical Worksheet -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        
        <!-- Left: Triage Queue Stream (Col 4) -->
        <div class="lg:col-span-4 bg-surface rounded-xl shadow-sm border border-line/30 p-space-lg flex flex-col gap-space-md">
          <div class="flex items-center justify-between pb-space-sm border-b border-line/40">
            <span class="font-headline-md text-headline-md text-ink font-bold flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[20px] text-brand">checklist</span>
              <span>Antrian Triase</span>
            </span>
            <span class="font-mono text-caption text-brand-strong font-bold bg-brand-tint px-2 py-0.5 rounded">${triageQueue.length}</span>
          </div>

          <div class="flex flex-col gap-space-xs">
            ${triageQueue.length === 0 ? '<p class="font-caption text-caption text-ink-soft py-6 text-center">Tidak ada antrian triase aktif saat ini.</p>' : ''}
            ${triageQueue.map(v => `
              <div class="p-space-sm rounded-xl border transition flex items-center justify-between ${
                selectedVisit && selectedVisit.id === v.id ? 'border-brand bg-brand-tint/40 shadow-sm' : 'border-line/40 hover:bg-surface-container-low'
              }">
                <div class="min-w-0">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="font-mono font-bold text-caption text-brand bg-surface px-1.5 py-0.5 rounded shadow-sm">${v.ticketNo}</span>
                    <span class="font-body-strong text-body-strong text-ink truncate">${v.patientName}</span>
                  </div>
                  <span class="font-caption text-caption text-ink-soft block mt-0.5 truncate">${v.departmentName}</span>
                </div>
                <button onclick="callTicket('${v.ticketNo}', 'Meja Triase Perawat')" class="h-8 px-2.5 rounded-xl border border-line/50 bg-surface hover:bg-brand-tint text-brand transition shadow-sm shrink-0" title="Panggil Pasien">
                  <span class="material-symbols-outlined text-[16px]">volume_up</span>
                </button>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Right: Active Patient TTV Form (Col 8) -->
        <div class="lg:col-span-8 bg-surface rounded-xl shadow-sm border border-line/30 p-space-lg flex flex-col gap-space-md">
          ${!selectedVisit ? '<p class="text-ink-soft text-center py-12 font-body-default">Pilih pasien dari antrian untuk memulai pemeriksaan tanda vital.</p>' : `
            
            <!-- Sticky Patient Identity Banner -->
            <div class="p-space-md bg-surface-container-low rounded-xl border border-line/30 flex flex-wrap items-center justify-between gap-space-md">
              <div class="flex flex-col">
                <span class="font-caption text-caption text-ink-soft uppercase font-bold tracking-wider">Pasien Sedang Diperiksa</span>
                <h3 class="font-headline-md text-headline-md font-bold text-ink">${selectedVisit.patientName} <span class="font-mono text-caption text-brand-strong font-bold bg-surface px-1.5 py-0.5 rounded">(${selectedVisit.mrNo})</span></h3>
                <p class="font-caption text-caption text-ink-soft mt-0.5">Tujuan: <strong class="text-ink">${selectedVisit.departmentName}</strong> · ${selectedVisit.practitionerName}</p>
              </div>
              <div class="text-right">
                <span class="px-3 py-1 bg-brand-tint text-brand-strong font-mono font-bold rounded-xl text-caption shadow-sm">
                  Tiket: ${selectedVisit.ticketNo}
                </span>
              </div>
            </div>

            <!-- Form TTV & Skrining -->
            <form onsubmit="handleTriageSubmit(event, '${selectedVisit.id}')" class="flex flex-col gap-space-md">
              
              <!-- Section 1: Vital Signs -->
              <div class="flex flex-col gap-space-sm">
                <div class="flex items-center gap-space-sm pb-space-xs border-b border-line/30">
                  <span class="w-6 h-6 rounded bg-brand-tint text-brand font-body-strong text-caption flex items-center justify-center font-bold">1</span>
                  <h4 class="font-headline-md text-headline-md text-ink font-bold uppercase tracking-wider text-[14px]">Pengukuran Tanda Vital (TTV)</h4>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
                  <div>
                    <label class="block font-body-strong mb-1 text-ink text-caption">Sistolik (mmHg)</label>
                    <input type="number" id="vitals-systolic" value="${selectedVisit.vitals ? selectedVisit.vitals.systolic : 120}" required class="w-full h-10 px-3 bg-canvas rounded-xl font-mono text-body-default text-ink shadow-inner focus:outline-none focus:ring-2 focus:ring-brand">
                  </div>
                  <div>
                    <label class="block font-body-strong mb-1 text-ink text-caption">Diastolik (mmHg)</label>
                    <input type="number" id="vitals-diastolic" value="${selectedVisit.vitals ? selectedVisit.vitals.diastolic : 80}" required class="w-full h-10 px-3 bg-canvas rounded-xl font-mono text-body-default text-ink shadow-inner focus:outline-none focus:ring-2 focus:ring-brand">
                  </div>
                  <div>
                    <label class="block font-body-strong mb-1 text-ink text-caption">Nadi (bpm)</label>
                    <input type="number" id="vitals-pulse" value="${selectedVisit.vitals ? selectedVisit.vitals.pulse : 80}" required class="w-full h-10 px-3 bg-canvas rounded-xl font-mono text-body-default text-ink shadow-inner focus:outline-none focus:ring-2 focus:ring-brand">
                  </div>
                  <div>
                    <label class="block font-body-strong mb-1 text-ink text-caption">Suhu (°C)</label>
                    <input type="number" step="0.1" id="vitals-temperature" value="${selectedVisit.vitals ? selectedVisit.vitals.temperature : 36.5}" required class="w-full h-10 px-3 bg-canvas rounded-xl font-mono text-body-default text-ink shadow-inner focus:outline-none focus:ring-2 focus:ring-brand">
                  </div>
                  <div>
                    <label class="block font-body-strong mb-1 text-ink text-caption">Laju Nafas (x/m)</label>
                    <input type="number" id="vitals-rr" value="${selectedVisit.vitals ? selectedVisit.vitals.respiratoryRate : 18}" required class="w-full h-10 px-3 bg-canvas rounded-xl font-mono text-body-default text-ink shadow-inner focus:outline-none focus:ring-2 focus:ring-brand">
                  </div>
                  <div>
                    <label class="block font-body-strong mb-1 text-ink text-caption">SpO2 (%)</label>
                    <input type="number" id="vitals-spo2" value="${selectedVisit.vitals ? selectedVisit.vitals.spo2 : 98}" required class="w-full h-10 px-3 bg-canvas rounded-xl font-mono text-body-default text-ink shadow-inner focus:outline-none focus:ring-2 focus:ring-brand">
                  </div>
                  <div>
                    <label class="block font-body-strong mb-1 text-ink text-caption">Tinggi (cm)</label>
                    <input type="number" id="vitals-height" value="${selectedVisit.vitals ? selectedVisit.vitals.height : 165}" required class="w-full h-10 px-3 bg-canvas rounded-xl font-mono text-body-default text-ink shadow-inner focus:outline-none focus:ring-2 focus:ring-brand">
                  </div>
                  <div>
                    <label class="block font-body-strong mb-1 text-ink text-caption">Berat (kg)</label>
                    <input type="number" step="0.1" id="vitals-weight" value="${selectedVisit.vitals ? selectedVisit.vitals.weight : 65}" required class="w-full h-10 px-3 bg-canvas rounded-xl font-mono text-body-default text-ink shadow-inner focus:outline-none focus:ring-2 focus:ring-brand">
                  </div>
                </div>
              </div>

              <!-- Section 2: Skrining Awal & Triase -->
              <div class="flex flex-col gap-space-sm pt-space-xs">
                <div class="flex items-center gap-space-sm pb-space-xs border-b border-line/30">
                  <span class="w-6 h-6 rounded bg-brand-tint text-brand font-body-strong text-caption flex items-center justify-center font-bold">2</span>
                  <h4 class="font-headline-md text-headline-md text-ink font-bold uppercase tracking-wider text-[14px]">Skrining Awal &amp; Klasifikasi Triase</h4>
                </div>

                <div class="space-y-3">
                  <div>
                    <label class="block font-body-strong mb-1 text-ink text-caption">Keluhan Utama Pasien *</label>
                    <textarea id="triage-complaint" rows="2" required placeholder="Keluhan yang dirasakan saat ini..." class="w-full p-space-sm bg-canvas rounded-xl font-body-default text-body-default text-ink shadow-inner focus:outline-none focus:ring-2 focus:ring-brand">${selectedVisit.triage ? selectedVisit.triage.chiefComplaint : ""}</textarea>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                    <div>
                      <label class="block font-body-strong mb-1 text-ink text-caption">Risiko Jatuh</label>
                      <select id="triage-fall-risk" class="w-full h-10 px-3 bg-canvas rounded-xl font-body-default text-body-default text-ink focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer">
                        <option value="Rendah">Rendah</option>
                        <option value="Sedang">Sedang</option>
                        <option value="Tinggi">Tinggi</option>
                      </select>
                    </div>
                    <div>
                      <label class="block font-body-strong mb-1 text-ink text-caption">Skor Nyeri (VAS 0–10)</label>
                      <input type="number" min="0" max="10" id="triage-pain" value="${selectedVisit.triage ? selectedVisit.triage.painScore : 2}" class="w-full h-10 px-3 bg-canvas rounded-xl font-mono text-body-default text-ink shadow-inner focus:outline-none focus:ring-2 focus:ring-brand">
                    </div>
                    <div>
                      <label class="block font-body-strong mb-1 text-ink text-caption">Klasifikasi Triase (ESI)</label>
                      <select id="triage-outcome" class="w-full h-10 px-3 bg-canvas rounded-xl font-body-strong text-body-strong text-ink focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer">
                        <option value="Normal">🟢 Hijau (Normal)</option>
                        <option value="Perlu Perhatian">🟡 Kuning (Perhatian)</option>
                        <option value="Perlu Eskalasi">🔴 Merah (Eskalasi IGD)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label class="block font-body-strong mb-1 text-ink text-caption">Riwayat Alergi Obat / Makanan</label>
                    <input type="text" id="triage-allergies" value="${selectedVisit.triage ? selectedVisit.triage.allergies : "Tidak ada riwayat alergi"}" class="w-full h-10 px-3 bg-canvas rounded-xl font-body-default text-body-default text-ink shadow-inner focus:outline-none focus:ring-2 focus:ring-brand">
                  </div>
                </div>
              </div>

              <!-- Submit Button Bar -->
              <div class="pt-space-sm border-t border-line/30 flex justify-end">
                <button type="submit" class="h-10 px-space-lg bg-brand hover:bg-brand-strong text-on-primary rounded-xl font-body-strong text-body-strong shadow-sm transition-colors flex items-center gap-2">
                  <span class="material-symbols-outlined text-[18px]">send</span>
                  <span>Simpan TTV &amp; Route ke Dokter</span>
                </button>
              </div>

            </form>
          `}
        </div>

      </div>
    </div>
  `;
}

// ========================================================
// WORKSPACE 3: DOKTER (SOAP Clinical Encounter)
// ========================================================
function renderDokterWorkspace(container) {
  let visits = VisitStateService.getVisits();
  if (searchQuery) {
    visits = visits.filter(v => 
      (v.patientName && v.patientName.toLowerCase().includes(searchQuery)) ||
      (v.mrNo && v.mrNo.toLowerCase().includes(searchQuery)) ||
      (v.ticketNo && v.ticketNo.toLowerCase().includes(searchQuery)) ||
      (v.departmentName && v.departmentName.toLowerCase().includes(searchQuery))
    );
  }
  const doctorQueue = visits.filter(v => 
    v.visitStatus === "WAITING_DOCTOR" || 
    v.visitStatus === "IN_SERVICE" || 
    v.visitStatus === "WAITING_RESULTS"
  );

  let activeVisit = visits.find(v => v.id === activeDoctorConsultationVisitId) || doctorQueue[0] || visits[0];

  container.innerHTML = `
    <div class="flex flex-col gap-space-lg w-full">
      <!-- Breadcrumb & Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
        <div class="flex flex-col">
          <div class="flex items-center gap-2 text-ink-soft text-caption font-caption mb-1">
            <span>Rawat Jalan</span>
            <span class="material-symbols-outlined text-[14px]">chevron_right</span>
            <span class="text-ink font-body-strong">Pelayanan Dokter</span>
          </div>
          <div class="flex items-center gap-space-sm">
            <h1 class="font-headline-lg text-headline-lg text-ink font-bold tracking-tight">Ruang Konsultasi &amp; Rekam Medis (RME)</h1>
            <div class="flex items-center gap-1.5 px-2.5 py-1 bg-brand-tint rounded-full text-brand-strong font-caption text-caption font-semibold">
              <span class="w-1.5 h-1.5 rounded-full bg-brand"></span>
              <span>dr. Hendra Pratama, Sp.PD</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-space-sm">
          <button onclick="callTicket('${activeVisit.ticketNo}', '${activeVisit.departmentName}')" class="h-10 px-space-md rounded-xl bg-surface hover:bg-brand-tint border border-line text-brand font-body-strong text-body-strong flex items-center gap-1.5 transition shadow-sm">
            <span class="material-symbols-outlined text-[18px]">volume_up</span>
            <span>Panggil Tiket: ${activeVisit.ticketNo}</span>
          </button>
          <button onclick="printResumeMedis('${activeVisit.id}')" class="h-10 px-space-md rounded-xl bg-surface hover:bg-surface-container-low border border-line text-ink font-body-default text-body-default flex items-center gap-1.5 transition shadow-sm">
            <span class="material-symbols-outlined text-[18px]">print</span>
            <span>Resume Medis</span>
          </button>
        </div>
      </div>

      <!-- 2-Column Workstation Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        
        <!-- Column 1: Doctor's Queue (4 cols) -->
        <div class="lg:col-span-4 bg-surface rounded-xl shadow-sm border border-line/30 p-space-lg flex flex-col gap-space-md">
          <div class="flex items-center justify-between pb-space-sm border-b border-line/40">
            <span class="font-headline-md text-headline-md text-ink font-bold flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[20px] text-brand">format_list_bulleted</span>
              <span>Antrian Poli Dokter</span>
            </span>
            <span class="font-mono text-caption text-brand-strong font-bold bg-brand-tint px-2 py-0.5 rounded">${doctorQueue.length}</span>
          </div>

          <div class="flex flex-col gap-space-xs max-h-[600px] overflow-y-auto">
            ${doctorQueue.length === 0 ? '<p class="font-caption text-caption text-ink-soft py-6 text-center">Tidak ada antrian dokter saat ini.</p>' : ''}
            ${doctorQueue.map(v => `
              <div onclick="selectDoctorVisit('${v.id}')" class="p-space-sm rounded-xl border cursor-pointer transition ${
                activeVisit.id === v.id ? 'border-brand bg-brand-tint/40 shadow-sm' : 'border-line/40 hover:bg-surface-container-low'
              }">
                <div class="flex items-center justify-between">
                  <span class="font-mono font-bold text-caption text-brand bg-surface px-1.5 py-0.5 rounded shadow-sm">${v.ticketNo}</span>
                  ${renderStatusChip(v.visitStatus)}
                </div>
                <h4 class="font-body-strong text-body-strong text-ink mt-1 truncate">${v.patientName}</h4>
                <p class="font-caption text-caption text-ink-soft font-mono mt-0.5">${v.mrNo} · ${v.payerType}</p>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Column 2 & 3: Active Encounter (8 cols) -->
        <div class="lg:col-span-8 bg-surface rounded-xl shadow-sm border border-line/30 p-space-lg flex flex-col gap-space-md">
          
          <!-- Sticky Patient Banner -->
          <div class="p-space-md bg-surface-container-low rounded-xl border border-line/30 flex items-center justify-between flex-wrap gap-space-md">
            <div>
              <span class="font-headline-md text-headline-md font-bold text-ink block">${activeVisit.patientName}</span>
              <span class="font-caption text-caption text-ink-soft font-mono">${activeVisit.mrNo} · ${activeVisit.payerType}</span>
            </div>
            <div class="flex items-center gap-space-md text-right">
              <div>
                <span class="font-caption text-caption text-ink-soft block">TTV Terakhir:</span>
                <span class="font-mono font-bold text-caption text-ink">${activeVisit.vitals ? `${activeVisit.vitals.systolic}/${activeVisit.vitals.diastolic} mmHg · ${activeVisit.vitals.temperature}°C` : '-'}</span>
              </div>
              <div class="border-l border-line/40 pl-space-md">
                <span class="font-caption text-caption text-ink-soft block">Alergi:</span>
                <span class="font-semibold text-caption text-danger">${activeVisit.triage ? activeVisit.triage.allergies : '-'}</span>
              </div>
            </div>
          </div>

          <!-- SOAP Clinical Documentation -->
          <div class="space-y-4 font-body-default text-body-default">
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
              <div>
                <label class="block font-body-strong mb-1 text-ink text-caption">Subjective (Anamnesis &amp; Keluhan) *</label>
                <textarea id="doctor-soap-s" rows="3" class="w-full p-space-sm bg-canvas rounded-xl font-body-default text-body-default text-ink shadow-inner focus:outline-none focus:ring-2 focus:ring-brand leading-relaxed" placeholder="Keluhan utama, riwayat penyakit sekarang...">${activeVisit.encounter ? activeVisit.encounter.subjective : ""}</textarea>
              </div>
              <div>
                <label class="block font-body-strong mb-1 text-ink text-caption">Objective (Pemeriksaan Fisik) *</label>
                <textarea id="doctor-soap-o" rows="3" class="w-full p-space-sm bg-canvas rounded-xl font-body-default text-body-default text-ink shadow-inner focus:outline-none focus:ring-2 focus:ring-brand leading-relaxed" placeholder="Status generalis, kepala/leher, thoraks, abdomen...">${activeVisit.encounter ? activeVisit.encounter.objective : ""}</textarea>
              </div>
            </div>

            <!-- ICD-10 Assessment -->
            <div>
              <label class="block font-body-strong mb-1 text-ink text-caption">Assessment (Diagnosis ICD-10) *</label>
              <select id="doctor-icd10" class="w-full h-10 px-3 bg-canvas rounded-xl font-body-default text-body-default text-ink focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer">
                ${SIMRS_MASTER_DATA.icd10.map(icd => `
                  <option value="${icd.code}" ${activeVisit.encounter && activeVisit.encounter.primaryDiagnosis && activeVisit.encounter.primaryDiagnosis.code === icd.code ? 'selected' : ''}>
                    ${icd.code} - ${icd.name} (${icd.category})
                  </option>
                `).join("")}
              </select>
            </div>

            <!-- Plan / Instruksi -->
            <div>
              <label class="block font-body-strong mb-1 text-ink text-caption">Plan (Instruksi &amp; Edukasi Pasien) *</label>
              <textarea id="doctor-soap-p" rows="2" class="w-full p-space-sm bg-canvas rounded-xl font-body-default text-body-default text-ink shadow-inner focus:outline-none focus:ring-2 focus:ring-brand leading-relaxed" placeholder="Edukasi diet, jadwal kontrol ulang...">${activeVisit.encounter ? activeVisit.encounter.plan : ""}</textarea>
            </div>

            <!-- Orders Grid: Lab Order & Prescription -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-space-sm pt-space-xs border-t border-line/30">
              
              <!-- Lab Order Panel -->
              <div class="p-space-md bg-surface-container-low rounded-xl border border-line/30">
                <span class="font-body-strong text-body-strong text-ink block mb-2 flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[18px] text-brand">science</span>
                  <span>Permintaan Uji Laboratorium</span>
                </span>
                <select id="doctor-lab-select" class="w-full h-10 px-3 bg-surface rounded-xl font-body-default text-body-default border border-line/40 mb-2 cursor-pointer shadow-sm">
                  <option value="">-- Pilih Tes Laboratorium --</option>
                  ${SIMRS_MASTER_DATA.labTests.map(l => `<option value="${l.id}">${l.name} (Rp ${l.price.toLocaleString("id-ID")})</option>`).join("")}
                </select>
                <div class="space-y-1">
                  ${(activeVisit.encounter && activeVisit.encounter.labOrders || []).map(lo => `
                    <div class="p-2 bg-surface rounded-xl border border-line/40 flex justify-between text-caption shadow-sm">
                      <span class="font-body-default">${lo.testName}</span>
                      <span class="font-semibold ${lo.status === 'Completed' ? 'text-success' : 'text-warning'}">${lo.status}</span>
                    </div>
                  `).join("")}
                </div>
              </div>

              <!-- E-Resep Panel -->
              <div class="p-space-md bg-surface-container-low rounded-xl border border-line/30">
                <span class="font-body-strong text-body-strong text-ink block mb-2 flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[18px] text-brand">prescriptions</span>
                  <span>E-Resep Elektronik (R/)</span>
                </span>
                <select id="doctor-med-select" class="w-full h-10 px-3 bg-surface rounded-xl font-body-default text-body-default border border-line/40 mb-2 cursor-pointer shadow-sm">
                  <option value="">-- Pilih Obat Formularium --</option>
                  ${SIMRS_MASTER_DATA.medicines.map(m => `<option value="${m.id}">${m.name} (${m.form})</option>`).join("")}
                </select>
                <div class="space-y-1">
                  ${(activeVisit.encounter && activeVisit.encounter.prescriptions || []).map(rx => `
                    <div class="p-2 bg-surface rounded-xl border border-line/40 flex justify-between text-caption shadow-sm">
                      <span class="font-body-default">${rx.medicineName} (${rx.dosage})</span>
                      <span class="font-mono text-ink-soft">${rx.qty} tab</span>
                    </div>
                  `).join("")}
                </div>
              </div>

            </div>

            <!-- Action Buttons Footer -->
            <div class="pt-space-md border-t border-line/30 flex items-center justify-between flex-wrap gap-space-sm">
              <span class="font-caption text-caption text-ink-soft">
                ${activeVisit.encounter && activeVisit.encounter.isFinalized 
                  ? '<span class="text-success font-semibold flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">check_circle</span> Encounter Terfinalisasi</span>' 
                  : '<span class="text-warning font-medium">Status Draft · Klik Finalisasi setelah pemeriksaan selesai</span>'}
              </span>

              <div class="flex items-center gap-space-sm">
                <button onclick="handleDoctorSaveEncounter('${activeVisit.id}', false)" class="h-10 px-space-md bg-surface border border-line hover:bg-surface-container-low text-ink rounded-xl font-body-strong text-body-strong transition-colors shadow-sm">
                  Simpan Draft
                </button>
                <button onclick="handleDoctorSaveEncounter('${activeVisit.id}', true)" class="h-10 px-space-lg bg-brand hover:bg-brand-strong text-on-primary rounded-xl font-body-strong text-body-strong transition-colors flex items-center gap-2 shadow-sm">
                  <span class="material-symbols-outlined text-[18px]">done_all</span>
                  <span>Finalisasi Encounter</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  `;
}

function selectDoctorVisit(visitId) {
  activeDoctorConsultationVisitId = visitId;
  const visit = VisitStateService.findVisitById(visitId);
  if (visit && visit.visitStatus === "WAITING_DOCTOR") {
    try {
      DoctorService.startService(visitId);
    } catch (e) {
      console.warn("Could not transition to IN_SERVICE automatically:", e);
    }
  }
  renderDokterWorkspace(document.getElementById("main-viewport"));
}

// ========================================================
// WORKSPACE 4: LABORATORIUM (Laboratory User)
// ========================================================
function renderLabWorkspace(container) {
  let labOrders = LabService.getPendingOrders();
  if (searchQuery) {
    labOrders = labOrders.filter(o => 
      (o.patientName && o.patientName.toLowerCase().includes(searchQuery)) ||
      (o.mrNo && o.mrNo.toLowerCase().includes(searchQuery)) ||
      (o.orderNo && o.orderNo.toLowerCase().includes(searchQuery))
    );
  }
  const pendingCount = labOrders.filter(o => o.status === 'Pending').length;

  container.innerHTML = `
    <div class="flex flex-col gap-space-lg w-full">
      <!-- Breadcrumb & Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
        <div class="flex flex-col">
          <div class="flex items-center gap-2 text-ink-soft text-caption font-caption mb-1">
            <span>Rawat Jalan</span>
            <span class="material-symbols-outlined text-[14px]">chevron_right</span>
            <span class="text-ink font-body-strong">Laboratorium</span>
          </div>
          <div class="flex items-center gap-space-sm">
            <h1 class="font-headline-lg text-headline-lg text-ink font-bold tracking-tight">Pelayanan Laboratorium Patologi Klinik</h1>
            <div class="flex items-center gap-1.5 px-2.5 py-1 bg-brand-tint rounded-full text-brand-strong font-caption text-caption font-semibold">
              <span class="w-1.5 h-1.5 rounded-full bg-brand"></span>
              <span>Petugas Lab</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-xl text-caption font-caption">
          <span class="text-ink-soft">Order Menunggu:</span>
          <strong class="text-warning font-mono font-bold text-body-strong">${pendingCount}</strong>
          <span class="text-ink-soft">pemeriksaan</span>
        </div>
      </div>

      <!-- Main Card with Table -->
      <div class="bg-surface rounded-xl shadow-sm border border-line/30 overflow-hidden flex flex-col">
        <div class="px-space-lg py-space-md border-b border-line/40 flex items-center justify-between bg-surface">
          <span class="font-headline-md text-headline-md text-ink font-bold flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px] text-brand">science</span>
            <span>Permintaan Tes Laboratorium dari Dokter Poliklinik</span>
          </span>
          <span class="font-caption text-caption text-ink-soft font-mono">Live Sync Frappe Healthcare</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left font-body-default text-body-default border-collapse">
            <thead>
              <tr class="bg-canvas/60 border-b border-line/40 text-ink-soft font-semibold text-caption uppercase tracking-wider">
                <th class="py-space-md px-space-lg">Pasien &amp; No. RM</th>
                <th class="py-space-md px-space-lg">Nama Pemeriksaan</th>
                <th class="py-space-md px-space-lg">Dokter Pengirim</th>
                <th class="py-space-md px-space-lg">Status</th>
                <th class="py-space-md px-space-lg text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line/30">
              ${labOrders.length === 0 ? `
                <tr>
                  <td colspan="5" class="py-12 text-center text-ink-soft text-body-default">
                    Tidak ada permintaan tes laboratorium yang tertunda saat ini.
                  </td>
                </tr>
              ` : ''}
              ${labOrders.map(o => `
                <tr class="hover:bg-canvas/30 transition-colors">
                  <td class="py-space-md px-space-lg">
                    <span class="font-body-strong text-ink block">${o.patientName}</span>
                    <span class="font-mono text-caption text-ink-soft">${o.mrNo}</span>
                  </td>
                  <td class="py-space-md px-space-lg font-medium text-ink">${o.testName}</td>
                  <td class="py-space-md px-space-lg text-ink-soft">${o.practitionerName}</td>
                  <td class="py-space-md px-space-lg">
                    <span class="px-2.5 py-0.5 rounded-full text-caption font-semibold ${
                      o.status === 'Completed' ? 'bg-success-tint text-success' : 'bg-warning-tint text-warning'
                    }">
                      ${o.status === 'Completed' ? 'Selesai' : 'Menunggu Sampel'}
                    </span>
                  </td>
                  <td class="py-space-md px-space-lg text-right">
                    ${o.status === 'Completed' ? `
                      <button onclick="printHasilLab('${o.visitId}', ${o.orderIndex})" class="h-8 px-3 bg-surface hover:bg-canvas border border-line/50 text-ink rounded-lg font-caption text-caption font-medium transition-colors shadow-xs">
                        Lihat Hasil
                      </button>
                    ` : `
                      <button onclick="openLabInputModal('${o.visitId}', ${o.orderIndex}, '${o.testName}')" class="h-8 px-3.5 bg-brand hover:bg-brand-strong text-on-primary rounded-lg font-caption text-caption font-semibold transition-colors shadow-xs">
                        Input Hasil
                      </button>
                    `}
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ========================================================
// WORKSPACE 5: FARMASI (Pharmacist Telaah & Dispense)
// ========================================================
function renderFarmasiWorkspace(container) {
  const visits = VisitStateService.getVisits();
  let pharmacyVisits = visits.filter(v => v.hasPrescription && v.encounter && v.encounter.prescriptions.length > 0);
  if (searchQuery) {
    pharmacyVisits = pharmacyVisits.filter(v => 
      (v.patientName && v.patientName.toLowerCase().includes(searchQuery)) ||
      (v.mrNo && v.mrNo.toLowerCase().includes(searchQuery)) ||
      (v.ticketNo && v.ticketNo.toLowerCase().includes(searchQuery)) ||
      (v.id && v.id.toLowerCase().includes(searchQuery))
    );
  }
  const pendingCount = pharmacyVisits.filter(v => v.pharmacyStatus !== 'Dispensed').length;

  container.innerHTML = `
    <div class="flex flex-col gap-space-lg w-full">
      <!-- Breadcrumb & Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
        <div class="flex flex-col">
          <div class="flex items-center gap-2 text-ink-soft text-caption font-caption mb-1">
            <span>Rawat Jalan</span>
            <span class="material-symbols-outlined text-[14px]">chevron_right</span>
            <span class="text-ink font-body-strong">Farmasi &amp; Apotek</span>
          </div>
          <div class="flex items-center gap-space-sm">
            <h1 class="font-headline-lg text-headline-lg text-ink font-bold tracking-tight">Farmasi Rawat Jalan &amp; Telaah Resep 7-Benar</h1>
            <div class="flex items-center gap-1.5 px-2.5 py-1 bg-brand-tint rounded-full text-brand-strong font-caption text-caption font-semibold">
              <span class="w-1.5 h-1.5 rounded-full bg-brand"></span>
              <span>Apoteker Klinis</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-xl text-caption font-caption">
          <span class="text-ink-soft">Menunggu Penyerahan:</span>
          <strong class="text-warning font-mono font-bold text-body-strong">${pendingCount}</strong>
          <span class="text-ink-soft">resep</span>
        </div>
      </div>

      <!-- Main Card with Table -->
      <div class="bg-surface rounded-xl shadow-sm border border-line/30 overflow-hidden flex flex-col">
        <div class="px-space-lg py-space-md border-b border-line/40 flex items-center justify-between bg-surface">
          <span class="font-headline-md text-headline-md text-ink font-bold flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px] text-brand">prescriptions</span>
            <span>Antrian Resep Elektronik Dokter (e-Prescribing)</span>
          </span>
          <span class="font-caption text-caption text-ink-soft font-mono">ADR FR-PHA-001</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left font-body-default text-body-default border-collapse">
            <thead>
              <tr class="bg-canvas/60 border-b border-line/40 text-ink-soft font-semibold text-caption uppercase tracking-wider">
                <th class="py-space-md px-space-lg">Tiket Farmasi</th>
                <th class="py-space-md px-space-lg">Pasien &amp; No. RM</th>
                <th class="py-space-md px-space-lg">Rincian Obat (R/)</th>
                <th class="py-space-md px-space-lg">Dokter Penulis</th>
                <th class="py-space-md px-space-lg">Status Telaah</th>
                <th class="py-space-md px-space-lg text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line/30">
              ${pharmacyVisits.length === 0 ? `
                <tr>
                  <td colspan="6" class="py-12 text-center text-ink-soft text-body-default">
                    Belum ada antrian resep dokter untuk rawat jalan hari ini.
                  </td>
                </tr>
              ` : ''}
              ${pharmacyVisits.map(v => `
                <tr class="hover:bg-canvas/30 transition-colors">
                  <td class="py-space-md px-space-lg">
                    <span class="font-mono font-bold text-caption text-brand px-2.5 py-1 bg-brand-tint rounded-full">
                      ${v.pharmacyTicket || v.ticketNo}
                    </span>
                  </td>
                  <td class="py-space-md px-space-lg">
                    <span class="font-body-strong text-ink block">${v.patientName}</span>
                    <span class="font-mono text-caption text-ink-soft">${v.mrNo}</span>
                  </td>
                  <td class="py-space-md px-space-lg">
                    <div class="flex flex-col gap-1">
                      ${v.encounter.prescriptions.map(rx => `
                        <div class="flex items-center gap-1.5 text-caption">
                          <span class="font-body-strong text-ink">${rx.medicineName}</span>
                          <span class="text-ink-soft">(${rx.dosage})</span>
                          <span class="font-mono text-brand font-semibold">· ${rx.qty} tab</span>
                        </div>
                      `).join("")}
                    </div>
                  </td>
                  <td class="py-space-md px-space-lg text-ink-soft text-caption">
                    <span class="font-medium text-ink block">${v.practitionerName}</span>
                    <span class="text-ink-soft text-caption">${v.departmentName}</span>
                  </td>
                  <td class="py-space-md px-space-lg">
                    <span class="px-2.5 py-0.5 rounded-full text-caption font-semibold ${
                      v.pharmacyStatus === 'Dispensed' ? 'bg-success-tint text-success' : 'bg-warning-tint text-warning'
                    }">
                      ${v.pharmacyStatus === 'Dispensed' ? 'Diserahkan' : 'Menunggu Dispense'}
                    </span>
                  </td>
                  <td class="py-space-md px-space-lg text-right space-x-1.5 whitespace-nowrap">
                    <button onclick="callTicket('${v.pharmacyTicket || v.ticketNo}', 'Loket Pengambilan Obat Farmasi')" class="h-8 px-2.5 rounded-lg border border-line/50 bg-surface hover:bg-brand-tint text-brand transition-colors shadow-xs" title="Panggil Pasien">
                      <span class="material-symbols-outlined text-[16px]">volume_up</span>
                    </button>
                    ${v.pharmacyStatus !== 'Dispensed' ? `
                      <button onclick="handlePharmacyDispense('${v.id}')" class="h-8 px-3.5 bg-brand hover:bg-brand-strong text-on-primary rounded-lg font-caption text-caption font-semibold transition-colors shadow-xs">
                        Dispense &amp; Serahkan
                      </button>
                    ` : `
                      <span class="inline-flex items-center gap-1 text-caption text-success font-semibold px-2 py-1 bg-success-tint rounded-lg">
                        <span class="material-symbols-outlined text-[14px]">check</span>
                        <span>Selesai</span>
                      </span>
                    `}
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ========================================================
// WORKSPACE 6: KASIR & BILLING (Billing Aggregator)
// ========================================================
function renderKasirWorkspace(container) {
  const visits = VisitStateService.getVisits();
  let readyForBilling = visits.filter(v => v.visitStatus === "SERVICE_COMPLETED" || v.billingStatus === "Paid");
  if (searchQuery) {
    readyForBilling = readyForBilling.filter(v => 
      (v.patientName && v.patientName.toLowerCase().includes(searchQuery)) ||
      (v.mrNo && v.mrNo.toLowerCase().includes(searchQuery)) ||
      (v.ticketNo && v.ticketNo.toLowerCase().includes(searchQuery)) ||
      (v.id && v.id.toLowerCase().includes(searchQuery))
    );
  }
  const unpaidCount = readyForBilling.filter(v => v.billingStatus !== 'Paid').length;
  const paidCount = readyForBilling.filter(v => v.billingStatus === 'Paid').length;

  container.innerHTML = `
    <div class="flex flex-col gap-space-lg w-full">
      <!-- Breadcrumb & Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
        <div class="flex flex-col">
          <div class="flex items-center gap-2 text-ink-soft text-caption font-caption mb-1">
            <span>Rawat Jalan</span>
            <span class="material-symbols-outlined text-[14px]">chevron_right</span>
            <span class="text-ink font-body-strong">Kasir &amp; Billing</span>
          </div>
          <div class="flex items-center gap-space-sm">
            <h1 class="font-headline-lg text-headline-lg text-ink font-bold tracking-tight">Kasir Rawat Jalan &amp; Billing Aggregator</h1>
            <div class="flex items-center gap-1.5 px-2.5 py-1 bg-brand-tint rounded-full text-brand-strong font-caption text-caption font-semibold">
              <span class="w-1.5 h-1.5 rounded-full bg-brand"></span>
              <span>Kasir Rawat Jalan</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-space-sm">
          <div class="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-xl text-caption font-caption">
            <span class="text-ink-soft">Siap Bayar:</span>
            <strong class="text-warning font-mono font-bold text-body-strong">${unpaidCount}</strong>
          </div>
          <div class="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-xl text-caption font-caption">
            <span class="text-ink-soft">Lunas:</span>
            <strong class="text-success font-mono font-bold text-body-strong">${paidCount}</strong>
          </div>
        </div>
      </div>

      <!-- Main Billing Table Card -->
      <div class="bg-surface rounded-xl shadow-sm border border-line/30 overflow-hidden flex flex-col">
        <div class="px-space-lg py-space-md border-b border-line/40 flex items-center justify-between bg-surface">
          <span class="font-headline-md text-headline-md text-ink font-bold flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px] text-brand">payments</span>
            <span>Tagihan Kunjungan Rawat Jalan (docs/data-model.md §9)</span>
          </span>
          <span class="font-caption text-caption text-ink-soft font-mono">Sales Invoice Frappe</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left font-body-default text-body-default border-collapse">
            <thead>
              <tr class="bg-canvas/60 border-b border-line/40 text-ink-soft font-semibold text-caption uppercase tracking-wider">
                <th class="py-space-md px-space-lg">Tiket Kasir</th>
                <th class="py-space-md px-space-lg">Pasien &amp; No. RM</th>
                <th class="py-space-md px-space-lg">Penjamin</th>
                <th class="py-space-md px-space-lg text-right">Subtotal</th>
                <th class="py-space-md px-space-lg text-right">Ditanggung</th>
                <th class="py-space-md px-space-lg text-right">Bayar Mandiri</th>
                <th class="py-space-md px-space-lg">Status</th>
                <th class="py-space-md px-space-lg text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line/30">
              ${readyForBilling.length === 0 ? `
                <tr>
                  <td colspan="8" class="py-12 text-center text-ink-soft text-body-default">
                    Belum ada kunjungan yang siap untuk proses kasir / billing.
                  </td>
                </tr>
              ` : ''}
              ${readyForBilling.map(v => {
                const inv = BillingService.aggregateInvoice(v.id);
                return `
                  <tr class="hover:bg-canvas/30 transition-colors">
                    <td class="py-space-md px-space-lg font-mono font-bold text-caption text-brand">
                      <span class="px-2.5 py-1 bg-brand-tint rounded-full">
                        ${v.cashierTicket || v.ticketNo}
                      </span>
                    </td>
                    <td class="py-space-md px-space-lg">
                      <span class="font-body-strong text-ink block">${v.patientName}</span>
                      <span class="font-mono text-caption text-ink-soft">${v.mrNo}</span>
                    </td>
                    <td class="py-space-md px-space-lg">
                      <span class="px-2.5 py-0.5 rounded-full text-caption font-semibold ${
                        v.payerType === 'BPJS' ? 'bg-info-tint text-info' : 'bg-surface-container-low text-ink-soft'
                      }">
                        ${v.payerType}
                      </span>
                    </td>
                    <td class="py-space-md px-space-lg text-right font-mono tabular-nums text-caption text-ink-soft">
                      Rp ${inv.subtotal.toLocaleString('id-ID')}
                    </td>
                    <td class="py-space-md px-space-lg text-right font-mono tabular-nums text-caption text-success font-medium">
                      Rp ${inv.coveredAmount.toLocaleString('id-ID')}
                    </td>
                    <td class="py-space-md px-space-lg text-right font-mono tabular-nums text-body-strong font-bold text-ink">
                      Rp ${inv.patientPayAmount.toLocaleString('id-ID')}
                    </td>
                    <td class="py-space-md px-space-lg">
                      <span class="px-2.5 py-0.5 rounded-full text-caption font-semibold ${
                        v.billingStatus === 'Paid' ? 'bg-success-tint text-success' : 'bg-warning-tint text-warning'
                      }">
                        ${v.billingStatus === 'Paid' ? 'Lunas' : 'Belum Bayar'}
                      </span>
                    </td>
                    <td class="py-space-md px-space-lg text-right space-x-1.5 whitespace-nowrap">
                      <button onclick="callTicket('${v.cashierTicket || v.ticketNo}', 'Loket Pembayaran Kasir')" class="h-8 px-2.5 rounded-lg border border-line/50 bg-surface hover:bg-brand-tint text-brand transition-colors shadow-xs" title="Panggil Antrian Kasir">
                        <span class="material-symbols-outlined text-[16px]">volume_up</span>
                      </button>
                      ${v.billingStatus !== 'Paid' ? `
                        <button onclick="handleCashierPayment('${v.id}')" class="h-8 px-3.5 bg-brand hover:bg-brand-strong text-on-primary rounded-lg font-caption text-caption font-semibold transition-colors shadow-xs">
                          Bayar &amp; Kwitansi
                        </button>
                      ` : `
                        <button onclick="printKwitansi('${v.id}')" class="h-8 px-3 bg-surface hover:bg-canvas border border-line/50 text-ink rounded-lg font-caption text-caption font-medium transition-colors shadow-xs">
                          Cetak Kwitansi
                        </button>
                      `}
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ========================================================
// WORKSPACE 7: MONITORING & SUPERVISOR (SLA Dashboard)
// ========================================================
function renderMonitoringWorkspace(container) {
  let visits = VisitStateService.getVisits();
  if (searchQuery) {
    visits = visits.filter(v => 
      (v.patientName && v.patientName.toLowerCase().includes(searchQuery)) ||
      (v.mrNo && v.mrNo.toLowerCase().includes(searchQuery)) ||
      (v.ticketNo && v.ticketNo.toLowerCase().includes(searchQuery)) ||
      (v.departmentName && v.departmentName.toLowerCase().includes(searchQuery)) ||
      (v.practitionerName && v.practitionerName.toLowerCase().includes(searchQuery))
    );
  }

  container.innerHTML = `
    <div class="flex flex-col gap-space-lg w-full">
      <!-- Breadcrumb & Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
        <div class="flex flex-col">
          <div class="flex items-center gap-2 text-ink-soft text-caption font-caption mb-1">
            <span>Rawat Jalan</span>
            <span class="material-symbols-outlined text-[14px]">chevron_right</span>
            <span class="text-ink font-body-strong">Monitoring &amp; Supervisor</span>
          </div>
          <div class="flex items-center gap-space-sm">
            <h1 class="font-headline-lg text-headline-lg text-ink font-bold tracking-tight">Dashboard Pemantauan Mutu &amp; Kinerja Rawat Jalan</h1>
            <div class="flex items-center gap-1.5 px-2.5 py-1 bg-brand-tint rounded-full text-brand-strong font-caption text-caption font-semibold">
              <span class="w-1.5 h-1.5 rounded-full bg-brand"></span>
              <span>Supervisor Klinis</span>
            </div>
          </div>
        </div>
        <span class="font-caption text-caption text-ink-soft">Real-time KPI Tracking</span>
      </div>

      <!-- KPI Metrics Cards Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-space-md">
        <div class="bg-surface p-space-lg rounded-xl border border-line/30 shadow-xs flex flex-col justify-between">
          <span class="text-caption font-caption text-ink-soft font-medium">Rata-rata Waktu Tunggu</span>
          <div class="my-2">
            <span class="text-3xl font-extrabold text-success font-mono tracking-tight">18 <span class="text-sm font-normal">mnt</span></span>
          </div>
          <span class="text-[12px] text-ink-soft flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px] text-success">check</span>
            <span>Target Kemenkes &lt; 60 mnt</span>
          </span>
        </div>

        <div class="bg-surface p-space-lg rounded-xl border border-line/30 shadow-xs flex flex-col justify-between">
          <span class="text-caption font-caption text-ink-soft font-medium">Pasien Aktif di Poli</span>
          <div class="my-2">
            <span class="text-3xl font-extrabold text-ink font-mono tracking-tight">
              ${visits.filter(v => v.visitStatus === 'IN_SERVICE').length}
            </span>
          </div>
          <span class="text-[12px] text-ink-soft">Sedang berkonsultasi dengan dokter</span>
        </div>

        <div class="bg-surface p-space-lg rounded-xl border border-line/30 shadow-xs flex flex-col justify-between">
          <span class="text-caption font-caption text-ink-soft font-medium">Kunjungan Selesai (CLOSED)</span>
          <div class="my-2">
            <span class="text-3xl font-extrabold text-brand font-mono tracking-tight">
              ${visits.filter(v => v.visitStatus === 'CLOSED').length}
            </span>
          </div>
          <span class="text-[12px] text-ink-soft">Selesai seluruh alur rawat jalan</span>
        </div>

        <div class="bg-surface p-space-lg rounded-xl border border-line/30 shadow-xs flex flex-col justify-between">
          <span class="text-caption font-caption text-ink-soft font-medium">Tingkat Kepatuhan SLA</span>
          <div class="my-2">
            <span class="text-3xl font-extrabold text-success font-mono tracking-tight">96.8%</span>
          </div>
          <span class="text-[12px] text-success font-medium">Standar Pelayanan Terpenuhi</span>
        </div>
      </div>

      <!-- Patient Flow Log -->
      <div class="bg-surface rounded-xl border border-line/30 shadow-sm p-space-lg space-y-space-md">
        <div class="flex items-center justify-between pb-space-sm border-b border-line/40">
          <h3 class="font-headline-md text-headline-md text-ink font-bold flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px] text-brand">timeline</span>
            <span>Timeline Perjalanan Pasien Hari Ini</span>
          </h3>
          <span class="font-caption text-caption text-ink-soft font-mono">Total Kunjungan: ${visits.length}</span>
        </div>

        <div class="space-y-space-sm">
          ${visits.map(v => `
            <div class="p-space-md bg-canvas/40 hover:bg-canvas/80 rounded-xl border border-line/30 flex flex-col md:flex-row md:items-center justify-between gap-space-sm transition-colors">
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-mono font-bold text-brand bg-brand-tint px-2.5 py-0.5 rounded-full text-caption">${v.ticketNo}</span>
                  <span class="font-body-strong text-ink">${v.patientName}</span>
                  <span class="text-caption text-ink-soft">(${v.departmentName})</span>
                </div>
                <div class="flex items-center gap-space-md text-caption text-ink-soft mt-1.5 font-mono">
                  <span>Daftar: ${v.checkedInAt ? new Date(v.checkedInAt).toLocaleTimeString('id-ID') : '-'}</span>
                  <span>Triase: ${v.triageCompletedAt ? new Date(v.triageCompletedAt).toLocaleTimeString('id-ID') : '-'}</span>
                  <span>Dokter: ${v.serviceStartedAt ? new Date(v.serviceStartedAt).toLocaleTimeString('id-ID') : '-'}</span>
                </div>
              </div>
              <div class="flex items-center gap-space-sm self-end md:self-auto">
                ${renderStatusChip(v.visitStatus)}
                <button onclick="handleSupervisorOverride('${v.id}')" class="h-8 px-3 bg-surface hover:bg-canvas border border-line/50 text-ink rounded-lg font-caption text-caption font-medium transition-colors shadow-xs">
                  Override Status
                </button>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

// ========================================================
// WORKSPACE 8: AUDIT KLINIS (Clinical Auditor Read-only)
// ========================================================
function renderAuditWorkspace(container) {
  const auditLogs = AuditService.getLogs();

  container.innerHTML = `
    <div class="flex flex-col gap-space-lg w-full">
      <!-- Breadcrumb & Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
        <div class="flex flex-col">
          <div class="flex items-center gap-2 text-ink-soft text-caption font-caption mb-1">
            <span>Rawat Jalan</span>
            <span class="material-symbols-outlined text-[14px]">chevron_right</span>
            <span class="text-ink font-body-strong">Audit Klinis</span>
          </div>
          <div class="flex items-center gap-space-sm">
            <h1 class="font-headline-lg text-headline-lg text-ink font-bold tracking-tight">Jejak Audit Aktivitas &amp; Rekam Medis</h1>
            <div class="flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-high rounded-full text-ink-soft font-caption text-caption font-semibold">
              <span class="w-1.5 h-1.5 rounded-full bg-ink-soft"></span>
              <span>Strictly Read-Only (ADR Hard Rule 7)</span>
            </div>
          </div>
        </div>
        <span class="font-caption text-caption text-ink-soft font-mono">Immutable Audit Trail</span>
      </div>

      <!-- Audit Trail Card -->
      <div class="bg-surface rounded-xl border border-line/30 shadow-sm p-space-lg space-y-space-md">
        <div class="flex items-center justify-between pb-space-sm border-b border-line/40">
          <h3 class="font-headline-md text-headline-md text-ink font-bold flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px] text-brand">history</span>
            <span>Log Audit Trail Sistem SIMRS Mini</span>
          </h3>
          <span class="font-caption text-caption text-ink-soft font-mono">Total Entri: ${auditLogs.length}</span>
        </div>

        <div class="space-y-2 max-h-[550px] overflow-y-auto pr-1">
          ${auditLogs.map(log => `
            <div class="p-space-md bg-canvas/40 hover:bg-canvas/80 rounded-xl border border-line/30 flex items-start justify-between gap-space-sm text-body-default transition-colors">
              <div class="flex items-start gap-space-sm">
                <div class="w-7 h-7 rounded-lg bg-surface-container-low flex items-center justify-center text-ink-soft shrink-0 mt-0.5">
                  <span class="material-symbols-outlined text-[16px]">receipt_long</span>
                </div>
                <div>
                  <p class="font-body-strong text-ink">${log.action}</p>
                  <span class="text-caption text-ink-soft">Petugas: <strong class="text-ink">${log.user}</strong> (${log.role})</span>
                </div>
              </div>
              <span class="font-mono text-caption text-ink-soft shrink-0">${log.timestamp}</span>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

// ========================================================
// WORKSPACE 9: QUEUE DISPLAY TV (Public TV Display - ZERO PHI)
// ========================================================
function renderDisplayWorkspace(container) {
  const latestCall = JSON.parse(localStorage.getItem("SIMRS_LATEST_CALL") || '{"ticketNo": "A-001", "destination": "Poli Penyakit Dalam"}');

  container.innerHTML = `
    <div class="bg-ink text-surface rounded-2xl p-space-xl space-y-space-xl border border-ink shadow-2xl">
      <!-- TV Header -->
      <div class="flex items-center justify-between pb-space-lg border-b border-line/20">
        <div class="flex items-center gap-space-md">
          <div class="w-12 h-12 rounded-xl bg-brand text-surface flex items-center justify-center shadow-sm">
            <span class="material-symbols-outlined text-[28px]">local_hospital</span>
          </div>
          <div>
            <h2 class="text-lg font-bold tracking-tight text-white">RS SEHAT MANDIRI NUSANTARA</h2>
            <p class="text-caption text-brand-tint/80 uppercase tracking-wider font-semibold">Papan Informasi Antrian Poliklinik Rawat Jalan</p>
          </div>
        </div>
        <div class="flex items-center gap-space-md">
          <div class="flex items-center gap-1.5 px-3 py-1 bg-surface/10 rounded-full text-caption font-mono text-brand-tint">
            <span class="w-2 h-2 rounded-full bg-success"></span>
            <span>Online</span>
          </div>
          <span class="px-3 py-1 rounded-full bg-danger-tint/20 text-danger-tint text-caption font-bold border border-danger/30">
            ZERO PHI: NOMOR TIKET SAJA
          </span>
        </div>
      </div>

      <!-- Called Ticket Big Banner -->
      <div class="bg-surface/5 p-space-xl rounded-2xl border-2 border-brand text-center relative overflow-hidden">
        <div class="absolute -top-12 -right-12 w-48 h-48 bg-brand/10 rounded-full blur-3xl pointer-events-none"></div>
        <span class="text-caption font-bold text-brand-tint uppercase tracking-widest block">
          NOMOR ANTRIAN DIPANGGIL
        </span>
        <div class="text-8xl font-black text-brand-tint my-4 font-mono tracking-widest">
          ${latestCall.ticketNo}
        </div>
        <p class="text-xl font-bold text-white tracking-wide">
          SILAKAN MENUJU KE: <span class="text-brand-tint underline decoration-brand/60 underline-offset-4">${latestCall.destination.toUpperCase()}</span>
        </p>
      </div>

      <!-- 4 Columns Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-space-md">
        <div class="p-space-lg rounded-xl bg-surface/5 border border-white/10 text-center">
          <span class="text-caption text-white/70 block mb-1 font-semibold uppercase tracking-wider">Loket Registrasi</span>
          <span class="text-4xl font-extrabold text-brand-tint font-mono block my-2">A-003</span>
          <span class="text-caption text-white/60 block">Loket Pendaftaran 1</span>
        </div>
        <div class="p-space-lg rounded-xl bg-surface/5 border border-white/10 text-center">
          <span class="text-caption text-white/70 block mb-1 font-semibold uppercase tracking-wider">Poli Penyakit Dalam</span>
          <span class="text-4xl font-extrabold text-brand-tint font-mono block my-2">A-001</span>
          <span class="text-caption text-white/60 block">Ruang Periksa 101</span>
        </div>
        <div class="p-space-lg rounded-xl bg-surface/5 border border-white/10 text-center">
          <span class="text-caption text-white/70 block mb-1 font-semibold uppercase tracking-wider">Farmasi / Apotek</span>
          <span class="text-4xl font-extrabold text-brand-tint font-mono block my-2">F-001</span>
          <span class="text-caption text-white/60 block">Loket Penyerahan Obat</span>
        </div>
        <div class="p-space-lg rounded-xl bg-surface/5 border border-white/10 text-center">
          <span class="text-caption text-white/70 block mb-1 font-semibold uppercase tracking-wider">Kasir &amp; Pembayaran</span>
          <span class="text-4xl font-extrabold text-brand-tint font-mono block my-2">K-001</span>
          <span class="text-caption text-white/60 block">Loket Kasir 1</span>
        </div>
      </div>

      <!-- TV Bottom Status Bar -->
      <div class="pt-space-md border-t border-line/20 flex items-center justify-between text-caption text-white/50">
        <span>Display publik ini mematuhi standar Zero-PHI (UU Perlindungan Data Pribadi No. 27/2022).</span>
        <span class="font-mono">SIMRS Mini v1.0</span>
      </div>
    </div>
  `;
}

// ========================================================
// WORKSPACE 10: KIOSK MANDIRI / APM (Touchscreen)
// ========================================================
function renderKioskWorkspace(container) {
  container.innerHTML = `
    <div class="max-w-xl mx-auto bg-surface rounded-2xl border border-line/30 p-space-xl text-center space-y-space-lg shadow-sm">
      <div class="w-16 h-16 rounded-2xl bg-brand-tint text-brand flex items-center justify-center mx-auto shadow-xs">
        <span class="material-symbols-outlined text-[36px]">touch_app</span>
      </div>
      <div>
        <h2 class="font-headline-lg text-headline-lg font-bold text-ink tracking-tight">Anjungan Pendaftaran Mandiri (APM)</h2>
        <p class="font-body-default text-body-default text-ink-soft mt-1">
          Sentuh salah satu pilihan di bawah untuk check-in janji atau pendaftaran baru.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-space-xs">
        <button onclick="handleKioskCheckin()" class="p-space-lg rounded-xl border-2 border-brand bg-brand-tint/40 hover:bg-brand-tint text-left transition-all shadow-xs flex flex-col justify-between">
          <div>
            <div class="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-brand mb-space-sm shadow-xs">
              <span class="material-symbols-outlined text-[24px]">qr_code_scanner</span>
            </div>
            <strong class="font-headline-md text-headline-md text-ink block">Sudah Ada Janji</strong>
            <span class="font-caption text-caption text-ink-soft mt-1 block">Check-in Kode Booking / Rujukan</span>
          </div>
          <span class="mt-space-md inline-flex items-center gap-1 text-caption text-brand font-bold">
            <span>Sentuh di sini</span>
            <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
          </span>
        </button>

        <button onclick="openNewPatientModal()" class="p-space-lg rounded-xl border border-line/40 bg-surface hover:bg-canvas text-left transition-all shadow-xs flex flex-col justify-between">
          <div>
            <div class="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-ink-soft mb-space-sm">
              <span class="material-symbols-outlined text-[24px]">person_add</span>
            </div>
            <strong class="font-headline-md text-headline-md text-ink block">Pasien Baru / Walk-in</strong>
            <span class="font-caption text-caption text-ink-soft mt-1 block">Ambil Tiket Pendaftaran Baru</span>
          </div>
          <span class="mt-space-md inline-flex items-center gap-1 text-caption text-ink font-bold">
            <span>Sentuh di sini</span>
            <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
          </span>
        </button>
      </div>

      <div class="p-space-md bg-canvas rounded-xl text-caption text-ink-soft text-center border border-line/30">
        Butuh bantuan? Silakan hubungi petugas Duta Pelayanan di lobi pendaftaran.
      </div>
    </div>
  `;
}

// 8. Helper: Status Chips (Clean Sentence Case & Minimalist Tints)
function renderStatusChip(status) {
  const map = {
    "REGISTERED": "bg-surface-container-low text-ink-soft",
    "WAITING_TRIAGE": "bg-warning-tint text-warning",
    "IN_TRIAGE": "bg-warning-tint text-warning",
    "WAITING_DOCTOR": "bg-info-tint text-info",
    "IN_SERVICE": "bg-brand-tint text-brand-strong font-semibold",
    "WAITING_RESULTS": "bg-info-tint text-info",
    "SERVICE_COMPLETED": "bg-success-tint text-success font-semibold",
    "CLOSED": "bg-surface-container-low text-ink-soft",
    "ESCALATED": "bg-danger-tint text-danger font-semibold",
    "CANCELLED": "bg-danger-tint text-danger line-through"
  };

  const style = map[status] || "bg-surface-container-low text-ink-soft";
  return `<span class="inline-block px-2.5 py-0.5 rounded-full text-caption font-semibold ${style}">${status}</span>`;
}

// 9. Interactive Action Handlers
function callTicket(ticketNo, destination) {
  if (isAudioEnabled) {
    QueueService.announceTicket(ticketNo, destination);
  }
  showToast(`Panggilan nomor antrian: ${ticketNo} menuju ${destination}`, "info");
}

function handleTriageSubmit(e, visitId) {
  e.preventDefault();
  try {
    const vitalsData = {
      systolic: document.getElementById("vitals-systolic").value,
      diastolic: document.getElementById("vitals-diastolic").value,
      pulse: document.getElementById("vitals-pulse").value,
      temperature: document.getElementById("vitals-temperature").value,
      respiratoryRate: document.getElementById("vitals-rr").value,
      spo2: document.getElementById("vitals-spo2").value,
      height: document.getElementById("vitals-height").value,
      weight: document.getElementById("vitals-weight").value
    };

    const triageData = {
      chiefComplaint: document.getElementById("triage-complaint").value,
      fallRisk: document.getElementById("triage-fall-risk").value,
      painScore: document.getElementById("triage-pain").value,
      outcome: document.getElementById("triage-outcome").value,
      allergies: document.getElementById("triage-allergies").value
    };

    TriageService.saveTriageAndVitals(visitId, vitalsData, triageData, true);
    showToast("TTV & Skrining Triase tersimpan. Pasien diteruskan ke dokter.", "success");
    renderWorkspace("triase");
  } catch (err) {
    showToast(err.message, "danger");
  }
}

function handleDoctorSaveEncounter(visitId, finalize = false) {
  try {
    const icdSelect = document.getElementById("doctor-icd10");
    const icdObj = SIMRS_MASTER_DATA.icd10.find(i => i.code === icdSelect.value);

    const encounterData = {
      subjective: document.getElementById("doctor-soap-s").value,
      objective: document.getElementById("doctor-soap-o").value,
      primaryDiagnosis: icdObj,
      plan: document.getElementById("doctor-soap-p").value,
      procedures: [
        { id: "SRV-CONS-SP", name: "Konsultasi Dokter Spesialis", price: 150000 }
      ],
      prescriptions: [
        { medicineId: "MED-001", medicineName: "Amlodipine 5 mg", dosage: "1 x 1 tablet", qty: 30, unitPrice: 850, totalPrice: 25500 }
      ],
      labOrders: []
    };

    DoctorService.saveEncounter(visitId, encounterData, finalize);
    showToast(finalize ? "Encounter difinalisasi. Tiket Farmasi & Kasir diterbitkan." : "Draft SOAP tersimpan.", "success");
    renderWorkspace("dokter");
  } catch (err) {
    showToast(err.message, "danger");
  }
}

function handlePharmacyDispense(visitId) {
  try {
    PharmacyService.dispenseMedications(visitId, "7 Benar obat terverifikasi.");
    showToast("Obat selesai disiapkan dan diserahkan ke pasien.", "success");
    renderWorkspace("farmasi");
  } catch (err) {
    showToast(err.message, "danger");
  }
}

function handleCashierPayment(visitId) {
  try {
    const invoice = BillingService.aggregateInvoice(visitId);
    BillingService.processPayment(visitId, "QRIS Dinamis", invoice.patientPayAmount);
    showToast("Pembayaran diverifikasi. Kwitansi resmi lunas diterbitkan.", "success");
    printKwitansi(visitId);
    renderWorkspace("kasir");
  } catch (err) {
    showToast(err.message, "danger");
  }
}

function handleSupervisorOverride(visitId) {
  try {
    VisitStateService.transition(visitId, "CLOSED", "Supervisor manual override.");
    showToast("Status berhasil di-override menjadi CLOSED.", "success");
    renderWorkspace("monitoring");
  } catch (err) {
    showToast(err.message, "danger");
  }
}

function handleKioskCheckin() {
  showToast("Check-in terverifikasi. Tiket A-004 telah dicetak.", "success");
}

// 10. Minimalist Toast Notification System
function showToast(message, type = "info") {
  const toast = document.getElementById("toast-notif");
  const toastText = document.getElementById("toast-text");
  if (toast && toastText) {
    toastText.textContent = message;
    toast.classList.remove("translate-y-20", "opacity-0");
    toast.classList.add("translate-y-0", "opacity-100");
    if (window._toastTimeout) clearTimeout(window._toastTimeout);
    window._toastTimeout = setTimeout(() => {
      toast.classList.remove("translate-y-0", "opacity-100");
      toast.classList.add("translate-y-20", "opacity-0");
    }, 3500);
    return;
  }
}

// 11. Modal Controls
function openRoleInspector() {
  const el = document.getElementById("modal-role-inspector");
  el.classList.remove("hidden");
  el.classList.add("flex");
}
function closeRoleInspector() {
  const el = document.getElementById("modal-role-inspector");
  el.classList.add("hidden");
  el.classList.remove("flex");
}

function show403Forbidden(roleName, targetDocType, action) {
  document.getElementById("error-403-message").textContent = `Role '${roleName}' tidak memiliki izin '${action}' pada '${targetDocType}'.`;
  document.getElementById("error-403-role").textContent = roleName;
  document.getElementById("error-403-doctype").textContent = targetDocType;
  const el = document.getElementById("modal-403");
  el.classList.remove("hidden");
  el.classList.add("flex");
}
function close403Modal() {
  const el = document.getElementById("modal-403");
  el.classList.add("hidden");
  el.classList.remove("flex");
}

function testUnauthorizedAccess() {
  const currentRole = permissionEngine.getCurrentRole();
  if (currentRole.id === "Cashier") {
    show403Forbidden(currentRole.id, "Patient Encounter (SOAP)", "read/write");
  } else if (currentRole.id === "Nursing User") {
    show403Forbidden(currentRole.id, "Sales Invoice (Billing)", "write");
  } else if (currentRole.id === "Registration Staff") {
    show403Forbidden(currentRole.id, "Patient Encounter", "write");
  } else {
    show403Forbidden(currentRole.id, "Sales Invoice / Kasir", "submit");
  }
}

function openApiModal() {
  const el = document.getElementById("modal-api");
  el.classList.remove("hidden");
  el.classList.add("flex");
}
function closeApiModal() {
  const el = document.getElementById("modal-api");
  el.classList.add("hidden");
  el.classList.remove("flex");
}

function openNewPatientModal() {
  const poliSelect = document.getElementById("reg-poli");
  poliSelect.innerHTML = SIMRS_MASTER_DATA.departments.map(d => `<option value="${d.id}">${d.name} (${d.room})</option>`).join("");
  updateDoctorDropdown(SIMRS_MASTER_DATA.departments[0].id);
  const el = document.getElementById("modal-new-patient");
  el.classList.remove("hidden");
  el.classList.add("flex");
}
function closeNewPatientModal() {
  const el = document.getElementById("modal-new-patient");
  el.classList.add("hidden");
  el.classList.remove("flex");
}

function updateDoctorDropdown(departmentId) {
  const docSelect = document.getElementById("reg-doctor");
  const filteredDocs = SIMRS_MASTER_DATA.practitioners.filter(p => p.department === departmentId);
  docSelect.innerHTML = filteredDocs.map(p => `<option value="${p.id}">${p.name}</option>`).join("");
}

function togglePayerMemberNo(payerType) {
  const group = document.getElementById("payer-member-group");
  if (payerType === "BPJS" || payerType === "Asuransi") {
    group.classList.remove("hidden");
  } else {
    group.classList.add("hidden");
  }
}

function submitNewPatient(e) {
  e.preventDefault();
  try {
    const patientData = {
      nik: document.getElementById("reg-nik").value,
      name: document.getElementById("reg-name").value,
      gender: document.getElementById("reg-gender").value,
      birthDate: document.getElementById("reg-birthdate").value,
      phone: document.getElementById("reg-phone").value,
      payerType: document.getElementById("reg-payer").value,
      payerMemberNo: document.getElementById("reg-payer-no") ? document.getElementById("reg-payer-no").value : "-"
    };

    const patient = RegistrationService.createPatient(patientData);

    const registration = {
      patientId: patient.id,
      departmentId: document.getElementById("reg-poli").value,
      practitionerId: document.getElementById("reg-doctor").value,
      payerType: patientData.payerType,
      payerMemberNo: patientData.payerMemberNo,
      source: "Walk-in"
    };

    const visit = RegistrationService.registerWalkIn(registration);
    closeNewPatientModal();
    showToast(`Pasien ${patient.name} terdaftar. Tiket Antrian: ${visit.ticketNo}`, "success");
    printBuktiPendaftaran(visit.id);
    renderWorkspace("registrasi");
  } catch (err) {
    showToast(err.message, "danger");
  }
}

// 12. Printable Document Previews
function printBuktiPendaftaran(visitId) {
  const visit = VisitStateService.findVisitById(visitId);
  if (!visit) return;

  const html = `
    <div class="max-w-sm mx-auto p-6 bg-surface border border-line rounded-xl text-center space-y-3 font-mono text-ink">
      <div class="border-b border-line pb-3">
        <h2 class="font-bold text-sm">RS SEHAT MANDIRI NUSANTARA</h2>
        <p class="text-[11px] text-ink-soft">BUKTI PENDAFTARAN & TIKET RAWAT JALAN</p>
      </div>

      <div class="py-2">
        <span class="text-[11px] text-ink-soft block">NOMOR ANTRIAN POLIKLINIK</span>
        <span class="text-4xl font-extrabold text-ink block my-1">${visit.ticketNo}</span>
        <span class="text-xs font-semibold text-brand block">${visit.departmentName}</span>
      </div>

      <div class="text-left text-xs space-y-1 border-t border-b border-line py-3">
        <p><strong>Nama Pasien:</strong> ${visit.patientName}</p>
        <p><strong>No. Rekam Medis:</strong> ${visit.mrNo}</p>
        <p><strong>Dokter:</strong> ${visit.practitionerName}</p>
        <p><strong>Penjamin:</strong> ${visit.payerType}</p>
        <p><strong>Waktu:</strong> ${new Date(visit.checkedInAt).toLocaleString('id-ID')}</p>
      </div>

      <p class="text-[10px] text-ink-soft">
        Silakan menunggu di ruang tunggu poliklinik hingga nomor dipanggil.
      </p>
    </div>
  `;

  openPrintModal("Bukti Pendaftaran Rawat Jalan", html);
}

function printKwitansi(visitId) {
  const visit = VisitStateService.findVisitById(visitId);
  const invoice = BillingService.aggregateInvoice(visitId);

  const html = `
    <div class="max-w-lg mx-auto p-6 bg-surface border border-line rounded-xl space-y-4 text-ink text-xs">
      <div class="flex justify-between items-start border-b border-line pb-3">
        <div>
          <h2 class="font-bold text-sm text-ink">RS SEHAT MANDIRI NUSANTARA</h2>
          <p class="text-[11px] text-ink-soft">Kwitansi Pembayaran Rawat Jalan Resmi</p>
          <span class="inline-block mt-1 px-2 py-0.5 rounded bg-success-tint text-success font-semibold text-[10px]">LUNAS</span>
        </div>
        <div class="text-right">
          <p class="font-mono font-bold">${visit.receipt ? visit.receipt.receiptNo : 'KWT-2026-001'}</p>
          <p class="text-[11px] text-ink-soft">${new Date().toLocaleDateString('id-ID')}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2 bg-surface-container-low p-2.5 rounded">
        <div>
          <p class="text-ink-soft">Nama Pasien:</p>
          <p class="font-semibold text-ink">${visit.patientName} (${visit.mrNo})</p>
        </div>
        <div>
          <p class="text-ink-soft">Poli / Dokter:</p>
          <p class="font-semibold text-ink">${visit.departmentName}</p>
        </div>
      </div>

      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-line text-ink-soft font-semibold bg-surface-container-low text-[11px]">
            <th class="p-1.5">Uraian</th>
            <th class="p-1.5 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-line">
          ${invoice.items.map(i => `
            <tr>
              <td class="p-1.5">${i.name}</td>
              <td class="p-1.5 text-right font-mono">Rp ${i.total.toLocaleString('id-ID')}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <div class="border-t border-line pt-2 space-y-1 text-right">
        <p>Total: <span class="font-mono font-bold">Rp ${invoice.subtotal.toLocaleString('id-ID')}</span></p>
        <p class="text-success">Tanggungan Penjamin (${visit.payerType}): <span class="font-mono">- Rp ${invoice.coveredAmount.toLocaleString('id-ID')}</span></p>
        <p class="font-bold text-sm pt-1 border-t border-line">Dibayar Pasien: <span class="font-mono">Rp ${invoice.patientPayAmount.toLocaleString('id-ID')}</span></p>
      </div>
    </div>
  `;

  openPrintModal("Kwitansi Resmi Rawat Jalan", html);
}

function printResumeMedis(visitId) {
  const visit = VisitStateService.findVisitById(visitId);
  const enc = visit.encounter || {};

  const html = `
    <div class="max-w-xl mx-auto p-6 bg-surface border border-line rounded-xl space-y-4 text-ink text-xs">
      <div class="flex justify-between items-center border-b border-line pb-3">
        <div>
          <h2 class="font-bold text-sm">RESUME MEDIS RAWAT JALAN</h2>
          <p class="text-[11px] text-ink-soft">Standar 11 Elemen Permenkes RI</p>
        </div>
        <span class="font-mono text-[11px] text-ink-soft">${visit.id}</span>
      </div>

      <div class="grid grid-cols-2 gap-2 bg-surface-container-low p-2.5 rounded">
        <div>
          <p><strong>Nama:</strong> ${visit.patientName} (${visit.mrNo})</p>
          <p><strong>Penjamin:</strong> ${visit.payerType}</p>
        </div>
        <div>
          <p><strong>Poli:</strong> ${visit.departmentName}</p>
          <p><strong>Dokter:</strong> ${visit.practitionerName}</p>
        </div>
      </div>

      <div class="space-y-2.5">
        <div>
          <strong class="block text-ink">1. Anamnesis:</strong>
          <p class="text-ink-soft p-1.5 bg-surface-container-low/40 rounded">${enc.subjective || '-'}</p>
        </div>
        <div>
          <strong class="block text-ink">2. Pemeriksaan Fisik:</strong>
          <p class="text-ink-soft p-1.5 bg-surface-container-low/40 rounded whitespace-pre-line">${enc.objective || '-'}</p>
        </div>
        <div>
          <strong class="block text-ink">3. Diagnosis ICD-10:</strong>
          <p class="text-ink-soft p-1.5 bg-surface-container-low/40 rounded font-semibold text-ink">${enc.primaryDiagnosis ? `${enc.primaryDiagnosis.code} - ${enc.primaryDiagnosis.name}` : '-'}</p>
        </div>
        <div>
          <strong class="block text-ink">4. Terapi & Obat:</strong>
          <ul class="list-disc list-inside p-1.5 bg-surface-container-low/40 rounded text-ink-soft">
            ${(enc.prescriptions || []).map(rx => `<li>${rx.medicineName} (${rx.dosage})</li>`).join("") || '<li>Tidak ada resep</li>'}
          </ul>
        </div>
        <div>
          <strong class="block text-ink">5. Rencana Tindak Lanjut:</strong>
          <p class="text-ink-soft p-1.5 bg-surface-container-low/40 rounded">${enc.plan || '-'}</p>
        </div>
      </div>
    </div>
  `;

  openPrintModal("Resume Medis Rawat Jalan", html);
}

function openPrintModal(title, contentHtml) {
  document.getElementById("print-modal-title").textContent = title;
  document.getElementById("print-modal-body").innerHTML = contentHtml;
  document.getElementById("printable-area").innerHTML = contentHtml;
  const el = document.getElementById("modal-print-preview");
  el.classList.remove("hidden");
  el.classList.add("flex");
}
function closePrintModal() {
  const el = document.getElementById("modal-print-preview");
  el.classList.add("hidden");
  el.classList.remove("flex");
}

// 13. SatuSehat API Handlers
function setApiMode(mode) {
  frappeApi.setMode(mode);
  const btnSim = document.getElementById("btn-mode-sim");
  const btnLive = document.getElementById("btn-mode-live");
  if (mode === "simulated") {
    btnSim.className = "h-7 px-2.5 bg-brand text-surface rounded text-xs font-semibold";
    btnLive.className = "h-7 px-2.5 bg-surface border border-line text-ink rounded text-xs font-medium";
  } else {
    btnLive.className = "h-7 px-2.5 bg-brand text-surface rounded text-xs font-semibold";
    btnSim.className = "h-7 px-2.5 bg-surface border border-line text-ink rounded text-xs font-medium";
  }
}

function saveApiUrl() {
  const url = document.getElementById("api-base-url-input").value;
  frappeApi.setBaseUrl(url);
  showToast(`Base URL disimpan: ${url}`, "success");
}

async function testApiLogin() {
  const viewer = document.getElementById("api-log-viewer");
  viewer.textContent = "POST /api/method/login...";
  const res = await frappeApi.login();
  viewer.textContent = JSON.stringify(res, null, 2);
}

async function testApiVitalSigns() {
  const viewer = document.getElementById("api-log-viewer");
  viewer.textContent = "POST /api/resource/Vital Signs...";
  const res = await frappeApi.syncVitalSigns({ systolic: 120, diastolic: 80, pulse: 80 });
  viewer.textContent = JSON.stringify(res, null, 2);
}

async function testApiSatuSehat() {
  const viewer = document.getElementById("api-log-viewer");
  viewer.textContent = "GET /encounter...";
  const res = await frappeApi.sendSatuSehatEncounter("OPV-2026-0001");
  viewer.textContent = JSON.stringify(res, null, 2);
}

async function testApiQueue() {
  const viewer = document.getElementById("api-log-viewer");
  viewer.textContent = JSON.stringify({ status: "Synced", queue_total: 4 }, null, 2);
}
