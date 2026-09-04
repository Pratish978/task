"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CareAssistant from "@/components/CareAssistant";

export default function HomePage() {
  const features = [
    {
      icon: "🗓️",
      title: "Smart Scheduling",
      text: "Prevent double bookings and manage appointments effortlessly.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: "💊",
      title: "Digital Prescriptions",
      text: "Create prescriptions instantly with secure patient syncing.",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      icon: "📋",
      title: "Patient Records",
      text: "Maintain comprehensive medical histories in one place.",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      icon: "🔒",
      title: "Secure Platform",
      text: "Enterprise-grade security and protected patient data.",
      gradient: "from-orange-500 to-amber-500",
    },
    {
      icon: "⚡",
      title: "Real-Time Updates",
      text: "Instant appointment changes and notifications.",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      icon: "📈",
      title: "Analytics",
      text: "Gain insights into clinic performance and patient trends.",
      gradient: "from-indigo-500 to-blue-500",
    },
  ];

  const benefits = [
    "AI Assisted Scheduling",
    "Instant Prescription Management",
    "Cloud Synchronization",
    "Smart Patient Records",
    "Enterprise Security",
  ];

  const testimonials = [
    {
      text: "Reduced appointment management workload by over 70%.",
      role: "Clinic Administrator",
      avatar: "CA",
    },
    {
      text: "The cleanest healthcare software we've ever used.",
      role: "Healthcare Professional",
      avatar: "HP",
    },
    {
      text: "Patient management became significantly easier.",
      role: "Medical Practitioner",
      avatar: "MP",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-stone-900">
      {/* =========================================================
          BACKGROUND
      ========================================================= */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-blue-500/10 blur-[130px]" />

        <div className="absolute top-[30%] -right-32 w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[130px]" />

        <div className="absolute bottom-0 left-[30%] w-[450px] h-[450px] rounded-full bg-cyan-500/10 blur-[130px]" />
      </div>

      {/* Decorative grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />

        <main className="flex-1">
          {/* =========================================================
              AI ASSISTANT TOP BAR
          ========================================================= */}
          <section className="px-4 sm:px-6 lg:px-10 pt-5">
            <div className="max-w-7xl mx-auto">
              <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-white/80 backdrop-blur-xl shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-violet-50 to-cyan-50 opacity-80" />

                <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-lg">
                        🤖
                      </div>

                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>

                    <div>
                      <p className="font-black text-sm">
                        Meet Schedula AI Care Assistant
                      </p>

                      <p className="text-xs text-stone-500">
                        Get instant help with appointments, healthcare
                        information and Schedula.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      window.dispatchEvent(
                        new CustomEvent("open-care-assistant")
                      );
                    }}
                    className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-black shadow-lg shadow-blue-500/20 hover:shadow-xl hover:scale-[1.03] transition-all"
                  >
                    <span>💬</span>
                    Ask AI Assistant
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* =========================================================
              HERO
          ========================================================= */}
          <section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-16 sm:pt-24 pb-20">
            <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
              {/* LEFT */}
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>

                  <span className="text-xs font-black uppercase tracking-widest text-stone-600">
                    Modern Healthcare Platform
                  </span>
                </div>

                <h1 className="mt-7 text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight">
                  Healthcare
                  <br />

                  <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent">
                    Made Smarter.
                  </span>
                </h1>

                <p className="mt-7 text-lg sm:text-xl text-stone-600 leading-relaxed max-w-xl">
                  Streamline appointments, prescriptions, patient records and
                  clinical workflows with a secure healthcare management
                  platform designed for modern teams.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-9">
                  <Link
                    href="/doctor/login"
                    className="group inline-flex items-center justify-center gap-3 px-7 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-black shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:scale-[1.03] transition-all"
                  >
                    <span className="text-xl">🩺</span>
                    Clinician Portal
                    <span className="group-hover:translate-x-1 transition">
                      →
                    </span>
                  </Link>

                  <Link
                    href="/patient/appointments"
                    className="inline-flex items-center justify-center gap-3 px-7 py-4 rounded-2xl bg-white border border-slate-200 text-stone-800 font-black shadow-lg hover:shadow-xl hover:bg-slate-50 hover:scale-[1.03] transition-all"
                  >
                    <span className="text-xl">👤</span>
                    Patient Portal
                  </Link>
                </div>

                {/* Trust */}
                <div className="flex flex-wrap items-center gap-5 mt-9 text-sm text-stone-500">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span>
                    Secure Platform
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span>
                    AI Assisted
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span>
                    24/7 Available
                  </div>
                </div>
              </div>

              {/* RIGHT VISUAL */}
              <div className="relative">
                {/* Glow */}
                <div className="absolute inset-10 bg-blue-500/20 blur-[80px] rounded-full" />

                {/* Main dashboard card */}
                <div className="relative rounded-[35px] border border-white bg-white/80 backdrop-blur-2xl shadow-2xl shadow-blue-900/10 p-4 sm:p-6">
                  {/* Browser top */}
                  <div className="flex items-center justify-between px-2 pb-5">
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-300" />
                      <span className="w-3 h-3 rounded-full bg-yellow-300" />
                      <span className="w-3 h-3 rounded-full bg-green-300" />
                    </div>

                    <div className="px-4 py-1.5 rounded-full bg-slate-100 text-[10px] font-bold text-stone-400">
                      SCHEDULA
                    </div>

                    <div className="w-10" />
                  </div>

                  {/* Dashboard */}
                  <div className="rounded-3xl bg-gradient-to-br from-slate-50 to-blue-50 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-stone-400 font-bold">
                          TODAY
                        </p>

                        <h3 className="text-xl font-black mt-1">
                          Good morning 👋
                        </h3>
                      </div>

                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white flex items-center justify-center">
                        🩺
                      </div>
                    </div>

                    {/* Dashboard stats */}
                    <div className="grid grid-cols-2 gap-3 mt-6">
                      <div className="bg-white rounded-2xl p-4 shadow-sm">
                        <p className="text-xs text-stone-400">
                          Appointments
                        </p>

                        <p className="text-2xl font-black mt-1">24</p>

                        <span className="text-xs text-emerald-500 font-bold">
                          +12% today
                        </span>
                      </div>

                      <div className="bg-white rounded-2xl p-4 shadow-sm">
                        <p className="text-xs text-stone-400">
                          Patients
                        </p>

                        <p className="text-2xl font-black mt-1">148</p>

                        <span className="text-xs text-blue-500 font-bold">
                          Active
                        </span>
                      </div>
                    </div>

                    {/* Appointment */}
                    <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                            👨‍⚕️
                          </div>

                          <div>
                            <p className="text-sm font-black">
                              Dr. Consultation
                            </p>

                            <p className="text-xs text-stone-400">
                              10:30 AM • Cardiology
                            </p>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black">
                          CONFIRMED
                        </span>
                      </div>
                    </div>

                    {/* AI card */}
                    <div className="mt-4 rounded-2xl bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 p-4 text-white shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                          🤖
                        </div>

                        <div>
                          <p className="text-sm font-black">
                            Schedula AI
                          </p>

                          <p className="text-xs text-white/75">
                            Your care assistant is ready
                          </p>
                        </div>

                        <span className="ml-auto w-2.5 h-2.5 rounded-full bg-emerald-300 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -left-5 top-16 hidden sm:flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-100 shadow-xl">
                  <span className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                    ✓
                  </span>

                  <div>
                    <p className="text-xs font-black">Secure</p>
                    <p className="text-[10px] text-stone-400">
                      Healthcare data
                    </p>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -right-5 bottom-14 hidden sm:flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-100 shadow-xl">
                  <span className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
                    🤖
                  </span>

                  <div>
                    <p className="text-xs font-black">AI Powered</p>
                    <p className="text-[10px] text-stone-400">
                      Always available
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* =====================================================
                STATS
            ===================================================== */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20">
              {[
                ["50K+", "Appointments"],
                ["500+", "Clinics"],
                ["99.9%", "Uptime"],
                ["24/7", "AI Support"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="group rounded-3xl border border-white bg-white/75 backdrop-blur-xl p-6 text-center shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all"
                >
                  <h3 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                    {value}
                  </h3>

                  <p className="text-stone-500 text-sm mt-2 font-medium">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* =========================================================
              FEATURES
          ========================================================= */}
          <section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-24">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="inline-block px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest">
                Powerful Features
              </span>

              <h2 className="mt-5 text-4xl sm:text-5xl font-black tracking-tight">
                Everything You Need
                <br />
                <span className="text-stone-400">
                  In One Platform
                </span>
              </h2>

              <p className="mt-5 text-stone-600 leading-relaxed">
                Powerful tools designed to simplify healthcare management for
                clinicians, clinics and patients.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group relative overflow-hidden rounded-[30px] border border-white bg-white/75 backdrop-blur-xl p-7 shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl shadow-lg`}
                  >
                    {feature.icon}
                  </div>

                  <h3 className="mt-6 text-xl font-black">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-stone-600 leading-relaxed">
                    {feature.text}
                  </p>

                  <div className="mt-6 text-sm font-black text-blue-600 opacity-0 group-hover:opacity-100 transition">
                    Explore feature →
                  </div>

                  <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-blue-500/5 group-hover:bg-blue-500/10 transition" />
                </div>
              ))}
            </div>
          </section>

          {/* =========================================================
              AI FEATURE SECTION
          ========================================================= */}
          <section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-10">
            <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 p-8 sm:p-12 lg:p-16 text-white shadow-2xl">
              {/* Glow */}
              <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-500/20 blur-[100px]" />

              <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-violet-500/20 blur-[100px]" />

              <div className="relative grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-xl">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

                    <span className="text-xs font-black uppercase tracking-widest">
                      Powered By AI
                    </span>
                  </div>

                  <h2 className="mt-6 text-4xl sm:text-5xl font-black leading-tight">
                    Meet Your
                    <br />
                    <span className="text-cyan-300">
                      AI Care Assistant
                    </span>
                  </h2>

                  <p className="mt-5 text-white/70 leading-relaxed max-w-xl">
                    Have a question? Schedula AI can help you understand the
                    platform, find appointment information and provide general
                    healthcare guidance.
                  </p>

                  <button
                    onClick={() => {
                      window.dispatchEvent(
                        new CustomEvent("open-care-assistant")
                      );
                    }}
                    className="mt-8 inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-white text-stone-900 font-black shadow-xl hover:scale-105 transition"
                  >
                    🤖 Chat With Schedula AI
                    <span>→</span>
                  </button>
                </div>

                {/* AI preview */}
                <div className="relative">
                  <div className="rounded-[30px] bg-white/10 backdrop-blur-2xl border border-white/10 p-5">
                    <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                        🤖
                      </div>

                      <div>
                        <p className="font-black">Schedula AI</p>

                        <div className="flex items-center gap-2 text-xs text-white/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Online
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 py-5">
                      <div className="flex justify-end">
                        <div className="max-w-[75%] bg-blue-600 rounded-2xl rounded-br-md px-4 py-3 text-sm">
                          How can I book an appointment?
                        </div>
                      </div>

                      <div className="flex justify-start">
                        <div className="max-w-[82%] bg-white/10 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-white/80">
                          You can book an appointment through the Patient
                          Portal. Choose a doctor, select an available time,
                          and confirm your appointment. 😊
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-white/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
                        AI Assistant is ready to help
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =========================================================
              WHY CHOOSE US
          ========================================================= */}
          <section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-28">
            <div className="grid lg:grid-cols-2 gap-14 items-center">
              <div>
                <span className="text-blue-600 font-black uppercase text-xs tracking-widest">
                  Why Choose Schedula
                </span>

                <h2 className="text-4xl sm:text-5xl font-black mt-5 leading-tight">
                  Built For
                  <br />
                  <span className="text-stone-400">
                    Modern Healthcare Teams
                  </span>
                </h2>

                <p className="mt-6 text-stone-600 leading-relaxed max-w-xl">
                  Designed for clinics, hospitals and independent practitioners
                  seeking a seamless, intelligent and reliable healthcare
                  experience.
                </p>

                <Link
                  href="/doctor/login"
                  className="inline-flex items-center gap-2 mt-8 px-6 py-3.5 rounded-2xl bg-stone-900 text-white font-black shadow-lg hover:bg-stone-800 hover:scale-105 transition"
                >
                  Explore Schedula
                  <span>→</span>
                </Link>
              </div>

              <div className="space-y-4">
                {benefits.map((item, index) => (
                  <div
                    key={item}
                    className="group flex items-center gap-4 bg-white/75 backdrop-blur-xl border border-white rounded-2xl p-5 shadow-lg hover:-translate-x-1 hover:shadow-xl transition-all"
                  >
                    <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 text-white flex items-center justify-center font-black">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <span className="font-black text-stone-800">
                      {item}
                    </span>

                    <span className="ml-auto text-emerald-500 font-black">
                      ✓
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* =========================================================
              TESTIMONIALS
          ========================================================= */}
          <section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-24">
            <div className="text-center mb-14">
              <span className="text-blue-600 font-black uppercase text-xs tracking-widest">
                Testimonials
              </span>

              <h2 className="text-4xl sm:text-5xl font-black mt-4">
                Loved By Healthcare
                <br />
                <span className="text-stone-400">
                  Professionals
                </span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.text}
                  className="bg-white/75 backdrop-blur-xl border border-white rounded-[30px] p-7 shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all"
                >
                  <div className="text-yellow-500 tracking-widest text-lg">
                    ★★★★★
                  </div>

                  <p className="mt-5 text-stone-600 leading-relaxed">
                    “{testimonial.text}”
                  </p>

                  <div className="flex items-center gap-3 mt-7 pt-5 border-t border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-white flex items-center justify-center text-xs font-black">
                      {testimonial.avatar}
                    </div>

                    <div>
                      <p className="text-sm font-black">
                        Verified User
                      </p>

                      <p className="text-xs text-stone-400">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* =========================================================
              CTA
          ========================================================= */}
          <section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-24">
            <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 p-10 sm:p-14 lg:p-20 text-center text-white shadow-2xl">
              <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />

              <div className="absolute -bottom-24 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />

              <div className="relative">
                <span className="inline-block px-4 py-2 rounded-full bg-white/15 border border-white/20 text-xs font-black uppercase tracking-widest">
                  Get Started Today
                </span>

                <h2 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
                  Ready To Transform
                  <br />
                  Your Practice?
                </h2>

                <p className="mt-5 text-white/85 max-w-2xl mx-auto leading-relaxed">
                  Join clinicians and healthcare teams using Schedula to
                  simplify their daily workflow.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-9">
                  <Link
                    href="/doctor/login"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-stone-900 font-black shadow-xl hover:scale-105 transition"
                  >
                    🩺 Get Started
                    <span>→</span>
                  </Link>

                  <button
                    onClick={() => {
                      window.dispatchEvent(
                        new CustomEvent("open-care-assistant")
                      );
                    }}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl text-white font-black hover:bg-white/20 hover:scale-105 transition"
                  >
                    🤖 Ask AI
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>

      {/* =========================================================
          AI CARE ASSISTANT
      ========================================================= */}
      <CareAssistant />
    </div>
  );
}