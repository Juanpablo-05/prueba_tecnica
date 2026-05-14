import Link from "next/link";
import { formatDateTime, truncateText } from "@/lib/format";
import { PrescriptionStatusBadge } from "@/components/prescriptions/status-badge";
import type { Prescription } from "@/types/prescriptions";

type PrescriptionCardProps = {
  prescription: Prescription;
  href?: string;
  perspective: "doctor" | "patient" | "admin";
  actions?: React.ReactNode;
};

export function PrescriptionCard({
  prescription,
  href,
  perspective,
  actions,
}: PrescriptionCardProps) {
  const primaryBlock =
    perspective === "doctor"
      ? {
          label: "Paciente",
          value: prescription.patient.fullName,
          secondary: prescription.patient.email,
        }
      : {
          label: "Medico",
          value: prescription.doctor.fullName,
          secondary: prescription.doctor.email,
        };

  const secondaryBlock =
    perspective === "admin"
      ? {
          label: "Paciente",
          value: prescription.patient.fullName,
          secondary: prescription.patient.email,
        }
      : {
          label: "Items",
          value: `${prescription.items.length} medicamento${prescription.items.length === 1 ? "" : "s"}`,
          secondary: prescription.items.map((item) => item.name).join(", "),
        };

  return (
    <article className="glass-panel rounded-[30px] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-label">Prescripcion</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
            #{prescription.id.slice(-8).toUpperCase()}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Creada {formatDateTime(prescription.createdAt)}
          </p>
        </div>

        <PrescriptionStatusBadge status={prescription.status} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white/80 p-4">
          <p className="section-label">{primaryBlock.label}</p>
          <p className="mt-2 font-semibold text-slate-900">{primaryBlock.value}</p>
          <p className="mt-1 text-sm text-slate-600">{primaryBlock.secondary}</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/80 p-4">
          <p className="section-label">{secondaryBlock.label}</p>
          <p className="mt-2 font-semibold text-slate-900">{secondaryBlock.value}</p>
          <p className="mt-1 text-sm text-slate-600">{secondaryBlock.secondary}</p>
        </div>
      </div>

      <div className="mt-5 rounded-3xl border border-slate-200 bg-white/70 p-4">
        <p className="section-label">Notas</p>
        <p className="mt-2 text-sm leading-7 text-slate-700">
          {truncateText(prescription.notes || "Sin notas registradas.")}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        {href ? (
          <Link
            href={href}
            className="inline-flex rounded-full border border-slate-300 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white"
          >
            Ver detalle
          </Link>
        ) : (
          <span className="text-sm text-slate-500">
            Vista consolidada para monitoreo admin
          </span>
        )}

        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </article>
  );
}
