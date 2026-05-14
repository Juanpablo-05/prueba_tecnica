"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/layout/page-shell";
import { getApiErrorMessage } from "@/lib/errors";
import { PrescriptionCard } from "@/components/prescriptions/prescription-card";
import { buildSearchString, parsePositiveInt } from "@/lib/query-string";
import {
  consumePrescription,
  downloadPrescriptionPdf,
  listPatientPrescriptions,
} from "@/lib/prescriptions";
import { ROUTES } from "@/lib/routes";

function getStatusValue(value: string | null) {
  return value === "PENDING" || value === "CONSUMED" ? value : undefined;
}

export default function PatientPrescriptionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const status = getStatusValue(searchParams.get("status"));
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;
  const page = parsePositiveInt(searchParams.get("page"), 1);
  const limit = parsePositiveInt(searchParams.get("limit"), 10);

  const prescriptionsQuery = useQuery({
    queryKey: ["patient-prescriptions", { from, limit, page, status, to }],
    queryFn: () =>
      listPatientPrescriptions({
        from,
        limit,
        order: "desc",
        page,
        status,
        to,
      }),
  });

  const consumeMutation = useMutation({
    mutationFn: consumePrescription,
    onSuccess: async () => {
      toast.success("Prescripcion marcada como consumida.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["patient-prescriptions"] }),
        queryClient.invalidateQueries({ queryKey: ["patient-prescription-detail"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-metrics"] }),
      ]);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "No pudimos actualizar la prescripcion."));
    },
  });

  const downloadMutation = useMutation({
    mutationFn: downloadPrescriptionPdf,
    onSuccess: () => {
      toast.success("PDF descargado correctamente.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "No pudimos descargar el PDF."));
    },
  });

  const handleFilterSubmit = (formData: FormData) => {
    const nextStatus = formData.get("status")?.toString();
    const nextFrom = formData.get("from")?.toString();
    const nextTo = formData.get("to")?.toString();

    router.replace(
      buildSearchString(ROUTES.patientPrescriptions, {
        from: nextFrom,
        limit,
        page: 1,
        status: nextStatus === "ALL" ? undefined : nextStatus,
        to: nextTo,
      }),
    );
  };

  const handlePageChange = (nextPage: number) => {
    router.replace(
      buildSearchString(ROUTES.patientPrescriptions, {
        from,
        limit,
        page: nextPage,
        status,
        to,
      }),
    );
  };

  return (
    <PageShell
      eyebrow="Paciente"
      title="Estas son tus recetas."
      description="En esta bandeja puedes revisar tus prescripciones, descargarlas en PDF y marcar como consumidas las que ya completaste."
    >
      <section className="glass-panel rounded-[34px] p-6">
        <form
          className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            handleFilterSubmit(new FormData(event.currentTarget));
          }}
        >
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Estado
            <select
              name="status"
              defaultValue={status ?? "ALL"}
              className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 outline-none transition focus:border-slate-400"
            >
              <option value="ALL">Todos</option>
              <option value="PENDING">Pendiente</option>
              <option value="CONSUMED">Consumida</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Desde
            <input
              type="date"
              name="from"
              defaultValue={from}
              className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 outline-none transition focus:border-slate-400"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Hasta
            <input
              type="date"
              name="to"
              defaultValue={to}
              className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 outline-none transition focus:border-slate-400"
            />
          </label>

          <button
            type="submit"
            className="rounded-2xl border border-slate-300 bg-white/85 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-white"
          >
            Aplicar filtros
          </button>
        </form>
      </section>

      {prescriptionsQuery.isLoading ? (
        <section className="glass-panel rounded-[34px] p-8 text-sm text-slate-600">
          Cargando tus prescripciones...
        </section>
      ) : null}

      {prescriptionsQuery.isError ? (
        <section className="glass-panel rounded-[34px] p-8">
          <p className="text-lg font-semibold text-slate-900">
            No pudimos cargar tu bandeja.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {getApiErrorMessage(
              prescriptionsQuery.error,
              "Intenta de nuevo en unos segundos.",
            )}
          </p>
        </section>
      ) : null}

      {prescriptionsQuery.data && prescriptionsQuery.data.data.length === 0 ? (
        <EmptyState
          title="Aun no tienes prescripciones registradas"
          description="Cuando un medico cree una receta a tu nombre, la veras aqui con el detalle de medicamentos y acciones disponibles."
        />
      ) : null}

      {prescriptionsQuery.data && prescriptionsQuery.data.data.length > 0 ? (
        <>
          <section className="grid gap-5">
            {prescriptionsQuery.data.data.map((prescription) => (
              <PrescriptionCard
                key={prescription.id}
                href={`/patient/prescriptions/${prescription.id}`}
                perspective="patient"
                prescription={prescription}
                actions={
                  <>
                    <button
                      type="button"
                      onClick={() => downloadMutation.mutate(prescription.id)}
                      disabled={
                        downloadMutation.isPending &&
                        downloadMutation.variables === prescription.id
                      }
                      className="rounded-full border border-slate-300 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {downloadMutation.isPending &&
                      downloadMutation.variables === prescription.id
                        ? "Descargando..."
                        : "Descargar PDF"}
                    </button>

                    <button
                      type="button"
                      onClick={() => consumeMutation.mutate(prescription.id)}
                      disabled={
                        prescription.status === "CONSUMED" ||
                        (consumeMutation.isPending &&
                          consumeMutation.variables === prescription.id)
                      }
                      className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {prescription.status === "CONSUMED"
                        ? "Ya consumida"
                        : consumeMutation.isPending &&
                            consumeMutation.variables === prescription.id
                          ? "Guardando..."
                          : "Marcar como consumida"}
                    </button>
                  </>
                }
              />
            ))}
          </section>

          <section className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-[30px] p-5">
            <div>
              <p className="section-label">Paginacion</p>
              <p className="mt-2 text-sm text-slate-600">
                Pagina {prescriptionsQuery.data.meta.page} de{" "}
                {prescriptionsQuery.data.meta.totalPages}. Total:{" "}
                {prescriptionsQuery.data.meta.total} prescripciones.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="rounded-full border border-slate-300 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= prescriptionsQuery.data.meta.totalPages}
                className="rounded-full border border-slate-300 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </section>
        </>
      ) : null}
    </PageShell>
  );
}
