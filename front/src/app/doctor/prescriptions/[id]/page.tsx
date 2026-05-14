"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/layout/page-shell";
import { PrescriptionDetailPanel } from "@/components/prescriptions/prescription-detail-panel";
import { getApiErrorMessage } from "@/lib/errors";
import { getPrescriptionById } from "@/lib/prescriptions";
import { ROUTES } from "@/lib/routes";

export default function DoctorPrescriptionDetailPage() {
  const params = useParams<{ id: string }>();
  const prescriptionId = Array.isArray(params.id) ? params.id[0] : params.id;
  const resolvedPrescriptionId = prescriptionId ?? "";

  const prescriptionQuery = useQuery({
    enabled: Boolean(prescriptionId),
    queryKey: ["doctor-prescription-detail", prescriptionId],
    queryFn: () => getPrescriptionById(resolvedPrescriptionId),
  });

  return (
    <PageShell
      eyebrow="Medico"
      title="Este es el detalle de una receta creada por ti."
      description="Aqui validas el paciente, los items prescritos y el estado actual de la receta antes de continuar con tu flujo."
      aside={
        <div className="flex gap-3">
          <Link
            href={ROUTES.doctorPrescriptions}
            className="inline-flex rounded-full border border-slate-300 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white"
          >
            Volver
          </Link>
          <Link
            href={ROUTES.newPrescription}
            className="inline-flex rounded-full bg-slate-300 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-500"
          >
            Nueva prescripcion
          </Link>
        </div>
      }
    >
      {prescriptionQuery.isLoading ? (
        <section className="glass-panel rounded-[34px] p-8 text-sm text-slate-600">
          Cargando detalle de la prescripcion...
        </section>
      ) : null}

      {prescriptionQuery.isError ? (
        <section className="glass-panel rounded-[34px] p-8">
          <p className="text-lg font-semibold text-slate-900">
            No pudimos cargar esta prescripcion.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {getApiErrorMessage(
              prescriptionQuery.error,
              "Intenta de nuevo en unos segundos.",
            )}
          </p>
        </section>
      ) : null}

      {prescriptionQuery.data ? (
        <PrescriptionDetailPanel prescription={prescriptionQuery.data} />
      ) : null}
    </PageShell>
  );
}
