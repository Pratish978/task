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
    setShowPassword(false);
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
      try {
        const doctorsString = localStorage.getItem(
          "schedula_registered_doctors"
        );

        const doctors = doctorsString ? JSON.parse(doctorsString) : [];

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
      } catch {
        setError("Something went wrong while signing you in.");
        setLoading(false);
        return;
      }
    }

    // =========================================================
    // PATIENT LOGIN
    // =========================================================

    if (role === "patient") {
      try {
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
      } catch {
        setError("Something went wrong while signing you in.");
        setLoading(false);
      }
    }
  };

  const isDoctor = role === "doctor";

  return (
    <div className="relative min-h-screen bg-[#f7f9fc] text-slate-900 flex flex-col overflow-hidden antialiased">

      {/* ===================================================== */}
      {/* AMBIENT BACKGROUND */}
      {/* ===================================================== */}

      <div className="fixed inset-0 pointer-events-none overflow-hidden">

        <div
          className={`absolute -top-48 -left-40 w-[600px] h-[600px] rounded-full blur-[120px] transition-all duration-700 ${
            isDoctor
              ? "bg-blue-400/20"
              : "bg-emerald-400/20"
          }`}
        />

        <div
          className={`absolute top-[35%] -right-48 w-[600px] h-[600px] rounded-full blur-[140px] transition-all duration-700 ${
            isDoctor
              ? "bg-violet-400/15"
              : "bg-cyan-400/15"
          }`}
        />

        <div className="absolute -bottom-56 left-[30%] w-[500px] h-[500px] bg-indigo-300/10 rounded-full blur-[120px]" />

        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.045)_1px,transparent_0)] [background-size:26px_26px]" />

      </div>

      <div className="relative z-10 flex min-h-screen flex-col">

        <Navbar />

        {/* =================================================== */}
        {/* MAIN */}
        {/* =================================================== */}

        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10 sm:py-14">

          <div className="w-full max-w-[1080px]">

            {/* ================================================= */}
            {/* PAGE HEADER */}
            {/* ================================================= */}

            <div className="text-center mb-8 sm:mb-10">

              {/* Logo */}
              <div
                className={`relative mx-auto w-[76px] h-[76px] sm:w-[84px] sm:h-[84px] rounded-[26px] flex items-center justify-center mb-5 shadow-2xl transition-all duration-500 ${
                  isDoctor
                    ? "bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 shadow-indigo-500/25"
                    : "bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 shadow-emerald-500/25"
                }`}
              >

                <div className="absolute inset-[1px] rounded-[25px] bg-white/10" />

                <span className="relative text-[34px] sm:text-[38px]">
                  {isDoctor ? "🩺" : "👤"}
                </span>

              </div>

              {/* Secure badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-sm">

                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>

                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Secure Healthcare Portal
                </span>

              </div>

              <h1 className="mt-5 text-[36px] sm:text-[48px] font-black tracking-[-0.04em] leading-none">

                Welcome{" "}

                <span
                  className={
                    isDoctor
                      ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent"
                      : "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 bg-clip-text text-transparent"
                  }
                >
                  Back
                </span>

              </h1>

              <p className="mt-4 text-sm sm:text-[15px] text-slate-500 max-w-md mx-auto leading-relaxed">
                Sign in to access your Schedula healthcare workspace,
                appointments, and personalized care tools.
              </p>

            </div>

            {/* ================================================= */}
            {/* LOGIN CARD */}
            {/* ================================================= */}

            <div className="max-w-[520px] mx-auto">

              <div className="relative bg-white/90 backdrop-blur-2xl border border-white/80 rounded-[30px] sm:rounded-[36px] shadow-[0_25px_90px_rgba(15,23,42,0.10)] overflow-hidden">

                {/* Top accent */}
                <div
                  className={`absolute top-0 left-0 right-0 h-[3px] ${
                    isDoctor
                      ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500"
                      : "bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500"
                  }`}
                />

                {/* ================================================= */}
                {/* ROLE SELECTOR */}
                {/* ================================================= */}

                <div className="p-5 sm:p-7 border-b border-slate-100">

                  <div className="flex items-center justify-between mb-4">

                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                        Account Type
                      </p>

                      <p className="text-sm font-bold text-slate-700 mt-1">
                        Choose your portal
                      </p>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-sm">
                      🔐
                    </div>

                  </div>

                  <div className="grid grid-cols-2 gap-3">

                    {/* Doctor */}
                    <button
                      type="button"
                      onClick={() => handleRoleChange("doctor")}
                      className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                        isDoctor
                          ? "border-blue-500 bg-blue-50/80 shadow-lg shadow-blue-500/10"
                          : "border-slate-100 bg-slate-50/60 hover:bg-white hover:border-blue-200"
                      }`}
                    >

                      <div className="flex items-center gap-3">

                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all ${
                            isDoctor
                              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                              : "bg-white border border-slate-100 group-hover:border-blue-200"
                          }`}
                        >
                          🩺
                        </div>

                        <div className="text-left">

                          <p
                            className={`font-black text-sm ${
                              isDoctor
                                ? "text-blue-700"
                                : "text-slate-700"
                            }`}
                          >
                            Doctor
                          </p>

                          <p className="text-[9px] text-slate-400 mt-0.5">
                            Clinician portal
                          </p>

                        </div>

                      </div>

                      {isDoctor && (
                        <span className="absolute right-3 top-3 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-black">
                          ✓
                        </span>
                      )}

                    </button>

                    {/* Patient */}
                    <button
                      type="button"
                      onClick={() => handleRoleChange("patient")}
                      className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                        !isDoctor
                          ? "border-emerald-500 bg-emerald-50/80 shadow-lg shadow-emerald-500/10"
                          : "border-slate-100 bg-slate-50/60 hover:bg-white hover:border-emerald-200"
                      }`}
                    >

                      <div className="flex items-center gap-3">

                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all ${
                            !isDoctor
                              ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                              : "bg-white border border-slate-100 group-hover:border-emerald-200"
                          }`}
                        >
                          👤
                        </div>

                        <div className="text-left">

                          <p
                            className={`font-black text-sm ${
                              !isDoctor
                                ? "text-emerald-700"
                                : "text-slate-700"
                            }`}
                          >
                            Patient
                          </p>

                          <p className="text-[9px] text-slate-400 mt-0.5">
                            Care portal
                          </p>

                        </div>

                      </div>

                      {!isDoctor && (
                        <span className="absolute right-3 top-3 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-black">
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
                  className="p-6 sm:p-9"
                >

                  {/* Form heading */}

                  <div className="mb-7">

                    <div className="flex items-center gap-2">

                      <span
                        className={`w-2 h-2 rounded-full ${
                          isDoctor
                            ? "bg-blue-500"
                            : "bg-emerald-500"
                        }`}
                      />

                      <p
                        className={`text-[9px] font-black uppercase tracking-[0.2em] ${
                          isDoctor
                            ? "text-blue-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {isDoctor
                          ? "Clinician Access"
                          : "Patient Access"}
                      </p>

                    </div>

                    <h2 className="text-[24px] font-black tracking-tight mt-2">
                      Sign in to your account
                    </h2>

                    <p className="text-xs text-slate-400 mt-1.5">
                      Enter the credentials you used during registration.
                    </p>

                  </div>

                  {/* ================================================= */}
                  {/* ERROR */}
                  {/* ================================================= */}

                  {error && (
                    <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-100 animate-[fadeIn_0.2s_ease-out]">

                      <div className="shrink-0 w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center">
                        ⚠️
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-rose-500">
                          Sign in failed
                        </p>

                        <p className="text-xs font-semibold text-rose-700 leading-relaxed mt-0.5">
                          {error}
                        </p>
                      </div>

                    </div>
                  )}

                  {/* ================================================= */}
                  {/* EMAIL */}
                  {/* ================================================= */}

                  <div className="mb-5">

                    <label className="block text-[11px] font-black uppercase tracking-wide text-slate-600 mb-2.5">
                      Email Address
                    </label>

                    <div className="relative group">

                      <div
                        className={`absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          isDoctor
                            ? "bg-blue-50 text-blue-600 group-focus-within:bg-blue-100"
                            : "bg-emerald-50 text-emerald-600 group-focus-within:bg-emerald-100"
                        }`}
                      >
                        ✉
                      </div>

                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError("");
                        }}
                        placeholder={
                          isDoctor
                            ? "doctor@example.com"
                            : "patient@example.com"
                        }
                        className={`w-full pl-[60px] pr-4 py-[15px] bg-slate-50/70 border border-slate-200 rounded-2xl outline-none text-sm font-medium placeholder:text-slate-300 transition-all duration-200 ${
                          isDoctor
                            ? "focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                            : "focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                        }`}
                        autoComplete="email"
                        required
                      />

                    </div>

                  </div>

                  {/* ================================================= */}
                  {/* PASSWORD */}
                  {/* ================================================= */}

                  <div className="mb-2">

                    <div className="flex items-center justify-between mb-2.5">

                      <label className="text-[11px] font-black uppercase tracking-wide text-slate-600">
                        Password
                      </label>

                      <button
                        type="button"
                        onClick={() =>
                          setError(
                            "Password recovery is not available in this demo."
                          )
                        }
                        className="text-[10px] font-bold text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        Forgot password?
                      </button>

                    </div>

                    <div className="relative group">

                      <div
                        className={`absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          isDoctor
                            ? "bg-blue-50 text-blue-600 group-focus-within:bg-blue-100"
                            : "bg-emerald-50 text-emerald-600 group-focus-within:bg-emerald-100"
                        }`}
                      >
                        🔒
                      </div>

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
                        className={`w-full pl-[60px] pr-[52px] py-[15px] bg-slate-50/70 border border-slate-200 rounded-2xl outline-none text-sm font-medium placeholder:text-slate-300 transition-all duration-200 ${
                          isDoctor
                            ? "focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                            : "focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                        }`}
                        autoComplete="current-password"
                        required
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"
                      >
                        {showPassword ? "🙈" : "👁"}
                      </button>

                    </div>

                  </div>

                  {/* ================================================= */}
                  {/* REMEMBER ME */}
                  {/* ================================================= */}

                  <label className="flex items-center gap-2.5 mt-5 cursor-pointer select-none">

                    <input
                      type="checkbox"
                      className={`w-4 h-4 rounded border-slate-300 ${
                        isDoctor
                          ? "accent-blue-600"
                          : "accent-emerald-600"
                      }`}
                    />

                    <span className="text-xs text-slate-500 font-medium">
                      Keep me signed in
                    </span>

                  </label>

                  {/* ================================================= */}
                  {/* LOGIN BUTTON */}
                  {/* ================================================= */}

                  <button
                    type="submit"
                    disabled={loading}
                    className={`group relative overflow-hidden w-full mt-7 py-[15px] rounded-2xl text-white font-black text-[11px] uppercase tracking-[0.16em] shadow-xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0 ${
                      isDoctor
                        ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 shadow-indigo-500/20"
                        : "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 shadow-emerald-500/20"
                    }`}
                  >

                    {/* Shine */}
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                    {loading ? (
                      <span className="relative flex items-center justify-center gap-3">

                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                        Authenticating...

                      </span>
                    ) : (
                      <span className="relative flex items-center justify-center gap-3">

                        Sign In Securely

                        <span className="text-base transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>

                      </span>
                    )}

                  </button>

                  {/* ================================================= */}
                  {/* REGISTER */}
                  {/* ================================================= */}

                  <div className="mt-7 pt-6 border-t border-slate-100 text-center">

                    <p className="text-xs text-slate-400">

                      Don't have an account?{" "}

                      <Link
                        href="/doctor/register"
                        className={`font-black transition-colors hover:underline ${
                          isDoctor
                            ? "text-blue-600 hover:text-blue-700"
                            : "text-emerald-600 hover:text-emerald-700"
                        }`}
                      >
                        Create one
                      </Link>

                    </p>

                  </div>

                </form>

              </div>

              {/* ================================================= */}
              {/* TRUST INDICATORS */}
              {/* ================================================= */}

              <div className="grid grid-cols-3 gap-3 mt-5">

                <div className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-xl">

                  <span className="text-sm mb-1">
                    🔒
                  </span>

                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-slate-400 text-center">
                    Secure
                  </span>

                </div>

                <div className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-xl">

                  <span className="text-sm mb-1">
                    🏥
                  </span>

                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-slate-400 text-center">
                    Healthcare
                  </span>

                </div>

                <div className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-xl">

                  <span className="text-sm mb-1">
                    ⚡
                  </span>

                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-slate-400 text-center">
                    Fast Access
                  </span>

                </div>

              </div>

              {/* Bottom privacy text */}

              <p className="text-center text-[9px] text-slate-400 mt-5 leading-relaxed">
                Your healthcare workspace is protected by secure
                session authentication.
              </p>

            </div>

          </div>

        </main>

        <Footer />

      </div>

      {/* Small animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

    </div>
  );
}

