'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  doctorEmail: string;
  doctorName: string;
  date: string;
  time: string;
  type: string;
  reason: string;
  status: 'PENDING' | 'CONFIRMED' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED' | 'MISSED';
  notes?: string;
  prescription?: string;
}

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const [doctor, setDoctor] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Selected appointment for inspection/actions
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [actionNotes, setActionNotes] = useState<string>('');

  useEffect(() => {
    // Check logged-in user session
    const userStr = localStorage.getItem('pulsecare_current_user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const userData = JSON.parse(userStr);
    if (userData.role !== 'doctor') {
      router.push('/user/dashboard');
      return;
    }
    setDoctor(userData);

    // Load appointments from localStorage
    loadAppointments();

    // Listen for storage events (real-time sync)
    const handleStorage = () => loadAppointments();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [router]);

  const loadAppointments = () => {
    const stored = localStorage.getItem('pulsecare_appointments');
    if (stored) {
      try {
        const parsed: Appointment[] = JSON.parse(stored);
        setAppointments(parsed);
      } catch (err) {
        console.error('Failed to parse appointments', err);
      }
    }
  };

  const updateAppointmentStatus = (id: string, newStatus: Appointment['status']) => {
    const updated = appointments.map((app) => {
      if (app.id === id) {
        return { 
          ...app, 
          status: newStatus,
          notes: actionNotes ? (app.notes ? `${app.notes}\n${actionNotes}` : actionNotes) : app.notes 
        };
      }
      return app;
    });

    setAppointments(updated);
    localStorage.setItem('pulsecare_appointments', JSON.stringify(updated));

    // Also push a notification for the patient
    const targetApp = updated.find(a => a.id === id);
    if (targetApp) {
      const notifsStr = localStorage.getItem('pulsecare_notifications') || '[]';
      const notifs = JSON.parse(notifsStr);
      notifs.unshift({
        id: 'notif_' + Date.now(),
        userId: targetApp.patientId,
        title: `Appointment ${newStatus}`,
        message: `Your appointment with Dr. ${targetApp.doctorName} on ${targetApp.date} has been marked as ${newStatus}.`,
        date: new Date().toISOString(),
        read: false
      });
      localStorage.setItem('pulsecare_notifications', JSON.stringify(notifs));
    }

    if (selectedAppointment && selectedAppointment.id === id) {
      setSelectedAppointment({ ...selectedAppointment, status: newStatus });
    }
    setActionNotes('');
    window.dispatchEvent(new Event('storage'));
  };

  // Filter logic: Matches logged-in doctor's email or allows fallback for testing
  const filteredAppointments = appointments.filter((a) => {
    if (doctor?.email) {
      const isExactEmailMatch = a.doctorEmail.toLowerCase().trim() === doctor.email.toLowerCase().trim();
      const isPratishAccount = doctor.email.toLowerCase() === 'bhonglepratish@gmail.com';
      
      // If logged in as your email, allow appointments assigned to your email OR general doctor email/name
      if (isPratishAccount) {
        const matchesPratish = a.doctorEmail.toLowerCase().includes('bhonglepratish') || a.doctorName.toLowerCase().includes('pratish') || a.doctorEmail === 'doctor@pulsecare.com';
        if (!matchesPratish) return false;
      } else if (!isExactEmailMatch) {
        return false;
      }
    }
    
    // Tab filtering
    if (activeTab !== 'ALL' && a.status !== activeTab) return false;

    // Search query matching patient name or type
    if (searchQuery && !a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) && !a.type.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Date filter
    if (filterDate && a.date !== filterDate) return false;

    // Status filter dropdown
    if (filterStatus !== 'ALL' && a.status !== filterStatus) return false;

    return true;
  });

  return (
    <div className="min-h-screen bg-[#faf8f5] text-black font-mono p-4 md:p-8">
      {/* Top Navigation Bar */}
      <header className="border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-black text-white font-black px-3 py-1 text-lg tracking-wider">PULSECARE</div>
          <span className="text-xs font-bold bg-yellow-300 border-2 border-black px-2 py-1">MASTER MANAGEMENT HUB</span>
        </div>
        <nav className="flex items-center gap-6 font-bold text-sm">
          <Link href="/doctor/appointments" className="underline underline-offset-4 decoration-2">APPOINTMENTS</Link>
          <Link href="/doctor/calendar" className="hover:underline">CALENDAR</Link>
          <Link href="/doctor/notifications" className="hover:underline">NOTIFICATIONS</Link>
        </nav>
        <div className="flex items-center gap-4">
          <span className="text-xs font-black bg-black text-white px-3 py-1.5 uppercase">
            {doctor ? `${doctor.name || 'Doctor'} (DOCTOR)` : 'LOADING...'}
          </span>
          <button
            onClick={() => {
              localStorage.removeItem('pulsecare_current_user');
              router.push('/login');
            }}
            className="border-2 border-black bg-red-400 px-3 py-1 text-xs font-black hover:bg-red-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
          >
            LOGOUT
          </button>
        </div>
      </header>

      {/* Main Title Header */}
      <div className="mb-8 border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">DOCTOR APPOINTMENTS</h1>
          <p className="text-sm text-gray-700 mt-1 font-sans">
            Review patient bookings, inspect clinical details, and execute status actions (Confirm, Decline, Complete, Missed).
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={loadAppointments}
            className="border-2 border-black bg-white px-4 py-2 text-xs font-black hover:bg-gray-100 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
          >
            🔄 REFRESH QUEUE
          </button>
          <Link
            href="/doctor/calendar"
            className="border-2 border-black bg-yellow-300 px-4 py-2 text-xs font-black hover:bg-yellow-400 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 inline-block"
          >
            SWITCH TO CALENDAR MATRIX →
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="border-4 border-black bg-white p-6 mb-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-black uppercase mb-1">Search Patient or Type</label>
            <input
              type="text"
              placeholder="e.g. John or Consultation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-2 border-black p-2 text-xs font-bold bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase mb-1">Filter by Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full border-2 border-black p-2 text-xs font-bold bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase mb-1">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border-2 border-black p-2 text-xs font-bold uppercase bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <option value="ALL">ALL STATUSES</option>
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="UPCOMING">UPCOMING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="MISSED">MISSED</option>
            </select>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t-2 border-black">
          {['ALL', 'PENDING', 'CONFIRMED', 'UPCOMING', 'COMPLETED', 'CANCELLED', 'MISSED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border-2 border-black px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                activeTab === tab ? 'bg-black text-white translate-x-0.5 translate-y-0.5 shadow-none' : 'bg-white hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout: List & Action Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Appointments Queue List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border-2 border-black bg-black text-white px-4 py-2 text-xs font-black uppercase tracking-wider flex justify-between items-center">
            <span>Matching Records ({filteredAppointments.length})</span>
            <span>Live Sync Active</span>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="border-4 border-black bg-white p-12 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-sm font-black uppercase text-gray-500">No appointments found matching current filters.</p>
              <p className="text-xs text-gray-400 mt-2">Try resetting search criteria or check if a patient booked under your account email ({doctor?.email}).</p>
            </div>
          ) : (
            filteredAppointments.map((app) => (
              <div 
                key={app.id} 
                className={`border-4 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                  selectedAppointment?.id === app.id ? 'bg-yellow-50 border-black ring-2 ring-black' : ''
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black uppercase">{app.patientName}</h3>
                    <span className={`text-[10px] font-black px-2 py-0.5 border border-black uppercase ${
                      app.status === 'CONFIRMED' ? 'bg-green-300 text-black' :
                      app.status === 'PENDING' ? 'bg-yellow-300 text-black' :
                      app.status === 'COMPLETED' ? 'bg-blue-300 text-black' :
                      app.status === 'MISSED' ? 'bg-red-300 text-black' : 'bg-gray-200 text-black'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-gray-600">
                    🕒 {app.date} at {app.time} • <span className="uppercase text-black">{app.type}</span>
                  </p>
                  <p className="text-xs font-sans text-gray-800 bg-gray-50 p-2 border border-black mt-1">
                    <strong className="uppercase font-mono text-[10px] text-gray-500 block">Reason:</strong>
                    {app.reason}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAppointment(app)}
                  className="border-2 border-black bg-yellow-300 px-4 py-2 text-xs font-black hover:bg-yellow-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 shrink-0"
                >
                  INSPECT DETAILS →
                </button>
              </div>
            ))
          )}
        </div>

        {/* Dynamic Status Control Panel (1 col) */}
        <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] h-fit sticky top-6">
          <div className="flex justify-between items-center border-b-2 border-black pb-3 mb-4">
            <h2 className="text-sm font-black uppercase tracking-wider">APPOINTMENT ACTIONS</h2>
            <span className="text-xs">⚙️</span>
          </div>

          {selectedAppointment ? (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 border-2 border-black">
                <span className="text-[10px] font-black bg-black text-white px-1.5 py-0.5 uppercase">Selected Patient</span>
                <h3 className="text-base font-black uppercase mt-1">{selectedAppointment.patientName}</h3>
                <p className="text-xs text-gray-600">{selectedAppointment.patientEmail}</p>
                <div className="mt-2 text-xs font-bold border-t border-black pt-2">
                  <p>📅 {selectedAppointment.date} ({selectedAppointment.time})</p>
                  <p>🏷️ Type: {selectedAppointment.type}</p>
                  <p>📌 Current Status: <span className="underline">{selectedAppointment.status}</span></p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1">Clinical Notes / Directives</label>
                <textarea
                  rows={3}
                  placeholder="Enter prescription notes or advice..."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="w-full border-2 border-black p-2 text-xs font-bold bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                ></textarea>
              </div>

              <div className="space-y-2 pt-2 border-t-2 border-black">
                <label className="block text-xs font-black uppercase">Execute Status Transition</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, 'CONFIRMED')}
                    className="border-2 border-black bg-green-300 p-2 text-xs font-black hover:bg-green-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
                  >
                    ✓ CONFIRM
                  </button>
                  <button
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, 'UPCOMING')}
                    className="border-2 border-black bg-yellow-300 p-2 text-xs font-black hover:bg-yellow-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
                  >
                    ⏰ UPCOMING
                  </button>
                  <button
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, 'COMPLETED')}
                    className="border-2 border-black bg-blue-300 p-2 text-xs font-black hover:bg-blue-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
                  >
                    🏁 COMPLETE
                  </button>
                  <button
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, 'MISSED')}
                    className="border-2 border-black bg-red-300 p-2 text-xs font-black hover:bg-red-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
                  >
                    ✕ MARK MISSED
                  </button>
                </div>
              </div>

              <button
                onClick={() => setSelectedAppointment(null)}
                className="w-full border-2 border-black bg-gray-200 py-2 text-xs font-black hover:bg-gray-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-2"
              >
                CLOSE INSPECTOR
              </button>
            </div>
          ) : (
            <div className="p-8 text-center bg-gray-50 border-2 border-dashed border-black">
              <p className="text-xs font-bold text-gray-500 uppercase">Select an appointment record from the queue list to review clinical notes and execute state actions.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}