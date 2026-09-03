"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-stone-900 flex flex-col">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-500/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1">
          {/* HERO */}
          <section className="max-w-7xl mx-auto px-6 sm:px-10 py-24">
            <div className="text-center max-w-5xl mx-auto">
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/80 backdrop-blur-xl border border-white shadow-lg text-xs font-black uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Trusted by Healthcare Professionals
              </span>

              <h1 className="mt-8 text-5xl sm:text-7xl font-black leading-tight tracking-tight">
                Modern Healthcare
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-600 bg-clip-text text-transparent">
                  Management Platform
                </span>
              </h1>

              <p className="mt-6 text-lg text-stone-600 max-w-3xl mx-auto leading-relaxed">
                Streamline appointments, prescriptions, patient records,
                scheduling, and clinical workflows with a secure and beautifully
                designed healthcare operating system.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
                <Link
                  href="/doctor/login"
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-black shadow-xl hover:scale-105 transition"
                >
                  🩺 Clinician Portal
                </Link>

                <Link
                  href="/patient/appointments"
                  className="px-8 py-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-white font-black shadow-lg hover:scale-105 transition"
                >
                  👤 Patient Portal
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-20">
              {[
                ["50K+", "Appointments"],
                ["500+", "Clinics"],
                ["99.9%", "Uptime"],
                ["24/7", "Support"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="bg-white/70 backdrop-blur-2xl border border-white rounded-3xl p-6 text-center shadow-xl"
                >
                  <h3 className="text-3xl font-black">{value}</h3>
                  <p className="text-stone-500 text-sm mt-2">{label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FEATURES */}
          <section className="max-w-7xl mx-auto px-6 sm:px-10 py-20">
            <div className="text-center mb-14">
              <h2 className="text-4xl font-black">
                Everything You Need In One Platform
              </h2>
              <p className="text-stone-600 mt-4">
                Powerful tools designed for modern healthcare teams.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: "🗓️",
                  title: "Smart Scheduling",
                  text: "Prevent double bookings and manage appointments effortlessly.",
                },
                {
                  icon: "💊",
                  title: "Digital Prescriptions",
                  text: "Create prescriptions instantly with secure patient syncing.",
                },
                {
                  icon: "📋",
                  title: "Patient Records",
                  text: "Maintain comprehensive medical histories in one place.",
                },
                {
                  icon: "🔒",
                  title: "Secure Platform",
                  text: "Enterprise-grade security and protected patient data.",
                },
                {
                  icon: "⚡",
                  title: "Real-Time Updates",
                  text: "Instant appointment changes and notifications.",
                },
                {
                  icon: "📈",
                  title: "Analytics",
                  text: "Gain insights into clinic performance and patient trends.",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="group bg-white/70 backdrop-blur-2xl border border-white rounded-[32px] p-8 shadow-xl hover:-translate-y-2 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-2xl text-white">
                    {feature.icon}
                  </div>

                  <h3 className="mt-6 text-xl font-black">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-stone-600 leading-relaxed">
                    {feature.text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* WHY CHOOSE US */}
          <section className="max-w-7xl mx-auto px-6 sm:px-10 py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-blue-600 font-black uppercase text-sm">
                  Why Choose Us
                </span>

                <h2 className="text-5xl font-black mt-4">
                  Built For Modern Healthcare Teams
                </h2>

                <p className="mt-6 text-stone-600 leading-relaxed">
                  Designed for clinics, hospitals, and independent
                  practitioners seeking a seamless healthcare experience.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  "AI Assisted Scheduling",
                  "Instant Prescription Management",
                  "Cloud Synchronization",
                  "Smart Patient Records",
                  "Enterprise Security",
                ].map((item) => (
                  <div
                    key={item}
                    className="bg-white/70 backdrop-blur-xl border border-white rounded-2xl p-5 shadow-lg"
                  >
                    ✅ {item}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* TESTIMONIALS */}
          <section className="max-w-7xl mx-auto px-6 sm:px-10 py-20">
            <h2 className="text-center text-4xl font-black mb-12">
              Loved By Healthcare Professionals
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                "Reduced appointment management workload by over 70%.",
                "The cleanest healthcare software we've ever used.",
                "Patient management became significantly easier.",
              ].map((review) => (
                <div
                  key={review}
                  className="bg-white/70 backdrop-blur-xl border border-white rounded-[32px] p-8 shadow-xl"
                >
                  <div className="text-yellow-500 text-xl">★★★★★</div>
                  <p className="mt-4 text-stone-600">{review}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="max-w-7xl mx-auto px-6 sm:px-10 py-24">
            <div className="rounded-[40px] bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-600 p-12 md:p-16 text-center text-white shadow-2xl">
              <h2 className="text-4xl md:text-5xl font-black">
                Ready To Transform Your Practice?
              </h2>

              <p className="mt-4 text-white/90 max-w-2xl mx-auto">
                Join thousands of clinicians and healthcare teams already using
                our platform.
              </p>

              <Link
                href="/doctor/login"
                className="inline-flex mt-8 px-8 py-4 rounded-2xl bg-white text-stone-900 font-black hover:scale-105 transition"
              >
                Get Started →
              </Link>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}