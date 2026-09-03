"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  CalendarDays,
  Clock,
  UserRound,
  Stethoscope,
  Plus,
  Search,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  CalendarPlus,
  MapPin,
  Phone,
  IndianRupee,
  Loader2,
  ChevronDown,
} from "lucide-react";

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

type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "upcoming"
  | "completed"
  | "cancelled"
  | "missed";

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
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
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

type Patient = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  [key: string]: any;
};

type Notification = {
  id: string;
  userId?: string;
  doctorId?: string;
  patientId?: string;
  role?: string;
  type?: string;
  title: string;
  message: string;
  appointmentId?: string;
  read: boolean;
  createdAt: string;
};

const APPOINTMENTS_KEY = "schedula_appointments";
const DOCTORS_KEY = "schedula_registered_doctors";
const PATIENT_KEY = "schedula_current_patient";
const PATIENT_SESSION = "patient_session";
const AVAILABILITY_KEY = "schedula_doctor_availability";
const NOTIFICATIONS_KEY = "schedula_notifications";

const appointmentTypes = [
  "General Consultation",
  "Follow-up",
  "Routine Checkup",
  "Video Consultation",
  "Specialist Consultation",
];

const statusConfig: Record<
  AppointmentStatus,
  {
    label: string;
    icon: React.ElementType;
    className: string;
  }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  upcoming: {
    label: "Upcoming",
    icon: CalendarDays,
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-red-50 text-red-700 border-red-200",
  },
  missed: {
    label: "Missed",
    icon: AlertCircle,
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
};

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(dateString: string) {
  if (!dateString) return "Not scheduled";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(time: string) {
  if (!time) return "Not scheduled";

  const [hourString, minuteString] = time.split(":");

  let hour = Number(hourString);

  if (Number.isNaN(hour)) {
    return time;
  }

  const minute = minuteString || "00";
  const suffix = hour >= 12 ? "PM" : "AM";

  hour = hour % 12 || 12;

  return `${hour}:${minute} ${suffix}`;
}

function appointmentDateTime(appointment: Appointment) {
  if (!appointment.date || !appointment.time) {
    return null;
  }

  const date = new Date(`${appointment.date}T${appointment.time}:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function isPast(appointment: Appointment) {
  const date = appointmentDateTime(appointment);

  if (!date) return false;

  return date.getTime() < Date.now();
}

function generateSlots(
  startTime: string,
  endTime: string,
  duration: number
) {
  const slots: string[] = [];

  if (!startTime || !endTime || !duration || duration <= 0) {
    return slots;
  }

  const startParts = startTime.split(":").map(Number);
  const endParts = endTime.split(":").map(Number);

  if (
    startParts.length < 2 ||
    endParts.length < 2 ||
    startParts.some(Number.isNaN) ||
    endParts.some(Number.isNaN)
  ) {
    return slots;
  }

  const [startHour, startMinute] = startParts;
  const [endHour, endMinute] = endParts;

  let current = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;

  while (current + duration <= end) {
    const hour = Math.floor(current / 60);
    const minute = current % 60;

    slots.push(
      `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
    );

    current += duration;
  }

  return slots;
}

