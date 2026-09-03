// src/app/doctor/register/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Role = "doctor" | "patient";

export default function DoctorRegisterPage() {
  const [role, setRole] = useState<Role>("doctor");

  // Common fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");

  // Doctor fields
  const [specialty, setSpecialty] = useState("Cardiology");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [experience, setExperience] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [qualification, setQualification] = useState("");
  const [consultationFee, setConsultationFee] = useState("");

  // Patient fields
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [address, setAddress] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    resetMessages();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    resetMessages();
    setLoading(true);

    // Basic validation
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please complete all required fields.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // =========================================================
    // DOCTOR REGISTRATION
    // =========================================================

    if (role === "doctor") {
      if (
        !specialty.trim() ||
        !licenseNumber.trim() ||
        !experience.trim() ||
        !clinicName.trim() ||
        !qualification.trim() ||
        !phone.trim()
      ) {
        setError("Please complete all required doctor details.");
        setLoading(false);
        return;
      }

      const existingDoctorsString = localStorage.getItem(
        "schedula_registered_doctors"
      );

      const existingDoctors = existingDoctorsString
        ? JSON.parse(existingDoctorsString)
        : [];

      const alreadyExists = existingDoctors.some(
        (doctor: any) =>
          doctor.email?.toLowerCase() === normalizedEmail
      );

      if (alreadyExists) {
        setError(
          "A doctor account with this email already exists. Please sign in instead."
        );
        setLoading(false);
        return;
      }

      const newDoctor = {
        id: `doc-${Date.now()}`,
        name: name.trim(),
        email: normalizedEmail,
        password,
        phone: phone.trim(),
        specialty: specialty.trim(),
        licenseNumber: licenseNumber.trim(),
        experience: experience.trim(),
        clinicName: clinicName.trim(),
        qualification: qualification.trim(),
        consultationFee: consultationFee.trim() || "0",
        role: "doctor",
        createdAt: new Date().toISOString(),
      };

      existingDoctors.push(newDoctor);

      localStorage.setItem(
        "schedula_registered_doctors",
        JSON.stringify(existingDoctors)
      );

      const sessionData = {
        id: newDoctor.id,
        email: newDoctor.email,
        name: newDoctor.name,
        specialty: newDoctor.specialty,
        phone: newDoctor.phone,
        licenseNumber: newDoctor.licenseNumber,
        experience: newDoctor.experience,
        clinicName: newDoctor.clinicName,
        qualification: newDoctor.qualification,
        consultationFee: newDoctor.consultationFee,
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

      setSuccess("Doctor account created successfully!");

      setTimeout(() => {
        window.location.href = "/doctor/dashboard";
      }, 700);

      return;
    }

    // =========================================================
    // PATIENT REGISTRATION
    // =========================================================

    if (role === "patient") {
      if (
        !phone.trim() ||
        !age.trim() ||
        !gender ||
        !bloodGroup ||
        !emergencyContact.trim()
      ) {
        setError("Please complete all required patient details.");
        setLoading(false);
        return;
      }

      const numericAge = Number(age);

      if (
        Number.isNaN(numericAge) ||
        numericAge < 1 ||
        numericAge > 120
      ) {
        setError("Please enter a valid age between 1 and 120.");
        setLoading(false);
        return;
      }

      const existingPatientsString = localStorage.getItem(
        "schedula_registered_patients"
      );

      const existingPatients = existingPatientsString
        ? JSON.parse(existingPatientsString)
        : [];

      const alreadyExists = existingPatients.some(
        (patient: any) =>
          patient.email?.toLowerCase() === normalizedEmail
      );

      if (alreadyExists) {
        setError(
          "A patient account with this email already exists. Please sign in instead."
        );
        setLoading(false);
        return;
      }

      const newPatient = {
        id: `patient-${Date.now()}`,
        name: name.trim(),
        email: normalizedEmail,
        password,
        phone: phone.trim(),
        age: numericAge,
        gender,
        bloodGroup,
        emergencyContact: emergencyContact.trim(),
        address: address.trim(),
        role: "patient",
        createdAt: new Date().toISOString(),
      };

      existingPatients.push(newPatient);

      localStorage.setItem(
        "schedula_registered_patients",
        JSON.stringify(existingPatients)
      );

      const patientSession = {
        id: newPatient.id,
        email: newPatient.email,
        name: newPatient.name,
        phone: newPatient.phone,
        age: newPatient.age,
        gender: newPatient.gender,
        bloodGroup: newPatient.bloodGroup,
        emergencyContact: newPatient.emergencyContact,
        address: newPatient.address,
        role: "patient",
        authenticatedAt: new Date().toISOString(),
      };

      localStorage.setItem(
        "patient_session",
        JSON.stringify(patientSession)
      );

      localStorage.setItem(
        "schedula_current_patient",
        JSON.stringify(patientSession)
      );

      document.cookie =
        "patient_session=true; path=/; max-age=86400";

      setSuccess("Patient account created successfully!");

      setTimeout(() => {
        window.location.href = "/patient/appointments";
      }, 700);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased overflow-hidden">
      {/* ===================================================== */}
      {/* BACKGROUND */}
      {/* ===================================================== */}

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[120px]" />

        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-violet-400/20 rounded-full blur-[120px]" />

        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-cyan-400/15 rounded-full blur-[120px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.04)_1px,transparent_0)] [background-size:24px_24px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 w-full px-4 sm:px-6 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">

            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-[28px] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-2xl shadow-indigo-500/25 mb-6">
                <span className="text-4xl">
                  {role === "doctor" ? "🩺" : "👤"}
                </span>
              </div>

              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-xl border border-slate-200 shadow-sm text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Secure Healthcare Registration
                </span>
              </div>

              <h1 className="mt-5 text-4xl sm:text-5xl font-black tracking-tight">
                Create your{" "}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Schedula
                </span>{" "}
                account
              </h1>

              <p className="mt-3 text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
                Join a smarter healthcare experience built for both
                clinicians and patients.
              </p>
            </div>

            {/* ================================================= */}
            {/* MAIN CARD */}
            {/* ================================================= */}

            <div className="max-w-4xl mx-auto bg-white/75 backdrop-blur-2xl border border-white rounded-[40px] shadow-[0_30px_100px_rgba(15,23,42,0.12)] overflow-hidden">

              {/* ================================================= */}
              {/* ROLE SELECTOR */}
              {/* ================================================= */}

              <div className="p-5 sm:p-7 border-b border-slate-200/70">
                <div className="text-center mb-5">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Choose account type
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">

                  {/* Doctor */}
                  <button
                    type="button"
                    onClick={() => handleRoleChange("doctor")}
                    className={`relative overflow-hidden text-left p-5 sm:p-6 rounded-3xl border-2 transition-all duration-300 ${
                      role === "doctor"
                        ? "border-blue-500 bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20"
                        : "border-slate-200 bg-white/70 hover:border-blue-300 hover:bg-blue-50/50"
                    }`}
                  >
                    {role === "doctor" && (
                      <div className="absolute -right-8 -top-8 w-28 h-28 bg-white/10 rounded-full blur-xl" />
                    )}

                    <div className="relative flex items-start gap-4">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                          role === "doctor"
                            ? "bg-white/15"
                            : "bg-blue-100"
                        }`}
                      >
                        🩺
                      </div>

                      <div>
                        <h3 className="font-black text-lg">
                          Register as Doctor
                        </h3>

                        <p
                          className={`text-xs mt-1 leading-relaxed ${
                            role === "doctor"
                              ? "text-white/75"
                              : "text-slate-500"
                          }`}
                        >
                          Manage appointments, prescriptions and
                          patient care.
                        </p>
                      </div>
                    </div>

                    {role === "doctor" && (
                      <div className="absolute right-5 top-5 w-6 h-6 rounded-full bg-white text-blue-600 flex items-center justify-center text-xs font-black">
                        ✓
                      </div>
                    )}
                  </button>

                  {/* Patient */}
                  <button
                    type="button"
                    onClick={() => handleRoleChange("patient")}
                    className={`relative overflow-hidden text-left p-5 sm:p-6 rounded-3xl border-2 transition-all duration-300 ${
                      role === "patient"
                        ? "border-emerald-500 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/20"
                        : "border-slate-200 bg-white/70 hover:border-emerald-300 hover:bg-emerald-50/50"
                    }`}
                  >
                    {role === "patient" && (
                      <div className="absolute -right-8 -top-8 w-28 h-28 bg-white/10 rounded-full blur-xl" />
                    )}

                    <div className="relative flex items-start gap-4">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                          role === "patient"
                            ? "bg-white/15"
                            : "bg-emerald-100"
                        }`}
                      >
                        👤
                      </div>

                      <div>
                        <h3 className="font-black text-lg">
                          Register as Patient
                        </h3>

                        <p
                          className={`text-xs mt-1 leading-relaxed ${
                            role === "patient"
                              ? "text-white/75"
                              : "text-slate-500"
                          }`}
                        >
                          Book appointments and manage your
                          healthcare journey.
                        </p>
                      </div>
                    </div>

                    {role === "patient" && (
                      <div className="absolute right-5 top-5 w-6 h-6 rounded-full bg-white text-emerald-600 flex items-center justify-center text-xs font-black">
                        ✓
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* ================================================= */}
              {/* FORM */}
              {/* ================================================= */}

              <form onSubmit={handleRegister} className="p-6 sm:p-10">

                {/* FORM TITLE */}

                <div className="mb-8">
                  <p
                    className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                      role === "doctor"
                        ? "text-blue-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {role === "doctor"
                      ? "Professional Registration"
                      : "Personal Registration"}
                  </p>

                  <h2 className="text-2xl font-black mt-2">
                    {role === "doctor"
                      ? "Tell us about your practice"
                      : "Tell us about yourself"}
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Fields marked with * are required.
                  </p>
                </div>

                {/* ================================================= */}
                {/* ALERTS */}
                {/* ================================================= */}

                {error && (
                  <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700">
                    <span className="text-lg">⚠️</span>

                    <p className="text-xs font-bold leading-relaxed">
                      {error}
                    </p>
                  </div>
                )}

                {success && (
                  <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                    <span className="text-lg">✓</span>

                    <p className="text-xs font-bold leading-relaxed">
                      {success}
                    </p>
                  </div>
                )}

                {/* ================================================= */}
                {/* COMMON DETAILS */}
                {/* ================================================= */}

                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${
                        role === "doctor"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-emerald-100 text-emerald-600"
                      }`}
                    >
                      01
                    </div>

                    <div>
                      <h3 className="font-black text-sm">
                        Account Information
                      </h3>

                      <p className="text-[11px] text-slate-500">
                        Your basic account details
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">

                    {/* Name */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-2">
                        Full Name *
                      </label>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">
                          👤
                        </span>

                        <input
                          type="text"
                          value={name}
                          onChange={(e) =>
                            setName(e.target.value)
                          }
                          placeholder={
                            role === "doctor"
                              ? "Dr. John Doe"
                              : "John Doe"
                          }
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl outline-none text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-2">
                        Email Address *
                      </label>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">
                          ✉️
                        </span>

                        <input
                          type="email"
                          value={email}
                          onChange={(e) =>
                            setEmail(e.target.value)
                          }
                          placeholder={
                            role === "doctor"
                              ? "doctor@schedula.com"
                              : "you@example.com"
                          }
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl outline-none text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-2">
                        Phone Number *
                      </label>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">
                          📱
                        </span>

                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) =>
                            setPhone(e.target.value)
                          }
                          placeholder="+91 98765 43210"
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl outline-none text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-2">
                        Password *
                      </label>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">
                          🔒
                        </span>

                        <input
                          type={
                            showPassword
                              ? "text"
                              : "password"
                          }
                          value={password}
                          onChange={(e) =>
                            setPassword(e.target.value)
                          }
                          placeholder="Minimum 6 characters"
                          className="w-full pl-11 pr-12 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl outline-none text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
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

                    {/* Confirm Password */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-black text-slate-700 mb-2">
                        Confirm Password *
                      </label>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">
                          🔐
                        </span>

                        <input
                          type={
                            showConfirmPassword
                              ? "text"
                              : "password"
                          }
                          value={confirmPassword}
                          onChange={(e) =>
                            setConfirmPassword(e.target.value)
                          }
                          placeholder="Re-enter your password"
                          className="w-full pl-11 pr-12 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl outline-none text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                          required
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(
                              !showConfirmPassword
                            )
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-sm"
                        >
                          {showConfirmPassword ? "🙈" : "👁️"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ================================================= */}
                {/* DOCTOR DETAILS */}
                {/* ================================================= */}

                {role === "doctor" && (
                  <div className="mb-8">

                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-black">
                        02
                      </div>

                      <div>
                        <h3 className="font-black text-sm">
                          Professional Details
                        </h3>

                        <p className="text-[11px] text-slate-500">
                          Information about your medical practice
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">

                      {/* Specialty */}
                      <div>
                        <label className="block text-xs font-black text-slate-700 mb-2">
                          Medical Specialty *
                        </label>

                        <select
                          value={specialty}
                          onChange={(e) =>
                            setSpecialty(e.target.value)
                          }
                          className="w-full px-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl outline-none text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                          required
                        >
                          <option>Cardiology</option>
                          <option>Neurology</option>
                          <option>Dermatology</option>
                          <option>Pediatrics</option>
                          <option>Orthopedics</option>
                          <option>Psychiatry</option>
                          <option>Gynecology</option>
                          <option>General Medicine</option>
                          <option>Dentistry</option>
                          <option>Ophthalmology</option>
                          <option>ENT</option>
                          <option>Urology</option>
                          <option>Oncology</option>
                          <option>Gastroenterology</option>
                          <option>Pulmonology</option>
                          <option>Other</option>
                        </select>
                      </div>

                      {/* Qualification */}
                      <div>
                        <label className="block text-xs font-black text-slate-700 mb-2">
                          Qualification *
                        </label>

                        <input
                          type="text"
                          value={qualification}
                          onChange={(e) =>
                            setQualification(e.target.value)
                          }
                          placeholder="MBBS, MD, MS..."
                          className="w-full px-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl outline-none text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                          required
                        />
                      </div>

                      {/* License */}
                      <div>
                        <label className="block text-xs font-black text-slate-700 mb-2">
                          Medical License Number *
                        </label>

                        <input
                          type="text"
                          value={licenseNumber}
                          onChange={(e) =>
                            setLicenseNumber(e.target.value)
                          }
                          placeholder="MED-123456"
                          className="w-full px-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl outline-none text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                          required
                        />
                      </div>

                      {/* Experience */}
                      <div>
                        <label className="block text-xs font-black text-slate-700 mb-2">
                          Years of Experience *
                        </label>

                        <select
                          value={experience}
                          onChange={(e) =>
                            setExperience(e.target.value)
                          }
                          className="w-full px-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl outline-none text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                          required
                        >
                          <option value="">
                            Select experience
                          </option>
                          <option value="0-1 years">
                            0–1 years
                          </option>
                          <option value="2-5 years">
                            2–5 years
                          </option>
                          <option value="6-10 years">
                            6–10 years
                          </option>
                          <option value="11-15 years">
                            11–15 years
                          </option>
                          <option value="15+ years">
                            15+ years
                          </option>
                        </select>
                      </div>

                      {/* Clinic */}
                      <div>
                        <label className="block text-xs font-black text-slate-700 mb-2">
                          Clinic / Hospital Name *
                        </label>

                        <input
                          type="text"
                          value={clinicName}
                          onChange={(e) =>
                            setClinicName(e.target.value)
                          }
                          placeholder="City Care Hospital"
                          className="w-full px-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl outline-none text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                          required
                        />
                      </div>

                      {/* Fee */}
                      <div>
                        <label className="block text-xs font-black text-slate-700 mb-2">
                          Consultation Fee
                        </label>

                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-500">
                            ₹
                          </span>

                          <input
                            type="number"
                            min="0"
                            value={consultationFee}
                            onChange={(e) =>
                              setConsultationFee(e.target.value)
                            }
                            placeholder="500"
                            className="w-full pl-9 pr-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl outline-none text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ================================================= */}
                {/* PATIENT DETAILS */}
                {/* ================================================= */}

                {role === "patient" && (
                  <div className="mb-8">

                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-black">
                        02
                      </div>

                      <div>
                        <h3 className="font-black text-sm">
                          Personal & Health Details
                        </h3>

                        <p className="text-[11px] text-slate-500">
                          Help us provide a better healthcare experience
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">

                      {/* Age */}
                      <div>
                        <label className="block text-xs font-black text-slate-700 mb-2">
                          Age *
                        </label>

                        <input
                          type="number"
                          min="1"
                          max="120"
                          value={age}
                          onChange={(e) =>
                            setAge(e.target.value)
                          }
                          placeholder="25"
                          className="w-full px-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl outline-none text-sm font-medium focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                          required
                        />
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block text-xs font-black text-slate-700 mb-2">
                          Gender *
                        </label>

                        <select
                          value={gender}
                          onChange={(e) =>
                            setGender(e.target.value)
                          }
                          className="w-full px-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl outline-none text-sm font-medium focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                          required
                        >
                          <option value="">
                            Select gender
                          </option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">
                            Prefer not to say
                          </option>
                        </select>
                      </div>

                      {/* Blood Group */}
                      <div>
                        <label className="block text-xs font-black text-slate-700 mb-2">
                          Blood Group *
                        </label>

                        <select
                          value={bloodGroup}
                          onChange={(e) =>
                            setBloodGroup(e.target.value)
                          }
                          className="w-full px-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl outline-none text-sm font-medium focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                          required
                        >
                          <option value="">
                            Select blood group
                          </option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>

                      {/* Emergency */}
                      <div>
                        <label className="block text-xs font-black text-slate-700 mb-2">
                          Emergency Contact *
                        </label>

                        <input
                          type="tel"
                          value={emergencyContact}
                          onChange={(e) =>
                            setEmergencyContact(e.target.value)
                          }
                          placeholder="+91 98765 43210"
                          className="w-full px-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl outline-none text-sm font-medium focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                          required
                        />
                      </div>

                      {/* Address */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-black text-slate-700 mb-2">
                          Address
                        </label>

                        <textarea
                          value={address}
                          onChange={(e) =>
                            setAddress(e.target.value)
                          }
                          placeholder="Enter your residential address"
                          rows={3}
                          className="w-full px-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl outline-none text-sm font-medium resize-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ================================================= */}
                {/* PRIVACY NOTE */}
                {/* ================================================= */}

                <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
                  <span className="text-lg">🔐</span>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Your account information is stored securely for
                    this application. By creating an account, you
                    agree to use Schedula responsibly and provide
                    accurate information.
                  </p>
                </div>

                {/* ================================================= */}
                {/* SUBMIT */}
                {/* ================================================= */}

                <button
                  type="submit"
                  disabled={loading}
                  className={`group relative overflow-hidden w-full py-4 rounded-2xl text-white font-black text-xs uppercase tracking-[0.15em] shadow-xl transition-all duration-300 hover:scale-[1.01] disabled:opacity-60 disabled:hover:scale-100 ${
                    role === "doctor"
                      ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 shadow-indigo-500/20"
                      : "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 shadow-emerald-500/20"
                  }`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        {role === "doctor"
                          ? "Create Doctor Account"
                          : "Create Patient Account"}
                        <span className="text-base">→</span>
                      </>
                    )}
                  </span>
                </button>

                {/* ================================================= */}
                {/* LOGIN */}
                {/* ================================================= */}

                <div className="mt-7 pt-6 border-t border-slate-200 text-center">
                  <p className="text-xs text-slate-500">
                    Already have an account?{" "}
                    <Link
                      href="/doctor/login"
                      className={`font-black hover:underline ${
                        role === "doctor"
                          ? "text-blue-600"
                          : "text-emerald-600"
                      }`}
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            </div>

            {/* ================================================= */}
            {/* TRUST FOOTER */}
            {/* ================================================= */}

            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span className="flex items-center gap-2">
                🔒 Secure Registration
              </span>

              <span className="hidden sm:block">•</span>

              <span className="flex items-center gap-2">
                ⚡ Fast Setup
              </span>

              <span className="hidden sm:block">•</span>

              <span className="flex items-center gap-2">
                🏥 Healthcare Platform
              </span>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}