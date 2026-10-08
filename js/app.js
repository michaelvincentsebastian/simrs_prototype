/**
 * SIMRS Mini - Minimalist Clinical Worksheet Application
 * Adhering strictly to instructions/stitch_design_system_generator/DESIGN.md
 * Platform: Atkinson Hyperlegible Next + Material Symbols Outlined + Tailwind CSS
 */

let activeWorkspaceId = "doctor-queue";
let activeDoctorConsultationVisitId = "REG-WALK-B8K21";
let activeDoctorConsultationTab = "soap";
let isAudioEnabled = true;
let searchQuery = "";

// Multi-Department & Station Queue Filter States
let triageDeptFilter = localStorage.getItem("SIMRS_FILTER_TRIAGE_DEPT") || "POLI-INT";
let triageDoctorFilter = localStorage.getItem("SIMRS_FILTER_TRIAGE_DOC") || "DOC-HENDRA";
let activeTriageVisitId = null;
let activeCashierVisitId = null;

let doctorFilterDoc = localStorage.getItem("SIMRS_FILTER_DOCTOR_DOC") || "DOC-HENDRA";
let doctorFilterDept = localStorage.getItem("SIMRS_FILTER_DOCTOR_DEPT") || "POLI-INT";

let regQueueDeptFilter = "ALL";
let regQueueDocFilter = "ALL";
let regQueueStatusFilter = "ALL";

let pharmacyDeptFilter = "ALL";
let pharmacyDocFilter = "ALL";

let cashierDeptFilter = "ALL";
let cashierPayerFilter = "ALL";

let displayDeptFilter = "ALL";

// Queue & Workstation Filter Event Handlers
function handleTriageDeptChange(val) {
  triageDeptFilter = val;
  localStorage.setItem("SIMRS_FILTER_TRIAGE_DEPT", val);
  if (val !== "ALL") {
    const currentDoc = SIMRS_MASTER_DATA.practitioners.find(d => d.id === triageDoctorFilter);
    if (currentDoc && currentDoc.department !== val) {
      triageDoctorFilter = "ALL";
      localStorage.setItem("SIMRS_FILTER_TRIAGE_DOC", "ALL");
    }
  }
  activeTriageVisitId = null;
  renderWorkspace("triase");
  renderContextualTopBar();
}

function handleTriageDoctorChange(val) {
  triageDoctorFilter = val;
  localStorage.setItem("SIMRS_FILTER_TRIAGE_DOC", val);
  if (val !== "ALL") {
    const docObj = SIMRS_MASTER_DATA.practitioners.find(d => d.id === val);
    if (docObj && docObj.department) {
      triageDeptFilter = docObj.department;
      localStorage.setItem("SIMRS_FILTER_TRIAGE_DEPT", docObj.department);
    }
  }
  activeTriageVisitId = null;
  renderWorkspace("triase");
  renderContextualTopBar();
}

function selectTriagePatient(visitId) {
  activeTriageVisitId = visitId;
  const visit = VisitStateService.findVisitById(visitId);
  if (visit && visit.visitStatus === "WAITING_TRIAGE") {
    try {
      TriageService.startTriage(visitId);
    } catch (e) {
      console.warn("Could not transition to IN_TRIAGE:", e);
    }
  }
  renderWorkspace("triase");
}

function handleDoctorPractitionerChange(val) {
  doctorFilterDoc = val;
  localStorage.setItem("SIMRS_FILTER_DOCTOR_DOC", val);
  if (val !== "ALL") {
    const docObj = SIMRS_MASTER_DATA.practitioners.find(d => d.id === val);
    if (docObj && docObj.department) {
      doctorFilterDept = docObj.department;
      localStorage.setItem("SIMRS_FILTER_DOCTOR_DEPT", docObj.department);
    }
  }
  activeDoctorConsultationVisitId = null;
  renderWorkspace("dokter");
  renderContextualTopBar();
}

function handleDoctorDeptChange(val) {
  doctorFilterDept = val;
  localStorage.setItem("SIMRS_FILTER_DOCTOR_DEPT", val);
  if (val !== "ALL") {
    const currentDoc = SIMRS_MASTER_DATA.practitioners.find(d => d.id === doctorFilterDoc);
    if (currentDoc && currentDoc.department !== val) {
      const deptDoc = SIMRS_MASTER_DATA.practitioners.find(d => d.department === val);
      doctorFilterDoc = deptDoc ? deptDoc.id : "ALL";
      localStorage.setItem("SIMRS_FILTER_DOCTOR_DOC", doctorFilterDoc);
    }
  }
  activeDoctorConsultationVisitId = null;
  renderWorkspace("dokter");
  renderContextualTopBar();
}

function handleRegQueueDeptChange(val) {
  regQueueDeptFilter = val;
  const tblContainer = document.getElementById("registration-visits-table-container") || document.getElementById("recent-visits-table-container");
  if (tblContainer) {
    tblContainer.innerHTML = renderRecentVisitsTableHtml();
  } else {
    renderWorkspace("registrasi");
  }
}

function handleRegQueueDocChange(val) {
  regQueueDocFilter = val;
  const tblContainer = document.getElementById("registration-visits-table-container") || document.getElementById("recent-visits-table-container");
  if (tblContainer) {
    tblContainer.innerHTML = renderRecentVisitsTableHtml();
  } else {
    renderWorkspace("registrasi");
  }
}

function handleRegQueueStatusChange(val) {
  regQueueStatusFilter = val;
  const tblContainer = document.getElementById("registration-visits-table-container") || document.getElementById("recent-visits-table-container");
  if (tblContainer) {
    tblContainer.innerHTML = renderRecentVisitsTableHtml();
  } else {
    renderWorkspace("registrasi");
  }
}

function resetRegQueueFilters() {
  regQueueDeptFilter = "ALL";
  regQueueDocFilter = "ALL";
  regQueueStatusFilter = "ALL";
  const tblContainer = document.getElementById("registration-visits-table-container") || document.getElementById("recent-visits-table-container");
  if (tblContainer) {
    tblContainer.innerHTML = renderRecentVisitsTableHtml();
  } else {
    renderWorkspace("registrasi");
  }
}

function handlePharmacyDeptFilter(val) {
  pharmacyDeptFilter = val;
  renderWorkspace("farmasi");
  renderContextualTopBar();
}

function handlePharmacyDocFilter(val) {
  pharmacyDocFilter = val;
  renderWorkspace("farmasi");
  renderContextualTopBar();
}

function handleKasirDeptFilter(val) {
  cashierDeptFilter = val;
  renderWorkspace("kasir");
  renderContextualTopBar();
}

function handleKasirPayerFilter(val) {
  cashierPayerFilter = val;
  renderWorkspace("kasir");
  renderContextualTopBar();
}

function handleDisplayDeptFilter(val) {
  displayDeptFilter = val;
  renderWorkspace("display");
}


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

  // Reset global search query on role switch
  searchQuery = "";
}

// 6. Contextual Workflow Header Bar (Level 2 Context - Clean Breadcrumb & Status)
function renderContextualTopBar() {
  const role = permissionEngine.getCurrentRole();
  const breadcrumbEl = document.getElementById("breadcrumb-current-workspace");
  const statusEl = document.getElementById("role-contextual-note");
  const contextualBar = document.getElementById("role-contextual-bar");
  const mainEl = document.querySelector("main");

  // Hapus bar status/breadcrumb terduplikasi untuk workspace registrasi walk-in
  if (activeWorkspaceId === "registrasi") {
    if (contextualBar) contextualBar.classList.add("hidden");
    if (mainEl) {
      mainEl.classList.remove("pt-[104px]");
      mainEl.classList.add("pt-16");
    }
    return;
  } else {
    if (contextualBar) contextualBar.classList.remove("hidden");
    if (mainEl) {
      mainEl.classList.remove("pt-16");
      mainEl.classList.add("pt-[104px]");
    }
  }

  const items = role.primaryNav || [];
  const currentNav = items.find(n => n.id === activeWorkspaceId) || 
    items.find(n => (n.id === "ttv-queue" && activeWorkspaceId === "triase") || 
                    (n.id === "doctor-queue" && activeWorkspaceId === "dokter") ||
                    (n.id === "cashier-queue" && activeWorkspaceId === "kasir"));

  const navLabel = currentNav ? currentNav.label : (role.submoduleName || "Poli Rawat Jalan");

  if (breadcrumbEl) {
    breadcrumbEl.innerHTML = `
      <span class="text-ink-soft">${role.title}</span>
      <span class="material-symbols-outlined text-[14px] text-ink-soft">chevron_right</span>
      <span class="text-ink font-semibold">${navLabel}</span>
    `;
  }

  if (statusEl) {
    if (activeWorkspaceId.startsWith("doctor")) {
      const activeVisit = VisitStateService.findVisitById(activeDoctorConsultationVisitId);
      if (activeWorkspaceId === "doctor-consultation" && activeVisit) {
        statusEl.innerHTML = `<span class="text-brand font-semibold flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>Pasien: ${activeVisit.patientName} (${activeVisit.ticketNo})</span>`;
      } else {
        const waitingCount = VisitStateService.getVisits().filter(v => v.visitStatus === "WAITING_DOCTOR").length;
        statusEl.innerHTML = `<span class="text-ink font-semibold flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-indigo-500"></span>${waitingCount} Pasien Menunggu di Poli</span>`;
      }
    } else if (activeWorkspaceId.startsWith("ttv")) {
      const activeVisit = VisitStateService.findVisitById(activeTriageVisitId);
      if (activeWorkspaceId === "ttv-input" && activeVisit) {
        statusEl.innerHTML = `<span class="text-brand font-semibold flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>Pasien: ${activeVisit.patientName} (${activeVisit.ticketNo})</span>`;
      } else {
        const waitingCount = VisitStateService.getVisits().filter(v => v.visitStatus === "WAITING_TRIAGE").length;
        statusEl.innerHTML = `<span class="text-ink font-semibold flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-teal-500"></span>${waitingCount} Pasien Menunggu TTV</span>`;
      }
    } else if (activeWorkspaceId.startsWith("cashier")) {
      const pendingCount = VisitStateService.getVisits().filter(v => v.visitStatus === "SERVICE_COMPLETED" && v.billingStatus !== "Paid").length;
      statusEl.innerHTML = `<span class="text-ink font-semibold flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-amber-500"></span>${pendingCount} Tagihan Siap Bayar</span>`;
    } else {
      statusEl.innerHTML = `<span class="text-ink-soft font-mono text-[11px]">${role.submoduleName || 'SIMRS Mini'}</span>`;
    }
  }
}

// 7. Dynamic Sidebar Builder (Concise Level 1 Navigation - 4 to 5 items max)
function renderSidebar() {
  const role = permissionEngine.getCurrentRole();
  const navList = document.getElementById("sidebar-nav-list");
  if (!navList) return;
  navList.innerHTML = "";

  const items = role.primaryNav || [
    { id: role.landingWorkspace, label: role.submoduleName, icon: "local_hospital" }
  ];

  items.forEach(item => {
    const isActive = activeWorkspaceId === item.id || 
      (item.id === "ttv-queue" && (activeWorkspaceId === "triase" || activeWorkspaceId === "ttv")) ||
      (item.id === "doctor-queue" && activeWorkspaceId === "dokter") ||
      (item.id === "cashier-queue" && activeWorkspaceId === "kasir");

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `flex items-center justify-between w-full px-space-md py-2.5 rounded-xl transition-all text-left font-body-default text-body-default ${
      isActive 
        ? "bg-brand text-on-primary font-body-strong shadow-sm" 
        : "text-ink hover:bg-surface-container-low hover:text-ink"
    }`;

    btn.onclick = () => {
      activeWorkspaceId = item.id;
      renderSidebar();
      renderContextualTopBar();
      renderWorkspace(item.id);
    };

    btn.innerHTML = `
      <div class="flex items-center gap-space-sm min-w-0">
        <span class="material-symbols-outlined text-[20px] ${isActive ? 'text-on-primary' : 'text-brand'}">${item.icon}</span>
        <span class="truncate">${item.label}</span>
      </div>
      <span class="material-symbols-outlined text-[16px] ${isActive ? 'text-on-primary/80' : 'text-ink-soft'}">chevron_right</span>
    `;

    navList.appendChild(btn);
  });
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

// 7. Workspace Renderer (Role & Workflow Oriented)
function renderWorkspace(workspaceId) {
  const container = document.getElementById("main-viewport");
  if (!container) return;

  switch (workspaceId) {
    // --- DOCTOR WORKSTATION (PHYSICIAN) ---
    case "doctor-dashboard":
      renderDoctorDashboardView(container);
      break;
    case "doctor-queue":
    case "dokter":
      renderDoctorQueueView(container);
      break;
    case "doctor-consultation":
      renderDoctorConsultationView(container);
      break;
    case "doctor-patients":
      renderDoctorPatientsView(container);
      break;
    case "doctor-documents":
      renderDoctorDocumentsView(container);
      break;

    // --- NURSE WORKSTATION (NURSING_USER) ---
    case "nurse-dashboard":
      renderNurseDashboardView(container);
      break;
    case "ttv-queue":
    case "triase":
    case "ttv":
      renderTtvQueueView(container);
      break;
    case "ttv-input":
      renderTtvInputView(container);
      break;
    case "ttv-history":
      renderTtvHistoryView(container);
      break;

    // --- REGISTRATION WORKSTATION (REGISTRATION_STAFF) ---
    case "reg-dashboard":
      renderRegDashboardView(container);
      break;
    case "registrasi":
    case "reg-queue":
      renderRegistrasiWorkspace(container);
      break;
    case "reg-booking":
      renderRegBookingView(container);
      break;
    case "reg-bpjs":
      renderRegBpjsView(container);
      break;
    case "reg-patients":
      renderRegPatientsView(container);
      break;

    // --- CASHIER WORKSTATION (CASHIER) ---
    case "cashier-dashboard":
      renderCashierDashboardView(container);
      break;
    case "cashier-queue":
    case "kasir":
      renderCashierQueueView(container);
      break;
    case "cashier-payment":
      renderCashierPaymentView(container);
      break;
    case "cashier-history":
      renderCashierHistoryView(container);
      break;

    // --- SUPPORT & DISPLAY WORKSTATIONS ---
    case "display":
      renderDisplayWorkspace(container);
      break;
    case "lab":
      renderLabWorkspace(container);
      break;
    case "farmasi":
      renderFarmasiWorkspace(container);
      break;
    case "monitoring":
      renderMonitoringWorkspace(container);
      break;
    case "audit":
      renderAuditWorkspace(container);
      break;
    case "kiosk":
      renderKioskWorkspace(container);
      break;
    default:
      container.innerHTML = `<div class="p-8 text-center text-ink-soft">Ruang kerja tidak ditemukan (${workspaceId}).</div>`;
  }
}

// ========================================================
// WORKSPACE 1: REGISTRASI WALK-IN (Clean 2-Column Workstation)
// ========================================================
function renderRegistrasiWorkspace(container) {
  container.innerHTML = `
    <div class="flex flex-col w-full gap-space-lg">
      <!-- Top Context Header with + Pendaftaran CTA Button at Top Right -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm border-b border-line/40">
        <div class="flex flex-col">
          <div class="flex items-center gap-space-sm">
            <h1 class="font-headline-lg text-headline-lg text-ink font-bold tracking-tight">Pendaftaran Walk-in</h1>
          </div>
        </div>

        <!-- Quick Info & Top-Right Action: + Pendaftaran Button -->
        <div class="flex items-center gap-space-md flex-wrap">
          <!-- + PENDAFTARAN BUTTON (Tombol di Kanan Atas) -->
          <button 
            type="button" 
            id="btn-open-walkin-reg" 
            onclick="openWalkinRegistrationModal('old')" 
            class="h-10 px-4 bg-brand hover:bg-brand-strong text-on-primary rounded-xl font-body-strong text-caption font-bold flex items-center gap-2 shadow-sm transition hover:shadow-md hover:scale-[1.01]"
          >
            <span class="material-symbols-outlined text-[20px]">person_add</span>
            <span>+ Pendaftaran</span>
          </button>
        </div>
      </div>

      <!-- MAIN SECTION: DAFTAR KUNJUNGAN HARI INI (Langsung Tampil di Halaman Utama) -->
      <section class="bg-surface rounded-2xl shadow-sm border border-line/40 overflow-hidden flex flex-col">
        <div class="px-space-lg py-space-md border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-surface">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-brand-tint text-brand flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">list_alt</span>
            </div>
            <div>
              <h2 class="font-headline-md text-headline-md text-ink font-bold">
                Daftar Kunjungan Hari Ini
              </h2>
              <span class="text-[11px] text-ink-soft font-mono">Daftar registrasi pasien aktif rawat jalan</span>
            </div>
          </div>
        </div>

        <div id="registration-visits-table-container">
          ${renderRecentVisitsTableHtml()}
        </div>
      </section>
    </div>
  `;
}

function handleRegTableSearch(val) {
  searchQuery = (val || "").trim().toLowerCase();
  const tblContainer = document.getElementById("registration-visits-table-container") || document.getElementById("recent-visits-table-container");
  if (tblContainer) {
    tblContainer.innerHTML = renderRecentVisitsTableHtml();
  }
}

function formatRegistrationTime(isoOrTime) {
  if (!isoOrTime) return "08:00:00";
  try {
    if (typeof isoOrTime === "string" && isoOrTime.includes("T")) {
      const timePart = isoOrTime.split("T")[1];
      if (timePart) return timePart.substring(0, 8);
    }
    const d = new Date(isoOrTime);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    }
    return String(isoOrTime);
  } catch (e) {
    return String(isoOrTime || "08:00:00");
  }
}

function renderRecentVisitsTableHtml() {
  let allVisits = VisitStateService.getVisits();
  let visits = allVisits;
  if (searchQuery) {
    visits = visits.filter(v => 
      (v.patientName && v.patientName.toLowerCase().includes(searchQuery)) || 
      (v.mrNo && v.mrNo.toLowerCase().includes(searchQuery)) || 
      (v.id && v.id.toLowerCase().includes(searchQuery)) ||
      (v.ticketNo && v.ticketNo.toLowerCase().includes(searchQuery)) ||
      (v.departmentName && v.departmentName.toLowerCase().includes(searchQuery)) ||
      (v.practitionerName && v.practitionerName.toLowerCase().includes(searchQuery))
    );
  }

  if (regQueueDeptFilter !== "ALL") {
    visits = visits.filter(v => {
      if (v.departmentId) return v.departmentId === regQueueDeptFilter;
      const deptObj = SIMRS_MASTER_DATA.departments.find(d => d.id === regQueueDeptFilter);
      return deptObj ? v.departmentName === deptObj.name : true;
    });
  }

  if (regQueueDocFilter !== "ALL") {
    visits = visits.filter(v => {
      if (v.practitionerId) return v.practitionerId === regQueueDocFilter;
      const docObj = SIMRS_MASTER_DATA.practitioners.find(d => d.id === regQueueDocFilter);
      return docObj ? (v.practitionerName && v.practitionerName.includes(docObj.name.split(',')[0])) : true;
    });
  }

  const isFiltered = regQueueDeptFilter !== 'ALL' || regQueueDocFilter !== 'ALL' || Boolean(searchQuery);

  return `
    <!-- Queue Filter Toolbar for Front Desk & Admission -->
    <div class="p-3 bg-surface-container-low border-b border-line/40 flex flex-wrap items-center justify-between gap-2.5">
      <div class="flex flex-wrap items-center gap-2">
        <!-- Quick Search on Table -->
        <div class="relative">
          <span class="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-ink-soft pointer-events-none">search</span>
          <input 
            type="text" 
            id="reg-table-search-input"
            value="${searchQuery || ''}"
            placeholder="Cari Pasien / No. RM / ID..." 
            oninput="handleRegTableSearch(this.value)"
            class="h-8 pl-8 pr-2.5 bg-surface text-ink text-caption font-medium rounded-lg border border-line/50 focus:outline-none focus:ring-1 focus:ring-brand w-48 sm:w-60 shadow-2xs"
          />
        </div>

        <span class="text-caption font-semibold text-ink-soft flex items-center gap-1 shrink-0 ml-1">
          <span class="material-symbols-outlined text-[16px] text-brand">filter_alt</span>
          <span>Filter:</span>
        </span>
        
        <!-- Filter Poli -->
        <select onchange="handleRegQueueDeptChange(this.value)" class="h-8 px-2 bg-surface text-ink text-caption font-medium rounded-lg border border-line/50 focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer shadow-2xs">
          <option value="ALL" ${regQueueDeptFilter === 'ALL' ? 'selected' : ''}>🏢 Semua Poli</option>
          ${SIMRS_MASTER_DATA.departments.map(dept => `
            <option value="${dept.id}" ${regQueueDeptFilter === dept.id ? 'selected' : ''}>${dept.name}</option>
          `).join("")}
        </select>

        <!-- Filter Dokter -->
        <select onchange="handleRegQueueDocChange(this.value)" class="h-8 px-2 bg-surface text-ink text-caption font-medium rounded-lg border border-line/50 focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer shadow-2xs">
          <option value="ALL" ${regQueueDocFilter === 'ALL' ? 'selected' : ''}>👨‍⚕️ Semua Dokter</option>
          ${SIMRS_MASTER_DATA.practitioners.map(doc => `
            <option value="${doc.id}" ${regQueueDocFilter === doc.id ? 'selected' : ''}>${doc.name}</option>
          `).join("")}
        </select>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-caption text-ink-soft">
          Menampilkan: <strong class="text-ink font-mono font-bold">${visits.length}</strong> dari <span class="font-mono">${allVisits.length}</span> kunjungan
        </span>
        ${isFiltered ? `
          <button onclick="searchQuery=''; resetRegQueueFilters();" class="text-caption text-brand hover:underline font-semibold ml-2 flex items-center gap-0.5">
            <span class="material-symbols-outlined text-[14px]">refresh</span>
            <span>Reset</span>
          </button>
        ` : ''}
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left font-table-cell text-table-cell border-collapse">
        <thead>
          <tr class="bg-surface-container-low/60 border-b border-line text-ink-soft font-semibold text-caption">
            <th class="p-space-sm">ID</th>
            <th class="p-space-sm">Jam Registrasi</th>
            <th class="p-space-sm">Pasien &amp; No. RM</th>
            <th class="p-space-sm">Poli Tujuan</th>
            <th class="p-space-sm">Dokter Pemeriksa</th>
            <th class="p-space-sm">Metode Pembayaran</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-line">
          ${visits.length === 0 ? `
            <tr>
              <td colspan="6" class="p-8 text-center text-ink-soft font-caption text-caption">
                Tidak ada data registrasi atau kunjungan yang sesuai dengan filter yang dipilih.
              </td>
            </tr>
          ` : visits.map(v => `
            <tr class="hover:bg-surface-container-low/50 transition">
              <td class="p-space-sm">
                <span class="font-mono font-bold text-brand text-caption px-2.5 py-1 bg-brand-tint rounded-md">${v.id}</span>
              </td>
              <td class="p-space-sm">
                <span class="font-mono text-caption text-ink font-semibold">${formatRegistrationTime(v.registeredAt || v.checkedInAt)}</span>
                <span class="text-[10px] text-ink-soft ml-0.5">WIB</span>
              </td>
              <td class="p-space-sm">
                <span class="font-body-strong text-ink block">${v.patientName}</span>
                <span class="font-mono text-caption text-ink-soft">${v.mrNo}</span>
              </td>
              <td class="p-space-sm font-medium text-ink">${v.departmentName}</td>
              <td class="p-space-sm text-ink-soft">${v.practitionerName}</td>
              <td class="p-space-sm">
                <span class="px-2 py-0.5 rounded font-caption text-caption font-semibold ${
                  v.payerType === 'BPJS' 
                    ? 'bg-info-tint text-info' 
                    : v.payerType === 'Asuransi' 
                    ? 'bg-purple-50 text-purple-700' 
                    : v.payerType === 'Perusahaan'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-surface-container-low text-ink-soft border border-line/40'
                }">
                  ${
                    v.payerType === 'BPJS' 
                      ? 'BPJS Kesehatan' 
                      : v.payerType === 'Asuransi' 
                      ? 'Asuransi Swasta' 
                      : v.payerType === 'Perusahaan'
                      ? `Perusahaan: ${v.companyName ? (v.companyName.length > 20 ? v.companyName.slice(0, 18) + '...' : v.companyName) : (v.guarantorCode || 'Penjamin')}`
                      : `Umum (${v.paymentSubMethod || 'Cash'})`
                  }
                </span>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

// ========================================================
// WALKIN REGISTRATION MODAL CONTROLLER (Pasien Lama & Baru)
// ========================================================
let walkinCurrentMode = "old";
let selectedOldPatient = null;
let oldSearchDebounceTimer = null;

function openWalkinRegistrationModal(initialMode = "old") {
  walkinCurrentMode = initialMode;
  
  // Populate Poli Selects
  const oldPoliEl = document.getElementById("old-reg-poli");
  const newPoliEl = document.getElementById("new-reg-poli");
  const poliOptions = SIMRS_MASTER_DATA.departments.map(d => `<option value="${d.id}">${d.name} (${d.room})</option>`).join("");
  
  if (oldPoliEl) oldPoliEl.innerHTML = poliOptions;
  if (newPoliEl) newPoliEl.innerHTML = poliOptions;

  // Also support legacy IDs if present
  const legacyPoli = document.getElementById("poli-select");
  if (legacyPoli) legacyPoli.innerHTML = poliOptions;

  // Populate Doctor Selects based on first department
  const firstDept = SIMRS_MASTER_DATA.departments[0]?.id || "POLI-INT";
  handleOldPoliChange(firstDept);
  handleNewPoliChange(firstDept);

  // Switch tab mode
  switchWalkinMode(initialMode);

  // Run initial patient search
  searchOldPatients();

  // Initialize payment method visibility
  const oldMethod = document.querySelector('input[name="old_payment_method"]:checked')?.value || "Umum";
  const newMethod = document.querySelector('input[name="new_payment_method"]:checked')?.value || "Umum";
  handleOldPaymentMethodChange(oldMethod);
  handleNewPaymentMethodChange(newMethod);

  // Show modal
  const modal = document.getElementById("modal-walkin-registration");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }
}

