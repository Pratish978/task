"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Bell,
  Check,
  CheckCheck,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  Clock3,
  CircleAlert,
  Search,
  Trash2,
  X,
  Info,
  ArrowRight,
  Sparkles,
} from "lucide-react";

type Doctor = {
  id: string;
  name: string;
  email: string;
};

type Notification = {
  id: string;
  userId?: string;
  doctorId?: string;
  patientId?: string;
  recipientId?: string;
  role?: string;
  type?: string;
  title?: string;
  message?: string;
  appointmentId?: string;
  read?: boolean;
  createdAt?: string;
};

const KEY = "schedula_notifications";

function getType(notification: Notification) {
  const value = `${notification.type || ""} ${
    notification.title || ""
  }`.toLowerCase();

  if (value.includes("reschedul")) return "rescheduled";
  if (value.includes("cancel")) return "cancelled";
  if (value.includes("confirm")) return "confirmed";
  if (value.includes("missed")) return "missed";
  if (value.includes("reminder")) return "reminder";
  if (value.includes("complete")) return "completed";
  if (value.includes("booking") || value.includes("book"))
    return "booking";

  return "general";
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

    default:
      return <Info size={21} />;
  }
}

function getLabel(type: string) {
  const labels: Record<string, string> = {
    booking: "New Booking",
    confirmed: "Confirmed",
    rescheduled: "Rescheduled",
    cancelled: "Cancelled",
    reminder: "Reminder",
    missed: "Missed",
    completed: "Completed",
    general: "Notification",
  };

  return labels[type] || "Notification";
}

