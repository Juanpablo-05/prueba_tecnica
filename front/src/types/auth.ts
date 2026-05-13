export type UserRole = "ADMIN" | "DOCTOR" | "PATIENT";

export type UserProfile = {
  createdAt: string;
  documentNumber: string | null;
  email: string;
  fullName: string;
  id: string;
  isActive: boolean;
  medicalLicense: string | null;
  role: UserRole;
};

export type AuthSessionResponse = {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
};
