/**
 * SIMRS Mini - Domain Services & Business Logic
 * Based on docs/data-model.md §3, §6, §7, §8, §9 & docs/system-hierarchy.md
 */

// ==========================================
// 1. Visit State Machine Service (§6.1)
// ==========================================
const VISIT_ALLOWED_TRANSITIONS = {
  "REGISTERED": ["WAITING_TRIAGE", "CANCELLED"],
  "WAITING_TRIAGE": ["IN_TRIAGE", "CANCELLED"],
  "IN_TRIAGE": ["WAITING_DOCTOR", "ESCALATED", "CANCELLED"],
  "WAITING_DOCTOR": ["IN_SERVICE", "CANCELLED"],
  "IN_SERVICE": ["WAITING_RESULTS", "SERVICE_COMPLETED", "CANCELLED"],
  "WAITING_RESULTS": ["IN_SERVICE", "SERVICE_COMPLETED", "CANCELLED"],
  "SERVICE_COMPLETED": ["CLOSED", "CANCELLED"],
  "ESCALATED": ["CLOSED", "CANCELLED"],
  "CLOSED": [],
  "CANCELLED": []
};

class VisitStateService {
  static getVisits() {
    return JSON.parse(localStorage.getItem("SIMRS_VISITS") || "[]");
  }

  static saveVisits(visits) {
    localStorage.setItem("SIMRS_VISITS", JSON.stringify(visits));
  }

  static findVisitById(visitId) {
    const visits = this.getVisits();
    return visits.find(v => v.id === visitId);
  }

  static transition(visitId, targetState, reason = "") {
    const visits = this.getVisits();
    const visitIndex = visits.findIndex(v => v.id === visitId);
    if (visitIndex === -1) {
      throw new Error(`Kunjungan dengan ID ${visitId} tidak ditemukan.`);
    }

    const visit = visits[visitIndex];
    const currentState = visit.visitStatus;

    // Check transition validity
    const allowed = VISIT_ALLOWED_TRANSITIONS[currentState] || [];
    if (!allowed.includes(targetState)) {
      throw new Error(`Transisi status tidak valid: ${currentState} -> ${targetState}. Transisi yang diizinkan: ${allowed.join(", ") || "Tidak ada"}`);
    }

    // Record status log
    if (!visit.statusLog) visit.statusLog = [];
    const activeRole = permissionEngine.getCurrentRole();
    visit.statusLog.push({
      fromState: currentState,
      toState: targetState,
      changedAt: new Date().toISOString(),
      changedBy: `${activeRole.name} (${activeRole.id})`,
      reason: reason
    });

    visit.visitStatus = targetState;

    // Timestamp milestones
    const now = new Date().toISOString();
    if (targetState === "WAITING_TRIAGE") visit.checkedInAt = visit.checkedInAt || now;
    if (targetState === "IN_TRIAGE") visit.triageStartedAt = visit.triageStartedAt || now;
    if (targetState === "WAITING_DOCTOR") visit.triageCompletedAt = visit.triageCompletedAt || now;
    if (targetState === "IN_SERVICE") visit.serviceStartedAt = visit.serviceStartedAt || now;
    if (targetState === "SERVICE_COMPLETED") visit.serviceCompletedAt = visit.serviceCompletedAt || now;
    if (targetState === "CLOSED") visit.closedAt = now;

    visits[visitIndex] = visit;
    this.saveVisits(visits);

    // Add Audit Log
    AuditService.log(`Transisi Status Kunjungan [${visit.id}]: ${currentState} -> ${targetState} (${visit.patientName})`);

    return visit;
  }
}

// ==========================================
// 2. Audit Trail Service
// ==========================================
class AuditService {
  static getLogs() {
    return JSON.parse(localStorage.getItem("SIMRS_AUDIT_LOGS") || "[]");
  }

  static log(action) {
    const logs = this.getLogs();
    const activeRole = permissionEngine.getCurrentRole();
    const newLog = {
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      date: new Date().toISOString().split("T")[0],
      user: activeRole.name,
      role: activeRole.id,
      action: action
    };
    logs.unshift(newLog);
    // Keep max 200 logs
    if (logs.length > 200) logs.pop();
    localStorage.setItem("SIMRS_AUDIT_LOGS", JSON.stringify(logs));
  }
}

