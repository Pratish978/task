'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { UserSession, Appointment, NotificationItem } from '@/types';

export default function UserMyAppointmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const [showBookModal, setShowBookModal] = useState<boolean>(false);
  const [doctorEmail, setDoctorEmail] = useState<string>('bhonglepratish@gmail.com');
  const [doctorName, setDoctorName] = useState<string>('Dr. Pratish Bhongle');
  const [date, setDate] = useState<string>('2026-09-02');
  const [time, setTime] = useState<string>('10:00 AM');
  const [type, setType] = useState<string>('General Consultation');
  const [reason, setReason] = useState<string>('');

  const loadUserAppointments = () => {
    const currentUser = JSON.parse(localStorage.getItem('pulsecare_current_user') || 'null');
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    const storedApts: Appointment[] = JSON.parse(localStorage.getItem('pulsecare_appointments') || '[]');
    const userApts = storedApts.filter((apt) => apt.patientEmail === 'bhongle@gmail.com' || apt.patientEmail === currentUser.email);
    setAppointments(userApts);
  };

  useEffect(() => {
    loadUserAppointments();

    const handleStorageChange = () => {
      loadUserAppointments();
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(loadUserAppointments, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [router]);

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    const newApt: Appointment = {
      id: 'apt-' + Date.now(),
      doctorEmail: 'bhonglepratish@gmail.com',
      doctorName: 'Dr. Pratish Bhongle',
      patientName: user?.name || 'Pratish Bhongle',
      patientEmail: 'bhongle@gmail.com',
      date,
      time,
      status: 'Pending',
      type,
      reason
    };

    const storedApts: Appointment[] = JSON.parse(localStorage.getItem('pulsecare_appointments') || '[]');
    const updatedApts = [newApt, ...storedApts];
    localStorage.setItem('pulsecare_appointments', JSON.stringify(updatedApts));
    window.dispatchEvent(new Event('storage'));

    const storedNotifs: NotificationItem[] = JSON.parse(localStorage.getItem('pulsecare_notifications') || '[]');
    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      userEmail: 'bhongle@gmail.com',
      title: 'Booking & Confirmation',
      message: `Your appointment (${type}) with Dr. Pratish Bhongle on ${date} at ${time} has been requested.`,
      type: 'Booking/confirmation',
      date: new Date().toLocaleString(),
      read: false
    };
    localStorage.setItem('pulsecare_notifications', JSON.stringify([newNotif, ...storedNotifs]));

    setAppointments(updatedApts.filter(a => a.patientEmail === 'bhongle@gmail.com'));
    setShowBookModal(false);
    setNotification('Appointment successfully booked for Sep 2, 2026!');
    setReason('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf9] text-black font-sans">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto p-6 lg:p-12 space-y-8">
        {notification && (
          <div className="border-3 border-black bg-yellow-300 p-4 font-black text-xs uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center">
            <span>⚡ {notification}</span>
            <button onClick={() => setNotification(null)} className="underline">Dismiss</button>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-4 border-black pb-6">
          <div>
            <span className="px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest">
              Patient Portal
            </span>
            <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight mt-2">My Appointments</h1>
            <p className="text-sm text-gray-700 font-bold">Book and track consultations targeting Sep 2, 2026.</p>
          </div>
          <button
            onClick={() => setShowBookModal(true)}
            className="px-4 py-2.5 bg-yellow-300 text-black border-2 border-black font-black text-xs uppercase hover:bg-black hover:text-white transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          >
            + Book Appointment
          </button>
        </div>

        {showBookModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border-4 border-black max-w-lg w-full p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
              <div className="flex justify-between items-center border-b-2 border-black pb-3">
                <h2 className="text-xl font-black uppercase">Book New Appointment</h2>
                <button onClick={() => setShowBookModal(false)} className="font-black text-base px-2 bg-red-200 border border-black hover:bg-red-500 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase">Select Doctor</label>
                  <select
                    value={doctorEmail}
                    onChange={(e) => {
                      setDoctorEmail(e.target.value);
                      setDoctorName(e.target.options[e.target.selectedIndex].text);
                    }}
                    className="w-full border-2 border-black p-2 text-xs font-bold uppercase bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <option value="bhonglepratish@gmail.com">Dr. Pratish Bhongle (General Consultation)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase">Appointment Date</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full border-2 border-black p-2 text-xs font-bold uppercase bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase">Preferred Time</label>
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full border-2 border-black p-2 text-xs font-bold uppercase bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="12:00 PM">12:00 PM</option>
                      <option value="01:00 PM">01:00 PM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="03:00 PM">03:00 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase">Consultation Type</label>
                  <input
                    type="text"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full border-2 border-black p-2 text-xs font-bold uppercase bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase">Reason / Symptoms</label>
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Describe symptoms..."
                    className="w-full border-2 border-black p-2 text-xs font-bold uppercase bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBookModal(false)}
                    className="px-4 py-2 bg-white text-black border-2 border-black font-black text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-yellow-300 text-black border-2 border-black font-black text-xs uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {appointments.length === 0 ? (
          <div className="border-3 border-black p-12 text-center bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <p className="font-black text-lg uppercase">No appointments found.</p>
            <button
              onClick={() => setShowBookModal(true)}
              className="px-4 py-2 bg-yellow-300 text-black border-2 border-black font-black text-xs uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            >
              Book your first appointment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {appointments.map((apt) => (
              <div key={apt.id} className="border-3 border-black p-6 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-black text-base uppercase">Consultation with {apt.doctorName}</span>
                  <span className="text-[9px] font-black uppercase px-2.5 py-0.5 border border-black bg-black text-white">{apt.status}</span>
                </div>
                <p className="text-xs font-bold text-gray-600">🗓️ {apt.date} at {apt.time} · Type: {apt.type}</p>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}