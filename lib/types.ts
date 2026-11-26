export type AppRole = "student" | "admin";

export type Profile = {
  id: string;
  email: string;
  role: AppRole;
};

export type SessionUser = {
  id: string;
  email: string;
};

export type ConsultationStatus = "scheduled" | "completed" | "cancelled";

export type Consultation = {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  reason: string;
  scheduled_at: string;
  status: ConsultationStatus;
  created_at: string;
};

export type AdminConsultation = Consultation & {
  student_email: string | null;
};
