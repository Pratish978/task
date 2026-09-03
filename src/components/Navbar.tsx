"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type UserRole = "doctor" | "patient" | null;

interface SessionUser {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}

export default function Navbar() {
  const [role, setRole] = useState<UserRole>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const detectUser = () => {
      try {
        const doctorSession = localStorage.getItem("clinician_session");
        const patientSession = localStorage.getItem("patient_session");

        if (doctorSession) {
          const doctor = JSON.parse(doctorSession);

          setRole("doctor");
          setUser({
            ...doctor,
            role: "doctor",
          });
          return;
        }

        if (patientSession) {
          const patient = JSON.parse(patientSession);

          setRole("patient");
          setUser({
            ...patient,
            role: "patient",
          });
          return;
        }

        setRole(null);
        setUser(null);
      } catch (error) {
        console.error("Failed to detect session:", error);
      }
    };

    detectUser();

    window.addEventListener("storage", detectUser);

    return () => {
      window.removeEventListener("storage", detectUser);
    };
  }, []);

  useEffect(() => {
    const calculateNotifications = () => {
      try {
        const notifications = localStorage.getItem(
          "schedula_notifications"
        );

        if (!notifications) {
          setNotificationCount(0);
          return;
        }

        const parsed = JSON.parse(notifications);

        if (Array.isArray(parsed)) {
          const unread = parsed.filter(
            (notification: any) => !notification.read
          );

          setNotificationCount(unread.length);
        }
      } catch {
        setNotificationCount(0);
      }
    };

    calculateNotifications();

    window.addEventListener(
      "schedula-notifications-updated",
      calculateNotifications
    );

    return () => {
      window.removeEventListener(
        "schedula-notifications-updated",
        calculateNotifications
      );
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("clinician_session");
    localStorage.removeItem("schedula_current_doctor");

    localStorage.removeItem("patient_session");
    localStorage.removeItem("schedula_current_patient");

    document.cookie =
      "clinician_session=; path=/; max-age=0";

    document.cookie =
      "patient_session=; path=/; max-age=0";

    setRole(null);
    setUser(null);
    setProfileOpen(false);
    setMobileOpen(false);

    window.location.href = "/";
  };

  const doctorLinks = [
    {
      label: "Dashboard",
      href: "/doctor/dashboard",
      icon: "⌂",
    },
    {
      label: "Calendar",
      href: "/doctor/calendar",
      icon: "▦",
    },
    {
      label: "Appointments",
      href: "/doctor/appointments",
      icon: "◷",
    },
    {
      label: "Prescriptions",
      href: "/doctor/prescriptions",
      icon: "✚",
    },
  ];

  const patientLinks = [
    {
      label: "My Appointments",
      href: "/patient/appointments",
      icon: "◷",
    },
    {
      label: "Completed",
      href: "/patient/completed",
      icon: "✓",
    },
    {
      label: "Prescriptions",
      href: "/patient/prescriptions",
      icon: "✚",
    },
  ];

  const links =
    role === "doctor"
      ? doctorLinks
      : role === "patient"
      ? patientLinks
      : [];

  const profileHref =
    role === "doctor"
      ? "/doctor/profile"
      : "/patient/profile";

  const notificationsHref =
    role === "doctor"
      ? "/doctor/notifications"
      : "/patient/notifications";

  return (
    <>
      <header className="sticky top-0 z-50 px-3 sm:px-5 pt-3">
        <div className="max-w-7xl mx-auto">
          <nav className="relative bg-white/85 backdrop-blur-2xl border border-white/80 shadow-[0_12px_45px_rgba(15,23,42,0.08)] rounded-3xl">
            <div className="h-[72px] px-4 sm:px-6 flex items-center justify-between">

              {/* ================= LOGO ================= */}

              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 group shrink-0"
              >
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                    <span className="text-xl font-black">
                      S
                    </span>
                  </div>

                  <span className="absolute -right-1 -bottom-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                </div>

                <div className="hidden sm:block">
                  <h1 className="text-xl font-black tracking-tight text-slate-900">
                    Schedula
                  </h1>

                  <p className="text-[9px] uppercase tracking-[0.18em] font-black text-slate-400">
                    Healthcare OS
                  </p>
                </div>
              </Link>

              {/* ================= DESKTOP NAV ================= */}

              {role && (
                <div className="hidden lg:flex items-center gap-1 mx-8">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
                    >
                      <span className="text-base opacity-70 group-hover:opacity-100">
                        {link.icon}
                      </span>

                      {link.label}
                    </Link>
                  ))}
                </div>
              )}

              {/* ================= RIGHT SIDE ================= */}

              <div className="flex items-center gap-2">

                {/* Login when no session */}

                {!role && (
                  <>
                    <Link
                      href="/doctor/login"
                      className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-100 transition"
                    >
                      Sign In
                    </Link>

                    <Link
                      href="/doctor/register"
                      className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs font-black shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition"
                    >
                      <span>Get Started</span>
                      <span>→</span>
                    </Link>
                  </>
                )}

                {/* Notification */}

                {role && (
                  <Link
                    href={notificationsHref}
                    className="relative w-11 h-11 rounded-xl flex items-center justify-center text-lg text-slate-600 hover:bg-slate-100 transition"
                    aria-label="Notifications"
                  >
                    🔔

                    {notificationCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-white">
                        {notificationCount > 9
                          ? "9+"
                          : notificationCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* ================= PROFILE ================= */}

                {role && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setProfileOpen(!profileOpen)
                      }
                      className="flex items-center gap-2 p-1.5 pl-2 rounded-2xl hover:bg-slate-100 transition"
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm ${
                          role === "doctor"
                            ? "bg-gradient-to-br from-blue-600 to-violet-600"
                            : "bg-gradient-to-br from-emerald-500 to-cyan-600"
                        }`}
                      >
                        {user?.name
                          ? user.name.charAt(0).toUpperCase()
                          : role === "doctor"
                          ? "D"
                          : "P"}
                      </div>

                      <div className="hidden xl:block text-left max-w-[130px]">
                        <p className="text-xs font-black text-slate-800 truncate">
                          {user?.name || "User"}
                        </p>

                        <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
                          {role === "doctor"
                            ? "Doctor"
                            : "Patient"}
                        </p>
                      </div>

                      <span className="hidden xl:block text-xs text-slate-400">
                        ▾
                      </span>
                    </button>

                    {profileOpen && (
                      <div className="absolute right-0 top-[58px] w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-black ${
                                role === "doctor"
                                  ? "bg-gradient-to-br from-blue-600 to-violet-600"
                                  : "bg-gradient-to-br from-emerald-500 to-cyan-600"
                              }`}
                            >
                              {user?.name
                                ? user.name
                                    .charAt(0)
                                    .toUpperCase()
                                : "U"}
                            </div>

                            <div className="min-w-0">
                              <p className="font-black text-sm text-slate-900 truncate">
                                {user?.name || "User"}
                              </p>

                              <p className="text-[10px] text-slate-500 truncate">
                                {user?.email || ""}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-2">
                          <Link
                            href={profileHref}
                            onClick={() =>
                              setProfileOpen(false)
                            }
                            className="flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                          >
                            <span>👤</span>
                            My Profile
                          </Link>

                          <Link
                            href={notificationsHref}
                            onClick={() =>
                              setProfileOpen(false)
                            }
                            className="flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                          >
                            <span>🔔</span>
                            Notifications

                            {notificationCount > 0 && (
                              <span className="ml-auto px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 text-[9px] font-black">
                                {notificationCount}
                              </span>
                            )}
                          </Link>

                          <div className="h-px bg-slate-100 my-2" />

                          <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                          >
                            <span>↪</span>
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ================= MOBILE MENU ================= */}

                {role && (
                  <button
                    type="button"
                    onClick={() =>
                      setMobileOpen(!mobileOpen)
                    }
                    className="lg:hidden w-11 h-11 rounded-xl flex items-center justify-center bg-slate-100 text-slate-700"
                    aria-label="Open navigation menu"
                  >
                    {mobileOpen ? "✕" : "☰"}
                  </button>
                )}
              </div>
            </div>

            {/* ================= MOBILE NAV ================= */}

            {mobileOpen && role && (
              <div className="lg:hidden border-t border-slate-200/70 p-3">
                <div className="space-y-1">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() =>
                        setMobileOpen(false)
                      }
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                    >
                      <span className="text-lg">
                        {link.icon}
                      </span>

                      {link.label}
                    </Link>
                  ))}

                  <Link
                    href={notificationsHref}
                    onClick={() =>
                      setMobileOpen(false)
                    }
                    className="flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition"
                  >
                    <span className="flex items-center gap-3">
                      <span>🔔</span>
                      Notifications
                    </span>

                    {notificationCount > 0 && (
                      <span className="px-2 py-1 rounded-full bg-rose-100 text-rose-600 text-[9px] font-black">
                        {notificationCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    href={profileHref}
                    onClick={() =>
                      setMobileOpen(false)
                    }
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition"
                  >
                    <span>👤</span>
                    My Profile
                  </Link>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition"
                  >
                    <span>↪</span>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Click outside profile dropdown */}
      {profileOpen && (
        <button
          type="button"
          aria-label="Close profile menu"
          onClick={() => setProfileOpen(false)}
          className="fixed inset-0 z-40 cursor-default"
        />
      )}
    </>
  );
}