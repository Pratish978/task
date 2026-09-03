// src/lib/mock-data/appointments.ts
export interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  startsAt: string;
  type: string;
  status: "pending" | "confirmed" | "upcoming" | "completed" | "cancelled" | "missed";
  symptoms: string;
  prescription?: {
    id: string;
    diagnosis: string;
    medicines: { name: string; dosage: string; duration: string; instructions: string }[];
    notes: string;
    date: string;
  };
}

export const appointments: Appointment[] = [
  {
    id: "apt-1",
    patientName: "Aarav Sharma",
    patientEmail: "aarav.sharma@example.com",
    doctorName: "Dr. Anika Rao",
    specialty: "Cardiology",
    date: "2026-09-05",
    time: "10:00 AM",
    startsAt: "2026-09-05T10:00:00",
    type: "In-Person Consultation",
    status: "confirmed",
    symptoms: "Chest palpitations and mild shortness of breath during exertion.",
  },
  {
    id: "apt-2",
    patientName: "Meera Nair",
    patientEmail: "meera.nair@example.com",
    doctorName: "Dr. Anika Rao",
    specialty: "Cardiology",
    date: "2026-09-03",
    time: "02:30 PM",
    startsAt: "2026-09-03T14:30:00",
    type: "Video Teleconsultation",
    status: "completed",
    symptoms: "Routine post-operative heart checkup and blood pressure review.",
    prescription: {
      id: "rx-1",
      diagnosis: "Essential Hypertension & Post-Op Recovery",
      medicines: [
        { name: "Telmisartan 40mg", dosage: "1 tablet daily", duration: "30 days", instructions: "Take in the morning before breakfast" },
        { name: "Aspirin 75mg", dosage: "1 tablet daily", duration: "30 days", instructions: "Take after lunch" }
      ],
      notes: "Monitor blood pressure twice daily. Maintain low sodium diet.",
      date: "2026-09-03T15:15:00Z"
    }
  },
  {
    id: "apt-3",
    patientName: "Kabir Mehta",
    patientEmail: "kabir.mehta@example.com",
    doctorName: "Dr. Anika Rao",
    specialty: "Cardiology",
    date: "2026-09-06",
    time: "11:15 AM",
    startsAt: "2026-09-06T11:15:00",
    type: "In-Person Consultation",
    status: "pending",
    symptoms: "Frequent dizziness and spike in resting pulse rate.",
  },
  {
    id: "apt-4",
    patientName: "Rohan Verma",
    patientEmail: "rohan.verma@example.com",
    doctorName: "Dr. Anika Rao",
    specialty: "Cardiology",
    date: "2026-08-28",
    time: "04:00 PM",
    startsAt: "2026-08-28T16:00:00",
    type: "Follow-up",
    status: "cancelled",
    symptoms: "Scheduled review for cholesterol levels.",
  }
];