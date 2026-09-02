'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('pulsecare_users') || '[]');
    const found = users.find((u: any) => u.email === email && u.password === password);

    if (found) {
      localStorage.setItem('pulsecare_current_user', JSON.stringify({ name: found.name, email: found.email, role: found.role }));
      if (found.role === 'doctor') {
        router.push('/doctor/appointments');
      } else {
        router.push('/user/my-appointments');
      }
    } else {
      if (email === 'doctor@pulsecare.com' && password === 'password') {
        const docUser = { name: 'Dr. House', email: 'doctor@pulsecare.com', role: 'doctor' };
        localStorage.setItem('pulsecare_current_user', JSON.stringify(docUser));
        router.push('/doctor/appointments');
        return;
      }
      setError('Invalid credentials or unregistered user.');
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden bg-white text-black font-sans">
      {/* Background Doctor/Clinic Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 filter brightness-50"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=1920&auto=format&fit=crop')`
        }}
      ></div>

      <div className="relative z-25 max-w-md w-full bg-white border-4 border-black p-8 sm:p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] space-y-6">
        <div className="text-center space-y-2">
          <span className="inline-block px-3 py-1 bg-black text-white text-[10px] font-black tracking-widest uppercase">
            PulseCare Portal
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight">Portal Login</h1>
          <p className="text-xs text-gray-600 font-bold">Enter your registered credentials to access your dashboard.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-200 border-2 border-black text-xs font-black uppercase text-red-900">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-sm font-medium">
          <div>
            <label className="block text-xs font-black uppercase mb-1">Email Address</label>
            <input
              required
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border-2 border-black text-xs font-bold bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase mb-1">Password</label>
            <input
              required
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border-2 border-black text-xs font-bold bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-black text-white font-black text-xs uppercase tracking-wider border-2 border-black hover:bg-yellow-300 hover:text-black transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-2"
          >
            Login to Dashboard
          </button>
        </form>

        <div className="pt-4 border-t-2 border-black text-center text-xs font-bold">
          Don't have an account yet?{' '}
          <Link href="/register" className="underline font-black hover:text-gray-700">
            Register an account
          </Link>
        </div>
      </div>
    </main>
  );
}