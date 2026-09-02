'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { UserSession, Appointment } from '@/types';

export default function DoctorDashboard() {
  const router = useRouter();
  const [doctor, setDoctor] = useState<UserSession | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('pulsecare_current_user') || 'null');
    if (!currentUser || currentUser.role !== 'doctor') {
      router.push('/login');
      return;
    }
    setDoctor(currentUser);

    loadAppointments(currentUser);

    const handleStorage = () => loadAppointments(currentUser);
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [router]);

  const loadAppointments = (currentUser: UserSession) => {
    const allAppointments: Appointment[] = JSON.parse(localStorage.getItem('pulsecare_appointments') || '[]');
    
    if (allAppointments.length === 0) {
      const sample: Appointment[] = [
        {
          id: 'apt-1',
          doctorEmail: currentUser.email,
          patientName: 'Jonathan Sterling',
          patientEmail: 'jonathan@example.com',
          patientAge: '34',
          date: '2026-06-12',
          time: '10:00 AM',
          status: 'Confirmed',
          type: 'Consultation',
          reason: 'Severe acute migraine & neurological check'
        },
        {
          id: 'apt-2',
          doctorEmail: currentUser.email,
          patientName: 'Dr. Elizabeth Vance',
          patientEmail: 'elizabeth@example.com',
          patientAge: '29',
          date: '2026-06-14',
          time: '02:30 PM',
          status: 'Pending',
          type: 'Follow-up',
          reason: 'Post-operative orthopedic review'
        },
        {
          id: 'apt-3',
          doctorEmail: currentUser.email,
          patientName: 'Marcus Holloway',
          patientEmail: 'marcus@example.com',
          patientAge: '41',
          date: '2026-06-15',
          time: '11:15 AM',
          status: 'Upcoming',
          type: 'General Checkup',
          reason: 'Routine annual cardiovascular examination and blood pressure monitoring.'
        },
        {
          id: 'apt-4',
          doctorEmail: currentUser.email,
          patientName: 'Clara Oswald',
          patientEmail: 'clara@example.com',
          patientAge: '26',
          date: '2026-06-16',
          time: '09:00 AM',
          status: 'Confirmed',
          type: 'Consultation',
          reason: 'Persistent allergic rhinitis and sudden seasonal respiratory irritation.'
        },
        {
          id: 'apt-5',
          doctorEmail: currentUser.email,
          patientName: 'Arthur Pendelton',
          patientEmail: 'arthur@example.com',
          patientAge: '58',
          date: '2026-06-18',
          time: '04:00 PM',
          status: 'Pending',
          type: 'Specialist Review',
          reason: 'Chronic lower back pain management and physical therapy progress evaluation.'
        },
        {
          id: 'apt-6',
          doctorEmail: currentUser.email,
          patientName: 'Evelyn Thorne',
          patientEmail: 'evelyn@example.com',
          patientAge: '52',
          date: '2026-06-19',
          time: '09:30 AM',
          status: 'Confirmed',
          type: 'Endocrinology',
          reason: 'Type 2 diabetes quarterly HbA1c review and insulin adjustment consultation.'
        },
        {
          id: 'apt-7',
          doctorEmail: currentUser.email,
          patientName: 'Liam Abernathy',
          patientEmail: 'liam@example.com',
          patientAge: '19',
          date: '2026-06-20',
          time: '01:00 PM',
          status: 'Upcoming',
          type: 'Sports Injury',
          reason: 'Acute right knee ligament strain sustained during collegiate soccer practice.'
        },
        {
          id: 'apt-8',
          doctorEmail: currentUser.email,
          patientName: 'Sophia Martinez',
          patientEmail: 'sophia@example.com',
          patientAge: '37',
          date: '2026-06-21',
          time: '11:00 AM',
          status: 'Pending',
          type: 'Dermatology',
          reason: 'Unexplained contact dermatitis and acute pruritic rash on upper limbs.'
        },
        {
          id: 'apt-9',
          doctorEmail: currentUser.email,
          patientName: 'Julian Calloway',
          patientEmail: 'julian@example.com',
          patientAge: '45',
          date: '2026-06-22',
          time: '03:15 PM',
          status: 'Confirmed',
          type: 'Cardiology',
          reason: 'Intermittent palpitations and mild exertional dyspnea follow-up evaluation.'
        },
        {
          id: 'apt-10',
          doctorEmail: currentUser.email,
          patientName: 'Naomi Zhang',
          patientEmail: 'naomi@example.com',
          patientAge: '31',
          date: '2026-06-23',
          time: '10:30 AM',
          status: 'Upcoming',
          type: 'General Wellness',
          reason: 'Pre-employment comprehensive medical screening and physical fitness exam.'
        }
      ];
      localStorage.setItem('pulsecare_appointments', JSON.stringify(sample));
      setAppointments(sample.filter((a) => a.status === 'Confirmed' || a.status === 'Upcoming' || a.status === 'Pending'));
    } else {
      const filtered = allAppointments.filter((a) => {
        const isExactMatch = a.doctorEmail?.toLowerCase().trim() === currentUser.email?.toLowerCase().trim();
        const isPratishAccount = currentUser.email?.toLowerCase() === 'bhonglepratish@gmail.com';
        
        let matches = isExactMatch;
        if (isPratishAccount) {
          matches = isExactMatch || a.doctorEmail === 'doctor@pulsecare.com' || Boolean(a.doctorName && a.doctorName.toLowerCase().includes('pratish'));
        }

        const validStatus = ['Confirmed', 'Upcoming', 'Pending', 'CONFIRMED', 'UPCOMING', 'PENDING'].includes(a.status);
        return matches && validStatus;
      });
      setAppointments(filtered);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf9] text-black font-sans selection:bg-yellow-300 selection:text-black">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto p-6 lg:p-12 space-y-10">
        
        {/* Fancy Hero Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-4 border-black pb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 bg-yellow-300 border-2 border-black px-3 py-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <span className="w-2.5 h-2.5 rounded-full bg-black animate-pulse"></span>
              <span className="text-[11px] font-black uppercase tracking-widest">Live Practitioner Dashboard</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter">Upcoming Appointments</h1>
            <p className="text-sm text-gray-700 font-bold max-w-xl">
              Manage live active patient queues, inspect clinical details, and jump directly into scheduling calendars.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="px-5 py-3 border-3 border-black bg-white text-xs font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center space-x-2">
              <span className="text-lg">🗓️</span>
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Queue (2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 bg-gray-200 px-3 py-1 border border-black">
                Active Queue List ({appointments.length})
              </h2>
              <span className="text-xs font-bold text-gray-500">Real-time sync active</span>
            </div>
            
            {appointments.length === 0 ? (
              <div className="border-4 border-black p-16 text-center bg-white space-y-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-4xl">📭</p>
                <p className="font-black text-lg uppercase tracking-tight">No upcoming appointments found</p>
                <p className="text-xs text-gray-600 font-bold">New patient bookings from portal accounts will populate this queue instantly.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {appointments.map((apt) => (
                  <div 
                    key={apt.id} 
                    className="border-3 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 hover:translate-y-[-2px] transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                        <span className="font-black text-xl tracking-tight">{apt.patientName}</span>
                        <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase border-2 border-black ${apt.status.toLowerCase() === 'confirmed' ? 'bg-black text-white' : apt.status.toLowerCase() === 'upcoming' ? 'bg-blue-300 text-black' : 'bg-yellow-300 text-black'}`}>
                          {apt.status}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase border border-black bg-gray-100">
                          {apt.patientAge ? `${apt.patientAge} yrs` : 'Age N/A'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 font-bold flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="bg-gray-100 border border-black px-2 py-0.5">🕒 {apt.date} at {apt.time}</span>
                        <span className="underline uppercase tracking-wider">{apt.type}</span>
                      </p>
                    </div>

                    {/* Action Icon Buttons */}
                    <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                      {/* Patient Details Icon Button */}
                      <button 
                        onClick={() => setSelectedAppointment(apt)}
                        title="View Patient Details"
                        className="px-4 py-2.5 border-2 border-black bg-yellow-300 hover:bg-black hover:text-white transition flex items-center space-x-2 text-xs font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <span className="text-base">👤</span>
                        <span>Patient Details</span>
                      </button>

                      {/* Calendar Icon Link */}
                      <Link 
                        href="/doctor/calendar"
                        title="View Calendar"
                        className="px-4 py-2.5 border-2 border-black bg-white hover:bg-black hover:text-white transition flex items-center space-x-2 text-xs font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <span className="text-base">🗓️</span>
                        <span className="hidden sm:inline">Calendar</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fancy Inspector Side Panel (1 Column) */}
          <div className="border-4 border-black p-8 bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] space-y-6 h-fit sticky top-24">
            <div className="border-b-3 border-black pb-4 flex justify-between items-center">
              <div>
                <h2 className="font-black uppercase text-base tracking-tight">Appointment Inspector</h2>
                <p className="text-xs text-gray-500 font-bold">Detailed record preview</p>
              </div>
              <span className="text-2xl">🔍</span>
            </div>

            {selectedAppointment ? (
              <div className="space-y-5 text-sm">
                <div className="p-4 bg-gray-50 border-2 border-black space-y-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Patient Full Name</span>
                  <p className="font-black text-lg">{selectedAppointment.patientName}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 border-2 border-black space-y-1">
                    <span className="text-[10px] font-black uppercase text-gray-500">Patient Age</span>
                    <p className="font-black text-base">{selectedAppointment.patientAge || 'N/A'} yrs</p>
                  </div>
                  <div className="p-3 bg-gray-50 border-2 border-black space-y-1">
                    <span className="text-[10px] font-black uppercase text-gray-500">Appointment Type</span>
                    <p className="font-black text-base uppercase">{selectedAppointment.type}</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border-2 border-black space-y-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Scheduled Date & Time</span>
                  <p className="font-black">{selectedAppointment.date} — {selectedAppointment.time}</p>
                </div>

                <div className="p-4 bg-gray-50 border-2 border-black space-y-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Clinical Reason / Notes</span>
                  <p className="font-medium text-xs text-gray-800 leading-relaxed">{selectedAppointment.reason || 'Standard consultation requested.'}</p>
                </div>

                <Link
                  href="/doctor/appointments"
                  className="block w-full text-center py-3.5 bg-black text-white font-black uppercase text-xs border-2 border-black hover:bg-yellow-300 hover:text-black transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  Open Full Appointments Hub →
                </Link>
              </div>
            ) : (
              <div className="py-20 text-center text-gray-400 space-y-4">
                <p className="text-4xl animate-bounce">👆</p>
                <p className="text-xs font-black uppercase tracking-wider text-black">
                  Click the 👤 Patient Details button on any item in the queue to inspect complete records here.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}