function getClass(type: string) {
  switch (type) {
    case "booking":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "confirmed":
    case "completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "rescheduled":
      return "bg-violet-50 text-violet-700 border-violet-200";

    case "cancelled":
    case "missed":
      return "bg-red-50 text-red-700 border-red-200";

    case "reminder":
      return "bg-amber-50 text-amber-700 border-amber-200";

    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
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

  return value.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DoctorNotificationsPage() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const [selected, setSelected] =
    useState<Notification | null>(null);

  useEffect(() => {
    loadData();

    const refresh = () => loadData();

    window.addEventListener("storage", refresh);
    window.addEventListener("schedula-notifications-updated", refresh);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(
        "schedula-notifications-updated",
        refresh
      );
    };
  }, []);

  const loadData = () => {
    try {
      const session =
        localStorage.getItem("clinician_session") ||
        localStorage.getItem("schedula_current_doctor");

      if (!session) {
        setLoading(false);
        return;
      }

      const currentDoctor = JSON.parse(session);
      setDoctor(currentDoctor);

      const all = JSON.parse(
        localStorage.getItem(KEY) || "[]"
      );

      const doctorNotifications = all.filter(
        (item: Notification) =>
          item.doctorId === currentDoctor.id ||
          item.userId === currentDoctor.id ||
          item.recipientId === currentDoctor.id ||
          (item.role === "doctor" &&
            item.userId === currentDoctor.id)
      );

      doctorNotifications.sort(
        (a: Notification, b: Notification) =>
          new Date(b.createdAt || "").getTime() -
          new Date(a.createdAt || "").getTime()
      );

      setNotifications(doctorNotifications);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter(
    (item) => !item.read
  ).length;

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return notifications.filter((item) => {
      const type = getType(item);

      const matchesFilter =
        filter === "all" ||
        (filter === "unread" && !item.read) ||
        (filter === "read" && item.read);

      const matchesCategory =
        category === "all" || type === category;

      const matchesSearch =
        !query ||
        `${item.title || ""} ${item.message || ""}`
          .toLowerCase()
          .includes(query);

      return (
        matchesFilter &&
        matchesCategory &&
        matchesSearch
      );
    });
  }, [notifications, filter, category, search]);

  const persist = (updated: Notification[]) => {
    try {
      const all = JSON.parse(
        localStorage.getItem(KEY) || "[]"
      );

      const result = all.map((item: Notification) => {
        const replacement = updated.find(
          (notification) => notification.id === item.id
        );

        return replacement || item;
      });

      localStorage.setItem(KEY, JSON.stringify(result));

      setNotifications(updated);

      window.dispatchEvent(
        new Event("schedula-notifications-updated")
      );
    } catch {
      // Ignore
    }
  };

  const markRead = (id: string) => {
    persist(
      notifications.map((item) =>
        item.id === id ? { ...item, read: true } : item
      )
    );
  };

  const markAllRead = () => {
    persist(
      notifications.map((item) => ({
        ...item,
        read: true,
      }))
    );
  };

  const remove = (id: string) => {
    try {
      const all = JSON.parse(
        localStorage.getItem(KEY) || "[]"
      );

      const updatedAll = all.filter(
        (item: Notification) => item.id !== id
      );

      localStorage.setItem(KEY, JSON.stringify(updatedAll));

      const updated = notifications.filter(
        (item) => item.id !== id
      );

      setNotifications(updated);

      if (selected?.id === id) {
        setSelected(null);
      }

      window.dispatchEvent(
        new Event("schedula-notifications-updated")
      );
    } catch {
      // Ignore
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
              <Sparkles size={14} />
              Doctor Center
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Notifications
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Monitor bookings, appointment changes and patient
              activity.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
            >
              <CheckCheck size={17} />
              Mark all as read
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-500">
              Total
            </p>
            <p className="mt-1 text-2xl font-bold">
              {notifications.length}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-xs font-medium text-blue-600">
              Unread
            </p>
            <p className="mt-1 text-2xl font-bold text-blue-700">
              {unreadCount}
            </p>
          </div>

          <div className="col-span-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 sm:col-span-1">
            <p className="text-xs font-medium text-emerald-600">
              Inbox
            </p>

            <p className="mt-1 text-lg font-bold text-emerald-700">
              {unreadCount === 0
                ? "All caught up"
                : "Action required"}
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto">
              {["all", "unread", "read"].map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold ${
                    filter === item
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600"
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
              <option value="booking">New Booking</option>
              <option value="confirmed">Confirmed</option>
              <option value="rescheduled">Rescheduled</option>
              <option value="cancelled">Cancelled</option>
              <option value="reminder">Reminder</option>
              <option value="missed">Missed</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="rounded-3xl bg-white p-16 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
            <Bell
              size={44}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-4 text-lg font-bold">
              No notifications
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              New patient bookings and appointment updates will
              appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((notification) => {
              const type = getType(notification);

              return (
                <div
                  key={notification.id}
                  className={`rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md ${
                    notification.read
                      ? "border-slate-200"
                      : "border-violet-200 bg-violet-50/20"
                  }`}
                >
                  <div className="flex gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                        notification.read
                          ? "bg-slate-100 text-slate-500"
                          : "bg-violet-100 text-violet-700"
                      }`}
                    >
                      {getIcon(type)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold">
                              {notification.title ||
                                "Notification"}
                            </h3>

                            {!notification.read && (
                              <span className="h-2 w-2 rounded-full bg-violet-600" />
                            )}
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getClass(
                                type
                              )}`}
                            >
                              {getLabel(type)}
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
                                markRead(notification.id)
                              }
                              title="Mark as read"
                              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                            >
                              <Check size={17} />
                            </button>
                          )}

                          <button
                            onClick={() =>
                              remove(notification.id)
                            }
                            title="Delete"
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
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
                            markRead(notification.id);
                          }

                          setSelected(notification);
                        }}
                        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-600"
                      >
                        View details
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  {getIcon(getType(selected))}
                </div>

                <div>
                  <h2 className="font-bold">
                    {selected.title || "Notification"}
                  </h2>

                  <p className="text-xs text-slate-400">
                    {formatDate(selected.createdAt)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <span
                className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${getClass(
                  getType(selected)
                )}`}
              >
                {getLabel(getType(selected))}
              </span>

              <p className="mt-5 text-sm leading-7 text-slate-600">
                {selected.message ||
                  "No additional details available."}
              </p>

              {selected.appointmentId && (
                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Appointment ID
                  </p>

                  <p className="mt-1 break-all text-sm font-medium">
                    {selected.appointmentId}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-100 p-4">
              <button
                onClick={() => setSelected(null)}
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