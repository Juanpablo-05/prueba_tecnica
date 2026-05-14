"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { getRouteByRole, ROUTES } from "@/lib/routes";
import { useAuth } from "@/providers/auth-provider";
import type { UserRole } from "@/types/auth";

type RoleGateProps = {
  allowedRoles: UserRole[];
  children: React.ReactNode;
};

export function RoleGate({ allowedRoles, children }: RoleGateProps) {
  const router = useRouter();
  const { logout, status, user } = useAuth();

  useEffect(() => {
    if (status === "anonymous") {
      router.replace(ROUTES.login);
      return;
    }

    if (status === "authenticated" && user && !allowedRoles.includes(user.role)) {
      toast.error("No tienes permisos para entrar a esta seccion.");
      router.replace(getRouteByRole(user.role));
    }
  }, [allowedRoles, router, status, user]);

  if (status === "loading") {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-5xl items-center justify-center px-6">
        <div className="glass-panel rounded-[28px] px-8 py-6 text-sm font-medium text-slate-700">
          Validando acceso...
        </div>
      </div>
    );
  }

  if (status === "anonymous" || !user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 pt-6 lg:px-10">
        <div className="glass-panel flex items-center gap-4 rounded-full px-4 py-3 text-sm text-slate-700">
          <span className="font-semibold text-slate-900">{user.fullName}</span>
          <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold tracking-[0.2em] text-white">
            {user.role}
          </span>
        </div>

        <button
          type="button"
          onClick={logout}
          className="rounded-full border border-slate-300 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 cursor-pointer"
        >
          Cerrar sesion
        </button>
      </header>

      {children}
    </div>
  );
}
