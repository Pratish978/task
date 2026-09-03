"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "upcoming"
  | "completed"
  | "cancelled"
  | "missed";

type FilterStatus = "all" | AppointmentStatus;

type Appointment = {
  id: string;
  doctorId?: string;
  patientId?: string;
  doctorName?: string;
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  date: string;
  time: string;
  type?: string;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

type Doctor = {
  id: string;
  name: string;
  email: string;
  specialty?: string;
  clinicName?: string;
};

type Notification = {
  id: string;
  userId?: string;
  patientId?: string;
  doctorId?: string;
  type: string;
  title: string;
  message: string;
  appointmentId?: string;
  read: boolean;
  createdAt: string;
};

const APPOINTMENTS_KEY = "schedula_appointments";
const NOTIFICATIONS_KEY = "schedula_notifications";

const READ_ONLY_STATUSES: AppointmentStatus[] = [
  "completed",
  "cancelled",
  "missed",
];

function parseDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function getTodayString() {
  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDate(dateString: string) {
  if (!dateString) return "—";

  return parseDate(dateString).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(time: string) {
  if (!time) return "—";

  const [hours, minutes] = time.split(":").map(Number);

  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function isPastAppointment(appointment: Appointment) {
  if (!appointment.date || !appointment.time) {
    return false;
  }

  const date = parseDate(appointment.date);

  const [hours, minutes] = appointment.time.split(":").map(Number);

  date.setHours(hours, minutes, 0, 0);

  return date.getTime() < Date.now();
}

function getStatusLabel(status: AppointmentStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusStyle(status: AppointmentStatus) {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "confirmed":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "upcoming":
      return "bg-violet-50 text-violet-700 border-violet-200";

    case "completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "cancelled":
      return "bg-rose-50 text-rose-700 border-rose-200";

    case "missed":
      return "bg-slate-100 text-slate-600 border-slate-200";

    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

function getInitials(name?: string) {
  if (!name) return "PT";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function generateId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export default function DoctorAppointmentsPage() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);

  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [loading, setLoading] = useState(true);

  const [activeFilter, setActiveFilter] =
    useState<FilterStatus>("all");

  const [search, setSearch] = useState("");

  const [dateFilter, setDateFilter] = useState("");

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [showDetails, setShowDetails] = useState(false);

  const [showReschedule, setShowReschedule] = useState(false);

  const [newDate, setNewDate] = useState("");

  const [newTime, setNewTime] = useState("");

  const [toast, setToast] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  useEffect(() => {
    loadData();

    const handleStorage = () => {
      loadData();
    };

    const handleAppointmentsUpdated = () => {
      loadData();
    };

    window.addEventListener("storage", handleStorage);

    window.addEventListener(
      "schedula-appointments-updated",
      handleAppointmentsUpdated
    );

    return () => {
      window.removeEventListener("storage", handleStorage);

      window.removeEventListener(
        "schedula-appointments-updated",
        handleAppointmentsUpdated
      );
    };
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => clearTimeout(timer);
  }, [toast]);

  const loadData = () => {
    const storedDoctor =
      localStorage.getItem("clinician_session") ||
      localStorage.getItem("schedula_current_doctor");

    let currentDoctor: Doctor | null = null;

    if (storedDoctor) {
      try {
        currentDoctor = JSON.parse(storedDoctor);
        setDoctor(currentDoctor);
      } catch {
        setDoctor(null);
      }
    }

    const storedAppointments =
      localStorage.getItem(APPOINTMENTS_KEY);

    if (!storedAppointments) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    try {
      const parsed: Appointment[] = JSON.parse(storedAppointments);

      if (!currentDoctor?.id) {
        setAppointments(parsed);
      } else {
        setAppointments(
          parsed.filter(
            (appointment) =>
              appointment.doctorId === currentDoctor?.id ||
              appointment.doctorId === String(currentDoctor?.id)
          )
        );
      }
    } catch {
      setAppointments([]);
    }

    setLoading(false);
  };

  const persistAllAppointments = (updated: Appointment[]) => {
    localStorage.setItem(
      APPOINTMENTS_KEY,
      JSON.stringify(updated)
    );

    window.dispatchEvent(
      new Event("schedula-appointments-updated")
    );

    if (doctor?.id) {
      setAppointments(
        updated.filter(
          (appointment) =>
            appointment.doctorId === doctor.id ||
            appointment.doctorId === String(doctor.id)
        )
      );
    } else {
      setAppointments(updated);
    }
  };

  const createNotification = (
    appointment: Appointment,
    type: string,
    title: string,
    message: string
  ) => {
    const stored =
      localStorage.getItem(NOTIFICATIONS_KEY);

    let notifications: Notification[] = [];

    if (stored) {
      try {
        notifications = JSON.parse(stored);
      } catch {
        notifications = [];
      }
    }

    const notification: Notification = {
      id: generateId("notification"),
      userId: appointment.patientId,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      type,
      title,
      message,
      appointmentId: appointment.id,
      read: false,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(
      NOTIFICATIONS_KEY,
      JSON.stringify([
        notification,
        ...notifications,
      ])
    );

    window.dispatchEvent(
      new Event("schedula-notifications-updated")
    );
  };

  const updateAppointmentStatus = (
    appointment: Appointment,
    status: AppointmentStatus
  ) => {
    const stored =
      localStorage.getItem(APPOINTMENTS_KEY);

    let allAppointments: Appointment[] = [];

    if (stored) {
      try {
        allAppointments = JSON.parse(stored);
      } catch {
        allAppointments = [...appointments];
      }
    } else {
      allAppointments = [...appointments];
    }

    const updated = allAppointments.map((item) => {
      if (item.id !== appointment.id) {
        return item;
      }

      return {
        ...item,
        status,
        updatedAt: new Date().toISOString(),
      };
    });

    persistAllAppointments(updated);

    if (status === "confirmed") {
      createNotification(
        appointment,
        "appointment_confirmed",
        "Appointment Confirmed",
        `Your appointment with Dr. ${
          doctor?.name ||
          appointment.doctorName ||
          "your doctor"
        } on ${formatDate(
          appointment.date
        )} at ${formatTime(
          appointment.time
        )} has been confirmed.`
      );
    }

    if (status === "cancelled") {
      createNotification(
        appointment,
        "appointment_cancelled",
        "Appointment Cancelled",
        `Your appointment with Dr. ${
          doctor?.name ||
          appointment.doctorName ||
          "your doctor"
        } on ${formatDate(
          appointment.date
        )} at ${formatTime(
          appointment.time
        )} has been cancelled.`
      );
    }

    if (status === "completed") {
      createNotification(
        appointment,
        "appointment_completed",
        "Appointment Completed",
        `Your appointment with Dr. ${
          doctor?.name ||
          appointment.doctorName ||
          "your doctor"
        } has been marked as completed.`
      );
    }

    if (status === "missed") {
      createNotification(
        appointment,
        "appointment_missed",
        "Appointment Missed",
        `Your appointment with Dr. ${
          doctor?.name ||
          appointment.doctorName ||
          "your doctor"
        } has been marked as missed.`
      );
    }

    const updatedAppointment = {
      ...appointment,
      status,
      updatedAt: new Date().toISOString(),
    };

    setSelectedAppointment(updatedAppointment);

    setToast({
      type: "success",
      message: `Appointment marked as ${status}.`,
    });
  };

  const handleConfirm = (appointment: Appointment) => {
    updateAppointmentStatus(
      appointment,
      "confirmed"
    );
  };

  const handleDecline = (appointment: Appointment) => {
    updateAppointmentStatus(
      appointment,
      "cancelled"
    );
  };

  const handleCancel = (appointment: Appointment) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this appointment?"
      )
    ) {
      return;
    }

    updateAppointmentStatus(
      appointment,
      "cancelled"
    );
  };

  const handleComplete = (appointment: Appointment) => {
    updateAppointmentStatus(
      appointment,
      "completed"
    );
  };

  const handleMissed = (appointment: Appointment) => {
    updateAppointmentStatus(
      appointment,
      "missed"
    );
  };

  const openReschedule = (appointment: Appointment) => {
    if (
      READ_ONLY_STATUSES.includes(
        appointment.status
      )
    ) {
      setToast({
        type: "info",
        message:
          "Completed, cancelled and missed appointments are read-only.",
      });

      return;
    }

    setSelectedAppointment(appointment);

    setNewDate(appointment.date);
    setNewTime(appointment.time);

    setShowDetails(false);
    setShowReschedule(true);
  };

  const saveReschedule = () => {
    if (!selectedAppointment) return;

    if (!newDate || !newTime) {
      setToast({
        type: "error",
        message:
          "Please select a new date and time.",
      });

      return;
    }

    const selectedDate = parseDate(newDate);

    const today = parseDate(getTodayString());

    if (
      selectedDate.getTime() <
      today.getTime()
    ) {
      setToast({
        type: "error",
        message:
          "You cannot reschedule an appointment to a past date.",
      });

      return;
    }

    const conflicting = appointments.find(
      (appointment) =>
        appointment.id !== selectedAppointment.id &&
        appointment.date === newDate &&
        appointment.time === newTime &&
        !READ_ONLY_STATUSES.includes(
          appointment.status
        )
    );

    if (conflicting) {
      setToast({
        type: "error",
        message: `That slot is already booked by ${
          conflicting.patientName ||
          "another patient"
        }.`,
      });

      return;
    }

    const stored =
      localStorage.getItem(APPOINTMENTS_KEY);

    let allAppointments: Appointment[] = [];

    if (stored) {
      try {
        allAppointments = JSON.parse(stored);
      } catch {
        allAppointments = [...appointments];
      }
    } else {
      allAppointments = [...appointments];
    }

    const updated = allAppointments.map((item) => {
      if (
        item.id !== selectedAppointment.id
      ) {
        return item;
      }

      return {
        ...item,
        date: newDate,
        time: newTime,
        updatedAt: new Date().toISOString(),
      };
    });

    persistAllAppointments(updated);

    createNotification(
      selectedAppointment,
      "appointment_rescheduled",
      "Appointment Rescheduled",
      `Your appointment with Dr. ${
        doctor?.name ||
        selectedAppointment.doctorName ||
        "your doctor"
      } has been rescheduled to ${formatDate(
        newDate
      )} at ${formatTime(newTime)}.`
    );

    setShowReschedule(false);
    setShowDetails(false);
    setSelectedAppointment(null);

    setToast({
      type: "success",
      message:
        "Appointment rescheduled successfully and patient notified.",
    });
  };

  const counts = useMemo(() => {
    const result: Record<FilterStatus, number> = {
      all: appointments.length,
      pending: 0,
      confirmed: 0,
      upcoming: 0,
      completed: 0,
      cancelled: 0,
      missed: 0,
    };

    appointments.forEach((appointment) => {
      if (
        appointment.status in result
      ) {
        result[appointment.status]++;
      }
    });

    return result;
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return appointments
      .filter((appointment) => {
        if (
          activeFilter !== "all" &&
          appointment.status !== activeFilter
        ) {
          return false;
        }

        if (
          dateFilter &&
          appointment.date !== dateFilter
        ) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        return [
          appointment.patientName,
          appointment.patientEmail,
          appointment.patientPhone,
          appointment.type,
          appointment.reason,
          appointment.status,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(normalizedSearch)
          );
      })
      .sort((a, b) => {
        const first = new Date(
          `${a.date}T${a.time}`
        ).getTime();

        const second = new Date(
          `${b.date}T${b.time}`
        ).getTime();

        return first - second;
      });
  }, [
    appointments,
    activeFilter,
    search,
    dateFilter,
  ]);

  const openDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetails(true);
  };

  /*
   * IMPORTANT:
   * Completed is now available for:
   * - Pending
   * - Confirmed
   * - Upcoming
   *
   * Missed is available only when appointment time has passed.
   */
  const renderActionButtons = (
    appointment: Appointment
  ) => {
    if (
      appointment.status === "pending"
    ) {
      return (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleConfirm(appointment);
            }}
            className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-[10px] font-black hover:bg-emerald-700 transition"
          >
            ✓ Confirm
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleDecline(appointment);
            }}
            className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black hover:bg-rose-100 transition"
          >
            × Decline
          </button>

          {/* COMPLETED OPTION */}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleComplete(appointment);
            }}
            className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black hover:bg-emerald-100 transition"
          >
            ✓ Completed
          </button>
        </div>
      );
    }

    if (
      appointment.status === "confirmed" ||
      appointment.status === "upcoming"
    ) {
      const past = isPastAppointment(
        appointment
      );

      return (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              openReschedule(appointment);
            }}
            className="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black hover:bg-blue-100 transition"
          >
            ↻ Reschedule
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleCancel(appointment);
            }}
            className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black hover:bg-rose-100 transition"
          >
            Cancel
          </button>

          {/* COMPLETED OPTION - ALWAYS VISIBLE */}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleComplete(appointment);
            }}
            className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black hover:bg-emerald-100 transition"
          >
            ✓ Completed
          </button>

          {/* MISSED OPTION - ONLY AFTER APPOINTMENT TIME */}
          {past && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleMissed(appointment);
              }}
              className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-black hover:bg-slate-200 transition"
            >
              Missed
            </button>
          )}
        </div>
      );
    }

    if (
      appointment.status === "completed"
    ) {
      return (
        <span className="inline-flex px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[10px] font-black text-emerald-700">
          ✓ Completed
        </span>
      );
    }

    if (
      appointment.status === "cancelled"
    ) {
      return (
        <span className="inline-flex px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-[10px] font-black text-rose-700">
          × Cancelled
        </span>
      );
    }

    if (
      appointment.status === "missed"
    ) {
      return (
        <span className="inline-flex px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-[10px] font-black text-slate-600">
          ⚠ Missed
        </span>
      );
    }

    return (
      <span className="inline-flex px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-[10px] font-black text-slate-500">
        🔒 Read Only
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto" />

            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Loading appointments...
            </p>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-blue-400/10 blur-[140px]" />

        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-violet-400/10 blur-[140px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.035)_1px,transparent_0)] [background-size:24px_24px]" />
      </div>

      <div className="relative z-10">
        <Navbar />

        <main className="max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Link
                  href="/doctor/dashboard"
                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition"
                >
                  ←
                </Link>

                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[9px] font-black uppercase tracking-[0.18em] text-blue-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  Doctor Portal
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                Appointment{" "}
                <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                  Management
                </span>
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Review, confirm, reschedule and
                manage your patient appointments.
              </p>

              {doctor && (
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white flex items-center justify-center text-xs font-black">
                    {getInitials(doctor.name)}
                  </div>

                  <div>
                    <p className="text-xs font-black">
                      Dr. {doctor.name}
                    </p>

                    <p className="text-[10px] text-slate-400">
                      {doctor.specialty ||
                        "Healthcare Specialist"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Link
                href="/doctor/calendar"
                className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-xs font-black shadow-sm hover:shadow-md transition"
              >
                📅 Calendar
              </Link>

              <Link
                href="/doctor/prescriptions"
                className="px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-black shadow-lg"
              >
                💊 Prescriptions
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 mb-6">
            {(
              [
                ["all", "All", counts.all, "📋"],
                ["pending", "Pending", counts.pending, "⏳"],
                ["confirmed", "Confirmed", counts.confirmed, "✓"],
                ["upcoming", "Upcoming", counts.upcoming, "📅"],
                ["completed", "Completed", counts.completed, "✅"],
                ["cancelled", "Cancelled", counts.cancelled, "×"],
                ["missed", "Missed", counts.missed, "⚠"],
              ] as [
                FilterStatus,
                string,
                number,
                string
              ][]
            ).map(
              ([key, label, count, icon]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setActiveFilter(key)
                  }
                  className={`text-left p-4 rounded-2xl border transition-all ${
                    activeFilter === key
                      ? "bg-slate-900 text-white border-slate-900 shadow-xl"
                      : "bg-white/80 border-white shadow-sm hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">
                      {icon}
                    </span>

                    <span
                      className={`text-[8px] font-black uppercase tracking-widest ${
                        activeFilter === key
                          ? "text-white/50"
                          : "text-slate-400"
                      }`}
                    >
                      {label}
                    </span>
                  </div>

                  <p className="text-2xl font-black mt-3">
                    {count}
                  </p>

                  <p
                    className={`text-[9px] font-bold mt-1 ${
                      activeFilter === key
                        ? "text-white/50"
                        : "text-slate-400"
                    }`}
                  >
                    {label} appointments
                  </p>
                </button>
              )
            )}
          </div>

          {/* Filters */}
          <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[28px] shadow-sm p-4 sm:p-5 mb-5">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2">
                  🔎
                </span>

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search patient, email, phone, type or reason..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none text-xs font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div className="flex gap-3">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(event) =>
                    setDateFilter(
                      event.target.value
                    )
                  }
                  className="h-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none text-xs font-bold focus:bg-white focus:border-blue-500"
                />

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setDateFilter("");
                    setActiveFilter("all");
                  }}
                  className="px-4 py-3 rounded-xl bg-slate-100 text-slate-600 text-xs font-black hover:bg-slate-200 transition"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400">
                Showing{" "}
                <span className="text-slate-800 font-black">
                  {filteredAppointments.length}
                </span>{" "}
                of{" "}
                <span className="text-slate-800 font-black">
                  {appointments.length}
                </span>{" "}
                appointments
              </p>

              <p className="hidden sm:block text-[9px] font-bold text-slate-400">
                Select an appointment to view details
              </p>
            </div>
          </div>

          {/* Appointment list */}
          {filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center text-3xl">
                📅
              </div>

              <h2 className="mt-5 text-lg font-black">
                No appointments found
              </h2>

              <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
                There are no appointments matching
                your current filters.
              </p>

              {(search ||
                dateFilter ||
                activeFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setDateFilter("");
                    setActiveFilter("all");
                  }}
                  className="mt-5 px-5 py-3 rounded-xl bg-slate-900 text-white text-xs font-black"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAppointments.map(
                (appointment) => {
                  const readOnly =
                    READ_ONLY_STATUSES.includes(
                      appointment.status
                    );

                  return (
                    <div
                      key={appointment.id}
                      onClick={() =>
                        openDetails(appointment)
                      }
                      className={`group bg-white/90 backdrop-blur-xl border rounded-[24px] p-5 shadow-sm hover:shadow-lg transition-all cursor-pointer ${
                        readOnly
                          ? "border-slate-200"
                          : "border-white hover:-translate-y-0.5"
                      }`}
                    >
                      <div className="flex flex-col xl:flex-row xl:items-center gap-5">
                        {/* Patient */}
                        <div className="flex items-center gap-4 min-w-[240px] xl:w-[270px]">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-black ${
                              readOnly
                                ? "bg-slate-100 text-slate-500"
                                : "bg-gradient-to-br from-blue-100 to-violet-100 text-blue-700"
                            }`}
                          >
                            {getInitials(
                              appointment.patientName
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="font-black text-sm truncate">
                              {appointment.patientName ||
                                "Unknown Patient"}
                            </p>

                            <p className="text-[10px] text-slate-400 truncate mt-1">
                              {appointment.patientEmail ||
                                "No email available"}
                            </p>

                            {appointment.patientPhone && (
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {appointment.patientPhone}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Date/time */}
                        <div className="flex items-center gap-4 xl:flex-1">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg">
                            📅
                          </div>

                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                              Date & Time
                            </p>

                            <p className="text-xs font-black mt-1">
                              {formatDate(
                                appointment.date
                              )}
                            </p>

                            <p className="text-[10px] text-blue-600 font-bold mt-0.5">
                              {formatTime(
                                appointment.time
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Type */}
                        <div className="xl:w-[150px]">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                            Appointment
                          </p>

                          <p className="text-xs font-black mt-1">
                            {appointment.type ||
                              "Consultation"}
                          </p>

                          {appointment.reason && (
                            <p className="text-[9px] text-slate-400 mt-1 truncate max-w-[150px]">
                              {appointment.reason}
                            </p>
                          )}
                        </div>

                        {/* Status */}
                        <div className="xl:w-[130px]">
                          <span
                            className={`inline-flex px-3 py-2 rounded-full border text-[9px] font-black uppercase tracking-wider ${getStatusStyle(
                              appointment.status
                            )}`}
                          >
                            {getStatusLabel(
                              appointment.status
                            )}
                          </span>
                        </div>

                        {/* Actions */}
                        <div
                          className="xl:w-[380px]"
                          onClick={(event) =>
                            event.stopPropagation()
                          }
                        >
                          {renderActionButtons(
                            appointment
                          )}
                        </div>

                        <div className="text-slate-300 group-hover:text-blue-500 transition">
                          →
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}

          {/* Workflow */}
          <div className="mt-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[28px] p-6 sm:p-8 text-white overflow-hidden relative">
            <div className="absolute -right-20 -top-20 w-60 h-60 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-300">
                Appointment Workflow
              </p>

              <h2 className="text-xl font-black mt-2">
                Complete care journey
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
                {[
                  ["01", "Booking", "📥"],
                  ["02", "Confirmation", "✓"],
                  ["03", "Appointment", "🩺"],
                  ["04", "Completed", "✅"],
                  ["05", "Prescription", "💊"],
                ].map(
                  ([number, title, icon]) => (
                    <div
                      key={number}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10"
                    >
                      <span className="text-xl">
                        {icon}
                      </span>

                      <p className="text-[8px] text-blue-300 font-black tracking-widest mt-3">
                        {number}
                      </p>

                      <p className="text-xs font-black mt-1">
                        {title}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[200] max-w-sm">
          <div
            className={`flex items-start gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-xl ${
              toast.type === "success"
                ? "bg-emerald-50/95 border-emerald-200"
                : toast.type === "error"
                ? "bg-rose-50/95 border-rose-200"
                : "bg-blue-50/95 border-blue-200"
            }`}
          >
            <span>
              {toast.type === "success"
                ? "✓"
                : toast.type === "error"
                ? "⚠️"
                : "ℹ️"}
            </span>

            <p
              className={`text-xs font-bold leading-relaxed ${
                toast.type === "success"
                  ? "text-emerald-700"
                  : toast.type === "error"
                  ? "text-rose-700"
                  : "text-blue-700"
              }`}
            >
              {toast.message}
            </p>

            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-900"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedAppointment && (
        <div
          className="fixed inset-0 z-[150] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-[32px] shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="p-6 bg-gradient-to-br from-blue-50 to-violet-50 border-b border-slate-100">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white flex items-center justify-center text-sm font-black">
                    {getInitials(
                      selectedAppointment.patientName
                    )}
                  </div>

                  <div>
                    <p className="text-xl font-black">
                      {selectedAppointment.patientName ||
                        "Unknown Patient"}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      {selectedAppointment.patientEmail ||
                        "No email"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowDetails(false)
                  }
                  className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                    Appointment Date
                  </p>

                  <p className="text-sm font-black mt-2">
                    {formatDate(
                      selectedAppointment.date
                    )}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                    Appointment Time
                  </p>

                  <p className="text-sm font-black mt-2">
                    {formatTime(
                      selectedAppointment.time
                    )}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                    Appointment Type
                  </p>

                  <p className="text-sm font-black mt-2">
                    {selectedAppointment.type ||
                      "Consultation"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                    Status
                  </p>

                  <span
                    className={`inline-flex mt-2 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase ${getStatusStyle(
                      selectedAppointment.status
                    )}`}
                  >
                    {getStatusLabel(
                      selectedAppointment.status
                    )}
                  </span>
                </div>
              </div>

              {selectedAppointment.patientPhone && (
                <div className="mt-4 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                    Patient Phone
                  </p>

                  <p className="text-sm font-bold mt-2">
                    {selectedAppointment.patientPhone}
                  </p>
                </div>
              )}

              {selectedAppointment.reason && (
                <div className="mt-4 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                    Appointment Reason
                  </p>

                  <p className="text-sm font-medium text-slate-600 mt-2 leading-relaxed">
                    {selectedAppointment.reason}
                  </p>
                </div>
              )}

              {selectedAppointment.notes && (
                <div className="mt-4 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                    Notes
                  </p>

                  <p className="text-sm font-medium text-slate-600 mt-2 leading-relaxed">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">
                  Appointment Actions
                </p>

                {/* PENDING */}
                {selectedAppointment.status ===
                  "pending" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        handleConfirm(
                          selectedAppointment
                        )
                      }
                      className="py-3.5 rounded-xl bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700 transition"
                    >
                      ✓ Confirm Appointment
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDecline(
                          selectedAppointment
                        )
                      }
                      className="py-3.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-black hover:bg-rose-100 transition"
                    >
                      × Decline Appointment
                    </button>

                    {/* COMPLETED OPTION */}
                    <button
                      type="button"
                      onClick={() =>
                        handleComplete(
                          selectedAppointment
                        )
                      }
                      className="py-3.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black hover:bg-emerald-100 transition"
                    >
                      ✓ Mark Completed
                    </button>
                  </div>
                )}

                {/* CONFIRMED / UPCOMING */}
                {(selectedAppointment.status ===
                  "confirmed" ||
                  selectedAppointment.status ===
                    "upcoming") && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openReschedule(
                          selectedAppointment
                        )
                      }
                      className="py-3 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black hover:bg-blue-100 transition"
                    >
                      ↻ Reschedule
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleCancel(
                          selectedAppointment
                        )
                      }
                      className="py-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black hover:bg-rose-100 transition"
                    >
                      Cancel
                    </button>

                    {/* COMPLETED ALWAYS VISIBLE */}
                    <button
                      type="button"
                      onClick={() =>
                        handleComplete(
                          selectedAppointment
                        )
                      }
                      className="py-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black hover:bg-emerald-100 transition"
                    >
                      ✓ Completed
                    </button>

                    {/* MISSED ONLY WHEN PAST */}
                    {isPastAppointment(
                      selectedAppointment
                    ) && (
                      <button
                        type="button"
                        onClick={() =>
                          handleMissed(
                            selectedAppointment
                          )
                        }
                        className="py-3 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-black hover:bg-slate-200 transition"
                      >
                        Missed
                      </button>
                    )}
                  </div>
                )}

                {/* READ ONLY */}
                {READ_ONLY_STATUSES.includes(
                  selectedAppointment.status
                ) && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-black text-slate-600">
                      {selectedAppointment.status ===
                      "completed"
                        ? "✓ Completed Appointment"
                        : selectedAppointment.status ===
                          "cancelled"
                        ? "× Cancelled Appointment"
                        : "⚠ Missed Appointment"}
                    </p>

                    <p className="text-[10px] text-slate-400 mt-1">
                      This appointment is read-only and
                      cannot be modified.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showReschedule &&
        selectedAppointment && (
          <div className="fixed inset-0 z-[160] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-violet-50 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-600">
                      Reschedule Appointment
                    </p>

                    <h2 className="text-2xl font-black mt-1">
                      Choose New Slot
                    </h2>

                    <p className="text-xs text-slate-500 mt-1">
                      {selectedAppointment.patientName}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowReschedule(false)
                    }
                    className="w-9 h-9 rounded-xl bg-white border border-slate-200"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-5">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                    Current Appointment
                  </p>

                  <p className="text-xs font-black mt-2">
                    {formatDate(
                      selectedAppointment.date
                    )}
                  </p>

                  <p className="text-[10px] text-blue-600 font-bold mt-1">
                    {formatTime(
                      selectedAppointment.time
                    )}
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">
                      New Date
                    </label>

                    <input
                      type="date"
                      value={newDate}
                      min={getTodayString()}
                      onChange={(event) =>
                        setNewDate(
                          event.target.value
                        )
                      }
                      className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none text-sm font-bold focus:bg-white focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">
                      New Time
                    </label>

                    <input
                      type="time"
                      value={newTime}
                      onChange={(event) =>
                        setNewTime(
                          event.target.value
                        )
                      }
                      className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none text-sm font-bold focus:bg-white focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-5 p-4 rounded-2xl bg-blue-50 border border-blue-100">
                  <p className="text-xs font-black text-blue-700">
                    🛡️ Double-booking protection
                  </p>

                  <p className="text-[10px] text-blue-600 mt-1 leading-relaxed">
                    The new slot will be checked against
                    your existing appointments before the
                    change is saved.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() =>
                      setShowReschedule(false)
                    }
                    className="py-3.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-black"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={saveReschedule}
                    className="py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs font-black shadow-lg shadow-blue-500/20"
                  >
                    Save Reschedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}