export default function PatientAppointmentsPage() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);

  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);

  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [appointmentType, setAppointmentType] = useState(
    appointmentTypes[0]
  );

  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");

  const [activeTab, setActiveTab] = useState<
    "upcoming" | "completed" | "cancelled" | "missed"
  >("upcoming");

  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener("storage", handleUpdate);
    window.addEventListener(
      "schedula-appointments-updated",
      handleUpdate
    );
    window.addEventListener("schedula-doctor-updated", handleUpdate);
    window.addEventListener(
      "schedula-availability-updated",
      handleUpdate
    );

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener(
        "schedula-appointments-updated",
        handleUpdate
      );
      window.removeEventListener(
        "schedula-doctor-updated",
        handleUpdate
      );
      window.removeEventListener(
        "schedula-availability-updated",
        handleUpdate
      );
    };
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [toast]);

  function loadData() {
    try {
      const storedPatient =
        safeParse<Patient | null>(
          localStorage.getItem(PATIENT_SESSION),
          null
        ) ||
        safeParse<Patient | null>(
          localStorage.getItem(PATIENT_KEY),
          null
        );

      const doctorsRaw = safeParse<unknown>(
        localStorage.getItem(DOCTORS_KEY),
        []
      );

      const appointmentsRaw = safeParse<unknown>(
        localStorage.getItem(APPOINTMENTS_KEY),
        []
      );

      const availabilityRaw = safeParse<unknown>(
        localStorage.getItem(AVAILABILITY_KEY),
        []
      );

      const storedDoctors = safeArray<Doctor>(doctorsRaw);
      const storedAppointments =
        safeArray<Appointment>(appointmentsRaw);
      const storedAvailability =
        safeArray<Availability>(availabilityRaw);

      setPatient(storedPatient);

      setDoctors(
        storedDoctors.filter(
          (doctor) => doctor && doctor.role === "doctor"
        )
      );

      setAvailability(
        storedAvailability.filter(
          (item) =>
            item &&
            typeof item === "object" &&
            typeof item.doctorId === "string"
        )
      );

      if (storedPatient?.id) {
        setAppointments(
          storedAppointments.filter(
            (appointment) =>
              appointment &&
              appointment.patientId === storedPatient.id
          )
        );
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error(
        "Failed to load patient appointment data:",
        error
      );

      setPatient(null);
      setDoctors([]);
      setAppointments([]);
      setAvailability([]);
    } finally {
      setLoading(false);
    }
  }

  const doctorMap = useMemo(() => {
    const map: Record<string, Doctor> = {};

    doctors.forEach((doctor) => {
      if (doctor?.id) {
        map[doctor.id] = doctor;
      }
    });

    return map;
  }, [doctors]);

  const selectedDoctor = selectedDoctorId
    ? doctorMap[selectedDoctorId]
    : undefined;

  const selectedDoctorAvailability = useMemo(() => {
    if (!Array.isArray(availability)) {
      return undefined;
    }

    return availability.find(
      (item) => item?.doctorId === selectedDoctorId
    );
  }, [availability, selectedDoctorId]);

  const availableSlots = useMemo(() => {
    if (!selectedDoctorId || !selectedDate) {
      return [];
    }

    const config: Availability = selectedDoctorAvailability || {
      doctorId: selectedDoctorId,
      enabled: true,
      startTime: "09:00",
      endTime: "17:00",
      slotDuration: 30,
    };

    if (!config.enabled) {
      return [];
    }

    const allSlots = generateSlots(
      config.startTime,
      config.endTime,
      Number(config.slotDuration) || 30
    );

    return allSlots.filter((slot) => {
      const appointmentsRaw = safeParse<unknown>(
        localStorage.getItem(APPOINTMENTS_KEY),
        []
      );

      const latestAppointments =
        safeArray<Appointment>(appointmentsRaw);

      const alreadyBooked = latestAppointments.some(
        (appointment) =>
          appointment.doctorId === selectedDoctorId &&
          appointment.date === selectedDate &&
          appointment.time === slot &&
          !["cancelled", "missed"].includes(
            appointment.status
          )
      );

      const selectedDateTime = new Date(
        `${selectedDate}T${slot}:00`
      ).getTime();

      return (
        !alreadyBooked &&
        !Number.isNaN(selectedDateTime) &&
        selectedDateTime > Date.now()
      );
    });
  }, [
    selectedDoctorId,
    selectedDate,
    selectedDoctorAvailability,
    appointments,
  ]);

  const filteredAppointments = useMemo(() => {
    let result = [...appointments];

    if (activeTab === "upcoming") {
      result = result.filter(
        (appointment) =>
          ["pending", "confirmed", "upcoming"].includes(
            appointment.status
          ) && !isPast(appointment)
      );
    }

    if (activeTab === "completed") {
      result = result.filter(
        (appointment) => appointment.status === "completed"
      );
    }

    if (activeTab === "cancelled") {
      result = result.filter(
        (appointment) => appointment.status === "cancelled"
      );
    }

    if (activeTab === "missed") {
      result = result.filter(
        (appointment) => appointment.status === "missed"
      );
    }

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((appointment) => {
        return (
          appointment.doctorName
            ?.toLowerCase()
            .includes(query) ||
          appointment.type
            ?.toLowerCase()
            .includes(query) ||
          appointment.reason
            ?.toLowerCase()
            .includes(query)
        );
      });
    }

    return result.sort((a, b) => {
      const aDate =
        appointmentDateTime(a)?.getTime() || 0;
      const bDate =
        appointmentDateTime(b)?.getTime() || 0;

      return aDate - bDate;
    });
  }, [appointments, activeTab, search]);

  const stats = useMemo(() => {
    return {
      upcoming: appointments.filter(
        (appointment) =>
          ["pending", "confirmed", "upcoming"].includes(
            appointment.status
          ) && !isPast(appointment)
      ).length,

      completed: appointments.filter(
        (appointment) => appointment.status === "completed"
      ).length,

      cancelled: appointments.filter(
        (appointment) => appointment.status === "cancelled"
      ).length,

      missed: appointments.filter(
        (appointment) => appointment.status === "missed"
      ).length,
    };
  }, [appointments]);

  function resetBookingForm() {
    setSelectedDoctorId("");
    setSelectedDate("");
    setSelectedTime("");
    setAppointmentType(appointmentTypes[0]);
    setReason("");
    setNotes("");
    setError("");
  }

  function openBooking() {
    resetBookingForm();
    setBookingOpen(true);
  }

  function closeBooking() {
    if (bookingLoading) return;

    setBookingOpen(false);
    resetBookingForm();
  }

  function createNotification(
    doctorId: string,
    appointmentId: string,
    doctorName: string
  ) {
    const notificationsRaw = safeParse<unknown>(
      localStorage.getItem(NOTIFICATIONS_KEY),
      []
    );

    const notifications =
      safeArray<Notification>(notificationsRaw);

    notifications.unshift({
      id: `notification-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`,
      userId: doctorId,
      doctorId,
      role: "doctor",
      type: "booking",
      title: "New appointment request",
      message: `${
        patient?.name || "A patient"
      } requested an appointment with ${doctorName}.`,
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

  async function bookAppointment() {
    setError("");

    if (!patient) {
      setError(
        "Please login as a patient before booking."
      );
      return;
    }

    if (!selectedDoctor) {
      setError("Please select a doctor.");
      return;
    }

    if (!selectedDate) {
      setError("Please select an appointment date.");
      return;
    }

    if (!selectedTime) {
      setError(
        "Please select an available time slot."
      );
      return;
    }

    if (!reason.trim()) {
      setError(
        "Please enter the reason for your visit."
      );
      return;
    }

    const selectedDateTime = new Date(
      `${selectedDate}T${selectedTime}:00`
    );

    if (
      Number.isNaN(selectedDateTime.getTime()) ||
      selectedDateTime.getTime() <= Date.now()
    ) {
      setError(
        "Please choose a future appointment slot."
      );
      return;
    }

    const appointmentsRaw = safeParse<unknown>(
      localStorage.getItem(APPOINTMENTS_KEY),
      []
    );

    const currentAppointments =
      safeArray<Appointment>(appointmentsRaw);

    const conflict = currentAppointments.some(
      (appointment) =>
        appointment.doctorId === selectedDoctor.id &&
        appointment.date === selectedDate &&
        appointment.time === selectedTime &&
        !["cancelled", "missed"].includes(
          appointment.status
        )
    );

    if (conflict) {
      setError(
        "This slot was just booked by someone else. Please choose another slot."
      );
      return;
    }

    if (selectedDoctorAvailability) {
      if (!selectedDoctorAvailability.enabled) {
        setError(
          "This doctor is currently not accepting appointments."
        );
        return;
      }

      const validSlots = generateSlots(
        selectedDoctorAvailability.startTime,
        selectedDoctorAvailability.endTime,
        Number(
          selectedDoctorAvailability.slotDuration
        ) || 30
      );

      if (!validSlots.includes(selectedTime)) {
        setError(
          "The selected time is no longer available. Please choose another slot."
        );
        return;
      }
    }

    setBookingLoading(true);

    try {
      const now = new Date().toISOString();

      const appointmentId = `appointment-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;

      const newAppointment: Appointment = {
        id: appointmentId,
        doctorId: selectedDoctor.id,
        patientId: patient.id,
        doctorName: selectedDoctor.name,
        patientName: patient.name,
        patientEmail: patient.email,
        patientPhone: patient.phone,
        date: selectedDate,
        time: selectedTime,
        type: appointmentType,
        status: "pending",
        reason: reason.trim(),
        notes: notes.trim(),
        createdAt: now,
        updatedAt: now,
      };

      const updatedAppointments = [
        ...currentAppointments,
        newAppointment,
      ];

      localStorage.setItem(
        APPOINTMENTS_KEY,
        JSON.stringify(updatedAppointments)
      );

      createNotification(
        selectedDoctor.id,
        appointmentId,
        selectedDoctor.name
      );

      window.dispatchEvent(
        new Event("schedula-appointments-updated")
      );

      setAppointments((current) => [
        ...current,
        newAppointment,
      ]);

      setToast(
        "Appointment request sent. Waiting for doctor confirmation."
      );

      setBookingOpen(false);
      resetBookingForm();
    } catch (error) {
      console.error(
        "Failed to book appointment:",
        error
      );

      setError(
        "Something went wrong while booking the appointment. Please try again."
      );
    } finally {
      setBookingLoading(false);
    }
  }

  function getMinDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return getDateKey(tomorrow);
  }

  function cancelAppointment(appointmentId: string) {
    const appointment = appointments.find(
      (item) => item.id === appointmentId
    );

    if (!appointment) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) return;

    const appointmentsRaw = safeParse<unknown>(
      localStorage.getItem(APPOINTMENTS_KEY),
      []
    );

    const allAppointments =
      safeArray<Appointment>(appointmentsRaw);

    const now = new Date().toISOString();

    const updated = allAppointments.map((item) =>
      item.id === appointmentId
        ? {
            ...item,
            status:
              "cancelled" as AppointmentStatus,
            updatedAt: now,
          }
        : item
    );

    localStorage.setItem(
      APPOINTMENTS_KEY,
      JSON.stringify(updated)
    );

    const notificationsRaw = safeParse<unknown>(
      localStorage.getItem(NOTIFICATIONS_KEY),
      []
    );

    const notifications =
      safeArray<Notification>(notificationsRaw);

    notifications.unshift({
      id: `notification-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`,
      doctorId: appointment.doctorId,
      userId: appointment.doctorId,
      role: "doctor",
      type: "cancelled",
      title: "Appointment cancelled",
      message: `${
        patient?.name || "Patient"
      } cancelled the appointment scheduled for ${formatDate(
        appointment.date
      )} at ${formatTime(appointment.time)}.`,
      appointmentId,
      read: false,
      createdAt: now,
    });

    localStorage.setItem(
      NOTIFICATIONS_KEY,
      JSON.stringify(notifications)
    );

    setAppointments((current) =>
      current.map((item) =>
        item.id === appointmentId
          ? {
              ...item,
              status:
                "cancelled" as AppointmentStatus,
              updatedAt: now,
            }
          : item
      )
    );

    window.dispatchEvent(
      new Event("schedula-appointments-updated")
    );

    window.dispatchEvent(
      new Event("schedula-notifications-updated")
    );

    setToast(
      "Appointment cancelled successfully."
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="min-h-[70vh] bg-slate-50 px-4 py-16">
          <div className="mx-auto flex max-w-7xl items-center justify-center">
            <div className="flex items-center gap-3 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading your appointments...
            </div>
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
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
              <UserRound className="h-8 w-8 text-blue-600" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              Patient login required
            </h1>

            <p className="mt-3 text-slate-500">
              Please login as a patient to view or book
              appointments.
            </p>

            <Link
              href="/patient/login"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
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
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
                  <CalendarDays className="h-4 w-4" />
                  Patient Portal
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  My Appointments
                </h1>

                <p className="mt-2 text-slate-500">
                  Manage your appointments and book your
                  next consultation.
                </p>
              </div>

              <button
                onClick={openBooking}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
              >
                <Plus className="h-4 w-4" />
                Book Appointment
              </button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Upcoming",
                value: stats.upcoming,
                icon: CalendarDays,
              },
              {
                label: "Completed",
                value: stats.completed,
                icon: CheckCircle2,
              },
              {
                label: "Cancelled",
                value: stats.cancelled,
                icon: XCircle,
              },
              {
                label: "Missed",
                value: stats.missed,
                icon: AlertCircle,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">
                        {item.label}
                      </p>

                      <p className="mt-2 text-2xl font-bold text-slate-900">
                        {item.value}
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                ["upcoming", "Upcoming"],
                ["completed", "Completed"],
                ["cancelled", "Cancelled"],
                ["missed", "Missed"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() =>
                    setActiveTab(
                      value as
                        | "upcoming"
                        | "completed"
                        | "cancelled"
                        | "missed"
                    )
                  }
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    activeTab === value
                      ? "bg-slate-900 text-white"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search appointments..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>
          </div>

          <div className="mt-6">
            {filteredAppointments.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                  <CalendarDays className="h-7 w-7 text-slate-400" />
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  No {activeTab} appointments
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {activeTab === "upcoming"
                    ? "Book an appointment with a doctor to get started."
                    : "Appointments matching this category will appear here."}
                </p>

                {activeTab === "upcoming" && (
                  <button
                    onClick={openBooking}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-600"
                  >
                    <CalendarPlus className="h-4 w-4" />
                    Book Appointment
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-5 lg:grid-cols-2">
                {filteredAppointments.map(
                  (appointment) => {
                    const config =
                      statusConfig[
                        appointment.status
                      ];

                    const StatusIcon =
                      config.icon;

                    return (
                      <article
                        key={appointment.id}
                        className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
                              <Stethoscope className="h-6 w-6 text-blue-600" />
                            </div>

                            <div className="min-w-0">
                              <h3 className="truncate font-bold text-slate-900">
                                {
                                  appointment.doctorName
                                }
                              </h3>

                              <p className="mt-1 text-sm text-slate-500">
                                {doctorMap[
                                  appointment
                                    .doctorId
                                ]?.specialty ||
                                  "Medical Specialist"}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${config.className}`}
                          >
                            <StatusIcon className="h-3.5 w-3.5" />
                            {config.label}
                          </span>
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl bg-slate-50 p-4">
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                              <CalendarDays className="h-4 w-4" />
                              DATE
                            </div>

                            <p className="mt-2 text-sm font-semibold text-slate-800">
                              {formatDate(
                                appointment.date
                              )}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-slate-50 p-4">
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                              <Clock className="h-4 w-4" />
                              TIME
                            </div>

                            <p className="mt-2 text-sm font-semibold text-slate-800">
                              {formatTime(
                                appointment.time
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-slate-500">
                            <CalendarPlus className="h-4 w-4 text-slate-400" />
                            {appointment.type}
                          </div>

                          {appointment.reason && (
                            <div className="flex items-start gap-2 text-slate-500">
                              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                              <span>
                                {
                                  appointment.reason
                                }
                              </span>
                            </div>
                          )}

                          {doctorMap[
                            appointment.doctorId
                          ]?.clinicName && (
                            <div className="flex items-center gap-2 text-slate-500">
                              <MapPin className="h-4 w-4 text-slate-400" />
                              {
                                doctorMap[
                                  appointment.doctorId
                                ].clinicName
                              }
                            </div>
                          )}

                          {doctorMap[
                            appointment.doctorId
                          ]?.phone && (
                            <div className="flex items-center gap-2 text-slate-500">
                              <Phone className="h-4 w-4 text-slate-400" />
                              {
                                doctorMap[
                                  appointment.doctorId
                                ].phone
                              }
                            </div>
                          )}
                        </div>

                        {[
                          "pending",
                          "confirmed",
                          "upcoming",
                        ].includes(
                          appointment.status
                        ) &&
                          !isPast(
                            appointment
                          ) && (
                            <div className="mt-6 border-t border-slate-100 pt-5">
                              <button
                                onClick={() =>
                                  cancelAppointment(
                                    appointment.id
                                  )
                                }
                                className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4" />
                                Cancel Appointment
                              </button>
                            </div>
                          )}
                      </article>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {toast && (
        <div className="fixed bottom-5 right-5 z-[100] max-w-sm rounded-2xl border border-emerald-200 bg-white px-5 py-4 shadow-2xl">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Success
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {toast}
              </p>
            </div>

            <button
              onClick={() => setToast("")}
              className="rounded-lg p-1 hover:bg-slate-100"
            >
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>
      )}

      {bookingOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 sm:px-7">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Book an Appointment
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Choose a doctor, date and available
                  time.
                </p>
              </div>

              <button
                onClick={closeBooking}
                disabled={bookingLoading}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-6 sm:px-7">
              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Select Doctor
                  </label>

                  <div className="relative">
                    <select
                      value={selectedDoctorId}
                      onChange={(event) => {
                        setSelectedDoctorId(
                          event.target.value
                        );
                        setSelectedDate("");
                        setSelectedTime("");
                        setError("");
                      }}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    >
                      <option value="">
                        Choose a doctor
                      </option>

                      {doctors.map((doctor) => (
                        <option
                          key={doctor.id}
                          value={doctor.id}
                        >
                          {doctor.name}
                          {doctor.specialty
                            ? ` — ${doctor.specialty}`
                            : ""}
                        </option>
                      ))}
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>

                  {doctors.length === 0 && (
                    <p className="mt-2 text-xs text-amber-600">
                      No registered doctors are available.
                    </p>
                  )}
                </div>

                {selectedDoctor && (
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                        <Stethoscope className="h-6 w-6 text-blue-600" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900">
                          {selectedDoctor.name}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {selectedDoctor.specialty ||
                            "Medical Specialist"}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                          {selectedDoctor.qualification && (
                            <span>
                              {
                                selectedDoctor.qualification
                              }
                            </span>
                          )}

                          {selectedDoctor.experience && (
                            <span>
                              {
                                selectedDoctor.experience
                              }{" "}
                              years experience
                            </span>
                          )}

                          {selectedDoctor.consultationFee && (
                            <span className="inline-flex items-center gap-1">
                              <IndianRupee className="h-3 w-3" />
                              {
                                selectedDoctor.consultationFee
                              }
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Select Date
                  </label>

                  <input
                    type="date"
                    min={getMinDate()}
                    value={selectedDate}
                    disabled={!selectedDoctorId}
                    onChange={(event) => {
                      setSelectedDate(
                        event.target.value
                      );
                      setSelectedTime("");
                      setError("");
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-50 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                {selectedDate && (
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <label className="text-sm font-semibold text-slate-700">
                        Available Time Slots
                      </label>

                      {availableSlots.length > 0 && (
                        <span className="text-xs font-medium text-emerald-600">
                          {availableSlots.length}{" "}
                          slots available
                        </span>
                      )}
                    </div>

                    {availableSlots.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                        <Clock className="mx-auto h-6 w-6 text-slate-400" />

                        <p className="mt-2 text-sm font-semibold text-slate-700">
                          No available slots
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Try another date or choose
                          another doctor.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {availableSlots.map(
                          (slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => {
                                setSelectedTime(
                                  slot
                                );
                                setError("");
                              }}
                              className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                                selectedTime ===
                                slot
                                  ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                              }`}
                            >
                              {formatTime(slot)}
                            </button>
                          )
                        )}
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
                        setAppointmentType(
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    >
                      {appointmentTypes.map(
                        (type) => (
                          <option key={type}>
                            {type}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Reason for Visit
                    </label>

                    <input
                      value={reason}
                      onChange={(event) =>
                        setReason(
                          event.target.value
                        )
                      }
                      placeholder="e.g. Fever, follow-up..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Additional Notes{" "}
                    <span className="font-normal text-slate-400">
                      (optional)
                    </span>
                  </label>

                  <textarea
                    value={notes}
                    onChange={(event) =>
                      setNotes(
                        event.target.value
                      )
                    }
                    rows={3}
                    placeholder="Anything the doctor should know before the appointment..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                {selectedDoctor &&
                  selectedDate &&
                  selectedTime && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />

                        <div>
                          <p className="text-sm font-bold text-emerald-800">
                            Appointment Summary
                          </p>

                          <p className="mt-1 text-sm text-emerald-700">
                            {
                              selectedDoctor.name
                            }{" "}
                            •{" "}
                            {formatDate(
                              selectedDate
                            )}{" "}
                            •{" "}
                            {formatTime(
                              selectedTime
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
              <button
                onClick={closeBooking}
                disabled={bookingLoading}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={bookAppointment}
                disabled={
                  bookingLoading ||
                  !selectedDoctor ||
                  !selectedDate ||
                  !selectedTime
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {bookingLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    <CalendarPlus className="h-4 w-4" />
                    Request Appointment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}