// ==========================================
// 3. Queue & Audio Synthesizer Service
// ==========================================
class QueueService {
  static getNextSequence(prefix) {
    const seqs = JSON.parse(localStorage.getItem("SIMRS_TICKETS_SEQ") || "{}");
    const current = seqs[prefix] || 1;
    seqs[prefix] = current + 1;
    localStorage.setItem("SIMRS_TICKETS_SEQ", JSON.stringify(seqs));
    return `${prefix}-${String(current).padStart(3, "0")}`;
  }

  static announceTicket(ticketNo, destination) {
    if (!("speechSynthesis" in window)) return;
    
    // Voice call audio bell
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn("Audio Context init skipped:", e);
    }

    setTimeout(() => {
      // Format: "Nomor antrian A-kosong-kosong-satu, silakan menuju Poli Penyakit Dalam"
      const prefix = ticketNo.split("-")[0];
      const num = ticketNo.split("-")[1] || "";
      const text = `Nomor antrian, ${prefix} ${num}, silakan menuju, ${destination}`;
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "id-ID";
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }, 450);

    // Save active display announcement in LocalStorage for TV Display
    localStorage.setItem("SIMRS_LATEST_CALL", JSON.stringify({
      ticketNo,
      destination,
      calledAt: new Date().toLocaleTimeString("id-ID")
    }));
  }
}

// ==========================================
// 4. Registration Service (FR-REG-*)
// ==========================================
class RegistrationService {
  static getPatients() {
    return JSON.parse(localStorage.getItem("SIMRS_PATIENTS") || "[]");
  }

  static createPatient(patientData) {
    permissionEngine.assertPermission("Patient", "create");
    const patients = this.getPatients();

    // Check duplicate NIK
    if (patientData.nik && patients.some(p => p.nik === patientData.nik)) {
      throw new Error(`Pasien dengan NIK ${patientData.nik} sudah terdaftar sebelumnya!`);
    }

    const nextIdNum = patients.length + 1;
    const newPatient = {
      id: `PAT-${String(nextIdNum).padStart(3, "0")}`,
      mrNo: `RM-2026-${String(nextIdNum * 42).padStart(4, "0")}`,
      nik: patientData.nik,
      name: patientData.name,
      gender: patientData.gender,
      birthDate: patientData.birthDate,
      phone: patientData.phone,
      address: patientData.address,
      payerType: patientData.payerType || "Umum",
      payerMemberNo: patientData.payerMemberNo || "-",
      bloodType: patientData.bloodType || "O+",
      allergies: patientData.allergies || "Tidak ada riwayat alergi"
    };

    patients.push(newPatient);
    localStorage.setItem("SIMRS_PATIENTS", JSON.stringify(patients));
    AuditService.log(`Pendaftaran Pasien Baru: ${newPatient.name} (No. RM: ${newPatient.mrNo})`);
    return newPatient;
  }

  static registerWalkIn(registration) {
    permissionEngine.assertPermission("Outpatient Visit", "create");
    const visits = VisitStateService.getVisits();
    const department = SIMRS_MASTER_DATA.departments.find(d => d.id === registration.departmentId);
    const practitioner = SIMRS_MASTER_DATA.practitioners.find(p => p.id === registration.practitionerId);
    const patient = this.getPatients().find(p => p.id === registration.patientId);

    if (!department || !practitioner || !patient) {
      throw new Error("Data pasien, poli, atau dokter tidak valid.");
    }

    const nextOpvNum = visits.length + 1;
    const opvId = `OPV-2026-${String(nextOpvNum).padStart(4, "0")}`;
    const ticketNo = QueueService.getNextSequence(department.prefix);

    const newVisit = {
      id: opvId,
      patientId: patient.id,
      patientName: patient.name,
      mrNo: patient.mrNo,
      departmentId: department.id,
      departmentName: department.name,
      practitionerId: practitioner.id,
      practitionerName: practitioner.name,
      registrationSource: registration.source || "Walk-in",
      payerType: registration.payerType || patient.payerType,
      payerMemberNo: registration.payerMemberNo || patient.payerMemberNo,
      eligibilityStatus: registration.payerType === "BPJS" ? "Valid" : "Tidak Perlu",
      visitStatus: "WAITING_TRIAGE",
      pharmacyStatus: "Not Required",
      billingStatus: "Pending",
      checkedInAt: new Date().toISOString(),
      ticketNo: ticketNo,
      queueType: "Triase",
      statusLog: [{
        fromState: "REGISTERED",
        toState: "WAITING_TRIAGE",
        changedAt: new Date().toISOString(),
        changedBy: permissionEngine.getCurrentRole().name,
        reason: "Pendaftaran Walk-in & Check-in Loket"
      }]
    };

    visits.push(newVisit);
    VisitStateService.saveVisits(visits);
    AuditService.log(`Registrasi Kunjungan Rawat Jalan: ${patient.name} ke ${department.name} (Tiket: ${ticketNo})`);
    
    return newVisit;
  }
}

