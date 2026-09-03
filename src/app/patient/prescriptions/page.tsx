"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  Loader2,
  Pill,
  Search,
  Stethoscope,
  UserRound,
  X,
  Printer,
  Activity,
  Clock3,
  Info,
} from "lucide-react";

type Patient = {
  id: string;
  name: string;
  email: string;
  phone?: string;
};

type Medicine = {
  id?: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
};

type Prescription = {
  id: string;
  appointmentId: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  patientEmail?: string;
  diagnosis: string;
  medicines: Medicine[];
  instructions?: string;
  createdAt: string;
  updatedAt?: string;
};

type Appointment = {
  id: string;
  doctorId: string;
  patientId: string;
  doctorName: string;
  patientName: string;
  date: string;
  time: string;
  type: string;
  status: string;
  reason?: string;
};

const PRESCRIPTIONS_KEY = "schedula_prescriptions";
const APPOINTMENTS_KEY = "schedula_appointments";

export default function PatientPrescriptionsPage() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);

  const [toast, setToast] = useState("");

  useEffect(() => {
    loadData();

    const handleStorage = () => loadData();
    const handlePrescriptionUpdate = () => loadData();
    const handleAppointmentUpdate = () => loadData();

    window.addEventListener("storage", handleStorage);
    window.addEventListener(
      "schedula-prescriptions-updated",
      handlePrescriptionUpdate
    );
    window.addEventListener(
      "schedula-appointments-updated",
      handleAppointmentUpdate
    );

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        "schedula-prescriptions-updated",
        handlePrescriptionUpdate
      );
      window.removeEventListener(
        "schedula-appointments-updated",
        handleAppointmentUpdate
      );
    };
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  const loadData = () => {
    setLoading(true);

    try {
      const sessionRaw = localStorage.getItem("patient_session");
      const currentPatientRaw = localStorage.getItem(
        "schedula_current_patient"
      );

      let currentPatient: Patient | null = null;

      if (sessionRaw) {
        try {
          currentPatient = JSON.parse(sessionRaw);
        } catch {
          currentPatient = null;
        }
      }

      if (!currentPatient && currentPatientRaw) {
        try {
          currentPatient = JSON.parse(currentPatientRaw);
        } catch {
          currentPatient = null;
        }
      }

      setPatient(currentPatient);

      if (!currentPatient) {
        setPrescriptions([]);
        setAppointments([]);
        setLoading(false);
        return;
      }

      const prescriptionsRaw =
        localStorage.getItem(PRESCRIPTIONS_KEY) || "[]";

      const appointmentsRaw =
        localStorage.getItem(APPOINTMENTS_KEY) || "[]";

      let allPrescriptions: Prescription[] = [];
      let allAppointments: Appointment[] = [];

      try {
        allPrescriptions = JSON.parse(prescriptionsRaw);
      } catch {
        allPrescriptions = [];
      }

      try {
        allAppointments = JSON.parse(appointmentsRaw);
      } catch {
        allAppointments = [];
      }

      const patientPrescriptions = allPrescriptions.filter(
        (prescription) =>
          String(prescription.patientId) === String(currentPatient?.id)
      );

      const patientAppointments = allAppointments.filter(
        (appointment) =>
          String(appointment.patientId) === String(currentPatient?.id)
      );

      setPrescriptions(patientPrescriptions);
      setAppointments(patientAppointments);
    } catch (error) {
      console.error("Failed to load prescriptions:", error);
      setPrescriptions([]);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return prescriptions;
    }

    return prescriptions.filter((prescription) => {
      const doctorMatch = prescription.doctorName
        ?.toLowerCase()
        .includes(query);

      const diagnosisMatch = prescription.diagnosis
        ?.toLowerCase()
        .includes(query);

      const medicineMatch = prescription.medicines?.some((medicine) =>
        medicine.name?.toLowerCase().includes(query)
      );

      const dosageMatch = prescription.medicines?.some((medicine) =>
        medicine.dosage?.toLowerCase().includes(query)
      );

      return (
        doctorMatch ||
        diagnosisMatch ||
        medicineMatch ||
        dosageMatch
      );
    });
  }, [prescriptions, search]);

  const totalMedicines = useMemo(() => {
    return prescriptions.reduce(
      (total, prescription) =>
        total + (prescription.medicines?.length || 0),
      0
    );
  }, [prescriptions]);

  const doctorsCount = useMemo(() => {
    return new Set(
      prescriptions.map((prescription) => prescription.doctorId)
    ).size;
  }, [prescriptions]);

  const getAppointment = (appointmentId: string) => {
    return appointments.find(
      (appointment) => String(appointment.id) === String(appointmentId)
    );
  };

  const formatDate = (date?: string) => {
    if (!date) return "Date not available";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateLong = (date?: string) => {
    if (!date) return "Date not available";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getPrescriptionDate = (prescription: Prescription) => {
    const appointment = getAppointment(prescription.appointmentId);

    if (appointment?.date) {
      return appointment.date;
    }

    return prescription.createdAt;
  };

  const printPrescription = (prescription: Prescription) => {
    const appointment = getAppointment(prescription.appointmentId);

    const medicinesHtml = (prescription.medicines || [])
      .map(
        (medicine, index) => `
          <tr>
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(medicine.name)}</strong></td>
            <td>${escapeHtml(medicine.dosage)}</td>
            <td>${escapeHtml(medicine.frequency)}</td>
            <td>${escapeHtml(medicine.duration)}</td>
            <td>${escapeHtml(medicine.instructions || "—")}</td>
          </tr>
        `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Prescription - ${escapeHtml(
            prescription.patientName
          )}</title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 40px;
              font-family: Arial, Helvetica, sans-serif;
              color: #111827;
              background: white;
            }

            .container {
              max-width: 900px;
              margin: 0 auto;
            }

            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #111827;
              padding-bottom: 24px;
              margin-bottom: 25px;
            }

            .brand {
              font-size: 28px;
              font-weight: 800;
              color: #111827;
            }

            .subtitle {
              margin-top: 5px;
              color: #6b7280;
              font-size: 13px;
            }

            .doctor {
              text-align: right;
            }

            .doctor-name {
              font-size: 17px;
              font-weight: 700;
            }

            .doctor-label {
              font-size: 12px;
              color: #6b7280;
              margin-top: 4px;
            }

            .section {
              margin-top: 25px;
            }

            .section-title {
              font-size: 15px;
              font-weight: 700;
              margin-bottom: 12px;
              text-transform: uppercase;
              letter-spacing: .04em;
            }

            .patient-box {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              padding: 18px;
              border: 1px solid #e5e7eb;
              border-radius: 10px;
              background: #f9fafb;
            }

            .field-label {
              color: #6b7280;
              font-size: 11px;
              margin-bottom: 4px;
            }

            .field-value {
              font-size: 14px;
              font-weight: 600;
            }

            .diagnosis {
              padding: 16px;
              border-left: 4px solid #111827;
              background: #f9fafb;
              font-size: 15px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              font-size: 12px;
            }

            th {
              background: #111827;
              color: white;
              text-align: left;
              padding: 10px;
            }

            td {
              border: 1px solid #e5e7eb;
              padding: 10px;
              vertical-align: top;
            }

            .instructions {
              padding: 15px;
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              white-space: pre-line;
              font-size: 13px;
              line-height: 1.6;
            }

            .footer {
              margin-top: 50px;
              padding-top: 18px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 11px;
              display: flex;
              justify-content: space-between;
            }

            @media print {
              body {
                padding: 20px;
              }

              @page {
                margin: 15mm;
              }
            }
          </style>
        </head>

        <body>
          <div class="container">

            <div class="header">
              <div>
                <div class="brand">Schedula</div>
                <div class="subtitle">Digital Medical Prescription</div>
              </div>

              <div class="doctor">
                <div class="doctor-name">
                  ${escapeHtml(prescription.doctorName)}
                </div>
                <div class="doctor-label">
                  Treating Physician
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Patient Information</div>

              <div class="patient-box">
                <div>
                  <div class="field-label">Patient Name</div>
                  <div class="field-value">
                    ${escapeHtml(prescription.patientName)}
                  </div>
                </div>

                <div>
                  <div class="field-label">Prescription Date</div>
                  <div class="field-value">
                    ${escapeHtml(
                      formatDateLong(getPrescriptionDate(prescription))
                    )}
                  </div>
                </div>

                <div>
                  <div class="field-label">Patient Email</div>
                  <div class="field-value">
                    ${escapeHtml(
                      prescription.patientEmail ||
                        patient?.email ||
                        "—"
                    )}
                  </div>
                </div>

                <div>
                  <div class="field-label">Appointment Type</div>
                  <div class="field-value">
                    ${escapeHtml(appointment?.type || "Consultation")}
                  </div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Diagnosis</div>

              <div class="diagnosis">
                ${escapeHtml(
                  prescription.diagnosis || "No diagnosis provided"
                )}
              </div>
            </div>

            <div class="section">
              <div class="section-title">Medications</div>

              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Medicine</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                    <th>Instructions</th>
                  </tr>
                </thead>

                <tbody>
                  ${
                    medicinesHtml ||
                    `
                    <tr>
                      <td colspan="6">
                        No medicines prescribed.
                      </td>
                    </tr>
                  `
                  }
                </tbody>
              </table>
            </div>

            ${
              prescription.instructions
                ? `
                  <div class="section">
                    <div class="section-title">Doctor's Instructions</div>

                    <div class="instructions">
                      ${escapeHtml(prescription.instructions)}
                    </div>
                  </div>
                `
                : ""
            }

            <div class="footer">
              <div>
                Prescription ID: ${escapeHtml(prescription.id)}
              </div>

              <div>
                Generated by Schedula
              </div>
            </div>

          </div>
        </body>
      </html>
    `;

    const printWindow = window.open(
      "",
      "_blank",
      "width=1000,height=800"
    );

    if (!printWindow) {
      setToast("Please allow pop-ups to download the prescription.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };

  const handleDownload = (prescription: Prescription) => {
    printPrescription(prescription);
    setToast("Prescription opened for PDF download.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc]">
        <Navbar />

        <main className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
            <p className="text-sm text-slate-500">
              Loading prescriptions...
            </p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-[#f7f9fc]">
        <Navbar />

        <main className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <UserRound className="h-7 w-7 text-slate-500" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              Patient session not found
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Please log in again to view your prescriptions.
            </p>

            <a
              href="/doctor/login"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Go to Login
            </a>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <section className="mb-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
                <FileText className="h-3.5 w-3.5" />
                Medical Records
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                My Prescriptions
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                View prescriptions provided by your doctors and keep track
                of your medications in one place.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <UserRound className="h-5 w-5 text-slate-400" />

              <div>
                <p className="text-xs text-slate-400">Patient</p>
                <p className="text-sm font-semibold text-slate-800">
                  {patient.name}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<FileText className="h-5 w-5" />}
            label="Total Prescriptions"
            value={prescriptions.length}
            description="Medical prescriptions"
          />

          <StatCard
            icon={<Pill className="h-5 w-5" />}
            label="Medicines"
            value={totalMedicines}
            description="Prescribed medicines"
          />

          <StatCard
            icon={<Stethoscope className="h-5 w-5" />}
            label="Doctors"
            value={doctorsCount}
            description="Doctors visited"
          />

          <StatCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Completed Visits"
            value={
              appointments.filter(
                (appointment) => appointment.status === "completed"
              ).length
            }
            description="Completed appointments"
          />
        </section>

        {/* Search */}
        <section className="mb-6">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search doctor, diagnosis, medicine..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          </div>
        </section>

        {/* Empty */}
        {filteredPrescriptions.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <ClipboardList className="h-7 w-7 text-slate-400" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              {search
                ? "No prescriptions found"
                : "No prescriptions yet"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {search
                ? "Try searching with another doctor name, diagnosis, or medicine."
                : "Once a doctor creates a prescription after your appointment, it will appear here."}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Clear Search
              </button>
            )}
          </section>
        ) : (
          <section className="space-y-4">
            {filteredPrescriptions.map((prescription) => {
              const appointment = getAppointment(
                prescription.appointmentId
              );

              return (
                <PrescriptionCard
                  key={prescription.id}
                  prescription={prescription}
                  appointment={appointment}
                  date={getPrescriptionDate(prescription)}
                  onView={() =>
                    setSelectedPrescription(prescription)
                  }
                  onDownload={() => handleDownload(prescription)}
                  formatDate={formatDate}
                />
              );
            })}
          </section>
        )}

        {/* Information */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100">
              <Info className="h-4.5 w-4.5 text-slate-600" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Prescription downloads
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Selecting Download opens a print-ready prescription.
                Choose <strong>Save as PDF</strong> in your browser's
                print dialog to save a copy.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Prescription Modal */}
      {selectedPrescription && (
        <PrescriptionModal
          prescription={selectedPrescription}
          appointment={getAppointment(
            selectedPrescription.appointmentId
          )}
          patient={patient}
          date={getPrescriptionDate(selectedPrescription)}
          onClose={() => setSelectedPrescription(null)}
          onDownload={() => handleDownload(selectedPrescription)}
          formatDateLong={formatDateLong}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[100] -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-2xl">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------
   STAT CARD
------------------------------------------------------- */

function StatCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          {icon}
        </div>

        <Activity className="h-4 w-4 text-slate-300" />
      </div>

      <p className="mt-5 text-2xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-700">
        {label}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* -------------------------------------------------------
   PRESCRIPTION CARD
------------------------------------------------------- */

function PrescriptionCard({
  prescription,
  appointment,
  date,
  onView,
  onDownload,
  formatDate,
}: {
  prescription: Prescription;
  appointment?: Appointment;
  date: string;
  onView: () => void;
  onDownload: () => void;
  formatDate: (date?: string) => string;
}) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-lg">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Main */}
          <div className="flex min-w-0 gap-4">
            <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <FileText className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-base font-bold text-slate-900 sm:text-lg">
                  {prescription.doctorName}
                </h2>

                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                  Prescription
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                {prescription.diagnosis || "Medical consultation"}
              </p>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDate(date)}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <Pill className="h-3.5 w-3.5" />
                  {prescription.medicines?.length || 0}{" "}
                  {prescription.medicines?.length === 1
                    ? "medicine"
                    : "medicines"}
                </span>

                {appointment?.type && (
                  <span className="inline-flex items-center gap-1.5">
                    <Stethoscope className="h-3.5 w-3.5" />
                    {appointment.type}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={onView}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:flex-none"
            >
              <FileText className="h-4 w-4" />
              View
            </button>

            <button
              type="button"
              onClick={onDownload}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 sm:flex-none"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        </div>

        {/* Diagnosis */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Diagnosis
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              {prescription.diagnosis || "Not specified"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Medicines
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              {prescription.medicines?.length || 0} prescribed
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------
   PRESCRIPTION MODAL
------------------------------------------------------- */

function PrescriptionModal({
  prescription,
  appointment,
  patient,
  date,
  onClose,
  onDownload,
  formatDateLong,
}: {
  prescription: Prescription;
  appointment?: Appointment;
  patient: Patient;
  date: string;
  onClose: () => void;
  onDownload: () => void;
  formatDateLong: (date?: string) => string;
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6">
      <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Medical Prescription
            </p>

            <h2 className="mt-1 text-lg font-bold text-slate-900">
              {prescription.doctorName}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal content */}
        <div className="overflow-y-auto p-5 sm:p-7">
          {/* Doctor / patient */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-5">
              <div className="mb-3 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-slate-500" />

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Doctor
                </p>
              </div>

              <p className="font-bold text-slate-900">
                {prescription.doctorName}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Treating Physician
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <div className="mb-3 flex items-center gap-2">
                <UserRound className="h-4 w-4 text-slate-500" />

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Patient
                </p>
              </div>

              <p className="font-bold text-slate-900">
                {patient.name}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {patient.email}
              </p>
            </div>
          </div>

          {/* Appointment info */}
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <InfoBox
              icon={<CalendarDays className="h-4 w-4" />}
              label="Date"
              value={formatDateLong(date)}
            />

            <InfoBox
              icon={<Clock3 className="h-4 w-4" />}
              label="Appointment"
              value={
                appointment?.time ||
                "Time not available"
              }
            />

            <InfoBox
              icon={<Stethoscope className="h-4 w-4" />}
              label="Type"
              value={
                appointment?.type ||
                "Consultation"
              }
            />
          </div>

          {/* Diagnosis */}
          <div className="mt-7">
            <SectionTitle title="Diagnosis" />

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold leading-6 text-slate-800">
                {prescription.diagnosis ||
                  "No diagnosis provided."}
              </p>
            </div>
          </div>

          {/* Medicines */}
          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <SectionTitle title="Medicines" />

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                {prescription.medicines?.length || 0} total
              </span>
            </div>

            {prescription.medicines?.length ? (
              <div className="space-y-3">
                {prescription.medicines.map((medicine, index) => (
                  <div
                    key={
                      medicine.id ||
                      `${medicine.name}-${index}`
                    }
                    className="rounded-2xl border border-slate-200 p-4 sm:p-5"
                  >
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <h3 className="font-bold text-slate-900">
                            {medicine.name}
                          </h3>

                          <span className="w-fit rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
                            {medicine.dosage}
                          </span>
                        </div>

                        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          <MedicineDetail
                            label="Frequency"
                            value={
                              medicine.frequency ||
                              "Not specified"
                            }
                          />

                          <MedicineDetail
                            label="Duration"
                            value={
                              medicine.duration ||
                              "Not specified"
                            }
                          />

                          <MedicineDetail
                            label="Instructions"
                            value={
                              medicine.instructions ||
                              "No special instructions"
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                No medicines were prescribed.
              </div>
            )}
          </div>

          {/* Doctor instructions */}
          {prescription.instructions && (
            <div className="mt-7">
              <SectionTitle title="Doctor's Instructions" />

              <div className="mt-3 whitespace-pre-line rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                {prescription.instructions}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Close
          </button>

          <button
            type="button"
            onClick={onDownload}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Printer className="h-4 w-4" />
            Download / Print
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   INFO BOX
------------------------------------------------------- */

function InfoBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}

        <span className="text-[11px] font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="mt-2 text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------
   SECTION TITLE
------------------------------------------------------- */

function SectionTitle({ title }: { title: string }) {
  return (
    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
      {title}
    </h3>
  );
}

/* -------------------------------------------------------
   MEDICINE DETAIL
------------------------------------------------------- */

function MedicineDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium leading-5 text-slate-700">
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------
   HTML ESCAPE
------------------------------------------------------- */

function escapeHtml(value: string) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}