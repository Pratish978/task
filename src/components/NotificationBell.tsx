// src/components/NotificationBell.tsx
"use client";

import { useState, useEffect, useRef } from "react";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: "notif-1",
      title: "Appointment Confirmed",
      desc: "Dr. Anika Rao confirmed your session for Sep 5, 2026.",
      time: "10m ago",
      read: false,
    },
    {
      id: "notif-2",
      title: "Prescription Available",
      desc: "New digital prescription issued for your consultation.",
      time: "2h ago",
      read: false,
    },
    {
      id: "notif-3",
      title: "Appointment Reminder",
      desc: "Upcoming consultation scheduled in 24 hours.",
      time: "1d ago",
      read: true,
    },
  ]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 transition"
        aria-label="Notifications"
      >
        <span className="text-base">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-stone-900 text-white font-black text-[10px] rounded-full flex items-center justify-center shadow-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-stone-200 rounded-[2rem] shadow-2xl p-6 z-50 space-y-4 animate-fade-in">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-stone-900">Notifications</h3>
              <p className="text-[10px] font-bold text-stone-400 uppercase">System Alerts & Updates</p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-extrabold text-stone-600 hover:text-stone-900 underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-2xl border transition space-y-1 ${
                  n.read ? "bg-stone-50/50 border-stone-200/60" : "bg-white border-stone-300 shadow-xs"
                }`}
              >
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-black text-stone-900">{n.title}</h4>
                  <span className="text-[10px] font-bold text-stone-400">{n.time}</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">{n.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}