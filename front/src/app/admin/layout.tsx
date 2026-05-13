import { RoleGate } from "@/components/auth/role-gate";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RoleGate allowedRoles={["ADMIN"]}>{children}</RoleGate>;
}
