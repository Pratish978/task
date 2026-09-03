"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  UserRound,
  Mail,
  Phone,
  Stethoscope,
  Building2,
  Award,
  BadgeCheck,
  Edit3,
  Save,
  X,
  Clock3,
  IndianRupee,
  CalendarCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type Doctor = {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  specialty?: string;
  licenseNumber?: string;
  experience?: string;
  clinicName?: string;
  qualification?: string;
  consultationFee?: string;
  role?: string;
  createdAt?: string;
};

type Appointment = {
  id: string;
  doctorId: string;
  status: string;
};

type Prescription = {
  id: string;
  doctorId: string;
};

const DOCTOR_KEY = "schedula_registered_doctors";
const CURRENT_DOCTOR_KEY = "schedula_current_doctor";
const SESSION_KEY = "clinician_session";

export default function DoctorProfilePage() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>(
    []
  );
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(
    []
  );

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialty: "",
    licenseNumber: "",
    experience: "",
    clinicName: "",
    qualification: "",
    consultationFee: "",
  });

  useEffect(() => {
    loadProfile();

    const refresh = () => loadProfile();

    window.addEventListener("storage", refresh);
    window.addEventListener("schedula-doctor-updated", refresh);
    window.addEventListener("schedula-appointments-updated", refresh);
    window.addEventListener("schedula-prescriptions-updated", refresh);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(
        "schedula-doctor-updated",
        refresh
      );
      window.removeEventListener(
        "schedula-appointments-updated",
        refresh
      );
      window.removeEventListener(
        "schedula-prescriptions-updated",
        refresh
      );
    };
  }, []);

  const loadProfile = () => {
    try {
      const session =
        localStorage.getItem(SESSION_KEY) ||
        localStorage.getItem(CURRENT_DOCTOR_KEY);

      if (!session) {
        setLoading(false);
        return;
      }

      const currentDoctor = JSON.parse(session);

      setDoctor(currentDoctor);

      setForm({
        name: currentDoctor.name || "",
        email: currentDoctor.email || "",
        phone: currentDoctor.phone || "",
        specialty: currentDoctor.specialty || "",
        licenseNumber: currentDoctor.licenseNumber || "",
        experience: currentDoctor.experience || "",
        clinicName: currentDoctor.clinicName || "",
        qualification: currentDoctor.qualification || "",
        consultationFee: currentDoctor.consultationFee || "",
      });

      const storedAppointments = JSON.parse(
        localStorage.getItem("schedula_appointments") || "[]"
      );

      const storedPrescriptions = JSON.parse(
        localStorage.getItem("schedula_prescriptions") || "[]"
      );

      setAppointments(
        storedAppointments.filter(
          (appointment: Appointment) =>
            appointment.doctorId === currentDoctor.id
        )
      );

      setPrescriptions(
        storedPrescriptions.filter(
          (prescription: Prescription) =>
            prescription.doctorId === currentDoctor.id
        )
      );
    } catch {
      setDoctor(null);
    } finally {
      setLoading(false);
    }
  };

  const completedAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) => appointment.status === "completed"
      ),
    [appointments]
  );

  const upcomingAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) =>
          appointment.status === "confirmed" ||
          appointment.status === "upcoming" ||
          appointment.status === "pending"
      ),
    [appointments]
  );

  const updateField = (
    field: keyof typeof form,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const validate = () => {
    if (!form.name.trim()) {
      return "Full name is required.";
    }

    if (!form.email.trim()) {
      return "Email is required.";
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      return "Enter a valid email address.";
    }

    if (!form.phone.trim()) {
      return "Phone number is required.";
    }

    if (!/^[0-9+\-\s()]{8,18}$/.test(form.phone)) {
      return "Enter a valid phone number.";
    }

    if (!form.specialty.trim()) {
      return "Specialty is required.";
    }

    if (!form.licenseNumber.trim()) {
      return "License number is required.";
    }

    if (!form.qualification.trim()) {
      return "Qualification is required.";
    }

    return "";
  };

  const saveProfile = () => {
    setError("");
    setSuccess("");

    if (!doctor) {
      setError("Doctor session not found.");
      return;
    }

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      const registeredDoctors: Doctor[] = JSON.parse(
        localStorage.getItem(DOCTOR_KEY) || "[]"
      );

      const emailExists = registeredDoctors.some(
        (item) =>
          item.id !== doctor.id &&
          item.email.toLowerCase() ===
            form.email.trim().toLowerCase()
      );

      if (emailExists) {
        setError("Another account already uses this email.");
        setSaving(false);
        return;
      }

      const updatedDoctor: Doctor = {
        ...doctor,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        specialty: form.specialty.trim(),
        licenseNumber: form.licenseNumber.trim(),
        experience: form.experience.trim(),
        clinicName: form.clinicName.trim(),
        qualification: form.qualification.trim(),
        consultationFee: form.consultationFee.trim(),
      };

      const updatedRegisteredDoctors = registeredDoctors.map(
        (item) =>
          item.id === doctor.id ? updatedDoctor : item
      );

      localStorage.setItem(
        DOCTOR_KEY,
        JSON.stringify(updatedRegisteredDoctors)
      );

      localStorage.setItem(
        CURRENT_DOCTOR_KEY,
        JSON.stringify(updatedDoctor)
      );

      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify(updatedDoctor)
      );

      setDoctor(updatedDoctor);
      setEditing(false);
      setSuccess("Profile updated successfully.");

      window.dispatchEvent(
        new Event("schedula-doctor-updated")
      );

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch {
      setError("Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const cancelEditing = () => {
    if (!doctor) return;

    setForm({
      name: doctor.name || "",
      email: doctor.email || "",
      phone: doctor.phone || "",
      specialty: doctor.specialty || "",
      licenseNumber: doctor.licenseNumber || "",
      experience: doctor.experience || "",
      clinicName: doctor.clinicName || "",
      qualification: doctor.qualification || "",
      consultationFee: doctor.consultationFee || "",
    });

    setEditing(false);
    setError("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Navbar />

        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-4 text-sm text-slate-500">
              Loading profile...
            </p>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Navbar />

        <main className="mx-auto max-w-2xl px-4 py-20 text-center">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
            <UserRound
              size={46}
              className="mx-auto text-slate-300"
            />

            <h1 className="mt-5 text-2xl font-bold">
              Profile unavailable
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Please log in again to access your doctor profile.
            </p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              <BadgeCheck size={14} />
              Verified Doctor Profile
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              My Profile
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Manage your professional information and clinic
              details.
            </p>
          </div>

          {!editing ? (
            <button
              onClick={() => {
                setEditing(true);
                setError("");
                setSuccess("");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
            >
              <Edit3 size={17} />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={cancelEditing}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
              >
                <X size={17} />
                Cancel
              </button>

              <button
                onClick={saveProfile}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Save size={17} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
            />
            {success}
          </div>
        )}

        {/* Profile Hero */}
        <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="h-28 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900" />

          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white bg-blue-100 text-3xl font-bold text-blue-700 shadow-lg">
                {doctor.name
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>

              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold">
                    Dr. {doctor.name}
                  </h2>

                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    <BadgeCheck size={13} />
                    Verified
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {doctor.specialty || "Medical Professional"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">
                Total Appointments
              </p>

              <CalendarCheck
                size={18}
                className="text-blue-500"
              />
            </div>

            <p className="mt-2 text-2xl font-bold">
              {appointments.length}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-emerald-600">
                Completed
              </p>

              <CheckCircle2
                size={18}
                className="text-emerald-600"
              />
            </div>

            <p className="mt-2 text-2xl font-bold text-emerald-700">
              {completedAppointments.length}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-amber-600">
                Upcoming
              </p>

              <Clock3
                size={18}
                className="text-amber-600"
              />
            </div>

            <p className="mt-2 text-2xl font-bold text-amber-700">
              {upcomingAppointments.length}
            </p>
          </div>

          <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-violet-600">
                Prescriptions
              </p>

              <FileText
                size={18}
                className="text-violet-600"
              />
            </div>

            <p className="mt-2 text-2xl font-bold text-violet-700">
              {prescriptions.length}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Personal Information */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-lg font-bold">
                Professional Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your professional and contact details.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                icon={<UserRound size={17} />}
                label="Full Name"
                value={form.name}
                editing={editing}
                onChange={(value) =>
                  updateField("name", value)
                }
              />

              <Field
                icon={<Mail size={17} />}
                label="Email Address"
                value={form.email}
                editing={editing}
                onChange={(value) =>
                  updateField("email", value)
                }
                type="email"
              />

              <Field
                icon={<Phone size={17} />}
                label="Phone Number"
                value={form.phone}
                editing={editing}
                onChange={(value) =>
                  updateField("phone", value)
                }
              />

              <Field
                icon={<Stethoscope size={17} />}
                label="Specialty"
                value={form.specialty}
                editing={editing}
                onChange={(value) =>
                  updateField("specialty", value)
                }
              />

              <Field
                icon={<Award size={17} />}
                label="Qualification"
                value={form.qualification}
                editing={editing}
                onChange={(value) =>
                  updateField("qualification", value)
                }
              />

              <Field
                icon={<BadgeCheck size={17} />}
                label="Medical License Number"
                value={form.licenseNumber}
                editing={editing}
                onChange={(value) =>
                  updateField("licenseNumber", value)
                }
              />

              <Field
                icon={<Clock3 size={17} />}
                label="Experience"
                value={form.experience}
                editing={editing}
                onChange={(value) =>
                  updateField("experience", value)
                }
                placeholder="e.g. 5 years"
              />

              <Field
                icon={<IndianRupee size={17} />}
                label="Consultation Fee"
                value={form.consultationFee}
                editing={editing}
                onChange={(value) =>
                  updateField("consultationFee", value)
                }
                placeholder="e.g. 500"
              />
            </div>
          </section>

          {/* Clinic */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-bold">
                Clinic Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your primary practice information.
              </p>
            </div>

            <Field
              icon={<Building2 size={17} />}
              label="Clinic Name"
              value={form.clinicName}
              editing={editing}
              onChange={(value) =>
                updateField("clinicName", value)
              }
              placeholder="Enter clinic name"
            />

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Account ID
              </p>

              <p className="mt-2 break-all text-xs font-medium text-slate-600">
                {doctor.id}
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex items-start gap-3">
                <BadgeCheck
                  size={19}
                  className="mt-0.5 text-emerald-600"
                />

                <div>
                  <p className="text-sm font-bold text-emerald-800">
                    Profile verified
                  </p>

                  <p className="mt-1 text-xs leading-5 text-emerald-700">
                    Your doctor profile is connected to your
                    registered account.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Account Information */}
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold">
              Account Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Basic information about your Schedula account.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Account Type
              </p>

              <p className="mt-2 text-sm font-bold">
                Doctor
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Member Since
              </p>

              <p className="mt-2 text-sm font-bold">
                {doctor.createdAt
                  ? new Date(
                      doctor.createdAt
                    ).toLocaleDateString([], {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "Recently"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Status
              </p>

              <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Active
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function Field({
  icon,
  label,
  value,
  editing,
  onChange,
  type = "text",
  placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </label>

      {editing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
        />
      ) : (
        <div className="min-h-[46px] rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
          {value || (
            <span className="font-normal text-slate-400">
              Not provided
            </span>
          )}
        </div>
      )}
    </div>
  );
}