// ==========================================
// 5. Triage Service (FR-TRI-*)
// ==========================================
class TriageService {
  static calculateBmi(heightCm, weightKg) {
    if (!heightCm || !weightKg) return { bmi: 0, status: "-" };
    const heightM = heightCm / 100;
    const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));
    let status = "Normal";
    if (bmi < 18.5) status = "Kurus (Underweight)";
    else if (bmi >= 23.0 && bmi < 25.0) status = "Kelebihan BB (Overweight)";
    else if (bmi >= 25.0) status = "Obesitas";
    return { bmi, status };
  }

  static saveTriageAndVitals(visitId, vitalsData, triageData, shouldRoute = true) {
    permissionEngine.assertPermission("Vital Signs", "write");
    permissionEngine.assertPermission("Triage Assessment", "write");

    const visits = VisitStateService.getVisits();
    const index = visits.findIndex(v => v.id === visitId);
    if (index === -1) throw new Error("Kunjungan tidak ditemukan.");

    const visit = visits[index];

    // BMI calculation
    const bmiResult = this.calculateBmi(vitalsData.height, vitalsData.weight);

    visit.vitals = {
      systolic: parseInt(vitalsData.systolic) || 120,
      diastolic: parseInt(vitalsData.diastolic) || 80,
      pulse: parseInt(vitalsData.pulse) || 80,
      temperature: parseFloat(vitalsData.temperature) || 36.5,
      respiratoryRate: parseInt(vitalsData.respiratoryRate) || 18,
      spo2: parseInt(vitalsData.spo2) || 99,
      height: parseFloat(vitalsData.height) || 165,
      weight: parseFloat(vitalsData.weight) || 60,
      bmi: bmiResult.bmi,
      bmiStatus: bmiResult.status
    };

    visit.triage = {
      chiefComplaint: triageData.chiefComplaint || "Tidak ada keluhan spesifik",
      fallRisk: triageData.fallRisk || "Rendah",
      allergies: triageData.allergies || "Tidak ada",
      painScore: parseInt(triageData.painScore) || 0,
      infectionScreening: triageData.infectionScreening || "Tidak ada",
      outcome: triageData.outcome || "Normal",
      escalatedTo: triageData.escalatedTo || "",
      notes: triageData.notes || ""
    };

    visits[index] = visit;
    VisitStateService.saveVisits(visits);

    AuditService.log(`Catat TTV & Asesmen Triase: ${visit.patientName} (TD: ${visit.vitals.systolic}/${visit.vitals.diastolic}, Suhu: ${visit.vitals.temperature}C)`);

    if (shouldRoute) {
      if (triageData.outcome === "Perlu Eskalasi") {
        VisitStateService.transition(visitId, "ESCALATED", `Eskalasi darurat: ${triageData.escalatedTo || "IGD"}`);
      } else {
        VisitStateService.transition(visitId, "WAITING_DOCTOR", "Selesai Triase -> Masuk Antrian Dokter Poli");
      }
    }

    return visit;
  }
}

// ==========================================
// 6. Doctor Service (FR-DOC-*)
// ==========================================
class DoctorService {
  static startService(visitId) {
    permissionEngine.assertPermission("Patient Encounter", "write");
    const visit = VisitStateService.transition(visitId, "IN_SERVICE", "Dokter memulai pemeriksaan klinis");
    return visit;
  }

