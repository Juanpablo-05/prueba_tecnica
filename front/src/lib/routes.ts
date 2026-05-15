import type { UserRole } from "@/types/auth";

export const ROUTES = {
  adminDashboard: "/admin/dashboard",
  newUser: "/admin/dashboard/new-user",
  doctorPrescriptions: "/doctor/prescriptions",
  home: "/",
  login: "/login",
  newPrescription: "/doctor/prescriptions/new",
  patientPrescriptions: "/patient/prescriptions",
} as const;

export function getRouteByRole(role: UserRole) {
  switch (role) {
    case "ADMIN":
      return ROUTES.adminDashboard;
    case "DOCTOR":
      return ROUTES.doctorPrescriptions;
    case "PATIENT":
      return ROUTES.patientPrescriptions;
    default:
      return ROUTES.login;
  }
}
