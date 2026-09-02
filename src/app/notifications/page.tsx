'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { UserSession, NotificationItem } from '@/types';

export default function NotificationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<string>('All');

  const loadNotifications = () => {
    const currentUser = JSON.parse(localStorage.getItem('pulsecare_current_user') || 'null');
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    const storedNotifs: NotificationItem[] = JSON.parse(localStorage.getItem('pulsecare_notifications') || '[]');
    
    // If empty, generate contextual sample notifications matching patient or doctor emails
    if (storedNotifs.length === 0) {
      const targetEmail = currentUser.email;
      const sampleNotifs: NotificationItem[] = [
        {
          id: 'notif-1',
          userEmail: targetEmail,
          title: 'Booking & Confirmation',
          message: currentUser.role === 'doctor' 
            ? 'New consultation request received for Sep 2, 2026.' 
            : 'Your general consultation with Dr. Pratish Bhongle has been successfully confirmed for Sep 2, 2026.',
          type: 'Booking/confirmation',
          date: '2026-09-01 10:30 AM',
          read: false
        },
        {
          id: 'notif-2',
          userEmail: targetEmail,
          title: 'Appointment Rescheduled',
          message: 'An appointment slot has been updated successfully on the master calendar.',
          type: 'Rescheduling',
          date: '2026-09-01 02:15 PM',
          read: false
        },
        {
          id: 'notif-3',
          userEmail: targetEmail,
          title: 'Appointment Reminder',
          message: 'Reminder: You have sessions scheduled starting Sep 2, 2026.',
          type: 'Appointment reminder',
          date: '2026-09-01 09:00 AM',
          read: true
        },
        {
          id: 'notif-4',
          userEmail: targetEmail,
          title: 'Prescription Available',
          message: 'Prescription details for the recent consultation are available to view.',
          type: 'Prescription available',
          date: '2026-09-01 03:30 PM',
          read: false
        }
      ];
      localStorage.setItem('pulsecare_notifications', JSON.stringify(sampleNotifs));
      setNotifications(sampleNotifs);
    } else {
      setNotifications(storedNotifs);
    }
  };

  useEffect(() => {
    loadNotifications();

    window.addEventListener('storage', loadNotifications);
    const interval = setInterval(loadNotifications, 1000);

    return () => {
      window.removeEventListener('storage', loadNotifications);
      clearInterval(interval);
    };
  }, [router]);

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem('pulsecare_notifications', JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('pulsecare_notifications', JSON.stringify(updated));
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem('pulsecare_notifications');
  };

  const filteredNotifs = notifications.filter(n => {
    // Check if notification matches current user email, patient email, or doctor email mapping
    const isRelevant = !n.userEmail || 
                      n.userEmail === user?.email || 
                      n.userEmail === 'bhongle@gmail.com' || 
                      n.userEmail === 'bhonglepratish@gmail.com';
    if (!isRelevant) return false;
    if (filter === 'All') return true;
    if (filter === 'Unread') return !n.read;
    return n.type === filter;
  });

  const categories = [
    'All',
    'Unread',
    'Booking/confirmation',
    'Rescheduling',
    'Cancellation',
    'Appointment reminder',
    'Missed appointment',
    'Appointment completed',
    'Prescription available'
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf9] text-black font-sans selection:bg-yellow-300 selection:text-black">
      <Navbar />

      <main className="flex-grow max-w-5xl w-full mx-auto p-6 lg:p-12 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-4 border-black pb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 bg-yellow-300 border-2 border-black px-3 py-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <span className="w-2.5 h-2.5 rounded-full bg-black animate-ping"></span>
              <span className="text-[11px] font-black uppercase tracking-widest">
                {user?.role === 'doctor' ? 'Doctor Alerts & Dispatch Center' : 'Patient Alerts & Messaging Center'}
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter">Notifications</h1>
            <p className="text-sm text-gray-700 font-bold max-w-xl">
              Real-time alerts for booking confirmations, rescheduling updates, cancellations, and calendar logs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={markAllAsRead}
              className="px-4 py-2.5 bg-yellow-300 text-black border-2 border-black font-black text-xs uppercase hover:bg-black hover:text-white transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            >
              Mark All Read
            </button>
            <button
              onClick={clearAll}
              className="px-4 py-2.5 bg-red-200 text-red-900 border-2 border-black font-black text-xs uppercase hover:bg-red-500 hover:text-white transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3.5 py-1.5 border-2 border-black text-[11px] font-black uppercase transition ${
                filter === cat ? 'bg-black text-white shadow-[3px_3px_0px_0px_rgba(253,224,71,1)]' : 'bg-white hover:bg-yellow-300 hover:text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {filteredNotifs.length === 0 ? (
          <div className="border-4 border-black p-16 text-center bg-white space-y-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-4xl">🔔</p>
            <p className="font-black text-lg uppercase">No notifications found</p>
            <p className="text-xs text-gray-600 font-bold">You are all caught up with your schedule alerts.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifs.map((item) => (
              <div
                key={item.id}
                onClick={() => markAsRead(item.id)}
                className={`border-4 border-black p-5 transition cursor-pointer shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                  item.read ? 'bg-white opacity-90' : 'bg-yellow-50 ring-2 ring-yellow-300'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                    <span className="text-lg">
                      {item.type === 'Booking/confirmation' ? '✅' :
                       item.type === 'Rescheduling' ? '📅' :
                       item.type === 'Cancellation' ? '❌' :
                       item.type === 'Appointment reminder' ? '⏰' :
                       item.type === 'Missed appointment' ? '⚠️' :
                       item.type === 'Prescription available' ? '💊' : '📌'}
                    </span>
                    <span className="font-black text-base uppercase">{item.title}</span>
                    <span className="px-2 py-0.5 bg-black text-white text-[9px] font-black uppercase border border-black">
                      {item.type}
                    </span>
                    {!item.read && (
                      <span className="px-2 py-0.5 bg-yellow-300 text-black text-[9px] font-black uppercase border border-black animate-pulse">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-800 font-medium pl-8">{item.message}</p>
                </div>

                <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pl-8 sm:pl-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-black">
                  <span className="text-[10px] font-bold text-gray-500">{item.date}</span>
                  {!item.read && (
                    <span className="text-[10px] font-black uppercase underline text-blue-600 mt-1">Mark Read</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}