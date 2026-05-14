import { formatPrescriptionStatus } from "@/lib/format";
import type { PrescriptionStatus } from "@/types/prescriptions";

type PrescriptionStatusBadgeProps = {
  status: PrescriptionStatus;
};

const statusTone: Record<PrescriptionStatus, string> = {
  CONSUMED: "border-emerald-200 bg-emerald-500/15 text-emerald-800",
  PENDING: "border-amber-200 bg-amber-500/15 text-amber-800",
};

export function PrescriptionStatusBadge({
  status,
}: PrescriptionStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${statusTone[status]}`}
    >
      {formatPrescriptionStatus(status)}
    </span>
  );
}