  static saveEncounter(visitId, encounterData, finalize = false) {
    permissionEngine.assertPermission("Patient Encounter", "write");
    const visits = VisitStateService.getVisits();
    const index = visits.findIndex(v => v.id === visitId);
    if (index === -1) throw new Error("Kunjungan tidak ditemukan.");

    const visit = visits[index];

    // Checklist validation if finalizing
    if (finalize) {
      if (!encounterData.subjective || encounterData.subjective.length < 5) {
        throw new Error("Anamnesis (Subjective) wajib diisi sebelum finalisasi encounter!");
      }
      if (!encounterData.primaryDiagnosis || !encounterData.primaryDiagnosis.code) {
        throw new Error("Diagnosis Utama (ICD-10) wajib ditentukan sebelum finalisasi!");
      }
      if (!encounterData.plan || encounterData.plan.length < 5) {
        throw new Error("Instruksi / Rencana Terapi (Plan) wajib diisi!");
      }
    }

    visit.encounter = {
      subjective: encounterData.subjective || "",
      objective: encounterData.objective || "",
      primaryDiagnosis: encounterData.primaryDiagnosis || null,
      secondaryDiagnoses: encounterData.secondaryDiagnoses || [],
      plan: encounterData.plan || "",
      procedures: encounterData.procedures || [],
      prescriptions: encounterData.prescriptions || [],
      labOrders: encounterData.labOrders || [],
      followUpDays: parseInt(encounterData.followUpDays) || 0,
      isFinalized: finalize,
      finalizedAt: finalize ? new Date().toISOString() : null,
      finalizedBy: permissionEngine.getCurrentRole().name
    };

    // Update flags
    if (visit.encounter.prescriptions.length > 0) {
      visit.pharmacyStatus = "Pending";
      visit.hasPrescription = true;
    }
    
    // Count pending lab tests
    const pendingLabs = (visit.encounter.labOrders || []).filter(l => l.status === "Pending").length;
    visit.pendingOrders = pendingLabs;

    visits[index] = visit;
    VisitStateService.saveVisits(visits);

    AuditService.log(`Simpan Rekam Medis (SOAP): ${visit.patientName} (${finalize ? "FINALISASI" : "Draft"})`);

    if (finalize) {
      VisitStateService.transition(visitId, "SERVICE_COMPLETED", "Finalisasi Encounter oleh Dokter Pemeriksa");
      // Auto-generate pharmacy ticket if medicines prescribed
      if (visit.hasPrescription) {
        visit.pharmacyTicket = QueueService.getNextSequence("F");
        AuditService.log(`Terbit Tiket Farmasi: ${visit.pharmacyTicket} (${visit.patientName})`);
      }
      // Auto-generate cashier ticket
      visit.cashierTicket = QueueService.getNextSequence("K");
      AuditService.log(`Terbit Tiket Kasir: ${visit.cashierTicket} (${visit.patientName})`);
      
      VisitStateService.saveVisits(visits);
    }

    return visit;
  }
}

// ==========================================
// 7. Laboratory Service (FR-LAB-*)
// ==========================================
class LabService {
  static getPendingOrders() {
    const visits = VisitStateService.getVisits();
    const orders = [];
    visits.forEach(v => {
      if (v.encounter && v.encounter.labOrders && v.encounter.labOrders.length > 0) {
        v.encounter.labOrders.forEach((lo, loIdx) => {
          orders.push({
            visitId: v.id,
            patientName: v.patientName,
            mrNo: v.mrNo,
            practitionerName: v.practitionerName,
            departmentName: v.departmentName,
            orderIndex: loIdx,
            ...lo
          });
        });
      }
    });
    return orders;
  }

  static submitLabResult(visitId, orderIndex, results, normalSummary) {
    permissionEngine.assertPermission("Lab Test", "submit");
    const visits = VisitStateService.getVisits();
    const visit = visits.find(v => v.id === visitId);
    if (!visit || !visit.encounter || !visit.encounter.labOrders[orderIndex]) {
      throw new Error("Permintaan Lab tidak ditemukan.");
    }

    const order = visit.encounter.labOrders[orderIndex];
    order.status = "Completed";
    order.completedAt = new Date().toISOString();
    order.completedBy = permissionEngine.getCurrentRole().name;
    order.results = results;
    order.summary = normalSummary;

    // Recalculate pending orders
    const pending = visit.encounter.labOrders.filter(l => l.status === "Pending").length;
    visit.pendingOrders = pending;

    VisitStateService.saveVisits(visits);
    AuditService.log(`Validasi & Rilis Hasil Uji Lab: ${order.testName} untuk ${visit.patientName}`);
    return order;
  }
}

