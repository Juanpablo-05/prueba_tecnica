"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/layout/page-shell";
import { getApiErrorMessage } from "@/lib/errors";
import { createPrescription } from "@/lib/prescriptions";
import { ROUTES } from "@/lib/routes";
import { listPatients } from "@/lib/users";

const prescriptionFormSchema = z.object({
  patientId: z.string().min(1, "Selecciona un paciente."),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        dosage: z.string().optional(),
        instructions: z.string().optional(),
        name: z.string().min(1, "El nombre del medicamento es obligatorio."),
        quantity: z.preprocess(
          (value) => (value === "" || value === undefined ? undefined : Number(value)),
          z
            .number({ error: "Ingresa una cantidad valida." })
            .int("La cantidad debe ser un entero.")
            .positive("La cantidad debe ser mayor a cero.")
            .optional(),
        ),
      }),
    )
    .min(1, "Agrega al menos un item."),
});

type PrescriptionFormValues = z.infer<typeof prescriptionFormSchema>;

export default function NewPrescriptionPage() {
  const router = useRouter();
  const patientsQuery = useQuery({
    queryKey: ["patients-directory"],
    queryFn: listPatients,
  });

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<
    z.input<typeof prescriptionFormSchema>,
    unknown,
    PrescriptionFormValues
  >({
    defaultValues: {
      items: [{ dosage: "", instructions: "", name: "", quantity: undefined }],
      notes: "",
      patientId: "",
    },
    resolver: zodResolver(prescriptionFormSchema),
  });

  const { append, fields, remove } = useFieldArray({
    control,
    name: "items",
  });

  const createPrescriptionMutation = useMutation({
    mutationFn: createPrescription,
    onSuccess: (prescription) => {
      toast.success("Prescripcion creada correctamente.");
      router.replace(`/doctor/prescriptions/${prescription.id}`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "No pudimos crear la prescripcion."));
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await createPrescriptionMutation.mutateAsync({
      patientId: values.patientId,
      notes: values.notes?.trim() || undefined,
      items: values.items.map((item) => ({
        dosage: item.dosage?.trim() || undefined,
        instructions: item.instructions?.trim() || undefined,
        name: item.name.trim(),
        quantity: item.quantity,
      })),
    });
  });

  return (
    <PageShell
      eyebrow="Medico"
      title="Vamos a crear una nueva receta."
      description="Completa los datos del paciente, agrega los medicamentos manualmente y deja lista una prescripcion clara y bien estructurada."
      aside={
        <Link
          href={ROUTES.doctorPrescriptions}
          className="inline-flex rounded-full border border-slate-300 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white"
        >
          Volver al listado
        </Link>
      }
    >
      {patientsQuery.isLoading ? (
        <section className="glass-panel rounded-[34px] p-8 text-sm text-slate-600">
          Cargando pacientes disponibles...
        </section>
      ) : null}

      {patientsQuery.isError ? (
        <section className="glass-panel rounded-[34px] p-8">
          <p className="text-lg font-semibold text-slate-900">
            No pudimos cargar el directorio de pacientes.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {patientsQuery.error instanceof Error
              ? patientsQuery.error.message
              : "Intenta de nuevo en unos segundos."}
          </p>
        </section>
      ) : null}

      {patientsQuery.data && patientsQuery.data.length === 0 ? (
        <EmptyState
          title="No hay pacientes activos"
          description="El formulario necesita al menos un paciente disponible para asociar la prescripcion. Cuando tengamos mas flujo, aqui podriamos enlazar tambien el alta de pacientes."
        />
      ) : null}

      {patientsQuery.data && patientsQuery.data.length > 0 ? (
        <form className="grid gap-6" onSubmit={onSubmit}>
          <section className="glass-panel rounded-[34px] p-8">
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Paciente
                <select
                  className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 outline-none transition focus:border-slate-400"
                  {...register("patientId")}
                >
                  <option value="">Selecciona un paciente</option>
                  {patientsQuery.data.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.fullName} · {patient.email}
                    </option>
                  ))}
                </select>
                {errors.patientId ? (
                  <span className="text-xs font-medium text-rose-600">
                    {errors.patientId.message}
                  </span>
                ) : null}
              </label>

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Notas medicas
                <textarea
                  rows={4}
                  placeholder="Indicaciones generales, advertencias o contexto clinico..."
                  className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 outline-none transition focus:border-slate-400"
                  {...register("notes")}
                />
              </label>
            </div>
          </section>

          <section className="glass-panel rounded-[34px] p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="section-label">Items</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                  Medicamentos digitados manualmente
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  append({
                    dosage: "",
                    instructions: "",
                    name: "",
                    quantity: undefined,
                  })
                }
                className="rounded-full border border-slate-300 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white"
              >
                Agregar item
              </button>
            </div>

            <div className="mt-6 grid gap-5">
              {fields.map((field, index) => (
                <article
                  key={field.id}
                  className="rounded-[28px] border border-slate-200 bg-white/80 p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="section-label">Item {index + 1}</p>
                      <p className="mt-2 text-sm text-slate-600">
                        Cada item viaja en el array `items` del DTO.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      className="rounded-full border border-slate-300 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                      Medicamento
                      <input
                        type="text"
                        placeholder="Amoxicilina"
                        className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 outline-none transition focus:border-slate-400"
                        {...register(`items.${index}.name`)}
                      />
                      {errors.items?.[index]?.name ? (
                        <span className="text-xs font-medium text-rose-600">
                          {errors.items[index]?.name?.message}
                        </span>
                      ) : null}
                    </label>

                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                      Dosis
                      <input
                        type="text"
                        placeholder="500 mg cada 8 horas"
                        className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 outline-none transition focus:border-slate-400"
                        {...register(`items.${index}.dosage`)}
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                      Cantidad
                      <input
                        type="number"
                        min={1}
                        placeholder="21"
                        className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 outline-none transition focus:border-slate-400"
                        {...register(`items.${index}.quantity`)}
                      />
                      {errors.items?.[index]?.quantity ? (
                        <span className="text-xs font-medium text-rose-600">
                          {errors.items[index]?.quantity?.message}
                        </span>
                      ) : null}
                    </label>

                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                      Indicaciones
                      <input
                        type="text"
                        placeholder="Tomar despues de las comidas"
                        className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 outline-none transition focus:border-slate-400"
                        {...register(`items.${index}.instructions`)}
                      />
                    </label>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Link
              href={ROUTES.doctorPrescriptions}
              className="rounded-full border border-slate-300 bg-white/85 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-white"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || createPrescriptionMutation.isPending}
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting || createPrescriptionMutation.isPending
                ? "Guardando..."
                : "Crear prescripcion"}
            </button>
          </div>
        </form>
      ) : null}
    </PageShell>
  );
}
