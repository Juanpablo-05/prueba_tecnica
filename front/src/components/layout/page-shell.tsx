"use client";

import { useAuth } from "@/providers/auth-provider";

type PageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
};

const roleTone = {
  ADMIN: "border-amber-200 bg-amber-500/10 text-amber-800",
  DOCTOR: "border-blue-200 bg-blue-500/10 text-blue-800",
  PATIENT: "border-emerald-200 bg-emerald-500/10 text-emerald-800",
} as const;

export function PageShell({
  eyebrow,
  title,
  description,
  aside,
  children,
}: PageShellProps) {
  const { user } = useAuth();
  const roleLabel = user?.role ?? null;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 px-6 py-10 lg:px-10">
      <div className="w-full space-y-8">
        <section className="glass-panel rounded-[34px] p-8 lg:p-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <p className="section-label">{eyebrow}</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 lg:text-5xl">
                Hola, {user?.fullName}.
              </h1>
              <p className="mt-4 text-xl font-medium tracking-tight text-slate-800 lg:text-2xl">
                {title}
              </p>
              <p className="mt-4 text-base leading-8 text-slate-600">
                {description}
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-start gap-4 sm:items-end">
              {roleLabel ? (
                <span
                  className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] ${roleTone[roleLabel]}`}
                >
                  {roleLabel}
                </span>
              ) : null}
              {aside}
            </div>
          </div>
        </section>

        {children}
      </div>
    </main>
  );
}
