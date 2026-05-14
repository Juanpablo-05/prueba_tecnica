type StatCardProps = {
  label: string;
  value: number | string;
  tone?: "default" | "accent" | "success";
  helper?: string;
};

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  accent: "bg-amber-500/10 border-amber-200",
  default: "bg-white/80 border-slate-200",
  success: "bg-emerald-500/10 border-emerald-200",
};

export function StatCard({
  label,
  value,
  tone = "default",
  helper,
}: StatCardProps) {
  return (
    <article
      className={`rounded-[28px] border p-5 ${toneClasses[tone]}`}
    >
      <p className="section-label">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
      {helper ? <p className="mt-2 text-sm text-slate-600">{helper}</p> : null}
    </article>
  );
}
