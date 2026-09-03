"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  CalendarDays,
  Clock,
  Stethoscope,
  FileText,
  Download,
  Star,
  RefreshCw,
  Search,
  CheckCircle2,
  X,
  AlertCircle,
  UserRound,
  ArrowRight,
  Loader2,
  ChevronDown,
  IndianRupee,
} from "lucide-react";

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
  status: string;
  reason?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
};

type Doctor = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialty?: string;
  clinicName?: string;
  qualification?: string;
  experience?: string | number;
  consultationFee?: string | number;
  role?: string;
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
  medicines: {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  instructions?: string;
  createdAt: string;
  updatedAt?: string;
};

type Availability = {
  doctorId: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
  slotDuration: number;
};

const APPOINTMENTS_KEY = "schedula_appointments";
const PRESCRIPTIONS_KEY = "schedula_prescriptions";
const PATIENT_KEY = "schedula_current_patient";
const PATIENT_SESSION = "patient_session";
const DOCTORS_KEY = "schedula_registered_doctors";
const AVAILABILITY_KEY = "schedula_doctor_availability";
const REVIEWS_KEY = "schedula_reviews";
const NOTIFICATIONS_KEY = "schedula_notifications";

const appointmentTypes = [
  "General Consultation",
  "Follow-up",
  "Routine Checkup",
  "Video Consultation",
  "Specialist Consultation",
];

