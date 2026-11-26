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

export type ConsultationStatus = "scheduled" | "cancelled";

export type Consultation = {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  reason: string;
  scheduled_at: string;
  completed: boolean;
  status: ConsultationStatus;
  created_at: string;
};
