"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "upcoming"
  | "completed"
  | "cancelled"
  | "missed";

type AppointmentType =
  | "Video Consultation"
  | "In-Person"
  | "Follow-up"
  | "Emergency";

interface Appointment {
  id: string;
  doctorId?: string;
  patientId?: string;

  doctorName?: string;
  patientName?: string;

  patientEmail?: string;
  patientPhone?: string;

  date: string;
  time: string;

  type: AppointmentType;
  status: AppointmentStatus;

  reason?: string;
  notes?: string;

  createdAt?: string;
  updatedAt?: string;
}

interface Doctor {
  id?: string;
  name?: string;
  email?: string;
  specialty?: string;
  phone?: string;
  licenseNumber?: string;
  experience?: string;
  clinicName?: string;
  qualification?: string;
  consultationFee?: string;
}

const APPOINTMENTS_KEY = "schedula_appointments";

const statusStyles: Record<
  AppointmentStatus,
  {
    label: string;
    className: string;
    dot: string;
  }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  upcoming: {
    label: "Upcoming",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  completed: {
    label: "Completed",
    className: "bg-violet-50 text-violet-700 border-violet-200",
    dot: "bg-violet-500",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
  missed: {
    label: "Missed",
    className: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-500",
  },
};

function getDateValue(date: string, time: string) {
  const parsed = new Date(`${date}T${time}`);

  if (Number.isNaN(parsed.getTime())) {
    return new Date(date).getTime();
  }

  return parsed.getTime();
}

function formatDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatTime(time: string) {
  if (!time) return "Time not set";

  const [hours, minutes] = time.split(":").map(Number);

  if (Number.isNaN(hours)) {
    return time;
  }

  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes || 0);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getInitials(name = "Patient") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getTodayString() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);

  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [showAvailability, setShowAvailability] =
    useState(false);

  const [availabilityEnabled, setAvailabilityEnabled] =
    useState(true);

  const [toast, setToast] = useState("");

  /* =====================================================
     LOAD DOCTOR
  ===================================================== */

  useEffect(() => {
    try {
      const session = localStorage.getItem(
        "clinician_session"
      );

      const currentDoctor = localStorage.getItem(
        "schedula_current_doctor"
      );

      const doctorData = currentDoctor || session;

      if (doctorData) {
        const parsed = JSON.parse(doctorData);

        setDoctor(parsed);
      }
    } catch (error) {
      console.error("Failed to load doctor:", error);
    }
  }, []);

  /* =====================================================
     LOAD APPOINTMENTS
  ===================================================== */

  useEffect(() => {
    const loadAppointments = () => {
      setLoading(true);

      try {
        const doctorSession =
          localStorage.getItem("clinician_session");

        const doctorData =
          localStorage.getItem("schedula_current_doctor");

        const activeDoctorData =
          doctorData || doctorSession;

        if (!activeDoctorData) {
          setAppointments([]);
          setLoading(false);
          return;
        }

        const currentDoctor = JSON.parse(activeDoctorData);

        const storedAppointments =
          localStorage.getItem(APPOINTMENTS_KEY);

        if (!storedAppointments) {
          setAppointments([]);
          setLoading(false);
          return;
        }

        const parsedAppointments = JSON.parse(
          storedAppointments
        );

        if (!Array.isArray(parsedAppointments)) {
          setAppointments([]);
          setLoading(false);
          return;
        }

        const doctorAppointments =
          parsedAppointments.filter(
            (appointment: Appointment) => {
              if (!appointment.doctorId) {
                return true;
              }

              return (
                appointment.doctorId === currentDoctor.id
              );
            }
          );

        setAppointments(doctorAppointments);
      } catch (error) {
        console.error(
          "Failed to load appointments:",
          error
        );

        setAppointments([]);
      }

      setLoading(false);
    };

    loadAppointments();

    window.addEventListener(
      "schedula-appointments-updated",
      loadAppointments
    );

    window.addEventListener(
      "storage",
      loadAppointments
    );

    return () => {
      window.removeEventListener(
        "schedula-appointments-updated",
        loadAppointments
      );

      window.removeEventListener(
        "storage",
        loadAppointments
      );
    };
  }, []);

  /* =====================================================
     UPCOMING APPOINTMENTS
  ===================================================== */

  const upcomingAppointments = useMemo(() => {
    const now = Date.now();

    return appointments
      .filter((appointment) => {
        const appointmentTime = getDateValue(
          appointment.date,
          appointment.time
        );

        const activeStatus =
          appointment.status === "pending" ||
          appointment.status === "confirmed" ||
          appointment.status === "upcoming";

        return (
          activeStatus &&
          appointmentTime >= now
        );
      })
      .sort(
        (a, b) =>
          getDateValue(a.date, a.time) -
          getDateValue(b.date, b.time)
      );
  }, [appointments]);

  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredAppointments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return upcomingAppointments;
    }

    return upcomingAppointments.filter(
      (appointment) =>
        appointment.patientName
          ?.toLowerCase()
          .includes(query) ||
        appointment.patientEmail
          ?.toLowerCase()
          .includes(query) ||
        appointment.type
          ?.toLowerCase()
          .includes(query) ||
        appointment.status
          ?.toLowerCase()
          .includes(query) ||
        appointment.reason
          ?.toLowerCase()
          .includes(query)
    );
  }, [search, upcomingAppointments]);

  /* =====================================================
     STATS
  ===================================================== */

  const stats = useMemo(() => {
    const today = getTodayString();

    const todayAppointments =
      upcomingAppointments.filter(
        (appointment) =>
          appointment.date === today
      );

    const confirmed =
      appointments.filter(
        (appointment) =>
          appointment.status === "confirmed" ||
          appointment.status === "upcoming"
      );

    const pending =
      appointments.filter(
        (appointment) =>
          appointment.status === "pending"
      );

    const completed =
      appointments.filter(
        (appointment) =>
          appointment.status === "completed"
      );

    return {
      today: todayAppointments.length,
      upcoming: confirmed.length,
      pending: pending.length,
      completed: completed.length,
    };
  }, [appointments, upcomingAppointments]);

  /* =====================================================
     NEXT APPOINTMENT
  ===================================================== */

  const nextAppointment =
    upcomingAppointments[0] || null;

  /* =====================================================
     TOAST
  ===================================================== */

  const showToast = (message: string) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 3000);
  };

  /* =====================================================
     QUICK ACTIONS
  ===================================================== */

  const quickActions = [
    {
      title: "Calendar",
      description: "Manage schedule & availability",
      href: "/doctor/calendar",
      icon: "🗓️",
      className:
        "from-blue-500 to-indigo-600",
    },
    {
      title: "Appointments",
      description: "View & manage all appointments",
      href: "/doctor/appointments",
      icon: "◷",
      className:
        "from-violet-500 to-purple-600",
    },
    {
      title: "Prescriptions",
      description: "Create & manage prescriptions",
      href: "/doctor/prescriptions",
      icon: "💊",
      className:
        "from-emerald-500 to-teal-600",
    },
    {
      title: "Notifications",
      description: "Appointment updates & alerts",
      href: "/doctor/notifications",
      icon: "🔔",
      className:
        "from-orange-500 to-rose-500",
    },
  ];

  /* =====================================================
     EMPTY STATE
  ===================================================== */

  const EmptyAppointments = () => (
    <div className="py-16 px-6 text-center">
      <div className="mx-auto w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center text-3xl mb-5">
        🗓️
      </div>

      <h3 className="text-lg font-black text-slate-900">
        No upcoming appointments
      </h3>

      <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
        Your upcoming confirmed and pending
        appointments will appear here.
      </p>

      <Link
        href="/doctor/calendar"
        className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800 transition"
      >
        Open Calendar
        <span>→</span>
      </Link>
    </div>
  );

  /* =====================================================
     APPOINTMENT CARD
  ===================================================== */

  const AppointmentCard = ({
    appointment,
  }: {
    appointment: Appointment;
  }) => {
    const status =
      statusStyles[appointment.status];

    return (
      <div className="group p-5 sm:p-6 hover:bg-slate-50/80 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center gap-5">

          {/* PATIENT */}

          <div className="flex items-center gap-4 min-w-0 lg:w-[270px]">
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-black">
                {getInitials(
                  appointment.patientName
                )}
              </div>

              <span className="absolute -right-1 -bottom-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
            </div>

            <div className="min-w-0">
              <h3 className="font-black text-sm text-slate-900 truncate">
                {appointment.patientName ||
                  "Unknown Patient"}
              </h3>

              <p className="text-[11px] text-slate-400 truncate mt-1">
                {appointment.patientEmail ||
                  "Patient"}
              </p>
            </div>
          </div>

          {/* DATE */}

          <div className="flex items-center gap-3 lg:w-[190px]">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              📅
            </div>

            <div>
              <p className="text-xs font-black text-slate-800">
                {formatShortDate(
                  appointment.date
                )}
              </p>

              <p className="text-[11px] text-slate-400 mt-0.5">
                {formatTime(
                  appointment.time
                )}
              </p>
            </div>
          </div>

          {/* TYPE */}

          <div className="flex items-center gap-3 lg:flex-1">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              {appointment.type ===
              "Video Consultation"
                ? "🎥"
                : appointment.type ===
                  "Emergency"
                ? "🚨"
                : appointment.type ===
                  "Follow-up"
                ? "↻"
                : "🏥"}
            </div>

            <div>
              <p className="text-xs font-black text-slate-800">
                {appointment.type}
              </p>

              <p className="text-[11px] text-slate-400 mt-0.5">
                {appointment.reason ||
                  "General consultation"}
              </p>
            </div>
          </div>

          {/* STATUS */}

          <div className="lg:w-[120px]">
            <span
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-wide ${status.className}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
              />

              {status.label}
            </span>
          </div>

          {/* ACTIONS */}

          <div className="flex items-center gap-2 lg:w-[110px] lg:justify-end">

            <button
              type="button"
              title="Patient Details"
              onClick={() =>
                setSelectedAppointment(
                  appointment
                )
              }
              className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 transition"
            >
              👤
            </button>

            <Link
              href="/doctor/calendar"
              title="Open Calendar"
              className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-sm hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600 transition"
            >
              🗓️
            </Link>

            <button
              type="button"
              title="View Appointment"
              onClick={() =>
                setSelectedAppointment(
                  appointment
                )
              }
              className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm hover:bg-blue-600 transition"
            >
              →
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased overflow-hidden">

      {/* BACKGROUND */}

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-400/10 blur-[120px]" />

        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-violet-400/10 blur-[120px]" />

        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-cyan-400/10 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">

        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* =================================================
              HEADER
          ================================================= */}

          <section className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />

                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
                    Doctor Workspace
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
                  Good{" "}
                  {new Date().getHours() < 12
                    ? "Morning"
                    : new Date().getHours() < 18
                    ? "Afternoon"
                    : "Evening"}
                  ,{" "}
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    {doctor?.name
                      ? doctor.name
                          .replace(/^Dr\.?\s*/i, "")
                          .split(" ")[0]
                      : "Doctor"}
                  </span>
                </h1>

                <p className="mt-3 text-sm text-slate-500 max-w-2xl">
                  Manage your schedule, upcoming
                  appointments, patient care and
                  clinical workflow from one place.
                </p>
              </div>

              <div className="flex items-center gap-3">

                <button
                  type="button"
                  onClick={() => {
                    setShowAvailability(
                      !showAvailability
                    );
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-sm transition ${
                    availabilityEnabled
                      ? "bg-white border-slate-200 hover:border-emerald-300"
                      : "bg-slate-100 border-slate-200"
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      availabilityEnabled
                        ? "bg-emerald-500 animate-pulse"
                        : "bg-slate-400"
                    }`}
                  />

                  <span className="text-xs font-black">
                    {availabilityEnabled
                      ? "Available"
                      : "Unavailable"}
                  </span>
                </button>

                <Link
                  href="/doctor/calendar"
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs font-black shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition"
                >
                  <span>＋</span>
                  Manage Schedule
                </Link>

              </div>
            </div>
          </section>

          {/* =================================================
              AVAILABILITY PANEL
          ================================================= */}

          {showAvailability && (
            <section className="mb-8">
              <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[28px] shadow-xl overflow-hidden">

                <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-xl">
                      🟢
                    </div>

                    <div>
                      <h2 className="font-black text-slate-900">
                        Appointment Availability
                      </h2>

                      <p className="text-xs text-slate-500 mt-1">
                        Patients can book appointments
                        during your available hours.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500">
                      Accept new bookings
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setAvailabilityEnabled(
                          !availabilityEnabled
                        )
                      }
                      className={`relative w-12 h-7 rounded-full transition ${
                        availabilityEnabled
                          ? "bg-emerald-500"
                          : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition ${
                          availabilityEnabled
                            ? "left-6"
                            : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                </div>

                <div className="border-t border-slate-100 px-5 sm:px-6 py-5 grid sm:grid-cols-3 gap-4">

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Today
                    </p>

                    <p className="mt-2 font-black text-slate-900">
                      09:00 AM – 06:00 PM
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Consultation
                    </p>

                    <p className="mt-2 font-black text-slate-900">
                      30 minutes
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Schedule
                    </p>

                    <Link
                      href="/doctor/calendar"
                      className="inline-flex mt-2 text-xs font-black text-blue-600 hover:underline"
                    >
                      Configure availability →
                    </Link>
                  </div>

                </div>
              </div>
            </section>
          )}

          {/* =================================================
              STATS
          ================================================= */}

          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                  📅
                </div>

                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                  Today
                </span>
              </div>

              <p className="text-3xl font-black mt-5">
                {stats.today}
              </p>

              <p className="text-xs text-slate-500 mt-1">
                Today's appointments
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
                  ✓
                </div>

                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                  Active
                </span>
              </div>

              <p className="text-3xl font-black mt-5">
                {stats.upcoming}
              </p>

              <p className="text-xs text-slate-500 mt-1">
                Confirmed & upcoming
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
                  ⏳
                </div>

                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                  Action
                </span>
              </div>

              <p className="text-3xl font-black mt-5">
                {stats.pending}
              </p>

              <p className="text-xs text-slate-500 mt-1">
                Pending requests
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center text-lg">
                  ✚
                </div>

                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                  Total
                </span>
              </div>

              <p className="text-3xl font-black mt-5">
                {stats.completed}
              </p>

              <p className="text-xs text-slate-500 mt-1">
                Completed appointments
              </p>
            </div>

          </section>

          {/* =================================================
              NEXT APPOINTMENT HERO
          ================================================= */}

          {nextAppointment && (
            <section className="mb-8">

              <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white shadow-2xl">

                <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-blue-500/20 blur-3xl" />

                <div className="absolute -bottom-32 left-1/3 w-80 h-80 rounded-full bg-violet-500/20 blur-3xl" />

                <div className="relative z-10 p-6 sm:p-8">

                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-7">

                    <div className="flex items-start gap-5">

                      <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-2xl">
                        🩺
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] uppercase tracking-[0.2em] font-black text-blue-300">
                            Next Appointment
                          </span>

                          <span className="px-2 py-1 rounded-full bg-emerald-400/10 text-emerald-300 text-[9px] font-black uppercase">
                            {statusStyles[
                              nextAppointment.status
                            ].label}
                          </span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-black mt-2">
                          {nextAppointment.patientName ||
                            "Patient"}
                        </h2>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-sm text-white/60">
                          <span>
                            📅{" "}
                            {formatDate(
                              nextAppointment.date
                            )}
                          </span>

                          <span>
                            ◷{" "}
                            {formatTime(
                              nextAppointment.time
                            )}
                          </span>

                          <span>
                            {nextAppointment.type}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedAppointment(
                            nextAppointment
                          )
                        }
                        className="px-5 py-3 rounded-xl bg-white text-slate-900 text-xs font-black hover:bg-blue-50 transition"
                      >
                        View Details
                      </button>

                      <Link
                        href="/doctor/calendar"
                        className="px-5 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-xs font-black hover:bg-white/15 transition"
                      >
                        Open Calendar
                      </Link>

                    </div>

                  </div>

                </div>
              </div>
            </section>
          )}

          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <section className="mb-8">

            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                  Workspace
                </p>

                <h2 className="text-xl font-black mt-1">
                  Quick Actions
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-5 shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.className} text-white flex items-center justify-center text-xl shadow-lg`}
                  >
                    {action.icon}
                  </div>

                  <h3 className="font-black text-sm mt-5">
                    {action.title}
                  </h3>

                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {action.description}
                  </p>

                  <span className="inline-flex mt-4 text-[10px] font-black text-blue-600 group-hover:translate-x-1 transition-transform">
                    Open →
                  </span>
                </Link>
              ))}

            </div>
          </section>

          {/* =================================================
              UPCOMING APPOINTMENTS
          ================================================= */}

          <section className="bg-white/80 backdrop-blur-xl border border-white rounded-[32px] shadow-xl overflow-hidden">

            {/* HEADER */}

            <div className="p-5 sm:p-7 border-b border-slate-100">

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black">
                      Upcoming Appointments
                    </h2>

                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black">
                      {upcomingAppointments.length}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-1">
                    Your upcoming patient schedule
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">

                  {/* SEARCH */}

                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm">
                      🔎
                    </span>

                    <input
                      type="text"
                      value={search}
                      onChange={(e) =>
                        setSearch(e.target.value)
                      }
                      placeholder="Search patients..."
                      className="w-full sm:w-64 pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none text-xs font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
                    />
                  </div>

                  <Link
                    href="/doctor/appointments"
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-blue-600 transition"
                  >
                    View All
                    <span>→</span>
                  </Link>

                </div>

              </div>
            </div>

            {/* TABLE HEADER */}

            {!loading &&
              filteredAppointments.length > 0 && (
                <div className="hidden lg:grid grid-cols-[270px_190px_1fr_120px_110px] gap-5 px-5 sm:px-6 py-3 bg-slate-50/70 border-b border-slate-100 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                  <span>Patient</span>
                  <span>Date & Time</span>
                  <span>Appointment</span>
                  <span>Status</span>
                  <span className="text-right">
                    Actions
                  </span>
                </div>
              )}

            {/* LOADING */}

            {loading ? (
              <div className="p-6 space-y-4">

                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse flex items-center gap-5 p-5"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-200" />

                    <div className="flex-1 space-y-2">
                      <div className="w-40 h-3 rounded bg-slate-200" />
                      <div className="w-24 h-2 rounded bg-slate-100" />
                    </div>

                    <div className="hidden md:block w-28 h-8 rounded bg-slate-100" />

                    <div className="w-20 h-8 rounded-full bg-slate-100" />
                  </div>
                ))}

              </div>
            ) : filteredAppointments.length === 0 ? (
              <EmptyAppointments />
            ) : (
              <div className="divide-y divide-slate-100">

                {filteredAppointments.map(
                  (appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                    />
                  )
                )}

              </div>
            )}

          </section>

          {/* =================================================
              DASHBOARD FOOTER INFO
          ================================================= */}

          <section className="grid md:grid-cols-3 gap-4 mt-8">

            <div className="bg-white/70 border border-white rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  🗓️
                </div>

                <div>
                  <h3 className="text-xs font-black">
                    Smart Calendar
                  </h3>

                  <p className="text-[10px] text-slate-500 mt-1">
                    Prevent double bookings
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 border border-white rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  🔒
                </div>

                <div>
                  <h3 className="text-xs font-black">
                    Patient Privacy
                  </h3>

                  <p className="text-[10px] text-slate-500 mt-1">
                    Secure clinical workflow
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 border border-white rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                  ⚡
                </div>

                <div>
                  <h3 className="text-xs font-black">
                    Real-Time Updates
                  </h3>

                  <p className="text-[10px] text-slate-500 mt-1">
                    Appointment changes sync instantly
                  </p>
                </div>
              </div>
            </div>

          </section>

        </main>

        <Footer />
      </div>

      {/* =====================================================
          APPOINTMENT DETAILS MODAL
      ===================================================== */}

      {selectedAppointment && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm"
          onClick={() =>
            setSelectedAppointment(null)
          }
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-[32px] shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="p-6 sm:p-8 border-b border-slate-100">

              <div className="flex items-start justify-between gap-4">

                <div className="flex items-center gap-4">

                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-black text-lg">
                    {getInitials(
                      selectedAppointment.patientName
                    )}
                  </div>

                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600">
                      Appointment Details
                    </p>

                    <h2 className="text-xl font-black mt-1">
                      {selectedAppointment.patientName ||
                        "Patient"}
                    </h2>

                    <p className="text-xs text-slate-500 mt-1">
                      {selectedAppointment.patientEmail ||
                        "No email available"}
                    </p>
                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedAppointment(null)
                  }
                  className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
                >
                  ✕
                </button>

              </div>

            </div>

            {/* MODAL BODY */}

            <div className="p-6 sm:p-8">

              <div className="grid sm:grid-cols-2 gap-4">

                <div className="p-4 rounded-2xl bg-slate-50">
                  <p className="text-[9px] uppercase tracking-wider font-black text-slate-400">
                    Date
                  </p>

                  <p className="mt-2 text-sm font-black">
                    {formatDate(
                      selectedAppointment.date
                    )}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50">
                  <p className="text-[9px] uppercase tracking-wider font-black text-slate-400">
                    Time
                  </p>

                  <p className="mt-2 text-sm font-black">
                    {formatTime(
                      selectedAppointment.time
                    )}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50">
                  <p className="text-[9px] uppercase tracking-wider font-black text-slate-400">
                    Appointment Type
                  </p>

                  <p className="mt-2 text-sm font-black">
                    {selectedAppointment.type}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50">
                  <p className="text-[9px] uppercase tracking-wider font-black text-slate-400">
                    Status
                  </p>

                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase ${
                        statusStyles[
                          selectedAppointment.status
                        ].className
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          statusStyles[
                            selectedAppointment.status
                          ].dot
                        }`}
                      />

                      {
                        statusStyles[
                          selectedAppointment.status
                        ].label
                      }
                    </span>
                  </div>
                </div>

              </div>

              {/* PATIENT INFO */}

              <div className="mt-6">

                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Patient Information
                </h3>

                <div className="mt-3 grid sm:grid-cols-2 gap-3">

                  <div className="p-4 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase">
                      Phone
                    </p>

                    <p className="text-xs font-bold mt-2">
                      {selectedAppointment.patientPhone ||
                        "Not available"}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase">
                      Reason
                    </p>

                    <p className="text-xs font-bold mt-2">
                      {selectedAppointment.reason ||
                        "General consultation"}
                    </p>
                  </div>

                </div>

              </div>

              {/* NOTES */}

              {selectedAppointment.notes && (
                <div className="mt-6">

                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Patient Notes
                  </h3>

                  <div className="mt-3 p-4 rounded-2xl bg-blue-50 border border-blue-100">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {selectedAppointment.notes}
                    </p>
                  </div>

                </div>
              )}

              {/* ACTIONS */}

              <div className="flex flex-col sm:flex-row gap-3 mt-7">

                <Link
                  href="/doctor/appointments"
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-blue-600 transition"
                >
                  Manage Appointment
                  <span>→</span>
                </Link>

                <Link
                  href="/doctor/calendar"
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-black hover:bg-slate-200 transition"
                >
                  🗓️ Calendar
                </Link>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          TOAST
      ===================================================== */}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[200] px-5 py-4 rounded-2xl bg-slate-900 text-white shadow-2xl text-xs font-bold">
          {toast}
        </div>
      )}
    </div>
  );
}