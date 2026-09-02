'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { UserSession, Appointment, NotificationItem } from '@/types';

export default function DoctorCalendarPage() {
  const router = useRouter();
  const [doctor, setDoctor] = useState<UserSession | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState<string>('2026-09-02');
  const [notification, setNotification] = useState<string | null>(null);
  const [draggedApptId, setDraggedApptId] = useState<string | null>(null);

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '11:30 AM', 
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
  ];

  const getDaysOfWeek = (dateStr: string) => {
    const curr = new Date(dateStr);
    const week = [];
    for (let i = 0; i < 7; i++) {
      const first = curr.getDate() - curr.getDay() + i;
      const day = new Date(curr.setDate(first));
      week.push(day.toISOString().split('T')[0]);
    }
    return week;
  };

  const weekDays = getDaysOfWeek(currentDate);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('pulsecare_current_user') || 'null');
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setDoctor(currentUser);

    const loadAppointments = () => {
      const allAppointments: Appointment[] = JSON.parse(localStorage.getItem('pulsecare_appointments') || '[]');
      setAppointments(allAppointments);
    };

    loadAppointments();

    window.addEventListener('storage', loadAppointments);
    const interval = setInterval(loadAppointments, 1000);

    return () => {
      window.removeEventListener('storage', loadAppointments);
      clearInterval(interval);
    };
  }, [router]);

  const handleDragStart = (e: React.DragEvent, appt: Appointment) => {
    if (['Completed', 'Cancelled', 'Missed'].includes(appt.status)) {
      e.preventDefault();
      return;
    }
    setDraggedApptId(appt.id);
    e.dataTransfer.setData('text/plain', appt.id);
  };

  const handleDrop = (e: React.DragEvent, targetDate: string, targetTime: string) => {
    e.preventDefault();
    if (!draggedApptId) return;

    const isDoubleBooked = appointments.some(
      (a) => (a.doctorEmail === 'bhonglepratish@gmail.com') && 
             a.date === targetDate && a.time === targetTime && a.id !== draggedApptId && a.status !== 'Cancelled'
    );

    if (isDoubleBooked) {
      setNotification('❌ Error: Slot is already booked!');
      setTimeout(() => setNotification(null), 4000);
      setDraggedApptId(null);
      return;
    }

    const updated = appointments.map((a) => {
      if (a.id === draggedApptId) {
        return { ...a, date: targetDate, time: targetTime, status: 'Confirmed' as const };
      }
      return a;
    });

    setAppointments(updated);
    localStorage.setItem('pulsecare_appointments', JSON.stringify(updated));

    const movedAppt = appointments.find(a => a.id === draggedApptId);
    if (movedAppt) {
      const allNotifs: NotificationItem[] = JSON.parse(localStorage.getItem('pulsecare_notifications') || '[]');
      const newNotif: NotificationItem = {
        id: 'notif_' + Date.now(),
        userEmail: movedAppt.patientEmail,
        title: 'Appointment Rescheduled',
        message: `Your appointment was rescheduled to ${targetDate} at ${targetTime}.`,
        type: 'info',
        date: new Date().toISOString(),
        read: false
      };
      localStorage.setItem('pulsecare_notifications', JSON.stringify([newNotif, ...allNotifs]));
    }

    setNotification(`✅ Successfully rescheduled appointment.`);
    setTimeout(() => setNotification(null), 4000);
    setDraggedApptId(null);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const filteredAppointments = appointments.filter(
    (a) => a.doctorEmail === 'bhonglepratish@gmail.com' || a.patientEmail === 'bhongle@gmail.com'
  );

  const dayAppointments = filteredAppointments.filter(
    (a) => a.date === currentDate
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf9] text-black font-sans selection:bg-yellow-300">
      <Navbar />
      <main className="flex-grow max-w-7xl w-full mx-auto p-6 lg:p-12 space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-4 border-black pb-8">
          <div>
            <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter">Doctor Master Calendar</h1>
            <p className="text-sm text-gray-700 font-bold mt-1">Live schedule starting from Sep 2, 2026. Auto-updates when patients book.</p>
          </div>

          <div className="flex items-center space-x-3 bg-white p-2 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {(['day', 'week', 'month'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 text-xs font-black uppercase border-2 border-black transition ${
                  view === v ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(253,224,71,1)]' : 'bg-gray-100 hover:bg-yellow-300'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {notification && (
          <div className="p-4 bg-yellow-300 border-3 border-black font-black text-xs uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center">
            <span>{notification}</span>
            <button onClick={() => setNotification(null)}>×</button>
          </div>
        )}

        <div className="flex justify-between items-center bg-white p-4 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <button 
            onClick={() => setCurrentDate('2026-09-02')} 
            className="px-3 py-1.5 border-2 border-black text-xs font-black uppercase bg-gray-100 hover:bg-black hover:text-white"
          >
            Reset to Today (Sep 2, 2026)
          </button>
          <span className="font-black text-sm uppercase">Active Date: {currentDate}</span>
        </div>

        {view === 'week' && (
          <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-x-auto">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-8 border-b-4 border-black bg-gray-100 text-center font-black text-xs uppercase">
                <div className="p-3 border-r-2 border-black">Time Slot</div>
                {weekDays.map((day, idx) => (
                  <div key={day} className={`p-3 ${idx < 6 ? 'border-r-2 border-black' : ''}`}>
                    Day {idx + 1} <br/><span className="text-[10px] text-gray-600">{day}</span>
                  </div>
                ))}
              </div>

              {timeSlots.map((time) => (
                <div key={time} className="grid grid-cols-8 border-b-2 border-black min-h-[90px]">
                  <div className="p-3 border-r-2 border-black bg-gray-50 text-xs font-black flex items-center justify-center">
                    {time}
                  </div>
                  {weekDays.map((day) => {
                    const matchedAppts = filteredAppointments.filter(
                      (a) => a.date === day && a.time === time
                    );

                    return (
                      <div
                        key={day}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, day, time)}
                        className="p-2 border-r-2 border-black last:border-r-0 relative bg-white hover:bg-yellow-50 flex flex-col gap-2 justify-center items-center"
                      >
                        {matchedAppts.map((appt) => (
                          <div
                            key={appt.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, appt)}
                            className="w-full p-2 border-2 border-black bg-yellow-300 text-black text-[11px] font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-grab"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-black uppercase truncate">{appt.patientName}</span>
                              <span className="text-[9px]">{appt.status}</span>
                            </div>
                            <div className="text-[10px] truncate">{appt.type}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'day' && (
          <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 space-y-6">
            <div className="border-b-3 border-black pb-3 flex justify-between items-center">
              <h2 className="font-black uppercase text-lg">Schedule for {currentDate}</h2>
              <input 
                type="date" 
                value={currentDate} 
                onChange={(e) => e.target.value && setCurrentDate(e.target.value)}
                className="px-3 py-1.5 border-2 border-black text-xs font-black uppercase bg-gray-50"
              />
            </div>

            <div className="space-y-4">
              {dayAppointments.length === 0 ? (
                <div className="p-8 border-3 border-dashed border-black text-center bg-gray-50 font-black uppercase text-sm text-gray-500">
                  No appointments booked for {currentDate}.
                </div>
              ) : (
                dayAppointments.map((appt) => (
                  <div key={appt.id} className="border-3 border-black p-4 bg-white flex justify-between items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div>
                      <span className="font-black uppercase text-base">{appt.patientName}</span> — <span className="text-xs font-bold">{appt.type}</span>
                      <p className="text-xs text-gray-500">{appt.time} | Status: {appt.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {view === 'month' && (
          <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 space-y-6">
            <h2 className="font-black uppercase text-lg border-b-3 border-black pb-3">September 2026 Overview</h2>
            <div className="grid grid-cols-7 gap-3 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="p-2 border-2 border-black bg-black text-white font-black text-xs uppercase">{d}</div>
              ))}
              {Array.from({ length: 30 }, (_, i) => {
                const dayNum = i + 1;
                const formattedDate = `2026-09-${dayNum < 10 ? '0' + dayNum : dayNum}`;
                const dayAppts = filteredAppointments.filter(a => a.date === formattedDate);

                return (
                  <div 
                    key={formattedDate} 
                    onClick={() => { setCurrentDate(formattedDate); setView('day'); }}
                    className="border-3 border-black min-h-[90px] p-2 bg-gray-50 hover:bg-yellow-50 cursor-pointer flex flex-col justify-between"
                  >
                    <span className="font-black text-xs bg-yellow-300 border border-black px-1.5 w-max">{dayNum}</span>
                    <span className="text-[10px] font-bold">{dayAppts.length} Booked</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}