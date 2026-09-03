"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Clock3,
  FileText,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  CircleAlert,
  Search,
  Trash2,
  X,
  Info,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

type Patient = {
  id: string;
  name: string;
  email: string;
};

type Notification = {
  id: string;
  userId?: string;
  patientId?: string;
  doctorId?: string;
  recipientId?: string;
  role?: string;
  type?: string;
  title?: string;
  message?: string;
  appointmentId?: string;
  read?: boolean;
  createdAt?: string;
};

const NOTIFICATION_KEY = "schedula_notifications";

function getNotificationType(notification: Notification) {
  const type = `${notification.type || ""} ${
    notification.title || ""
  }`.toLowerCase();

  if (type.includes("prescription")) return "prescription";
  if (type.includes("reschedul")) return "rescheduled";
  if (type.includes("cancel")) return "cancelled";
  if (type.includes("confirm")) return "confirmed";
  if (type.includes("missed")) return "missed";
  if (type.includes("complete")) return "completed";
  if (type.includes("reminder")) return "reminder";
  if (type.includes("booking") || type.includes("book")) return "booking";

  return "general";
}

function formatDate(date?: string) {
  if (!date) return "Recently";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return "Recently";

  const now = new Date();

  const sameDay =
    value.getDate() === now.getDate() &&
    value.getMonth() === now.getMonth() &&
    value.getFullYear() === now.getFullYear();

  if (sameDay) {
    return `Today • ${value.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    value.getDate() === yesterday.getDate() &&
    value.getMonth() === yesterday.getMonth() &&
    value.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `Yesterday • ${value.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  return value.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getIcon(type: string) {
  switch (type) {
    case "booking":
      return <CalendarCheck size={21} />;

    case "confirmed":
      return <CheckCheck size={21} />;

    case "rescheduled":
      return <CalendarClock size={21} />;

    case "cancelled":
      return <CalendarX size={21} />;

    case "reminder":
      return <Clock3 size={21} />;

    case "missed":
      return <CircleAlert size={21} />;

    case "completed":
      return <Check size={21} />;

    case "prescription":
      return <FileText size={21} />;

    default:
      return <Info size={21} />;
  }
}

function getTypeLabel(type: string) {
  switch (type) {
    case "booking":
      return "Booking";

    case "confirmed":
      return "Confirmed";

    case "rescheduled":
      return "Rescheduled";

    case "cancelled":
      return "Cancelled";

    case "reminder":
      return "Reminder";

    case "missed":
      return "Missed";

    case "completed":
      return "Completed";

    case "prescription":
      return "Prescription";

    default:
      return "Notification";
  }
}

function getTypeClass(type: string) {
  switch (type) {
    case "confirmed":
    case "completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "booking":
    case "reminder":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "rescheduled":
      return "bg-violet-50 text-violet-700 border-violet-200";

    case "prescription":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "cancelled":
    case "missed":
      return "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

export default function PatientNotificationsPage() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState("all");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  useEffect(() => {
    try {
      const session =
        localStorage.getItem("patient_session") ||
        localStorage.getItem("schedula_current_patient");

      if (session) {
        const parsed = JSON.parse(session);
        setPatient(parsed);
      }

      loadNotifications();
    } finally {
      setLoading(false);
    }

    const refresh = () => loadNotifications();

    window.addEventListener("storage", refresh);
    window.addEventListener("schedula-notifications-updated", refresh);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("schedula-notifications-updated", refresh);
    };
  }, []);

  const loadNotifications = () => {
    try {
      const session =
        localStorage.getItem("patient_session") ||
        localStorage.getItem("schedula_current_patient");

      if (!session) return;

      const currentPatient = JSON.parse(session);

      const stored = JSON.parse(
        localStorage.getItem(NOTIFICATION_KEY) || "[]"
      );

      const patientNotifications = stored.filter((item: Notification) => {
        return (
          item.patientId === currentPatient.id ||
          item.userId === currentPatient.id ||
          item.recipientId === currentPatient.id ||
          (item.role === "patient" &&
            item.userId === currentPatient.id)
        );
      });

      patientNotifications.sort((a: Notification, b: Notification) => {
        return (
          new Date(b.createdAt || "").getTime() -
          new Date(a.createdAt || "").getTime()
        );
      });

      setNotifications(patientNotifications);
    } catch {
      setNotifications([]);
    }
  };

  const unreadCount = notifications.filter((item) => !item.read).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const type = getNotificationType(notification);

      const matchesRead =
        filter === "all" ||
        (filter === "unread" && !notification.read) ||
        (filter === "read" && notification.read);

      const matchesCategory =
        category === "all" || type === category;

      const query = search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        `${notification.title || ""} ${notification.message || ""}`
          .toLowerCase()
          .includes(query);

      return matchesRead && matchesCategory && matchesSearch;
    });
  }, [notifications, filter, category, search]);

  const saveNotifications = (updated: Notification[]) => {
    try {
      const all = JSON.parse(
        localStorage.getItem(NOTIFICATION_KEY) || "[]"
      );

      const updatedIds = new Set(updated.map((item) => item.id));

      const merged = all.map((item: Notification) => {
        const replacement = updated.find(
          (notification) => notification.id === item.id
        );

        return replacement || item;
      });

      localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(merged));

      window.dispatchEvent(
        new Event("schedula-notifications-updated")
      );

      setNotifications(updated);
    } catch {
      // Ignore storage errors
    }
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map((item) =>
      item.id === id ? { ...item, read: true } : item
    );

    saveNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map((item) => ({
      ...item,
      read: true,
    }));

    saveNotifications(updated);
  };

  const deleteNotification = (id: string) => {
    try {
      const all = JSON.parse(
        localStorage.getItem(NOTIFICATION_KEY) || "[]"
      );

      const updatedAll = all.filter(
        (item: Notification) => item.id !== id
      );

      localStorage.setItem(
        NOTIFICATION_KEY,
        JSON.stringify(updatedAll)
      );

      const updatedCurrent = notifications.filter(
        (item) => item.id !== id
      );

      setNotifications(updatedCurrent);

      window.dispatchEvent(
        new Event("schedula-notifications-updated")
      );

      if (selectedNotification?.id === id) {
        setSelectedNotification(null);
      }
    } catch {
      // Ignore
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              <Sparkles size={14} />
              Patient Center
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Notifications
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
              Stay updated about your appointments, prescriptions,
              reminders and important healthcare activity.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <CheckCheck size={17} />
              Mark all as read
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500">
              Total
            </p>
            <p className="mt-1 text-2xl font-bold">
              {notifications.length}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs font-medium text-blue-600">
              Unread
            </p>
            <p className="mt-1 text-2xl font-bold text-blue-700">
              {unreadCount}
            </p>
          </div>

          <div className="col-span-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 sm:col-span-1">
            <p className="text-xs font-medium text-emerald-600">
              Status
            </p>
            <p className="mt-1 text-lg font-bold text-emerald-700">
              {unreadCount === 0 ? "All caught up" : "Needs attention"}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notifications..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto">
              {["all", "unread", "read"].map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    filter === item
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </button>
              ))}
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:border-blue-500"
            >
              <option value="all">All categories</option>
              <option value="booking">Booking</option>
              <option value="confirmed">Confirmed</option>
              <option value="rescheduled">Rescheduled</option>
              <option value="cancelled">Cancelled</option>
              <option value="reminder">Reminder</option>
              <option value="missed">Missed</option>
              <option value="completed">Completed</option>
              <option value="prescription">Prescription</option>
            </select>
          </div>
        </div>

        {/* Notifications */}
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
            <p className="mt-4 text-sm text-slate-500">
              Loading notifications...
            </p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <Bell size={28} className="text-slate-400" />
            </div>

            <h2 className="mt-5 text-lg font-bold">
              No notifications found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {search || filter !== "all" || category !== "all"
                ? "Try changing your filters or search query."
                : "You are all caught up. New appointment and prescription updates will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const type = getNotificationType(notification);

              return (
                <div
                  key={notification.id}
                  className={`group rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md ${
                    notification.read
                      ? "border-slate-200"
                      : "border-blue-200 bg-blue-50/30"
                  }`}
                >
                  <div className="flex gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                        notification.read
                          ? "bg-slate-100 text-slate-600"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {getIcon(type)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-slate-900">
                              {notification.title || "Notification"}
                            </h3>

                            {!notification.read && (
                              <span className="h-2 w-2 rounded-full bg-blue-600" />
                            )}
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${getTypeClass(
                                type
                              )}`}
                            >
                              {getTypeLabel(type)}
                            </span>

                            <span className="text-xs text-slate-400">
                              {formatDate(notification.createdAt)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <button
                              onClick={() =>
                                markAsRead(notification.id)
                              }
                              title="Mark as read"
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-blue-600"
                            >
                              <Check size={17} />
                            </button>
                          )}

                          <button
                            onClick={() =>
                              deleteNotification(notification.id)
                            }
                            title="Delete"
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>

                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                        {notification.message ||
                          "You have a new notification."}
                      </p>

                      <button
                        onClick={() => {
                          if (!notification.read) {
                            markAsRead(notification.id);
                          }

                          setSelectedNotification(notification);
                        }}
                        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        View details
                        <ArrowLeft
                          size={14}
                          className="rotate-180"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Details Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  {getIcon(
                    getNotificationType(selectedNotification)
                  )}
                </div>

                <div>
                  <h2 className="font-bold">
                    {selectedNotification.title ||
                      "Notification"}
                  </h2>

                  <p className="text-xs text-slate-400">
                    {formatDate(selectedNotification.createdAt)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedNotification(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <span
                className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${getTypeClass(
                  getNotificationType(selectedNotification)
                )}`}
              >
                {getTypeLabel(
                  getNotificationType(selectedNotification)
                )}
              </span>

              <p className="mt-5 text-sm leading-7 text-slate-600">
                {selectedNotification.message ||
                  "No additional information is available."}
              </p>

              {selectedNotification.appointmentId && (
                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Appointment ID
                  </p>

                  <p className="mt-1 break-all text-sm font-medium text-slate-700">
                    {selectedNotification.appointmentId}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-100 p-4">
              <button
                onClick={() => setSelectedNotification(null)}
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