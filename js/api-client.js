/**
 * SIMRS Mini - Frappe & SatuSehat API Client
 * Matched with Postman Collection in api/simrs-update-v2.json
 * Base URL: http://clinic.satusehat:8000/
 */

class FrappeApiClient {
  constructor() {
    this.baseUrl = localStorage.getItem("SIMRS_API_BASE_URL") || "http://clinic.satusehat:8000";
    this.mode = localStorage.getItem("SIMRS_API_MODE") || "simulated"; // "simulated" or "live"
    this.isConnected = false;
    this.lastResponse = null;
    this.lastRequest = null;
  }

  setBaseUrl(url) {
    this.baseUrl = url.replace(/\/+$/, "");
    localStorage.setItem("SIMRS_API_BASE_URL", this.baseUrl);
  }

  setMode(mode) {
    this.mode = mode;
    localStorage.setItem("SIMRS_API_MODE", mode);
  }

  async testConnection() {
    this.lastRequest = { method: "GET", url: `${this.baseUrl}/api/method/frappe.auth.get_logged_user` };
    try {
      const response = await fetch(`${this.baseUrl}/api/method/frappe.auth.get_logged_user`, {
        method: "GET",
        headers: { "Accept": "application/json" }
      });
      const data = await response.json();
      this.isConnected = response.ok;
      this.lastResponse = { status: response.status, data };
      return { success: response.ok, status: response.status, data };
    } catch (err) {
      this.isConnected = false;
      this.lastResponse = { error: err.message, note: "Server Frappe lokal belum berjalan atau CORS belum diaktifkan." };
      return { success: false, error: err.message };
    }
  }

  async login(usr = "Administrator", pwd = "1212") {
    if (this.mode === "simulated") {
      this.lastResponse = { message: "Simulasi Login Berhasil", full_name: "Administrator", home_page: "/app" };
      return { success: true, user: "Administrator" };
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/method/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usr, pwd })
      });
      const data = await response.json();
      this.lastResponse = { status: response.status, data };
      return { success: response.ok, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async syncVitalSigns(vitalData) {
    if (this.mode === "simulated") {
      return { success: true, simulated: true, id: `VTS-2026-${Math.floor(Math.random() * 9000 + 1000)}` };
    }

    try {
      const payload = {
        signs_date: new Date().toISOString().split("T")[0],
        signs_time: new Date().toTimeString().split(" ")[0],
        queue_registration: vitalData.queue_registration || "QUE-REG-2026-00010",
        bp_systolic: String(vitalData.systolic || 120),
        bp_diastolic: String(vitalData.diastolic || 80),
        pulse: String(vitalData.pulse || 80),
        temperature: String(vitalData.temperature || 36.5),
        respiratory_rate: String(vitalData.respiratoryRate || 18),
        height: parseFloat(vitalData.height) / 100 || 1.70,
        weight: parseFloat(vitalData.weight) || 65.0,
        vital_signs_note: vitalData.notes || "Pemeriksaan TTV terintegrasi SIMRS Mini"
      };

      const response = await fetch(`${this.baseUrl}/api/resource/Vital Signs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      this.lastResponse = { status: response.status, data };
      return { success: response.ok, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async sendSatuSehatEncounter(encounterId) {
    if (this.mode === "simulated") {
      return {
        success: true,
        satusehat_id: `SS-ENC-${Math.floor(Math.random() * 899999 + 100000)}`,
        status: "arrived",
        fhir_resource: {
          resourceType: "Encounter",
          status: "finished",
          class: { system: "http://terminology.hl7.org/CodeSystem/v3-ActCode", code: "AMB", display: "ambulatory" }
        }
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/method/clinic_satusehat.api.satusehat.encounter?encounter_id=${encounterId}`, {
        method: "GET",
        headers: { "Accept": "application/json" }
      });
      const data = await response.json();
      this.lastResponse = { status: response.status, data };
      return { success: response.ok, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

const frappeApi = new FrappeApiClient();
