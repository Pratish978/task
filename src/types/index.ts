export interface UserSession {
  name: string;
  email: string;
  role: 'doctor' | 'user';
}

export interface Appointment {
  id: string;
  doctorEmail: string;
  doctorName?: string;
  patientName: string;
  patientEmail?: string;
  patientAge?: string;
  date: string;
  time: string;
  status: 'Pending' | 'Confirmed' | 'Upcoming' | 'Completed' | 'Cancelled' | 'Missed';
  type: string;
  reason?: string;
  prescriptionAvailable?: boolean;
  prescriptionDetails?: string;
  prescription?: any; // Added to support prescription object/string properties in user appointments page
}

export interface NotificationItem {
  id: string;
  userEmail?: string;
  title: string;
  message: string;
  type: string;
  date: string;
  read: boolean;
}