// ==========================================
// 8. Pharmacy Service (FR-PHA-*)
// ==========================================
class PharmacyService {
  static dispenseMedications(visitId, verificationNotes) {
    permissionEngine.assertPermission("Pharmacy Dispense", "submit");
    const visits = VisitStateService.getVisits();
    const visit = visits.find(v => v.id === visitId);
    if (!visit || !visit.encounter || !visit.encounter.prescriptions) {
      throw new Error("Resep tidak ditemukan.");
    }

    visit.pharmacyStatus = "Dispensed";
    visit.dispensedAt = new Date().toISOString();
    visit.dispensedBy = permissionEngine.getCurrentRole().name;
    visit.pharmacistNotes = verificationNotes || "7 Benar obat terverifikasi valid.";

    VisitStateService.saveVisits(visits);
    AuditService.log(`Dispensing & Penyerahan Obat ke Pasien: ${visit.patientName} (${visit.encounter.prescriptions.length} R/)`);
    
    // Check if visit can be closed
    if (visit.billingStatus === "Paid" && visit.visitStatus === "SERVICE_COMPLETED") {
      VisitStateService.transition(visitId, "CLOSED", "Layanan Farmasi & Kasir selesai");
    }

    return visit;
  }
}

// ==========================================
// 9. Billing & Cashier Service (FR-BIL-*)
// ==========================================
class BillingService {
  static aggregateInvoice(visitId) {
    const visit = VisitStateService.findVisitById(visitId);
    if (!visit) throw new Error("Kunjungan tidak ditemukan.");

    const items = [
      { name: "Biaya Registrasi & Administrasi Rawat Jalan", qty: 1, unitPrice: 20000, total: 20000, category: "Administrasi" },
      { name: "Asuhan Keperawatan & Skrining Triase", qty: 1, unitPrice: 25000, total: 25000, category: "Keperawatan" }
    ];

    if (visit.encounter) {
      // Procedures & consultation
      (visit.encounter.procedures || []).forEach(p => {
        items.push({ name: p.name, qty: 1, unitPrice: p.price, total: p.price, category: "Jasa Medis" });
      });

      // Lab Tests
      (visit.encounter.labOrders || []).forEach(l => {
        items.push({ name: `Pemeriksaan Lab: ${l.testName}`, qty: 1, unitPrice: l.price, total: l.price, category: "Penunjang" });
      });

      // Prescriptions
      (visit.encounter.prescriptions || []).forEach(rx => {
        items.push({ name: `Obat: ${rx.medicineName} (${rx.dosage})`, qty: rx.qty, unitPrice: rx.unitPrice, total: rx.totalPrice, category: "Farmasi" });
      });
    }

    const subtotal = items.reduce((acc, curr) => acc + curr.total, 0);

    let coveredAmount = 0;
    let patientPayAmount = subtotal;

    if (visit.payerType === "BPJS") {
      coveredAmount = subtotal; // 100% Ditanggung BPJS
      patientPayAmount = 0;
    } else if (visit.payerType === "Asuransi") {
      coveredAmount = Math.round(subtotal * 0.85); // 85% Ditanggung
      patientPayAmount = subtotal - coveredAmount; // 15% Co-pay
    }

    return {
      visitId: visit.id,
      patientName: visit.patientName,
      mrNo: visit.mrNo,
      payerType: visit.payerType,
      payerMemberNo: visit.payerMemberNo,
      items: items,
      subtotal: subtotal,
      coveredAmount: coveredAmount,
      patientPayAmount: patientPayAmount
    };
  }

  static processPayment(visitId, paymentMethod, paidAmount) {
    permissionEngine.assertPermission("Sales Invoice", "submit");
    const invoice = this.aggregateInvoice(visitId);
    const visits = VisitStateService.getVisits();
    const visit = visits.find(v => v.id === visitId);

    const receiptNo = `KWT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 89999 + 10000))}`;

    visit.billingStatus = "Paid";
    visit.receipt = {
      receiptNo: receiptNo,
      paymentMethod: paymentMethod,
      paidAmount: paidAmount,
      changeAmount: Math.max(0, paidAmount - invoice.patientPayAmount),
      paidAt: new Date().toISOString(),
      cashier: permissionEngine.getCurrentRole().name,
      invoice: invoice
    };

    VisitStateService.saveVisits(visits);
    AuditService.log(`Penerimaan Pembayaran Kasir [${receiptNo}]: ${visit.patientName} (Metode: ${paymentMethod}, Total: Rp ${invoice.patientPayAmount.toLocaleString("id-ID")})`);

    // If pharmacy completed or not required, close visit
    if ((visit.pharmacyStatus === "Dispensed" || visit.pharmacyStatus === "Not Required") && visit.visitStatus === "SERVICE_COMPLETED") {
      VisitStateService.transition(visitId, "CLOSED", "Layanan Kasir & Farmasi Selesai -> Kunjungan Ditutup");
    }

    return visit.receipt;
  }
}
