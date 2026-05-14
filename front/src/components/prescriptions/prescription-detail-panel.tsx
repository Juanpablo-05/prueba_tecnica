import { formatDateTime } from "@/lib/format";
import { PrescriptionStatusBadge } from "@/components/prescriptions/status-badge";
import type { Prescription } from "@/types/prescriptions";

type PrescriptionDetailPanelProps = {
  prescription: Prescription;
  actions?: React.ReactNode;
};

export function PrescriptionDetailPanel({
  prescription,
  actions,
}: PrescriptionDetailPanelProps) {
  return (
    <section className="glass-panel rounded-[34px] p-8 lg:p-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-label">Prescripcion</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            #{prescription.id.slice(-8).toUpperCase()}
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Creada {formatDateTime(prescription.createdAt)}
          </p>
        </div>

        <div className="space-y-3 text-right">
          <PrescriptionStatusBadge status={prescription.status} />
          <p className="text-sm text-slate-600">
            Consumida: {formatDateTime(prescription.consumedAt)}
          </p>
        </div>
      </div>

      {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <article className="rounded-[28px] border border-slate-200 bg-white/80 p-5">
          <p className="section-label">Paciente</p>
          <h3 className="mt-3 text-lg font-semibold text-slate-900">
            {prescription.patient.fullName}
          </h3>
          <p className="mt-2 text-sm text-slate-600">{prescription.patient.email}</p>
          <p className="mt-2 text-sm text-slate-600">
            Documento: {prescription.patient.documentNumber ?? "No registrado"}
          </p>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white/80 p-5">
          <p className="section-label">Medico</p>
          <h3 className="mt-3 text-lg font-semibold text-slate-900">
            {prescription.doctor.fullName}
          </h3>
          <p className="mt-2 text-sm text-slate-600">{prescription.doctor.email}</p>
          <p className="mt-2 text-sm text-slate-600">
            Documento: {prescription.doctor.documentNumber ?? "No registrado"}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Licencia: {prescription.doctor.medicalLicense ?? "No registrada"}
          </p>
        </article>
      </div>

      <article className="mt-6 rounded-[28px] border border-slate-200 bg-white/75 p-5">
        <p className="section-label">Notas medicas</p>
        <p className="mt-3 text-sm leading-7 text-slate-700">
          {prescription.notes?.trim() || "Sin notas registradas."}
        </p>
      </article>

      <section className="mt-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="section-label">Items prescritos</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {prescription.items.length} medicamento
              {prescription.items.length === 1 ? "" : "s"}
            </h3>
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          {prescription.items.map((item, index) => (
            <article
              key={item.id}
              className="rounded-[28px] border border-slate-200 bg-white/80 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="section-label">Item {index + 1}</p>
                  <h4 className="mt-2 text-lg font-semibold text-slate-900">
                    {item.name}
                  </h4>
                </div>
                <p className="text-sm text-slate-600">
                  Registrado {formatDateTime(item.createdAt)}
                </p>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
                  <p className="section-label">Dosis</p>
                  <p className="mt-2 text-sm text-slate-700">
                    {item.dosage ?? "No especificada"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
                  <p className="section-label">Cantidad</p>
                  <p className="mt-2 text-sm text-slate-700">
                    {item.quantity ?? "No definida"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
                  <p className="section-label">Indicaciones</p>
                  <p className="mt-2 text-sm text-slate-700">
                    {item.instructions ?? "Sin indicaciones"}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
