"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Plus,
  Settings2,
  UserRound,
  Video,
  MapPin,
  Phone,
  X,
  CheckCircle2,
  AlertCircle,
  Ban,
  GripVertical,
  RefreshCw,
  Save,
  Loader2,
  Stethoscope,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "upcoming"
  | "completed"
  | "cancelled"
  | "missed";

type CalendarView = "day" | "week" | "month";

type AppointmentType =
  | "In-Person"
  | "Video Consultation"
  | "Phone Consultation"
  | string;

interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;

  doctorName: string;
  patientName: string;

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
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialty?: string;
  licenseNumber?: string;
  experience?: string | number;
  clinicName?: string;
  qualification?: string;
  consultationFee?: string | number;
}

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  appointmentId?: string;
  createdAt: string;
  read: boolean;
}

interface Availability {
  enabled: boolean;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

const APPOINTMENTS_KEY = "schedula_appointments";
const NOTIFICATIONS_KEY = "schedula_notifications";
const AVAILABILITY_KEY = "schedula_doctor_availability";

const READ_ONLY_STATUSES: AppointmentStatus[] = [
  "completed",
  "cancelled",
  "missed",
];

const SLOT_HEIGHT = 64;

function generateId(prefix = "calendar") {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(date.getDate())}`;
}

function parseDateKey(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function parseAppointmentDateTime(
  date: string,
  time: string
) {
  const parsed = new Date(`${date}T${time || "00:00"}`);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function formatDateLong(date: Date) {
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateShort(date: Date) {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function formatTime(time: string) {
  if (!time) return "--";

  const [hours, minutes] = time.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return time;
  }

  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return 0;
  }

  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number) {
  const safeMinutes = Math.max(
    0,
    Math.min(totalMinutes, 23 * 60 + 59)
  );

  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  return `${pad(hours)}:${pad(minutes)}`;
}

function getInitials(name: string) {
  if (!name) return "DR";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function getWeekStart(date: Date) {
  const result = new Date(date);
  const day = result.getDay();

  result.setDate(result.getDate() - day);

  return result;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);

  return result;
}

function isSameDay(first: Date, second: Date) {
  return formatDateKey(first) === formatDateKey(second);
}

function getStatusStyle(status: AppointmentStatus) {
  switch (status) {
    case "pending":
      return {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        dot: "bg-amber-500",
      };

    case "confirmed":
      return {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        dot: "bg-blue-500",
      };

    case "upcoming":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        dot: "bg-emerald-500",
      };

    case "completed":
      return {
        bg: "bg-violet-50",
        text: "text-violet-700",
        border: "border-violet-200",
        dot: "bg-violet-500",
      };

    case "cancelled":
      return {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        dot: "bg-red-500",
      };

    case "missed":
      return {
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-200",
        dot: "bg-orange-500",
      };

    default:
      return {
        bg: "bg-slate-50",
        text: "text-slate-700",
        border: "border-slate-200",
        dot: "bg-slate-500",
      };
  }
}

function getStatusLabel(status: AppointmentStatus) {
  switch (status) {
    case "pending":
      return "Pending";

    case "confirmed":
      return "Confirmed";

    case "upcoming":
      return "Upcoming";

    case "completed":
      return "Completed";

    case "cancelled":
      return "Cancelled";

    case "missed":
      return "Missed";

    default:
      return status;
  }
}

function getAppointmentIcon(type: string) {
  if (type === "Video Consultation") {
    return <Video size={13} />;
  }

  if (type === "Phone Consultation") {
    return <Phone size={13} />;
  }

  return <MapPin size={13} />;
}

function isReadOnly(status: AppointmentStatus) {
  return READ_ONLY_STATUSES.includes(status);
}

export default function DoctorCalendarPage() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);

  const [appointments, setAppointments] = useState<
    Appointment[]
  >([]);

  const [availability, setAvailability] =
    useState<Availability>({
      enabled: true,
      startTime: "09:00",
      endTime: "18:00",
      slotDuration: 30,
    });

  const [view, setView] = useState<CalendarView>("week");

  const [selectedDate, setSelectedDate] =
    useState<Date>(new Date());

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [draggedAppointment, setDraggedAppointment] =
    useState<Appointment | null>(null);

  const [dragOverSlot, setDragOverSlot] = useState<{
    date: string;
    time: string;
  } | null>(null);

  const [showAvailability, setShowAvailability] =
    useState(false);

  const [showAddAppointment, setShowAddAppointment] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState("");

  const [error, setError] = useState("");

  const [newAppointment, setNewAppointment] = useState({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    date: formatDateKey(new Date()),
    time: "09:00",
    type: "In-Person",
    reason: "",
  });

  useEffect(() => {
    const loadData = () => {
      try {
        const storedDoctor =
          localStorage.getItem("clinician_session") ||
          localStorage.getItem("schedula_current_doctor");

        if (storedDoctor) {
          const parsedDoctor = JSON.parse(storedDoctor);
          setDoctor(parsedDoctor);
        }

        const storedAppointments =
          localStorage.getItem(APPOINTMENTS_KEY);

        if (storedAppointments) {
          const parsedAppointments =
            JSON.parse(storedAppointments);

          if (Array.isArray(parsedAppointments)) {
            setAppointments(parsedAppointments);
          }
        }

        const storedAvailability =
          localStorage.getItem(AVAILABILITY_KEY);

        if (storedAvailability) {
          const parsedAvailability =
            JSON.parse(storedAvailability);

          setAvailability((current) => ({
            ...current,
            ...parsedAvailability,
          }));
        }
      } catch (err) {
        console.error(
          "Failed to load calendar data:",
          err
        );
      } finally {
        setLoading(false);
      }
    };

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
      window.removeEventListener(
        "storage",
        handleStorage
      );

      window.removeEventListener(
        "schedula-appointments-updated",
        handleAppointmentsUpdated
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

  const doctorAppointments = useMemo(() => {
    if (!doctor) return [];

    return appointments.filter(
      (appointment) =>
        String(appointment.doctorId) === String(doctor.id)
    );
  }, [appointments, doctor]);

  const weekStart = useMemo(
    () => getWeekStart(selectedDate),
    [selectedDate]
  );

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) =>
      addDays(weekStart, index)
    );
  }, [weekStart]);

  const monthDays = useMemo(() => {
    const firstDay = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1
    );

    const lastDay = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      0
    );

    const startOffset = firstDay.getDay();

    const totalCells = Math.ceil(
      (startOffset + lastDay.getDate()) / 7
    ) * 7;

    return Array.from({ length: totalCells }, (_, index) => {
      const date = new Date(firstDay);

      date.setDate(
        firstDay.getDate() - startOffset + index
      );

      return date;
    });
  }, [selectedDate]);

  const visibleDates = useMemo(() => {
    if (view === "day") {
      return [selectedDate];
    }

    if (view === "week") {
      return weekDays;
    }

    return monthDays;
  }, [view, selectedDate, weekDays, monthDays]);

  const timeSlots = useMemo(() => {
    const start = timeToMinutes(
      availability.startTime
    );

    const end = timeToMinutes(availability.endTime);

    const slots: string[] = [];

    for (
      let current = start;
      current < end;
      current += availability.slotDuration
    ) {
      slots.push(minutesToTime(current));
    }

    return slots;
  }, [availability]);

  const upcomingCount = doctorAppointments.filter(
    (appointment) =>
      ["pending", "confirmed", "upcoming"].includes(
        appointment.status
      )
  ).length;

  const completedCount = doctorAppointments.filter(
    (appointment) => appointment.status === "completed"
  ).length;

  const todayCount = doctorAppointments.filter(
    (appointment) =>
      appointment.date === formatDateKey(new Date())
  ).length;

  function saveAppointments(nextAppointments: Appointment[]) {
    localStorage.setItem(
      APPOINTMENTS_KEY,
      JSON.stringify(nextAppointments)
    );

    window.dispatchEvent(
      new Event("schedula-appointments-updated")
    );

    setAppointments(nextAppointments);
  }

  function createNotification(
    appointment: Appointment,
    title: string,
    message: string
  ) {
    try {
      const existing =
        localStorage.getItem(NOTIFICATIONS_KEY);

      const notifications: Notification[] = existing
        ? JSON.parse(existing)
        : [];

      notifications.unshift({
        id: generateId("notification"),
        userId: appointment.patientId,
        type: "appointment",
        title,
        message,
        appointmentId: appointment.id,
        createdAt: new Date().toISOString(),
        read: false,
      });

      localStorage.setItem(
        NOTIFICATIONS_KEY,
        JSON.stringify(notifications)
      );

      window.dispatchEvent(
        new Event("schedula-notifications-updated")
      );
    } catch (err) {
      console.error(
        "Notification creation failed:",
        err
      );
    }
  }

  function hasConflict(
    date: string,
    time: string,
    appointmentId: string
  ) {
    return doctorAppointments.some((appointment) => {
      if (appointment.id === appointmentId) {
        return false;
      }

      if (appointment.date !== date) {
        return false;
      }

      if (isReadOnly(appointment.status)) {
        return false;
      }

      return appointment.time === time;
    });
  }

  function isWithinAvailability(time: string) {
    const start = timeToMinutes(
      availability.startTime
    );

    const end = timeToMinutes(availability.endTime);

    const selected = timeToMinutes(time);

    return selected >= start && selected < end;
  }

  function isPastSlot(date: string, time: string) {
    const selected = parseAppointmentDateTime(
      date,
      time
    );

    if (!selected) return true;

    return selected.getTime() < Date.now();
  }

  function moveCalendar(direction: number) {
    if (view === "day") {
      setSelectedDate((current) =>
        addDays(current, direction)
      );

      return;
    }

    if (view === "week") {
      setSelectedDate((current) =>
        addDays(current, direction * 7)
      );

      return;
    }

    setSelectedDate(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() + direction,
          1
        )
    );
  }

  function goToday() {
    setSelectedDate(new Date());
  }

  function getHeaderTitle() {
    if (view === "day") {
      return formatDateLong(selectedDate);
    }

    if (view === "week") {
      const end = addDays(weekStart, 6);

      if (
        weekStart.getMonth() === end.getMonth()
      ) {
        return `${weekStart.toLocaleDateString(
          "en-IN",
          {
            month: "long",
          }
        )} ${weekStart.getDate()}–${end.getDate()}, ${end.getFullYear()}`;
      }

      return `${formatDateShort(
        weekStart
      )} – ${formatDateShort(end)}, ${end.getFullYear()}`;
    }

    return selectedDate.toLocaleDateString(
      "en-IN",
      {
        month: "long",
        year: "numeric",
      }
    );
  }

  function getAppointmentsForDate(date: Date) {
    const key = formatDateKey(date);

    return doctorAppointments.filter(
      (appointment) => appointment.date === key
    );
  }

  function getAppointmentForSlot(
    date: Date,
    time: string
  ) {
    const key = formatDateKey(date);

    return doctorAppointments.find(
      (appointment) =>
        appointment.date === key &&
        appointment.time === time
    );
  }

  function handleDragStart(
    appointment: Appointment
  ) {
    if (isReadOnly(appointment.status)) {
      return;
    }

    setDraggedAppointment(appointment);
    setError("");
  }

  function handleDragEnd() {
    setDraggedAppointment(null);
    setDragOverSlot(null);
  }

  function handleDragOver(
    event: React.DragEvent,
    date: Date,
    time: string
  ) {
    event.preventDefault();

    if (!draggedAppointment) return;

    const dateKey = formatDateKey(date);

    if (
      isReadOnly(draggedAppointment.status) ||
      !availability.enabled ||
      !isWithinAvailability(time) ||
      isPastSlot(dateKey, time)
    ) {
      return;
    }

    setDragOverSlot({
      date: dateKey,
      time,
    });
  }

  function handleDrop(
    event: React.DragEvent,
    date: Date,
    time: string
  ) {
    event.preventDefault();

    if (!draggedAppointment) return;

    const dateKey = formatDateKey(date);

    setDragOverSlot(null);

    if (isReadOnly(draggedAppointment.status)) {
      setError(
        "Completed, cancelled and missed appointments cannot be rescheduled."
      );

      setDraggedAppointment(null);
      return;
    }

    if (!availability.enabled) {
      setError(
        "Doctor availability is currently disabled."
      );

      setDraggedAppointment(null);
      return;
    }

    if (!isWithinAvailability(time)) {
      setError(
        "This time is outside your availability."
      );

      setDraggedAppointment(null);
      return;
    }

    if (isPastSlot(dateKey, time)) {
      setError(
        "You cannot reschedule an appointment to a past time."
      );

      setDraggedAppointment(null);
      return;
    }

    if (
      hasConflict(
        dateKey,
        time,
        draggedAppointment.id
      )
    ) {
      setError(
        "This slot is already booked. Choose another available slot."
      );

      setDraggedAppointment(null);
      return;
    }

    if (
      draggedAppointment.date === dateKey &&
      draggedAppointment.time === time
    ) {
      setDraggedAppointment(null);
      return;
    }

    const updatedAppointment: Appointment = {
      ...draggedAppointment,
      date: dateKey,
      time,
      updatedAt: new Date().toISOString(),
    };

    const nextAppointments = appointments.map(
      (appointment) =>
        appointment.id === draggedAppointment.id
          ? updatedAppointment
          : appointment
    );

    saveAppointments(nextAppointments);

    createNotification(
      updatedAppointment,
      "Appointment Rescheduled",
      `Your appointment with ${updatedAppointment.doctorName} has been rescheduled to ${formatDateShort(
        parseDateKey(dateKey)
      )} at ${formatTime(time)}.`
    );

    setToast("Appointment rescheduled successfully.");
    setDraggedAppointment(null);
  }

  function handleSlotClick(
    date: Date,
    time: string
  ) {
    const existingAppointment =
      getAppointmentForSlot(date, time);

    if (existingAppointment) {
      setSelectedAppointment(existingAppointment);
      return;
    }

    if (!availability.enabled) {
      setError(
        "Availability is disabled. Enable it to create appointments."
      );

      return;
    }

    const dateKey = formatDateKey(date);

    if (!isWithinAvailability(time)) {
      setError(
        "This time is outside your available hours."
      );

      return;
    }

    if (isPastSlot(dateKey, time)) {
      setError(
        "You cannot create an appointment in the past."
      );

      return;
    }

    setNewAppointment({
      patientName: "",
      patientEmail: "",
      patientPhone: "",
      date: dateKey,
      time,
      type: "In-Person",
      reason: "",
    });

    setShowAddAppointment(true);
  }

  function handleAvailabilityChange(
    field: keyof Availability,
    value: string | boolean | number
  ) {
    setAvailability((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function saveAvailability() {
    try {
      localStorage.setItem(
        AVAILABILITY_KEY,
        JSON.stringify(availability)
      );

      window.dispatchEvent(
        new Event("schedula-availability-updated")
      );

      setToast("Availability updated successfully.");
      setShowAvailability(false);
    } catch (err) {
      console.error(
        "Failed to save availability:",
        err
      );

      setError("Unable to save availability.");
    }
  }

  function createManualAppointment() {
    if (!doctor) return;

    setError("");

    if (!newAppointment.patientName.trim()) {
      setError("Patient name is required.");
      return;
    }

    if (!newAppointment.date) {
      setError("Appointment date is required.");
      return;
    }

    if (!newAppointment.time) {
      setError("Appointment time is required.");
      return;
    }

    if (
      !isWithinAvailability(newAppointment.time)
    ) {
      setError(
        "Appointment time must be within your availability."
      );

      return;
    }

    if (
      isPastSlot(
        newAppointment.date,
        newAppointment.time
      )
    ) {
      setError(
        "You cannot create an appointment in the past."
      );

      return;
    }

    if (
      hasConflict(
        newAppointment.date,
        newAppointment.time,
        ""
      )
    ) {
      setError(
        "This time slot is already booked."
      );

      return;
    }

    setSaving(true);

    const appointment: Appointment = {
      id: generateId("appointment"),
      doctorId: doctor.id,
      patientId: generateId("patient"),
      doctorName: doctor.name,
      patientName:
        newAppointment.patientName.trim(),
      patientEmail:
        newAppointment.patientEmail.trim(),
      patientPhone:
        newAppointment.patientPhone.trim(),
      date: newAppointment.date,
      time: newAppointment.time,
      type: newAppointment.type,
      status: "confirmed",
      reason: newAppointment.reason.trim(),
      notes: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const nextAppointments = [
      ...appointments,
      appointment,
    ];

    saveAppointments(nextAppointments);

    createNotification(
      appointment,
      "Appointment Confirmed",
      `Your appointment with ${doctor.name} is confirmed for ${formatDateShort(
        parseDateKey(appointment.date)
      )} at ${formatTime(appointment.time)}.`
    );

    setSaving(false);
    setShowAddAppointment(false);
    setToast("Appointment created successfully.");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc]">
        <Navbar />

        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200">
              <Loader2
                className="animate-spin text-white"
                size={25}
              />
            </div>

            <p className="text-sm font-medium text-slate-500">
              Loading calendar...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-[#f7f9fc]">
        <Navbar />

        <main className="flex min-h-[70vh] items-center justify-center px-6">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
              <Stethoscope
                size={28}
                className="text-blue-600"
              />
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              Doctor Login Required
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Please login as a doctor to access your
              appointment calendar.
            </p>

            <Link
              href="/doctor/login"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Go to Login
              <ChevronRight size={17} />
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-[1500px] px-4 pb-16 pt-7 sm:px-6 lg:px-8">
        {/* Header */}
        <section className="mb-7">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-600" />

                <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                  Doctor Portal
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Appointment Calendar
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Manage your schedule, availability and
                upcoming appointments from one calendar.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  setShowAvailability(true)
                }
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <Settings2 size={17} />
                Availability
              </button>

              <button
                onClick={() => {
                  setNewAppointment({
                    patientName: "",
                    patientEmail: "",
                    patientPhone: "",
                    date: formatDateKey(
                      selectedDate
                    ),
                    time: "09:00",
                    type: "In-Person",
                    reason: "",
                  });

                  setShowAddAppointment(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
              >
                <Plus size={18} />
                Add Appointment
              </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <CalendarDays size={19} />
              </div>

              <span className="text-2xl font-bold text-slate-900">
                {upcomingCount}
              </span>
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-700">
              Upcoming
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Clock3 size={19} />
              </div>

              <span className="text-2xl font-bold text-slate-900">
                {todayCount}
              </span>
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-700">
              Today
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <CheckCircle2 size={19} />
              </div>

              <span className="text-2xl font-bold text-slate-900">
                {completedCount}
              </span>
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-700">
              Completed
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  availability.enabled
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                <Settings2 size={19} />
              </div>

              <span
                className={`text-sm font-bold ${
                  availability.enabled
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {availability.enabled
                  ? "Available"
                  : "Offline"}
              </span>
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-700">
              Availability
            </p>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">
              <p className="font-semibold">
                Calendar action blocked
              </p>

              <p className="mt-0.5 text-red-600/80">
                {error}
              </p>
            </div>

            <button
              onClick={() => setError("")}
              className="text-red-500 hover:text-red-700"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Calendar */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {/* Calendar toolbar */}
          <div className="border-b border-slate-200 p-4 sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={goToday}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Today
                </button>

                <div className="flex items-center rounded-xl border border-slate-200">
                  <button
                    onClick={() => moveCalendar(-1)}
                    className="flex h-10 w-10 items-center justify-center text-slate-500 transition hover:bg-slate-50"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    onClick={() => moveCalendar(1)}
                    className="flex h-10 w-10 items-center justify-center border-l border-slate-200 text-slate-500 transition hover:bg-slate-50"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                <h2 className="ml-2 text-base font-bold text-slate-900 sm:text-lg">
                  {getHeaderTitle()}
                </h2>
              </div>

              <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
                {(
                  [
                    ["day", "Day"],
                    ["week", "Week"],
                    ["month", "Month"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() =>
                      setView(value)
                    }
                    className={`rounded-lg px-4 py-2 text-xs font-bold transition sm:text-sm ${
                      view === value
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {view === "month" ? (
            /* MONTH VIEW */
            <div className="overflow-x-auto">
              <div className="min-w-[850px]">
                <div className="grid grid-cols-7 border-b border-slate-200">
                  {[
                    "Sun",
                    "Mon",
                    "Tue",
                    "Wed",
                    "Thu",
                    "Fri",
                    "Sat",
                  ].map((day) => (
                    <div
                      key={day}
                      className="border-r border-slate-100 px-3 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-400 last:border-r-0"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7">
                  {monthDays.map((date) => {
                    const dayAppointments =
                      getAppointmentsForDate(date);

                    const isCurrentMonth =
                      date.getMonth() ===
                      selectedDate.getMonth();

                    const isToday =
                      isSameDay(
                        date,
                        new Date()
                      );

                    return (
                      <div
                        key={formatDateKey(date)}
                        onClick={() => {
                          setSelectedDate(date);
                          setView("day");
                        }}
                        className={`min-h-[145px] cursor-pointer border-b border-r border-slate-100 p-2 transition hover:bg-blue-50/40 ${
                          !isCurrentMonth
                            ? "bg-slate-50/60"
                            : "bg-white"
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                              isToday
                                ? "bg-blue-600 text-white"
                                : isCurrentMonth
                                ? "text-slate-700"
                                : "text-slate-300"
                            }`}
                          >
                            {date.getDate()}
                          </span>

                          {dayAppointments.length >
                            0 && (
                            <span className="text-[10px] font-bold text-slate-400">
                              {dayAppointments.length}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          {dayAppointments
                            .slice(0, 4)
                            .map(
                              (
                                appointment
                              ) => {
                                const style =
                                  getStatusStyle(
                                    appointment.status
                                  );

                                return (
                                  <button
                                    key={
                                      appointment.id
                                    }
                                    onClick={(
                                      event
                                    ) => {
                                      event.stopPropagation();

                                      setSelectedAppointment(
                                        appointment
                                      );
                                    }}
                                    className={`w-full rounded-lg border px-2 py-1.5 text-left ${style.bg} ${style.border} ${style.text}`}
                                  >
                                    <div className="flex items-center gap-1 text-[10px] font-bold">
                                      <Clock3
                                        size={
                                          10
                                        }
                                      />

                                      {formatTime(
                                        appointment.time
                                      )}
                                    </div>

                                    <p className="mt-0.5 truncate text-[11px] font-bold">
                                      {
                                        appointment.patientName
                                      }
                                    </p>
                                  </button>
                                );
                              }
                            )}

                          {dayAppointments.length >
                            4 && (
                            <p className="px-2 text-[10px] font-semibold text-slate-400">
                              +
                              {dayAppointments.length -
                                4}{" "}
                              more
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* DAY / WEEK VIEW */
            <div className="overflow-x-auto">
              <div
                className="min-w-[720px]"
                onDragEnd={handleDragEnd}
              >
                {/* Day headers */}
                <div
                  className="grid border-b border-slate-200"
                  style={{
                    gridTemplateColumns: `80px repeat(${visibleDates.length}, minmax(160px, 1fr))`,
                  }}
                >
                  <div className="border-r border-slate-100 bg-slate-50/70" />

                  {visibleDates.map((date) => {
                    const isToday =
                      isSameDay(
                        date,
                        new Date()
                      );

                    const dayAppointments =
                      getAppointmentsForDate(date);

                    return (
                      <div
                        key={formatDateKey(date)}
                        className={`border-r border-slate-100 px-3 py-4 text-center last:border-r-0 ${
                          isToday
                            ? "bg-blue-50/60"
                            : ""
                        }`}
                      >
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                          {date.toLocaleDateString(
                            "en-IN",
                            {
                              weekday:
                                "short",
                            }
                          )}
                        </p>

                        <div
                          className={`mx-auto mt-1 flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${
                            isToday
                              ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                              : "text-slate-800"
                          }`}
                        >
                          {date.getDate()}
                        </div>

                        <p className="mt-1 text-[10px] font-medium text-slate-400">
                          {dayAppointments.length}{" "}
                          appointment
                          {dayAppointments.length !==
                          1
                            ? "s"
                            : ""}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Time grid */}
                <div
                  className="relative"
                  style={{
                    maxHeight:
                      view === "day"
                        ? "680px"
                        : "680px",
                    overflowY: "auto",
                  }}
                >
                  {timeSlots.map((time) => (
                    <div
                      key={time}
                      className="grid"
                      style={{
                        gridTemplateColumns: `80px repeat(${visibleDates.length}, minmax(160px, 1fr))`,
                        minHeight: `${SLOT_HEIGHT}px`,
                      }}
                    >
                      {/* Time */}
                      <div className="border-b border-r border-slate-100 bg-slate-50/40 px-3 pt-2 text-right">
                        <span className="text-[11px] font-semibold text-slate-400">
                          {formatTime(time)}
                        </span>
                      </div>

                      {/* Date columns */}
                      {visibleDates.map((date) => {
                        const appointment =
                          getAppointmentForSlot(
                            date,
                            time
                          );

                        const dateKey =
                          formatDateKey(date);

                        const isPast =
                          isPastSlot(
                            dateKey,
                            time
                          );

                        const isUnavailable =
                          !availability.enabled ||
                          !isWithinAvailability(
                            time
                          );

                        const isDropTarget =
                          dragOverSlot?.date ===
                            dateKey &&
                          dragOverSlot?.time ===
                            time;

                        return (
                          <div
                            key={`${dateKey}-${time}`}
                            onClick={() =>
                              handleSlotClick(
                                date,
                                time
                              )
                            }
                            onDragOver={(event) =>
                              handleDragOver(
                                event,
                                date,
                                time
                              )
                            }
                            onDragLeave={() => {
                              if (
                                dragOverSlot
                              ) {
                                setDragOverSlot(
                                  null
                                );
                              }
                            }}
                            onDrop={(event) =>
                              handleDrop(
                                event,
                                date,
                                time
                              )
                            }
                            className={`relative border-b border-r border-slate-100 p-1 transition last:border-r-0 ${
                              isDropTarget
                                ? "bg-blue-100/80"
                                : isUnavailable
                                ? "bg-slate-50/70"
                                : isPast
                                ? "bg-slate-50/30"
                                : "bg-white hover:bg-blue-50/30"
                            }`}
                          >
                            {!appointment && (
                              <div className="pointer-events-none flex h-full items-center justify-center opacity-0 transition group-hover:opacity-100">
                                {!isPast &&
                                  !isUnavailable && (
                                    <Plus
                                      size={16}
                                      className="text-blue-300"
                                    />
                                  )}
                              </div>
                            )}

                            {appointment && (
                              <CalendarAppointment
                                appointment={
                                  appointment
                                }
                                onClick={() =>
                                  setSelectedAppointment(
                                    appointment
                                  )
                                }
                                onDragStart={() =>
                                  handleDragStart(
                                    appointment
                                  )
                                }
                                draggable={
                                  !isReadOnly(
                                    appointment.status
                                  )
                                }
                              />
                            )}

                            {isDropTarget && (
                              <div className="absolute inset-1 flex items-center justify-center rounded-lg border-2 border-dashed border-blue-400 bg-blue-50/80">
                                <span className="text-[10px] font-bold text-blue-600">
                                  Drop here
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}

                  {/* Current time line */}
                  {visibleDates.some(
                    (date) =>
                      isSameDay(
                        date,
                        new Date()
                      )
                  ) && (
                    <CurrentTimeLine
                      startTime={
                        availability.startTime
                      }
                      slotDuration={
                        availability.slotDuration
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 border-t border-slate-200 bg-slate-50/60 px-4 py-3 sm:px-5">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Status
            </span>

            {(
              [
                ["pending", "Pending"],
                ["confirmed", "Confirmed"],
                ["upcoming", "Upcoming"],
                ["completed", "Completed"],
                ["cancelled", "Cancelled"],
                ["missed", "Missed"],
              ] as const
            ).map(([status, label]) => {
              const style =
                getStatusStyle(status);

              return (
                <div
                  key={status}
                  className="flex items-center gap-1.5"
                >
                  <span
                    className={`h-2 w-2 rounded-full ${style.dot}`}
                  />

                  <span className="text-[11px] font-medium text-slate-500">
                    {label}
                  </span>
                </div>
              );
            })}

            <div className="ml-auto hidden items-center gap-2 text-[11px] text-slate-400 sm:flex">
              <GripVertical size={13} />
              Drag appointment to reschedule
            </div>
          </div>
        </section>

        {/* Bottom information */}
        <section className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <RefreshCw size={18} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-blue-950">
                  Rescheduling
                </h3>

                <p className="mt-1 text-xs leading-5 text-blue-800/70">
                  Drag a pending, confirmed or upcoming
                  appointment to another available slot.
                  Completed, cancelled and missed
                  appointments remain read-only.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <CheckCircle2 size={18} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-emerald-950">
                  Double-booking protection
                </h3>

                <p className="mt-1 text-xs leading-5 text-emerald-800/70">
                  Calendar slots are checked before an
                  appointment is created or rescheduled,
                  preventing two active appointments from
                  using the same time.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={() =>
            setSelectedAppointment(null)
          }
        >
          <div
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                  Calendar Appointment
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Appointment Details
                </h2>
              </div>

              <button
                onClick={() =>
                  setSelectedAppointment(null)
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-7">
              <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white">
                  {getInitials(
                    selectedAppointment.patientName
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Patient
                  </p>

                  <h3 className="mt-1 text-lg font-bold text-slate-900">
                    {selectedAppointment.patientName}
                  </h3>

                  {selectedAppointment.patientEmail && (
                    <p className="mt-0.5 text-sm text-slate-500">
                      {
                        selectedAppointment.patientEmail
                      }
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <CalendarDays
                    size={18}
                    className="text-blue-600"
                  />

                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Date
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {formatDateLong(
                      parseDateKey(
                        selectedAppointment.date
                      )
                    )}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <Clock3
                    size={18}
                    className="text-blue-600"
                  />

                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Time
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {formatTime(
                      selectedAppointment.time
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                    getStatusStyle(
                      selectedAppointment.status
                    ).bg
                  } ${
                    getStatusStyle(
                      selectedAppointment.status
                    ).text
                  } ${
                    getStatusStyle(
                      selectedAppointment.status
                    ).border
                  }`}
                >
                  {getStatusLabel(
                    selectedAppointment.status
                  )}
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  {selectedAppointment.type}
                </span>
              </div>

              {selectedAppointment.reason && (
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Reason
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {selectedAppointment.reason}
                  </p>
                </div>
              )}

              {selectedAppointment.notes && (
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Notes
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row">
                <Link
                  href="/doctor/appointments"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                  onClick={() =>
                    setSelectedAppointment(null)
                  }
                >
                  Manage Appointment
                  <ChevronRight size={16} />
                </Link>

                {!isReadOnly(
                  selectedAppointment.status
                ) && (
                  <button
                    onClick={() => {
                      setSelectedAppointment(null);

                      setNewAppointment({
                        patientName:
                          selectedAppointment.patientName,
                        patientEmail:
                          selectedAppointment.patientEmail ||
                          "",
                        patientPhone:
                          selectedAppointment.patientPhone ||
                          "",
                        date:
                          selectedAppointment.date,
                        time:
                          selectedAppointment.time,
                        type:
                          selectedAppointment.type,
                        reason:
                          selectedAppointment.reason ||
                          "",
                      });

                      setShowAddAppointment(true);
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    <RefreshCw size={16} />
                    Reschedule
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Availability Modal */}
      {showAvailability && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={() =>
            setShowAvailability(false)
          }
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                  Schedule Settings
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Doctor Availability
                </h2>
              </div>

              <button
                onClick={() =>
                  setShowAvailability(false)
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-7">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Accept appointments
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Enable or disable your booking
                    availability.
                  </p>
                </div>

                <button
                  onClick={() =>
                    handleAvailabilityChange(
                      "enabled",
                      !availability.enabled
                    )
                  }
                  className={`relative h-7 w-12 rounded-full transition ${
                    availability.enabled
                      ? "bg-blue-600"
                      : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                      availability.enabled
                        ? "left-6"
                        : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Start Time
                  </span>

                  <input
                    type="time"
                    value={availability.startTime}
                    onChange={(event) =>
                      handleAvailabilityChange(
                        "startTime",
                        event.target.value
                      )
                    }
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    End Time
                  </span>

                  <input
                    type="time"
                    value={availability.endTime}
                    onChange={(event) =>
                      handleAvailabilityChange(
                        "endTime",
                        event.target.value
                      )
                    }
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </label>
              </div>

              <label>
                <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                  Consultation Duration
                </span>

                <select
                  value={
                    availability.slotDuration
                  }
                  onChange={(event) =>
                    handleAvailabilityChange(
                      "slotDuration",
                      Number(event.target.value)
                    )
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                >
                  <option value={15}>
                    15 minutes
                  </option>
                  <option value={30}>
                    30 minutes
                  </option>
                  <option value={45}>
                    45 minutes
                  </option>
                  <option value={60}>
                    60 minutes
                  </option>
                </select>
              </label>

              <div className="rounded-2xl bg-blue-50 p-4">
                <p className="text-xs font-bold text-blue-900">
                  Current schedule
                </p>

                <p className="mt-1 text-sm text-blue-700">
                  {formatTime(
                    availability.startTime
                  )}{" "}
                  –{" "}
                  {formatTime(
                    availability.endTime
                  )}{" "}
                  · {availability.slotDuration} minute
                  slots
                </p>
              </div>

              <button
                onClick={saveAvailability}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
              >
                <Save size={17} />
                Save Availability
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Appointment Modal */}
      {showAddAppointment && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={() =>
            setShowAddAppointment(false)
          }
        >
          <div
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                  Calendar
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Add Appointment
                </h2>
              </div>

              <button
                onClick={() =>
                  setShowAddAppointment(false)
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-7">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Patient Name *
                  </span>

                  <div className="relative">
                    <UserRound
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      value={
                        newAppointment.patientName
                      }
                      onChange={(event) =>
                        setNewAppointment(
                          (current) => ({
                            ...current,
                            patientName:
                              event.target.value,
                          })
                        )
                      }
                      placeholder="Enter patient name"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                </label>

                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Email
                  </span>

                  <input
                    type="email"
                    value={
                      newAppointment.patientEmail
                    }
                    onChange={(event) =>
                      setNewAppointment(
                        (current) => ({
                          ...current,
                          patientEmail:
                            event.target.value,
                        })
                      )
                    }
                    placeholder="patient@email.com"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Phone
                  </span>

                  <input
                    type="tel"
                    value={
                      newAppointment.patientPhone
                    }
                    onChange={(event) =>
                      setNewAppointment(
                        (current) => ({
                          ...current,
                          patientPhone:
                            event.target.value,
                        })
                      )
                    }
                    placeholder="Phone number"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Date *
                  </span>

                  <input
                    type="date"
                    value={
                      newAppointment.date
                    }
                    onChange={(event) =>
                      setNewAppointment(
                        (current) => ({
                          ...current,
                          date: event.target.value,
                        })
                      )
                    }
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Time *
                  </span>

                  <input
                    type="time"
                    value={
                      newAppointment.time
                    }
                    onChange={(event) =>
                      setNewAppointment(
                        (current) => ({
                          ...current,
                          time: event.target.value,
                        })
                      )
                    }
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Appointment Type
                  </span>

                  <select
                    value={
                      newAppointment.type
                    }
                    onChange={(event) =>
                      setNewAppointment(
                        (current) => ({
                          ...current,
                          type: event.target.value,
                        })
                      )
                    }
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  >
                    <option>
                      In-Person
                    </option>
                    <option>
                      Video Consultation
                    </option>
                    <option>
                      Phone Consultation
                    </option>
                  </select>
                </label>

                <label className="sm:col-span-2">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Reason for Visit
                  </span>

                  <textarea
                    rows={3}
                    value={
                      newAppointment.reason
                    }
                    onChange={(event) =>
                      setNewAppointment(
                        (current) => ({
                          ...current,
                          reason: event.target.value,
                        })
                      )
                    }
                    placeholder="Describe the reason for the appointment..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </label>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-bold text-blue-900">
                  Appointment slot
                </p>

                <p className="mt-1 text-sm text-blue-700">
                  {formatDateLong(
                    parseDateKey(
                      newAppointment.date
                    )
                  )}{" "}
                  at{" "}
                  {formatTime(
                    newAppointment.time
                  )}
                </p>
              </div>

              <button
                onClick={
                  createManualAppointment
                }
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Creating...
                  </>
                ) : (
                  <>
                    <CalendarDays size={17} />
                    Create Appointment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[200] flex max-w-sm items-center gap-3 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-2xl">
          <CheckCircle2
            size={18}
            className="text-emerald-400"
          />

          {toast}
        </div>
      )}
    </div>
  );
}

function CalendarAppointment({
  appointment,
  onClick,
  onDragStart,
  draggable,
}: {
  appointment: Appointment;
  onClick: () => void;
  onDragStart: () => void;
  draggable: boolean;
}) {
  const style = getStatusStyle(
    appointment.status
  );

  return (
    <div
      draggable={draggable}
      onDragStart={(event) => {
        if (!draggable) {
          event.preventDefault();
          return;
        }

        onDragStart();
      }}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={`group relative h-full min-h-[54px] cursor-pointer rounded-xl border p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${style.bg} ${style.border}`}
    >
      {draggable && (
        <GripVertical
          size={13}
          className="absolute right-1 top-2 text-slate-300 opacity-0 transition group-hover:opacity-100"
        />
      )}

      <div className="flex items-center gap-1.5">
        <span
          className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
        />

        <span
          className={`text-[10px] font-bold ${style.text}`}
        >
          {formatTime(appointment.time)}
        </span>
      </div>

      <p className="mt-1 truncate text-xs font-bold text-slate-800">
        {appointment.patientName}
      </p>

      <div className="mt-1 flex items-center gap-1 text-[9px] font-medium text-slate-500">
        {getAppointmentIcon(
          appointment.type
        )}

        <span className="truncate">
          {appointment.type}
        </span>
      </div>
    </div>
  );
}

function CurrentTimeLine({
  startTime,
  slotDuration,
}: {
  startTime: string;
  slotDuration: number;
}) {
  const now = new Date();

  const currentMinutes =
    now.getHours() * 60 + now.getMinutes();

  const startMinutes =
    timeToMinutes(startTime);

  const difference =
    currentMinutes - startMinutes;

  if (difference < 0) {
    return null;
  }

  const slotIndex =
    difference / slotDuration;

  const top =
    slotIndex * SLOT_HEIGHT + 0;

  return (
    <div
      className="pointer-events-none absolute left-[80px] right-0 z-20"
      style={{
        top: `${top}px`,
      }}
    >
      <div className="relative">
        <span className="absolute -left-1.5 top-[-3px] h-2.5 w-2.5 rounded-full bg-red-500" />

        <div className="h-px bg-red-400/80" />
      </div>
    </div>
  );
}