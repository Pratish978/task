'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<'user' | 'doctor'>('user');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    // Doctor specific fields
    specialty: 'General Practitioner',
    experience: '',
    qualification: '',
    consultationFee: '',
    availableDays: 'Monday - Friday',
    availableTime: '09:00 AM - 05:00 PM',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const existingUsers = JSON.parse(localStorage.getItem('pulsecare_users') || '[]');
    
    // Check if email already exists
    const userExists = existingUsers.some((u: any) => u.email === formData.email);
    if (userExists) {
      alert('An account with this email already exists. Please login.');
      return;
    }

    const newUser = {
      ...formData,
      role,
      id: 'user-' + Date.now(),
    };

    existingUsers.push(newUser);
    localStorage.setItem('pulsecare_users', JSON.stringify(existingUsers));
    alert('Registration successful! Please login with your credentials.');
    router.push('/login');
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden bg-white text-black">
      {/* Background Doctor/Clinic Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 filter brightness-50"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=1920&auto=format&fit=crop')`
        }}
      ></div>

      <div className="relative z-20 max-w-xl w-full bg-white border-2 border-black p-8 sm:p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] space-y-6">
        <div className="text-center space-y-2">
          <span className="inline-block px-3 py-1 bg-black text-white text-xs font-bold tracking-widest uppercase">
            PulseCare Portal
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight">Create Account</h1>
          <p className="text-sm text-gray-600 font-medium">Register to access specialized healthcare management services.</p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 border-2 border-black">
          <button
            type="button"
            onClick={() => setRole('user')}
            className={`py-2 text-xs font-bold uppercase transition ${role === 'user' ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-black hover:bg-gray-200'}`}
          >
            Patient / User
          </button>
          <button
            type="button"
            onClick={() => setRole('doctor')}
            className={`py-2 text-xs font-bold uppercase transition ${role === 'doctor' ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-black hover:bg-gray-200'}`}
          >
            Doctor Specialist
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 text-sm font-medium">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Full Name</label>
              <input
                required
                type="text"
                name="name"
                placeholder={role === 'doctor' ? 'Dr. Alex Morgan' : 'John Doe'}
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2.5 border-2 border-black bg-white focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Email Address</label>
              <input
                required
                type="email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2.5 border-2 border-black bg-white focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-1">Password</label>
            <input
              required
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2.5 border-2 border-black bg-white focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Conditional Fields for Doctor Profile */}
          {role === 'doctor' && (
            <div className="p-4 border-2 border-black bg-gray-50 space-y-4 mt-4">
              <p className="text-xs font-black uppercase text-black tracking-wider border-b border-black pb-1">Doctor Professional Details</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Medical Specialty</label>
                  <select
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleChange}
                    className="w-full p-2.5 border-2 border-black bg-white text-sm"
                  >
                    <option value="General Practitioner">General Practitioner</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="Orthopedic Surgeon">Orthopedic Surgeon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Experience (Years)</label>
                  <input
                    required
                    type="number"
                    name="experience"
                    placeholder="e.g. 8"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full p-2.5 border-2 border-black bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Qualification</label>
                  <input
                    required
                    type="text"
                    name="qualification"
                    placeholder="e.g. MBBS, MD (Cardiology)"
                    value={formData.qualification}
                    onChange={handleChange}
                    className="w-full p-2.5 border-2 border-black bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Consultation Fee ($)</label>
                  <input
                    required
                    type="number"
                    name="consultationFee"
                    placeholder="e.g. 150"
                    value={formData.consultationFee}
                    onChange={handleChange}
                    className="w-full p-2.5 border-2 border-black bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Available Days</label>
                  <input
                    required
                    type="text"
                    name="availableDays"
                    placeholder="e.g. Mon - Fri"
                    value={formData.availableDays}
                    onChange={handleChange}
                    className="w-full p-2.5 border-2 border-black bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Shift Timing</label>
                  <input
                    required
                    type="text"
                    name="availableTime"
                    placeholder="e.g. 09:00 AM - 04:00 PM"
                    value={formData.availableTime}
                    onChange={handleChange}
                    className="w-full p-2.5 border-2 border-black bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-black text-white font-bold uppercase tracking-wider border-2 border-black hover:bg-white hover:text-black transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-4"
          >
            Complete Registration
          </button>
        </form>

        <div className="pt-4 border-t border-black text-center text-xs font-semibold">
          Already registered?{' '}
          <Link href="/login" className="underline font-bold hover:text-gray-700">
            Login to your portal
          </Link>
        </div>
      </div>
    </main>
  );
}