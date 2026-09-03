"use client";

import { FormEvent, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Edit3,
  FileText,
  HeartPulse,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";

type Patient = {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  age?: string | number;
  gender?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  address?: string;

  medicalConditions?: string;
  allergies?: string;
  currentMedications?: string;

  insuranceProvider?: string;
  insurancePolicyNumber?: string;

  createdAt?: string;
};

type FormData = {
  name: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
  bloodGroup: string;
  address: string;

  medicalConditions: string;
  allergies: string;
  currentMedications: string;

  insuranceProvider: string;
  insurancePolicyNumber: string;

  emergencyContact: string;
};

const PATIENTS_KEY = "schedula_registered_patients";
const CURRENT_PATIENT_KEY = "schedula_current_patient";
const SESSION_KEY = "patient_session";
const APPOINTMENTS_KEY = "schedula_appointments";
const PRESCRIPTIONS_KEY = "schedula_prescriptions";

export default function PatientProfilePage() {
  const [patient, setPatient] = useState<Patient | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    bloodGroup: "",
    address: "",
    medicalConditions: "",
    allergies: "",
    currentMedications: "",
    insuranceProvider: "",
    insurancePolicyNumber: "",
    emergencyContact: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [errors, setErrors] = useState<
    Partial<Record<keyof FormData, string>>
  >({});

  const [toast, setToast] = useState("");

  const [stats, setStats] = useState({
    prescriptions: 0,
    completedAppointments: 0,
    testReports: 0,
  });

  useEffect(() => {
    loadProfile();

    const handleStorage = () => loadProfile();
    const handleAppointmentUpdate = () => loadProfile();
    const handlePrescriptionUpdate = () => loadProfile();

    window.addEventListener("storage", handleStorage);

    window.addEventListener(
      "schedula-appointments-updated",
      handleAppointmentUpdate
    );

    window.addEventListener(
      "schedula-prescriptions-updated",
      handlePrescriptionUpdate
    );

    return () => {
      window.removeEventListener("storage", handleStorage);

      window.removeEventListener(
        "schedula-appointments-updated",
        handleAppointmentUpdate
      );

      window.removeEventListener(
        "schedula-prescriptions-updated",
        handlePrescriptionUpdate
      );
    };
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  const loadProfile = () => {
    setLoading(true);

    try {
      let currentPatient: Patient | null = null;

      const currentPatientRaw = localStorage.getItem(
        CURRENT_PATIENT_KEY
      );

      const sessionRaw = localStorage.getItem(SESSION_KEY);

      if (currentPatientRaw) {
        try {
          currentPatient = JSON.parse(currentPatientRaw);
        } catch {
          currentPatient = null;
        }
      }

      if (!currentPatient && sessionRaw) {
        try {
          currentPatient = JSON.parse(sessionRaw);
        } catch {
          currentPatient = null;
        }
      }

      if (!currentPatient) {
        setPatient(null);
        setLoading(false);
        return;
      }

      setPatient(currentPatient);

      setFormData({
        name: currentPatient.name || "",
        email: currentPatient.email || "",
        phone: currentPatient.phone || "",
        age:
          currentPatient.age !== undefined &&
          currentPatient.age !== null
            ? String(currentPatient.age)
            : "",
        gender: currentPatient.gender || "",
        bloodGroup: currentPatient.bloodGroup || "",
        address: currentPatient.address || "",

        medicalConditions:
          currentPatient.medicalConditions || "",

        allergies: currentPatient.allergies || "",

        currentMedications:
          currentPatient.currentMedications || "",

        insuranceProvider:
          currentPatient.insuranceProvider || "",

        insurancePolicyNumber:
          currentPatient.insurancePolicyNumber || "",

        emergencyContact:
          currentPatient.emergencyContact || "",
      });

      loadStats(currentPatient.id);
    } catch (error) {
      console.error("Failed to load patient profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = (patientId: string) => {
    try {
      const appointmentsRaw =
        localStorage.getItem(APPOINTMENTS_KEY) || "[]";

      const prescriptionsRaw =
        localStorage.getItem(PRESCRIPTIONS_KEY) || "[]";

      let appointments: any[] = [];
      let prescriptions: any[] = [];

      try {
        appointments = JSON.parse(appointmentsRaw);
      } catch {
        appointments = [];
      }

      try {
        prescriptions = JSON.parse(prescriptionsRaw);
      } catch {
        prescriptions = [];
      }

      const patientAppointments = appointments.filter(
        (appointment) =>
          String(appointment.patientId) === String(patientId)
      );

      const patientPrescriptions = prescriptions.filter(
        (prescription) =>
          String(prescription.patientId) === String(patientId)
      );

      setStats({
        prescriptions: patientPrescriptions.length,

        completedAppointments: patientAppointments.filter(
          (appointment) =>
            appointment.status === "completed"
        ).length,

        // Test reports are not implemented in the current
        // localStorage data model, so this remains 0 until
        // a test-report feature is added.
        testReports: 0,
      });
    } catch (error) {
      console.error("Failed to load profile stats:", error);
    }
  };

  const updateField = (
    field: keyof FormData,
    value: string
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((previous) => ({
        ...previous,
        [field]: "",
      }));
    }
  };

  const validate = () => {
    const newErrors: Partial<
      Record<keyof FormData, string>
    > = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email.trim()
      )
    ) {
      newErrors.email = "Enter a valid email address.";
    }

    if (formData.phone.trim()) {
      const phone = formData.phone.replace(/\D/g, "");

      if (phone.length < 10) {
        newErrors.phone =
          "Enter a valid phone number.";
      }
    }

    if (formData.age.trim()) {
      const age = Number(formData.age);

      if (
        Number.isNaN(age) ||
        age < 1 ||
        age > 120
      ) {
        newErrors.age =
          "Age must be between 1 and 120.";
      }
    }

    if (
      formData.emergencyContact.trim() &&
      formData.emergencyContact.replace(/\D/g, "")
        .length < 10
    ) {
      newErrors.emergencyContact =
        "Enter a valid emergency contact number.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      setToast("Please fix the highlighted fields.");
      return;
    }

    if (!patient) return;

    setSaving(true);

    try {
      const updatedPatient: Patient = {
        ...patient,

        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),

        age: formData.age.trim(),

        gender: formData.gender,
        bloodGroup: formData.bloodGroup,

        address: formData.address.trim(),

        medicalConditions:
          formData.medicalConditions.trim(),

        allergies: formData.allergies.trim(),

        currentMedications:
          formData.currentMedications.trim(),

        insuranceProvider:
          formData.insuranceProvider.trim(),

        insurancePolicyNumber:
          formData.insurancePolicyNumber.trim(),

        emergencyContact:
          formData.emergencyContact.trim(),
      };

      const patientsRaw =
        localStorage.getItem(PATIENTS_KEY) || "[]";

      let registeredPatients: Patient[] = [];

      try {
        registeredPatients = JSON.parse(
          patientsRaw
        );
      } catch {
        registeredPatients = [];
      }

      const updatedPatients =
        registeredPatients.map((registeredPatient) => {
          if (
            String(registeredPatient.id) ===
            String(patient.id)
          ) {
            return {
              ...registeredPatient,
              ...updatedPatient,
            };
          }

          return registeredPatient;
        });

      localStorage.setItem(
        PATIENTS_KEY,
        JSON.stringify(updatedPatients)
      );

      localStorage.setItem(
        CURRENT_PATIENT_KEY,
        JSON.stringify(updatedPatient)
      );

      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify(updatedPatient)
      );

      document.cookie =
        "patient_session=true; path=/; max-age=604800; SameSite=Lax";

      setPatient(updatedPatient);
      setEditing(false);
      setToast("Profile updated successfully.");

      window.dispatchEvent(
        new Event("schedula-patient-updated")
      );
    } catch (error) {
      console.error(
        "Failed to save patient profile:",
        error
      );

      setToast(
        "Something went wrong while saving your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!patient) return;

    setFormData({
      name: patient.name || "",
      email: patient.email || "",
      phone: patient.phone || "",

      age:
        patient.age !== undefined &&
        patient.age !== null
          ? String(patient.age)
          : "",

      gender: patient.gender || "",
      bloodGroup: patient.bloodGroup || "",
      address: patient.address || "",

      medicalConditions:
        patient.medicalConditions || "",

      allergies: patient.allergies || "",

      currentMedications:
        patient.currentMedications || "",

      insuranceProvider:
        patient.insuranceProvider || "",

      insurancePolicyNumber:
        patient.insurancePolicyNumber || "",

      emergencyContact:
        patient.emergencyContact || "",
    });

    setErrors({});
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc]">
        <Navbar />

        <main className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-slate-900" />

            <p className="text-sm text-slate-500">
              Loading your profile...
            </p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-[#f7f9fc]">
        <Navbar />

        <main className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <UserRound className="h-7 w-7 text-slate-500" />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-slate-900">
              Patient session not found
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Please log in again to access your profile.
            </p>

            <a
              href="/doctor/login"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Go to Login
            </a>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page header */}
        <section className="mb-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
                <UserRound className="h-3.5 w-3.5" />
                Patient Profile
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                My Profile
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Keep your personal and medical information
                up to date for a better healthcare experience.
              </p>
            </div>

            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>

                <button
                  type="submit"
                  form="patient-profile-form"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Profile hero */}
        <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="h-28 bg-gradient-to-r from-slate-950 via-slate-800 to-slate-700" />

          <div className="px-5 pb-6 sm:px-7">
            <div className="-mt-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border-4 border-white bg-slate-100 text-slate-700 shadow-md">
                  <UserRound className="h-9 w-9" />
                </div>

                <div className="pb-1">
                  <h2 className="text-xl font-bold text-slate-900">
                    {patient.name}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {patient.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
                Patient Account
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={<FileText className="h-5 w-5" />}
            label="Total Prescriptions"
            value={stats.prescriptions}
            description="Available in your records"
          />

          <SummaryCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Completed Appointments"
            value={stats.completedAppointments}
            description="Successfully completed visits"
          />

          <SummaryCard
            icon={<Activity className="h-5 w-5" />}
            label="Test Reports"
            value={stats.testReports}
            description="Reports available"
          />
        </section>

        <form
          id="patient-profile-form"
          onSubmit={handleSave}
          className="space-y-6"
        >
          {/* Personal information */}
          <ProfileSection
            icon={<UserRound className="h-5 w-5" />}
            title="Personal Information"
            description="Your basic contact information."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <InputField
                label="Full Name"
                value={formData.name}
                disabled={!editing}
                error={errors.name}
                required
                onChange={(value) =>
                  updateField("name", value)
                }
              />

              <InputField
                label="Email Address"
                type="email"
                value={formData.email}
                disabled={!editing}
                error={errors.email}
                required
                onChange={(value) =>
                  updateField("email", value)
                }
              />

              <InputField
                label="Phone Number"
                value={formData.phone}
                disabled={!editing}
                error={errors.phone}
                placeholder="+91 98765 43210"
                onChange={(value) =>
                  updateField("phone", value)
                }
              />

              <InputField
                label="Address"
                value={formData.address}
                disabled={!editing}
                placeholder="Enter your current address"
                onChange={(value) =>
                  updateField("address", value)
                }
              />
            </div>
          </ProfileSection>

          {/* Physical details */}
          <ProfileSection
            icon={<HeartPulse className="h-5 w-5" />}
            title="Physical Details"
            description="Information that can help healthcare professionals."
          >
            <div className="grid gap-5 md:grid-cols-3">
              <InputField
                label="Age"
                type="number"
                value={formData.age}
                disabled={!editing}
                error={errors.age}
                placeholder="e.g. 24"
                onChange={(value) =>
                  updateField("age", value)
                }
              />

              <SelectField
                label="Gender"
                value={formData.gender}
                disabled={!editing}
                options={[
                  "Male",
                  "Female",
                  "Other",
                  "Prefer not to say",
                ]}
                placeholder="Select gender"
                onChange={(value) =>
                  updateField("gender", value)
                }
              />

              <SelectField
                label="Blood Group"
                value={formData.bloodGroup}
                disabled={!editing}
                options={[
                  "A+",
                  "A-",
                  "B+",
                  "B-",
                  "AB+",
                  "AB-",
                  "O+",
                  "O-",
                ]}
                placeholder="Select blood group"
                onChange={(value) =>
                  updateField("bloodGroup", value)
                }
              />
            </div>
          </ProfileSection>

          {/* Medical information */}
          <ProfileSection
            icon={<Activity className="h-5 w-5" />}
            title="Medical Information"
            description="Help your doctors understand your medical background."
          >
            <div className="grid gap-5">
              <TextAreaField
                label="Medical Conditions"
                value={formData.medicalConditions}
                disabled={!editing}
                placeholder="Example: Asthma, diabetes, hypertension..."
                onChange={(value) =>
                  updateField(
                    "medicalConditions",
                    value
                  )
                }
              />

              <TextAreaField
                label="Allergies"
                value={formData.allergies}
                disabled={!editing}
                placeholder="List any known medicine, food, or other allergies..."
                onChange={(value) =>
                  updateField("allergies", value)
                }
              />

              <TextAreaField
                label="Current Medications"
                value={formData.currentMedications}
                disabled={!editing}
                placeholder="List medicines you are currently taking..."
                onChange={(value) =>
                  updateField(
                    "currentMedications",
                    value
                  )
                }
              />
            </div>
          </ProfileSection>

          {/* Emergency contact */}
          <ProfileSection
            icon={<Users className="h-5 w-5" />}
            title="Emergency Contact"
            description="A trusted person who can be contacted during an emergency."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <InputField
                label="Emergency Contact Number"
                value={formData.emergencyContact}
                disabled={!editing}
                error={errors.emergencyContact}
                placeholder="+91 98765 43210"
                onChange={(value) =>
                  updateField(
                    "emergencyContact",
                    value
                  )
                }
              />

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                    <AlertCircle className="h-4 w-4 text-slate-500" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Keep this information updated
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Your emergency contact may be useful
                      when urgent assistance is required.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ProfileSection>

          {/* Insurance */}
          <ProfileSection
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Insurance Details"
            description="Optional insurance information for your healthcare records."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <InputField
                label="Insurance Provider"
                value={formData.insuranceProvider}
                disabled={!editing}
                placeholder="Example: Star Health"
                onChange={(value) =>
                  updateField(
                    "insuranceProvider",
                    value
                  )
                }
              />

              <InputField
                label="Policy Number"
                value={formData.insurancePolicyNumber}
                disabled={!editing}
                placeholder="Enter policy number"
                onChange={(value) =>
                  updateField(
                    "insurancePolicyNumber",
                    value
                  )
                }
              />
            </div>
          </ProfileSection>

          {/* Contact summary */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                Contact Summary
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Quick overview of your contact details.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ContactCard
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                value={formData.email || "Not provided"}
              />

              <ContactCard
                icon={<Phone className="h-4 w-4" />}
                label="Phone"
                value={formData.phone || "Not provided"}
              />

              <ContactCard
                icon={<MapPin className="h-4 w-4" />}
                label="Address"
                value={formData.address || "Not provided"}
              />
            </div>
          </section>

          {/* Bottom save */}
          {editing && (
            <div className="flex justify-end gap-3 pb-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </main>

      <Footer />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[100] -translate-x-1/2">
          <div className="flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-2xl">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* =======================================================
   PROFILE SECTION
======================================================= */

function ProfileSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          {icon}
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

/* =======================================================
   INPUT
======================================================= */

function InputField({
  label,
  value,
  onChange,
  disabled,
  error,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  error?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <input
        type={type}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
          disabled
            ? "cursor-default border-slate-200 bg-slate-50 text-slate-600"
            : error
            ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-50"
            : "border-slate-200 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
        }`}
      />

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

/* =======================================================
   SELECT
======================================================= */

function SelectField({
  label,
  value,
  onChange,
  disabled,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  options: string[];
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <select
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={`w-full appearance-none rounded-xl border px-4 py-3 text-sm outline-none transition ${
          disabled
            ? "cursor-default border-slate-200 bg-slate-50 text-slate-600"
            : "border-slate-200 bg-white text-slate-900 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
        }`}
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

/* =======================================================
   TEXTAREA
======================================================= */

function TextAreaField({
  label,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <textarea
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        rows={4}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={`w-full resize-none rounded-xl border px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 ${
          disabled
            ? "cursor-default border-slate-200 bg-slate-50 text-slate-600"
            : "border-slate-200 bg-white text-slate-900 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
        }`}
      />
    </div>
  );
}

/* =======================================================
   SUMMARY CARD
======================================================= */

function SummaryCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
        {icon}
      </div>

      <p className="mt-5 text-2xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-700">
        {label}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* =======================================================
   CONTACT CARD
======================================================= */

function ContactCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}

        <span className="text-[11px] font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="mt-2 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}