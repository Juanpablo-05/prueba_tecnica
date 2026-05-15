"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/layout/page-shell";
import { getApiErrorMessage } from "@/lib/errors";
import { PrescriptionCard } from "@/components/prescriptions/prescription-card";
import { buildSearchString, parsePositiveInt } from "@/lib/query-string";
import { listDoctorPrescriptions } from "@/lib/prescriptions";
import { ROUTES } from "@/lib/routes";
import type { PrescriptionStatus } from "@/types/prescriptions";

function getStatusValue(value: string | null) {
  return value === "PENDING" || value === "CONSUMED" ? value : undefined;
}

export default function DoctorPrescriptionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = getStatusValue(searchParams.get("status"));
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;
  const page = parsePositiveInt(searchParams.get("page"), 1);
  const limit = parsePositiveInt(searchParams.get("limit"), 10);

  const prescriptionsQuery = useQuery({
    queryKey: ["doctor-prescriptions", { from, limit, page, status, to }],
    queryFn: () =>
      listDoctorPrescriptions({
        from,
        limit,
        order: "desc",
        page,
        status,
        to,
      }),
  });

  const handleFilterSubmit = (formData: FormData) => {
    const nextStatus = formData.get("status")?.toString();
    const nextFrom = formData.get("from")?.toString();
    const nextTo = formData.get("to")?.toString();

    router.replace(
      buildSearchString(ROUTES.doctorPrescriptions, {
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
      buildSearchString(ROUTES.doctorPrescriptions, {
        from,
        limit,
        page: nextPage,
        status,
        to,
      }),
    );
  };

  const clearFilters = () => {
    router.replace(ROUTES.doctorPrescriptions);
  };
  return (
    <PageShell
      eyebrow="Medico"
      title="Este es tu resumen de recetas."
      description="Aqui revisas las prescripciones que has creado, filtras por estado o fecha y entras al detalle de cada receta."
      aside={
        <Link
          href={ROUTES.newPrescription}
          className="inline-flex rounded-full bg-slate-300 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-500"
        >
          Nueva prescripcion
        </Link>
      }
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

          <div className=" flex items-end justify-end">
            <button
              type="submit"
              className="rounded-2xl border border-slate-300 bg-white/85 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-white"
            >
              Aplicar filtros
            </button>

            <button
              type="button"
              onClick={clearFilters}
              className="ml-3 rounded-2xl border border-slate-300 bg-white/85 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-white"
            >
              Limpiar filtros
            </button>
          </div>
        </form>
      </section>

      {prescriptionsQuery.isLoading ? (
        <section className="glass-panel rounded-[34px] p-8 text-sm text-slate-600">
          Cargando prescripciones del medico...
        </section>
      ) : null}

      {prescriptionsQuery.isError ? (
        <section className="glass-panel rounded-[34px] p-8">
          <p className="text-lg font-semibold text-slate-900">
            No pudimos cargar la bandeja del medico.
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
          title="Aun no hay prescripciones para estos filtros"
          description="Cuando crees una receta desde el formulario, aparecera aqui con su paciente, sus items y su estado."
          action={
            <Link
              href={ROUTES.newPrescription}
              className="inline-flex rounded-full bg-slate-300 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-500"
            >
              Crear primera prescripcion
            </Link>
          }
        />
      ) : null}

      {prescriptionsQuery.data && prescriptionsQuery.data.data.length > 0 ? (
        <>
          <section className="grid gap-5">
            {prescriptionsQuery.data.data.map((prescription) => (
              <PrescriptionCard
                key={prescription.id}
                href={`/doctor/prescriptions/${prescription.id}`}
                perspective="doctor"
                prescription={prescription}
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
