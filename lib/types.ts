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
