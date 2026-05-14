"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageShell } from "@/components/layout/page-shell";
import { PrescriptionDetailPanel } from "@/components/prescriptions/prescription-detail-panel";
import { getApiErrorMessage } from "@/lib/errors";
import {
  consumePrescription,
  downloadPrescriptionPdf,
  getPrescriptionById,
} from "@/lib/prescriptions";
import { ROUTES } from "@/lib/routes";

export default function PatientPrescriptionDetailPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const prescriptionId = Array.isArray(params.id) ? params.id[0] : params.id;
  const resolvedPrescriptionId = prescriptionId ?? "";

  const prescriptionQuery = useQuery({
    enabled: Boolean(prescriptionId),
    queryKey: ["patient-prescription-detail", prescriptionId],
    queryFn: () => getPrescriptionById(resolvedPrescriptionId),
  });

  const consumeMutation = useMutation({
    mutationFn: consumePrescription,
    onSuccess: async () => {
      toast.success("Prescripcion marcada como consumida.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["patient-prescriptions"] }),
        queryClient.invalidateQueries({
          queryKey: ["patient-prescription-detail", prescriptionId],
        }),
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

  return (
    <PageShell
      eyebrow="Paciente"
      title="Este es el detalle de tu receta."
      description="Aqui encuentras los medicamentos formulados, las indicaciones del medico y las acciones para descargar o completar la prescripcion."
      aside={
        <Link
          href={ROUTES.patientPrescriptions}
          className="inline-flex rounded-full border border-slate-300 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white"
        >
          Volver al listado
        </Link>
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
        <PrescriptionDetailPanel
          prescription={prescriptionQuery.data}
          actions={
            <>
                <button
                  type="button"
                  onClick={() => downloadMutation.mutate(resolvedPrescriptionId)}
                  disabled={downloadMutation.isPending}
                className="rounded-full border border-slate-300 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {downloadMutation.isPending ? "Descargando..." : "Descargar PDF"}
              </button>

                <button
                  type="button"
                  onClick={() => consumeMutation.mutate(resolvedPrescriptionId)}
                disabled={
                  prescriptionQuery.data.status === "CONSUMED" ||
                  consumeMutation.isPending
                }
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {prescriptionQuery.data.status === "CONSUMED"
                  ? "Ya consumida"
                  : consumeMutation.isPending
                    ? "Guardando..."
                    : "Marcar como consumida"}
              </button>
            </>
          }
        />
      ) : null}
    </PageShell>
  );
}