function closeWalkinRegistrationModal() {
  const modal = document.getElementById("modal-walkin-registration");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

function switchWalkinMode(mode) {
  walkinCurrentMode = mode;
  const btnOld = document.getElementById("walkin-tab-btn-old");
  const btnNew = document.getElementById("walkin-tab-btn-new");
  const contentOld = document.getElementById("walkin-content-old");
  const contentNew = document.getElementById("walkin-content-new");

  if (mode === "old") {
    if (btnOld) {
      btnOld.className = "flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-lg font-body-strong transition-all bg-surface text-brand shadow-sm border border-line/30";
    }
    if (btnNew) {
      btnNew.className = "flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-lg font-body-strong transition-all text-ink-soft hover:text-ink";
    }
    if (contentOld) contentOld.classList.remove("hidden");
    if (contentNew) contentNew.classList.add("hidden");

    const qInput = document.getElementById("old-search-query");
    if (qInput) qInput.focus();
  } else {
    if (btnNew) {
      btnNew.className = "flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-lg font-body-strong transition-all bg-surface text-brand shadow-sm border border-line/30";
    }
    if (btnOld) {
      btnOld.className = "flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-lg font-body-strong transition-all text-ink-soft hover:text-ink";
    }
    if (contentNew) contentNew.classList.remove("hidden");
    if (contentOld) contentOld.classList.add("hidden");

    const nikInput = document.getElementById("new-reg-nik");
    if (nikInput) nikInput.focus();
  }
}

function handleOldPatientSearchInput() {
  clearTimeout(oldSearchDebounceTimer);
  oldSearchDebounceTimer = setTimeout(() => {
    searchOldPatients();
  }, 250);
}

function searchOldPatients() {
  const q = (document.getElementById("old-search-query")?.value || "").trim();
  const birthDate = document.getElementById("old-search-birthdate")?.value || "";
  const gender = document.getElementById("old-search-gender")?.value || "ALL";

  const results = RegistrationService.searchPatients({
    query: q,
    birthDate: birthDate,
    gender: gender
  });

  const container = document.getElementById("old-patient-search-results");
  if (!container) return;

  if (results.length === 0) {
    container.innerHTML = `
      <div class="p-6 bg-surface rounded-xl border border-line/50 text-center flex flex-col items-center gap-2">
        <span class="material-symbols-outlined text-[32px] text-ink-soft">person_search</span>
        <span class="font-body-strong text-ink text-[13px]">Pasien tidak ditemukan dengan kriteria pencarian</span>
        <p class="text-[12px] text-ink-soft max-w-md">
          Tidak ada data RME yang cocok dengan filter "${q || 'Semua'}" ${birthDate ? `· Tgl Lahir: ${birthDate}` : ''} ${gender !== 'ALL' ? `· Gender: ${gender}` : ''}.
        </p>
        <button 
          type="button" 
          onclick="switchWalkinMode('new')" 
          class="mt-1 h-8 px-3.5 bg-brand-tint text-brand-strong hover:bg-brand hover:text-on-primary rounded-lg text-caption font-semibold flex items-center gap-1.5 transition"
        >
          <span class="material-symbols-outlined text-[16px]">person_add</span>
          <span>Daftarkan Sebagai Pasien Baru</span>
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="flex items-center justify-between px-1 py-0.5 text-[11px] text-ink-soft font-medium">
      <span>Ditemukan <strong class="text-ink font-semibold">${results.length}</strong> data pasien RME:</span>
      <span>Klik kartu atau tombol "Pilih" untuk fetch data diri</span>
    </div>
    <div class="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
      ${results.map(p => `
        <div 
          onclick="selectOldPatient('${p.id}')"
          class="p-3 bg-surface hover:bg-brand-tint/40 border ${selectedOldPatient?.id === p.id ? 'border-brand bg-brand-tint/50' : 'border-line/50'} rounded-xl cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 group shadow-2xs"
        >
          <div class="flex items-start gap-3 min-w-0">
            <div class="w-8 h-8 rounded-lg bg-surface-container-low group-hover:bg-brand group-hover:text-on-primary text-brand flex items-center justify-center shrink-0 transition">
              <span class="material-symbols-outlined text-[18px]">${p.gender === 'Perempuan' ? 'female' : 'male'}</span>
            </div>
            <div class="flex flex-col min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-body-strong text-ink font-bold text-[13px] group-hover:text-brand transition">${p.name}</span>
                <span class="text-ink-soft text-[11px]">·</span>
                <span class="text-[11px] text-ink-soft">${p.gender}, ${p.age} th</span>
                <span class="text-ink-soft text-[11px]">·</span>
                <span class="font-mono text-[11px] text-brand-strong font-semibold bg-surface px-1.5 py-0.2 rounded border border-line/40">${p.mrNo}</span>
              </div>
              <div class="text-[11px] text-ink-soft mt-0.5 flex items-center gap-3 flex-wrap">
                <span>NIK: <strong class="font-mono text-ink">${p.nik}</strong></span>
                <span>Tgl Lahir: <strong class="text-ink font-medium">${p.birthDate}</strong></span>
                <span class="truncate max-w-[200px]">${p.address}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button 
              type="button" 
              onclick="event.stopPropagation(); selectOldPatient('${p.id}')"
              class="h-7 px-3 bg-brand text-on-primary rounded-lg text-[11px] font-semibold hover:bg-brand-strong transition shadow-2xs flex items-center gap-1"
            >
              <span>Pilih Pasien</span>
              <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function selectOldPatient(patientId) {
  const patient = RegistrationService.getPatients().find(p => p.id === patientId);
  if (!patient) return;

  selectedOldPatient = patient;

  const fName = document.getElementById("fetched-patient-name");
  const fMeta = document.getElementById("fetched-patient-meta");
  const fMrn = document.getElementById("fetched-patient-mrn");
  const fNik = document.getElementById("fetched-patient-nik");
  const fAddress = document.getElementById("fetched-patient-address");
  const fPhone = document.getElementById("fetched-patient-phone");

  if (fName) fName.textContent = patient.name;
  if (fMeta) fMeta.textContent = `${patient.gender}, ${patient.age} th · Tgl Lahir: ${patient.birthDate}`;
  if (fMrn) fMrn.textContent = patient.mrNo;
  if (fNik) fNik.textContent = patient.nik;
  if (fAddress) fAddress.textContent = patient.address;
  if (fPhone) fPhone.textContent = patient.phone || "-";

  const fCard = document.getElementById("old-patient-fetched-card");
  const rList = document.getElementById("old-patient-search-results");
  if (fCard) fCard.classList.remove("hidden");
  if (rList) rList.classList.add("hidden");

  // Auto-set payment method
  if (patient.payerType === "BPJS") {
    const radioBpjs = document.querySelector('input[name="old_payment_method"][value="BPJS"]');
    if (radioBpjs) radioBpjs.checked = true;
    handleOldPaymentMethodChange("BPJS");
    const cardNo = document.getElementById("old-payment-card-no");
    if (cardNo) cardNo.value = patient.payerMemberNo || "";
  } else if (patient.payerType === "Asuransi") {
    const radioAsu = document.querySelector('input[name="old_payment_method"][value="Asuransi"]');
    if (radioAsu) radioAsu.checked = true;
    handleOldPaymentMethodChange("Asuransi");
    const cardNo = document.getElementById("old-payment-card-no");
    if (cardNo) cardNo.value = patient.payerMemberNo || "";
  } else if (patient.payerType === "Perusahaan") {
    const radioCorp = document.querySelector('input[name="old_payment_method"][value="Perusahaan"]');
    if (radioCorp) radioCorp.checked = true;
    handleOldPaymentMethodChange("Perusahaan");
    const compName = document.getElementById("old-payment-company-name");
    const compCode = document.getElementById("old-payment-company-code");
    if (compName) compName.value = patient.companyName || "";
    if (compCode) compCode.value = patient.guarantorCode || patient.payerMemberNo || "";
  } else {
    const radioUmum = document.querySelector('input[name="old_payment_method"][value="Umum"]');
    if (radioUmum) radioUmum.checked = true;
    handleOldPaymentMethodChange("Umum");
  }

  showToast(`Data RME pasien ${patient.name} berhasil dimuat.`, "success");
}

function resetOldPatientSelection() {
  selectedOldPatient = null;
  const fCard = document.getElementById("old-patient-fetched-card");
  const rList = document.getElementById("old-patient-search-results");
  if (fCard) fCard.classList.add("hidden");
  if (rList) rList.classList.remove("hidden");
  searchOldPatients();
}

function resetOldPatientSearch() {
  const q = document.getElementById("old-search-query");
  const b = document.getElementById("old-search-birthdate");
  const g = document.getElementById("old-search-gender");
  if (q) q.value = "";
  if (b) b.value = "";
  if (g) g.value = "ALL";
  resetOldPatientSelection();
}

function handleOldPoliChange(deptId) {
  const dept = SIMRS_MASTER_DATA.departments.find(d => d.id === deptId) || SIMRS_MASTER_DATA.departments[0];
  const docSelect = document.getElementById("old-reg-doctor");
  const legacyDoc = document.getElementById("dokter-select");
  const docs = SIMRS_MASTER_DATA.practitioners.filter(p => p.department === dept.id);
  const optionsHtml = docs.map(d => `<option value="${d.id}">${d.name}</option>`).join("");
  
  if (docSelect) docSelect.innerHTML = optionsHtml;
  if (legacyDoc) legacyDoc.innerHTML = optionsHtml;

  const roomEl = document.getElementById("old-doctor-room");
  if (roomEl) roomEl.textContent = `${dept.room}, ${dept.floor}`;

  if (docs.length > 0) {
    handleOldDoctorChange(docs[0].id);
  }
}

function handleOldDoctorChange(docId) {
  const doc = SIMRS_MASTER_DATA.practitioners.find(p => p.id === docId);
  const schedEl = document.getElementById("old-doctor-schedule");
  if (schedEl && doc) {
    schedEl.textContent = `Jadwal: ${doc.schedule}`;
  }
}

function handleOldSubPaymentChange(subVal) {
  const subTypes = ["cash", "credit", "qris", "va"];
  subTypes.forEach(t => {
    const el = document.getElementById(`old-subdetail-${t}`);
    if (el) {
      if (t === subVal.toLowerCase()) {
        el.classList.remove("hidden");
      } else {
        el.classList.add("hidden");
      }
    }
  });
  if (subVal === "VA") {
    const bank = document.getElementById("old-va-bank")?.value || "BCA";
    generateOldVaNumber(bank);
  }
}

function generateOldVaNumber(bank) {
  const codes = { BCA: "88019", Mandiri: "89012", BRI: "12845", BNI: "98801", Permata: "84551" };
  const prefix = codes[bank] || "88019";
  const mrnDigits = selectedOldPatient?.mrNo ? selectedOldPatient.mrNo.replace(/\D/g, "") : "0124";
  const el = document.getElementById("old-va-number");
  if (el) el.value = `${prefix}2026${mrnDigits.slice(-4).padStart(4, "0")}`;
}

function handleOldPaymentMethodChange(val) {
  const cardGroup = document.getElementById("old-payment-card-group");
  const subGroup = document.getElementById("old-payment-submethod-group");
  const compGroup = document.getElementById("old-payment-company-group");

  if (val === "Perusahaan") {
    if (compGroup) compGroup.classList.remove("hidden");
    if (cardGroup) cardGroup.classList.add("hidden");
    if (subGroup) subGroup.classList.add("hidden");
  } else if (val === "BPJS" || val === "Asuransi") {
    if (cardGroup) cardGroup.classList.remove("hidden");
    if (compGroup) compGroup.classList.add("hidden");
    if (subGroup) subGroup.classList.add("hidden");
  } else {
    // Umum
    if (subGroup) subGroup.classList.remove("hidden");
    if (cardGroup) cardGroup.classList.add("hidden");
    if (compGroup) compGroup.classList.add("hidden");
    const activeSub = document.querySelector('input[name="old_sub_payment"]:checked')?.value || "Cash";
    handleOldSubPaymentChange(activeSub);
  }
}

function submitOldPatientRegistration(event) {
  if (event) event.preventDefault();

  if (!selectedOldPatient) {
    showToast("Silakan cari dan pilih pasien terlebih dahulu dari hasil pencarian RME!", "warning");
    const qInput = document.getElementById("old-search-query");
    if (qInput) qInput.focus();
    return;
  }

  try {
    const deptId = document.getElementById("old-reg-poli")?.value || SIMRS_MASTER_DATA.departments[0].id;
    const docId = document.getElementById("old-reg-doctor")?.value || SIMRS_MASTER_DATA.practitioners[0].id;
    const method = document.querySelector('input[name="old_payment_method"]:checked')?.value || "Umum";

    let subPayment = null;
    let paymentDetails = null;
    let paymentSummary = "";
    let companyName = null;
    let guarantorCode = null;
    let guarantorLetterNo = null;
    let cardNo = "-";

    if (method === "Perusahaan") {
      companyName = document.getElementById("old-payment-company-name")?.value.trim() || "";
      guarantorCode = document.getElementById("old-payment-company-code")?.value.trim() || "";
      guarantorLetterNo = document.getElementById("old-payment-company-letter")?.value.trim() || null;
      if (!companyName) {
        throw new Error("Nama Perusahaan Penjamin wajib diisi!");
      }
      if (!guarantorCode) {
        throw new Error("Kode Penjamin dari Perusahaan wajib diisi!");
      }
      cardNo = guarantorCode;
      paymentSummary = `Perusahaan: ${companyName} (${guarantorCode})`;
    } else if (method === "Umum") {
      subPayment = document.querySelector('input[name="old_sub_payment"]:checked')?.value || "Cash";
      if (subPayment === "Cash") {
        const note = document.getElementById("old-cash-note")?.value.trim() || "Tunai di Kasir";
        const amt = document.getElementById("old-cash-amount")?.value.trim() || "";
        paymentDetails = { note, amount: amt };
        paymentSummary = `Umum (Cash${note ? `: ${note}` : ''})`;
      } else if (subPayment === "Credit") {
        const bank = document.getElementById("old-credit-bank")?.value || "BCA";
        const last4 = document.getElementById("old-credit-last4")?.value.trim() || "";
        const approval = document.getElementById("old-credit-approval")?.value.trim() || "";
        if (!last4) {
          throw new Error("4 Digit Terakhir Nomor Kartu wajib diisi untuk transaksi Credit/Debit!");
        }
        paymentDetails = { bank, last4, approval };
        paymentSummary = `Umum (Credit/Debit ${bank} *${last4})`;
      } else if (subPayment === "QRIS") {
        const provider = document.getElementById("old-qris-provider")?.value || "QRIS";
        const rrn = document.getElementById("old-qris-rrn")?.value.trim() || "";
        if (!rrn) {
          throw new Error("Nomor Referensi (RRN) QRIS wajib diisi!");
        }
        paymentDetails = { provider, rrn };
        paymentSummary = `Umum (QRIS - ${provider}: ${rrn})`;
      } else if (subPayment === "VA") {
        const bank = document.getElementById("old-va-bank")?.value || "BCA";
        const vaNo = document.getElementById("old-va-number")?.value.trim() || "";
        if (!vaNo) {
          throw new Error("Nomor Virtual Account (VA) wajib diisi!");
        }
        paymentDetails = { bank, vaNo };
        paymentSummary = `Umum (VA ${bank}: ${vaNo})`;
      }
    } else {
      cardNo = document.getElementById("old-payment-card-no")?.value.trim() || "-";
      paymentSummary = `${method === "BPJS" ? "BPJS Kesehatan" : "Asuransi Swasta"} (${cardNo})`;
    }

    const registration = {
      patientId: selectedOldPatient.id,
      patientName: selectedOldPatient.name,
      mrNo: selectedOldPatient.mrNo,
      departmentId: deptId,
      practitionerId: docId,
      payerType: method,
      paymentSubMethod: subPayment,
      payerMemberNo: cardNo,
      companyName: companyName,
      guarantorCode: guarantorCode,
      guarantorLetterNo: guarantorLetterNo,
      paymentDetails: paymentDetails,
      paymentDetailSummary: paymentSummary,
      source: "Walk-in"
    };

    const visit = RegistrationService.registerWalkIn(registration);
    closeWalkinRegistrationModal();

    populateSuccessModal({
      id: visit.id,
      ticketNo: visit.ticketNo,
      patientName: visit.patientName,
      mrNo: visit.mrNo,
      poliName: visit.departmentName,
      doctorName: visit.practitionerName,
      paymentMethodText: paymentSummary
    });

    showToast(`Pendaftaran berhasil · ID ${visit.id} untuk ${visit.patientName}`, "success");

    refreshVisitsTable();
  } catch (err) {
    showToast(err.message, "danger");
  }
}

// Pasien Baru Handlers
function checkNewPatientDuplicateNik(nik) {
  const warnBox = document.getElementById("new-patient-duplicate-warning");
  const warnText = document.getElementById("new-duplicate-warning-text");
  if (!warnBox) return;

  const found = RegistrationService.checkDuplicateNik(nik);
  if (found) {
    warnBox.classList.remove("hidden");
    if (warnText) {
      warnText.innerHTML = `NIK <strong>${nik}</strong> telah terdaftar atas nama <strong>${found.name}</strong> (No. RM: <strong>${found.mrNo}</strong>). Klik tombol di samping untuk beralih ke Pasien Lama.`;
    }
  } else {
    warnBox.classList.add("hidden");
  }
}

function switchToOldPatientWithNik() {
  const nik = document.getElementById("new-reg-nik")?.value || "";
  switchWalkinMode("old");
  const qInput = document.getElementById("old-search-query");
  if (qInput) qInput.value = nik;
  searchOldPatients();
}

function handleNewBirthdateChange(val) {
  const display = document.getElementById("new-reg-age-display");
  if (!display || !val) return;
  const birth = new Date(val);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  display.textContent = `(Usia: ${Math.max(0, age)} tahun)`;
}

function handleNewPoliChange(deptId) {
  const docSelect = document.getElementById("new-reg-doctor");
  const docs = SIMRS_MASTER_DATA.practitioners.filter(p => p.department === deptId);
  if (docSelect) {
    docSelect.innerHTML = docs.map(d => `<option value="${d.id}">${d.name}</option>`).join("");
  }
}

function handleNewSubPaymentChange(subVal) {
  const subTypes = ["cash", "credit", "qris", "va"];
  subTypes.forEach(t => {
    const el = document.getElementById(`new-subdetail-${t}`);
    if (el) {
      if (t === subVal.toLowerCase()) {
        el.classList.remove("hidden");
      } else {
        el.classList.add("hidden");
      }
    }
  });
  if (subVal === "VA") {
    const bank = document.getElementById("new-va-bank")?.value || "BCA";
    generateNewVaNumber(bank);
  }
}

function generateNewVaNumber(bank) {
  const codes = { BCA: "88019", Mandiri: "89012", BRI: "12845", BNI: "98801", Permata: "84551" };
  const prefix = codes[bank] || "88019";
  const el = document.getElementById("new-va-number");
  if (el) el.value = `${prefix}20268899`;
}

function handleNewPaymentMethodChange(val) {
  const cardGroup = document.getElementById("new-payment-card-group");
  const subGroup = document.getElementById("new-payment-submethod-group");
  const compGroup = document.getElementById("new-payment-company-group");

  if (val === "Perusahaan") {
    if (compGroup) compGroup.classList.remove("hidden");
    if (cardGroup) cardGroup.classList.add("hidden");
    if (subGroup) subGroup.classList.add("hidden");
  } else if (val === "BPJS" || val === "Asuransi") {
    if (cardGroup) cardGroup.classList.remove("hidden");
    if (compGroup) compGroup.classList.add("hidden");
    if (subGroup) subGroup.classList.add("hidden");
  } else {
    // Umum
    if (subGroup) subGroup.classList.remove("hidden");
    if (cardGroup) cardGroup.classList.add("hidden");
    if (compGroup) compGroup.classList.add("hidden");
    const activeSub = document.querySelector('input[name="new_sub_payment"]:checked')?.value || "Cash";
    handleNewSubPaymentChange(activeSub);
  }
}

function submitNewPatientRegistration(event) {
  if (event) event.preventDefault();

  try {
    const nik = document.getElementById("new-reg-nik")?.value.trim();
    const name = document.getElementById("new-reg-name")?.value.trim();
    const gender = document.getElementById("new-reg-gender")?.value;
    const birthDate = document.getElementById("new-reg-birthdate")?.value;
    const phone = document.getElementById("new-reg-phone")?.value.trim();
    const address = document.getElementById("new-reg-address")?.value.trim();
    const bloodType = document.getElementById("new-reg-blood")?.value || "O+";
    const paymentMethod = document.querySelector('input[name="new_payment_method"]:checked')?.value || "Umum";

    let subPayment = null;
    let paymentDetails = null;
    let paymentSummary = "";
    let companyName = null;
    let guarantorCode = null;
    let guarantorLetterNo = null;
    let cardNo = "-";

    if (paymentMethod === "Perusahaan") {
      companyName = document.getElementById("new-payment-company-name")?.value.trim() || "";
      guarantorCode = document.getElementById("new-payment-company-code")?.value.trim() || "";
      guarantorLetterNo = document.getElementById("new-payment-company-letter")?.value.trim() || null;
      if (!companyName) {
        throw new Error("Nama Perusahaan Penjamin wajib diisi!");
      }
      if (!guarantorCode) {
        throw new Error("Kode Penjamin dari Perusahaan wajib diisi!");
      }
      cardNo = guarantorCode;
      paymentSummary = `Perusahaan: ${companyName} (${guarantorCode})`;
    } else if (paymentMethod === "Umum") {
      subPayment = document.querySelector('input[name="new_sub_payment"]:checked')?.value || "Cash";
      if (subPayment === "Cash") {
        const note = document.getElementById("new-cash-note")?.value.trim() || "Tunai di Kasir";
        const amt = document.getElementById("new-cash-amount")?.value.trim() || "";
        paymentDetails = { note, amount: amt };
        paymentSummary = `Umum (Cash${note ? `: ${note}` : ''})`;
      } else if (subPayment === "Credit") {
        const bank = document.getElementById("new-credit-bank")?.value || "BCA";
        const last4 = document.getElementById("new-credit-last4")?.value.trim() || "";
        const approval = document.getElementById("new-credit-approval")?.value.trim() || "";
        if (!last4) {
          throw new Error("4 Digit Terakhir Nomor Kartu wajib diisi untuk transaksi Credit/Debit!");
        }
        paymentDetails = { bank, last4, approval };
        paymentSummary = `Umum (Credit/Debit ${bank} *${last4})`;
      } else if (subPayment === "QRIS") {
        const provider = document.getElementById("new-qris-provider")?.value || "QRIS";
        const rrn = document.getElementById("new-qris-rrn")?.value.trim() || "";
        if (!rrn) {
          throw new Error("Nomor Referensi (RRN) QRIS wajib diisi!");
        }
        paymentDetails = { provider, rrn };
        paymentSummary = `Umum (QRIS - ${provider}: ${rrn})`;
      } else if (subPayment === "VA") {
        const bank = document.getElementById("new-va-bank")?.value || "BCA";
        const vaNo = document.getElementById("new-va-number")?.value.trim() || "";
        if (!vaNo) {
          throw new Error("Nomor Virtual Account (VA) wajib diisi!");
        }
        paymentDetails = { bank, vaNo };
        paymentSummary = `Umum (VA ${bank}: ${vaNo})`;
      }
    } else {
      cardNo = document.getElementById("new-payment-card-no")?.value.trim() || "-";
      paymentSummary = `${paymentMethod === "BPJS" ? "BPJS Kesehatan" : "Asuransi Swasta"} (${cardNo})`;
    }

    if (!nik || nik.length < 16) {
      throw new Error("NIK harus terdiri dari 16 digit angka!");
    }
    if (!name) {
      throw new Error("Nama pasien wajib diisi!");
    }
    if (!birthDate) {
      throw new Error("Tanggal lahir wajib diisi!");
    }

    const newPatient = RegistrationService.createPatient({
      nik: nik,
      name: name,
      gender: gender,
      birthDate: birthDate,
      phone: phone,
      address: address,
      bloodType: bloodType,
      payerType: paymentMethod,
      payerMemberNo: cardNo,
      companyName: companyName,
      guarantorCode: guarantorCode
    });

    const deptId = document.getElementById("new-reg-poli")?.value || SIMRS_MASTER_DATA.departments[0].id;
    const docId = document.getElementById("new-reg-doctor")?.value || SIMRS_MASTER_DATA.practitioners[0].id;

    const visit = RegistrationService.registerWalkIn({
      patientId: newPatient.id,
      patientName: newPatient.name,
      mrNo: newPatient.mrNo,
      departmentId: deptId,
      practitionerId: docId,
      payerType: paymentMethod,
      paymentSubMethod: subPayment,
      payerMemberNo: cardNo,
      companyName: companyName,
      guarantorCode: guarantorCode,
      guarantorLetterNo: guarantorLetterNo,
      paymentDetails: paymentDetails,
      paymentDetailSummary: paymentSummary,
      source: "Walk-in"
    });

    closeWalkinRegistrationModal();

    populateSuccessModal({
      id: visit.id,
      ticketNo: visit.ticketNo,
      patientName: visit.patientName,
      mrNo: visit.mrNo,
      poliName: visit.departmentName,
      doctorName: visit.practitionerName,
      paymentMethodText: paymentSummary
    });

    showToast(`Pasien Baru ${newPatient.name} terdaftar! ID: ${visit.id}`, "success");

    refreshVisitsTable();
  } catch (err) {
    showToast(err.message, "danger");
  }
}

function populateSuccessModal({ id, ticketNo, patientName, mrNo, poliName, doctorName, paymentMethodText }) {
  const mNumber = document.getElementById("ticket-modal-number");
  const mRegId = document.getElementById("ticket-modal-reg-id");
  const mName = document.getElementById("ticket-modal-name");
  const mMrn = document.getElementById("ticket-modal-mrn");
  const mPoli = document.getElementById("ticket-modal-poli");
  const mDoc = document.getElementById("ticket-modal-doctor");
  const mPayment = document.getElementById("ticket-modal-payment");
  const mTime = document.getElementById("ticket-modal-time");

  if (mNumber) mNumber.textContent = ticketNo;
  if (mRegId) mRegId.textContent = id || "REG-WALK-B8K21";
  if (mName) mName.textContent = patientName;
  if (mMrn) mMrn.textContent = mrNo;
  if (mPoli) mPoli.textContent = poliName;
  if (mDoc) mDoc.textContent = doctorName;
  if (mPayment) mPayment.textContent = paymentMethodText || "Umum (Cash)";
  if (mTime) {
    const now = new Date();
    mTime.textContent = `${now.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}, ${now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} WIB`;
  }

  const modal = document.getElementById("success-modal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }
}

function playAudioCall(ticketNo, patientName) {
  if (isAudioEnabled && window.speechSynthesis) {
    const textToSpeak = `Nomor antrian ${ticketNo}, atas nama ${patientName}, silakan menuju ruang triase rawat jalan.`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "id-ID";
    window.speechSynthesis.speak(utterance);
  }
}

function refreshVisitsTable() {
  const tblContainer = document.getElementById("registration-visits-table-container") || document.getElementById("recent-visits-table-container");
  if (tblContainer) {
    tblContainer.innerHTML = renderRecentVisitsTableHtml();
  }
}

// ========================================================
// WORKSPACE 1.B: REGISTRASI SUB-VIEWS (Modular & Decluttered)
// ========================================================

// 1.1 REGISTRASI DASHBOARD (Ringkasan Admisi)
function renderRegDashboardView(container) {
  const visits = VisitStateService.getVisits();
  const walkinVisits = visits.filter(v => v.visitType !== "Appointment");
  const appointmentVisits = visits.filter(v => v.visitType === "Appointment");
  const bpjsVisits = visits.filter(v => v.payerType === "BPJS");

  container.innerHTML = `
    <div class="flex flex-col gap-space-lg w-full">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm border-b border-line/40">
        <div>
          <h1 class="font-headline-lg text-headline-lg text-ink font-bold tracking-tight">Dashboard Pendaftaran &amp; Admisi</h1>
          <p class="font-caption text-caption text-ink-soft">Pusat kendali loket pendaftaran rawat jalan, kuota poliklinik, dan verifikasi kepesertaan.</p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="activeWorkspaceId='registrasi'; renderSidebar(); renderContextualTopBar(); renderWorkspace('registrasi');" class="h-9 px-4 bg-brand hover:bg-brand-strong text-on-primary rounded-xl font-body-strong text-caption font-bold flex items-center gap-1.5 shadow-sm transition">
            <span class="material-symbols-outlined text-[18px]">person_add</span>
            <span>Pendaftaran Walk-in Baru</span>
          </button>
        </div>
      </div>

      <!-- 3 Key Metric Pills -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
        <div class="p-space-md bg-surface rounded-2xl border border-line/50 flex items-center justify-between shadow-xs">
          <div>
            <span class="text-caption text-ink-soft font-semibold block">Pasien Walk-in Hari Ini</span>
            <span class="font-headline-lg text-[28px] font-bold text-brand mt-0.5 block">${walkinVisits.length}</span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-brand-tint text-brand flex items-center justify-center">
            <span class="material-symbols-outlined text-[26px]">directions_walk</span>
          </div>
        </div>

        <div class="p-space-md bg-surface rounded-2xl border border-line/50 flex items-center justify-between shadow-xs">
          <div>
            <span class="text-caption text-ink-soft font-semibold block">Peserta Rujukan BPJS</span>
            <span class="font-headline-lg text-[28px] font-bold text-emerald-600 mt-0.5 block">${bpjsVisits.length}</span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span class="material-symbols-outlined text-[26px]">verified_user</span>
          </div>
        </div>

        <div class="p-space-md bg-surface rounded-2xl border border-line/50 flex items-center justify-between shadow-xs">
          <div>
            <span class="text-caption text-ink-soft font-semibold block">Total Kunjungan Terdaftar</span>
            <span class="font-headline-lg text-[28px] font-bold text-blue-600 mt-0.5 block">${visits.length}</span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <span class="material-symbols-outlined text-[26px]">how_to_reg</span>
          </div>
        </div>
      </div>

      <!-- Quick Action Cards (2 Grid: Walk-in & BPJS) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
        <button onclick="activeWorkspaceId='registrasi'; renderSidebar(); renderContextualTopBar(); renderWorkspace('registrasi');" class="p-space-md bg-surface hover:bg-canvas border border-line/50 rounded-2xl flex flex-col items-center text-center gap-2 transition group shadow-xs">
          <div class="w-11 h-11 rounded-xl bg-brand-tint text-brand flex items-center justify-center group-hover:scale-105 transition-transform">
            <span class="material-symbols-outlined text-[24px]">person_add</span>
          </div>
          <div>
            <span class="font-body-strong text-ink text-[13px] block font-bold">Pendaftaran Walk-in</span>
            <span class="text-[11px] text-ink-soft">Daftar pasien loket langsung &amp; terbitkan tiket</span>
          </div>
        </button>

        <button onclick="activeWorkspaceId='reg-bpjs'; renderSidebar(); renderContextualTopBar(); renderWorkspace('reg-bpjs');" class="p-space-md bg-surface hover:bg-canvas border border-line/50 rounded-2xl flex flex-col items-center text-center gap-2 transition group shadow-xs">
          <div class="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
            <span class="material-symbols-outlined text-[24px]">verified_user</span>
          </div>
          <div>
            <span class="font-body-strong text-ink text-[13px] block font-bold">Rujukan BPJS &amp; SEP</span>
            <span class="text-[11px] text-ink-soft">Bridging VClaim BPJS &amp; Surat Eligibilitas</span>
          </div>
        </button>
      </div>

      <!-- Recent Registrations Table -->
      <div class="bg-surface rounded-2xl border border-line/50 overflow-hidden shadow-xs">
        <div class="p-space-md border-b border-line/30 flex items-center justify-between">
          <h2 class="font-headline-md text-[16px] text-ink font-bold flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px] text-brand">history</span>
            <span>Kunjungan Pasien Terdaftar Hari Ini</span>
          </h2>
          <span class="text-caption text-ink-soft font-mono">Total: ${visits.length}</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-canvas/50 border-b border-line/40 text-caption font-semibold text-ink-soft">
                <th class="py-2.5 px-4">ID</th>
                <th class="py-2.5 px-4">Jam</th>
                <th class="py-2.5 px-4">Pasien &amp; No. RM</th>
                <th class="py-2.5 px-4">Poli &amp; DPJP</th>
                <th class="py-2.5 px-4">Penjamin</th>
                <th class="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line/30">
              ${visits.slice(0, 6).map(v => `
                <tr class="hover:bg-canvas/40 transition">
                  <td class="py-2.5 px-4 font-mono font-bold text-caption text-brand">${v.id}</td>
                  <td class="py-2.5 px-4 font-mono text-caption text-ink font-semibold">${formatRegistrationTime(v.registeredAt || v.checkedInAt)}</td>
                  <td class="py-2.5 px-4">
                    <span class="font-body-strong text-ink block text-[13px] font-bold">${v.patientName}</span>
                    <span class="text-[11px] font-mono text-ink-soft">${v.mrNo}</span>
                  </td>
                  <td class="py-2.5 px-4 text-caption text-ink-soft">
                    <span class="text-ink font-medium block">${v.departmentName}</span>
                    <span class="text-[11px]">${v.practitionerName}</span>
                  </td>
                  <td class="py-2.5 px-4 text-caption">
                    <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold ${v.payerType === 'BPJS' ? 'bg-info-tint text-info' : 'bg-surface-container-low text-ink-soft'}">
                      ${v.payerType}
                    </span>
                  </td>
                  <td class="py-2.5 px-4">
                    ${renderStatusChip(v.visitStatus)}
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

// 1.2 REGISTRASI ANTRIAN LOKET (Deprecated - Fallback to Pendaftaran Walk-in)
function renderRegQueueView(container) {
  renderRegistrasiWorkspace(container);
}

// 1.3 REGISTRASI BOOKING & QR (Scan QR & Pre-booked Appointments)
function renderRegBookingView(container) {
  const appointments = SIMRS_MASTER_DATA.appointments || [];

  container.innerHTML = `
    <div class="flex flex-col gap-space-lg w-full">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm border-b border-line/40">
        <div>
          <h1 class="font-headline-lg text-headline-lg text-ink font-bold tracking-tight">Check-In Booking Online &amp; Scan QR</h1>
          <p class="font-caption text-caption text-ink-soft">Konfirmasi kedatangan pasien perjanjian/booking kanal mandiri dan penerbitan tiket antrian.</p>
        </div>
      </div>

      <!-- Quick Scan Box -->
      <div class="p-space-lg bg-surface rounded-2xl border border-line/50 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[36px]">qr_code_scanner</span>
          </div>
          <div>
            <h2 class="font-headline-md text-[16px] text-ink font-bold">Pindai QR Code atau Masukkan Kode Booking</h2>
            <p class="font-caption text-caption text-ink-soft mt-0.5">Pasien yang telah mendaftar melalui aplikasi mobile / WhatsApp dapat check-in langsung.</p>
          </div>
        </div>

        <div class="flex items-center gap-2 w-full md:w-auto">
          <div class="relative flex-1 md:w-64">
            <span class="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-ink-soft">qr_code</span>
            <input type="text" id="booking-code-input" placeholder="contoh: APT-2026-0102" class="w-full h-10 pl-9 pr-3 bg-canvas rounded-xl font-mono text-caption text-ink border border-line/60 focus:outline-none focus:ring-2 focus:ring-brand shadow-inner">
          </div>
          <button onclick="handleCheckinBooking(document.getElementById('booking-code-input').value)" class="h-10 px-4 bg-brand hover:bg-brand-strong text-on-primary rounded-xl font-body-strong text-caption font-bold transition shadow-sm shrink-0">
            Check-In
          </button>
        </div>
      </div>

      <!-- Pre-Booked Appointments Table -->
      <div class="bg-surface rounded-2xl border border-line/50 overflow-hidden shadow-xs">
        <div class="p-space-md border-b border-line/30 flex items-center justify-between">
          <span class="font-headline-md text-[16px] text-ink font-bold">Daftar Pasien Perjanjian Hari Ini (Kanal Online / Telepon)</span>
          <span class="text-caption text-ink-soft font-mono">${appointments.length} Terjadwal</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-canvas/50 border-b border-line/40 text-caption font-semibold text-ink-soft uppercase text-[11px]">
                <th class="py-3 px-4">Kode Booking</th>
                <th class="py-3 px-4">Pasien &amp; No. RM</th>
                <th class="py-3 px-4">Poli &amp; DPJP</th>
                <th class="py-3 px-4">Slot Jadwal</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Aksi Check-In</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line/30">
              ${appointments.map(apt => `
                <tr class="hover:bg-canvas/30 transition">
                  <td class="py-3 px-4 font-mono font-bold text-caption text-brand">
                    <span class="px-2.5 py-1 bg-brand-tint rounded-lg">${apt.id}</span>
                  </td>
                  <td class="py-3 px-4">
                    <span class="font-body-strong text-ink block font-bold text-[13px]">${apt.patientName}</span>
                    <span class="font-mono text-[11px] text-ink-soft">${apt.mrNo} · Telp: ${apt.phone}</span>
                  </td>
                  <td class="py-3 px-4 text-caption text-ink-soft">
                    <span class="text-ink font-medium block">${apt.departmentName}</span>
                    <span class="text-[11px]">${apt.practitionerName}</span>
                  </td>
                  <td class="py-3 px-4 font-mono text-caption text-ink">
                    ${apt.slotTime}
                  </td>
                  <td class="py-3 px-4">
                    <span class="px-2.5 py-0.5 rounded-full text-caption font-semibold ${
                      apt.status === 'Checked-in' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }">
                      ${apt.status}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-right">
                    ${apt.status === 'Checked-in' ? `
                      <span class="text-[12px] text-emerald-700 font-semibold flex items-center justify-end gap-1">
                        <span class="material-symbols-outlined text-[16px]">check_circle</span>
                        <span>Sudah Check-In</span>
                      </span>
                    ` : `
                      <button onclick="handleCheckinBooking('${apt.id}')" class="h-8 px-3.5 bg-brand hover:bg-brand-strong text-on-primary rounded-lg text-caption font-bold transition shadow-xs inline-flex items-center gap-1">
                        <span class="material-symbols-outlined text-[15px]">how_to_reg</span>
                        <span>Check-In &amp; Tiket</span>
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

// 1.4 REGISTRASI BPJS & SEP (VClaim Bridging)
function renderRegBpjsView(container) {
  container.innerHTML = `
    <div class="flex flex-col gap-space-lg w-full max-w-4xl mx-auto">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm border-b border-line/40">
        <div>
          <h1 class="font-headline-lg text-headline-lg text-ink font-bold tracking-tight">Verifikasi Rujukan BPJS &amp; Penerbitan SEP</h1>
          <p class="font-caption text-caption text-ink-soft">Simulasi bridging BPJS VClaim v2.0 untuk penerbitan Surat Eligibilitas Peserta (SEP).</p>
        </div>
      </div>

      <!-- Verification Form Box -->
      <div class="bg-surface rounded-2xl border border-line/50 p-space-lg flex flex-col gap-space-md shadow-xs">
        <h2 class="font-headline-md text-[16px] text-ink font-bold flex items-center gap-2">
          <span class="material-symbols-outlined text-[20px] text-emerald-700">verified_user</span>
          <span>Pemeriksaan Data Rujukan Faskes Tingkat 1 (FKTP)</span>
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          <div>
            <label class="block font-body-strong mb-1 text-ink text-caption">Nomor Kartu BPJS (13 Digit) *</label>
            <input type="text" id="bpjs-card-no" value="0001234567890" class="w-full h-10 px-3 bg-canvas rounded-xl font-mono text-body-default text-ink border border-line/60 focus:outline-none focus:ring-2 focus:ring-brand">
          </div>
          <div>
            <label class="block font-body-strong mb-1 text-ink text-caption">Nomor Surat Rujukan FKTP *</label>
            <input type="text" id="bpjs-ref-no" value="0115R0011026P000042" class="w-full h-10 px-3 bg-canvas rounded-xl font-mono text-body-default text-ink border border-line/60 focus:outline-none focus:ring-2 focus:ring-brand">
          </div>
        </div>

        <div class="flex justify-end">
          <button type="button" onclick="handleVerifyBpjs()" class="h-10 px-5 bg-brand hover:bg-brand-strong text-on-primary rounded-xl font-body-strong text-caption font-bold transition flex items-center gap-1.5 shadow-sm">
            <span class="material-symbols-outlined text-[18px]">search_check</span>
            <span>Cek Eligibilitas VClaim</span>
          </button>
        </div>

        <!-- Verified Result Card (VClaim Output) -->
        <div id="bpjs-verification-result" class="mt-2 p-space-md bg-emerald-50/60 rounded-xl border border-emerald-200 flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <span class="text-caption font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[18px] text-emerald-700">check_circle</span>
              <span>Peserta Terverifikasi Aktif (BPJS Mandiri / PBI)</span>
            </span>
            <span class="text-caption font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">Kelas 1</span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-caption">
            <div>
              <span class="text-ink-soft block">Nama Peserta:</span>
              <strong class="text-ink">Siti Rahmawati</strong>
            </div>
            <div>
              <span class="text-ink-soft block">Faskes Asal:</span>
              <strong class="text-ink">Puskesmas Menteng</strong>
            </div>
            <div>
              <span class="text-ink-soft block">Diagnosa Rujukan:</span>
              <strong class="text-ink">I10 (Hipertensi Primer)</strong>
            </div>
            <div>
              <span class="text-ink-soft block">Poli Rujukan:</span>
              <strong class="text-ink">Penyakit Dalam</strong>
            </div>
          </div>

          <div class="pt-2 border-t border-emerald-200/60 flex items-center justify-between">
            <span class="text-[11px] text-emerald-700 font-mono">Kode Respon VClaim: 200 OK · Eligibilitas Terbit</span>
            <button onclick="handleIssueSepAndRegister()" class="h-9 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-caption font-bold transition flex items-center gap-1.5 shadow-sm">
              <span class="material-symbols-outlined text-[17px]">print</span>
              <span>Terbitkan SEP &amp; Daftarkan Kunjungan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// 1.5 REGISTRASI MASTER PASIEN (Directory Pasien SIMRS)
function renderRegPatientsView(container) {
  const patients = SIMRS_MASTER_DATA.initialPatients || [];

  container.innerHTML = `
    <div class="flex flex-col gap-space-lg w-full">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm border-b border-line/40">
        <div>
          <h1 class="font-headline-lg text-headline-lg text-ink font-bold tracking-tight">Master Data Pasien Rawat Jalan</h1>
          <p class="font-caption text-caption text-ink-soft">Basis data rekam medis pasien terdaftar di RS Sehat Mandiri.</p>
        </div>
        <button onclick="activeWorkspaceId='registrasi'; renderSidebar(); renderContextualTopBar(); renderWorkspace('registrasi');" class="h-9 px-4 bg-brand hover:bg-brand-strong text-on-primary rounded-xl font-body-strong text-caption font-bold flex items-center gap-1.5 shadow-sm transition">
          <span class="material-symbols-outlined text-[18px]">person_add</span>
          <span>Registrasi Pasien Baru</span>
        </button>
      </div>

      <div class="bg-surface rounded-2xl border border-line/50 overflow-hidden shadow-xs">
        <div class="p-space-md border-b border-line/30 flex items-center justify-between">
          <span class="font-headline-md text-[16px] text-ink font-bold">Daftar Rekam Medis Pasien</span>
          <span class="text-caption text-ink-soft font-mono">${patients.length} Pasien Terdaftar</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-canvas/50 border-b border-line/40 text-caption font-semibold text-ink-soft uppercase text-[11px]">
                <th class="py-3 px-4">No. RM</th>
                <th class="py-3 px-4">Nama Lengkap &amp; NIK</th>
                <th class="py-3 px-4">Jenis Kelamin / Tgl Lahir</th>
                <th class="py-3 px-4">Kontak &amp; Alamat</th>
                <th class="py-3 px-4">Penjamin Utama</th>
                <th class="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line/30">
              ${patients.map(p => `
                <tr class="hover:bg-canvas/30 transition">
                  <td class="py-3 px-4 font-mono font-bold text-caption text-brand">
                    <span class="px-2.5 py-1 bg-brand-tint rounded-lg">${p.mrNo}</span>
                  </td>
                  <td class="py-3 px-4">
                    <span class="font-body-strong text-ink block font-bold text-[13px]">${p.fullName}</span>
                    <span class="font-mono text-[11px] text-ink-soft">NIK: ${p.nik}</span>
                  </td>
                  <td class="py-3 px-4 text-caption text-ink">
                    <span class="font-medium">${p.gender === 'Female' ? 'Perempuan' : 'Laki-laki'}</span>
                    <span class="text-ink-soft block text-[11px]">${p.dob}</span>
                  </td>
                  <td class="py-3 px-4 text-caption text-ink-soft">
                    <span class="text-ink font-medium block">${p.phone}</span>
                    <span class="text-[11px] truncate max-w-xs block">${p.address}</span>
                  </td>
                  <td class="py-3 px-4 text-caption">
                    <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${p.primaryPayer === 'BPJS' ? 'bg-info-tint text-info' : 'bg-surface-container-low text-ink-soft'}">
                      ${p.primaryPayer}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-right">
                    <button onclick="selectPatientForWalkin('${p.mrNo}')" class="h-8 px-3 rounded-xl bg-brand hover:bg-brand-strong text-on-primary font-body-strong text-[12px] font-bold transition inline-flex items-center gap-1 shadow-xs">
                      <span>Daftarkan</span>
                    </button>
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

// Helpers for registration workflows
function handleCheckinBooking(code) {
  if (!code) {
    showToast("Masukkan kode booking terlebih dahulu.", "warning");
    return;
  }
  const apt = SIMRS_MASTER_DATA.appointments.find(a => a.id.toLowerCase() === code.toLowerCase());
  if (apt) {
    apt.status = "Checked-in";
    showToast(`Check-in berhasil untuk ${apt.patientName}. Tiket antrian T-004 telah diterbitkan.`, "success");
    renderRegBookingView(document.getElementById("main-viewport"));
  } else {
    showToast(`Kode booking '${code}' tidak ditemukan.`, "danger");
  }
}

function handleVerifyBpjs() {
  showToast("VClaim Response: Kartu BPJS aktif, surat rujukan valid.", "success");
}

function handleIssueSepAndRegister() {
  showToast("SEP No: 0115R0011026V000188 berhasil diterbitkan. Pasien didaftarkan ke Poli Penyakit Dalam.", "success");
  activeWorkspaceId = "registrasi";
  renderSidebar();
  renderContextualTopBar();
  renderWorkspace(activeWorkspaceId);
}

function selectPatientForWalkin(mrNo) {
  activeWorkspaceId = "registrasi";
  renderSidebar();
  renderContextualTopBar();
  renderWorkspace(activeWorkspaceId);
  showToast(`Pasien ${mrNo} dipilih untuk pendaftaran.`, "info");
}

// ========================================================
// WORKSPACE 2: PERAWAT & TRIASE (MODUL TTV RAWAT JALAN)
// Separating Navigation (L1), Context (L2), Actions (L3)
// ========================================================

// 2.1 PERAWAT DASHBOARD (Overview Ringkas)
function renderNurseDashboardView(container) {
  const visits = VisitStateService.getVisits();
  const waitingTriage = visits.filter(v => v.visitStatus === "WAITING_TRIAGE");
  const inTriage = visits.filter(v => v.visitStatus === "IN_TRIAGE");
  const completedTriage = visits.filter(v => v.visitStatus !== "WAITING_TRIAGE" && v.vitals);

  const activeVisit = activeTriageVisitId
    ? visits.find(v => v.id === activeTriageVisitId)
    : inTriage[0];

  container.innerHTML = `
    <div class="flex flex-col gap-space-lg w-full">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm border-b border-line/40">
        <div>
          <h1 class="font-headline-lg text-headline-lg text-ink font-bold tracking-tight">Dashboard Perawat Rawat Jalan</h1>
          <p class="font-caption text-caption text-ink-soft">Pemantauan antrian triase, stasiun tanda vital (TTV), dan routing ke poliklinik.</p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="activeWorkspaceId='ttv-queue'; renderSidebar(); renderContextualTopBar(); renderWorkspace('ttv-queue');" class="h-9 px-4 bg-brand hover:bg-brand-strong text-on-primary rounded-xl font-body-strong text-caption font-bold flex items-center gap-1.5 shadow-sm transition">
            <span class="material-symbols-outlined text-[18px]">checklist</span>
            <span>Buka Antrian Triase</span>
          </button>
        </div>
      </div>

      <!-- 3 Key Metric Pills -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
        <div class="p-space-md bg-surface rounded-2xl border border-line/50 flex items-center justify-between shadow-xs">
          <div>
            <span class="text-caption text-ink-soft font-semibold block">Menunggu Triase</span>
            <span class="font-headline-lg text-[28px] font-bold text-amber-600 mt-0.5 block">${waitingTriage.length}</span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <span class="material-symbols-outlined text-[26px]">hourglass_top</span>
          </div>
        </div>

        <div class="p-space-md bg-surface rounded-2xl border border-line/50 flex items-center justify-between shadow-xs">
          <div>
            <span class="text-caption text-ink-soft font-semibold block">Sedang Dilayani TTV</span>
            <span class="font-headline-lg text-[28px] font-bold text-brand mt-0.5 block">${inTriage.length}</span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-brand-tint text-brand flex items-center justify-center">
            <span class="material-symbols-outlined text-[26px]">vital_signs</span>
          </div>
        </div>

        <div class="p-space-md bg-surface rounded-2xl border border-line/50 flex items-center justify-between shadow-xs">
          <div>
            <span class="text-caption text-ink-soft font-semibold block">Selesai Triase Hari Ini</span>
            <span class="font-headline-lg text-[28px] font-bold text-emerald-600 mt-0.5 block">${completedTriage.length}</span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span class="material-symbols-outlined text-[26px]">check_circle</span>
          </div>
        </div>
      </div>

      <!-- Pasien Aktif / Antrian Terdekat -->
      ${activeVisit ? `
        <div class="p-space-md bg-brand-tint/30 rounded-2xl border border-brand/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-brand text-on-primary flex items-center justify-center font-bold text-caption font-mono">
              ${activeVisit.ticketNo}
            </div>
            <div>
              <span class="text-[11px] font-bold uppercase tracking-wider text-brand block">Pasien Aktif di Meja Triase</span>
              <span class="font-body-strong text-ink font-bold text-[15px]">${activeVisit.patientName}</span>
              <span class="text-caption text-ink-soft font-mono ml-1.5">(${activeVisit.mrNo}) · ${activeVisit.departmentName}</span>
            </div>
          </div>
          <button onclick="startNurseTriage('${activeVisit.id}')" class="h-9 px-4 bg-brand hover:bg-brand-strong text-on-primary rounded-xl font-body-strong text-caption font-bold flex items-center gap-1.5 shadow-sm transition">
            <span class="material-symbols-outlined text-[17px]">vital_signs</span>
            <span>Lanjutkan Input TTV</span>
          </button>
        </div>
      ` : ''}

      <!-- Next Waiting Patients Table -->
      <div class="bg-surface rounded-2xl border border-line/50 overflow-hidden shadow-xs">
        <div class="p-space-md border-b border-line/30 flex items-center justify-between">
          <h2 class="font-headline-md text-[16px] text-ink font-bold flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px] text-brand">queue</span>
            <span>Antrian Pasien Berikutnya untuk Pengukuran TTV</span>
          </h2>
          <span class="text-caption text-ink-soft">Total menunggu: <strong>${waitingTriage.length}</strong></span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-canvas/50 border-b border-line/40 text-caption font-semibold text-ink-soft">
                <th class="py-2.5 px-4">Tiket</th>
                <th class="py-2.5 px-4">Pasien &amp; No. RM</th>
                <th class="py-2.5 px-4">Poli &amp; Dokter Tujuan</th>
                <th class="py-2.5 px-4">Penjamin</th>
                <th class="py-2.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line/30">
              ${waitingTriage.length === 0 ? `
                <tr><td colspan="5" class="py-8 text-center text-ink-soft text-caption">Tidak ada pasien yang menunggu triase saat ini.</td></tr>
              ` : waitingTriage.slice(0, 5).map(v => `
                <tr class="hover:bg-canvas/40 transition">
                  <td class="py-2.5 px-4 font-mono font-bold text-caption text-brand">${v.ticketNo}</td>
                  <td class="py-2.5 px-4">
                    <span class="font-body-strong text-ink block text-[13px] font-bold">${v.patientName}</span>
                    <span class="text-[11px] font-mono text-ink-soft">${v.mrNo}</span>
                  </td>
                  <td class="py-2.5 px-4 text-caption text-ink-soft">
                    <span class="text-ink font-medium block">${v.departmentName}</span>
                    <span class="text-[11px]">${v.practitionerName}</span>
                  </td>
                  <td class="py-2.5 px-4 text-caption">
                    <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold ${v.payerType === 'BPJS' ? 'bg-info-tint text-info' : 'bg-surface-container-low text-ink-soft'}">
                      ${v.payerType}
                    </span>
                  </td>
                  <td class="py-2.5 px-4 text-right">
                    <button onclick="startNurseTriage('${v.id}')" class="h-8 px-3 rounded-xl bg-brand hover:bg-brand-strong text-on-primary font-body-strong text-[12px] font-bold transition inline-flex items-center gap-1 shadow-xs">
                      <span class="material-symbols-outlined text-[15px]">vital_signs</span>
                      <span>Ukur TTV</span>
                    </button>
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

// 2.2 PERAWAT ANTRIAN TRIASE (Dedicated Queue Workstation - NO CARD OVERUSE)
function renderTtvQueueView(container) {
  const visits = VisitStateService.getVisits();
  let triageQueue = visits.filter(v => v.visitStatus === "WAITING_TRIAGE" || v.visitStatus === "IN_TRIAGE");

  if (searchQuery) {
    triageQueue = triageQueue.filter(v =>
      (v.patientName && v.patientName.toLowerCase().includes(searchQuery)) ||
      (v.mrNo && v.mrNo.toLowerCase().includes(searchQuery)) ||
      (v.ticketNo && v.ticketNo.toLowerCase().includes(searchQuery)) ||
      (v.departmentName && v.departmentName.toLowerCase().includes(searchQuery))
    );
  }

  // Filter Poli & Dokter
  if (triageDeptFilter !== "ALL") {
    triageQueue = triageQueue.filter(v => {
      if (v.departmentId && v.departmentId !== triageDeptFilter) return false;
      if (!v.departmentId && v.departmentName) {
        const matchDept = SIMRS_MASTER_DATA.departments.find(d => d.id === triageDeptFilter);
        if (matchDept && v.departmentName !== matchDept.name) return false;
      }
      return true;
    });
  }

  if (triageDoctorFilter !== "ALL") {
    triageQueue = triageQueue.filter(v => {
      if (v.practitionerId && v.practitionerId !== triageDoctorFilter) return false;
      if (!v.practitionerId && v.practitionerName) {
        const matchDoc = SIMRS_MASTER_DATA.practitioners.find(d => d.id === triageDoctorFilter);
        if (matchDoc && !v.practitionerName.includes(matchDoc.name.split(',')[0])) return false;
      }
      return true;
    });
  }

  const availableDoctors = triageDeptFilter === "ALL"
    ? SIMRS_MASTER_DATA.practitioners
    : SIMRS_MASTER_DATA.practitioners.filter(p => p.department === triageDeptFilter);

  container.innerHTML = `
    <div class="flex flex-col gap-space-lg w-full">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm border-b border-line/40">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="font-headline-lg text-headline-lg text-ink font-bold tracking-tight">Antrian Triase Rawat Jalan</h1>
            <span class="px-2.5 py-0.5 rounded-full text-caption font-bold bg-amber-100 text-amber-800 font-mono">
              ${triageQueue.length} Pasien
            </span>
          </div>
          <p class="font-caption text-caption text-ink-soft">Pilih pasien untuk memulai pengukuran tanda vital (TTV) dan skrining triase awal.</p>
        </div>
      </div>

      <!-- Compact Filter Bar -->
      <div class="p-3 bg-surface rounded-2xl border border-line/50 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div class="flex flex-wrap items-center gap-2.5">
          <div class="flex items-center gap-1.5 text-caption font-semibold text-ink-soft">
            <span class="material-symbols-outlined text-[18px] text-brand">filter_alt</span>
            <span>Stasiun Poli:</span>
          </div>

          <select onchange="handleTriageDeptChange(this.value)" class="h-9 px-3 bg-canvas text-ink text-caption font-medium rounded-xl border border-line/60 focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer">
            <option value="ALL" ${triageDeptFilter === 'ALL' ? 'selected' : ''}>Semua Poliklinik</option>
            ${SIMRS_MASTER_DATA.departments.map(d => `
              <option value="${d.id}" ${triageDeptFilter === d.id ? 'selected' : ''}>${d.name} (${d.room})</option>
            `).join("")}
          </select>

          <select onchange="handleTriageDoctorChange(this.value)" class="h-9 px-3 bg-canvas text-ink text-caption font-medium rounded-xl border border-line/60 focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer">
            <option value="ALL" ${triageDoctorFilter === 'ALL' ? 'selected' : ''}>Semua Dokter</option>
            ${availableDoctors.map(doc => `
              <option value="${doc.id}" ${triageDoctorFilter === doc.id ? 'selected' : ''}>${doc.name}</option>
            `).join("")}
          </select>

          ${(triageDeptFilter !== 'ALL' || triageDoctorFilter !== 'ALL') ? `
            <button onclick="handleTriageDeptChange('ALL'); handleTriageDoctorChange('ALL');" class="text-caption font-bold text-brand hover:underline px-2">
              Reset Filter
            </button>
          ` : ''}
        </div>

        <div class="text-caption text-ink-soft font-mono">
          Stasiun Aktif: <strong class="text-ink">${triageDeptFilter === 'ALL' ? 'Sentral Multi-Poli' : triageDeptFilter}</strong>
        </div>
      </div>

      <!-- Structured Data Table (Stitch Design System Table) -->
      <div class="bg-surface rounded-2xl border border-line/50 overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-canvas/60 border-b border-line/40 text-caption font-semibold text-ink-soft uppercase tracking-wider text-[11px]">
                <th class="py-3 px-4">No. Tiket</th>
                <th class="py-3 px-4">Pasien &amp; No. RM</th>
                <th class="py-3 px-4">Poli &amp; Dokter Tujuan</th>
                <th class="py-3 px-4">Penjamin</th>
                <th class="py-3 px-4">Jam Datang</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Aksi Tindakan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line/30">
              ${triageQueue.length === 0 ? `
                <tr>
                  <td colspan="7" class="py-16 text-center text-ink-soft">
                    <span class="material-symbols-outlined text-[36px] text-ink-soft/60 block mb-2">assignment_turned_in</span>
                    <span class="font-body-strong text-ink block text-[15px]">Tidak Ada Antrian Pasien Menunggu</span>
                    <span class="text-caption text-ink-soft">Semua pasien di stasiun triase telah selesai diperiksa.</span>
                  </td>
                </tr>
              ` : triageQueue.map(v => `
                <tr class="hover:bg-canvas/30 transition">
                  <td class="py-3 px-4 font-mono font-bold text-caption text-brand">
                    <span class="px-2.5 py-1 bg-brand-tint rounded-lg">${v.ticketNo}</span>
                  </td>
                  <td class="py-3 px-4">
                    <span class="font-body-strong text-ink block font-bold text-[13px]">${v.patientName}</span>
                    <span class="font-mono text-[11px] text-ink-soft">${v.mrNo}</span>
                  </td>
                  <td class="py-3 px-4">
                    <span class="text-ink font-medium block text-[13px]">${v.departmentName}</span>
                    <span class="text-caption text-ink-soft">${v.practitionerName}</span>
                  </td>
                  <td class="py-3 px-4">
                    <span class="px-2.5 py-0.5 rounded-full text-caption font-semibold ${v.payerType === 'BPJS' ? 'bg-info-tint text-info' : 'bg-surface-container-low text-ink-soft'}">
                      ${v.payerType}
                    </span>
                  </td>
                  <td class="py-3 px-4 font-mono text-caption text-ink-soft">
                    ${v.checkinTime || '08:15 WIB'}
                  </td>
                  <td class="py-3 px-4">
                    <span class="px-2.5 py-0.5 rounded-full text-caption font-semibold ${v.visitStatus === 'IN_TRIAGE' ? 'bg-warning-tint text-warning' : 'bg-amber-100 text-amber-800'}">
                      ${v.visitStatus === 'IN_TRIAGE' ? 'Sedang TTV' : 'Menunggu Triase'}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <button onclick="callTicket('${v.ticketNo}', 'Meja Triase ${v.departmentName || 'Perawat'}')" class="h-9 px-2.5 rounded-xl border border-line/60 bg-surface hover:bg-brand-tint text-brand transition shadow-xs" title="Panggil Suara Antrian">
                        <span class="material-symbols-outlined text-[18px]">volume_up</span>
                      </button>
                      <button onclick="startNurseTriage('${v.id}')" class="h-9 px-4 rounded-xl bg-brand hover:bg-brand-strong text-on-primary font-body-strong text-caption font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95">
                        <span class="material-symbols-outlined text-[17px]">vital_signs</span>
                        <span>Ukur TTV Pasien</span>
                      </button>
                    </div>
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

// 2.3 PERAWAT PENGUKURAN TTV (Patient-Centric Clinical Worksheet)
function renderTtvInputView(container) {
  const visits = VisitStateService.getVisits();
  let selectedVisit = null;

  if (activeTriageVisitId) {
    selectedVisit = visits.find(v => v.id === activeTriageVisitId);
  }

  // If no patient selected, render clean empty state guiding user back to queue
  if (!selectedVisit) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-16 px-4 bg-surface rounded-2xl border border-line/50 text-center max-w-xl mx-auto shadow-sm my-8">
        <div class="w-16 h-16 rounded-2xl bg-brand-tint text-brand flex items-center justify-center mb-4">
          <span class="material-symbols-outlined text-[36px]">vital_signs</span>
        </div>
        <h2 class="font-headline-md text-headline-md text-ink font-bold mb-1">Belum Ada Pasien yang Dipilih</h2>
        <p class="font-caption text-caption text-ink-soft max-w-md mb-6 leading-relaxed">
          Silakan buka antrian triase untuk memilih pasien yang akan diukur tanda vitalnya dan diskrining awal.
        </p>
        <button onclick="activeWorkspaceId='ttv-queue'; renderSidebar(); renderContextualTopBar(); renderWorkspace('ttv-queue');" class="h-11 px-6 bg-brand hover:bg-brand-strong text-on-primary rounded-xl font-body-strong text-body-strong flex items-center gap-2 shadow-md transition active:scale-95">
          <span class="material-symbols-outlined text-[20px]">checklist</span>
          <span>Buka Antrian Pasien Triase</span>
        </button>
      </div>
    `;
    return;
  }

  const heightVal = selectedVisit.vitals ? selectedVisit.vitals.height : 165;
  const weightVal = selectedVisit.vitals ? selectedVisit.vitals.weight : 65;
  const bmiVal = (weightVal / ((heightVal / 100) * (heightVal / 100))).toFixed(1);

  container.innerHTML = `
    <div class="flex flex-col gap-space-lg w-full max-w-5xl mx-auto pb-24">
      
      <!-- LEVEL 2 CONTEXT: Sticky Patient Identity Banner -->
      <div class="sticky top-24 z-20 p-space-md bg-surface/95 backdrop-blur-md rounded-2xl border border-line/60 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3.5 min-w-0">
          <div class="w-12 h-12 rounded-xl bg-brand-tint text-brand flex items-center justify-center font-bold text-caption font-mono shrink-0 shadow-xs">
            ${selectedVisit.ticketNo}
          </div>
          <div class="flex flex-col min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h2 class="font-headline-md text-[18px] text-ink font-bold truncate">${selectedVisit.patientName}</h2>
              <span class="font-mono text-caption text-brand bg-brand-tint/60 px-2 py-0.5 rounded font-bold">${selectedVisit.mrNo}</span>
              <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold ${selectedVisit.payerType === 'BPJS' ? 'bg-info-tint text-info' : 'bg-surface-container-low text-ink-soft'}">
                ${selectedVisit.payerType}
              </span>
            </div>
            <div class="flex items-center gap-2 text-caption text-ink-soft mt-0.5 flex-wrap">
              <span>Tujuan: <strong class="text-ink font-medium">${selectedVisit.departmentName}</strong></span>
              <span>·</span>
              <span>DPJP: <strong class="text-ink font-medium">${selectedVisit.practitionerName}</strong></span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="callTicket('${selectedVisit.ticketNo}', 'Meja Triase ${selectedVisit.departmentName || 'Perawat'}')" class="h-9 px-3 rounded-xl border border-line/60 bg-surface hover:bg-brand-tint text-brand font-body-strong text-caption font-semibold flex items-center gap-1.5 transition shadow-xs">
            <span class="material-symbols-outlined text-[17px]">volume_up</span>
            <span>Panggil Suara</span>
          </button>
          <button onclick="activeWorkspaceId='ttv-queue'; renderSidebar(); renderContextualTopBar(); renderWorkspace('ttv-queue');" class="h-9 px-3 rounded-xl border border-line/60 bg-surface hover:bg-canvas text-ink-soft font-body-strong text-caption font-medium flex items-center gap-1 transition shadow-xs">
            <span class="material-symbols-outlined text-[17px]">arrow_back</span>
            <span>Ganti Pasien</span>
          </button>
        </div>
      </div>

      <!-- LEVEL 3 ACTIONS: Clinical TTV & Triase Worksheet -->
      <form onsubmit="handleNurseSaveTtv(event, '${selectedVisit.id}')" class="flex flex-col gap-space-lg">
        
        <!-- SECTION 1: PENGUKURAN TANDA VITAL (TTV) -->
        <div class="bg-surface rounded-2xl border border-line/50 p-space-lg flex flex-col gap-space-md shadow-xs">
          <div class="flex items-center justify-between pb-space-sm border-b border-line/40">
            <div class="flex items-center gap-2.5">
              <span class="w-7 h-7 rounded-lg bg-brand-tint text-brand font-bold text-caption flex items-center justify-center">1</span>
              <div>
                <h3 class="font-headline-md text-[16px] text-ink font-bold">Pengukuran Tanda Vital (TTV)</h3>
                <p class="font-caption text-caption text-ink-soft">Parameter vitalitas fisiologis pasien untuk penilaian klinis dokter.</p>
              </div>
            </div>
            <div id="live-bmi-badge" class="px-3 py-1 rounded-xl bg-brand-tint text-brand font-mono font-bold text-caption flex items-center gap-1.5">
              <span>BMI:</span>
              <strong id="live-bmi-val">${bmiVal}</strong>
              <span class="font-normal text-[11px] text-brand-strong">(${bmiVal < 18.5 ? 'Underweight' : (bmiVal <= 24.9 ? 'Normal' : (bmiVal <= 29.9 ? 'Overweight' : 'Obesitas'))})</span>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-space-md">
            <div>
              <label class="block font-body-strong mb-1 text-ink text-caption">Sistolik (mmHg) *</label>
              <input type="number" id="vitals-systolic" value="${selectedVisit.vitals ? selectedVisit.vitals.systolic : 120}" required class="w-full h-10 px-3 bg-canvas rounded-xl font-mono text-body-default text-ink border border-line/50 focus:outline-none focus:ring-2 focus:ring-brand">
            </div>

            <div>
              <label class="block font-body-strong mb-1 text-ink text-caption">Diastolik (mmHg) *</label>
              <input type="number" id="vitals-diastolic" value="${selectedVisit.vitals ? selectedVisit.vitals.diastolic : 80}" required class="w-full h-10 px-3 bg-canvas rounded-xl font-mono text-body-default text-ink border border-line/50 focus:outline-none focus:ring-2 focus:ring-brand">
            </div>

            <div>
              <label class="block font-body-strong mb-1 text-ink text-caption">Nadi (bpm) *</label>
              <input type="number" id="vitals-pulse" value="${selectedVisit.vitals ? selectedVisit.vitals.pulse : 80}" required class="w-full h-10 px-3 bg-canvas rounded-xl font-mono text-body-default text-ink border border-line/50 focus:outline-none focus:ring-2 focus:ring-brand">
            </div>

            <div>
              <label class="block font-body-strong mb-1 text-ink text-caption">Suhu Tubuh (°C) *</label>
              <input type="number" step="0.1" id="vitals-temperature" value="${selectedVisit.vitals ? selectedVisit.vitals.temperature : 36.5}" required class="w-full h-10 px-3 bg-canvas rounded-xl font-mono text-body-default text-ink border border-line/50 focus:outline-none focus:ring-2 focus:ring-brand">
            </div>

            <div>
              <label class="block font-body-strong mb-1 text-ink text-caption">Laju Nafas (x/menit) *</label>
              <input type="number" id="vitals-rr" value="${selectedVisit.vitals ? selectedVisit.vitals.respiratoryRate : 18}" required class="w-full h-10 px-3 bg-canvas rounded-xl font-mono text-body-default text-ink border border-line/50 focus:outline-none focus:ring-2 focus:ring-brand">
            </div>

            <div>
              <label class="block font-body-strong mb-1 text-ink text-caption">Saturasi O2 / SpO2 (%) *</label>
              <input type="number" id="vitals-spo2" value="${selectedVisit.vitals ? selectedVisit.vitals.spo2 : 98}" required class="w-full h-10 px-3 bg-canvas rounded-xl font-mono text-body-default text-ink border border-line/50 focus:outline-none focus:ring-2 focus:ring-brand">
            </div>

            <div>
              <label class="block font-body-strong mb-1 text-ink text-caption">Tinggi Badan (cm) *</label>
              <input type="number" id="vitals-height" oninput="calculateLiveBmi()" value="${heightVal}" required class="w-full h-10 px-3 bg-canvas rounded-xl font-mono text-body-default text-ink border border-line/50 focus:outline-none focus:ring-2 focus:ring-brand">
            </div>

            <div>
              <label class="block font-body-strong mb-1 text-ink text-caption">Berat Badan (kg) *</label>
              <input type="number" step="0.1" id="vitals-weight" oninput="calculateLiveBmi()" value="${weightVal}" required class="w-full h-10 px-3 bg-canvas rounded-xl font-mono text-body-default text-ink border border-line/50 focus:outline-none focus:ring-2 focus:ring-brand">
            </div>
          </div>
        </div>

        <!-- SECTION 2: SKRINING AWAL & KLASIFIKASI TRIASE -->
        <div class="bg-surface rounded-2xl border border-line/50 p-space-lg flex flex-col gap-space-md shadow-xs">
          <div class="flex items-center gap-2.5 pb-space-sm border-b border-line/40">
            <span class="w-7 h-7 rounded-lg bg-brand-tint text-brand font-bold text-caption flex items-center justify-center">2</span>
            <div>
              <h3 class="font-headline-md text-[16px] text-ink font-bold">Skrining Awal &amp; Klasifikasi Triase (ESI)</h3>
              <p class="font-caption text-caption text-ink-soft">Identifikasi keluhan utama, risiko klinis gawat darurat, dan alergi.</p>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block font-body-strong mb-1 text-ink text-caption">Keluhan Utama Pasien *</label>
              <textarea id="triage-complaint" rows="2" required placeholder="Keluhan yang dirasakan pasien saat ini..." class="w-full p-3 bg-canvas rounded-xl font-body-default text-body-default text-ink border border-line/50 focus:outline-none focus:ring-2 focus:ring-brand">${selectedVisit.triage ? selectedVisit.triage.chiefComplaint : ""}</textarea>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
              <div>
                <label class="block font-body-strong mb-1 text-ink text-caption">Klasifikasi Triase (ESI)</label>
                <select id="triage-outcome" class="w-full h-10 px-3 bg-canvas rounded-xl font-body-strong text-caption text-ink border border-line/50 focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer">
                  <option value="Normal" ${selectedVisit.triage && selectedVisit.triage.outcome === 'Normal' ? 'selected' : ''}>🟢 Hijau (Normal / Non-Urgent)</option>
                  <option value="Perlu Perhatian" ${selectedVisit.triage && selectedVisit.triage.outcome === 'Perlu Perhatian' ? 'selected' : ''}>🟡 Kuning (Perlu Perhatian)</option>
                  <option value="Perlu Eskalasi" ${selectedVisit.triage && selectedVisit.triage.outcome === 'Perlu Eskalasi' ? 'selected' : ''}>🔴 Merah (Eskalasi Gawat Darurat)</option>
                </select>
              </div>

              <div>
                <label class="block font-body-strong mb-1 text-ink text-caption">Skor Nyeri (VAS 0–10)</label>
                <input type="number" min="0" max="10" id="triage-pain" value="${selectedVisit.triage ? selectedVisit.triage.painScore : 2}" class="w-full h-10 px-3 bg-canvas rounded-xl font-mono text-body-default text-ink border border-line/50 focus:outline-none focus:ring-2 focus:ring-brand">
              </div>

              <div>
                <label class="block font-body-strong mb-1 text-ink text-caption">Risiko Jatuh</label>
                <select id="triage-fall-risk" class="w-full h-10 px-3 bg-canvas rounded-xl font-body-default text-caption text-ink border border-line/50 focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer">
                  <option value="Rendah" ${selectedVisit.triage && selectedVisit.triage.fallRisk === 'Rendah' ? 'selected' : ''}>Rendah (Gelang Kuning Tidak Diperlukan)</option>
                  <option value="Sedang" ${selectedVisit.triage && selectedVisit.triage.fallRisk === 'Sedang' ? 'selected' : ''}>Sedang</option>
                  <option value="Tinggi" ${selectedVisit.triage && selectedVisit.triage.fallRisk === 'Tinggi' ? 'selected' : ''}>Tinggi (Pasang Pita / Gelang Kuning)</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block font-body-strong mb-1 text-ink text-caption">Riwayat Alergi Obat / Makanan</label>
              <input type="text" id="triage-allergies" value="${selectedVisit.triage ? selectedVisit.triage.allergies : "Tidak ada riwayat alergi"}" class="w-full h-10 px-3 bg-canvas rounded-xl font-body-default text-body-default text-ink border border-line/50 focus:outline-none focus:ring-2 focus:ring-brand" placeholder="contoh: Alergi Amoxicillin, Paracetamol...">
            </div>
          </div>
        </div>

        <!-- STICKY ACTION DOCK FOOTER -->
        <div class="fixed bottom-0 left-[232px] right-0 bg-surface/95 backdrop-blur-md border-t border-line/50 py-3 px-space-xl z-30 flex items-center justify-between shadow-lg">
          <div class="flex items-center gap-2">
            <button type="button" onclick="activeWorkspaceId='ttv-queue'; renderSidebar(); renderContextualTopBar(); renderWorkspace('ttv-queue');" class="h-10 px-4 rounded-xl border border-line/60 bg-surface hover:bg-canvas text-ink-soft font-body-strong text-caption font-semibold transition shadow-xs flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[18px]">close</span>
              <span>Batal &amp; Kembali</span>
            </button>
          </div>

          <div class="flex items-center gap-3">
            <button type="submit" class="h-10 px-6 rounded-xl bg-brand hover:bg-brand-strong text-on-primary font-body-strong text-body-strong font-bold transition flex items-center gap-2 shadow-md active:scale-95">
              <span class="material-symbols-outlined text-[19px]">send</span>
              <span>Simpan TTV &amp; Route ke Dokter</span>
            </button>
          </div>
        </div>

      </form>
    </div>
  `;
}

// 2.4 PERAWAT RIWAYAT TRIASE (Completed Visits Archive)
function renderTtvHistoryView(container) {
  const visits = VisitStateService.getVisits();
  const completedVisits = visits.filter(v => v.vitals);

  container.innerHTML = `
    <div class="flex flex-col gap-space-lg w-full">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm border-b border-line/40">
        <div>
          <h1 class="font-headline-lg text-headline-lg text-ink font-bold tracking-tight">Riwayat Triase &amp; TTV Hari Ini</h1>
          <p class="font-caption text-caption text-ink-soft">Daftar rekaman tanda vital yang telah berhasil disimpan dan diteruskan ke ruang dokter.</p>
        </div>
        <span class="text-caption font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
          ${completedVisits.length} Pasien Selesai TTV
        </span>
      </div>

      <div class="bg-surface rounded-2xl border border-line/50 overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-canvas/60 border-b border-line/40 text-caption font-semibold text-ink-soft uppercase tracking-wider text-[11px]">
                <th class="py-3 px-4">Tiket</th>
                <th class="py-3 px-4">Pasien &amp; No. RM</th>
                <th class="py-3 px-4">Tekanan Darah</th>
                <th class="py-3 px-4">Nadi / RR</th>
                <th class="py-3 px-4">Suhu / SpO2</th>
                <th class="py-3 px-4">BMI</th>
                <th class="py-3 px-4">Klasifikasi Triase</th>
                <th class="py-3 px-4">Poli Dokter</th>
                <th class="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line/30">
              ${completedVisits.length === 0 ? `
                <tr><td colspan="9" class="py-12 text-center text-ink-soft">Belum ada rekaman tanda vital yang selesai hari ini.</td></tr>
              ` : completedVisits.map(v => `
                <tr class="hover:bg-canvas/30 transition">
                  <td class="py-3 px-4 font-mono font-bold text-caption text-brand">${v.ticketNo}</td>
                  <td class="py-3 px-4">
                    <span class="font-body-strong text-ink block font-bold text-[13px]">${v.patientName}</span>
                    <span class="font-mono text-[11px] text-ink-soft">${v.mrNo}</span>
                  </td>
                  <td class="py-3 px-4 font-mono text-caption text-ink font-semibold">
                    ${v.vitals.systolic}/${v.vitals.diastolic} mmHg
                  </td>
                  <td class="py-3 px-4 font-mono text-caption text-ink-soft">
                    ${v.vitals.pulse} bpm · ${v.vitals.respiratoryRate} x/m
                  </td>
                  <td class="py-3 px-4 font-mono text-caption text-ink-soft">
                    ${v.vitals.temperature}°C · ${v.vitals.spo2}%
                  </td>
                  <td class="py-3 px-4 font-mono text-caption text-ink">
                    ${v.vitals.height && v.vitals.weight ? (v.vitals.weight / ((v.vitals.height/100)*(v.vitals.height/100))).toFixed(1) : '-'}
                  </td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold ${v.triage?.outcome === 'Normal' ? 'bg-emerald-100 text-emerald-800' : (v.triage?.outcome === 'Perlu Perhatian' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')}">
                      ${v.triage?.outcome || 'Normal'}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-caption text-ink-soft">
                    <span class="text-ink font-medium block">${v.departmentName}</span>
                    <span class="text-[11px]">${v.practitionerName}</span>
                  </td>
                  <td class="py-3 px-4 text-right">
                    <button onclick="startNurseTriage('${v.id}')" class="h-8 px-2.5 rounded-lg border border-line/60 bg-surface hover:bg-brand-tint text-brand text-[11px] font-bold transition shadow-xs">
                      Edit TTV
                    </button>
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

// Helper: Real-time BMI calculation in TTV worksheet
function calculateLiveBmi() {
  const h = parseFloat(document.getElementById("vitals-height")?.value || 0);
  const w = parseFloat(document.getElementById("vitals-weight")?.value || 0);
  const badgeVal = document.getElementById("live-bmi-val");
  const badgeContainer = document.getElementById("live-bmi-badge");
  if (h > 0 && w > 0 && badgeVal) {
    const bmi = (w / ((h / 100) * (h / 100))).toFixed(1);
    badgeVal.textContent = bmi;
    let label = bmi < 18.5 ? "Underweight" : (bmi <= 24.9 ? "Normal" : (bmi <= 29.9 ? "Overweight" : "Obesitas"));
    if (badgeContainer) {
      badgeContainer.querySelector("span:last-child").textContent = `(${label})`;
    }
  }
}

// Helper: Start nurse triage on a selected patient
function startNurseTriage(visitId) {
  activeTriageVisitId = visitId;
  activeWorkspaceId = "ttv-input";
  renderSidebar();
  renderContextualTopBar();
  renderWorkspace(activeWorkspaceId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Helper: Handle saving TTV and routing to doctor, prompt for next waiting patient
function handleNurseSaveTtv(e, visitId) {
  if (e && e.preventDefault) e.preventDefault();
  try {
    const vitalsData = {
      systolic: document.getElementById("vitals-systolic")?.value || 120,
      diastolic: document.getElementById("vitals-diastolic")?.value || 80,
      pulse: document.getElementById("vitals-pulse")?.value || 80,
      temperature: document.getElementById("vitals-temperature")?.value || 36.5,
      respiratoryRate: document.getElementById("vitals-rr")?.value || 18,
      spo2: document.getElementById("vitals-spo2")?.value || 98,
      height: document.getElementById("vitals-height")?.value || 165,
      weight: document.getElementById("vitals-weight")?.value || 65
    };

    const triageData = {
      chiefComplaint: document.getElementById("triage-complaint")?.value || "Pemeriksaan rutin",
      fallRisk: document.getElementById("triage-fall-risk")?.value || "Rendah",
      painScore: document.getElementById("triage-pain")?.value || 0,
      outcome: document.getElementById("triage-outcome")?.value || "Normal",
      allergies: document.getElementById("triage-allergies")?.value || "Tidak ada riwayat alergi"
    };

    TriageService.saveTriageAndVitals(visitId, vitalsData, triageData, true);
    activeTriageVisitId = null;
    showToast("TTV & Skrining Triase tersimpan. Pasien diteruskan ke poli dokter.", "success");

    // Check for next waiting patient
    const nextVisit = VisitStateService.getVisits().find(v => v.visitStatus === "WAITING_TRIAGE");
    if (nextVisit) {
      if (confirm(`Data TTV berhasil disimpan.\n\nApakah Anda ingin langsung mengukur pasien berikutnya di antrian?\n(Tiket: ${nextVisit.ticketNo} - ${nextVisit.patientName})`)) {
        startNurseTriage(nextVisit.id);
      } else {
        activeWorkspaceId = "ttv-queue";
        renderSidebar();
        renderContextualTopBar();
        renderWorkspace(activeWorkspaceId);
      }
    } else {
      showToast("Semua antrian triase telah selesai diperiksa.", "success");
      activeWorkspaceId = "ttv-queue";
      renderSidebar();
      renderContextualTopBar();
      renderWorkspace(activeWorkspaceId);
    }
  } catch (err) {
    showToast(err.message, "danger");
  }
}

// Backwards-compatible alias for triase
function renderTriaseWorkspace(container) {
  renderTtvQueueView(container);
}

// ========================================================
// WORKSPACE 3: DOKTER (MODUL DOKTER RAWAT JALAN)
// Separating Navigation (L1), Context (L2), Actions (L3)
// ========================================================

// 3.1 DOKTER DASHBOARD (Overview Ringkas)
function renderDoctorDashboardView(container) {
  const visits = VisitStateService.getVisits();
  const waitingVisits = visits.filter(v => v.visitStatus === "WAITING_DOCTOR");
  const inServiceVisits = visits.filter(v => v.visitStatus === "IN_SERVICE");
  const completedVisits = visits.filter(v => v.visitStatus === "SERVICE_COMPLETED" || v.visitStatus === "CLOSED");

  const activeConsultationVisit = activeDoctorConsultationVisitId 
    ? visits.find(v => v.id === activeDoctorConsultationVisitId && v.visitStatus === "IN_SERVICE") 
    : inServiceVisits[0];

  container.innerHTML = `
    <div class="flex flex-col gap-space-lg w-full">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm border-b border-line/40">
        <div>
          <h1 class="font-headline-lg text-headline-lg text-ink font-bold tracking-tight">Dashboard Dokter Rawat Jalan</h1>
          <p class="font-caption text-caption text-ink-soft">Ringkasan aktivitas poli, antrian berjalan, dan pasien aktif konsultasi.</p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="activeWorkspaceId='doctor-queue'; renderSidebar(); renderContextualTopBar(); renderWorkspace('doctor-queue');" class="h-9 px-4 bg-brand hover:bg-brand-strong text-on-primary rounded-xl font-body-strong text-caption font-bold flex items-center gap-1.5 shadow-sm transition">
            <span class="material-symbols-outlined text-[18px]">format_list_bulleted</span>
            <span>Buka Antrian Pasien</span>
          </button>
        </div>
      </div>

      <!-- 3 Key Metric Pills (NOT Card Overuse) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
        <div class="p-space-md bg-surface rounded-2xl border border-line/50 flex items-center justify-between shadow-xs">
          <div>
            <span class="text-caption text-ink-soft font-semibold block">Menunggu Konsultasi</span>
            <span class="font-headline-lg text-[28px] font-bold text-brand mt-0.5 block">${waitingVisits.length}</span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-brand-tint text-brand flex items-center justify-center">
            <span class="material-symbols-outlined text-[26px]">hourglass_top</span>
          </div>
        </div>

        <div class="p-space-md bg-surface rounded-2xl border border-line/50 flex items-center justify-between shadow-xs">
          <div>
            <span class="text-caption text-ink-soft font-semibold block">Sedang Diperiksa</span>
            <span class="font-headline-lg text-[28px] font-bold text-amber-600 mt-0.5 block">${inServiceVisits.length}</span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <span class="material-symbols-outlined text-[26px]">stethoscope</span>
          </div>
        </div>

        <div class="p-space-md bg-surface rounded-2xl border border-line/50 flex items-center justify-between shadow-xs">
          <div>
            <span class="text-caption text-ink-soft font-semibold block">Selesai Hari Ini</span>
            <span class="font-headline-lg text-[28px] font-bold text-success mt-0.5 block">${completedVisits.length}</span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-success-tint text-success flex items-center justify-center">
            <span class="material-symbols-outlined text-[26px]">task_alt</span>
          </div>
        </div>
      </div>

      <!-- Active Ongoing Consultation Highlight (If Any) -->
      ${activeConsultationVisit ? `
        <div class="p-space-lg bg-gradient-to-r from-brand-tint/50 via-surface to-surface rounded-2xl border border-brand/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-brand text-on-primary flex items-center justify-center shrink-0 shadow-sm">
              <span class="material-symbols-outlined text-[26px]">person</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">Sedang Berlangsung</span>
                <span class="text-caption font-mono text-ink-soft">Tiket: ${activeConsultationVisit.ticketNo}</span>
              </div>
              <h3 class="font-headline-md text-ink font-bold text-[17px] mt-0.5">${activeConsultationVisit.patientName}</h3>
              <p class="text-caption text-ink-soft font-mono">${activeConsultationVisit.mrNo} · ${activeConsultationVisit.departmentName} · ${activeConsultationVisit.payerType}</p>
            </div>
          </div>
          <button onclick="startDoctorConsultation('${activeConsultationVisit.id}')" class="h-10 px-5 bg-brand hover:bg-brand-strong text-on-primary rounded-xl font-body-strong text-caption font-bold flex items-center gap-2 transition shadow-sm self-start sm:self-center">
            <span>Lanjutkan Pemeriksaan</span>
            <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      ` : ''}

      <!-- Next Patients in Queue Table -->
      <div class="bg-surface rounded-2xl border border-line/50 overflow-hidden shadow-xs flex flex-col">
        <div class="p-space-md bg-surface-container-low/40 border-b border-line/40 flex items-center justify-between">
          <span class="font-body-strong text-body-strong font-bold text-ink">Pasien Berikutnya dalam Antrian</span>
          <button onclick="activeWorkspaceId='doctor-queue'; renderSidebar(); renderContextualTopBar(); renderWorkspace('doctor-queue');" class="text-brand text-caption font-semibold hover:underline">
            Lihat Semua Antrian &rarr;
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left font-table-cell text-table-cell border-collapse">
            <thead>
              <tr class="bg-surface-container-low/60 border-b border-line/50 text-ink-soft font-semibold text-caption">
                <th class="py-2.5 px-4">No. Tiket</th>
                <th class="py-2.5 px-4">Pasien &amp; RM</th>
                <th class="py-2.5 px-4">TTV Terakhir</th>
                <th class="py-2.5 px-4">Penjamin</th>
                <th class="py-2.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line/40">
              ${waitingVisits.slice(0, 4).length === 0 ? `
                <tr>
                  <td colspan="5" class="py-8 text-center text-ink-soft">Tidak ada pasien menunggu saat ini.</td>
                </tr>
              ` : waitingVisits.slice(0, 4).map(v => `
                <tr class="hover:bg-brand-tint/20 transition">
                  <td class="py-3 px-4 font-mono font-bold text-brand">${v.ticketNo}</td>
                  <td class="py-3 px-4">
                    <span class="font-bold text-ink block">${v.patientName}</span>
                    <span class="font-mono text-[11px] text-ink-soft">${v.mrNo}</span>
                  </td>
                  <td class="py-3 px-4 font-mono text-caption">
                    ${v.vitals ? `${v.vitals.systolic}/${v.vitals.diastolic} mmHg · ${v.vitals.temperature}°C` : '-'}
                  </td>
                  <td class="py-3 px-4 text-caption">${v.payerType}</td>
                  <td class="py-3 px-4 text-right">
                    <button onclick="startDoctorConsultation('${v.id}')" class="h-8 px-3 bg-brand hover:bg-brand-strong text-on-primary rounded-lg text-caption font-bold shadow-xs">
                      Mulai
                    </button>
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

// 3.2 DOKTER ANTRIAN (Queue Screen: One Purpose - Find & Select Next Patient)
function renderDoctorQueueView(container) {
  let visits = VisitStateService.getVisits();
  if (searchQuery) {
    visits = visits.filter(v => 
      (v.patientName && v.patientName.toLowerCase().includes(searchQuery)) ||
      (v.mrNo && v.mrNo.toLowerCase().includes(searchQuery)) ||
      (v.ticketNo && v.ticketNo.toLowerCase().includes(searchQuery)) ||
      (v.departmentName && v.departmentName.toLowerCase().includes(searchQuery))
    );
  }

  const allDoctorVisits = visits.filter(v => 
    v.visitStatus === "WAITING_DOCTOR" || 
    v.visitStatus === "IN_SERVICE" || 
    v.visitStatus === "WAITING_RESULTS"
  );

  let doctorQueue = allDoctorVisits.filter(v => {
    if (doctorFilterDoc !== "ALL") {
      if (v.practitionerId && v.practitionerId !== doctorFilterDoc) return false;
      if (!v.practitionerId && v.practitionerName) {
        const docObj = SIMRS_MASTER_DATA.practitioners.find(d => d.id === doctorFilterDoc);
        if (docObj && !v.practitionerName.includes(docObj.name.split(',')[0])) return false;
      }
    }
    if (doctorFilterDept !== "ALL") {
      if (v.departmentId && v.departmentId !== doctorFilterDept) return false;
      if (!v.departmentId && v.departmentName) {
        const deptObj = SIMRS_MASTER_DATA.departments.find(d => d.id === doctorFilterDept);
        if (deptObj && v.departmentName !== deptObj.name) return false;
      }
    }
    return true;
  });

  container.innerHTML = `
    <div class="flex flex-col gap-space-lg w-full">
      <!-- Level 2 Context Header: Filters -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm border-b border-line/40">
        <div>
          <h1 class="font-headline-lg text-headline-lg text-ink font-bold tracking-tight">Antrian Pasien Dokter</h1>
          <p class="font-caption text-caption text-ink-soft">Pilih pasien untuk memulai konsultasi klinis dan dokumentasi rekam medis (SOAP).</p>
        </div>

        <!-- Filter Bar -->
        <div class="flex items-center gap-2 flex-wrap">
          <div class="flex items-center gap-1.5 px-3 py-1.5 bg-surface rounded-xl border border-line/60 shadow-xs">
            <span class="material-symbols-outlined text-[18px] text-brand">stethoscope</span>
            <select onchange="handleDoctorPractitionerChange(this.value)" class="bg-transparent text-ink text-caption font-semibold focus:outline-none cursor-pointer">
              <option value="ALL" ${doctorFilterDoc === 'ALL' ? 'selected' : ''}>Semua Dokter</option>
              ${SIMRS_MASTER_DATA.practitioners.map(doc => `
                <option value="${doc.id}" ${doctorFilterDoc === doc.id ? 'selected' : ''}>${doc.name}</option>
              `).join("")}
            </select>
          </div>

          <div class="flex items-center gap-1.5 px-3 py-1.5 bg-surface rounded-xl border border-line/60 shadow-xs">
            <span class="material-symbols-outlined text-[18px] text-brand">domain</span>
            <select onchange="handleDoctorDeptChange(this.value)" class="bg-transparent text-ink text-caption font-semibold focus:outline-none cursor-pointer">
              <option value="ALL" ${doctorFilterDept === 'ALL' ? 'selected' : ''}>Semua Poliklinik</option>
              ${SIMRS_MASTER_DATA.departments.map(dept => `
                <option value="${dept.id}" ${doctorFilterDept === dept.id ? 'selected' : ''}>${dept.name}</option>
              `).join("")}
            </select>
          </div>
        </div>
      </div>

      <!-- Queue Table -->
      <div class="bg-surface rounded-2xl shadow-sm border border-line/40 overflow-hidden flex flex-col">
        <div class="p-space-md bg-surface-container-low/40 border-b border-line/40 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="font-body-strong text-body-strong text-ink font-bold">Daftar Antrian Poliklinik</span>
            <span class="px-2.5 py-0.5 rounded-full bg-brand-tint text-brand font-mono font-bold text-caption">${doctorQueue.length} Pasien</span>
          </div>
          <span class="text-caption text-ink-soft">Urutan kedatangan tiket</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left font-table-cell text-table-cell border-collapse">
            <thead>
              <tr class="bg-surface-container-low/80 border-b border-line/60 text-ink-soft font-semibold text-caption">
                <th class="py-3 px-4">No. Tiket</th>
                <th class="py-3 px-4">Pasien &amp; No. RM</th>
                <th class="py-3 px-4">Poli &amp; Dokter</th>
                <th class="py-3 px-4">TTV Terakhir</th>
                <th class="py-3 px-4">Penjamin</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line/40">
              ${doctorQueue.length === 0 ? `
                <tr>
                  <td colspan="7" class="py-12 text-center text-ink-soft">
                    <div class="flex flex-col items-center justify-center gap-2">
                      <span class="material-symbols-outlined text-[36px] text-ink-soft/60">person_off</span>
                      <span class="font-body-strong text-ink">Tidak ada antrian pasien</span>
                      <span class="text-caption text-ink-soft">Semua pasien pada poliklinik ini telah selesai dilayani.</span>
                    </div>
                  </td>
                </tr>
              ` : doctorQueue.map(v => `
                <tr class="hover:bg-brand-tint/20 transition group">
                  <td class="py-3.5 px-4">
                    <span class="font-mono font-bold text-brand bg-brand-tint px-2.5 py-1 rounded-lg text-[13px] inline-block shadow-xs">${v.ticketNo}</span>
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="font-body-strong text-ink text-[14px] font-bold">${v.patientName}</div>
                    <div class="font-mono text-caption text-ink-soft flex items-center gap-1.5 mt-0.5">
                      <span>${v.mrNo}</span>
                      <span>·</span>
                      <span>${v.patientAge || 'Dewasa'}</span>
                    </div>
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="font-medium text-ink">${v.departmentName}</div>
                    <div class="text-[12px] text-ink-soft truncate max-w-[200px]">${v.practitionerName}</div>
                  </td>
                  <td class="py-3.5 px-4 font-mono text-caption">
                    ${v.vitals ? `
                      <span class="font-bold text-ink">${v.vitals.systolic}/${v.vitals.diastolic} mmHg</span>
                      <span class="text-ink-soft block text-[11px]">${v.vitals.temperature}°C · ${v.vitals.pulse} bpm</span>
                    ` : `<span class="text-ink-soft italic">Belum TTV</span>`}
                  </td>
                  <td class="py-3.5 px-4">
                    <span class="px-2 py-0.5 rounded text-[11px] font-semibold ${
                      v.payerType === 'BPJS' ? 'bg-info-tint text-info font-bold' : 'bg-surface-container-low text-ink-soft border border-line/40'
                    }">${v.payerType}</span>
                  </td>
                  <td class="py-3.5 px-4">
                    ${renderStatusChip(v.visitStatus)}
                  </td>
                  <td class="py-3.5 px-4 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <button onclick="callTicket('${v.ticketNo}', '${v.departmentName}')" class="h-9 px-2.5 rounded-xl border border-line/60 bg-surface hover:bg-brand-tint text-brand transition shadow-xs" title="Panggil Suara Antrian">
                        <span class="material-symbols-outlined text-[18px]">volume_up</span>
                      </button>
                      <button onclick="startDoctorConsultation('${v.id}')" class="h-9 px-4 rounded-xl bg-brand hover:bg-brand-strong text-on-primary font-body-strong text-caption font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95">
                        <span class="material-symbols-outlined text-[17px]">stethoscope</span>
                        <span>Mulai Pemeriksaan</span>
                      </button>
                    </div>
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

// 3.3 DOKTER PEMERIKSAAN (Patient-Centric Clinical Encounter Workspace)
function renderDoctorConsultationView(container) {
  const visits = VisitStateService.getVisits();
  let activeVisit = null;

  if (activeDoctorConsultationVisitId) {
    activeVisit = visits.find(v => v.id === activeDoctorConsultationVisitId);
  }

  // If no patient selected, render clean empty state guiding user back to queue
  if (!activeVisit) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-16 px-4 bg-surface rounded-2xl border border-line/50 text-center max-w-xl mx-auto shadow-sm my-8">
        <div class="w-16 h-16 rounded-2xl bg-brand-tint text-brand flex items-center justify-center mb-4">
          <span class="material-symbols-outlined text-[36px]">stethoscope</span>
        </div>
        <h2 class="font-headline-md text-headline-md text-ink font-bold mb-1">Belum Ada Pasien yang Dipilih</h2>
        <p class="font-caption text-caption text-ink-soft max-w-md mb-6 leading-relaxed">
          Silakan buka antrian pasien untuk memilih pasien yang akan diperiksa atau dipanggil ke ruang konsultasi.
        </p>
        <button onclick="activeWorkspaceId='doctor-queue'; renderSidebar(); renderContextualTopBar(); renderWorkspace('doctor-queue');" class="h-11 px-6 bg-brand hover:bg-brand-strong text-on-primary rounded-xl font-body-strong text-body-strong flex items-center gap-2 shadow-md transition active:scale-95">
          <span class="material-symbols-outlined text-[20px]">format_list_bulleted</span>
          <span>Buka Antrian Pasien Dokter</span>
        </button>
      </div>
    `;
    return;
  }

  // Tab definitions for progressive disclosure
  const tabs = [
    { key: "soap", label: "SOAP & Pemeriksaan", icon: "history_edu" },
    { key: "vitals", label: "TTV & Triase Lengkap", icon: "vital_signs" },
    { key: "orders", label: "Penunjang & Tindakan", icon: "science" },
    { key: "rx", label: "E-Resep Online", icon: "prescriptions" },
    { key: "referral", label: "Rujukan Online", icon: "forward" },
    { key: "resume", label: "Resume Medis", icon: "description" }
  ];

  container.innerHTML = `
    <div class="flex flex-col gap-space-md w-full">
      
      <!-- ========================================================== -->
      <!-- LEVEL 2: CONTEXT HEADER (Sticky Patient Banner)            -->
      <!-- ========================================================== -->
      <div class="p-4 bg-surface rounded-2xl border border-line/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <!-- Patient Identity -->
        <div class="flex items-center gap-3.5 min-w-0">
          <div class="w-12 h-12 rounded-2xl bg-brand text-on-primary font-bold text-[18px] flex items-center justify-center shrink-0 shadow-sm">
            ${activeVisit.patientName.charAt(0)}
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h2 class="font-headline-md text-[18px] font-bold text-ink leading-tight truncate">${activeVisit.patientName}</h2>
              <span class="font-mono text-caption px-2 py-0.5 rounded-full bg-brand-tint text-brand font-bold">${activeVisit.ticketNo}</span>
              ${renderStatusChip(activeVisit.visitStatus)}
            </div>
            <div class="font-mono text-caption text-ink-soft flex items-center gap-2 flex-wrap mt-0.5">
              <span>RM: <strong>${activeVisit.mrNo}</strong></span>
              <span>·</span>
              <span>${activeVisit.departmentName}</span>
              <span>·</span>
              <span>${activeVisit.payerType}</span>
            </div>
          </div>
        </div>

        <!-- Clinical Vitals & Allergy Quick Summary (High Priority Clinical Awareness) -->
        <div class="flex items-center gap-4 flex-wrap border-t md:border-t-0 md:border-l border-line/40 pt-2 md:pt-0 md:pl-4">
          <div class="text-left">
            <span class="text-[11px] text-ink-soft font-semibold block">TTV Terkini:</span>
            <span class="font-mono font-bold text-caption text-ink">
              ${activeVisit.vitals ? `${activeVisit.vitals.systolic}/${activeVisit.vitals.diastolic} mmHg · ${activeVisit.vitals.temperature}°C` : 'Belum diukur'}
            </span>
          </div>

          <div class="text-left border-l border-line/30 pl-3">
            <span class="text-[11px] text-ink-soft font-semibold block">Alergi:</span>
            <span class="font-semibold text-caption ${activeVisit.triage && activeVisit.triage.allergies && activeVisit.triage.allergies !== 'Tidak ada alergi' && activeVisit.triage.allergies !== '-' ? 'text-danger font-bold' : 'text-success'}">
              ${activeVisit.triage ? activeVisit.triage.allergies : 'Tidak ada'}
            </span>
          </div>

          <!-- Secondary Patient Actions -->
          <div class="flex items-center gap-1.5 ml-auto md:ml-2">
            <button onclick="callTicket('${activeVisit.ticketNo}', '${activeVisit.departmentName}')" class="h-9 px-3 rounded-xl border border-line/60 bg-surface hover:bg-brand-tint text-brand text-caption font-semibold flex items-center gap-1 shadow-xs transition" title="Panggil Ulang Suara">
              <span class="material-symbols-outlined text-[17px]">volume_up</span>
              <span class="hidden sm:inline">Panggil</span>
            </button>
            <button onclick="activeWorkspaceId='doctor-queue'; renderSidebar(); renderContextualTopBar(); renderWorkspace('doctor-queue');" class="h-9 px-3 rounded-xl border border-line/60 bg-surface-container-low hover:bg-surface-container text-ink text-caption font-semibold flex items-center gap-1 transition" title="Pilih Pasien Lain">
              <span class="material-symbols-outlined text-[17px]">swap_horiz</span>
              <span class="hidden sm:inline">Ganti Pasien</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ========================================================== -->
      <!-- LEVEL 3: PROGRESSIVE DISCLOSURE TABS NAVIGATION            -->
      <!-- ========================================================== -->
      <div class="bg-surface rounded-2xl border border-line/50 shadow-sm overflow-hidden flex flex-col">
        
        <!-- Horizontal Tabs Header -->
        <div class="flex items-center gap-1 p-2 bg-surface-container-low/60 border-b border-line/40 overflow-x-auto">
          ${tabs.map(t => {
            const isActive = activeDoctorConsultationTab === t.key;
            return `
              <button 
                type="button" 
                onclick="switchDoctorConsultationTab('${t.key}')" 
                class="flex items-center gap-2 px-4 py-2.5 rounded-xl font-body-strong text-caption transition-all shrink-0 ${
                  isActive 
                    ? 'bg-brand text-on-primary shadow-sm font-bold' 
                    : 'text-ink-soft hover:text-ink hover:bg-surface'
                }"
              >
                <span class="material-symbols-outlined text-[18px] ${isActive ? 'text-on-primary' : 'text-brand'}">${t.icon}</span>
                <span>${t.label}</span>
              </button>
            `;
          }).join("")}
        </div>

        <!-- Tab Content Viewport -->
        <div class="p-space-lg flex flex-col">
          ${renderDoctorTabContent(activeVisit, activeDoctorConsultationTab)}
        </div>

        <!-- Sticky Clinical Action Footer (Visual Priority) -->
        <div class="px-space-lg py-3.5 bg-surface-container-low/80 border-t border-line/40 flex items-center justify-between flex-wrap gap-space-sm">
          <div class="flex items-center gap-2 text-caption">
            ${activeVisit.encounter && activeVisit.encounter.isFinalized 
              ? `<span class="inline-flex items-center gap-1 text-success font-bold"><span class="material-symbols-outlined text-[18px]">check_circle</span> Encounter Terfinalisasi (Pelayanan Selesai)</span>` 
              : `<span class="inline-flex items-center gap-1 text-amber-700 font-semibold"><span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Mode Pengisian: Klik Finalisasi jika pemeriksaan selesai</span>`}
          </div>

          <div class="flex items-center gap-2 ml-auto">
            <button 
              type="button" 
              onclick="handleDoctorSaveEncounter('${activeVisit.id}', false)" 
              class="h-10 px-4 bg-surface hover:bg-surface-container border border-line/60 text-ink rounded-xl font-body-strong text-caption font-semibold transition shadow-xs"
            >
              Simpan Draft
            </button>
            <button 
              type="button" 
              onclick="handleDoctorSaveEncounterAndPromptNext('${activeVisit.id}')" 
              class="h-10 px-6 bg-brand hover:bg-brand-strong text-on-primary rounded-xl font-body-strong text-caption font-bold flex items-center gap-2 transition shadow-md active:scale-95"
            >
              <span class="material-symbols-outlined text-[18px]">done_all</span>
              <span>Finalisasi &amp; Selesaikan</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  `;
}

// Render individual tab content for Doctor Clinical Encounter
function renderDoctorTabContent(activeVisit, activeTab) {
  const enc = activeVisit.encounter || {};

  switch (activeTab) {
    case "soap":
      return `
        <div class="space-y-4 font-body-default text-body-default">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            <!-- Subjective -->
            <div class="flex flex-col">
              <label class="block font-body-strong mb-1.5 text-ink text-caption font-bold flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-brand"></span>
                <span>Subjective (Anamnesis &amp; Keluhan Utama) *</span>
              </label>
              <textarea 
                id="doctor-soap-s" 
                rows="4" 
                class="w-full p-3 bg-canvas rounded-xl font-body-default text-body-default text-ink shadow-inner border border-line/60 focus:ring-2 focus:ring-brand focus:border-transparent leading-relaxed" 
                placeholder="Keluhan utama, riwayat penyakit sekarang, onset, kualitas keluhan..."
              >${enc.subjective || ""}</textarea>
            </div>

            <!-- Objective -->
            <div class="flex flex-col">
              <label class="block font-body-strong mb-1.5 text-ink text-caption font-bold flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-brand"></span>
                <span>Objective (Pemeriksaan Fisik Klinis) *</span>
              </label>
              <textarea 
                id="doctor-soap-o" 
                rows="4" 
                class="w-full p-3 bg-canvas rounded-xl font-body-default text-body-default text-ink shadow-inner border border-line/60 focus:ring-2 focus:ring-brand focus:border-transparent leading-relaxed" 
                placeholder="Keadaan umum, status generalis, kepala/leher, thoraks, cor/pulmo, abdomen, ekstremitas..."
              >${enc.objective || ""}</textarea>
            </div>
          </div>

          <!-- Assessment (Diagnosis ICD-10) -->
          <div class="flex flex-col pt-2 border-t border-line/30">
            <label class="block font-body-strong mb-1.5 text-ink text-caption font-bold flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[17px] text-brand">diagnosis</span>
              <span>Assessment: Diagnosis Utama ICD-10 *</span>
            </label>
            <select 
              id="doctor-icd10" 
              class="w-full h-11 px-3 bg-canvas rounded-xl font-body-default text-body-default text-ink border border-line/60 focus:ring-2 focus:ring-brand cursor-pointer shadow-inner"
            >
              ${SIMRS_MASTER_DATA.icd10.map(icd => `
                <option value="${icd.code}" ${enc.primaryDiagnosis && enc.primaryDiagnosis.code === icd.code ? 'selected' : ''}>
                  ${icd.code} - ${icd.name} (${icd.category})
                </option>
              `).join("")}
            </select>
          </div>

          <!-- Plan -->
          <div class="flex flex-col pt-2 border-t border-line/30">
            <label class="block font-body-strong mb-1.5 text-ink text-caption font-bold flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[17px] text-brand">edit_note</span>
              <span>Plan (Rencana Terapi, Jadwal Kontrol, &amp; Edukasi Pasien) *</span>
            </label>
            <textarea 
              id="doctor-soap-p" 
              rows="3" 
              class="w-full p-3 bg-canvas rounded-xl font-body-default text-body-default text-ink shadow-inner border border-line/60 focus:ring-2 focus:ring-brand focus:border-transparent leading-relaxed" 
              placeholder="Rencana tindakan, anjuran istirahat/diet, jadwal kontrol ulang, edukasi tanda bahaya..."
            >${enc.plan || ""}</textarea>
          </div>
        </div>
      `;

    case "vitals":
      const vit = activeVisit.vitals || {};
      const tri = activeVisit.triage || {};
      return `
        <div class="space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-line/40">
            <div>
              <h3 class="font-headline-md text-ink font-bold text-[16px]">Tanda Vital &amp; Triase Lengkap</h3>
              <p class="text-caption text-ink-soft">Data tanda vital dicatat oleh Perawat Triase saat pasien tiba.</p>
            </div>
            <span class="text-caption font-mono text-ink-soft bg-surface-container-low px-2.5 py-1 rounded-lg">Waktu Ukur: Hari Ini</span>
          </div>

          <!-- Vitals Cards Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="p-3 bg-canvas rounded-xl border border-line/50">
              <span class="text-[11px] text-ink-soft font-semibold block">Tekanan Darah</span>
              <span class="font-mono font-bold text-[18px] text-ink mt-0.5 block">${vit.systolic || '-'}/${vit.diastolic || '-'} <span class="text-[11px] font-normal text-ink-soft">mmHg</span></span>
            </div>

            <div class="p-3 bg-canvas rounded-xl border border-line/50">
              <span class="text-[11px] text-ink-soft font-semibold block">Denyut Nadi</span>
              <span class="font-mono font-bold text-[18px] text-ink mt-0.5 block">${vit.pulse || '-'} <span class="text-[11px] font-normal text-ink-soft">bpm</span></span>
            </div>

            <div class="p-3 bg-canvas rounded-xl border border-line/50">
              <span class="text-[11px] text-ink-soft font-semibold block">Suhu Tubuh</span>
              <span class="font-mono font-bold text-[18px] text-ink mt-0.5 block">${vit.temperature || '-'} <span class="text-[11px] font-normal text-ink-soft">°C</span></span>
            </div>

            <div class="p-3 bg-canvas rounded-xl border border-line/50">
              <span class="text-[11px] text-ink-soft font-semibold block">Laju Pernapasan</span>
              <span class="font-mono font-bold text-[18px] text-ink mt-0.5 block">${vit.respiratoryRate || '-'} <span class="text-[11px] font-normal text-ink-soft">x/mnt</span></span>
            </div>

            <div class="p-3 bg-canvas rounded-xl border border-line/50">
              <span class="text-[11px] text-ink-soft font-semibold block">Saturasi Oksigen (SpO2)</span>
              <span class="font-mono font-bold text-[18px] text-ink mt-0.5 block">${vit.spo2 || '-'} <span class="text-[11px] font-normal text-ink-soft">%</span></span>
            </div>

            <div class="p-3 bg-canvas rounded-xl border border-line/50">
              <span class="text-[11px] text-ink-soft font-semibold block">Tinggi / Berat Badan</span>
              <span class="font-mono font-bold text-[16px] text-ink mt-0.5 block">${vit.height || '-'} cm · ${vit.weight || '-'} kg</span>
            </div>

            <div class="p-3 bg-canvas rounded-xl border border-line/50 col-span-2">
              <span class="text-[11px] text-ink-soft font-semibold block">Indeks Massa Tubuh (BMI)</span>
              <span class="font-mono font-bold text-[16px] text-ink mt-0.5 block">${vit.bmi || '-'} kg/m² <span class="text-[12px] font-semibold text-brand px-1.5 py-0.5 bg-brand-tint rounded ml-1">${vit.bmiCategory || 'Normal'}</span></span>
            </div>
          </div>

          <!-- Triage Details -->
          <div class="p-4 bg-surface-container-low rounded-xl border border-line/50 space-y-2 mt-2">
            <h4 class="font-body-strong text-caption font-bold text-ink uppercase tracking-wider">Hasil Skrining Perawat</h4>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-caption">
              <div>
                <span class="text-ink-soft block">Skala Nyeri (VAS):</span>
                <span class="font-bold text-ink">${tri.painScale !== undefined ? `${tri.painScale} / 10` : '-'}</span>
              </div>
              <div>
                <span class="text-ink-soft block">Risiko Jatuh:</span>
                <span class="font-bold text-ink">${tri.fallRisk || 'Rendah'}</span>
              </div>
              <div>
                <span class="text-ink-soft block">Klasifikasi Triase (ESI):</span>
                <span class="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">${tri.esiLevel || 'ESI 3 - Hijau'}</span>
              </div>
            </div>
            <div class="pt-2 text-caption">
              <span class="text-ink-soft block">Keluhan Saat Triase:</span>
              <p class="text-ink font-medium mt-0.5">${tri.chiefComplaint || 'Tidak ada catatan keluhan tambahan.'}</p>
            </div>
          </div>
        </div>
      `;

    case "orders":
      const labOrders = enc.labOrders || [];
      const procedures = enc.procedures || [];
      return `
        <div class="space-y-6">
          <!-- 1. Permintaan Uji Lab -->
          <div class="p-4 bg-canvas rounded-xl border border-line/50 space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-body-strong text-[15px] font-bold text-ink flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[18px] text-brand">science</span>
                <span>Permintaan Pemeriksaan Laboratorium</span>
              </span>
              <span class="text-caption text-ink-soft font-mono">${labOrders.length} Order</span>
            </div>

            <div class="flex flex-col sm:flex-row items-center gap-2">
              <select id="doctor-new-lab-select" class="w-full sm:flex-1 h-10 px-3 bg-surface rounded-xl border border-line/60 text-caption font-medium cursor-pointer shadow-xs">
                <option value="">-- Pilih Tes Laboratorium Formularium --</option>
                ${SIMRS_MASTER_DATA.labTests.map(l => `<option value="${l.id}">${l.name} (Rp ${l.price.toLocaleString("id-ID")})</option>`).join("")}
              </select>
              <button onclick="addDoctorLabOrder('${activeVisit.id}')" class="w-full sm:w-auto h-10 px-4 bg-brand hover:bg-brand-strong text-on-primary rounded-xl font-body-strong text-caption font-bold flex items-center justify-center gap-1.5 shadow-xs transition shrink-0">
                <span class="material-symbols-outlined text-[17px]">add</span>
                <span>Tambah Order Lab</span>
              </button>
            </div>

            <!-- Lab Orders Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-left font-table-cell text-table-cell border-collapse">
                <thead>
                  <tr class="border-b border-line/50 text-ink-soft text-[11px] font-semibold">
                    <th class="py-2 px-2">Nama Pemeriksaan Lab</th>
                    <th class="py-2 px-2">Tarif</th>
                    <th class="py-2 px-2">Status Lab</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-line/30">
                  ${labOrders.length === 0 ? `
                    <tr><td colspan="3" class="py-3 text-center text-ink-soft text-caption italic">Belum ada order laboratorium untuk pasien ini.</td></tr>
                  ` : labOrders.map(lo => `
                    <tr>
                      <td class="py-2 px-2 font-medium text-ink">${lo.testName}</td>
                      <td class="py-2 px-2 font-mono text-ink-soft">Rp ${(lo.price || 0).toLocaleString("id-ID")}</td>
                      <td class="py-2 px-2">
                        <span class="px-2 py-0.5 rounded text-[11px] font-semibold ${lo.status === 'Completed' ? 'bg-success-tint text-success font-bold' : 'bg-warning-tint text-warning'}">${lo.status || 'Pending'}</span>
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>

          <!-- 2. Tindakan Medis Dokter -->
          <div class="p-4 bg-canvas rounded-xl border border-line/50 space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-body-strong text-[15px] font-bold text-ink flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[18px] text-brand">medical_services</span>
                <span>Tindakan &amp; Prosedur Medis Poliklinik</span>
              </span>
              <span class="text-caption text-ink-soft font-mono">${procedures.length} Tindakan</span>
            </div>

            <div class="flex flex-col sm:flex-row items-center gap-2">
              <select id="doctor-new-procedure-select" class="w-full sm:flex-1 h-10 px-3 bg-surface rounded-xl border border-line/60 text-caption font-medium cursor-pointer shadow-xs">
                <option value="">-- Pilih Tindakan Medis Dokter --</option>
                ${SIMRS_MASTER_DATA.services.filter(s => s.category === 'Tindakan' || s.category === 'Jasa Medis').map(s => `
                  <option value="${s.id}">${s.name} (Rp ${s.price.toLocaleString("id-ID")})</option>
                `).join("")}
              </select>
              <button onclick="addDoctorProcedure('${activeVisit.id}')" class="w-full sm:w-auto h-10 px-4 bg-brand hover:bg-brand-strong text-on-primary rounded-xl font-body-strong text-caption font-bold flex items-center justify-center gap-1.5 shadow-xs transition shrink-0">
                <span class="material-symbols-outlined text-[17px]">add</span>
                <span>Tambah Tindakan</span>
              </button>
            </div>

            <!-- Procedures Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-left font-table-cell text-table-cell border-collapse">
                <thead>
                  <tr class="border-b border-line/50 text-ink-soft text-[11px] font-semibold">
                    <th class="py-2 px-2">Nama Tindakan Medis</th>
                    <th class="py-2 px-2">Tarif</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-line/30">
                  ${procedures.length === 0 ? `
                    <tr><td colspan="2" class="py-3 text-center text-ink-soft text-caption italic">Belum ada tindakan medis tambahan.</td></tr>
                  ` : procedures.map(p => `
                    <tr>
                      <td class="py-2 px-2 font-medium text-ink">${p.name}</td>
                      <td class="py-2 px-2 font-mono text-ink-soft">Rp ${(p.price || 0).toLocaleString("id-ID")}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;

    case "rx":
      const prescriptions = enc.prescriptions || [];
      return `
        <div class="space-y-4 font-body-default text-body-default">
          <div class="flex items-center justify-between pb-2 border-b border-line/40">
            <div>
              <h3 class="font-headline-md text-ink font-bold text-[16px] flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[18px] text-brand">prescriptions</span>
                <span>E-Resep Elektronik (R/)</span>
              </h3>
              <p class="text-caption text-ink-soft">Pilih obat dari formularium rumah sakit dengan aturan pakai standar.</p>
            </div>
            <span class="text-caption font-mono text-ink-soft">${prescriptions.length} Item Resep</span>
          </div>

          <!-- Add Medicine Form Row -->
          <div class="p-3 bg-canvas rounded-xl border border-line/50 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
            <div class="sm:col-span-5">
              <label class="block text-[11px] font-bold text-ink-soft mb-1">Pilih Obat Formularium *</label>
              <select id="doctor-new-rx-med" class="w-full h-10 px-3 bg-surface rounded-xl border border-line/60 text-caption font-medium cursor-pointer shadow-xs">
                <option value="">-- Pilih Obat --</option>
                ${SIMRS_MASTER_DATA.medicines.map(m => `
                  <option value="${m.id}" data-name="${m.name}" data-price="${m.unitPrice}" data-form="${m.form}">
                    ${m.name} (${m.form}) - Rp ${m.unitPrice}/tab
                  </option>
                `).join("")}
              </select>
            </div>

            <div class="sm:col-span-3">
              <label class="block text-[11px] font-bold text-ink-soft mb-1">Signa / Aturan Pakai *</label>
              <input type="text" id="doctor-new-rx-dosage" value="1 x 1 tablet sesudah makan" placeholder="Contoh: 3 x 1 tablet pc" class="w-full h-10 px-3 bg-surface rounded-xl border border-line/60 text-caption text-ink shadow-xs">
            </div>

            <div class="sm:col-span-2">
              <label class="block text-[11px] font-bold text-ink-soft mb-1">Jumlah (Qty) *</label>
              <input type="number" id="doctor-new-rx-qty" value="30" min="1" max="120" class="w-full h-10 px-3 bg-surface rounded-xl border border-line/60 font-mono text-caption text-ink shadow-xs">
            </div>

            <div class="sm:col-span-2">
              <button onclick="addDoctorPrescription('${activeVisit.id}')" class="w-full h-10 bg-brand hover:bg-brand-strong text-on-primary rounded-xl font-body-strong text-caption font-bold flex items-center justify-center gap-1 shadow-xs transition">
                <span class="material-symbols-outlined text-[17px]">add</span>
                <span>Tambah R/</span>
              </button>
            </div>
          </div>

          <!-- Prescription Table -->
          <div class="bg-surface rounded-xl border border-line/50 overflow-hidden shadow-xs">
            <table class="w-full text-left font-table-cell text-table-cell border-collapse">
              <thead>
                <tr class="bg-surface-container-low/80 border-b border-line/50 text-ink-soft text-[11px] font-semibold">
                  <th class="py-2.5 px-3">Nama Obat</th>
                  <th class="py-2.5 px-3">Aturan Pakai (Signa)</th>
                  <th class="py-2.5 px-3">Jumlah</th>
                  <th class="py-2.5 px-3">Subtotal</th>
                  <th class="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-line/30">
                ${prescriptions.length === 0 ? `
                  <tr><td colspan="5" class="py-6 text-center text-ink-soft text-caption italic">Belum ada resep obat untuk kunjungan ini.</td></tr>
                ` : prescriptions.map((rx, idx) => `
                  <tr class="hover:bg-brand-tint/20 transition">
                    <td class="py-2.5 px-3 font-medium text-ink">${rx.medicineName}</td>
                    <td class="py-2.5 px-3 text-caption text-ink-soft font-mono">${rx.dosage}</td>
                    <td class="py-2.5 px-3 font-mono text-ink">${rx.qty} unit</td>
                    <td class="py-2.5 px-3 font-mono text-ink-soft">Rp ${(rx.totalPrice || (rx.qty * (rx.unitPrice || 1000))).toLocaleString("id-ID")}</td>
                    <td class="py-2.5 px-3 text-right">
                      <button onclick="removeDoctorPrescription('${activeVisit.id}', ${idx})" class="p-1 text-danger hover:bg-danger-tint rounded-lg transition" title="Hapus Obat">
                        <span class="material-symbols-outlined text-[17px]">delete</span>
                      </button>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      `;

    case "referral":
      return `
        <div class="space-y-4 max-w-2xl">
          <div>
            <h3 class="font-headline-md text-ink font-bold text-[16px] flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[18px] text-brand">forward</span>
              <span>Rujukan Online Antar-Poli &amp; Eksternal</span>
            </h3>
            <p class="text-caption text-ink-soft">Kirim order rujukan ke dokter spesialis lain, pemeriksaan penunjang, atau faskes lanjutan.</p>
          </div>

          <div class="p-4 bg-canvas rounded-2xl border border-line/50 space-y-3 shadow-inner">
            <div>
              <label class="block text-[11px] font-bold text-ink-soft mb-1">Tipe / Destinasi Rujukan *</label>
              <select id="doc-referral-type" onchange="handleDocReferralTypeChange(this.value)" class="w-full h-10 px-3 bg-surface rounded-xl border border-line/60 text-caption font-semibold cursor-pointer">
                <option value="INTERNAL_SPEC">Konsultasi Internal Spesialis Lain</option>
                <option value="EXTERNAL_FASKES">Rujukan Faskes Tingkat Lanjut (BPJS / Luar RS)</option>
                <option value="REHAB_MEDIS">Rehabilitasi Medis / Fisioterapi</option>
              </select>
            </div>

            <div id="doc-referral-target-container">
              <label class="block text-[11px] font-bold text-ink-soft mb-1">Pilih Spesialis / Poliklinik Tujuan *</label>
              <select id="doc-referral-target" class="w-full h-10 px-3 bg-surface rounded-xl border border-line/60 text-caption font-medium cursor-pointer">
                ${SIMRS_MASTER_DATA.practitioners.filter(p => p.id !== activeVisit.practitionerId).map(doc => `
                  <option value="${doc.id}">${doc.name} (${SIMRS_MASTER_DATA.departments.find(d => d.id === doc.department)?.name || 'Poli'})</option>
                `).join("")}
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-ink-soft mb-1">Indikasi Klinis &amp; Catatan Rujukan *</label>
              <textarea id="doc-referral-notes" rows="3" class="w-full p-3 bg-surface rounded-xl border border-line/60 text-caption text-ink focus:ring-2 focus:ring-brand leading-relaxed" placeholder="Jelaskan alasan rujukan dan temuan klinis relevan..."></textarea>
            </div>

            <button onclick="handleDocSubmitReferral('${activeVisit.id}')" class="h-10 px-5 bg-brand hover:bg-brand-strong text-on-primary rounded-xl font-body-strong text-caption font-bold flex items-center gap-1.5 shadow-sm transition">
              <span class="material-symbols-outlined text-[18px]">send</span>
              <span>Kirim Surat Rujukan</span>
            </button>
          </div>
        </div>
      `;

    case "resume":
      return `
        <div class="space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-line/40">
            <div>
              <h3 class="font-headline-md text-ink font-bold text-[16px] flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[18px] text-brand">description</span>
                <span>Resume Medis Pasien Rawat Jalan</span>
              </h3>
              <p class="text-caption text-ink-soft">Pratinjau ringkasan dokumen medis sebelum dicetak untuk pasien atau asuransi.</p>
            </div>
            <button onclick="printResumeMedis('${activeVisit.id}')" class="h-9 px-4 bg-brand hover:bg-brand-strong text-on-primary rounded-xl font-body-strong text-caption font-bold flex items-center gap-1.5 shadow-sm transition">
              <span class="material-symbols-outlined text-[17px]">print</span>
              <span>Cetak Resume Medis</span>
            </button>
          </div>

          <!-- Printable Document Paper Preview -->
          <div class="p-6 bg-surface border border-line rounded-xl shadow-xs space-y-4 max-w-3xl mx-auto font-sans text-ink">
            <div class="border-b-2 border-ink pb-3 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-brand text-on-primary flex items-center justify-center font-bold text-[18px]">RS</div>
                <div>
                  <h4 class="font-bold text-[16px] text-ink">RS SEHAT MANDIRI NUSANTARA</h4>
                  <p class="text-[11px] text-ink-soft">Jl. Sudirman No. 45, Jakarta Pusat · Telp: (021) 555-0199</p>
                </div>
              </div>
              <div class="text-right font-mono text-[11px]">
                <span class="font-bold block">RESUME MEDIS RAWAT JALAN</span>
                <span class="text-ink-soft">Tgl: ${new Date().toLocaleDateString('id-ID')}</span>
              </div>
            </div>

            <!-- Demographics -->
            <div class="grid grid-cols-2 gap-2 text-caption bg-surface-container-low p-3 rounded-lg font-mono">
              <div>Nama Pasien: <strong>${activeVisit.patientName}</strong></div>
              <div>No. RM: <strong>${activeVisit.mrNo}</strong></div>
              <div>Poli / DPJP: <strong>${activeVisit.departmentName} · ${activeVisit.practitionerName}</strong></div>
              <div>Penjamin: <strong>${activeVisit.payerType}</strong></div>
            </div>

            <!-- Clinical Summary -->
            <div class="space-y-3 text-caption text-ink">
              <div>
                <strong class="block font-bold text-ink-soft text-[11px] uppercase">1. Anamnesis / Riwayat Penyakit:</strong>
                <p class="mt-0.5 leading-relaxed">${enc.subjective || "Pasien datang untuk kontrol rutin poliklinik."}</p>
              </div>

              <div>
                <strong class="block font-bold text-ink-soft text-[11px] uppercase">2. Pemeriksaan Fisik &amp; TTV:</strong>
                <p class="mt-0.5 leading-relaxed">${enc.objective || "Status generalis dalam batas normal."} ${activeVisit.vitals ? `(TD: ${activeVisit.vitals.systolic}/${activeVisit.vitals.diastolic} mmHg, Nadi: ${activeVisit.vitals.pulse} bpm, Suhu: ${activeVisit.vitals.temperature}°C)` : ""}</p>
              </div>

              <div>
                <strong class="block font-bold text-ink-soft text-[11px] uppercase">3. Diagnosis Utama (ICD-10):</strong>
                <p class="mt-0.5 font-bold">${enc.primaryDiagnosis ? `${enc.primaryDiagnosis.code} - ${enc.primaryDiagnosis.name}` : "I10 - Essential (primary) hypertension"}</p>
              </div>

              <div>
                <strong class="block font-bold text-ink-soft text-[11px] uppercase">4. Rencana Terapi &amp; Obat (R/):</strong>
                <p class="mt-0.5 leading-relaxed">${(enc.prescriptions || []).map(r => `${r.medicineName} (${r.dosage}) - ${r.qty} tab`).join(", ") || "Terapi farmakologis oral harian."}</p>
              </div>

              <div>
                <strong class="block font-bold text-ink-soft text-[11px] uppercase">5. Edukasi &amp; Anjuran Kontrol:</strong>
                <p class="mt-0.5 leading-relaxed">${enc.plan || "Modifikasi gaya hidup dan kontrol kembali 1 bulan mendatang."}</p>
              </div>
            </div>

            <div class="pt-4 border-t border-line flex justify-end text-right text-caption">
              <div>
                <p class="text-ink-soft text-[11px]">Dokter Penanggung Jawab Pelayanan (DPJP),</p>
                <div class="h-10"></div>
                <p class="font-bold text-ink underline">${activeVisit.practitionerName}</p>
              </div>
            </div>
          </div>
        </div>
      `;

    default:
      return `<div class="p-4 text-center text-ink-soft">Tab tidak ditemukan.</div>`;
  }
}

// 3.4 DOKTER DATA PASIEN (Search Patients & History)
function renderDoctorPatientsView(container) {
  const patients = SIMRS_MASTER_DATA.initialPatients;
  container.innerHTML = `
    <div class="flex flex-col gap-space-lg w-full">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm border-b border-line/40">
        <div>
          <h1 class="font-headline-lg text-headline-lg text-ink font-bold tracking-tight">Database Rekam Medis Pasien</h1>
          <p class="font-caption text-caption text-ink-soft">Pencarian data identitas dan histori kunjungan rawat jalan pasien.</p>
        </div>
      </div>

      <div class="bg-surface rounded-2xl border border-line/50 overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left font-table-cell text-table-cell border-collapse">
            <thead>
              <tr class="bg-surface-container-low/80 border-b border-line/50 text-ink-soft text-[11px] font-semibold">
                <th class="py-3 px-4">No. RM</th>
                <th class="py-3 px-4">Nama Pasien</th>
                <th class="py-3 px-4">NIK</th>
                <th class="py-3 px-4">Jenis Kelamin / Usia</th>
                <th class="py-3 px-4">No. Telepon</th>
                <th class="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line/30">
              ${patients.map(p => `
                <tr class="hover:bg-brand-tint/20 transition">
                  <td class="py-3 px-4 font-mono font-bold text-brand">${p.mrNo}</td>
                  <td class="py-3 px-4 font-bold text-ink">${p.name}</td>
                  <td class="py-3 px-4 font-mono text-ink-soft">${p.nik}</td>
                  <td class="py-3 px-4">${p.gender === 'M' ? 'Laki-laki' : 'Perempuan'} · ${p.age} th</td>
                  <td class="py-3 px-4 font-mono text-ink-soft">${p.phone}</td>
                  <td class="py-3 px-4 text-right">
                    <button onclick="showToast('Membuka rekam medis pasien ${p.name}', 'info')" class="h-8 px-3 bg-surface hover:bg-brand-tint text-brand border border-line/60 rounded-lg text-caption font-semibold shadow-xs">
                      Buka RME
                    </button>
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

// 3.5 DOKTER DOKUMEN (Medical Summaries Archive)
function renderDoctorDocumentsView(container) {
  const visits = VisitStateService.getVisits().filter(v => v.encounter && v.encounter.isFinalized);
  container.innerHTML = `
    <div class="flex flex-col gap-space-lg w-full">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm border-b border-line/40">
        <div>
          <h1 class="font-headline-lg text-headline-lg text-ink font-bold tracking-tight">Dokumen &amp; Resume Medis Pasien</h1>
          <p class="font-caption text-caption text-ink-soft">Daftar resume medis terfinalisasi yang siap dicetak.</p>
        </div>
      </div>

      <div class="bg-surface rounded-2xl border border-line/50 overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left font-table-cell text-table-cell border-collapse">
            <thead>
              <tr class="bg-surface-container-low/80 border-b border-line/50 text-ink-soft text-[11px] font-semibold">
                <th class="py-3 px-4">No. RM / Tiket</th>
                <th class="py-3 px-4">Nama Pasien</th>
                <th class="py-3 px-4">Poliklinik</th>
                <th class="py-3 px-4">Diagnosis Utama (ICD-10)</th>
                <th class="py-3 px-4">Waktu Finalisasi</th>
                <th class="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line/30">
              ${visits.length === 0 ? `
                <tr><td colspan="6" class="py-8 text-center text-ink-soft">Belum ada resume medis terfinalisasi hari ini.</td></tr>
              ` : visits.map(v => `
                <tr class="hover:bg-brand-tint/20 transition">
                  <td class="py-3 px-4 font-mono font-bold text-brand">${v.mrNo} · ${v.ticketNo}</td>
                  <td class="py-3 px-4 font-bold text-ink">${v.patientName}</td>
                  <td class="py-3 px-4">${v.departmentName}</td>
                  <td class="py-3 px-4 font-medium text-ink">${v.encounter?.primaryDiagnosis?.name || 'Hipertensi Primer'}</td>
                  <td class="py-3 px-4 font-mono text-[11px] text-ink-soft">Hari Ini</td>
                  <td class="py-3 px-4 text-right">
                    <button onclick="printResumeMedis('${v.id}')" class="h-8 px-3.5 bg-brand hover:bg-brand-strong text-on-primary rounded-lg text-caption font-bold flex items-center gap-1 shadow-xs ml-auto">
                      <span class="material-symbols-outlined text-[16px]">print</span>
                      <span>Cetak</span>
                    </button>
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

// Doctor Workflow Helpers
function startDoctorConsultation(visitId) {
  activeDoctorConsultationVisitId = visitId;
  const visit = VisitStateService.findVisitById(visitId);
  if (visit && visit.visitStatus === "WAITING_DOCTOR") {
    try {
      DoctorService.startService(visitId);
    } catch (e) {
      console.warn("Could not transition to IN_SERVICE automatically:", e);
    }
  }
  activeWorkspaceId = "doctor-consultation";
  activeDoctorConsultationTab = "soap";
  renderSidebar();
  renderContextualTopBar();
  renderWorkspace(activeWorkspaceId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchDoctorConsultationTab(tabKey) {
  activeDoctorConsultationTab = tabKey;
  renderDoctorConsultationView(document.getElementById("main-viewport"));
}

function handleDoctorSaveEncounterAndPromptNext(visitId) {
  handleDoctorSaveEncounter(visitId, true);
  
  // Look for next waiting patient
  const nextVisit = VisitStateService.getVisits().find(v => v.visitStatus === "WAITING_DOCTOR");
  if (nextVisit) {
    if (confirm(`Encounter ${visitId} berhasil difinalisasi.\n\nApakah Anda ingin langsung memanggil pasien berikutnya di antrian?\n(Tiket: ${nextVisit.ticketNo} - ${nextVisit.patientName})`)) {
      startDoctorConsultation(nextVisit.id);
    } else {
      activeWorkspaceId = "doctor-queue";
      renderSidebar();
      renderContextualTopBar();
      renderWorkspace(activeWorkspaceId);
    }
  } else {
    showToast("Semua antrian pasien dokter telah selesai diperiksa.", "success");
    activeWorkspaceId = "doctor-queue";
    renderSidebar();
    renderContextualTopBar();
    renderWorkspace(activeWorkspaceId);
  }
}

function addDoctorPrescription(visitId) {
  const visit = VisitStateService.findVisitById(visitId);
  if (!visit) return;
  const medSelect = document.getElementById("doctor-new-rx-med");
  const dosageInput = document.getElementById("doctor-new-rx-dosage");
  const qtyInput = document.getElementById("doctor-new-rx-qty");

  if (!medSelect || !medSelect.value) {
    showToast("Pilih obat terlebih dahulu.", "warning");
    return;
  }

  const opt = medSelect.selectedOptions[0];
  const medId = medSelect.value;
  const medName = opt.getAttribute("data-name");
  const unitPrice = parseInt(opt.getAttribute("data-price") || 1000);
  const dosage = dosageInput ? dosageInput.value : "1 x 1 tablet sesudah makan";
  const qty = qtyInput ? parseInt(qtyInput.value || 30) : 30;

  if (!visit.encounter) visit.encounter = {};
  if (!visit.encounter.prescriptions) visit.encounter.prescriptions = [];

  visit.encounter.prescriptions.push({
    medicineId: medId,
    medicineName: medName,
    dosage: dosage,
    qty: qty,
    unitPrice: unitPrice,
    totalPrice: qty * unitPrice
  });

  VisitStateService.save();
  showToast(`Resep ${medName} ditambahkan.`, "success");
  renderDoctorConsultationView(document.getElementById("main-viewport"));
}

function removeDoctorPrescription(visitId, index) {
  const visit = VisitStateService.findVisitById(visitId);
  if (!visit || !visit.encounter || !visit.encounter.prescriptions) return;
  visit.encounter.prescriptions.splice(index, 1);
  VisitStateService.save();
  showToast("Item resep dihapus.", "neutral");
  renderDoctorConsultationView(document.getElementById("main-viewport"));
}

function addDoctorLabOrder(visitId) {
  const visit = VisitStateService.findVisitById(visitId);
  if (!visit) return;
  const labSelect = document.getElementById("doctor-new-lab-select");
  if (!labSelect || !labSelect.value) {
    showToast("Pilih pemeriksaan laboratorium.", "warning");
    return;
  }
  const labObj = SIMRS_MASTER_DATA.labTests.find(l => l.id === labSelect.value);
  if (!labObj) return;

  if (!visit.encounter) visit.encounter = {};
  if (!visit.encounter.labOrders) visit.encounter.labOrders = [];

  visit.encounter.labOrders.push({
    testId: labObj.id,
    testName: labObj.name,
    price: labObj.price,
    status: "Pending"
  });

  VisitStateService.save();
  showToast(`Permintaan lab ${labObj.name} ditambahkan.`, "success");
  renderDoctorConsultationView(document.getElementById("main-viewport"));
}

function addDoctorProcedure(visitId) {
  const visit = VisitStateService.findVisitById(visitId);
  if (!visit) return;
  const srvSelect = document.getElementById("doctor-new-procedure-select");
  if (!srvSelect || !srvSelect.value) {
    showToast("Pilih tindakan medis.", "warning");
    return;
  }
  const srvObj = SIMRS_MASTER_DATA.services.find(s => s.id === srvSelect.value);
  if (!srvObj) return;

  if (!visit.encounter) visit.encounter = {};
  if (!visit.encounter.procedures) visit.encounter.procedures = [];

  visit.encounter.procedures.push({
    id: srvObj.id,
    name: srvObj.name,
    price: srvObj.price
  });

  VisitStateService.save();
  showToast(`Tindakan ${srvObj.name} ditambahkan.`, "success");
  renderDoctorConsultationView(document.getElementById("main-viewport"));
}

function handleDocReferralTypeChange(val) {
  const targetContainer = document.getElementById("doc-referral-target-container");
  if (!targetContainer) return;
  if (val === "INTERNAL_SPEC") {
    targetContainer.innerHTML = `
      <label class="block text-[11px] font-bold text-ink-soft mb-1">Pilih Spesialis / Poliklinik Tujuan *</label>
      <select id="doc-referral-target" class="w-full h-10 px-3 bg-surface rounded-xl border border-line/60 text-caption font-medium cursor-pointer">
        ${SIMRS_MASTER_DATA.practitioners.map(doc => `
          <option value="${doc.id}">${doc.name} (${SIMRS_MASTER_DATA.departments.find(d => d.id === doc.department)?.name || 'Poli'})</option>
        `).join("")}
      </select>
    `;
  } else if (val === "EXTERNAL_FASKES") {
    targetContainer.innerHTML = `
      <label class="block text-[11px] font-bold text-ink-soft mb-1">Nama Rumah Sakit / Faskes Rujukan Lanjutan *</label>
      <input type="text" id="doc-referral-target" value="RSUP Nasional Dr. Cipto Mangunkusumo (RSCM)" class="w-full h-10 px-3 bg-surface rounded-xl border border-line/60 text-caption text-ink shadow-xs">
    `;
  } else {
    targetContainer.innerHTML = `
      <label class="block text-[11px] font-bold text-ink-soft mb-1">Unit / Modalitas Rehabilitasi Medis *</label>
      <select id="doc-referral-target" class="w-full h-10 px-3 bg-surface rounded-xl border border-line/60 text-caption font-medium cursor-pointer">
        <option value="FISIOTERAPI">Fisioterapi &amp; Terapi Latihan</option>
        <option value="TERAPI_OKUPASI">Terapi Okupasi</option>
        <option value="TERAPI_WICARA">Terapi Wicara</option>
      </select>
    `;
  }
}

function handleDocSubmitReferral(visitId) {
  const target = document.getElementById("doc-referral-target")?.value || "Spesialis";
  const notes = document.getElementById("doc-referral-notes")?.value || "";
  showToast(`Surat rujukan online ke '${target}' berhasil dibuat & dikirim.`, "success");
  switchDoctorConsultationTab("soap");
}

function selectDoctorVisit(visitId) {
  startDoctorConsultation(visitId);
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

  const allPharmacyVisits = pharmacyVisits;

  if (pharmacyDeptFilter !== "ALL") {
    pharmacyVisits = pharmacyVisits.filter(v => {
      if (v.departmentId) return v.departmentId === pharmacyDeptFilter;
      const deptObj = SIMRS_MASTER_DATA.departments.find(d => d.id === pharmacyDeptFilter);
      return deptObj ? v.departmentName === deptObj.name : true;
    });
  }

  if (pharmacyDocFilter !== "ALL") {
    pharmacyVisits = pharmacyVisits.filter(v => {
      if (v.practitionerId) return v.practitionerId === pharmacyDocFilter;
      const docObj = SIMRS_MASTER_DATA.practitioners.find(d => d.id === pharmacyDocFilter);
      return docObj ? (v.practitionerName && v.practitionerName.includes(docObj.name.split(',')[0])) : true;
    });
  }

  const pendingCount = pharmacyVisits.filter(v => v.pharmacyStatus !== 'Dispensed').length;
  const activeDeptObj = SIMRS_MASTER_DATA.departments.find(d => d.id === pharmacyDeptFilter);
  const isFiltered = pharmacyDeptFilter !== "ALL" || pharmacyDocFilter !== "ALL";

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
              <span>Apoteker Klinis (${pharmacyDeptFilter === 'ALL' ? 'Semua Poli' : (activeDeptObj?.name || 'Poli')})</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-xl text-caption font-caption">
          <span class="text-ink-soft">Menunggu Penyerahan:</span>
          <strong class="text-warning font-mono font-bold text-body-strong">${pendingCount}</strong>
          <span class="text-ink-soft font-mono">/ ${allPharmacyVisits.length} resep</span>
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

        <!-- Pharmacy Filter Bar -->
        <div class="p-3 bg-surface-container-low border-b border-line/40 flex flex-wrap items-center justify-between gap-2.5">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-caption font-semibold text-ink-soft flex items-center gap-1 shrink-0">
              <span class="material-symbols-outlined text-[16px] text-brand">filter_list</span>
              <span>Filter Asal Resep:</span>
            </span>

            <select onchange="handlePharmacyDeptFilter(this.value)" class="h-8 px-2.5 bg-surface text-ink text-caption font-medium rounded-lg border border-line/50 focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer">
              <option value="ALL" ${pharmacyDeptFilter === 'ALL' ? 'selected' : ''}>🏢 Semua Poli Asal</option>
              ${SIMRS_MASTER_DATA.departments.map(dept => `
                <option value="${dept.id}" ${pharmacyDeptFilter === dept.id ? 'selected' : ''}>${dept.name}</option>
              `).join("")}
            </select>

            <select onchange="handlePharmacyDocFilter(this.value)" class="h-8 px-2.5 bg-surface text-ink text-caption font-medium rounded-lg border border-line/50 focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer">
              <option value="ALL" ${pharmacyDocFilter === 'ALL' ? 'selected' : ''}>👨‍⚕️ Semua Dokter Peresep</option>
              ${SIMRS_MASTER_DATA.practitioners.map(doc => `
                <option value="${doc.id}" ${pharmacyDocFilter === doc.id ? 'selected' : ''}>${doc.name}</option>
              `).join("")}
            </select>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-caption text-ink-soft">
              Menampilkan: <strong class="text-ink font-mono">${pharmacyVisits.length}</strong> resep
            </span>
            ${isFiltered ? `
              <button onclick="handlePharmacyDeptFilter('ALL'); handlePharmacyDocFilter('ALL');" class="text-caption text-brand hover:underline font-semibold ml-2">
                Reset Filter
              </button>
            ` : ''}
          </div>
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
// WORKSPACE 4: KASIR RAWAT JALAN (MODUL KASIR & BILLING)
// Separating Navigation (L1), Context (L2), Actions (L3)
// ========================================================

// 4.1 KASIR DASHBOARD (Overview Finansial)
function renderCashierDashboardView(container) {
  const visits = VisitStateService.getVisits();
  const readyForBilling = visits.filter(v => v.visitStatus === "SERVICE_COMPLETED" || v.billingStatus === "Paid");
  const unpaidVisits = readyForBilling.filter(v => v.billingStatus !== "Paid");
  const paidVisits = readyForBilling.filter(v => v.billingStatus === "Paid");

  let totalRevenue = 0;
  paidVisits.forEach(v => {
    try {
      const inv = BillingService.aggregateInvoice(v.id);
      totalRevenue += inv.patientPayAmount;
    } catch (e) {}
  });

  const activeVisit = activeCashierVisitId
    ? visits.find(v => v.id === activeCashierVisitId)
    : unpaidVisits[0];

  container.innerHTML = `
    <div class="flex flex-col gap-space-lg w-full">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm border-b border-line/40">
        <div>
          <h1 class="font-headline-lg text-headline-lg text-ink font-bold tracking-tight">Dashboard Kasir &amp; Billing Rawat Jalan</h1>
          <p class="font-caption text-caption text-ink-soft">Penerimaan pembayaran pasien, aggregator tagihan poli, dan pencetakan kwitansi resmi.</p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="activeWorkspaceId='cashier-queue'; renderSidebar(); renderContextualTopBar(); renderWorkspace('cashier-queue');" class="h-9 px-4 bg-brand hover:bg-brand-strong text-on-primary rounded-xl font-body-strong text-caption font-bold flex items-center gap-1.5 shadow-sm transition">
            <span class="material-symbols-outlined text-[18px]">receipt_long</span>
            <span>Buka Antrian Billing</span>
          </button>
        </div>
      </div>

      <!-- 3 Key Metric Pills -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
        <div class="p-space-md bg-surface rounded-2xl border border-line/50 flex items-center justify-between shadow-xs">
          <div>
            <span class="text-caption text-ink-soft font-semibold block">Siap Dibayar (Menunggu)</span>
            <span class="font-headline-lg text-[28px] font-bold text-amber-600 mt-0.5 block">${unpaidVisits.length}</span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <span class="material-symbols-outlined text-[26px]">pending_actions</span>
          </div>
        </div>

        <div class="p-space-md bg-surface rounded-2xl border border-line/50 flex items-center justify-between shadow-xs">
          <div>
            <span class="text-caption text-ink-soft font-semibold block">Transaksi Lunas Hari Ini</span>
            <span class="font-headline-lg text-[28px] font-bold text-emerald-600 mt-0.5 block">${paidVisits.length}</span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span class="material-symbols-outlined text-[26px]">task_alt</span>
          </div>
        </div>

        <div class="p-space-md bg-surface rounded-2xl border border-line/50 flex items-center justify-between shadow-xs">
          <div>
            <span class="text-caption text-ink-soft font-semibold block">Total Penerimaan Kasir</span>
            <span class="font-headline-lg text-[22px] font-bold text-brand mt-0.5 block font-mono">Rp ${totalRevenue.toLocaleString('id-ID')}</span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-brand-tint text-brand flex items-center justify-center">
            <span class="material-symbols-outlined text-[26px]">payments</span>
          </div>
        </div>
      </div>

      <!-- Active Payment Notification Banner -->
      ${activeVisit ? `
        <div class="p-space-md bg-brand-tint/30 rounded-2xl border border-brand/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-brand text-on-primary flex items-center justify-center font-bold text-caption font-mono">
              ${activeVisit.cashierTicket || activeVisit.ticketNo}
            </div>
            <div>
              <span class="text-[11px] font-bold uppercase tracking-wider text-brand block">Pasien Aktif di Loket Kasir</span>
              <span class="font-body-strong text-ink font-bold text-[15px]">${activeVisit.patientName}</span>
              <span class="text-caption text-ink-soft font-mono ml-1.5">(${activeVisit.mrNo}) · Penjamin: ${activeVisit.payerType}</span>
            </div>
          </div>
          <button onclick="startCashierPayment('${activeVisit.id}')" class="h-9 px-4 bg-brand hover:bg-brand-strong text-on-primary rounded-xl font-body-strong text-caption font-bold flex items-center gap-1.5 shadow-sm transition">
            <span class="material-symbols-outlined text-[17px]">point_of_sale</span>
            <span>Lanjutkan Proses Pembayaran</span>
          </button>
        </div>
      ` : ''}

      <!-- Next Billing Table -->
      <div class="bg-surface rounded-2xl border border-line/50 overflow-hidden shadow-xs">
        <div class="p-space-md border-b border-line/30 flex items-center justify-between">
          <h2 class="font-headline-md text-[16px] text-ink font-bold flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px] text-brand">receipt</span>
            <span>Tagihan Pasien Menunggu Pembayaran</span>
          </h2>
          <span class="text-caption text-ink-soft">Total: <strong>${unpaidVisits.length}</strong></span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-canvas/50 border-b border-line/40 text-caption font-semibold text-ink-soft">
                <th class="py-2.5 px-4">Tiket</th>
                <th class="py-2.5 px-4">Pasien &amp; No. RM</th>
                <th class="py-2.5 px-4">Poli Asal &amp; DPJP</th>
                <th class="py-2.5 px-4">Penjamin</th>
                <th class="py-2.5 px-4 text-right">Bayar Mandiri</th>
                <th class="py-2.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line/30">
              ${unpaidVisits.length === 0 ? `
                <tr><td colspan="6" class="py-8 text-center text-ink-soft text-caption">Tidak ada tagihan yang tertunda saat ini.</td></tr>
              ` : unpaidVisits.map(v => {
                const inv = BillingService.aggregateInvoice(v.id);
                return `
                  <tr class="hover:bg-canvas/40 transition">
                    <td class="py-2.5 px-4 font-mono font-bold text-caption text-brand">${v.cashierTicket || v.ticketNo}</td>
                    <td class="py-2.5 px-4">
                      <span class="font-body-strong text-ink block text-[13px] font-bold">${v.patientName}</span>
                      <span class="text-[11px] font-mono text-ink-soft">${v.mrNo}</span>
                    </td>
                    <td class="py-2.5 px-4 text-caption text-ink-soft">
                      <span class="text-ink font-medium block">${v.departmentName}</span>
                      <span class="text-[11px]">${v.practitionerName}</span>
                    </td>
                    <td class="py-2.5 px-4 text-caption">
                      <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold ${v.payerType === 'BPJS' ? 'bg-info-tint text-info' : 'bg-surface-container-low text-ink-soft'}">
                        ${v.payerType}
                      </span>
                    </td>
                    <td class="py-2.5 px-4 text-right font-mono font-bold text-ink text-[13px]">
                      Rp ${inv.patientPayAmount.toLocaleString('id-ID')}
                    </td>
                    <td class="py-2.5 px-4 text-right">
                      <button onclick="startCashierPayment('${v.id}')" class="h-8 px-3 rounded-xl bg-brand hover:bg-brand-strong text-on-primary font-body-strong text-[12px] font-bold transition inline-flex items-center gap-1 shadow-xs">
                        <span class="material-symbols-outlined text-[15px]">point_of_sale</span>
                        <span>Bayar</span>
                      </button>
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

// 4.3 KASIR PEMBAYARAN WORKSPACE (Patient-Centric Settlement Desk)
function renderCashierPaymentView(container) {
  const visits = VisitStateService.getVisits();
  let selectedVisit = null;

  if (activeCashierVisitId) {
    selectedVisit = visits.find(v => v.id === activeCashierVisitId);
  }

  // If no visit selected, show clean empty state
  if (!selectedVisit) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-16 px-4 bg-surface rounded-2xl border border-line/50 text-center max-w-xl mx-auto shadow-sm my-8">
        <div class="w-16 h-16 rounded-2xl bg-brand-tint text-brand flex items-center justify-center mb-4">
          <span class="material-symbols-outlined text-[36px]">point_of_sale</span>
        </div>
        <h2 class="font-headline-md text-headline-md text-ink font-bold mb-1">Belum Ada Tagihan yang Dipilih</h2>
        <p class="font-caption text-caption text-ink-soft max-w-md mb-6 leading-relaxed">
          Silakan buka antrian billing kasir untuk memilih pasien dan tagihan yang akan diproses pembayarannya.
        </p>
        <button onclick="activeWorkspaceId='cashier-queue'; renderSidebar(); renderContextualTopBar(); renderWorkspace('cashier-queue');" class="h-11 px-6 bg-brand hover:bg-brand-strong text-on-primary rounded-xl font-body-strong text-body-strong flex items-center gap-2 shadow-md transition active:scale-95">
          <span class="material-symbols-outlined text-[20px]">receipt_long</span>
          <span>Buka Antrian Billing Kasir</span>
        </button>
      </div>
    `;
    return;
  }

  const inv = BillingService.aggregateInvoice(selectedVisit.id);

  container.innerHTML = `
    <div class="flex flex-col gap-space-lg w-full max-w-5xl mx-auto pb-24">
      
      <!-- LEVEL 2 CONTEXT: Sticky Patient & Invoice Context Banner -->
      <div class="sticky top-24 z-20 p-space-md bg-surface/95 backdrop-blur-md rounded-2xl border border-line/60 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3.5 min-w-0">
          <div class="w-12 h-12 rounded-xl bg-brand-tint text-brand flex items-center justify-center font-bold text-caption font-mono shrink-0 shadow-xs">
            ${selectedVisit.cashierTicket || selectedVisit.ticketNo}
          </div>
          <div class="flex flex-col min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h2 class="font-headline-md text-[18px] text-ink font-bold truncate">${selectedVisit.patientName}</h2>
              <span class="font-mono text-caption text-brand bg-brand-tint/60 px-2 py-0.5 rounded font-bold">${selectedVisit.mrNo}</span>
              <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold ${selectedVisit.payerType === 'BPJS' ? 'bg-info-tint text-info' : 'bg-surface-container-low text-ink-soft'}">
                ${selectedVisit.payerType}
              </span>
            </div>
            <div class="flex items-center gap-2 text-caption text-ink-soft mt-0.5 flex-wrap">
              <span>Poli: <strong class="text-ink font-medium">${selectedVisit.departmentName}</strong></span>
              <span>·</span>
              <span>DPJP: <strong class="text-ink font-medium">${selectedVisit.practitionerName}</strong></span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="callTicket('${selectedVisit.cashierTicket || selectedVisit.ticketNo}', 'Loket Pembayaran Kasir')" class="h-9 px-3 rounded-xl border border-line/60 bg-surface hover:bg-brand-tint text-brand font-body-strong text-caption font-semibold flex items-center gap-1.5 transition shadow-xs">
            <span class="material-symbols-outlined text-[17px]">volume_up</span>
            <span>Panggil Suara</span>
          </button>
          <button onclick="activeWorkspaceId='cashier-queue'; renderSidebar(); renderContextualTopBar(); renderWorkspace('cashier-queue');" class="h-9 px-3 rounded-xl border border-line/60 bg-surface hover:bg-canvas text-ink-soft font-body-strong text-caption font-medium flex items-center gap-1 transition shadow-xs">
            <span class="material-symbols-outlined text-[17px]">arrow_back</span>
            <span>Ganti Tagihan</span>
          </button>
        </div>
      </div>

      <!-- LEVEL 3 ACTIONS: 2-Column Billing & Settlement Desk -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        
        <!-- Left: Itemized Statement (Col 7) -->
        <div class="lg:col-span-7 bg-surface rounded-2xl border border-line/50 p-space-lg flex flex-col gap-space-md shadow-xs">
          <div class="flex items-center justify-between pb-space-sm border-b border-line/40">
            <div class="flex items-center gap-2.5">
              <span class="material-symbols-outlined text-[22px] text-brand">receipt_long</span>
              <div>
                <h3 class="font-headline-md text-[16px] text-ink font-bold">Rincian Tagihan Layanan Rawat Jalan</h3>
                <p class="font-caption text-caption text-ink-soft">Agregasi biaya tindakan medis, konsultasi dokter, penunjang &amp; obat.</p>
              </div>
            </div>
            <button onclick="openAddServiceModal('${selectedVisit.id}')" class="h-8 px-2.5 bg-surface hover:bg-canvas border border-line/60 text-brand rounded-xl text-[11px] font-bold transition shadow-xs flex items-center gap-1">
              <span class="material-symbols-outlined text-[15px]">add_circle</span>
              <span>Tambah Jasa</span>
            </button>
          </div>

          <div class="divide-y divide-line/30">
            ${inv.items.map(item => `
              <div class="py-2.5 flex items-center justify-between gap-2">
                <div class="min-w-0 flex-1">
                  <span class="font-body-strong text-ink block text-[13px] font-semibold truncate">${item.name}</span>
                  <div class="flex items-center gap-2 text-[11px] text-ink-soft">
                    <span class="px-1.5 py-0.2 bg-canvas rounded font-mono">${item.category}</span>
                    <span>${item.qty} x Rp ${item.unitPrice.toLocaleString('id-ID')}</span>
                  </div>
                </div>
                <div class="text-right font-mono font-bold text-ink text-[13px] shrink-0">
                  Rp ${item.total.toLocaleString('id-ID')}
                </div>
              </div>
            `).join("")}
          </div>

          <!-- Financial Summary Calculation Box -->
          <div class="pt-space-md border-t border-line/50 flex flex-col gap-2 bg-canvas/40 p-space-md rounded-xl">
            <div class="flex justify-between text-caption text-ink-soft font-mono">
              <span>Subtotal Layanan:</span>
              <strong class="text-ink">Rp ${inv.subtotal.toLocaleString('id-ID')}</strong>
            </div>
            <div class="flex justify-between text-caption font-mono ${selectedVisit.payerType === 'BPJS' ? 'text-emerald-700' : 'text-blue-700'}">
              <span>Ditanggung Penjamin (${selectedVisit.payerType}):</span>
              <strong>- Rp ${inv.coveredAmount.toLocaleString('id-ID')}</strong>
            </div>
            <div class="pt-2 border-t border-line/40 flex justify-between items-center text-[16px] font-bold text-ink">
              <span>Total Bayar Mandiri:</span>
              <span class="text-xl font-extrabold text-brand font-mono">Rp ${inv.patientPayAmount.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        <!-- Right: Payment Settlement Panel (Col 5) -->
        <div class="lg:col-span-5 bg-surface rounded-2xl border border-line/50 p-space-lg flex flex-col gap-space-md shadow-xs">
          <div class="flex items-center gap-2.5 pb-space-sm border-b border-line/40">
            <span class="material-symbols-outlined text-[22px] text-emerald-700">point_of_sale</span>
            <div>
              <h3 class="font-headline-md text-[16px] text-ink font-bold">Penerimaan Pembayaran</h3>
              <p class="font-caption text-caption text-ink-soft">Pilih metode bayar dan input nominal.</p>
            </div>
          </div>

          <!-- Payment Methods -->
          <div>
            <label class="block font-body-strong mb-1.5 text-ink text-caption">Metode Pembayaran *</label>
            <div class="grid grid-cols-2 gap-2 text-caption">
              <label class="flex items-center gap-2 p-2.5 bg-canvas hover:bg-brand-tint/30 rounded-xl cursor-pointer border border-line/50">
                <input type="radio" name="payment_method" value="Tunai" checked class="text-brand focus:ring-brand">
                <span class="font-semibold text-ink">💵 Tunai (Cash)</span>
              </label>
              <label class="flex items-center gap-2 p-2.5 bg-canvas hover:bg-brand-tint/30 rounded-xl cursor-pointer border border-line/50">
                <input type="radio" name="payment_method" value="QRIS" class="text-brand focus:ring-brand">
                <span class="font-semibold text-ink">📱 QRIS Dinamis</span>
              </label>
              <label class="flex items-center gap-2 p-2.5 bg-canvas hover:bg-brand-tint/30 rounded-xl cursor-pointer border border-line/50">
                <input type="radio" name="payment_method" value="Debit" class="text-brand focus:ring-brand">
                <span class="font-semibold text-ink">💳 Kartu Debit</span>
              </label>
              <label class="flex items-center gap-2 p-2.5 bg-canvas hover:bg-brand-tint/30 rounded-xl cursor-pointer border border-line/50">
                <input type="radio" name="payment_method" value="Asuransi" class="text-brand focus:ring-brand">
                <span class="font-semibold text-ink">📑 Klaim Asuransi</span>
              </label>
            </div>
          </div>

          <!-- Cash Input & Change Calculation -->
          <div class="flex flex-col gap-2 pt-2">
            <div>
              <label class="block font-body-strong mb-1 text-ink text-caption">Uang Diterima dari Pasien (Rp)</label>
              <input type="number" id="cash-tendered" oninput="calculateCashChange(${inv.patientPayAmount})" value="${inv.patientPayAmount}" class="w-full h-11 px-3 bg-canvas rounded-xl font-mono text-lg font-bold text-ink border border-line/60 focus:outline-none focus:ring-2 focus:ring-brand shadow-inner">
            </div>

            <!-- Quick Amount Chips -->
            <div class="flex items-center gap-1.5 flex-wrap">
              <button type="button" onclick="document.getElementById('cash-tendered').value=${inv.patientPayAmount}; calculateCashChange(${inv.patientPayAmount});" class="px-2.5 py-1 bg-canvas hover:bg-brand-tint text-brand rounded-lg text-[11px] font-bold border border-line/60">
                Uang Pas
              </button>
              <button type="button" onclick="document.getElementById('cash-tendered').value=${inv.patientPayAmount + 50000}; calculateCashChange(${inv.patientPayAmount});" class="px-2.5 py-1 bg-canvas hover:bg-brand-tint text-brand rounded-lg text-[11px] font-bold border border-line/60">
                + Rp 50.000
              </button>
              <button type="button" onclick="document.getElementById('cash-tendered').value=${inv.patientPayAmount + 100000}; calculateCashChange(${inv.patientPayAmount});" class="px-2.5 py-1 bg-canvas hover:bg-brand-tint text-brand rounded-lg text-[11px] font-bold border border-line/60">
                + Rp 100.000
              </button>
            </div>

            <div class="p-3 bg-brand-tint/40 rounded-xl border border-brand/20 flex items-center justify-between mt-2">
              <span class="text-caption font-bold text-brand uppercase tracking-wider">Kembalian:</span>
              <span id="cash-change-display" class="font-mono text-xl font-extrabold text-brand">Rp 0</span>
            </div>
          </div>

          <div>
            <label class="block font-body-strong mb-1 text-ink text-caption">Catatan Kwitansi</label>
            <input type="text" id="cashier-notes" placeholder="Catatan transaksi kasir..." class="w-full h-9 px-3 bg-canvas rounded-xl text-caption text-ink border border-line/50 focus:outline-none focus:ring-2 focus:ring-brand">
          </div>
        </div>

      </div>

      <!-- STICKY ACTION DOCK FOOTER -->
      <div class="fixed bottom-0 left-[232px] right-0 bg-surface/95 backdrop-blur-md border-t border-line/50 py-3 px-space-xl z-30 flex items-center justify-between shadow-lg">
        <div class="flex items-center gap-2">
          <button type="button" onclick="activeWorkspaceId='cashier-queue'; renderSidebar(); renderContextualTopBar(); renderWorkspace('cashier-queue');" class="h-10 px-4 rounded-xl border border-line/60 bg-surface hover:bg-canvas text-ink-soft font-body-strong text-caption font-semibold transition shadow-xs flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Kembali ke Antrian</span>
          </button>
          <button type="button" onclick="printBillingCurrent()" class="h-10 px-3.5 rounded-xl border border-line/60 bg-surface hover:bg-canvas text-ink font-body-strong text-caption font-medium transition shadow-xs flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px]">print</span>
            <span>Cetak Rincian Billing</span>
          </button>
        </div>

        <div class="flex items-center gap-3">
          <button onclick="handleCashierPaymentSubmit('${selectedVisit.id}')" class="h-10 px-6 rounded-xl bg-brand hover:bg-brand-strong text-on-primary font-body-strong text-body-strong font-bold transition flex items-center gap-2 shadow-md active:scale-95">
            <span class="material-symbols-outlined text-[20px]">receipt_long</span>
            <span>Bayar &amp; Cetak Kwitansi Resmi</span>
          </button>
        </div>
      </div>

    </div>
  `;
}

// 4.4 KASIR RIWAYAT TRANSAKSI (Settled Receipts Archive)
function renderCashierHistoryView(container) {
  const visits = VisitStateService.getVisits();
  const settledVisits = visits.filter(v => v.billingStatus === "Paid");

  container.innerHTML = `
    <div class="flex flex-col gap-space-lg w-full">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm border-b border-line/40">
        <div>
          <h1 class="font-headline-lg text-headline-lg text-ink font-bold tracking-tight">Riwayat Transaksi Kasir</h1>
          <p class="font-caption text-caption text-ink-soft">Arsip kwitansi pembayaran dan transaksi lunas rawat jalan hari ini.</p>
        </div>
        <span class="text-caption font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
          ${settledVisits.length} Transaksi Lunas
        </span>
      </div>

      <div class="bg-surface rounded-2xl border border-line/50 overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-canvas/60 border-b border-line/40 text-caption font-semibold text-ink-soft uppercase text-[11px]">
                <th class="py-3 px-4">No. Kwitansi / Tiket</th>
                <th class="py-3 px-4">Pasien &amp; No. RM</th>
                <th class="py-3 px-4">Poli Asal &amp; DPJP</th>
                <th class="py-3 px-4">Penjamin</th>
                <th class="py-3 px-4 text-right">Total Dibayar</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line/30">
              ${settledVisits.length === 0 ? `
                <tr><td colspan="7" class="py-12 text-center text-ink-soft">Belum ada transaksi pembayaran lunas hari ini.</td></tr>
              ` : settledVisits.map(v => {
                const inv = BillingService.aggregateInvoice(v.id);
                return `
                  <tr class="hover:bg-canvas/30 transition">
                    <td class="py-3 px-4 font-mono font-bold text-caption text-brand">${v.cashierTicket || v.ticketNo}</td>
                    <td class="py-3 px-4">
                      <span class="font-body-strong text-ink block font-bold text-[13px]">${v.patientName}</span>
                      <span class="font-mono text-[11px] text-ink-soft">${v.mrNo}</span>
                    </td>
                    <td class="py-3 px-4 text-caption text-ink-soft">
                      <span class="text-ink font-medium block">${v.departmentName}</span>
                      <span class="text-[11px]">${v.practitionerName}</span>
                    </td>
                    <td class="py-3 px-4 text-caption">
                      <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${v.payerType === 'BPJS' ? 'bg-info-tint text-info' : 'bg-surface-container-low text-ink-soft'}">
                        ${v.payerType}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-right font-mono font-bold text-ink text-[13px]">
                      Rp ${inv.patientPayAmount.toLocaleString('id-ID')}
                    </td>
                    <td class="py-3 px-4">
                      <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                        Lunas
                      </span>
                    </td>
                    <td class="py-3 px-4 text-right">
                      <button onclick="printKwitansi('${v.id}')" class="h-8 px-3 bg-surface hover:bg-canvas border border-line/60 text-ink rounded-lg text-caption font-medium transition shadow-xs inline-flex items-center gap-1">
                        <span class="material-symbols-outlined text-[15px]">print</span>
                        <span>Cetak Kwitansi</span>
                      </button>
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

// Helpers for Cashier workflows
function startCashierPayment(visitId) {
  activeCashierVisitId = visitId;
  activeWorkspaceId = "cashier-payment";
  renderSidebar();
  renderContextualTopBar();
  renderWorkspace(activeWorkspaceId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function calculateCashChange(totalDue) {
  const inputEl = document.getElementById("cash-tendered");
  const changeEl = document.getElementById("cash-change-display");
  if (!inputEl || !changeEl) return;
  const tendered = parseFloat(inputEl.value || 0);
  const change = Math.max(0, tendered - totalDue);
  changeEl.textContent = `Rp ${change.toLocaleString('id-ID')}`;
}

function handleCashierPaymentSubmit(visitId) {
  try {
    const selectedMethod = document.querySelector('input[name="payment_method"]:checked')?.value || "Tunai";
    const invoice = BillingService.aggregateInvoice(visitId);
    BillingService.processPayment(visitId, selectedMethod, invoice.patientPayAmount);
    showToast("Pembayaran berhasil diverifikasi. Kwitansi resmi lunas dicetak.", "success");
    printKwitansi(visitId);

    // Look for next waiting billing patient
    const nextVisit = VisitStateService.getVisits().find(v => (v.visitStatus === "SERVICE_COMPLETED" || v.billingStatus !== "Paid") && v.id !== visitId && v.billingStatus !== "Paid");
    if (nextVisit) {
      if (confirm(`Pembayaran untuk kunjungan ${visitId} berhasil diproses.\n\nApakah Anda ingin langsung memproses pasien berikutnya di antrian kasir?\n(Tiket: ${nextVisit.cashierTicket || nextVisit.ticketNo} - ${nextVisit.patientName})`)) {
        startCashierPayment(nextVisit.id);
      } else {
        activeWorkspaceId = "cashier-queue";
        renderSidebar();
        renderContextualTopBar();
        renderWorkspace(activeWorkspaceId);
      }
    } else {
      activeWorkspaceId = "cashier-queue";
      renderSidebar();
      renderContextualTopBar();
      renderWorkspace(activeWorkspaceId);
    }
  } catch (err) {
    showToast(err.message, "danger");
  }
}

// Backwards-compatible alias for kasir
function renderKasirWorkspace(container) {
  renderCashierQueueView(container);
}

// 4.2 KASIR ANTRIAN BILLING (Dedicated Queue Table)
function renderCashierQueueView(container) {
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

  const allBilling = readyForBilling;

  if (cashierDeptFilter !== "ALL") {
    readyForBilling = readyForBilling.filter(v => {
      if (v.departmentId) return v.departmentId === cashierDeptFilter;
      const deptObj = SIMRS_MASTER_DATA.departments.find(d => d.id === cashierDeptFilter);
      return deptObj ? v.departmentName === deptObj.name : true;
    });
  }

  if (cashierPayerFilter !== "ALL") {
    readyForBilling = readyForBilling.filter(v => v.payerType === cashierPayerFilter);
  }

  const unpaidCount = readyForBilling.filter(v => v.billingStatus !== 'Paid').length;
  const paidCount = readyForBilling.filter(v => v.billingStatus === 'Paid').length;
  const activeDeptObj = SIMRS_MASTER_DATA.departments.find(d => d.id === cashierDeptFilter);
  const isFiltered = cashierDeptFilter !== "ALL" || cashierPayerFilter !== "ALL";

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
              <span>Kasir Rawat Jalan (${cashierDeptFilter === 'ALL' ? 'Semua Poli' : (activeDeptObj?.name || 'Poli')})</span>
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

        <!-- Kasir Filter Bar -->
        <div class="p-3 bg-surface-container-low border-b border-line/40 flex flex-wrap items-center justify-between gap-2.5">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-caption font-semibold text-ink-soft flex items-center gap-1 shrink-0">
              <span class="material-symbols-outlined text-[16px] text-brand">filter_list</span>
              <span>Filter Unit Tagihan:</span>
            </span>

            <select onchange="handleKasirDeptFilter(this.value)" class="h-8 px-2.5 bg-surface text-ink text-caption font-medium rounded-lg border border-line/50 focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer">
              <option value="ALL" ${cashierDeptFilter === 'ALL' ? 'selected' : ''}>🏢 Semua Poli Asal</option>
              ${SIMRS_MASTER_DATA.departments.map(dept => `
                <option value="${dept.id}" ${cashierDeptFilter === dept.id ? 'selected' : ''}>${dept.name}</option>
              `).join("")}
            </select>

            <select onchange="handleKasirPayerFilter(this.value)" class="h-8 px-2.5 bg-surface text-ink text-caption font-medium rounded-lg border border-line/50 focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer">
              <option value="ALL" ${cashierPayerFilter === 'ALL' ? 'selected' : ''}>💳 Semua Penjamin</option>
              <option value="BPJS" ${cashierPayerFilter === 'BPJS' ? 'selected' : ''}>BPJS Kesehatan</option>
              <option value="Umum" ${cashierPayerFilter === 'Umum' ? 'selected' : ''}>Umum / Mandiri</option>
            </select>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-caption text-ink-soft">
              Menampilkan: <strong class="text-ink font-mono">${readyForBilling.length}</strong> dari <span class="font-mono">${allBilling.length}</span> tagihan
            </span>
            ${isFiltered ? `
              <button onclick="handleKasirDeptFilter('ALL'); handleKasirPayerFilter('ALL');" class="text-caption text-brand hover:underline font-semibold ml-2">
                Reset Filter
              </button>
            ` : ''}
          </div>
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
  const visits = VisitStateService.getVisits();
  const latestCall = JSON.parse(localStorage.getItem("SIMRS_LATEST_CALL") || '{"ticketNo": "A-001", "destination": "Poli Penyakit Dalam"}');
  const activeDeptObj = SIMRS_MASTER_DATA.departments.find(d => d.id === displayDeptFilter);

  const deptVisits = activeDeptObj ? visits.filter(v => v.departmentId === activeDeptObj.id || v.departmentName === activeDeptObj.name) : visits;
  const deptInService = deptVisits.filter(v => v.visitStatus === "IN_SERVICE");
  const deptWaitingDoctor = deptVisits.filter(v => v.visitStatus === "WAITING_DOCTOR");
  const deptWaitingTriage = deptVisits.filter(v => v.visitStatus === "WAITING_TRIAGE");

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
            <p class="text-caption text-brand-tint/80 uppercase tracking-wider font-semibold">
              ${displayDeptFilter === 'ALL' ? 'Papan Informasi Antrian Poliklinik Rawat Jalan' : `Display Khusus: ${activeDeptObj?.name} (${activeDeptObj?.room})`}
            </p>
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

      <!-- Display Mode Selector (Zero-PHI Control Bar) -->
      <div class="flex flex-wrap items-center justify-between gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[20px] text-brand-tint">tv</span>
          <span class="text-caption font-bold text-white uppercase tracking-wider">Pilih Layar Display:</span>
          <select onchange="handleDisplayDeptFilter(this.value)" class="h-8 px-2.5 bg-ink text-white font-medium text-caption rounded-lg border border-white/20 focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer">
            <option value="ALL" ${displayDeptFilter === 'ALL' ? 'selected' : ''}>📺 Display Sentral (Semua Poliklinik)</option>
            ${SIMRS_MASTER_DATA.departments.map(dept => `
              <option value="${dept.id}" ${displayDeptFilter === dept.id ? 'selected' : ''}>
                ${dept.name} (${dept.room})
              </option>
            `).join("")}
          </select>
        </div>
        <div class="text-caption text-white/70 font-mono flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-success"></span>
          <span>${displayDeptFilter === 'ALL' ? 'Papan Informasi Terpusat' : `Dedicated: ${activeDeptObj?.name} · ${activeDeptObj?.room}`}</span>
        </div>
      </div>

      <!-- Called Ticket Big Banner -->
      <div class="bg-surface/5 p-space-xl rounded-2xl border-2 border-brand text-center relative overflow-hidden">
        <div class="absolute -top-12 -right-12 w-48 h-48 bg-brand/10 rounded-full blur-3xl pointer-events-none"></div>
        <span class="text-caption font-bold text-brand-tint uppercase tracking-widest block">
          ${displayDeptFilter === 'ALL' ? 'NOMOR ANTRIAN DIPANGGIL' : `NOMOR ANTRIAN ${activeDeptObj?.name.toUpperCase()} DIPANGGIL`}
        </span>
        <div class="text-8xl font-black text-brand-tint my-4 font-mono tracking-widest">
          ${displayDeptFilter === 'ALL' ? latestCall.ticketNo : (deptInService[0]?.ticketNo || deptWaitingDoctor[0]?.ticketNo || latestCall.ticketNo)}
        </div>
        <p class="text-xl font-bold text-white tracking-wide">
          SILAKAN MENUJU KE: <span class="text-brand-tint underline decoration-brand/60 underline-offset-4">
            ${displayDeptFilter === 'ALL' ? latestCall.destination.toUpperCase() : `${activeDeptObj?.name.toUpperCase()} (${activeDeptObj?.room.toUpperCase()})`}
          </span>
        </p>
      </div>

      ${displayDeptFilter === 'ALL' ? `
        <!-- 4 Columns Central Overview Grid -->
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
      ` : `
        <!-- Dedicated Poliklinik Queue Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          
          <!-- Column 1: Sedang Dilayani -->
          <div class="p-space-lg rounded-xl bg-surface/5 border border-brand/40 text-center flex flex-col justify-between">
            <span class="text-caption text-brand-tint font-bold uppercase tracking-wider block mb-2">
              🟢 Sedang Dilayani di ${activeDeptObj?.room}
            </span>
            <div class="py-4">
              <span class="text-5xl font-black text-brand-tint font-mono block">
                ${deptInService[0]?.ticketNo || '-'}
              </span>
              <span class="text-caption text-white/60 mt-1 block">
                ${deptInService[0] ? 'Pemeriksaan Dokter' : 'Menunggu Pasien'}
              </span>
            </div>
            <span class="text-caption text-white/40 font-mono">Status: IN_SERVICE</span>
          </div>

          <!-- Column 2: Antrian Menunggu Dokter -->
          <div class="p-space-lg rounded-xl bg-surface/5 border border-white/10 flex flex-col gap-2">
            <div class="flex items-center justify-between pb-1 border-b border-white/10">
              <span class="text-caption text-white/80 font-semibold uppercase tracking-wider">Antrian Dokter (Siap Masuk)</span>
              <span class="font-mono text-caption text-brand-tint font-bold bg-white/10 px-2 py-0.5 rounded">${deptWaitingDoctor.length}</span>
            </div>
            <div class="flex flex-wrap gap-2 pt-2">
              ${deptWaitingDoctor.length === 0 ? '<span class="text-caption text-white/50 italic">Tidak ada antrian menunggu dokter</span>' : ''}
              ${deptWaitingDoctor.map(v => `
                <span class="px-3 py-1.5 rounded-lg bg-surface/10 text-brand-tint font-mono font-bold text-lg border border-white/10">
                  ${v.ticketNo}
                </span>
              `).join("")}
            </div>
          </div>

          <!-- Column 3: Antrian Triase / TTV -->
          <div class="p-space-lg rounded-xl bg-surface/5 border border-white/10 flex flex-col gap-2">
            <div class="flex items-center justify-between pb-1 border-b border-white/10">
              <span class="text-caption text-white/80 font-semibold uppercase tracking-wider">Antrian Triase &amp; TTV</span>
              <span class="font-mono text-caption text-brand-tint font-bold bg-white/10 px-2 py-0.5 rounded">${deptWaitingTriage.length}</span>
            </div>
            <div class="flex flex-wrap gap-2 pt-2">
              ${deptWaitingTriage.length === 0 ? '<span class="text-caption text-white/50 italic">Tidak ada antrian triase</span>' : ''}
              ${deptWaitingTriage.map(v => `
                <span class="px-3 py-1.5 rounded-lg bg-surface/10 text-white/80 font-mono font-bold text-lg border border-white/10">
                  ${v.ticketNo}
                </span>
              `).join("")}
            </div>
          </div>

        </div>
      `}

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
    activeTriageVisitId = null;
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

// 11. Modal Controls & Matriks Hak Akses Inspector
let currentRoleMatrixFilter = "ALL";
let currentRoleMatrixSearch = "";

function openRoleInspector() {
  const el = document.getElementById("modal-role-inspector");
  if (!el) return;
  el.classList.remove("hidden");
  el.classList.add("flex");
  
  // Render matrix table when modal opens
  initRoleMatrixTable();
}

function closeRoleInspector() {
  const el = document.getElementById("modal-role-inspector");
  if (!el) return;
  el.classList.add("hidden");
  el.classList.remove("flex");
}

function switchRoleInspectorTab(tabId) {
  const tabs = ["matrix", "arch", "security"];
  tabs.forEach(t => {
    const content = document.getElementById(`tab-content-${t}`);
    const btn = document.getElementById(`tab-btn-${t}`);
    if (content) {
      if (t === tabId) {
        content.classList.remove("hidden");
        if (t === "matrix") content.classList.add("flex");
      } else {
        content.classList.add("hidden");
        if (t === "matrix") content.classList.remove("flex");
      }
    }
    if (btn) {
      if (t === tabId) {
        btn.classList.add("border-brand", "text-brand");
        btn.classList.remove("border-transparent", "text-ink-soft");
      } else {
        btn.classList.remove("border-brand", "text-brand");
        btn.classList.add("border-transparent", "text-ink-soft");
      }
    }
  });
}

function getRoleBadgeConfig(role) {
  if (role.includes("Dokter")) {
    return { icon: "stethoscope", bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-200" };
  } else if (role.includes("Perawat")) {
    return { icon: "vital_signs", bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" };
  } else if (role.includes("Pendaftaran")) {
    return { icon: "how_to_reg", bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200" };
  } else if (role.includes("Apoteker")) {
    return { icon: "prescriptions", bg: "bg-teal-50", text: "text-teal-800", border: "border-teal-200" };
  } else if (role.includes("Kasir")) {
    return { icon: "payments", bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" };
  } else if (role.includes("Lab")) {
    return { icon: "science", bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" };
  } else if (role.includes("Supervisor")) {
    return { icon: "monitoring", bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200" };
  } else if (role.includes("Auditor")) {
    return { icon: "fact_check", bg: "bg-slate-100", text: "text-slate-800", border: "border-slate-300" };
  }
  return { icon: "badge", bg: "bg-surface-container", text: "text-ink", border: "border-line" };
}

function getAuthorityBadgeConfig(auth) {
  switch (auth) {
    case "Finalization":
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
    case "Final Approval":
      return "bg-teal-100 text-teal-800 border-teal-300";
    case "Approval":
      return "bg-purple-100 text-purple-800 border-purple-300";
    case "Verification":
      return "bg-amber-100 text-amber-800 border-amber-300";
    case "Review":
      return "bg-indigo-100 text-indigo-800 border-indigo-300";
    case "Audit":
      return "bg-slate-200 text-slate-800 border-slate-300";
    case "Staff":
    default:
      return "bg-blue-100 text-blue-800 border-blue-300";
  }
}

function getDataScopeBadgeConfig(scope) {
  if (scope.includes("Current Patient") || scope.includes("Assigned Patient")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (scope.includes("Assigned Queue")) {
    return "bg-cyan-50 text-cyan-700 border-cyan-200";
  } else if (scope.includes("Current Encounter")) {
    return "bg-purple-50 text-purple-700 border-purple-200";
  } else if (scope.includes("Own Polyclinic") || scope.includes("Own Department")) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  } else if (scope.includes("Outpatient-wide")) {
    return "bg-orange-50 text-orange-700 border-orange-200";
  } else if (scope.includes("Read-only")) {
    return "bg-slate-100 text-slate-700 border-slate-300";
  } else if (scope.includes("Pharmacy")) {
    return "bg-teal-50 text-teal-700 border-teal-200";
  } else if (scope.includes("Laboratory")) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  return "bg-surface-container text-ink-soft border-line";
}

function initRoleMatrixTable() {
  if (!window.ROLE_MATRIX_DATA || !Array.isArray(window.ROLE_MATRIX_DATA)) return;
  applyRoleMatrixFilters();
}

function filterRoleMatrix(roleName) {
  currentRoleMatrixFilter = roleName;
  
  // Update pill buttons style
  const pillBtns = document.querySelectorAll("#role-filter-pills .role-pill-btn");
  pillBtns.forEach(btn => {
    if (btn.getAttribute("data-role") === roleName) {
      btn.classList.add("bg-brand", "text-on-primary", "shadow-xs");
      btn.classList.remove("bg-surface", "text-ink");
    } else {
      btn.classList.remove("bg-brand", "text-on-primary", "shadow-xs");
      btn.classList.add("bg-surface", "text-ink");
    }
  });

  applyRoleMatrixFilters();
}

function handleRoleMatrixSearch(query) {
  currentRoleMatrixSearch = (query || "").trim().toLowerCase();
  applyRoleMatrixFilters();
}

function applyRoleMatrixFilters() {
  if (!window.ROLE_MATRIX_DATA) return;
  
  let list = window.ROLE_MATRIX_DATA;
  
  // Filter by role
  if (currentRoleMatrixFilter !== "ALL") {
    list = list.filter(item => item.role === currentRoleMatrixFilter);
  }
  
  // Filter by search query
  if (currentRoleMatrixSearch) {
    const q = currentRoleMatrixSearch;
    list = list.filter(item => {
      return (
        item.role.toLowerCase().includes(q) ||
        item.module.toLowerCase().includes(q) ||
        item.submodule.toLowerCase().includes(q) ||
        item.feature.toLowerCase().includes(q) ||
        item.dataScope.toLowerCase().includes(q) ||
        item.permission.toLowerCase().includes(q) ||
        item.authority.toLowerCase().includes(q) ||
        item.workflowAction.toLowerCase().includes(q) ||
        item.accessCondition.toLowerCase().includes(q) ||
        item.evidence.toLowerCase().includes(q) ||
        item.notes.toLowerCase().includes(q)
      );
    });
  }
  
  renderRoleMatrixTable(list);
}

function renderRoleMatrixTable(items) {
  const tbody = document.getElementById("role-matrix-tbody");
  const counterEl = document.getElementById("role-matrix-counter");
  const tabCounter = document.getElementById("tab-matrix-counter");
  if (!tbody) return;

  if (counterEl) {
    counterEl.textContent = `Menampilkan ${items.length} dari ${window.ROLE_MATRIX_DATA.length} izin granular`;
  }
  if (tabCounter) {
    tabCounter.textContent = items.length;
  }

  if (items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="p-8 text-center text-ink-soft">
          <div class="flex flex-col items-center justify-center gap-2">
            <span class="material-symbols-outlined text-[36px] text-ink-soft/40">search_off</span>
            <span class="font-body-strong text-body-strong">Tidak ada data izin yang cocok dengan pencarian.</span>
            <span class="text-[12px]">Coba gunakan kata kunci pencarian atau reset filter role.</span>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = items.map((item, index) => {
    const roleCfg = getRoleBadgeConfig(item.role);
    const authCls = getAuthorityBadgeConfig(item.authority);
    const scopeCls = getDataScopeBadgeConfig(item.dataScope);

    return `
      <tr class="hover:bg-surface-container-low/60 transition-colors">
        <!-- Role -->
        <td class="p-2.5 pl-3 align-top">
          <div class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg ${roleCfg.bg} ${roleCfg.text} border ${roleCfg.border} text-[11px] font-bold">
            <span class="material-symbols-outlined text-[15px]">${roleCfg.icon}</span>
            <span>${item.role}</span>
          </div>
        </td>

        <!-- Module & Submodule -->
        <td class="p-2.5 align-top">
          <div class="font-semibold text-ink text-[12px]">${item.module}</div>
          <div class="font-caption text-[11px] text-ink-soft">${item.submodule}</div>
        </td>

        <!-- Feature & Workflow Action -->
        <td class="p-2.5 align-top">
          <div class="font-bold text-ink text-[12px] flex items-center gap-1">
            <span>${item.feature}</span>
          </div>
          <div class="text-[11px] text-ink-soft mt-0.5 leading-tight">${item.workflowAction}</div>
        </td>

        <!-- Data Scope -->
        <td class="p-2.5 align-top">
          <span class="inline-block px-2 py-0.5 rounded-md border text-[11px] font-mono font-semibold ${scopeCls}">
            ${item.dataScope}
          </span>
        </td>

        <!-- Permission & Authority -->
        <td class="p-2.5 align-top">
          <div class="font-mono font-bold text-ink text-[12px]">${item.permission}</div>
          <div class="mt-1">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${authCls}">
              ${item.authority}
            </span>
          </div>
        </td>

        <!-- Access Condition -->
        <td class="p-2.5 align-top">
          <div class="text-[11px] ${item.accessCondition === 'None' ? 'text-ink-soft italic font-mono' : 'text-ink bg-surface-container-low p-1.5 rounded-lg border border-line/30 leading-snug'}">
            ${item.accessCondition}
          </div>
        </td>

        <!-- Evidence & Notes -->
        <td class="p-2.5 pr-3 align-top">
          <div class="text-[11px] text-brand font-medium leading-snug">
            <span class="material-symbols-outlined text-[13px] align-middle mr-0.5">travel_explore</span>
            <span>${item.evidence}</span>
          </div>
          <div class="text-[11px] text-ink-soft mt-1 border-t border-line/30 pt-1 leading-snug">
            ${item.notes}
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function downloadUserRoleCsv() {
  try {
    const a = document.createElement("a");
    a.href = ".user-role.csv";
    a.download = ".user-role.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (typeof showToastNotification === "function") {
      showToastNotification("Mengunduh .user-role.csv...");
    }
  } catch (err) {
    console.error("Direct download failed, generating blob fallback:", err);
    if (window.ROLE_MATRIX_DATA) {
      const headers = [
        "Role", "Role Description", "Responsibility", "Module", "Submodule", "Feature",
        "Data Scope", "Permission", "Approval / Authority Level", "Workflow Action",
        "Access Condition", "Source / Evidence", "Confidence", "Notes"
      ];
      const rows = [headers.join(",")];
      window.ROLE_MATRIX_DATA.forEach(r => {
        const row = [
          `"${(r.role || '').replace(/"/g, '""')}"`,
          `"${(r.roleDescription || '').replace(/"/g, '""')}"`,
          `"${(r.responsibility || '').replace(/"/g, '""')}"`,
          `"${(r.module || '').replace(/"/g, '""')}"`,
          `"${(r.submodule || '').replace(/"/g, '""')}"`,
          `"${(r.feature || '').replace(/"/g, '""')}"`,
          `"${(r.dataScope || '').replace(/"/g, '""')}"`,
          `"${(r.permission || '').replace(/"/g, '""')}"`,
          `"${(r.authority || '').replace(/"/g, '""')}"`,
          `"${(r.workflowAction || '').replace(/"/g, '""')}"`,
          `"${(r.accessCondition || '').replace(/"/g, '""')}"`,
          `"${(r.evidence || '').replace(/"/g, '""')}"`,
          `"${(r.confidence || '').replace(/"/g, '""')}"`,
          `"${(r.notes || '').replace(/"/g, '""')}"`
        ];
        rows.push(row.join(","));
      });
      const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = ".user-role.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      if (typeof showToastNotification === "function") {
        showToastNotification("Mengunduh .user-role.csv...");
      }
    }
  }
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
  const memberGroup = document.getElementById("payer-member-group");
  const companyGroup = document.getElementById("payer-company-group");
  const umumGroup = document.getElementById("payer-umum-group");

  if (payerType === "Perusahaan") {
    if (companyGroup) companyGroup.classList.remove("hidden");
    if (memberGroup) memberGroup.classList.add("hidden");
    if (umumGroup) umumGroup.classList.add("hidden");
  } else if (payerType === "BPJS" || payerType === "Asuransi") {
    if (memberGroup) memberGroup.classList.remove("hidden");
    if (companyGroup) companyGroup.classList.add("hidden");
    if (umumGroup) umumGroup.classList.add("hidden");
  } else {
    // Umum
    if (umumGroup) umumGroup.classList.remove("hidden");
    if (memberGroup) memberGroup.classList.add("hidden");
    if (companyGroup) companyGroup.classList.add("hidden");
  }
}

function submitNewPatient(e) {
  e.preventDefault();
  try {
    const payerType = document.getElementById("reg-payer").value;
    let companyName = null;
    let guarantorCode = null;
    let payerMemberNo = "-";
    let subPayment = null;
    let paymentSummary = "";

    if (payerType === "Perusahaan") {
      companyName = document.getElementById("reg-company-name")?.value.trim() || "";
      guarantorCode = document.getElementById("reg-company-code")?.value.trim() || "";
      if (!companyName) throw new Error("Nama Perusahaan Penjamin wajib diisi!");
      if (!guarantorCode) throw new Error("Kode Penjamin dari Perusahaan wajib diisi!");
      payerMemberNo = guarantorCode;
      paymentSummary = `Perusahaan: ${companyName} (${guarantorCode})`;
    } else if (payerType === "Umum") {
      subPayment = document.getElementById("reg-sub-payment")?.value || "Cash";
      const ref = document.getElementById("reg-payment-ref")?.value.trim() || "";
      paymentSummary = `Umum (${subPayment}${ref ? `: ${ref}` : ''})`;
    } else {
      payerMemberNo = document.getElementById("reg-payer-no") ? document.getElementById("reg-payer-no").value : "-";
      paymentSummary = `${payerType === "BPJS" ? "BPJS Kesehatan" : "Asuransi Swasta"} (${payerMemberNo})`;
    }

    const patientData = {
      nik: document.getElementById("reg-nik").value,
      name: document.getElementById("reg-name").value,
      gender: document.getElementById("reg-gender").value,
      birthDate: document.getElementById("reg-birthdate").value,
      phone: document.getElementById("reg-phone").value,
      payerType: payerType,
      payerMemberNo: payerMemberNo,
      companyName: companyName,
      guarantorCode: guarantorCode
    };

    const patient = RegistrationService.createPatient(patientData);

    const registration = {
      patientId: patient.id,
      patientName: patient.name,
      mrNo: patient.mrNo,
      departmentId: document.getElementById("reg-poli").value,
      practitionerId: document.getElementById("reg-doctor").value,
      payerType: payerType,
      payerMemberNo: payerMemberNo,
      companyName: companyName,
      guarantorCode: guarantorCode,
      paymentSubMethod: subPayment,
      paymentDetailSummary: paymentSummary,
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

  const paymentDisplay = visit.payerType === 'Perusahaan' 
    ? `Perusahaan Penjamin: ${visit.companyName || '-'} (Kode: ${visit.guarantorCode || visit.payerMemberNo || '-'})`
    : visit.payerType === 'BPJS'
    ? `BPJS Kesehatan (No: ${visit.payerMemberNo || '-'})`
    : visit.payerType === 'Asuransi'
    ? `Asuransi Swasta (Polis: ${visit.payerMemberNo || '-'})`
    : `Umum / Mandiri (${visit.paymentSubMethod || 'Cash'}${visit.paymentDetailSummary ? ` · ${visit.paymentDetailSummary}` : ''})`;

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
        <p><strong>Penjamin / Bayar:</strong> ${paymentDisplay}</p>
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
  const res = await frappeApi.sendSatuSehatEncounter("REG-WALK-B8K21");
  viewer.textContent = JSON.stringify(res, null, 2);
}

async function testApiQueue() {
  const viewer = document.getElementById("api-log-viewer");
  viewer.textContent = JSON.stringify({ status: "Synced", queue_total: 4 }, null, 2);
}
