"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/providers/auth-provider";
import { getRouteByRole, ROUTES } from "@/lib/routes";

const loginSchema = z.object({
  email: z.email("Ingresa un correo valido."),
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginScreen() {
  const router = useRouter();
  const { login, status, user } = useAuth();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "dr@test.com",
      password: "dr123456",
    },
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (status === "authenticated" && user) {
      router.replace(getRouteByRole(user.role));
    }
  }, [router, status, user]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const authenticatedUser = await login(values);
      toast.success(`Bienvenido, ${authenticatedUser.fullName}.`);
      router.replace(getRouteByRole(authenticatedUser.role));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible iniciar sesion.";

      toast.error(message);
    }
  });

  const isLoadingSession = status === "loading";

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-6 py-10 lg:px-10">
      <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="glass-panel rounded-[32px] p-8 lg:p-10">
          <p className="section-label">Acceso seguro</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
            Inicia sesion para entrar al sistema
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
            Esta pantalla ya esta conectada al backend de NestJS. Cuando el login
            es correcto guardamos los tokens y el perfil en un contexto global de
            autenticacion para evitar prop drilling y centralizar la sesion.
          </p>

          <form className="mt-8 grid gap-4" onSubmit={onSubmit}>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                placeholder="dr@test.com"
                className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 outline-none transition focus:border-slate-400"
                {...register("email")}
              />
              {errors.email ? (
                <span className="text-xs font-medium text-rose-600">
                  {errors.email.message}
                </span>
              ) : null}
            </label>

            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Contrasena
              <input
                type="password"
                placeholder="********"
                className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 outline-none transition focus:border-slate-400"
                {...register("password")}
              />
              {errors.password ? (
                <span className="text-xs font-medium text-rose-600">
                  {errors.password.message}
                </span>
              ) : null}
            </label>

            <button
              type="submit"
              disabled={isSubmitting || isLoadingSession}
              className="mt-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isLoadingSession
                ? "Restaurando sesion..."
                : isSubmitting
                  ? "Conectando..."
                  : "Iniciar sesion"}
            </button>
          </form>
        </section>

        <aside className="glass-panel rounded-[32px] p-8">
          <p className="section-label">Credenciales de prueba</p>
          <div className="mt-5 grid gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white/75 p-4">
              <p className="text-sm font-semibold text-slate-900">Admin</p>
              <p className="mt-2 text-sm text-slate-600">admin@test.com</p>
              <p className="text-sm text-slate-600">admin123</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/75 p-4">
              <p className="text-sm font-semibold text-slate-900">Doctor</p>
              <p className="mt-2 text-sm text-slate-600">dr@test.com</p>
              <p className="text-sm text-slate-600">dr123456</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/75 p-4">
              <p className="text-sm font-semibold text-slate-900">Paciente</p>
              <p className="mt-2 text-sm text-slate-600">patient@test.com</p>
              <p className="text-sm text-slate-600">patient123</p>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-white/70 p-5">
            <p className="text-sm font-semibold text-slate-900">
              Navegacion prevista por rol
            </p>
            <div className="mt-4 grid gap-3 text-sm text-slate-600">
              <Link href={ROUTES.doctorPrescriptions} className="font-mono">
                /doctor/prescriptions
              </Link>
              <Link href={ROUTES.patientPrescriptions} className="font-mono">
                /patient/prescriptions
              </Link>
              <Link href={ROUTES.adminDashboard} className="font-mono">
                /admin/dashboard
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
