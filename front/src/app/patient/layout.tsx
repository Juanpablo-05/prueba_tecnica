import { RoleGate } from "@/components/auth/role-gate";

export default function PatientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RoleGate allowedRoles={["PATIENT"]}>{children}</RoleGate>;
}
