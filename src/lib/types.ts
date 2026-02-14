export type UserRole = 'triage_nurse' | 'paramedic' | 'doctor' | 'admin';

export interface Profile {
  id: string;
  user_id: string;
  role: UserRole;
  full_name: string;
  department?: string;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  patient_id: string;
  full_name: string;
  age: number;
  gender: string;
  phone?: string;
  email?: string;
  blood_pressure?: string;
  heart_rate?: number;
  temperature?: number;
  spo2?: number;
  pre_existing_conditions?: string[];
  allergies?: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface TriageCase {
  id: string;
  patient_id: string;
  symptoms: string;
  symptom_source: string;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  recommended_department?: string;
  ai_explanation?: string;
  ai_confidence?: number;
  ai_contributing_factors?: Record<string, any>;
  assigned_department?: string;
  assigned_doctor?: string;
  assigned_floor?: string;
  estimated_wait_time?: number;
  status: string;
  treatment_notes?: string;
  medications?: any;
  follow_up_date?: string;
  follow_up_notes?: string;
  created_by?: string;
  paramedic_location?: string;
  ambulance_id?: string;
  eta_minutes?: number;
  created_at: string;
  updated_at: string;
  patients?: Patient;
}

export interface PatientDocument {
  id: string;
  patient_id: string;
  document_name: string;
  document_url: string;
  document_type: string;
  uploaded_by?: string;
  created_at: string;
}

export interface TriageResult {
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  recommended_department: string;
  explanation: string;
  confidence: number;
  contributing_factors: { factor: string; impact: string; weight: number }[];
}

export const DEPARTMENTS = [
  'General Medicine',
  'Cardiology',
  'Neurology',
  'Emergency',
  'Orthopedics',
  'Pulmonology',
  'Pediatrics',
  'Gastroenterology',
  'Dermatology',
  'Psychiatry',
] as const;

export const ROLE_LABELS: Record<UserRole, string> = {
  triage_nurse: 'Triage Nurse',
  paramedic: 'Paramedic',
  doctor: 'Doctor',
  admin: 'Department Admin',
};
