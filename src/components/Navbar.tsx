'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UserSession, NotificationItem } from '@/types';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('pulsecare_current_user') || 'null');
    setUser(currentUser);

    if (currentUser) {
      const allNotifs: NotificationItem[] = JSON.parse(localStorage.getItem('pulsecare_notifications') || '[]');
      const unread = allNotifs.filter(n => (!n.userEmail || n.userEmail === currentUser.email) && !n.read).length;
      setUnreadCount(unread);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('pulsecare_current_user');
    router.push('/login');
  };

  return (
    <header className="border-b-4 border-black bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="font-black text-xl tracking-tighter uppercase flex items-center space-x-2">
          <span className="bg-black text-white px-2 py-1 text-sm">⚡</span>
          <span>PulseCare Hub</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-xs font-black uppercase">
          {user?.role === 'doctor' ? (
            <>
              <Link href="/doctor/dashboard" className="hover:underline">Dashboard</Link>
              <Link href="/doctor/appointments" className="hover:underline">Appointments</Link>
              <Link href="/doctor/calendar" className="hover:underline">Calendar</Link>
              <Link href="/notifications" className="hover:underline flex items-center gap-1.5 relative">
                <span>🔔 Notifications</span>
                {unreadCount > 0 && (
                  <span className="w-4 h-4 bg-yellow-300 border-2 border-black rounded-full text-[9px] flex items-center justify-center font-black animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </>
          ) : user?.role === 'user' ? (
            <>
              <Link href="/user/my-appointments" className="hover:underline">My Appointments</Link>
              <Link href="/notifications" className="hover:underline flex items-center gap-1.5 relative">
                <span>🔔 Notifications</span>
                {unreadCount > 0 && (
                  <span className="w-4 h-4 bg-yellow-300 border-2 border-black rounded-full text-[9px] flex items-center justify-center font-black animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </>
          ) : null}
        </nav>

        <div className="flex items-center space-x-4">
          {/* Mobile or direct notification bell icon badge */}
          {user && (
            <Link 
              href="/notifications" 
              className="md:hidden relative p-2 bg-yellow-300 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              title="Notifications"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white border border-yellow-300 rounded-full text-[10px] flex items-center justify-center font-black">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="flex items-center space-x-3">
              <span className="text-xs font-black uppercase bg-yellow-300 border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {user.name} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-black text-white text-xs font-black uppercase border-2 border-black hover:bg-red-200 hover:text-black transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Link
                href="/login"
                className="px-4 py-1.5 bg-white text-black text-xs font-black uppercase border-2 border-black hover:bg-yellow-300 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 bg-black text-white text-xs font-black uppercase border-2 border-black hover:bg-yellow-300 hover:text-black transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}