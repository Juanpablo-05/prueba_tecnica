"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ROUTES } from "@/lib/routes";
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner'; 
import { getApiErrorMessage } from '@/lib/errors';
import type { AdminCreateUserRequest } from "@/types/admin";

const createUserSchema = z
  .object({
    fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
    document: z
      .string()
      .min(5, "El documento debe tener al menos 5 caracteres."),
    email: z.string().email("Ingresa un correo electrónico válido."),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres."),
    role: z.enum(["DOCTOR", "PATIENT"]),
    isActive: z.boolean(),
    medicalLicenseNumber: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Validación condicional: Si el rol es DOCTOR, la licencia médica es obligatoria
    if (
      data.role === "DOCTOR" &&
      (!data.medicalLicenseNumber || data.medicalLicenseNumber.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["medicalLicenseNumber"],
        message: "La tarjeta profesional es obligatoria para los doctores.",
      });
    }
  });

type CreateUserFormValues = z.infer<typeof createUserSchema>;

export default function AdminCreateUserPage() {
  const router = useRouter();
  const { createAccountUser } = useAuth(); // Extrae la función de tu provider

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormValues>({
    defaultValues: {
      fullName: "",
      document: "",
      email: "",
      password: "",
      role: "DOCTOR",
      isActive: true,
      medicalLicenseNumber: "",
    },
    resolver: zodResolver(createUserSchema),
  });

  const selectedRole = watch("role");

  const onSubmit = handleSubmit(async (values: CreateUserFormValues) => {
    try {
      const payload: AdminCreateUserRequest = {
        ...values,
        medicalLicenseNumber: values.medicalLicenseNumber ?? "N/A",
      };

      await createAccountUser(payload);
      toast.success("Usuario registrado correctamente.");
      router.push(ROUTES.adminDashboard);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "No fue posible registrar al usuario."),
      );
    }
  });

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-md border border-gray-100 max-h-[90vh] flex flex-col justify-center">
        {/* Cabecera */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-3 mb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900">
              Crear Usuario
            </h2>
            <p className="text-xs text-gray-500">
              Formulario para registrar un nuevo usuario.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push(ROUTES.adminDashboard)}
            className="flex items-center space-x-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <svg
              className="h-4 w-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Regresar</span>
          </button>
        </div>

        {/* Formulario conectado a React Hook Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
            {/* Campo Nombre Completo */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Nombre Completo
              </label>
              <input
                type="text"
                {...register("fullName")}
                className={`block w-full rounded-md border px-3 py-1.5 text-gray-900 text-sm focus:outline-none focus:ring-1 ${errors.fullName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"}`}
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Campo Documento */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Documento de Identidad
              </label>
              <input
                type="text"
                {...register("document")}
                className={`block w-full rounded-md border px-3 py-1.5 text-gray-900 text-sm focus:outline-none focus:ring-1 ${errors.document ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"}`}
              />
              {errors.document && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.document.message}
                </p>
              )}
            </div>

            {/* Campo Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                {...register("email")}
                className={`block w-full rounded-md border px-3 py-1.5 text-gray-900 text-sm focus:outline-none focus:ring-1 ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"}`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Campo Contraseña */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                {...register("password")}
                className={`block w-full rounded-md border px-3 py-1.5 text-gray-900 text-sm focus:outline-none focus:ring-1 ${errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"}`}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Campo Rol */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Rol asignado
              </label>
              <select
                {...register("role")}
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-gray-900 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="DOCTOR">DOCTOR</option>
                <option value="PATIENT">PATIENT</option>
              </select>
            </div>

            {/* Campo Licencia Médica Condicional */}
            <div>
              {selectedRole === "DOCTOR" ? (
                <div className="animate-fadeIn">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Tarjeta Profesional / Licencia
                  </label>
                  <input
                    type="text"
                    {...register("medicalLicenseNumber")}
                    className={`block w-full rounded-md border px-3 py-1.5 text-gray-900 text-sm focus:outline-none focus:ring-1 ${errors.medicalLicenseNumber ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"}`}
                  />
                  {errors.medicalLicenseNumber && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.medicalLicenseNumber.message}
                    </p>
                  )}
                </div>
              ) : (
                <div className="hidden md:block"></div>
              )}
            </div>
          </div>

          {/* Fila Inferior */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 gap-3 border-t border-gray-100">
            <div className="flex items-center">
              <input
                id="isActive"
                type="checkbox"
                {...register("isActive")}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="isActive"
                className="ml-2 block text-xs font-medium text-gray-700 select-none"
              >
                Habilitar cuenta inmediatamente
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto min-w-37.5 justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Registrando..." : "Registrar Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
