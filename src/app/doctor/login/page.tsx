// src/app/doctor/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Role = "doctor" | "patient";

export default function LoginPage() {
  const [role, setRole] = useState<Role>("doctor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    setError("");
    setEmail("");
    setPassword("");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Please enter your email and password.");
      setLoading(false);
      return;
    }

    // =========================================================
    // DOCTOR LOGIN
    // =========================================================

    if (role === "doctor") {
      const doctorsString = localStorage.getItem(
        "schedula_registered_doctors"
      );

      const doctors = doctorsString
        ? JSON.parse(doctorsString)
        : [];

      const doctor = doctors.find(
        (doc: any) =>
          doc.email?.toLowerCase() === normalizedEmail &&
          doc.password === password
      );

      if (!doctor) {
        setError(
          "No registered doctor account was found with these credentials."
        );
        setLoading(false);
        return;
      }

      const sessionData = {
        id: doctor.id,
        email: doctor.email,
        name: doctor.name,
        specialty: doctor.specialty || "General Medicine",
        phone: doctor.phone || "",
        licenseNumber: doctor.licenseNumber || "",
        experience: doctor.experience || "",
        clinicName: doctor.clinicName || "",
        qualification: doctor.qualification || "",
        consultationFee: doctor.consultationFee || "0",
        role: "doctor",
        authenticatedAt: new Date().toISOString(),
      };

      localStorage.setItem(
        "clinician_session",
        JSON.stringify(sessionData)
      );

      localStorage.setItem(
        "schedula_current_doctor",
        JSON.stringify(sessionData)
      );

      document.cookie =
        "clinician_session=true; path=/; max-age=86400";

      window.location.href = "/doctor/dashboard";

      return;
    }

    // =========================================================
    // PATIENT LOGIN
    // =========================================================

    if (role === "patient") {
      const patientsString = localStorage.getItem(
        "schedula_registered_patients"
      );

      const patients = patientsString
        ? JSON.parse(patientsString)
        : [];

      const patient = patients.find(
        (user: any) =>
          user.email?.toLowerCase() === normalizedEmail &&
          user.password === password
      );

      if (!patient) {
        setError(
          "No registered patient account was found with these credentials."
        );
        setLoading(false);
        return;
      }

      const sessionData = {
        id: patient.id,
        email: patient.email,
        name: patient.name,
        phone: patient.phone || "",
        age: patient.age || "",
        gender: patient.gender || "",
        bloodGroup: patient.bloodGroup || "",
        emergencyContact: patient.emergencyContact || "",
        address: patient.address || "",
        role: "patient",
        authenticatedAt: new Date().toISOString(),
      };

      localStorage.setItem(
        "patient_session",
        JSON.stringify(sessionData)
      );

      localStorage.setItem(
        "schedula_current_patient",
        JSON.stringify(sessionData)
      );

      document.cookie =
        "patient_session=true; path=/; max-age=86400";

      window.location.href = "/patient/appointments";
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased overflow-hidden">

      {/* ===================================================== */}
      {/* BACKGROUND */}
      {/* ===================================================== */}

      <div className="fixed inset-0 pointer-events-none overflow-hidden">

        <div className="absolute -top-40 -left-40 w-[550px] h-[550px] bg-blue-400/20 rounded-full blur-[130px]" />

        <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] bg-violet-400/20 rounded-full blur-[130px]" />

        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-cyan-400/15 rounded-full blur-[130px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.04)_1px,transparent_0)] [background-size:24px_24px]" />

      </div>

      <div className="relative z-10 flex flex-col min-h-screen">

        <Navbar />

        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">

          <div className="w-full max-w-5xl">

            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div className="text-center mb-8">

              <div
                className={`mx-auto w-20 h-20 rounded-[28px] flex items-center justify-center text-4xl text-white shadow-2xl mb-6 ${
                  role === "doctor"
                    ? "bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 shadow-indigo-500/25"
                    : "bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 shadow-emerald-500/25"
                }`}
              >
                {role === "doctor" ? "🩺" : "👤"}
              </div>

              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-xl border border-slate-200 shadow-sm text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">

                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />

                Secure Healthcare Portal

              </span>

              <h1 className="mt-5 text-4xl sm:text-5xl font-black tracking-tight">

                Welcome{" "}
                <span
                  className={
                    role === "doctor"
                      ? "bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent"
                      : "bg-gradient-to-r from-emerald-500 to-cyan-600 bg-clip-text text-transparent"
                  }
                >
                  Back
                </span>

              </h1>

              <p className="mt-3 text-sm text-slate-500">
                Sign in to access your Schedula healthcare workspace.
              </p>

            </div>

            {/* ================================================= */}
            {/* LOGIN CARD */}
            {/* ================================================= */}

            <div className="max-w-xl mx-auto bg-white/75 backdrop-blur-2xl border border-white rounded-[40px] shadow-[0_30px_100px_rgba(15,23,42,0.12)] overflow-hidden">

              {/* ROLE SELECTOR */}

              <div className="p-5 sm:p-6 border-b border-slate-200/70">

                <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
                  Sign in as
                </p>

                <div className="grid grid-cols-2 gap-3">

                  {/* Doctor */}

                  <button
                    type="button"
                    onClick={() =>
                      handleRoleChange("doctor")
                    }
                    className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                      role === "doctor"
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-lg shadow-blue-500/10"
                        : "border-slate-200 bg-white hover:border-blue-200"
                    }`}
                  >

                    <div className="text-2xl">
                      🩺
                    </div>

                    <p className="font-black text-sm mt-1">
                      Doctor
                    </p>

                    {role === "doctor" && (
                      <span className="absolute right-3 top-3 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center">
                        ✓
                      </span>
                    )}

                  </button>

                  {/* Patient */}

                  <button
                    type="button"
                    onClick={() =>
                      handleRoleChange("patient")
                    }
                    className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                      role === "patient"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg shadow-emerald-500/10"
                        : "border-slate-200 bg-white hover:border-emerald-200"
                    }`}
                  >

                    <div className="text-2xl">
                      👤
                    </div>

                    <p className="font-black text-sm mt-1">
                      Patient
                    </p>

                    {role === "patient" && (
                      <span className="absolute right-3 top-3 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center">
                        ✓
                      </span>
                    )}

                  </button>

                </div>

              </div>

              {/* ================================================= */}
              {/* FORM */}
              {/* ================================================= */}

              <form
                onSubmit={handleLogin}
                className="p-7 sm:p-10"
              >

                {/* FORM HEADER */}

                <div className="mb-7">

                  <p
                    className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                      role === "doctor"
                        ? "text-blue-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {role === "doctor"
                      ? "Clinician Access"
                      : "Patient Access"}
                  </p>

                  <h2 className="text-2xl font-black mt-2">
                    Sign in to your account
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    Use the email and password you registered with.
                  </p>

                </div>

                {/* ERROR */}

                {error && (
                  <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200">

                    <span className="text-lg">
                      ⚠️
                    </span>

                    <p className="text-xs font-bold text-rose-700 leading-relaxed">
                      {error}
                    </p>

                  </div>
                )}

                {/* EMAIL */}

                <div className="mb-5">

                  <label className="block text-xs font-black text-slate-700 mb-2">
                    Email Address
                  </label>

                  <div className="relative">

                    <span className="absolute left-4 top-1/2 -translate-y-1/2">
                      ✉️
                    </span>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      placeholder={
                        role === "doctor"
                          ? "doctor@example.com"
                          : "patient@example.com"
                      }
                      className={`w-full pl-11 pr-4 py-4 bg-slate-50/80 border border-slate-200 rounded-2xl outline-none text-sm font-medium transition-all ${
                        role === "doctor"
                          ? "focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                          : "focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                      }`}
                      required
                    />

                  </div>

                </div>

                {/* PASSWORD */}

                <div className="mb-3">

                  <div className="flex items-center justify-between mb-2">

                    <label className="text-xs font-black text-slate-700">
                      Password
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        setError(
                          "Password recovery is not available in this demo."
                        )
                      }
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-900"
                    >
                      Forgot password?
                    </button>

                  </div>

                  <div className="relative">

                    <span className="absolute left-4 top-1/2 -translate-y-1/2">
                      🔒
                    </span>

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="Enter your password"
                      className={`w-full pl-11 pr-12 py-4 bg-slate-50/80 border border-slate-200 rounded-2xl outline-none text-sm font-medium transition-all ${
                        role === "doctor"
                          ? "focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                          : "focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                      }`}
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-sm"
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>

                  </div>

                </div>

                {/* REMEMBER */}

                <label className="flex items-center gap-2 mt-5 cursor-pointer select-none">

                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded accent-blue-600"
                  />

                  <span className="text-xs text-slate-500 font-medium">
                    Keep me signed in
                  </span>

                </label>

                {/* LOGIN */}

                <button
                  type="submit"
                  disabled={loading}
                  className={`relative overflow-hidden w-full mt-7 py-4 rounded-2xl text-white font-black text-xs uppercase tracking-[0.15em] shadow-xl transition-all duration-300 hover:scale-[1.01] disabled:opacity-60 disabled:hover:scale-100 ${
                    role === "doctor"
                      ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 shadow-indigo-500/20"
                      : "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 shadow-emerald-500/20"
                  }`}
                >

                  {loading ? (
                    <span className="flex items-center justify-center gap-3">

                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                      Authenticating...

                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      Sign In Securely
                      <span className="text-base">
                        →
                      </span>
                    </span>
                  )}

                </button>

                {/* REGISTER */}

                <div className="mt-7 pt-6 border-t border-slate-200 text-center">

                  <p className="text-xs text-slate-500">

                    Don't have an account?{" "}

                    <Link
                      href="/doctor/register"
                      className={`font-black hover:underline ${
                        role === "doctor"
                          ? "text-blue-600"
                          : "text-emerald-600"
                      }`}
                    >
                      Create one
                    </Link>

                  </p>

                </div>

              </form>
            </div>

            {/* SECURITY */}

            <div className="flex flex-wrap items-center justify-center gap-5 mt-7 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400">

              <span>
                🔒 Secure Access
              </span>

              <span>•</span>

              <span>
                🏥 Healthcare Platform
              </span>

              <span>•</span>

              <span>
                ⚡ Fast Authentication
              </span>

            </div>

          </div>
        </main>

        <Footer />

      </div>
    </div>
  );
}