function parse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function formatDate(value: string) {
  if (!value) return "Not scheduled";

  return new Date(`${value}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function formatTime(value: string) {
  if (!value) return "Not scheduled";

  const [hourString, minuteString] = value.split(":");

  let hour = Number(hourString);

  const suffix = hour >= 12 ? "PM" : "AM";

  hour = hour % 12 || 12;

  return `${hour}:${minuteString || "00"} ${suffix}`;
}

function generateSlots(
  startTime: string,
  endTime: string,
  duration: number
) {
  const slots: string[] = [];

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  let current = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;

  while (current + duration <= end) {
    const hour = Math.floor(current / 60);
    const minute = current % 60;

    slots.push(
      `${String(hour).padStart(2, "0")}:${String(minute).padStart(
        2,
        "0"
      )}`
    );

    current += duration;
  }

  return slots;
}

export default function PatientCompletedPage() {
  const [patient, setPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);

  const [reviewAppointment, setReviewAppointment] =
    useState<Appointment | null>(null);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const [rebookAppointment, setRebookAppointment] =
    useState<Appointment | null>(null);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [appointmentType, setAppointmentType] = useState(
    "Follow-up"
  );
  const [reason, setReason] = useState("");

  const [rebookLoading, setRebookLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    loadData();

    const update = () => loadData();

    window.addEventListener("storage", update);
    window.addEventListener(
      "schedula-appointments-updated",
      update
    );
    window.addEventListener(
      "schedula-prescriptions-updated",
      update
    );

    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener(
        "schedula-appointments-updated",
        update
      );
      window.removeEventListener(
        "schedula-prescriptions-updated",
        update
      );
    };
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(""), 3500);

    return () => clearTimeout(timer);
  }, [toast]);

  function loadData() {
    const currentPatient =
      parse<any>(
        localStorage.getItem(PATIENT_SESSION),
        null
      ) ||
      parse<any>(
        localStorage.getItem(PATIENT_KEY),
        null
      );

    setPatient(currentPatient);

    if (!currentPatient) {
      setLoading(false);
      return;
    }

    const allAppointments = parse<Appointment[]>(
      localStorage.getItem(APPOINTMENTS_KEY),
      []
    );

    const allPrescriptions = parse<Prescription[]>(
      localStorage.getItem(PRESCRIPTIONS_KEY),
      []
    );

    const allDoctors = parse<Doctor[]>(
      localStorage.getItem(DOCTORS_KEY),
      []
    );

    const allAvailability = parse<Availability[]>(
      localStorage.getItem(AVAILABILITY_KEY),
      []
    );

    setAppointments(
      allAppointments.filter(
        (appointment) =>
          appointment.patientId === currentPatient.id &&
          appointment.status === "completed"
      )
    );

    setPrescriptions(
      allPrescriptions.filter(
        (prescription) =>
          prescription.patientId === currentPatient.id
      )
    );

    setDoctors(
      allDoctors.filter((doctor) => doctor.role === "doctor")
    );

    setAvailability(allAvailability);

    setLoading(false);
  }

  const doctorMap = useMemo(() => {
    const map: Record<string, Doctor> = {};

    doctors.forEach((doctor) => {
      map[doctor.id] = doctor;
    });

    return map;
  }, [doctors]);

  const filteredAppointments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return appointments;

    return appointments.filter((appointment) => {
      return (
        appointment.doctorName.toLowerCase().includes(query) ||
        appointment.type.toLowerCase().includes(query) ||
        appointment.reason?.toLowerCase().includes(query)
      );
    });
  }, [appointments, search]);

  function prescriptionFor(appointmentId: string) {
    return prescriptions.find(
      (prescription) =>
        prescription.appointmentId === appointmentId
    );
  }

  function getMinDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(
      2,
      "0"
    );
    const day = String(tomorrow.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const selectedAvailability = rebookAppointment
    ? availability.find(
        (item) =>
          item.doctorId === rebookAppointment.doctorId
      )
    : undefined;

  const availableSlots = useMemo(() => {
    if (!rebookAppointment || !selectedDate) return [];

    const config = selectedAvailability || {
      doctorId: rebookAppointment.doctorId,
      enabled: true,
      startTime: "09:00",
      endTime: "17:00",
      slotDuration: 30,
    };

    if (!config.enabled) return [];

    const slots = generateSlots(
      config.startTime,
      config.endTime,
      Number(config.slotDuration) || 30
    );

    const allAppointments = parse<Appointment[]>(
      localStorage.getItem(APPOINTMENTS_KEY),
      []
    );

    return slots.filter((slot) => {
      const occupied = allAppointments.some(
        (appointment) =>
          appointment.doctorId === rebookAppointment.doctorId &&
          appointment.date === selectedDate &&
          appointment.time === slot &&
          !["cancelled", "missed"].includes(
            appointment.status
          )
      );

      const time = new Date(
        `${selectedDate}T${slot}:00`
      ).getTime();

      return !occupied && time > Date.now();
    });
  }, [
    rebookAppointment,
    selectedDate,
    selectedAvailability,
  ]);

  function openRebook(appointment: Appointment) {
    setRebookAppointment(appointment);
    setSelectedDate("");
    setSelectedTime("");
    setAppointmentType("Follow-up");
    setReason(
      appointment.reason
        ? `Follow-up for: ${appointment.reason}`
        : ""
    );
    setError("");
  }

  function closeRebook() {
    if (rebookLoading) return;

    setRebookAppointment(null);
    setSelectedDate("");
    setSelectedTime("");
    setError("");
  }

  function notifyDoctor(
    doctorId: string,
    appointmentId: string,
    doctorName: string
  ) {
    const notifications = parse<any[]>(
      localStorage.getItem(NOTIFICATIONS_KEY),
      []
    );

    notifications.unshift({
      id: `notification-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`,
      userId: doctorId,
      doctorId,
      role: "doctor",
      type: "booking",
      title: "Rebook request received",
      message: `${patient?.name || "A patient"} requested a new appointment with ${doctorName}.`,
      appointmentId,
      read: false,
      createdAt: new Date().toISOString(),
    });

    localStorage.setItem(
      NOTIFICATIONS_KEY,
      JSON.stringify(notifications)
    );

    window.dispatchEvent(
      new Event("schedula-notifications-updated")
    );
  }

  function submitRebook() {
    if (!rebookAppointment || !patient) return;

    setError("");

    if (!selectedDate) {
      setError("Please select a date.");
      return;
    }

    if (!selectedTime) {
      setError("Please select an available time.");
      return;
    }

    const selectedDateTime = new Date(
      `${selectedDate}T${selectedTime}:00`
    );

    if (selectedDateTime.getTime() <= Date.now()) {
      setError("Please choose a future time.");
      return;
    }

    const allAppointments = parse<Appointment[]>(
      localStorage.getItem(APPOINTMENTS_KEY),
      []
    );

    const conflict = allAppointments.some(
      (appointment) =>
        appointment.doctorId === rebookAppointment.doctorId &&
        appointment.date === selectedDate &&
        appointment.time === selectedTime &&
        !["cancelled", "missed"].includes(
          appointment.status
        )
    );

    if (conflict) {
      setError(
        "This slot is no longer available. Please choose another."
      );
      return;
    }

    setRebookLoading(true);

    try {
      const doctor =
        doctorMap[rebookAppointment.doctorId];

      const appointmentId = `appointment-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;

      const newAppointment: Appointment = {
        id: appointmentId,
        doctorId: rebookAppointment.doctorId,
        patientId: patient.id,
        doctorName:
          doctor?.name || rebookAppointment.doctorName,
        patientName: patient.name,
        patientEmail: patient.email,
        patientPhone: patient.phone,
        date: selectedDate,
        time: selectedTime,
        type: appointmentType,
        status: "pending",
        reason: reason.trim(),
        notes: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(
        APPOINTMENTS_KEY,
        JSON.stringify([
          ...allAppointments,
          newAppointment,
        ])
      );

      notifyDoctor(
        rebookAppointment.doctorId,
        appointmentId,
        doctor?.name || rebookAppointment.doctorName
      );

      window.dispatchEvent(
        new Event("schedula-appointments-updated")
      );

      setToast(
        "Rebook request sent successfully. Waiting for doctor confirmation."
      );

      closeRebook();
    } finally {
      setRebookLoading(false);
    }
  }

  function saveReview() {
    if (!reviewAppointment || !patient) return;

    const reviews = parse<any[]>(
      localStorage.getItem(REVIEWS_KEY),
      []
    );

    const existingIndex = reviews.findIndex(
      (review) =>
        review.appointmentId === reviewAppointment.id
    );

    const review = {
      id:
        existingIndex >= 0
          ? reviews[existingIndex].id
          : `review-${Date.now()}`,
      appointmentId: reviewAppointment.id,
      doctorId: reviewAppointment.doctorId,
      patientId: patient.id,
      rating: reviewRating,
      comment: reviewComment.trim(),
      createdAt:
        existingIndex >= 0
          ? reviews[existingIndex].createdAt
          : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      reviews[existingIndex] = review;
    } else {
      reviews.push(review);
    }

    localStorage.setItem(
      REVIEWS_KEY,
      JSON.stringify(reviews)
    );

    setReviewAppointment(null);
    setReviewComment("");

    setToast("Your review has been saved.");
  }

  function downloadPrescription(
    prescription: Prescription
  ) {
    const medicines = prescription.medicines
      .map(
        (medicine) => `
          <tr>
            <td>${medicine.name}</td>
            <td>${medicine.dosage}</td>
            <td>${medicine.frequency}</td>
            <td>${medicine.duration}</td>
            <td>${medicine.instructions || "-"}</td>
          </tr>
        `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription - ${prescription.patientName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #111827;
          }

          .header {
            border-bottom: 2px solid #111827;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }

          h1 {
            margin: 0 0 8px;
          }

          p {
            color: #4b5563;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }

          th, td {
            border: 1px solid #d1d5db;
            padding: 10px;
            text-align: left;
          }

          th {
            background: #f3f4f6;
          }

          .section {
            margin-top: 25px;
          }

          @media print {
            body {
              padding: 20px;
            }
          }
        </style>
      </head>

      <body>
        <div class="header">
          <h1>Schedula Prescription</h1>
          <p>Doctor: ${prescription.doctorName}</p>
          <p>Patient: ${prescription.patientName}</p>
          <p>Diagnosis: ${prescription.diagnosis}</p>
        </div>

        <h2>Medicines</h2>

        <table>
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Dosage</th>
              <th>Frequency</th>
              <th>Duration</th>
              <th>Instructions</th>
            </tr>
          </thead>

          <tbody>
            ${medicines}
          </tbody>
        </table>

        ${
          prescription.instructions
            ? `
              <div class="section">
                <h2>Doctor's Instructions</h2>
                <p>${prescription.instructions}</p>
              </div>
            `
            : ""
        }
      </body>
      </html>
    `;

    const printWindow = window.open(
      "",
      "_blank",
      "width=900,height=700"
    );

    if (!printWindow) {
      alert("Please allow pop-ups to download the prescription.");
      return;
    }

    printWindow.document.write(html);
    printWindow.document.close();

    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 500);
  }

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="flex min-h-[70vh] items-center justify-center bg-slate-50">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading completed appointments...
          </div>
        </main>

        <Footer />
      </>
    );
  }

  if (!patient) {
    return (
      <>
        <Navbar />

        <main className="min-h-[70vh] bg-slate-50 px-4 py-20">
          <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <UserRound className="mx-auto h-12 w-12 text-blue-600" />

            <h1 className="mt-5 text-2xl font-bold">
              Patient login required
            </h1>

            <p className="mt-2 text-slate-500">
              Login to view your completed appointments.
            </p>

            <Link
              href="/doctor/login"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
            >
              Login
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                <CheckCircle2 className="h-4 w-4" />
                Appointment History
              </div>

              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                Completed Appointments
              </h1>

              <p className="mt-2 text-slate-500">
                Review prescriptions, rate your doctor or book another visit.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-500">
              <span className="font-semibold text-slate-900">
                {appointments.length}
              </span>{" "}
              completed appointment
              {appointments.length !== 1 ? "s" : ""}
            </div>

            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search doctor or appointment..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-slate-300" />

              <h2 className="mt-4 text-xl font-bold text-slate-900">
                No completed appointments
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Your completed visits will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {filteredAppointments.map((appointment) => {
                const prescription = prescriptionFor(
                  appointment.id
                );

                const doctor =
                  doctorMap[appointment.doctorId];

                return (
                  <article
                    key={appointment.id}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
                          <Stethoscope className="h-6 w-6 text-emerald-600" />
                        </div>

                        <div>
                          <h2 className="font-bold text-slate-900">
                            {appointment.doctorName}
                          </h2>

                          <p className="mt-1 text-sm text-slate-500">
                            {doctor?.specialty ||
                              "Medical Specialist"}
                          </p>
                        </div>
                      </div>

                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                        Completed
                      </span>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <CalendarDays className="h-4 w-4 text-slate-400" />

                        <p className="mt-2 text-sm font-semibold text-slate-800">
                          {formatDate(appointment.date)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <Clock className="h-4 w-4 text-slate-400" />

                        <p className="mt-2 text-sm font-semibold text-slate-800">
                          {formatTime(appointment.time)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-slate-500">
                      <p>
                        <span className="font-semibold text-slate-700">
                          Type:
                        </span>{" "}
                        {appointment.type}
                      </p>

                      {appointment.reason && (
                        <p>
                          <span className="font-semibold text-slate-700">
                            Reason:
                          </span>{" "}
                          {appointment.reason}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 grid gap-2 sm:grid-cols-2">
                      {prescription ? (
                        <>
                          <button
                            onClick={() =>
                              setSelectedPrescription(
                                prescription
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                          >
                            <FileText className="h-4 w-4" />
                            View Prescription
                          </button>

                          <button
                            onClick={() =>
                              downloadPrescription(
                                prescription
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <Download className="h-4 w-4" />
                            Download PDF
                          </button>
                        </>
                      ) : (
                        <div className="sm:col-span-2 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                          <AlertCircle className="h-4 w-4" />
                          Prescription not available yet.
                        </div>
                      )}

                      <button
                        onClick={() =>
                          setReviewAppointment(appointment)
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Star className="h-4 w-4" />
                        Review Doctor
                      </button>

                      <button
                        onClick={() => openRebook(appointment)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Rebook
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />

      {toast && (
        <div className="fixed bottom-5 right-5 z-[100] max-w-sm rounded-2xl border border-emerald-200 bg-white px-5 py-4 shadow-2xl">
          <div className="flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />

            <p className="text-sm font-medium text-slate-700">
              {toast}
            </p>

            <button onClick={() => setToast("")}>
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>
      )}

      {/* REBOOK MODAL */}
      {rebookAppointment && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5 sm:p-7">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Rebook Appointment
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Choose a new available slot with{" "}
                  {rebookAppointment.doctorName}.
                </p>
              </div>

              <button
                onClick={closeRebook}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-5 sm:p-7">
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="rounded-2xl bg-blue-50 p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white">
                    <Stethoscope className="h-6 w-6 text-blue-600" />
                  </div>

                  <div>
                    <p className="font-bold text-slate-900">
                      {rebookAppointment.doctorName}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {doctorMap[rebookAppointment.doctorId]
                        ?.specialty ||
                        "Medical Specialist"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  New Date
                </label>

                <input
                  type="date"
                  min={getMinDate()}
                  value={selectedDate}
                  onChange={(event) => {
                    setSelectedDate(event.target.value);
                    setSelectedTime("");
                    setError("");
                  }}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              {selectedDate && (
                <div>
                  <label className="mb-3 block text-sm font-semibold text-slate-700">
                    Available Time
                  </label>

                  {availableSlots.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                      <Clock className="mx-auto h-6 w-6 text-slate-400" />

                      <p className="mt-2 text-sm font-semibold text-slate-700">
                        No slots available
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Try another date.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => {
                            setSelectedTime(slot);
                            setError("");
                          }}
                          className={`rounded-xl border px-3 py-3 text-sm font-semibold ${
                            selectedTime === slot
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                          }`}
                        >
                          {formatTime(slot)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Appointment Type
                  </label>

                  <select
                    value={appointmentType}
                    onChange={(event) =>
                      setAppointmentType(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm"
                  >
                    {appointmentTypes.map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Reason
                  </label>

                  <input
                    value={reason}
                    onChange={(event) =>
                      setReason(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:flex-row sm:justify-end sm:p-7">
              <button
                onClick={closeRebook}
                disabled={rebookLoading}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600"
              >
                Cancel
              </button>

              <button
                onClick={submitRebook}
                disabled={
                  rebookLoading ||
                  !selectedDate ||
                  !selectedTime
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
              >
                {rebookLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Rebooking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Request Rebook
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRESCRIPTION MODAL */}
      {selectedPrescription && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Prescription
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Dr. {selectedPrescription.doctorName}
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedPrescription(null)
                }
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="rounded-2xl bg-blue-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Diagnosis
                </p>

                <p className="mt-2 text-lg font-bold text-slate-900">
                  {selectedPrescription.diagnosis}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Medicines
                </h3>

                <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px] text-left text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="p-4 font-semibold">
                            Medicine
                          </th>
                          <th className="p-4 font-semibold">
                            Dosage
                          </th>
                          <th className="p-4 font-semibold">
                            Frequency
                          </th>
                          <th className="p-4 font-semibold">
                            Duration
                          </th>
                          <th className="p-4 font-semibold">
                            Instructions
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {selectedPrescription.medicines.map(
                          (medicine) => (
                            <tr
                              key={medicine.id}
                              className="border-t border-slate-100"
                            >
                              <td className="p-4 font-semibold">
                                {medicine.name}
                              </td>

                              <td className="p-4">
                                {medicine.dosage}
                              </td>

                              <td className="p-4">
                                {medicine.frequency}
                              </td>

                              <td className="p-4">
                                {medicine.duration}
                              </td>

                              <td className="p-4 text-slate-500">
                                {medicine.instructions ||
                                  "-"}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {selectedPrescription.instructions && (
                <div className="rounded-2xl bg-slate-50 p-5">
                  <h3 className="font-bold text-slate-900">
                    Doctor's Instructions
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {selectedPrescription.instructions}
                  </p>
                </div>
              )}

              <button
                onClick={() =>
                  downloadPrescription(
                    selectedPrescription
                  )
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-600"
              >
                <Download className="h-4 w-4" />
                Download Prescription PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {reviewAppointment && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Review Doctor
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {reviewAppointment.doctorName}
                </p>
              </div>

              <button
                onClick={() =>
                  setReviewAppointment(null)
                }
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold text-slate-700">
                Your rating
              </p>

              <div className="mt-3 flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= reviewRating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={reviewComment}
              onChange={(event) =>
                setReviewComment(event.target.value)
              }
              rows={4}
              placeholder="Share your experience..."
              className="mt-6 w-full resize-none rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
            />

            <button
              onClick={saveReview}
              className="mt-4 w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-600"
            >
              Submit Review
            </button>
          </div>
        </div>
      )}
    </>
  );
}//