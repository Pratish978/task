import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Professional Doctor / Clinic Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 filter brightness-90"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=1920&auto=format&fit=crop')`
        }}
      ></div>
      
      {/* Subtle Dark Overlay for contrast */}
      <div className="absolute inset-0 bg-black/30 z-10"></div>

      {/* Central Content Card */}
      <div className="relative z-20 max-w-lg w-full bg-white border-2 border-black p-8 sm:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center space-y-8">
        <div className="space-y-3">
          <span className="inline-block px-3 py-1 bg-black text-white text-xs font-bold tracking-widest uppercase">
            Clinical Operations Hub
          </span>
          <h1 className="text-4xl font-black tracking-tight text-black">PulseCare</h1>
          <p className="text-sm text-gray-600 font-medium">
            Next-generation doctor and patient appointment management system. Experience seamless scheduling, prescriptions, and secure portal access.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link
            href="/login"
            className="flex-1 py-3 px-6 bg-black text-white font-bold border-2 border-black hover:bg-white hover:text-black transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center uppercase text-sm"
          >
            Login Portal
          </Link>
          <Link
            href="/register"
            className="flex-1 py-3 px-6 bg-white text-black font-bold border-2 border-black hover:bg-black hover:text-white transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center uppercase text-sm"
          >
            Register Account
          </Link>
        </div>
      </div>
    </main>
  );
}