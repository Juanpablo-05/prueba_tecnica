import { RoleGate } from "@/components/auth/role-gate";

export default function DoctorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RoleGate allowedRoles={["DOCTOR"]}>{children}</RoleGate>;
}
