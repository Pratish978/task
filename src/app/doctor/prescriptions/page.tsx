"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  FileText,
  Plus,
  Search,
  Eye,
  Edit3,
  X,
  Trash2,
  UserRound,
  CalendarDays,
  Pill,
  Save,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  ChevronDown,
} from "lucide-react";

type Doctor = {
  id: string;
  name: string;
  email: string;
  specialty?: string;
};

type Appointment = {
  id: string;
  doctorId: string;
  patientId: string;
  doctorName: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  date: string;
  time: string;
  type: string;
  status:
    | "pending"
    | "confirmed"
    | "upcoming"
    | "completed"
    | "cancelled"
    | "missed";
  reason?: string;
  notes?: string;
};

type Medicine = {
  id: string;
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
  instructions: string;
  createdAt: string;
  updatedAt: string;
};

const APPOINTMENT_KEY = "schedula_appointments";
const PRESCRIPTION_KEY = "schedula_prescriptions";
const NOTIFICATION_KEY = "schedula_notifications";

const createUniqueId = (prefix: string) => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 12)}`;
};

const emptyMedicine = (): Medicine => ({
  id: createUniqueId("medicine"),
  name: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
});

const parseArray = <T,>(value: string | null): T[] => {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function DoctorPrescriptionsPage() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [view, setView] = useState<"prescriptions" | "eligible">(
    "prescriptions"
  );

  const [showCreate, setShowCreate] = useState(false);
  const [showView, setShowView] = useState(false);

  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);

  const [editingPrescription, setEditingPrescription] =
    useState<Prescription | null>(null);

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [diagnosis, setDiagnosis] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([
    emptyMedicine(),
  ]);
  const [instructions, setInstructions] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadData();

    const refresh = () => loadData();

    window.addEventListener("storage", refresh);
    window.addEventListener("schedula-prescriptions-updated", refresh);
    window.addEventListener("schedula-appointments-updated", refresh);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("schedula-prescriptions-updated", refresh);
      window.removeEventListener("schedula-appointments-updated", refresh);
    };
  }, []);

  const loadData = () => {
    try {
      const session =
        localStorage.getItem("clinician_session") ||
        localStorage.getItem("schedula_current_doctor");

      if (!session) {
        setDoctor(null);
        setAppointments([]);
        setPrescriptions([]);
        setLoading(false);
        return;
      }

      const currentDoctor = JSON.parse(session) as Doctor;

      if (!currentDoctor?.id) {
        setDoctor(null);
        setAppointments([]);
        setPrescriptions([]);
        setLoading(false);
        return;
      }

      setDoctor(currentDoctor);

      const storedAppointments = parseArray<Appointment>(
        localStorage.getItem(APPOINTMENT_KEY)
      );

      const storedPrescriptions = parseArray<Prescription>(
        localStorage.getItem(PRESCRIPTION_KEY)
      );

      const doctorAppointments = storedAppointments.filter(
        (appointment) => appointment.doctorId === currentDoctor.id
      );

      const doctorPrescriptions = storedPrescriptions.filter(
        (prescription) => prescription.doctorId === currentDoctor.id
      );

      setAppointments(doctorAppointments);
      setPrescriptions(doctorPrescriptions);
    } catch {
      setDoctor(null);
      setAppointments([]);
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const completedAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) => appointment.status === "completed"
    );
  }, [appointments]);

  const prescribedAppointmentIds = useMemo(() => {
    return new Set(
      prescriptions.map((prescription) => prescription.appointmentId)
    );
  }, [prescriptions]);

  const eligibleAppointments = useMemo(() => {
    return completedAppointments.filter(
      (appointment) => !prescribedAppointmentIds.has(appointment.id)
    );
  }, [completedAppointments, prescribedAppointmentIds]);

  const filteredPrescriptions = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return prescriptions;

    return prescriptions.filter((prescription) => {
      const medicineText = prescription.medicines
        .map(
          (medicine) =>
            `${medicine.name} ${medicine.dosage} ${medicine.frequency} ${medicine.duration}`
        )
        .join(" ");

      return `${prescription.patientName} ${prescription.diagnosis} ${medicineText}`
        .toLowerCase()
        .includes(query);
    });
  }, [prescriptions, search]);

  const openCreate = (appointment?: Appointment) => {
    setError("");
    setSuccess("");
    setEditingPrescription(null);
    setDiagnosis("");
    setMedicines([emptyMedicine()]);
    setInstructions("");

    if (appointment) {
      setSelectedAppointment(appointment);
    } else {
      setSelectedAppointment(eligibleAppointments[0] || null);
    }

    setShowCreate(true);
  };

  const openEdit = (prescription: Prescription) => {
    setError("");
    setSuccess("");

    setEditingPrescription(prescription);

    setSelectedAppointment({
      id: prescription.appointmentId,
      doctorId: prescription.doctorId,
      patientId: prescription.patientId,
      doctorName: prescription.doctorName,
      patientName: prescription.patientName,
      patientEmail: prescription.patientEmail,
      date: "",
      time: "",
      type: "",
      status: "completed",
    });

    setDiagnosis(prescription.diagnosis);
    setMedicines(
      prescription.medicines?.length
        ? prescription.medicines.map((medicine) => ({
            ...medicine,
            id: medicine.id || createUniqueId("medicine"),
          }))
        : [emptyMedicine()]
    );
    setInstructions(prescription.instructions || "");
    setShowCreate(true);
  };

  const handleAppointmentChange = (appointmentId: string) => {
    const appointment = eligibleAppointments.find(
      (item) => item.id === appointmentId
    );

    if (appointment) {
      setSelectedAppointment(appointment);
      setError("");
    }
  };

  const updateMedicine = (
    id: string,
    field: keyof Medicine,
    value: string
  ) => {
    setMedicines((current) =>
      current.map((medicine) =>
        medicine.id === id
          ? { ...medicine, [field]: value }
          : medicine
      )
    );
  };

  const addMedicine = () => {
    setMedicines((current) => [...current, emptyMedicine()]);
  };

  const removeMedicine = (id: string) => {
    if (medicines.length === 1) return;

    setMedicines((current) =>
      current.filter((medicine) => medicine.id !== id)
    );
  };

  const createPatientNotification = (
    prescription: Prescription
  ) => {
    try {
      const notifications = parseArray<Record<string, unknown>>(
        localStorage.getItem(NOTIFICATION_KEY)
      );

      const notification = {
        id: createUniqueId("notification"),
        userId: prescription.patientId,
        patientId: prescription.patientId,
        recipientId: prescription.patientId,
        role: "patient",
        type: "prescription",
        category: "prescription",
        title: "Prescription available",
        message: `Your prescription from Dr. ${prescription.doctorName} is now available.`,
        appointmentId: prescription.appointmentId,
        read: false,
        createdAt: new Date().toISOString(),
      };

      const updatedNotifications = [...notifications, notification];

      localStorage.setItem(
        NOTIFICATION_KEY,
        JSON.stringify(updatedNotifications)
      );

      window.dispatchEvent(
        new Event("schedula-notifications-updated")
      );
    } catch {
      return;
    }
  };

  const savePrescription = () => {
    setError("");
    setSuccess("");

    if (!doctor) {
      setError("Doctor session not found. Please login again.");
      return;
    }

    if (!selectedAppointment) {
      setError(
        eligibleAppointments.length === 0
          ? "No completed appointment is available for a prescription."
          : "Please select a completed appointment."
      );
      return;
    }

    if (!diagnosis.trim()) {
      setError("Diagnosis is required.");
      return;
    }

    const validMedicines = medicines
      .filter(
        (medicine) =>
          medicine.name.trim() &&
          medicine.dosage.trim() &&
          medicine.frequency.trim() &&
          medicine.duration.trim()
      )
      .map((medicine) => ({
        ...medicine,
        id: medicine.id || createUniqueId("medicine"),
        name: medicine.name.trim(),
        dosage: medicine.dosage.trim(),
        frequency: medicine.frequency.trim(),
        duration: medicine.duration.trim(),
        instructions: medicine.instructions.trim(),
      }));

    if (validMedicines.length === 0) {
      setError(
        "Add at least one medicine with name, dosage, frequency and duration."
      );
      return;
    }

    setSaving(true);

    try {
      const storedPrescriptions = parseArray<Prescription>(
        localStorage.getItem(PRESCRIPTION_KEY)
      );

      const now = new Date().toISOString();

      if (editingPrescription) {
        const updatedPrescription: Prescription = {
          ...editingPrescription,
          diagnosis: diagnosis.trim(),
          medicines: validMedicines,
          instructions: instructions.trim(),
          updatedAt: now,
        };

        const updatedPrescriptions = storedPrescriptions.map((item) =>
          item.id === editingPrescription.id
            ? updatedPrescription
            : item
        );

        localStorage.setItem(
          PRESCRIPTION_KEY,
          JSON.stringify(updatedPrescriptions)
        );

        setPrescriptions(
          updatedPrescriptions.filter(
            (item) => item.doctorId === doctor.id
          )
        );

        window.dispatchEvent(
          new Event("schedula-prescriptions-updated")
        );

        setSuccess("Prescription updated successfully.");

        setTimeout(() => {
          setShowCreate(false);
          setSuccess("");
        }, 1000);

        return;
      }

      const alreadyExists = storedPrescriptions.some(
        (prescription) =>
          prescription.appointmentId === selectedAppointment.id
      );

      if (alreadyExists) {
        setError(
          "A prescription already exists for this appointment. Open it from All Prescriptions to edit it."
        );
        setSaving(false);
        return;
      }

      const newPrescription: Prescription = {
        id: createUniqueId("prescription"),
        appointmentId: selectedAppointment.id,
        doctorId: doctor.id,
        doctorName: doctor.name,
        patientId: selectedAppointment.patientId,
        patientName: selectedAppointment.patientName,
        patientEmail: selectedAppointment.patientEmail,
        diagnosis: diagnosis.trim(),
        medicines: validMedicines,
        instructions: instructions.trim(),
        createdAt: now,
        updatedAt: now,
      };

      const updatedPrescriptions = [
        ...storedPrescriptions,
        newPrescription,
      ];

      localStorage.setItem(
        PRESCRIPTION_KEY,
        JSON.stringify(updatedPrescriptions)
      );

      createPatientNotification(newPrescription);

      setPrescriptions(
        updatedPrescriptions.filter(
          (item) => item.doctorId === doctor.id
        )
      );

      window.dispatchEvent(
        new Event("schedula-prescriptions-updated")
      );

      setSuccess(
        "Prescription created successfully. Patient has been notified."
      );

      setTimeout(() => {
        setShowCreate(false);
        setSuccess("");
        setView("prescriptions");
      }, 1200);
    } catch {
      setError("Unable to save prescription. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const deletePrescription = (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this prescription?"
    );

    if (!confirmed) return;

    try {
      const storedPrescriptions = parseArray<Prescription>(
        localStorage.getItem(PRESCRIPTION_KEY)
      );

      const updatedPrescriptions = storedPrescriptions.filter(
        (item) => item.id !== id
      );

      localStorage.setItem(
        PRESCRIPTION_KEY,
        JSON.stringify(updatedPrescriptions)
      );

      setPrescriptions(
        updatedPrescriptions.filter(
          (item) => item.doctorId === doctor?.id
        )
      );

      window.dispatchEvent(
        new Event("schedula-prescriptions-updated")
      );

      if (selectedPrescription?.id === id) {
        setSelectedPrescription(null);
        setShowView(false);
      }
    } catch {
      setError("Unable to delete prescription.");
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "Date unavailable";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) return date;

    return value.toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatAppointmentDate = (date: string) => {
    if (!date) return "Date unavailable";

    const value = new Date(`${date}T00:00:00`);

    if (Number.isNaN(value.getTime())) return date;

    return value.toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
              <Stethoscope size={14} />
              Clinical Management
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Prescriptions
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Create and manage prescriptions for your completed
              appointments.
            </p>
          </div>

          <button
            onClick={() => openCreate()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={eligibleAppointments.length === 0}
          >
            <Plus size={18} />
            New Prescription
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-500">
              Prescriptions
            </p>
            <p className="mt-1 text-2xl font-bold">
              {prescriptions.length}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <p className="text-xs font-medium text-emerald-600">
              Completed visits
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">
              {completedAppointments.length}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
            <p className="text-xs font-medium text-amber-600">
              Awaiting prescription
            </p>
            <p className="mt-1 text-2xl font-bold text-amber-700">
              {eligibleAppointments.length}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-xs font-medium text-blue-600">
              Patients treated
            </p>
            <p className="mt-1 text-2xl font-bold text-blue-700">
              {
                new Set(
                  appointments.map(
                    (appointment) => appointment.patientId
                  )
                ).size
              }
            </p>
          </div>
        </div>

        <div className="mb-5 flex gap-2">
          <button
            onClick={() => setView("prescriptions")}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${
              view === "prescriptions"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 shadow-sm"
            }`}
          >
            All Prescriptions
          </button>

          <button
            onClick={() => setView("eligible")}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${
              view === "eligible"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 shadow-sm"
            }`}
          >
            Completed Visits
          </button>
        </div>

        {view === "prescriptions" && (
          <>
            <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search patient, diagnosis or medicine..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </div>
            </div>

            {loading ? (
              <div className="rounded-3xl bg-white p-16 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
              </div>
            ) : filteredPrescriptions.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
                <FileText
                  className="mx-auto text-slate-300"
                  size={44}
                />

                <h2 className="mt-4 text-lg font-bold">
                  No prescriptions yet
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Create a prescription from a completed appointment.
                </p>

                {eligibleAppointments.length > 0 && (
                  <button
                    onClick={() => openCreate()}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
                  >
                    <Plus size={17} />
                    Create Prescription
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {filteredPrescriptions.map((prescription) => (
                  <div
                    key={prescription.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                          <FileText size={21} />
                        </div>

                        <div>
                          <h3 className="font-bold">
                            {prescription.patientName}
                          </h3>

                          <p className="text-xs text-slate-500">
                            {formatDate(prescription.createdAt)}
                          </p>
                        </div>
                      </div>

                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                        Active
                      </span>
                    </div>

                    <div className="mt-5 rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Diagnosis
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {prescription.diagnosis}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {prescription.medicines
                        .slice(0, 3)
                        .map((medicine, index) => (
                          <span
                            key={
                              medicine.id ||
                              `${prescription.id}-medicine-${index}`
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600"
                          >
                            <Pill size={13} />
                            {medicine.name}
                          </span>
                        ))}

                      {prescription.medicines.length > 3 && (
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-500">
                          +{prescription.medicines.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="mt-5 flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedPrescription(prescription);
                          setShowView(true);
                        }}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Eye size={16} />
                        View
                      </button>

                      <button
                        onClick={() => openEdit(prescription)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        <Edit3 size={16} />
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deletePrescription(prescription.id)
                        }
                        className="rounded-xl border border-red-100 px-3 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {view === "eligible" && (
          <div className="space-y-4">
            {eligibleAppointments.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
                <CheckCircle2
                  className="mx-auto text-emerald-400"
                  size={44}
                />

                <h2 className="mt-4 text-lg font-bold">
                  All caught up
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Every completed appointment already has a
                  prescription.
                </p>
              </div>
            ) : (
              eligibleAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <UserRound size={21} />
                      </div>

                      <div>
                        <h3 className="font-bold">
                          {appointment.patientName}
                        </h3>

                        <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays size={13} />
                            {formatAppointmentDate(appointment.date)}
                          </span>

                          <span>{appointment.time}</span>

                          <span>{appointment.type}</span>
                        </div>

                        {appointment.reason && (
                          <p className="mt-2 text-sm text-slate-500">
                            Reason: {appointment.reason}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => openCreate(appointment)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
                    >
                      <Plus size={17} />
                      Create Prescription
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {showCreate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="mx-auto my-6 max-w-3xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-xl font-bold">
                  {editingPrescription
                    ? "Edit Prescription"
                    : "Create Prescription"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedAppointment
                    ? `Patient: ${selectedAppointment.patientName}`
                    : "Select a completed appointment"}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowCreate(false);
                  setError("");
                  setSuccess("");
                }}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-5 sm:p-6">
              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0"
                  />
                  {success}
                </div>
              )}

              {!editingPrescription && (
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Completed Appointment *
                  </label>

                  {eligibleAppointments.length === 0 ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                      There are no completed appointments waiting for a
                      prescription.
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        value={selectedAppointment?.id || ""}
                        onChange={(e) =>
                          handleAppointmentChange(e.target.value)
                        }
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                      >
                        <option value="" disabled>
                          Select completed appointment
                        </option>

                        {eligibleAppointments.map((appointment) => (
                          <option
                            key={appointment.id}
                            value={appointment.id}
                          >
                            {appointment.patientName} —{" "}
                            {formatAppointmentDate(appointment.date)}{" "}
                            {appointment.time}
                          </option>
                        ))}
                      </select>

                      <ChevronDown
                        size={18}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    </div>
                  )}
                </div>
              )}

              {selectedAppointment && (
                <>
                  <div className="mb-6 rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <UserRound
                        size={18}
                        className="text-slate-500"
                      />

                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Patient
                        </p>

                        <p className="mt-1 font-bold">
                          {selectedAppointment.patientName}
                        </p>

                        <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
                          {selectedAppointment.date && (
                            <span>
                              {formatAppointmentDate(
                                selectedAppointment.date
                              )}
                            </span>
                          )}

                          {selectedAppointment.time && (
                            <span>{selectedAppointment.time}</span>
                          )}

                          {selectedAppointment.type && (
                            <span>{selectedAppointment.type}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Diagnosis *
                    </label>

                    <textarea
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      rows={3}
                      placeholder="Enter diagnosis..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    />
                  </div>

                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold">Medicines</h3>
                        <p className="text-xs text-slate-500">
                          Add dosage, frequency and duration.
                        </p>
                      </div>

                      <button
                        onClick={addMedicine}
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                      >
                        <Plus size={14} />
                        Add medicine
                      </button>
                    </div>

                    <div className="space-y-4">
                      {medicines.map((medicine, index) => (
                        <div
                          key={medicine.id}
                          className="rounded-2xl border border-slate-200 p-4"
                        >
                          <div className="mb-4 flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                              Medicine {index + 1}
                            </span>

                            {medicines.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  removeMedicine(medicine.id)
                                }
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                                Medicine name *
                              </label>

                              <input
                                value={medicine.name}
                                onChange={(e) =>
                                  updateMedicine(
                                    medicine.id,
                                    "name",
                                    e.target.value
                                  )
                                }
                                placeholder="e.g. Paracetamol"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                                Dosage *
                              </label>

                              <input
                                value={medicine.dosage}
                                onChange={(e) =>
                                  updateMedicine(
                                    medicine.id,
                                    "dosage",
                                    e.target.value
                                  )
                                }
                                placeholder="e.g. 500 mg"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                                Frequency *
                              </label>

                              <input
                                value={medicine.frequency}
                                onChange={(e) =>
                                  updateMedicine(
                                    medicine.id,
                                    "frequency",
                                    e.target.value
                                  )
                                }
                                placeholder="e.g. Twice daily"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                                Duration *
                              </label>

                              <input
                                value={medicine.duration}
                                onChange={(e) =>
                                  updateMedicine(
                                    medicine.id,
                                    "duration",
                                    e.target.value
                                  )
                                }
                                placeholder="e.g. 5 days"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>

                          <div className="mt-4">
                            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                              Medicine instructions
                            </label>

                            <input
                              value={medicine.instructions}
                              onChange={(e) =>
                                updateMedicine(
                                  medicine.id,
                                  "instructions",
                                  e.target.value
                                )
                              }
                              placeholder="e.g. After food"
                              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Doctor&apos;s instructions
                    </label>

                    <textarea
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      rows={4}
                      placeholder="Additional instructions, precautions, follow-up advice..."
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 p-5 sm:flex-row sm:justify-end">
              <button
                onClick={() => {
                  setShowCreate(false);
                  setError("");
                  setSuccess("");
                }}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>

              <button
                onClick={savePrescription}
                disabled={
                  saving ||
                  !selectedAppointment ||
                  eligibleAppointments.length === 0
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={17} />
                {saving
                  ? "Saving..."
                  : editingPrescription
                  ? "Update Prescription"
                  : "Save Prescription"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showView && selectedPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-xl font-bold">
                  Prescription Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedPrescription.patientName}
                </p>
              </div>

              <button
                onClick={() => setShowView(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-5">
              <div className="rounded-2xl bg-violet-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-500">
                  Diagnosis
                </p>

                <p className="mt-1 font-bold text-violet-900">
                  {selectedPrescription.diagnosis}
                </p>
              </div>

              <div className="mt-6">
                <h3 className="flex items-center gap-2 font-bold">
                  <Pill size={18} />
                  Medicines
                </h3>

                <div className="mt-3 space-y-3">
                  {selectedPrescription.medicines.map(
                    (medicine, index) => (
                      <div
                        key={
                          medicine.id ||
                          `${selectedPrescription.id}-medicine-${index}`
                        }
                        className="rounded-2xl border border-slate-200 p-4"
                      >
                        <div>
                          <p className="font-bold">
                            {index + 1}. {medicine.name}
                          </p>

                          <p className="mt-1 text-sm text-slate-600">
                            {medicine.dosage} •{" "}
                            {medicine.frequency} •{" "}
                            {medicine.duration}
                          </p>
                        </div>

                        {medicine.instructions && (
                          <p className="mt-3 text-sm text-slate-500">
                            {medicine.instructions}
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              {selectedPrescription.instructions && (
                <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Doctor&apos;s instructions
                  </p>

                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                    {selectedPrescription.instructions}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-100 p-4">
              <button
                onClick={() => setShowView(false)}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}